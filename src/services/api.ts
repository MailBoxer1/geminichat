import axios from 'axios';
import { Message, MessageResponse, LLMModel } from '../types/chat';

// Локальное хранение ключей API
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
const formatRequest = (model: string, messages: Message[], stream: boolean = false) => {
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
        })),
        stream: stream
      };
    
    case 'Anthropic':
      return {
        model: model,
        messages: messages.map(message => ({
          role: message.role,
          content: message.content
        })),
        max_tokens: 4096,
        stream: stream
      };
    
    case 'OpenRouter':
      // Правильная обработка ID модели
      const modelId = model.includes('openrouter/') ? model.replace('openrouter/', '') : model;
      return {
        model: modelId,
        messages: messages.map(message => ({
          role: message.role,
          content: message.content
        })),
        max_tokens: 1000, // Разумное значение по умолчанию
        stream: stream
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

// Интерфейс для хранения API-ключей
interface ApiKeysStorage {
  [provider: string]: string;
}

// Получение всех сохраненных API-ключей
export const getAllStoredApiKeys = (): ApiKeysStorage => {
  const keysJson = localStorage.getItem(API_KEYS_STORAGE_KEY);
  return keysJson ? JSON.parse(keysJson) : {};
};

// Получение API-ключа для конкретного провайдера
export const getStoredApiKey = (modelId?: string): string => {
  const allKeys = getAllStoredApiKeys();
  
  if (!modelId) {
    // Поддержка обратной совместимости - возвращаем первый найденный ключ
    const firstKey = Object.values(allKeys)[0];
    return firstKey || '';
  }
  
  const modelInfo = availableModels.find(m => m.id === modelId);
  if (!modelInfo) return '';
  
  return allKeys[modelInfo.provider] || '';
};

// Сохранение API-ключа для конкретного провайдера
export const storeApiKey = (apiKey: string, modelId: string): void => {
  const modelInfo = availableModels.find(m => m.id === modelId);
  if (!modelInfo) return;
  
  const allKeys = getAllStoredApiKeys();
  allKeys[modelInfo.provider] = apiKey;
  
  localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(allKeys));
};

// Получение выбранной модели из локального хранилища
export const getStoredSelectedModel = (): string => {
  return localStorage.getItem(SELECTED_MODEL_STORAGE_KEY) || availableModels[0].id;
};

// Сохранение выбранной модели в локальное хранилище
export const storeSelectedModel = (model: string): void => {
  localStorage.setItem(SELECTED_MODEL_STORAGE_KEY, model);
};

// Обработка ошибок OpenRouter
const handleOpenRouterError = (error: any): Error => {
  if (!error.response) {
    return new Error('Ошибка сети при подключении к OpenRouter');
  }
  
  const status = error.response.status;
  const data = error.response.data;
  
  switch (status) {
    case 400:
      return new Error(`Ошибка в запросе: ${data.error?.message || 'Неверный формат запроса'}`);
    case 401:
      return new Error('Неверный API-ключ для OpenRouter');
    case 402:
      return new Error('Недостаточно средств на счету OpenRouter');
    case 429:
      return new Error('Превышен лимит запросов к OpenRouter');
    case 500:
    case 502:
    case 503:
      return new Error('Сервис OpenRouter временно недоступен');
    default:
      return new Error(`Ошибка OpenRouter: ${data.error?.message || error.message || 'Неизвестная ошибка'}`);
  }
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
      testData.max_tokens = 150;
    }
    
    // Выполняем запрос к API, используя тот же endpoint, что и в чате
    await axios.post(modelInfo.apiEndpoint, testData, { headers });
    
    return Promise.resolve(true);
  } catch (error) {
    console.error('Ошибка при проверке API-ключа:', error);
    console.log(error);
    
    // Специальная обработка ошибок OpenRouter
    const modelInfo = availableModels.find(m => m.id === modelId);
    if (modelInfo?.provider === 'OpenRouter') {
      return Promise.reject(handleOpenRouterError(error));
    }
    
    return Promise.reject(error);
  }
};

// Отправка сообщения в LLM
export const sendMessageToLLM = async (model: string, messages: Message[], stream: boolean = false): Promise<MessageResponse> => {
  const modelInfo = availableModels.find(m => m.id === model);
  if (!modelInfo || !modelInfo.apiEndpoint) {
    throw new Error(`Неизвестная модель или эндпоинт: ${model}`);
  }
  
  const apiKey = getStoredApiKey(model);
  if (!apiKey) {
    throw new Error(`API-ключ не задан для провайдера ${modelInfo.provider}`);
  }
  
  const requestData = formatRequest(model, messages, stream);
  
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
    
    // Специальная обработка ошибок OpenRouter
    if (modelInfo.provider === 'OpenRouter') {
      throw handleOpenRouterError(error);
    }
    
    throw error;
  }
};

// Обработка потокового ответа от OpenRouter
export const sendStreamingMessageToLLM = async (
  model: string, 
  messages: Message[], 
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void
): Promise<void> => {
  const modelInfo = availableModels.find(m => m.id === model);
  if (!modelInfo || !modelInfo.apiEndpoint) {
    throw new Error(`Неизвестная модель или эндпоинт: ${model}`);
  }
  
  const apiKey = getStoredApiKey(model);
  if (!apiKey) {
    throw new Error(`API-ключ не задан для провайдера ${modelInfo.provider}`);
  }
  
  // Подготовка запроса с потоковой передачей
  const requestData = formatRequest(model, messages, true);
  
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
    
    // Выполняем потоковый запрос к API с использованием Axios и обработкой SSE
    const response = await axios({
      method: 'post',
      url: modelInfo.apiEndpoint,
      data: requestData,
      headers: headers,
      responseType: 'stream'
    });
    
    let fullResponse = '';
    
    response.data.on('data', (chunk: Buffer) => {
      const decodedChunk = chunk.toString();
      
      // Обработка данных в формате SSE (Server-Sent Events)
      const lines = decodedChunk
        .split('\n')
        .filter(line => line.trim() !== '' && line.startsWith('data: '));
        
      for (const line of lines) {
        const jsonData = line.substring(6); // Удаляем префикс 'data: '
        
        // Пропускаем [DONE] маркер
        if (jsonData.trim() === '[DONE]') continue;
        
        try {
          const parsedData = JSON.parse(jsonData);
          
          let chunkContent = '';
          
          // Извлекаем содержимое в зависимости от провайдера
          switch (modelInfo.provider) {
            case 'OpenAI':
            case 'Mistral':
            case 'OpenRouter':
              if (parsedData.choices && parsedData.choices[0].delta && parsedData.choices[0].delta.content) {
                chunkContent = parsedData.choices[0].delta.content;
              }
              break;
              
            case 'Anthropic':
              if (parsedData.content && parsedData.content[0] && parsedData.content[0].text) {
                chunkContent = parsedData.content[0].text;
              }
              break;
              
            case 'Google':
              if (parsedData.candidates && parsedData.candidates[0] && 
                  parsedData.candidates[0].content && parsedData.candidates[0].content.parts && 
                  parsedData.candidates[0].content.parts[0] && parsedData.candidates[0].content.parts[0].text) {
                chunkContent = parsedData.candidates[0].content.parts[0].text;
              }
              break;
          }
          
          if (chunkContent) {
            fullResponse += chunkContent;
            onChunk(chunkContent);
          }
        } catch (e) {
          console.error('Ошибка при обработке чанка:', e);
        }
      }
    });
    
    response.data.on('end', () => {
      onComplete(fullResponse);
    });
    
    response.data.on('error', (err: Error) => {
      throw err;
    });
    
  } catch (error) {
    console.error('Ошибка при отправке потокового запроса к API:', error);
    
    // Специальная обработка ошибок OpenRouter
    if (modelInfo.provider === 'OpenRouter') {
      throw handleOpenRouterError(error);
    }
    
    throw error;
  }
}; 