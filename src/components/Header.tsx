import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Drawer, 
  useMediaQuery, 
  useTheme,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import GitHubIcon from '@mui/icons-material/GitHub';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ChatIcon from '@mui/icons-material/Chat';

interface HeaderProps {
  toggleSettings: () => void;
  settingsOpen: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  toggleSettings, 
  settingsOpen, 
  darkMode, 
  toggleDarkMode 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const headerContent = (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <ChatIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Gemini Chat
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={darkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}>
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Настройки">
          <IconButton 
            color="inherit" 
            onClick={toggleSettings}
            sx={{ 
              bgcolor: settingsOpen ? 'primary.dark' : 'transparent',
              '&:hover': {
                bgcolor: settingsOpen ? 'primary.dark' : 'rgba(255, 255, 255, 0.08)'
              }
            }}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="GitHub репозиторий">
          <IconButton 
            color="inherit"
            component="a"
            href="https://github.com/MailBoxer1/geminichat"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </>
  );

  return (
    <>
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={toggleDrawer}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Gemini Chat
              </Typography>
              <IconButton color="inherit" onClick={toggleSettings}>
                <SettingsIcon />
              </IconButton>
            </>
          ) : (
            headerContent
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        <Box
          sx={{ width: 250, p: 2 }}
          role="presentation"
          onClick={toggleDrawer}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Меню
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                name="darkMode"
                color="primary"
              />
            }
            label="Темная тема"
          />
          
          <Button 
            startIcon={<SettingsIcon />}
            onClick={toggleSettings}
            fullWidth
            sx={{ mt: 2, justifyContent: 'flex-start' }}
          >
            Настройки
          </Button>
          
          <Button 
            startIcon={<GitHubIcon />}
            component="a"
            href="https://github.com/MailBoxer1/geminichat"
            target="_blank"
            rel="noopener noreferrer"
            fullWidth
            sx={{ mt: 1, justifyContent: 'flex-start' }}
          >
            GitHub
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default Header; 