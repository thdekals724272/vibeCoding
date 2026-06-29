import { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Tab, Tabs, Alert, CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (tab === 0) {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      if (!displayName.trim()) { setError('이름을 입력해주세요.'); setLoading(false); return; }
      const { error } = await signUp(email, password, displayName);
      if (error) setError(error.message);
      else setSuccess('가입 완료! 이메일을 확인하거나 로그인해보세요.');
    }
    setLoading(false);
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #FFFDFB 0%, #FFE8EF 100%)',
      px: 3,
    }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <FavoriteIcon sx={{ fontSize: 48, color: '#F7C9D4', mb: 1 }} />
        <Typography variant='h4' fontWeight={700} color='#5a3040'>Our Pages</Typography>
        <Typography variant='body2' color='text.secondary' mt={0.5}>결혼 준비를 함께 기록해요</Typography>
      </Box>

      <Card sx={{ width: '100%', maxWidth: 380, borderRadius: 4, boxShadow: '0 4px 24px rgba(247,201,212,0.4)' }}>
        <CardContent sx={{ p: 3 }}>
          <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(''); setSuccess(''); }}
            sx={{ mb: 3, '& .MuiTab-root': { fontWeight: 600, color: '#7a6a70' }, '& .Mui-selected': { color: '#c96a88' }, '& .MuiTabs-indicator': { backgroundColor: '#F7C9D4' } }}>
            <Tab label='로그인' />
            <Tab label='회원가입' />
          </Tabs>

          <form onSubmit={handleSubmit}>
            {tab === 1 && (
              <TextField fullWidth label='이름' value={displayName} onChange={e => setDisplayName(e.target.value)}
                sx={{ mb: 2 }} size='small' required />
            )}
            <TextField fullWidth label='이메일' type='email' value={email} onChange={e => setEmail(e.target.value)}
              sx={{ mb: 2 }} size='small' required />
            <TextField fullWidth label='비밀번호' type={showPw ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)} sx={{ mb: 3 }} size='small' required
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton size='small' onClick={() => setShowPw(!showPw)}>
                      {showPw ? <VisibilityOffIcon fontSize='small' /> : <VisibilityIcon fontSize='small' />}
                    </IconButton>
                  </InputAdornment>
                ),
              }} />
            {error && <Alert severity='error' sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
            {success && <Alert severity='success' sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}
            <Button type='submit' variant='contained' fullWidth size='large' disabled={loading}
              sx={{ py: 1.5, fontSize: '1rem' }}>
              {loading ? <CircularProgress size={22} sx={{ color: '#5a3040' }} /> : (tab === 0 ? '로그인' : '가입하기')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
