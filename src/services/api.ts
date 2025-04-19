import axios from 'axios';
import { Message, MessageResponse, LLMModel } from '../types/chat';

// Локальное хранение ключей API для разных провайдеров
const API_KEYS_STORAGE_KEY = 'gemini_chat_api_keys';
const SELECTED_MODEL_STORAGE_KEY = 'gemini_chat_selected_model';

// Доступные модели для чата
export const availableModels: LLMModel[] = [
  {
    id: 'openrouter/google/gemini-2.5-pro-exp-03-25:free',
    name: 'Gemini 2.5 Pro (OpenRouter)',
    description: 'Бесплатный доступ через OpenRouter',
    provider: 'OpenRouter',
    apiEndpoint: 'https://openrouter.ai/api/v1/chat/completions'
  },
  {
    id: 'gemini-2.0-flash-thinking-exp-01-21',
    name: 'Gemini 2.0 Flash Thinking',
    description: 'Экспериментальная модель из Google AI Studio',
    provider: 'Google',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-01-21:generateContent'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: 'Продвинутая модель от Google',
    provider: 'Google',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Самая мощная модель от Anthropic',
    provider: 'Anthropic',
    apiEndpoint: 'https://api.anthropic.com/v1/messages'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Модель от OpenAI',
    provider: 'OpenAI',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions'
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    description: 'Мощная модель от Mistral AI',
    provider: 'Mistral',
    apiEndpoint: 'https://api.mistral.ai/v1/chat/completions'
  }
];

// Форматирование запроса в зависимости от модели
const formatRequest = (model: string, messages: Message[]) => {
  const modelInfo = availableModels.find(m => m.id === model);
  
  if (!modelInfo) {
    throw new Error(`Неизвестная модель: ${model}`);
  }
  
  switch (modelInfo.provider) {
    case 'Google':
      return {
        contents: messages.map(message => ({
          role: message.role,
          parts: [{ text: message.content }]
        }))
      };
    
    case 'OpenAI':
    case 'Mistral':
      return {
        model: model,
        messages: messages.map(message => ({
          role: message.role,
          content: message.content
        }))
      };
    
    case 'Anthropic':
      return {
        model: model,
        messages: messages.map(message => ({
          role: message.role,
          content: message.content
        })),
        max_tokens: 4096
      };
    
    case 'OpenRouter':
      return {
        model: model.replace('openrouter/', ''),  // Убираем префикс 'openrouter/'
        messages: messages.map(message => ({
          role: message.role,
          content: message.content
        }))
      };
    
    default:
      throw new Error(`Неподдерживаемый поставщик: ${modelInfo.provider}`);
  }
};

// Обработка ответа от API
const processResponse = (model: string, response: any): MessageResponse => {
  const modelInfo = availableModels.find(m => m.id === model);
  
  if (!modelInfo) {
    throw new Error(`Неизвестная модель: ${model}`);
  }
  
  try {
    switch (modelInfo.provider) {
      case 'Google':
        return {
          content: response.data.candidates[0].content.parts[0].text
        };
      
      case 'OpenAI':
      case 'Mistral':
      case 'OpenRouter':
        return {
          content: response.data.choices[0].message.content
        };
      
      case 'Anthropic':
        return {
          content: response.data.content[0].text
        };
      
      default:
        throw new Error(`Неподдерживаемый поставщик: ${modelInfo.provider}`);
    }
  } catch (error) {
    console.error('Ошибка при обработке ответа:', error);
    throw new Error('Не удалось обработать ответ от API');
  }
};

// Получение всех сохраненных API-ключей
export const getStoredApiKeys = (): Record<string, string> => {
  const keysStr = localStorage.getItem(API_KEYS_STORAGE_KEY);
  if (!keysStr) return {};
  
  try {
    return JSON.parse(keysStr);
  } catch (error) {
    console.error('Ошибка при чтении API ключей:', error);
    return {};
  }
};

// Получение API-ключа для конкретного провайдера
export const getStoredApiKeyForProvider = (provider: string): string => {
  const keys = getStoredApiKeys();
  return keys[provider] || '';
};

// Получение API-ключа для конкретной модели
export const getStoredApiKey = (modelId?: string): string => {
  if (!modelId) {
    // Совместимость со старым кодом
    return getStoredApiKeyForModel(getStoredSelectedModel());
  }
  return getStoredApiKeyForModel(modelId);
};

// Получение API-ключа для конкретной модели
export const getStoredApiKeyForModel = (modelId: string): string => {
  const modelInfo = availableModels.find(m => m.id === modelId);
  if (!modelInfo) return '';
  
  return getStoredApiKeyForProvider(modelInfo.provider);
};

// Сохранение API-ключа для конкретного провайдера
export const storeApiKeyForProvider = (provider: string, apiKey: string): void => {
  const keys = getStoredApiKeys();
  keys[provider] = apiKey;
  localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
};

// Сохранение API-ключа (для совместимости)
export const storeApiKey = (apiKey: string, modelId?: string): void => {
  if (!modelId) {
    // Совместимость со старым кодом - сохраняем для текущей выбранной модели
    storeApiKeyForModel(getStoredSelectedModel(), apiKey);
    return;
  }
  storeApiKeyForModel(modelId, apiKey);
};

// Сохранение API-ключа для конкретной модели
export const storeApiKeyForModel = (modelId: string, apiKey: string): void => {
  const modelInfo = availableModels.find(m => m.id === modelId);
  if (!modelInfo) return;
  
  storeApiKeyForProvider(modelInfo.provider, apiKey);
};

// Получение выбранной модели из локального хранилища
export const getStoredSelectedModel = (): string => {
  return localStorage.getItem(SELECTED_MODEL_STORAGE_KEY) || availableModels[0].id;
};

// Сохранение выбранной модели в локальное хранилище
export const storeSelectedModel = (model: string): void => {
  localStorage.setItem(SELECTED_MODEL_STORAGE_KEY, model);
};

// Проверка API-ключа
export const testApiKey = async (apiKey: string, modelId: string = availableModels[0].id): Promise<boolean> => {
  try {
    if (!apiKey) {
      return Promise.reject(new Error('API-ключ не может быть пустым'));
    }
    
    // Ищем информацию о модели
    const modelInfo = availableModels.find(m => m.id === modelId);
    if (!modelInfo) {
      return Promise.reject(new Error(`Неизвестная модель: ${modelId}`));
    }
    
    if (!modelInfo.apiEndpoint) {
      return Promise.reject(new Error(`Не указан API-эндпоинт для модели: ${modelId}`));
    }
    
    // Формируем тестовый запрос с той же логикой, что и при общении в чате
    const testData = formatRequest(modelId, [
      {
        role: 'user',
        content: 'Hello, this is a test message to verify API key',
        timestamp: new Date().toISOString()
      }
    ]);
    
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Настраиваем заголовки согласно провайдеру
    switch (modelInfo.provider) {
      case 'Google':
        headers = {
          ...headers,
          'x-goog-api-key': apiKey
        };
        break;
      
      case 'OpenAI':
        headers = {
          ...headers,
          'Authorization': `Bearer ${apiKey}`
        };
        break;
      
      case 'Anthropic':
        headers = {
          ...headers,
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        };
        break;
      
      case 'Mistral':
        headers = {
          ...headers,
          'Authorization': `Bearer ${apiKey}`
        };
        break;
        
      case 'OpenRouter':
        headers = {
          ...headers,
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.href,
          'X-Title': 'Gemini Chat'
        };
        break;
    }
    
    // Для OpenRouter нужно ограничить максимальное количество токенов
    if (modelInfo.provider === 'OpenRouter') {
      testData.max_tokens = 50;
    }
    
    // Выполняем запрос к API, используя тот же endpoint, что и в чате
    await axios.post(modelInfo.apiEndpoint, testData, { headers });
    
    return Promise.resolve(true);
  } catch (error) {
    console.error('Ошибка при проверке API-ключа:', error);
    return Promise.reject(error);
  }
};

// Отправка сообщения в LLM
export const sendMessageToLLM = async (model: string, messages: Message[]): Promise<MessageResponse> => {
  const apiKey = getStoredApiKeyForModel(model);
  if (!apiKey) {
    throw new Error('API-ключ не задан для этой модели');
  }
  
  const modelInfo = availableModels.find(m => m.id === model);
  if (!modelInfo || !modelInfo.apiEndpoint) {
    throw new Error(`Неизвестная модель или эндпоинт: ${model}`);
  }
  
  const requestData = formatRequest(model, messages);
  
  try {
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Настройка заголовков в зависимости от провайдера
    switch (modelInfo.provider) {
      case 'Google':
        headers = {
          ...headers,
          'x-goog-api-key': apiKey
        };
        break;
      
      case 'OpenAI':
        headers = {
          ...headers,
          'Authorization': `Bearer ${apiKey}`
        };
        break;
      
      case 'Anthropic':
        headers = {
          ...headers,
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        };
        break;
      
      case 'Mistral':
        headers = {
          ...headers,
          'Authorization': `Bearer ${apiKey}`
        };
        break;
        
      case 'OpenRouter':
        headers = {
          ...headers,
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.href,
          'X-Title': 'Gemini Chat'
        };
        break;
    }
    
    // Выполняем запрос к API
    const response = await axios.post(
      modelInfo.apiEndpoint, 
      requestData, 
      { headers }
    );
    
    return processResponse(model, response);
  } catch (error) {
    console.error('Ошибка при отправке запроса к API:', error);
    throw error;
  }
}; 