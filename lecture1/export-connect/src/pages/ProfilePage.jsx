import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, TextField, Button,
  Avatar, Divider, Alert, CircularProgress, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

const CATEGORY_COLORS = {
  '차량 요청': 'primary', '차량 판매': 'success', '시세 정보': 'warning',
  '수출 규정': 'error', '선적 후기': 'info', '쇼링 정보': 'secondary',
  '포워더 추천': 'primary', '자유게시판': 'default',
};

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', whatsapp: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const [{ data: profileData }, { data: postsData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('posts')
        .select('id, title, views, created_at, categories(name)')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false }),
    ]);
    if (profileData) {
      setProfile(profileData);
      setForm({ name: profileData.name || '', phone: profileData.phone || '', whatsapp: profileData.whatsapp || '' });
    }
    if (postsData) setMyPosts(postsData);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('이름을 입력해주세요.'); return; }
    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ name: form.name.trim(), phone: form.phone.trim(), whatsapp: form.whatsapp.trim() })
      .eq('id', user.id);

    setSaving(false);
    if (updateError) {
      setError('저장 중 오류가 발생했습니다.');
    } else {
      setProfile({ ...profile, ...form });
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const formatDate = (d) => d?.slice(0, 10) || '';
  const initials = (profile?.name || user?.email || '?')[0].toUpperCase();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#0D1F4E' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#F5F6FA', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1F4E', mb: 3 }}>
          내 프로필
        </Typography>

        {success && <Alert severity="success" sx={{ mb: 3 }}>프로필이 저장되었습니다.</Alert>}

        <Paper sx={{ borderRadius: 2, p: 4, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Avatar sx={{ width: 72, height: 72, backgroundColor: '#0D1F4E', fontSize: 28, fontWeight: 700 }}>
              {initials}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1F4E' }}>
                {profile?.name || '이름 없음'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#5A6A8A' }}>{user?.email}</Typography>
              <Typography variant="caption" sx={{ color: '#9AA3B5' }}>
                가입일: {formatDate(profile?.created_at)}
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              {!editing ? (
                <Button startIcon={<EditIcon />} variant="outlined" onClick={() => setEditing(true)}
                  sx={{ borderColor: '#0D1F4E', color: '#0D1F4E' }}>
                  수정
                </Button>
              ) : (
                <Button startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                  variant="contained" onClick={handleSave} disabled={saving}
                  sx={{ backgroundColor: '#0D1F4E' }}>
                  저장
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="이름" size="small" fullWidth
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={!editing}
              InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, color: '#9AA3B5', fontSize: 20 }} /> }}
              inputProps={{ 'data-gramm': 'false', spellCheck: false }}
            />
            <TextField
              label="전화번호" size="small" fullWidth
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={!editing}
              placeholder="+82-10-0000-0000"
              inputProps={{ 'data-gramm': 'false', spellCheck: false }}
            />
            <TextField
              label="WhatsApp 번호" size="small" fullWidth
              value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              disabled={!editing}
              placeholder="+971-50-000-0000"
              helperText="바이어와 직접 연결할 WhatsApp 번호를 입력하세요"
              InputProps={{
                startAdornment: <WhatsAppIcon sx={{ mr: 1, color: '#25D366', fontSize: 20 }} />,
              }}
              inputProps={{ 'data-gramm': 'false', spellCheck: false }}
            />
          </Box>

          {!editing && profile?.whatsapp && (
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<WhatsAppIcon />}
                href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                sx={{ backgroundColor: '#25D366', '&:hover': { backgroundColor: '#1DAA54' } }}
              >
                WhatsApp으로 연락하기
              </Button>
            </Box>
          )}
        </Paper>

        <Paper sx={{ borderRadius: 2, p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1F4E', mb: 2 }}>
            내 게시물 ({myPosts.length}개)
          </Typography>

          {myPosts.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#9AA3B5', textAlign: 'center', py: 4 }}>
              작성한 게시물이 없습니다.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F5F6FA' }}>
                    {['카테고리', '제목', '조회', '작성일'].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600, color: '#5A6A8A', fontSize: 13 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myPosts.map((post) => (
                    <TableRow key={post.id} hover sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/posts/${post.id}`)}>
                      <TableCell sx={{ width: 110 }}>
                        <Chip label={post.categories?.name} size="small"
                          color={CATEGORY_COLORS[post.categories?.name] || 'default'} sx={{ fontSize: 11 }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, fontSize: 13 }}>{post.title}</TableCell>
                      <TableCell sx={{ color: '#5A6A8A', fontSize: 13, width: 60 }}>{post.views}</TableCell>
                      <TableCell sx={{ color: '#9AA3B5', fontSize: 13, width: 100 }}>{formatDate(post.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default ProfilePage;
