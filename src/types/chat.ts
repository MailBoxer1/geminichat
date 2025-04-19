export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  error?: boolean;
}

export interface MessageResponse {
  content: string;
}

export interface LLMModel {
  id: string;
  name: string;
  description: string;
  provider: 'Google' | 'Anthropic' | 'OpenAI' | 'Mistral' | 'OpenRouter' | 'Other';
  apiEndpoint?: string;
}

export interface APISettings {
  apiKey: string;
  model: string;
} 