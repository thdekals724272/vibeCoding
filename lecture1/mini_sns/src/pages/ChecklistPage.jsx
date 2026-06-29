import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Checkbox, IconButton,
  Fab, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, LinearProgress, Stack, Chip,
  CircularProgress, Divider, Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['예식장', '스드메', '스냅', '한복', '청첩장', '신혼여행', '가전/가구', '기타'];
const CATEGORY_COLORS = {
  '예식장': '#DCEEFF', '스드메': '#FFE8EF', '스냅': '#FFF5C8',
  '한복': '#DCEFD8', '청첩장': '#F7C9D4', '신혼여행': '#E8D5FF',
  '가전/가구': '#D5E8FF', '기타': '#F0F0F0',
};

const TEMPLATES = {
  '예식장': [
    { title: '예식장 견학 및 상담', memo: '웨딩홀, 성당, 교회, 야외 등 타입 결정' },
    { title: '예식장 계약', memo: '계약금 납부 확인' },
    { title: '예식 시간 확정', memo: '' },
    { title: '식순 계획', memo: '사회자, 축가, 영상 순서 정하기' },
    { title: '하객 식사 메뉴 결정', memo: '' },
    { title: '청첩장 발송', memo: '예식 2~3달 전 발송 권장' },
  ],
  '스드메': [
    { title: '드레스샵 투어', memo: '최소 3~4곳 비교 추천' },
    { title: '드레스 계약', memo: '' },
    { title: '드레스 1차 피팅', memo: '' },
    { title: '드레스 2차 피팅', memo: '' },
    { title: '메이크업샵 결정', memo: '' },
    { title: '메이크업 리허설', memo: '예식 1~2달 전 진행' },
    { title: '헤어스타일 결정', memo: '' },
  ],
  '스냅': [
    { title: '스냅 작가 섭외', memo: '포트폴리오 비교 후 결정' },
    { title: '스냅 촬영 날짜/장소 확정', memo: '' },
    { title: '스냅 촬영 의상 준비', memo: '' },
    { title: '스냅 원본 사진 수령', memo: '' },
  ],
  '한복': [
    { title: '한복 대여/구매 결정', memo: '' },
    { title: '한복 피팅', memo: '' },
    { title: '한복 수령', memo: '예식 전날 수령 권장' },
  ],
  '청첩장': [
    { title: '청첩장 디자인 선택', memo: '' },
    { title: '청첩장 문구 작성', memo: '' },
    { title: '청첩장 인쇄 주문', memo: '예식 2달 전 주문 권장' },
    { title: '청첩장 수령', memo: '' },
    { title: '청첩장 발송 (지인)', memo: '' },
    { title: '모바일 청첩장 제작', memo: '' },
  ],
  '신혼여행': [
    { title: '신혼여행지 결정', memo: '' },
    { title: '항공권 예약', memo: '일찍 예약할수록 저렴' },
    { title: '숙소 예약', memo: '' },
    { title: '여행 일정 계획', memo: '' },
    { title: '여권 유효기간 확인', memo: '6개월 이상 남아 있어야 함' },
  ],
  '가전/가구': [
    { title: '신혼집 결정', memo: '' },
    { title: '냉장고 구매', memo: '' },
    { title: '세탁기 구매', memo: '' },
    { title: '에어컨 구매', memo: '' },
    { title: '침대/매트리스 구매', memo: '' },
    { title: '소파 구매', memo: '' },
    { title: '식탁 구매', memo: '' },
  ],
  '기타': [
    { title: '상견례', memo: '양가 부모님 첫 만남' },
    { title: '예물/예단 준비', memo: '' },
    { title: '결혼 준비 예산 확정', memo: '' },
    { title: '주례 섭외', memo: '' },
    { title: '축가 섭외', memo: '' },
    { title: '웨딩 영상 촬영 섭외', memo: '' },
    { title: '혼인신고', memo: '예식 전후 진행 가능' },
  ],
};

export default function ChecklistPage() {
  const { couple } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', category: '기타', memo: '' });
  const [filter, setFilter] = useState('전체');
  const [selected, setSelected] = useState({});
  const [expanded, setExpanded] = useState({ '예식장': true });
  const [adding, setAdding] = useState(false);

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

  function openTemplate() {
    const initial = {};
    CATEGORIES.forEach(cat => {
      TEMPLATES[cat].forEach((_, idx) => { initial[`${cat}-${idx}`] = true; });
    });
    setSelected(initial);
    setExpanded({ '예식장': true });
    setTemplateOpen(true);
  }

  function toggleItem(key) {
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleCategory(cat) {
    const keys = TEMPLATES[cat].map((_, idx) => `${cat}-${idx}`);
    const allOn = keys.every(k => selected[k]);
    const next = { ...selected };
    keys.forEach(k => { next[k] = !allOn; });
    setSelected(next);
  }

  function isCategoryAllSelected(cat) {
    return TEMPLATES[cat].every((_, idx) => selected[`${cat}-${idx}`]);
  }

  function isCategoryPartialSelected(cat) {
    const keys = TEMPLATES[cat].map((_, idx) => `${cat}-${idx}`);
    const onCount = keys.filter(k => selected[k]).length;
    return onCount > 0 && onCount < keys.length;
  }

  async function applyTemplate() {
    setAdding(true);
    const toInsert = [];
    CATEGORIES.forEach(cat => {
      TEMPLATES[cat].forEach((item, idx) => {
        if (selected[`${cat}-${idx}`]) {
          toInsert.push({ couple_id: couple.id, title: item.title, category: cat, memo: item.memo });
        }
      });
    });
    if (toInsert.length > 0) {
      const { data } = await supabase.from('checklists').insert(toInsert).select();
      if (data) setItems(prev => [...prev, ...data]);
    }
    setAdding(false);
    setTemplateOpen(false);
  }

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const filtered = filter === '전체' ? items : filter === '완료' ? items.filter(i => i.is_done) : items.filter(i => !i.is_done && i.category === filter);
  const progress = items.length > 0 ? Math.round((items.filter(i => i.is_done).length / items.length) * 100) : 0;

  if (!couple) return (
    <Box sx={{ p: 3, textAlign: 'center', mt: 8 }}>
      <Typography color='text.secondary'>마이페이지에서 커플 정보를 먼저 설정해주세요 💕</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 2, pb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pt: 1 }}>
        <Typography variant='h6' color='#5a3040'>체크리스트</Typography>
        <Button
          size='small'
          startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
          onClick={openTemplate}
          sx={{
            bgcolor: '#FFF5C8', color: '#5a4a00', borderRadius: 3,
            fontWeight: 600, fontSize: 12, px: 1.5, py: 0.5,
            '&:hover': { bgcolor: '#FFE88A' },
          }}
        >
          템플릿 불러오기
        </Button>
      </Box>

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
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Typography variant='body2' color='text.secondary'>항목이 없어요</Typography>
              <Button size='small' startIcon={<AutoAwesomeIcon />} onClick={openTemplate}
                sx={{ mt: 1.5, bgcolor: '#FFF5C8', color: '#5a4a00', borderRadius: 3, fontWeight: 600, '&:hover': { bgcolor: '#FFE88A' } }}>
                템플릿으로 시작하기
              </Button>
            </Box>
          )}
        </Stack>
      )}

      <Fab size='medium' sx={{ position: 'fixed', bottom: 80, right: 20 }} onClick={() => setOpen(true)}>
        <AddIcon />
      </Fab>

      {/* 직접 추가 다이얼로그 */}
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

      {/* 템플릿 다이얼로그 */}
      <Dialog open={templateOpen} onClose={() => setTemplateOpen(false)} fullWidth maxWidth='xs'
        PaperProps={{ sx: { borderRadius: 4, mx: 2, maxHeight: '85vh' } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: '#c96a88', fontSize: 20 }} />
            <Typography variant='h6' color='#5a3040'>결혼 준비 템플릿</Typography>
          </Box>
          <Typography variant='caption' color='text.secondary'>
            원하는 항목을 선택해서 한 번에 추가하세요
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ px: 2, py: 1 }}>
          {CATEGORIES.map(cat => (
            <Box key={cat} sx={{ mb: 0.5 }}>
              <Box
                onClick={() => setExpanded(prev => ({ ...prev, [cat]: !prev[cat] }))}
                sx={{ display: 'flex', alignItems: 'center', py: 1, cursor: 'pointer', borderRadius: 2, px: 1, '&:hover': { bgcolor: '#FFF5F7' } }}
              >
                <Checkbox
                  checked={isCategoryAllSelected(cat)}
                  indeterminate={isCategoryPartialSelected(cat)}
                  onChange={() => toggleCategory(cat)}
                  onClick={e => e.stopPropagation()}
                  sx={{ p: 0.5, color: '#F7C9D4', '&.Mui-checked': { color: '#c96a88' }, '&.MuiCheckbox-indeterminate': { color: '#c96a88' } }}
                />
                <Chip label={cat} size='small'
                  sx={{ bgcolor: CATEGORY_COLORS[cat], fontSize: 11, height: 22, mr: 1, fontWeight: 600 }} />
                <Typography variant='caption' color='text.secondary' sx={{ flex: 1 }}>
                  {TEMPLATES[cat].filter((_, idx) => selected[`${cat}-${idx}`]).length}/{TEMPLATES[cat].length}
                </Typography>
                {expanded[cat] ? <ExpandLessIcon sx={{ fontSize: 18, color: 'text.secondary' }} /> : <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
              </Box>
              <Collapse in={!!expanded[cat]}>
                <Box sx={{ pl: 2 }}>
                  {TEMPLATES[cat].map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', py: 0.5 }}>
                      <Checkbox
                        checked={!!selected[`${cat}-${idx}`]}
                        onChange={() => toggleItem(`${cat}-${idx}`)}
                        size='small'
                        sx={{ p: 0.5, color: '#F7C9D4', '&.Mui-checked': { color: '#c96a88' } }}
                      />
                      <Box sx={{ pt: 0.5 }}>
                        <Typography variant='body2' color='text.primary'>{item.title}</Typography>
                        {item.memo && <Typography variant='caption' color='text.secondary'>{item.memo}</Typography>}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Collapse>
              <Divider sx={{ mt: 0.5 }} />
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexDirection: 'column', gap: 1 }}>
          <Button
            onClick={applyTemplate}
            variant='contained'
            fullWidth
            disabled={selectedCount === 0 || adding}
            sx={{ py: 1.2, fontSize: '0.95rem' }}
          >
            {adding
              ? <CircularProgress size={20} sx={{ color: '#5a3040' }} />
              : `선택한 ${selectedCount}개 항목 추가하기`}
          </Button>
          <Button onClick={() => setTemplateOpen(false)} fullWidth sx={{ color: 'text.secondary' }}>취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
