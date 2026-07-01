import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0D1F4E',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#C9A86A',
      contrastText: '#0D1F4E',
    },
    background: {
      default: '#F5F6FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0D1F4E',
      secondary: '#5A6A8A',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.125rem', fontWeight: 700 },
    h2: { fontSize: '1.75rem', fontWeight: 600 },
    h3: { fontSize: '1.5rem', fontWeight: 600 },
    h4: { fontSize: '1.25rem', fontWeight: 600 },
    h5: { fontSize: '1.1rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: '#0D1F4E',
          '&:hover': { backgroundColor: '#162B6B' },
        },
        containedSecondary: {
          backgroundColor: '#C9A86A',
          color: '#0D1F4E',
          '&:hover': { backgroundColor: '#B8924F' },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0D1F4E',
        },
      },
    },
  },
});

export default theme;
