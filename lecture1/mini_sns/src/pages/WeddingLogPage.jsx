import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, CardMedia, Fab, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Button, Stack, Chip,
  IconButton, CircularProgress, Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const TAG_OPTIONS = ['상견례', '드레스투어', '스냅촬영', '예식장투어', '한복', '부케', '청첩장', '신혼여행', '기타'];

export default function WeddingLogPage() {
  const { couple, profile } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', photo_url: '', tags: [], log_date: format(new Date(), 'yyyy-MM-dd') });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => { if (couple?.id) load(); }, [couple]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('wedding_logs').select('*, users(display_name, avatar_url)')
      .eq('couple_id', couple.id).order('log_date', { ascending: false });
    setLogs(data || []);
    setLoading(false);
  }

  async function addLog() {
    if (!form.title.trim()) return;
    const { data } = await supabase.from('wedding_logs').insert({
      couple_id: couple.id,
      author_id: profile?.id,
      title: form.title,
      content: form.content,
      photo_url: form.photo_url || null,
      tags: form.tags,
      log_date: form.log_date,
    }).select('*, users(display_name, avatar_url)').single();
    if (data) setLogs(prev => [data, ...prev]);
    setForm({ title: '', content: '', photo_url: '', tags: [], log_date: format(new Date(), 'yyyy-MM-dd') });
    setOpen(false);
  }

  async function deleteLog(id) {
    await supabase.from('wedding_logs').delete().eq('id', id);
    setLogs(prev => prev.filter(l => l.id !== id));
  }

  function toggleTag(tag) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }));
  }

  if (!couple) return (
    <Box sx={{ p: 3, textAlign: 'center', mt: 8 }}>
      <Typography color='text.secondary'>마이페이지에서 커플 정보를 먼저 설정해주세요 💕</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 2, pb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pt: 1 }}>
        <AutoStoriesIcon sx={{ color: '#F7C9D4' }} />
        <Typography variant='h6' color='#5a3040'>웨딩 로그</Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress sx={{ color: '#F7C9D4' }} /></Box>
      ) : logs.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography fontSize={48}>📖</Typography>
          <Typography variant='body1' color='text.secondary' mt={1}>결혼 준비 기록을 시작해보세요</Typography>
          <Typography variant='body2' color='text.secondary'>소중한 순간들을 일기처럼 남겨요 ✨</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {logs.map((log, idx) => (
            <Box key={log.id} sx={{ position: 'relative' }}>
              {idx < logs.length - 1 && (
                <Box sx={{ position: 'absolute', left: 20, top: '100%', width: 2, height: 16, bgcolor: '#FFE8EF', zIndex: 0 }} />
              )}
              <Card sx={{ position: 'relative', zIndex: 1 }}>
                {log.photo_url && (
                  <CardMedia component='img' height='160' image={log.photo_url}
                    sx={{ objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                )}
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant='body1' fontWeight={700} color='#5a3040'>{log.title}</Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {log.log_date} · {log.users?.display_name || ''}
                      </Typography>
                    </Box>
                    <IconButton size='small' onClick={() => deleteLog(log.id)}>
                      <DeleteIcon fontSize='small' sx={{ color: '#ddd' }} />
                    </IconButton>
                  </Box>
                  {log.content && (
                    <Typography variant='body2' color='text.secondary' sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>{log.content}</Typography>
                  )}
                  {log.tags?.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {log.tags.map(tag => (
                        <Chip key={tag} label={`#${tag}`} size='small'
                          sx={{ bgcolor: '#FFE8EF', color: '#c96a88', fontSize: 11, height: 20 }} />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Stack>
      )}

      <Fab size='medium' sx={{ position: 'fixed', bottom: 80, right: 20 }} onClick={() => setOpen(true)}>
        <AddIcon />
      </Fab>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='xs' PaperProps={{ sx: { borderRadius: 4, mx: 2 } }}>
        <DialogTitle sx={{ pb: 1, color: '#5a3040' }}>로그 작성</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField size='small' label='제목' value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth />
            <TextField size='small' label='날짜' type='date' value={form.log_date} onChange={e => setForm({ ...form, log_date: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField size='small' label='내용' value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} fullWidth multiline rows={3} />
            <TextField size='small' label='사진 URL (선택)' value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} fullWidth placeholder='https://...' />
            <Box>
              <Typography variant='caption' color='text.secondary' mb={1} display='block'>태그 선택</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {TAG_OPTIONS.map(tag => (
                  <Chip key={tag} label={tag} size='small' onClick={() => toggleTag(tag)}
                    sx={{ bgcolor: form.tags.includes(tag) ? '#F7C9D4' : '#F5F5F5', color: form.tags.includes(tag) ? '#5a3040' : 'text.secondary', cursor: 'pointer' }} />
                ))}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'text.secondary' }}>취소</Button>
          <Button onClick={addLog} variant='contained'>작성</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
