import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Checkbox, IconButton,
  Fab, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, LinearProgress, Stack, Chip,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['예식장', '스드메', '스냅', '한복', '청첩장', '신혼여행', '가전/가구', '기타'];
const CATEGORY_COLORS = {
  '예식장': '#DCEEFF', '스드메': '#FFE8EF', '스냅': '#FFF5C8',
  '한복': '#DCEFD8', '청첩장': '#F7C9D4', '신혼여행': '#E8D5FF',
  '가전/가구': '#D5E8FF', '기타': '#F0F0F0',
};

export default function ChecklistPage() {
  const { couple } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', category: '기타', memo: '' });
  const [filter, setFilter] = useState('전체');

  useEffect(() => { if (couple?.id) load(); }, [couple]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('checklists').select('*')
      .eq('couple_id', couple.id).order('created_at', { ascending: true });
    setItems(data || []);
    setLoading(false);
  }

  async function toggleDone(item) {
    await supabase.from('checklists').update({ is_done: !item.is_done }).eq('id', item.id);
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_done: !i.is_done } : i));
  }

  async function addItem() {
    if (!form.title.trim()) return;
    const { data } = await supabase.from('checklists').insert({
      couple_id: couple.id, title: form.title, category: form.category, memo: form.memo,
    }).select().single();
    if (data) setItems(prev => [...prev, data]);
    setForm({ title: '', category: '기타', memo: '' });
    setOpen(false);
  }

  async function deleteItem(id) {
    await supabase.from('checklists').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const filtered = filter === '전체' ? items : filter === '완료' ? items.filter(i => i.is_done) : items.filter(i => !i.is_done && i.category === filter);
  const progress = items.length > 0 ? Math.round((items.filter(i => i.is_done).length / items.length) * 100) : 0;

  if (!couple) return (
    <Box sx={{ p: 3, textAlign: 'center', mt: 8 }}>
      <Typography color='text.secondary'>마이페이지에서 커플 정보를 먼저 설정해주세요 💕</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 2, pb: 2 }}>
      <Typography variant='h6' color='#5a3040' sx={{ mb: 2, pt: 1 }}>체크리스트</Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant='body2' color='text.secondary'>진행률</Typography>
            <Typography variant='body2' fontWeight={700} color='#c96a88'>{progress}%</Typography>
          </Box>
          <LinearProgress variant='determinate' value={progress}
            sx={{ height: 8, borderRadius: 4, bgcolor: '#FFE8EF', '& .MuiLinearProgress-bar': { bgcolor: '#F7C9D4' } }} />
          <Typography variant='caption' color='text.secondary' mt={0.5} display='block'>
            {items.filter(i => i.is_done).length} / {items.length} 완료
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', pb: 0.5 }}>
        {['전체', '완료', ...CATEGORIES].map(c => (
          <Chip key={c} label={c} size='small' onClick={() => setFilter(c)}
            sx={{ flexShrink: 0, bgcolor: filter === c ? '#F7C9D4' : '#F5F5F5', color: filter === c ? '#5a3040' : 'text.secondary', fontWeight: filter === c ? 700 : 400 }} />
        ))}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress sx={{ color: '#F7C9D4' }} /></Box>
      ) : (
        <Stack spacing={1}>
          {filtered.map(item => (
            <Card key={item.id} sx={{ opacity: item.is_done ? 0.6 : 1 }}>
              <CardContent sx={{ py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Checkbox checked={item.is_done} onChange={() => toggleDone(item)}
                  sx={{ p: 0.5, color: '#F7C9D4', '&.Mui-checked': { color: '#c96a88' } }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant='body2' sx={{ textDecoration: item.is_done ? 'line-through' : 'none', color: item.is_done ? 'text.secondary' : 'text.primary' }}>
                    {item.title}
                  </Typography>
                  {item.memo && <Typography variant='caption' color='text.secondary'>{item.memo}</Typography>}
                </Box>
                <Chip label={item.category} size='small'
                  sx={{ bgcolor: CATEGORY_COLORS[item.category] || '#F0F0F0', fontSize: 10, height: 20 }} />
                <IconButton size='small' onClick={() => deleteItem(item.id)}>
                  <DeleteIcon fontSize='small' sx={{ color: '#ddd' }} />
                </IconButton>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', mt: 4 }}>
              항목을 추가해보세요 ✨
            </Typography>
          )}
        </Stack>
      )}

      <Fab size='medium' sx={{ position: 'fixed', bottom: 80, right: 20 }} onClick={() => setOpen(true)}>
        <AddIcon />
      </Fab>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='xs'
        PaperProps={{ sx: { borderRadius: 4, mx: 2 } }}>
        <DialogTitle sx={{ pb: 1, color: '#5a3040' }}>항목 추가</DialogTitle>
        <DialogContent>
          <TextField fullWidth label='항목명' value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            sx={{ mt: 1, mb: 2 }} size='small' />
          <TextField select fullWidth label='카테고리' value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })} sx={{ mb: 2 }} size='small'>
            {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <TextField fullWidth label='메모 (선택)' value={form.memo} onChange={e => setForm({ ...form, memo: e.target.value })} size='small' />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'text.secondary' }}>취소</Button>
          <Button onClick={addItem} variant='contained'>추가</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
