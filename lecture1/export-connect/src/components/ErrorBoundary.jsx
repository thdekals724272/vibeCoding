import { Component } from 'react';
import { Box, Button, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#F5F6FA',
            gap: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: '#0D1F4E', fontWeight: 700 }}>
            페이지를 불러오는 중 오류가 발생했습니다.
          </Typography>
          <Typography variant="body2" sx={{ color: '#5A6A8A' }}>
            브라우저 확장 프로그램(번역, 맞춤법 검사)이 영향을 줄 수 있습니다.
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            sx={{ backgroundColor: '#0D1F4E', '&:hover': { backgroundColor: '#162B6B' }, px: 4, py: 1.3 }}
          >
            새로고침
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
