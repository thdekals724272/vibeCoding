import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#F7C9D4',
      dark: '#e8a8b8',
      contrastText: '#5a3040',
    },
    secondary: {
      main: '#DCEEFF',
      contrastText: '#1a3a5c',
    },
    background: {
      default: '#FFFDFB',
      paper: '#FFFFFF',
    },
    success: {
      main: '#DCEFD8',
      contrastText: '#2d5a27',
    },
    warning: {
      main: '#FFF5C8',
      contrastText: '#5a4a00',
    },
    text: {
      primary: '#3a2a30',
      secondary: '#7a6a70',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(247,201,212,0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          backgroundColor: '#F7C9D4',
          color: '#5a3040',
          '&:hover': { backgroundColor: '#e8a8b8' },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          backgroundColor: '#F7C9D4',
          color: '#5a3040',
          '&:hover': { backgroundColor: '#e8a8b8' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #F7C9D4',
          height: 64,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          '&.Mui-selected': { color: '#c96a88' },
          minWidth: 'unset',
        },
      },
    },
  },
});

export default theme;
