import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Box,
  Container
} from '@mui/material';
import Chat from './components/Chat';
import Header from './components/Header';
import Settings from './components/Settings';
import { 
  getStoredApiKey, 
  storeApiKey, 
  getStoredSelectedModel, 
  storeSelectedModel,
  availableModels
} from './services/api';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(getStoredApiKey());
  const [selectedModel, setSelectedModel] = useState<string>(getStoredSelectedModel());

  useEffect(() => {
    storeApiKey(apiKey);
  }, [apiKey]);

  useEffect(() => {
    storeSelectedModel(selectedModel);
  }, [selectedModel]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2196f3',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '0.4em',
            },
            '&::-webkit-scrollbar-track': {
              background: darkMode ? '#121212' : '#f5f5f5',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: darkMode ? '#494949' : '#c1c1c1',
              borderRadius: 6,
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <Header 
          toggleSettings={toggleSettings} 
          settingsOpen={settingsOpen} 
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        
        <Container 
          component="main" 
          maxWidth="lg" 
          sx={{ 
            mt: 2, 
            mb: 4, 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column'
          }}
        >
          {settingsOpen && (
            <Settings 
              apiKey={apiKey}
              setApiKey={handleApiKeyChange}
              selectedModel={selectedModel}
              setSelectedModel={handleModelChange}
              availableModels={availableModels}
            />
          )}
          
          <Chat modelId={selectedModel} />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
