import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WorkspaceProvider } from './context/workspace-context';
import { AIProviderContext } from './context/ai-context';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AIProviderContext>
      <WorkspaceProvider>
        <App />
      </WorkspaceProvider>
    </AIProviderContext>
  </React.StrictMode>
);
