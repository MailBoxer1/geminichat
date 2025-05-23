import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Avatar, 
  CircularProgress,
  Container,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { Message } from '../types/chat';
import { sendMessageToLLM, availableModels } from '../services/api';

interface ChatProps {
  modelId: string;
}

const Chat: React.FC<ChatProps> = ({ modelId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Получаем информацию о выбранной модели
  const modelInfo = availableModels.find(m => m.id === modelId);
  const modelName = modelInfo?.name || modelId;
  const modelProvider = modelInfo?.provider || '';
  
  const getProviderColor = (provider: string) => {
    switch(provider) {
      case 'Google': return '#4285F4';
      case 'OpenAI': return '#10a37f';
      case 'Anthropic': return '#d25f8f';
      case 'Mistral': return '#5d45e8';
      case 'OpenRouter': return '#ff5a1f';
      default: return '#757575';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await sendMessageToLLM(modelId, [...messages, userMessage]);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Произошла ошибка при получении ответа. Пожалуйста, попробуйте еще раз.',
        timestamp: new Date().toISOString(),
        error: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <Container maxWidth="md" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SmartToyIcon 
            sx={{ 
              mr: 1.5, 
              color: getProviderColor(modelProvider),
              fontSize: 28
            }} 
          />
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
              Чат с AI ассистентом
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Tooltip title={`Провайдер: ${modelProvider}`}>
                <Chip 
                  label={modelName} 
                  size="small" 
                  sx={{ 
                    bgcolor: getProviderColor(modelProvider) + '20',
                    color: getProviderColor(modelProvider),
                    fontWeight: 500,
                    borderRadius: 1
                  }}
                />
              </Tooltip>
            </Box>
          </Box>
        </Box>
        <Tooltip title="Очистить чат">
          <IconButton onClick={handleClearChat} color="error">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Paper 
        elevation={3} 
        sx={{ 
          flexGrow: 1, 
          mb: 2, 
          p: 2, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxHeight: 'calc(100vh - 180px)'
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="text.secondary">
              Начните общение с моделью, отправив сообщение ниже
            </Typography>
          </Box>
        )}
        
        {messages.map((msg, index) => (
          <Box 
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                alignSelf: 'flex-start'
              }}
            >
              {msg.role === 'user' ? 'Вы' : 'AI'}
            </Avatar>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                bgcolor: msg.role === 'user' ? 'primary.light' : msg.error ? 'error.light' : 'secondary.light',
                borderRadius: 2
              }}
            >
              <Typography 
                component="pre" 
                sx={{ 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  fontFamily: msg.content.includes('```') ? 'monospace' : 'inherit'
                }}
              >
                {msg.content}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}
        
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, alignSelf: 'flex-start', maxWidth: '80%' }}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>AI</Avatar>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Генерация ответа...
              </Typography>
            </Paper>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Paper>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Введите сообщение..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          disabled={loading}
          multiline
          maxRows={4}
          sx={{ bgcolor: 'background.paper' }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSend}
          disabled={loading || input.trim() === ''}
          sx={{ px: 3 }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Container>
  );
};

export default Chat; 