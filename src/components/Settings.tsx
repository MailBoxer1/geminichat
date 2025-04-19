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
  Snackbar
} from '@mui/material';
import { testApiKey } from '../services/api';
import { LLMModel } from '../types/chat';
import axios from 'axios';

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

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Настройки
      </Typography>
      
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
          helperText="API-ключ для доступа к модели LLM"
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