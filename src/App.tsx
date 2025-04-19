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
        // Google Blue
        main: '#4285F4',
      },
      secondary: {
        // Google Red
        main: '#EA4335',
      },
      background: {
        default: darkMode ? '#202124' : '#f8f9fa',
        paper: darkMode ? '#303134' : '#ffffff',
      },
      error: {
        // Google Red
        main: '#EA4335'
      },
      warning: {
        // Google Yellow
        main: '#FBBC05'
      },
      success: {
        // Google Green
        main: '#34A853'
      },
      info: {
        // Google Blue
        main: '#4285F4'
      }
    },
    typography: {
      fontFamily: '"Google Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 500,
      },
      h2: {
        fontWeight: 500,
      },
      h3: {
        fontWeight: 500,
      },
      h4: {
        fontWeight: 500,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 8,
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
              background: darkMode ? '#202124' : '#f8f9fa',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: darkMode ? '#5f6368' : '#dadce0',
              borderRadius: 6,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
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
