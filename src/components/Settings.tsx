import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Button, 
  SelectChangeEvent, 
  Alert,
  Snackbar,
  Link,
  IconButton,
  InputAdornment
} from '@mui/material';
import { testApiKey } from '../services/api';
import { LLMModel } from '../types/chat';
import axios from 'axios';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface SettingsProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: LLMModel[];
}

const Settings: React.FC<SettingsProps> = ({ 
  apiKey, 
  setApiKey, 
  selectedModel, 
  setSelectedModel,
  availableModels
}) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [testStatus, setTestStatus] = useState<'success' | 'error' | 'idle'>('idle');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const selectedModelInfo = availableModels.find(m => m.id === selectedModel);

  const handleModelChange = (event: SelectChangeEvent) => {
    setSelectedModel(event.target.value);
  };

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTempApiKey(event.target.value);
  };

  const handleSaveApiKey = () => {
    setApiKey(tempApiKey);
    setSnackbarMessage('API-ключ сохранен!');
    setSnackbarOpen(true);
  };

  const handleTestApiKey = async () => {
    setTesting(true);
    try {
      await testApiKey(tempApiKey, selectedModel);
      setTestStatus('success');
      setSnackbarMessage('API-ключ работает корректно!');
      setSnackbarOpen(true);
    } catch (error) {
      setTestStatus('error');
      let errorMessage = 'Ошибка при проверке API-ключа';
      
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      } else if (axios.isAxiosError(error) && error.response) {
        errorMessage += `: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
      console.error('Детальная ошибка при проверке API-ключа:', error);
    } finally {
      setTesting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };
  
  // Определяем, как получить API ключ в зависимости от провайдера
  const getApiKeyInstructions = () => {
    if (!selectedModelInfo) return null;
    
    switch (selectedModelInfo.provider) {
      case 'Google':
        return (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Получить API-ключ можно на <Link href="https://aistudio.google.com/" target="_blank">Google AI Studio</Link>.
          </Typography>
        );
        
      case 'OpenRouter':
        return (
          <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Для использования OpenRouter API:
            </Typography>
            <ol style={{ margin: '8px 0', paddingLeft: '24px' }}>
              <li>Перейдите на <Link href="https://openrouter.ai/" target="_blank">OpenRouter.ai</Link></li>
              <li>Создайте аккаунт или войдите в существующий</li>
              <li>Перейдите в настройки API и создайте ключ</li>
              <li>Скопируйте ключ и вставьте его выше</li>
            </ol>
            <Typography variant="body2" color="text.secondary">
              OpenRouter предоставляет бесплатный доступ к разным моделям, включая Gemini 2.5 Pro
            </Typography>
          </Box>
        );
        
      case 'OpenAI':
        return (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Получить API-ключ можно в <Link href="https://platform.openai.com/api-keys" target="_blank">личном кабинете OpenAI</Link>.
          </Typography>
        );
        
      case 'Anthropic':
        return (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Получить API-ключ можно на <Link href="https://console.anthropic.com/" target="_blank">сайте Anthropic</Link>.
          </Typography>
        );
        
      case 'Mistral':
        return (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Получить API-ключ можно на <Link href="https://console.mistral.ai/" target="_blank">сайте Mistral AI</Link>.
          </Typography>
        );
        
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Настройки
      </Typography>
      
      <FormControl fullWidth margin="normal">
        <InputLabel>Модель</InputLabel>
        <Select
          value={selectedModel}
          label="Модель"
          onChange={handleModelChange}
        >
          {availableModels.map((model) => (
            <MenuItem key={model.id} value={model.id}>
              {model.name} - {model.description}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          API-ключ {selectedModelInfo && `для ${selectedModelInfo.provider}`}
        </Typography>
        
        {getApiKeyInstructions()}
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="API-ключ"
          type={showApiKey ? "text" : "password"}
          fullWidth
          value={tempApiKey}
          onChange={handleApiKeyChange}
          margin="normal"
          variant="outlined"
          placeholder="Введите ваш API-ключ"
          helperText={selectedModelInfo ? `API-ключ для доступа к модели ${selectedModelInfo.name}` : 'API-ключ для доступа к модели'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={toggleShowApiKey}>
                  {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveApiKey}
            disabled={!tempApiKey}
          >
            Сохранить ключ
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleTestApiKey}
            disabled={!tempApiKey || testing}
          >
            {testing ? 'Проверка...' : 'Проверить ключ'}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={testStatus === 'error' ? 'error' : 'success'} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default Settings; 