import type { OllamaModel } from '../../types';

export interface AICompletionOptions {
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  stream?: boolean;
}

export interface AIProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  getModels(): Promise<OllamaModel[]>;
  generate(prompt: string, options?: AICompletionOptions): Promise<string>;
  streamGenerate(
    prompt: string,
    onChunk: (chunk: string) => void,
    options?: AICompletionOptions
  ): Promise<string>;
}
