import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Avatar, Button, TextField,
  Stack, Divider, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, IconButton, CircularProgress,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function MyPage() {
  const { user, profile, couple, signOut, fetchProfile, refreshCouple } = useAuth();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [coupleOpen, setCoupleOpen] = useState(false);
  const [weddingOpen, setWeddingOpen] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [partnerCode, setPartnerCode] = useState('');
  const [weddingDate, setWeddingDate] = useState(couple?.wedding_date || '');
  const [venue, setVenue] = useState(couple?.venue || '');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function updateProfile() {
    setLoading(true);
    await supabase.from('users').update({ display_name: displayName, bio }).eq('id', user.id);
    await fetchProfile(user.id);
    setEditOpen(false);
    setLoading(false);
  }

  async function connectCouple() {
    setMsg('');
    setLoading(true);
    const { data: partner } = await supabase.from('users').select('id').eq('couple_code', partnerCode.trim().toUpperCase()).single();
    if (!partner) { setMsg('해당 코드를 가진 사용자를 찾을 수 없어요.'); setLoading(false); return; }
    if (partner.id === user.id) { setMsg('본인의 코드는 사용할 수 없어요.'); setLoading(false); return; }

    const { data: existing } = await supabase.from('couples')
      .select('id').or(`user1_id.eq.${partner.id},user2_id.eq.${partner.id}`).single();
    if (existing) { setMsg('상대방이 이미 다른 커플과 연결되어 있어요.'); setLoading(false); return; }

    const { data: newCouple, error } = await supabase.from('couples')
      .insert({ user1_id: user.id, user2_id: partner.id }).select().single();
    if (error) { setMsg('연결 중 오류가 발생했어요.'); setLoading(false); return; }

    await refreshCouple();
    setCoupleOpen(false);
    setMsg('');
    setLoading(false);
  }

  async function createSoloCouple() {
    setLoading(true);
    const { data } = await supabase.from('couples').insert({ user1_id: user.id }).select().single();
    if (data) await refreshCouple();
    setCoupleOpen(false);
    setLoading(false);
  }

  async function updateWedding() {
    setLoading(true);
    await supabase.from('couples').update({ wedding_date: weddingDate || null, venue: venue || null }).eq('id', couple.id);
    await refreshCouple();
    setWeddingOpen(false);
    setLoading(false);
  }

  async function copyCode() {
    await navigator.clipboard.writeText(profile?.couple_code || '');
  }

  return (
    <Box sx={{ p: 2, pb: 2 }}>
      <Typography variant='h6' color='#5a3040' sx={{ mb: 2, pt: 1 }}>마이페이지</Typography>

      {/* 프로필 카드 */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 60, height: 60, bgcolor: '#F7C9D4', fontSize: 24 }}>
              {profile?.display_name?.[0] || '?'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant='h6' color='#5a3040'>{profile?.display_name || '이름 없음'}</Typography>
              <Typography variant='body2' color='text.secondary'>@{profile?.username || ''}</Typography>
              {profile?.bio && <Typography variant='body2' color='text.secondary' mt={0.5}>{profile.bio}</Typography>}
            </Box>
            <IconButton size='small' onClick={() => { setDisplayName(profile?.display_name || ''); setBio(profile?.bio || ''); setEditOpen(true); }}>
              <EditIcon fontSize='small' sx={{ color: '#c96a88' }} />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#FFF0F3', p: 1.5, borderRadius: 2 }}>
            <Typography variant='caption' color='text.secondary'>내 커플 코드</Typography>
            <Chip label={profile?.couple_code || '-'} size='small' sx={{ bgcolor: '#F7C9D4', color: '#5a3040', fontWeight: 700, letterSpacing: 2 }} />
            <IconButton size='small' onClick={copyCode}><ContentCopyIcon sx={{ fontSize: 14, color: '#c96a88' }} /></IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* 커플 정보 카드 */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FavoriteIcon sx={{ color: '#F7C9D4', fontSize: 20 }} />
              <Typography variant='subtitle1' fontWeight={600} color='#5a3040'>커플 정보</Typography>
            </Box>
            {couple && (
              <IconButton size='small' onClick={() => { setWeddingDate(couple.wedding_date || ''); setVenue(couple.venue || ''); setWeddingOpen(true); }}>
                <EditIcon fontSize='small' sx={{ color: '#c96a88' }} />
              </IconButton>
            )}
          </Box>
          {couple ? (
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant='body2' color='text.secondary' sx={{ width: 70 }}>결혼식</Typography>
                <Typography variant='body2' color='text.primary'>{couple.wedding_date || '미설정'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant='body2' color='text.secondary' sx={{ width: 70 }}>예식 장소</Typography>
                <Typography variant='body2' color='text.primary'>{couple.venue || '미설정'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant='body2' color='text.secondary' sx={{ width: 70 }}>파트너</Typography>
                <Typography variant='body2' color='text.primary'>
                  {couple.user2_id ? '연결됨 💕' : '아직 연결 안됨'}
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Typography variant='body2' color='text.secondary' mb={1.5}>아직 커플 정보가 없어요</Typography>
              <Button variant='contained' size='small' onClick={() => setCoupleOpen(true)}>시작하기</Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 앱 메뉴 */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 1 }}>
          {[
            { label: '예산 관리', path: '/budget', icon: '💰' },
            { label: '업체 관리', path: '/vendors', icon: '🏪' },
          ].map(item => (
            <Box key={item.path}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, cursor: 'pointer' }} onClick={() => navigate(item.path)}>
                <Typography fontSize={18}>{item.icon}</Typography>
                <Typography variant='body2' fontWeight={500} color='text.primary'>{item.label}</Typography>
              </Box>
              <Divider />
            </Box>
          ))}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, cursor: 'pointer' }} onClick={signOut}>
            <LogoutIcon sx={{ fontSize: 18, color: '#c96a88' }} />
            <Typography variant='body2' fontWeight={500} color='#c96a88'>로그아웃</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* 프로필 수정 다이얼로그 */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth='xs' PaperProps={{ sx: { borderRadius: 4, mx: 2 } }}>
        <DialogTitle sx={{ color: '#5a3040' }}>프로필 수정</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField size='small' label='이름' value={displayName} onChange={e => setDisplayName(e.target.value)} fullWidth />
            <TextField size='small' label='소개글' value={bio} onChange={e => setBio(e.target.value)} fullWidth multiline rows={2} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: 'text.secondary' }}>취소</Button>
          <Button onClick={updateProfile} variant='contained' disabled={loading}>{loading ? <CircularProgress size={18} /> : '저장'}</Button>
        </DialogActions>
      </Dialog>

      {/* 커플 연결 다이얼로그 */}
      <Dialog open={coupleOpen} onClose={() => setCoupleOpen(false)} fullWidth maxWidth='xs' PaperProps={{ sx: { borderRadius: 4, mx: 2 } }}>
        <DialogTitle sx={{ color: '#5a3040' }}>커플 연결</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' mb={2}>파트너의 커플 코드를 입력하거나, 혼자 시작할 수 있어요.</Typography>
          <TextField size='small' label='파트너 커플 코드' value={partnerCode} onChange={e => setPartnerCode(e.target.value)}
            fullWidth placeholder='XXXXXXXX' inputProps={{ style: { textTransform: 'uppercase', letterSpacing: 3 } }} />
          {msg && <Alert severity='error' sx={{ mt: 1, borderRadius: 2 }}>{msg}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexDirection: 'column', gap: 1 }}>
          <Button onClick={connectCouple} variant='contained' fullWidth disabled={!partnerCode || loading}>
            {loading ? <CircularProgress size={18} /> : '파트너 코드로 연결'}
          </Button>
          <Button onClick={createSoloCouple} fullWidth sx={{ color: 'text.secondary' }}>혼자 시작하기</Button>
        </DialogActions>
      </Dialog>

      {/* 예식 정보 수정 다이얼로그 */}
      <Dialog open={weddingOpen} onClose={() => setWeddingOpen(false)} fullWidth maxWidth='xs' PaperProps={{ sx: { borderRadius: 4, mx: 2 } }}>
        <DialogTitle sx={{ color: '#5a3040' }}>예식 정보 설정</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField size='small' label='결혼식 날짜' type='date' value={weddingDate} onChange={e => setWeddingDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField size='small' label='예식 장소' value={venue} onChange={e => setVenue(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setWeddingOpen(false)} sx={{ color: 'text.secondary' }}>취소</Button>
          <Button onClick={updateWedding} variant='contained' disabled={loading}>{loading ? <CircularProgress size={18} /> : '저장'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
