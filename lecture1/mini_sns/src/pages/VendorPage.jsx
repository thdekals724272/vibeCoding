import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Fab, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Button, MenuItem,
  Stack, Chip, IconButton, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['웨딩홀', '스냅', '드레스', '메이크업', '한복', '청첩장', '부케', '기타'];
const STATUSES = ['미정', '상담예정', '계약 완료'];
const STATUS_COLORS = { '미정': '#F0F0F0', '상담예정': '#FFF5C8', '계약 완료': '#DCEFD8' };
const CATEGORY_COLORS = {
  '웨딩홀': '#FFE8EF', '스냅': '#DCEEFF', '드레스': '#F7C9D4', '메이크업': '#FFF5C8',
  '한복': '#DCEFD8', '청첩장': '#E8D5FF', '부케': '#FFE8D5', '기타': '#F0F0F0',
};

export default function VendorPage() {
  const { couple } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('전체');
  const [form, setForm] = useState({
    vendor_name: '', category: '웨딩홀', contact: '', address: '',
    consultation_date: '', contract_status: '미정', deposit_amount: '', balance_amount: '', memo: '',
  });

  useEffect(() => { if (couple?.id) load(); }, [couple]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('vendors').select('*').eq('couple_id', couple.id).order('created_at');
    setVendors(data || []);
    setLoading(false);
  }

  async function addVendor() {
    if (!form.vendor_name.trim()) return;
    const { data } = await supabase.from('vendors').insert({
      couple_id: couple.id, ...form,
      deposit_amount: Number(form.deposit_amount) || 0,
      balance_amount: Number(form.balance_amount) || 0,
      consultation_date: form.consultation_date || null,
    }).select().single();
    if (data) setVendors(prev => [...prev, data]);
    setForm({ vendor_name: '', category: '웨딩홀', contact: '', address: '', consultation_date: '', contract_status: '미정', deposit_amount: '', balance_amount: '', memo: '' });
    setOpen(false);
  }

  async function deleteVendor(id) {
    await supabase.from('vendors').delete().eq('id', id);
    setVendors(prev => prev.filter(v => v.id !== id));
  }

  const filtered = filter === '전체' ? vendors : vendors.filter(v => v.category === filter);

  if (!couple) return (
    <Box sx={{ p: 3, textAlign: 'center', mt: 8 }}>
      <Typography color='text.secondary'>마이페이지에서 커플 정보를 먼저 설정해주세요 💕</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 2, pb: 2 }}>
      <Typography variant='h6' color='#5a3040' sx={{ mb: 2, pt: 1 }}>업체 관리</Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', pb: 0.5 }}>
        {['전체', ...CATEGORIES].map(c => (
          <Chip key={c} label={c} size='small' onClick={() => setFilter(c)} sx={{ flexShrink: 0,
            bgcolor: filter === c ? '#F7C9D4' : '#F5F5F5', color: filter === c ? '#5a3040' : 'text.secondary',
            fontWeight: filter === c ? 700 : 400 }} />
        ))}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress sx={{ color: '#F7C9D4' }} /></Box>
      ) : (
        <Stack spacing={1.5}>
          {filtered.map(vendor => (
            <Card key={vendor.id}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant='body1' fontWeight={700}>{vendor.vendor_name}</Typography>
                      <Chip label={vendor.category} size='small'
                        sx={{ bgcolor: CATEGORY_COLORS[vendor.category], fontSize: 10, height: 20 }} />
                    </Box>
                    <Chip label={vendor.contract_status} size='small'
                      sx={{ bgcolor: STATUS_COLORS[vendor.contract_status], fontSize: 11, height: 22, mb: 0.5 }} />
                  </Box>
                  <IconButton size='small' onClick={() => deleteVendor(vendor.id)}>
                    <DeleteIcon fontSize='small' sx={{ color: '#ddd' }} />
                  </IconButton>
                </Box>

                <Stack spacing={0.5}>
                  {vendor.contact && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant='caption' color='text.secondary'>{vendor.contact}</Typography>
                    </Box>
                  )}
                  {vendor.consultation_date && (
                    <Typography variant='caption' color='text.secondary'>📅 상담일: {vendor.consultation_date}</Typography>
                  )}
                  {(vendor.deposit_amount > 0 || vendor.balance_amount > 0) && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Typography variant='caption' color='text.secondary'>계약금: {(vendor.deposit_amount || 0).toLocaleString()}원</Typography>
                      <Typography variant='caption' color='text.secondary'>잔금: {(vendor.balance_amount || 0).toLocaleString()}원</Typography>
                    </Box>
                  )}
                  {vendor.memo && <Typography variant='caption' color='text.secondary' display='block'>{vendor.memo}</Typography>}
                </Stack>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', mt: 4 }}>업체를 등록해보세요 🏪</Typography>
          )}
        </Stack>
      )}

      <Fab size='medium' sx={{ position: 'fixed', bottom: 80, right: 20 }} onClick={() => setOpen(true)}>
        <AddIcon />
      </Fab>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='xs' PaperProps={{ sx: { borderRadius: 4, mx: 2 } }}>
        <DialogTitle sx={{ pb: 1, color: '#5a3040' }}>업체 등록</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField size='small' label='업체명' value={form.vendor_name} onChange={e => setForm({ ...form, vendor_name: e.target.value })} fullWidth />
            <TextField select size='small' label='카테고리' value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} fullWidth>
              {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <TextField size='small' label='연락처' value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} fullWidth />
            <TextField size='small' label='주소' value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} fullWidth />
            <TextField size='small' label='상담일' type='date' value={form.consultation_date} onChange={e => setForm({ ...form, consultation_date: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField select size='small' label='계약 여부' value={form.contract_status} onChange={e => setForm({ ...form, contract_status: e.target.value })} fullWidth>
              {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size='small' label='계약금 (원)' type='number' value={form.deposit_amount} onChange={e => setForm({ ...form, deposit_amount: e.target.value })} fullWidth />
              <TextField size='small' label='잔금 (원)' type='number' value={form.balance_amount} onChange={e => setForm({ ...form, balance_amount: e.target.value })} fullWidth />
            </Box>
            <TextField size='small' label='메모' value={form.memo} onChange={e => setForm({ ...form, memo: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'text.secondary' }}>취소</Button>
          <Button onClick={addVendor} variant='contained'>등록</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
