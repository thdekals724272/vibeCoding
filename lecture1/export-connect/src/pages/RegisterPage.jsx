import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  CircularProgress,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const STEPS = ['기본 정보 입력', '연락처 확인', '가입 완료'];

function RegisterPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
  });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: '' });
    setServerError('');
  };

  const validateStep0 = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = '이름을 입력해주세요.';
    if (!form.email.trim()) newErrors.email = '이메일을 입력해주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    if (!form.password) newErrors.password = '비밀번호를 입력해주세요.';
    else if (form.password.length < 6)
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    if (!form.passwordConfirm) newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    else if (form.password !== form.passwordConfirm)
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    return newErrors;
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!form.phone.trim()) newErrors.phone = '전화번호를 입력해주세요.';
    else if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone))
      newErrors.phone = '올바른 전화번호 형식으로 입력해주세요.';
    return newErrors;
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      const newErrors = validateStep0();
      if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
      setActiveStep(1);
      return;
    }

    if (activeStep === 1) {
      const newErrors = validateStep1();
      if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

      setLoading(true);
      setServerError('');

      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { name: form.name, phone: form.phone },
        },
      });

      setLoading(false);

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setServerError('이미 가입된 이메일입니다.');
        } else {
          setServerError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
        return;
      }

      setActiveStep(2);

      // 가입 직후 바로 로그인 (이메일 인증 우회)
      await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
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
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ backgroundColor: '#0D1F4E', py: 4, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <DirectionsCarIcon sx={{ color: '#C9A86A', fontSize: 32 }} />
              <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 700, letterSpacing: 1 }}>
                Export Connect
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#C9A86A' }}>
              Connecting Exporters Worldwide
            </Typography>
          </Box>

          <Box sx={{ px: 4, pt: 4, pb: 1 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      '& .MuiStepLabel-label': { fontSize: 12 },
                      '& .MuiStepIcon-root.Mui-active': { color: '#0D1F4E' },
                      '& .MuiStepIcon-root.Mui-completed': { color: '#C9A86A' },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Box sx={{ px: 4, pt: 3, pb: 4 }}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, color: '#0D1F4E', fontWeight: 700 }}>
                  기본 정보 입력
                </Typography>
                <TextField
                  fullWidth label="이름" value={form.name}
                  onChange={handleChange('name')} error={!!errors.name}
                  helperText={errors.name} sx={{ mb: 2 }} size="small" placeholder="홍길동"
                  inputProps={{ 'data-gramm': 'false', spellCheck: false }}
                />
                <TextField
                  fullWidth label="이메일" type="email" value={form.email}
                  onChange={handleChange('email')} error={!!errors.email}
                  helperText={errors.email} sx={{ mb: 2 }} size="small" placeholder="example@email.com"
                  inputProps={{ 'data-gramm': 'false', spellCheck: false }}
                />
                <TextField
                  fullWidth label="비밀번호" type="password" value={form.password}
                  onChange={handleChange('password')} error={!!errors.password}
                  helperText={errors.password || '6자 이상 입력해주세요.'} sx={{ mb: 2 }} size="small"
                  inputProps={{ 'data-gramm': 'false', spellCheck: false }}
                />
                <TextField
                  fullWidth label="비밀번호 확인" type="password" value={form.passwordConfirm}
                  onChange={handleChange('passwordConfirm')} error={!!errors.passwordConfirm}
                  helperText={errors.passwordConfirm} sx={{ mb: 3 }} size="small"
                  inputProps={{ 'data-gramm': 'false', spellCheck: false }}
                />
                <Button
                  fullWidth variant="contained" onClick={handleNext}
                  sx={{ py: 1.3, backgroundColor: '#0D1F4E', '&:hover': { backgroundColor: '#162B6B' } }}
                >
                  다음
                </Button>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, color: '#0D1F4E', fontWeight: 700 }}>
                  연락처 입력
                </Typography>
                {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
                <Alert severity="info" sx={{ mb: 3, fontSize: 13 }}>
                  WhatsApp 또는 국제전화 번호를 입력하면 바이어와의 연결이 쉬워집니다.
                </Alert>
                <TextField
                  fullWidth label="전화번호" value={form.phone}
                  onChange={handleChange('phone')} error={!!errors.phone}
                  helperText={errors.phone || '예: +82-10-1234-5678'}
                  sx={{ mb: 3 }} size="small" placeholder="+82-10-0000-0000"
                  disabled={loading}
                  inputProps={{ 'data-gramm': 'false', spellCheck: false }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    fullWidth variant="outlined" onClick={() => setActiveStep(0)}
                    disabled={loading}
                    sx={{ py: 1.3, borderColor: '#9AA3B5', color: '#5A6A8A' }}
                  >
                    이전
                  </Button>
                  <Button
                    fullWidth variant="contained" onClick={handleNext}
                    disabled={loading}
                    sx={{ py: 1.3, backgroundColor: '#0D1F4E', '&:hover': { backgroundColor: '#162B6B' } }}
                  >
                    {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : '가입 완료'}
                  </Button>
                </Box>
              </Box>
            )}

            {activeStep === 2 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 72, color: '#C9A86A', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1F4E', mb: 1 }}>
                  회원가입 완료!
                </Typography>
                <Typography variant="body2" sx={{ color: '#5A6A8A', mb: 1 }}>
                  <strong>{form.name}</strong>님, Export Connect에 오신 걸 환영합니다.
                </Typography>
                <Typography variant="body2" sx={{ color: '#5A6A8A', mb: 4 }}>
                  {form.email}으로 가입이 완료되었습니다.
                </Typography>
                <Button
                  fullWidth variant="contained" onClick={() => navigate('/posts')}
                  sx={{
                    py: 1.3, backgroundColor: '#C9A86A', color: '#0D1F4E',
                    '&:hover': { backgroundColor: '#B8924F' },
                  }}
                >
                  게시판 바로 가기
                </Button>
              </Box>
            )}

            {activeStep < 2 && (
              <>
                <Divider sx={{ mt: 3, mb: 2 }} />
                <Typography variant="body2" sx={{ textAlign: 'center', color: '#5A6A8A' }}>
                  이미 계정이 있으신가요?{' '}
                  <Link
                    onClick={() => navigate('/login')}
                    sx={{ color: '#0D1F4E', fontWeight: 600, cursor: 'pointer' }}
                    underline="hover"
                  >
                    로그인
                  </Link>
                </Typography>
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default RegisterPage;
