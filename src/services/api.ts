import axios from 'axios';
import { Message, MessageResponse, LLMModel } from '../types/chat';

// Локальное хранение ключа API
const API_KEY_STORAGE_KEY = 'gemini_chat_api_key';
const SELECTED_MODEL_STORAGE_KEY = 'gemini_chat_selected_model';

// Доступные модели для чата
export const availableModels: LLMModel[] = [
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
    
    case 'Mistral':
      return {
        model: model,
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
        return {
          content: response.data.choices[0].message.content
        };
      
      case 'Anthropic':
        return {
          content: response.data.content[0].text
        };
      
      case 'Mistral':
        return {
          content: response.data.choices[0].message.content
        };
      
      default:
        throw new Error(`Неподдерживаемый поставщик: ${modelInfo.provider}`);
    }
  } catch (error) {
    console.error('Ошибка при обработке ответа:', error);
    throw new Error('Не удалось обработать ответ от API');
  }
};

// Получение API-ключа из локального хранилища
export const getStoredApiKey = (): string => {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
};

// Сохранение API-ключа в локальное хранилище
export const storeApiKey = (apiKey: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
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
export const testApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Для простоты, просто вернем true, в реальном приложении здесь был бы реальный запрос
    return Promise.resolve(true);
  } catch (error) {
    console.error('Ошибка при проверке API-ключа:', error);
    return Promise.reject(error);
  }
};

// Отправка сообщения в LLM
export const sendMessageToLLM = async (model: string, messages: Message[]): Promise<MessageResponse> => {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('API-ключ не задан');
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
    }
    
    // Для демонстрационных целей, мы симулируем ответ
    // В реальном приложении здесь был бы реальный запрос к API
    
    // const response = await axios.post(modelInfo.apiEndpoint, requestData, { headers });
    // return processResponse(model, response);
    
    // Симуляция задержки запроса
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Симуляция ответа
    const simulatedResponse = {
      data: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: `Это симулированный ответ от модели ${modelInfo.name} (${modelInfo.provider}).\n\nВы можете подключить реальный API, изменив соответствующий код в файле src/services/api.ts.\n\nДля работы с реальным API вам потребуется действительный API-ключ от соответствующего провайдера.`
                }
              ]
            }
          }
        ]
      }
    };
    
    return processResponse('gemini-pro', simulatedResponse);
  } catch (error) {
    console.error('Ошибка при отправке запроса к API:', error);
    throw error;
  }
}; 