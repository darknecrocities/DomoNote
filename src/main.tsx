import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/theme-context';
import { LanguageProvider } from './context/language-context';
import { WorkspaceProvider } from './context/workspace-context';
import { AIProviderContext } from './context/ai-context';
import { SoundProvider } from './context/sound-context';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <SoundProvider>
          <AIProviderContext>
            <WorkspaceProvider>
              <App />
            </WorkspaceProvider>
          </AIProviderContext>
        </SoundProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);
