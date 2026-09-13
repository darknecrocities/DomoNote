import React, { useState, useEffect, useRef } from 'react';
import { useAI } from '../context/ai-context';
import { useWorkspace } from '../context/workspace-context';
import { db, exportWorkspaceToJson, importWorkspaceFromJson } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button } from '../components/ui/button';
import { downloadJsonFile } from '../services/export/json';
import {
  Cpu,
  Database,
  Download,
  Upload,
  RefreshCw,
  Power,
  Shield,
  CheckCircle,
  AlertCircle,
  Server,
  Trash2,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    isConnected,
    isChecking,
    models,
    selectedModel,
    baseUrl,
    setSelectedModel,
    setBaseUrl,
    checkConnection,
    startOllamaService,
  } = useAI();
  const { addToast } = useWorkspace();

  const [inputUrl, setInputUrl] = useState(baseUrl);
  const [companionStatus, setCompanionStatus] = useState<string>('checking');
  const importFileRef = useRef<HTMLInputElement>(null);

  // Storage metrics
  const notesCount = useLiveQuery(() => db.notes.count(), []) ?? 0;
  const meetingsCount = useLiveQuery(() => db.meetings.count(), []) ?? 0;
  const documentsCount = useLiveQuery(() => db.documents.count(), []) ?? 0;
  const manualsCount = useLiveQuery(() => db.manuals.count(), []) ?? 0;
  const blobsCount = useLiveQuery(() => db.blobs.count(), []) ?? 0;

  // Check companion status
  useEffect(() => {
    fetch('http://localhost:8765/health')
      .then((r) => r.json())
      .then(() => setCompanionStatus('online'))
      .catch(() => setCompanionStatus('offline'));
  }, []);

  const handleSaveUrl = async () => {
    await setBaseUrl(inputUrl);
    addToast('Ollama base URL updated.', 'info');
  };

  const handleExport = async () => {
    try {
      const json = await exportWorkspaceToJson();
      const dateStr = new Date().toISOString().split('T')[0];
      downloadJsonFile(`domonote_workspace_${dateStr}.json`, json);
      addToast('Exported complete workspace backup to JSON.', 'success');
    } catch {
      addToast('Failed to export workspace.', 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await importWorkspaceFromJson(text);
      if (result.success) {
        addToast(result.message, 'success');
      } else {
        addToast(result.message, 'error');
      }
    } catch (err: any) {
      addToast(`Import failed: ${err?.message}`, 'error');
    } finally {
      if (importFileRef.current) importFileRef.current.value = '';
    }
  };

  const handleClearDatabase = async () => {
    if (confirm('CAUTION: Are you sure you want to erase all notes, meetings, and documents? This cannot be undone.')) {
      await db.notes.clear();
      await db.meetings.clear();
      await db.documents.clear();
      await db.manuals.clear();
      await db.blobs.clear();
      addToast('Local workspace data cleared.', 'info');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black p-8 overflow-y-auto max-w-4xl mx-auto w-full select-none">
      <div className="border-b border-zinc-850 pb-5 mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Configure local AI connectivity, review client-side storage, and manage workspace archives.
        </p>
      </div>

      <div className="space-y-8">
        {/* Local AI / Ollama Configuration */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-zinc-300" />
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">Local AI (Ollama)</h3>
                <p className="text-xs text-zinc-400">Direct connection to your local AI engine</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400' : 'bg-red-500'
                }`}
              />
              <span className="text-xs font-semibold text-zinc-200">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Service URL & Actions */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-zinc-300">Ollama API Base URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-700"
              />
              <Button size="sm" variant="secondary" onClick={handleSaveUrl}>
                Save URL
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => checkConnection()}
                disabled={isChecking}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </Button>
            </div>
          </div>

          {/* Automated Setup Trigger if Disconnected */}
          {!isConnected && (
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-xs text-zinc-200 mb-1">
                  Automated Local AI Setup
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Ollama is currently unreachable on {baseUrl}. You can start Ollama automatically
                  with CORS enabled, or run <code>./start.sh</code> in your terminal.
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={async () => {
                  const res = await startOllamaService();
                  addToast(res.message, res.success ? 'success' : 'warning');
                }}
              >
                <Power className="w-3.5 h-3.5" />
                <span>Start Service</span>
              </Button>
            </div>
          )}

          {/* Installed Models Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-300">Active Model</label>
              <span className="text-[11px] text-zinc-500">{models.length} model(s) installed</span>
            </div>

            {models.length === 0 ? (
              <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-md text-xs text-zinc-500">
                No models detected. Pull a model via Ollama (e.g. <code>ollama pull llama3.2</code>)
                and click "Test Connection".
              </div>
            ) : (
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700"
              >
                {models.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({(m.size / 1024 / 1024 / 1024).toFixed(1)} GB)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Optional Local Companion Status */}
          <div className="pt-3 border-t border-zinc-850 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <Server className="w-4 h-4 text-zinc-500" />
              <span>Python Companion Service (port 8765):</span>
            </div>
            <span
              className={`font-semibold ${
                companionStatus === 'online' ? 'text-emerald-400' : 'text-zinc-500'
              }`}
            >
              {companionStatus === 'online' ? 'Active' : 'Offline (Optional)'}
            </span>
          </div>
        </div>

        {/* Storage & Archive Management */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-3 border-b border-zinc-850 pb-4">
            <Database className="w-5 h-5 text-zinc-300" />
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Local-First Storage (IndexedDB)</h3>
              <p className="text-xs text-zinc-400">All data is kept inside your browser database</p>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
              <div className="text-lg font-bold text-white font-mono">{notesCount}</div>
              <div className="text-[10px] text-zinc-400 uppercase">Notes</div>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
              <div className="text-lg font-bold text-white font-mono">{meetingsCount}</div>
              <div className="text-[10px] text-zinc-400 uppercase">Meetings</div>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
              <div className="text-lg font-bold text-white font-mono">{documentsCount}</div>
              <div className="text-[10px] text-zinc-400 uppercase">Documents</div>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
              <div className="text-lg font-bold text-white font-mono">{manualsCount}</div>
              <div className="text-[10px] text-zinc-400 uppercase">Manuals</div>
            </div>
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
              <div className="text-lg font-bold text-white font-mono">{blobsCount}</div>
              <div className="text-[10px] text-zinc-400 uppercase">Files & Audio</div>
            </div>
          </div>

          {/* Export & Import */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <input
              type="file"
              ref={importFileRef}
              onChange={handleImport}
              accept="application/json"
              className="hidden"
            />
            <Button size="sm" variant="primary" onClick={handleExport}>
              <Download className="w-3.5 h-3.5" />
              <span>Export Workspace Archive</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => importFileRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Workspace JSON</span>
            </Button>
            <Button size="sm" variant="danger" onClick={handleClearDatabase} className="ml-auto">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Local Data</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
