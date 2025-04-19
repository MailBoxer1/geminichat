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
  Divider
} from '@mui/material';
import { testApiKey } from '../services/api';
import { LLMModel } from '../types/chat';

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
    try {
      await testApiKey(tempApiKey);
      setTestStatus('success');
      setSnackbarMessage('API-ключ работает корректно!');
      setSnackbarOpen(true);
    } catch (error) {
      setTestStatus('error');
      setSnackbarMessage('Ошибка при проверке API-ключа');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Определяем, как получить API ключ в зависимости от провайдера
  const getApiKeyInstructions = () => {
    if (!selectedModelInfo) return null;
    
    switch (selectedModelInfo.provider) {
      case 'Google':
        return (
          <Box sx={{ mt: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Чтобы получить API-ключ для Google AI Studio:
            </Typography>
            <ol style={{ margin: '8px 0', paddingLeft: '24px' }}>
              <li>Перейдите на <Link href="https://aistudio.google.com/" target="_blank">aistudio.google.com</Link></li>
              <li>Войдите в свой аккаунт Google</li>
              <li>Перейдите в настройки API (Get API key)</li>
              <li>Создайте новый API-ключ или используйте существующий</li>
              <li>Скопируйте ключ и вставьте его выше</li>
            </ol>
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
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        API-ключ для {selectedModelInfo?.provider || 'провайдера'}
      </Typography>
      
      {getApiKeyInstructions()}
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="API-ключ"
          type="password"
          fullWidth
          value={tempApiKey}
          onChange={handleApiKeyChange}
          margin="normal"
          variant="outlined"
          placeholder="Введите ваш API-ключ"
          helperText={selectedModelInfo ? `API-ключ для доступа к модели ${selectedModelInfo.name}` : 'API-ключ для доступа к модели'}
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
            disabled={!tempApiKey}
          >
            Проверить ключ
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