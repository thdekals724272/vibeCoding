import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Divider,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (authError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else {
      navigate('/posts');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0D1F4E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'radial-gradient(ellipse at 70% 30%, #1a3070 0%, #0D1F4E 60%)',
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ backgroundColor: '#0D1F4E', py: 4, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <DirectionsCarIcon sx={{ color: '#C9A86A', fontSize: 32 }} />
              <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 700, letterSpacing: 1 }}>
                Export Connect
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#C9A86A', letterSpacing: 0.5 }}>
              Connecting Exporters Worldwide
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleLogin} sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              sx={{ mb: 2 }}
              size="small"
              disabled={loading}
              inputProps={{ 'data-gramm': 'false', spellCheck: false }}
            />

            <TextField
              fullWidth
              label="비밀번호"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              sx={{ mb: 1 }}
              size="small"
              disabled={loading}
              inputProps={{ 'data-gramm': 'false', spellCheck: false }}
            />

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link href="#" underline="hover" sx={{ fontSize: 13, color: '#5A6A8A' }}>
                비밀번호 찾기
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.3,
                backgroundColor: '#0D1F4E',
                '&:hover': { backgroundColor: '#162B6B' },
                mb: 2,
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : '로그인'}
            </Button>

            <Divider sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#9AA3B5', px: 1 }}>
                또는
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/register')}
              sx={{
                py: 1.3,
                borderColor: '#C9A86A',
                color: '#C9A86A',
                '&:hover': { borderColor: '#B8924F', backgroundColor: '#FDF8EF' },
              }}
            >
              회원가입
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage;
