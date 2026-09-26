/**
 * Built-in Application Configuration
 * Sensible defaults built directly into the client code.
 * Users do not need an .env file to run DomoNote locally with Ollama and Companion.
 */
export const APP_CONFIG = {
  name: 'DomoNote',
  version: '1.0.0',
  ollamaBaseUrl: 'http://localhost:11434',
  defaultModel: 'llama3.2:latest',
  fallbackModel: 'qwen2.5:3b',
  localCompanionUrl: 'http://localhost:8765',
} as const;

export default APP_CONFIG;
