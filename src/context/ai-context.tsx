import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { OllamaModel } from '../types';
import { ollama } from '../services/ai/ollama';
import { db } from '../db';

interface AIContextType {
  isConnected: boolean;
  isChecking: boolean;
  models: OllamaModel[];
  selectedModel: string;
  baseUrl: string;
  setSelectedModel: (model: string) => Promise<void>;
  setBaseUrl: (url: string) => Promise<void>;
  checkConnection: () => Promise<boolean>;
  startOllamaService: () => Promise<{ success: boolean; message: string }>;
}

const AIContext = createContext<AIContextType | null>(null);

export const AIProviderContext: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModelState] = useState<string>('');
  const [baseUrl, setBaseUrlState] = useState<string>('http://localhost:11434');

  // Load persisted settings on mount
  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const settings = await db.settings.get('current');
        if (settings && isMounted) {
          setBaseUrlState(settings.ollamaBaseUrl || 'http://localhost:11434');
          ollama.setBaseUrl(settings.ollamaBaseUrl || 'http://localhost:11434');
          if (settings.selectedModel) {
            setSelectedModelState(settings.selectedModel);
          }
        }
      } catch (err) {
        console.warn('[DomoNote] Could not read settings:', err);
      }
    }

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const available = await ollama.isAvailable();
      setIsConnected(available);
      if (available) {
        const fetchedModels = await ollama.getModels();
        setModels(fetchedModels);

        // Auto-select first model if none currently selected
        if (fetchedModels.length > 0) {
          setSelectedModelState((curr) => {
            const exists = fetchedModels.some((m) => m.name === curr || m.model === curr);
            if (!curr || !exists) {
              const defaultPick = fetchedModels[0].name;
              // Persist to DB
              db.settings.update('current', { selectedModel: defaultPick }).catch(() => {});
              return defaultPick;
            }
            return curr;
          });
        }
      } else {
        setModels([]);
      }
      return available;
    } catch {
      setIsConnected(false);
      setModels([]);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Poll connection every 12 seconds
  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 12000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  const setSelectedModel = async (model: string) => {
    setSelectedModelState(model);
    try {
      await db.settings.update('current', { selectedModel: model });
    } catch (err) {
      console.warn('[DomoNote] Failed to persist selected model:', err);
    }
  };

  const setBaseUrl = async (url: string) => {
    setBaseUrlState(url);
    ollama.setBaseUrl(url);
    try {
      await db.settings.update('current', { ollamaBaseUrl: url });
      await checkConnection();
    } catch (err) {
      console.warn('[DomoNote] Failed to persist base URL:', err);
    }
  };

  const startOllamaService = async (): Promise<{ success: boolean; message: string }> => {
    setIsChecking(true);
    try {
      // First attempt to invoke companion on http://localhost:8765/ollama/start
      const res = await fetch('http://localhost:8765/ollama/start', {
        method: 'POST',
      }).catch(() => null);

      if (res && res.ok) {
        // Wait 3 seconds and check
        await new Promise((r) => setTimeout(r, 3000));
        const ok = await checkConnection();
        return {
          success: ok,
          message: ok
            ? 'Ollama service successfully started by local companion.'
            : 'Ollama service launched, waiting for endpoint to respond...',
        };
      }

      // If companion is not running, ping standard endpoint again
      const directOk = await checkConnection();
      if (directOk) {
        return { success: true, message: 'Connected to Ollama service.' };
      }

      return {
        success: false,
        message:
          'Local companion not running. Execute "./start.sh" or "scripts/setup-ollama.sh" in your terminal to start Ollama with CORS enabled.',
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to start Ollama service.' };
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <AIContext.Provider
      value={{
        isConnected,
        isChecking,
        models,
        selectedModel,
        baseUrl,
        setSelectedModel,
        setBaseUrl,
        checkConnection,
        startOllamaService,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export function useAI(): AIContextType {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProviderContext');
  }
  return context;
}
