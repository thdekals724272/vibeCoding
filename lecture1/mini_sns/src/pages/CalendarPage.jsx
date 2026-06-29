import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Fab, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Button, Stack,
  IconButton, Chip, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const SCHEDULE_COLORS = ['#F7C9D4', '#DCEEFF', '#FFF5C8', '#DCEFD8', '#E8D5FF'];

export default function CalendarPage() {
  const { couple } = useAuth();
  const [current, setCurrent] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [selected, setSelected] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', schedule_date: format(new Date(), 'yyyy-MM-dd'), start_time: '', end_time: '', location: '', memo: '' });

  useEffect(() => { if (couple?.id) load(); }, [couple, current]);

  async function load() {
    setLoading(true);
    const start = format(startOfMonth(current), 'yyyy-MM-dd');
    const end = format(endOfMonth(current), 'yyyy-MM-dd');
    const { data } = await supabase.from('schedules').select('*')
      .eq('couple_id', couple.id).gte('schedule_date', start).lte('schedule_date', end).order('start_time');
    setSchedules(data || []);
    setLoading(false);
  }

  async function addSchedule() {
    if (!form.title.trim()) return;
    const { data } = await supabase.from('schedules').insert({
      couple_id: couple.id, ...form,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
    }).select().single();
    if (data) setSchedules(prev => [...prev, data]);
    setForm({ title: '', schedule_date: format(selected, 'yyyy-MM-dd'), start_time: '', end_time: '', location: '', memo: '' });
    setOpen(false);
  }

  async function deleteSchedule(id) {
    await supabase.from('schedules').delete().eq('id', id);
    setSchedules(prev => prev.filter(s => s.id !== id));
  }

  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) });
  const startDay = startOfMonth(current).getDay();
  const selectedDaySchedules = schedules.filter(s => s.schedule_date === format(selected, 'yyyy-MM-dd'));

  function hasSchedule(day) {
    return schedules.some(s => s.schedule_date === format(day, 'yyyy-MM-dd'));
  }

  if (!couple) return (
    <Box sx={{ p: 3, textAlign: 'center', mt: 8 }}>
      <Typography color='text.secondary'>마이페이지에서 커플 정보를 먼저 설정해주세요 💕</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 2, pb: 2 }}>
      <Typography variant='h6' color='#5a3040' sx={{ mb: 2, pt: 1 }}>일정 관리</Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <IconButton size='small' onClick={() => setCurrent(subMonths(current, 1))}><ChevronLeftIcon /></IconButton>
            <Typography variant='subtitle1' fontWeight={600} color='#5a3040'>
              {format(current, 'yyyy년 M월', { locale: ko })}
            </Typography>
            <IconButton size='small' onClick={() => setCurrent(addMonths(current, 1))}><ChevronRightIcon /></IconButton>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1 }}>
            {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
              <Typography key={d} variant='caption' textAlign='center' color={i === 0 ? '#c96a88' : i === 6 ? '#4a7cbf' : 'text.secondary'} fontWeight={600}>
                {d}
              </Typography>
            ))}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
            {Array(startDay).fill(null).map((_, i) => <Box key={`empty-${i}`} />)}
            {days.map((day, idx) => {
              const isSelected = isSameDay(day, selected);
              const isToday = isSameDay(day, new Date());
              const hasSch = hasSchedule(day);
              return (
                <Box key={idx} onClick={() => { setSelected(day); setForm(f => ({ ...f, schedule_date: format(day, 'yyyy-MM-dd') })); }}
                  sx={{
                    aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', borderRadius: '50%', cursor: 'pointer',
                    bgcolor: isSelected ? '#F7C9D4' : isToday ? '#FFE8EF' : 'transparent',
                    position: 'relative',
                  }}>
                  <Typography variant='caption' fontWeight={isSelected || isToday ? 700 : 400}
                    color={day.getDay() === 0 ? '#c96a88' : day.getDay() === 6 ? '#4a7cbf' : 'text.primary'}>
                    {format(day, 'd')}
                  </Typography>
                  {hasSch && <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#c96a88', position: 'absolute', bottom: 2 }} />}
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant='subtitle1' fontWeight={600} color='#5a3040'>
          {format(selected, 'M월 d일 EEEE', { locale: ko })} 일정
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress sx={{ color: '#F7C9D4' }} size={24} /></Box>
      ) : (
        <Stack spacing={1}>
          {selectedDaySchedules.map((s, idx) => (
            <Card key={s.id} sx={{ borderLeft: `4px solid ${SCHEDULE_COLORS[idx % SCHEDULE_COLORS.length]}` }}>
              <CardContent sx={{ py: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='body2' fontWeight={600}>{s.title}</Typography>
                  {s.start_time && (
                    <Typography variant='caption' color='text.secondary'>
                      {s.start_time.slice(0, 5)}{s.end_time ? ` ~ ${s.end_time.slice(0, 5)}` : ''}
                    </Typography>
                  )}
                  {s.location && <Typography variant='caption' color='text.secondary' display='block'>📍 {s.location}</Typography>}
                </Box>
                <IconButton size='small' onClick={() => deleteSchedule(s.id)}>
                  <DeleteIcon fontSize='small' sx={{ color: '#ddd' }} />
                </IconButton>
              </CardContent>
            </Card>
          ))}
          {selectedDaySchedules.length === 0 && (
            <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 2 }}>이 날 일정이 없어요</Typography>
          )}
        </Stack>
      )}

      <Fab size='medium' sx={{ position: 'fixed', bottom: 80, right: 20 }} onClick={() => setOpen(true)}>
        <AddIcon />
      </Fab>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='xs' PaperProps={{ sx: { borderRadius: 4, mx: 2 } }}>
        <DialogTitle sx={{ pb: 1, color: '#5a3040' }}>일정 추가</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField size='small' label='일정 제목' value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth />
            <TextField size='small' label='날짜' type='date' value={form.schedule_date} onChange={e => setForm({ ...form, schedule_date: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField size='small' label='시작 시간' type='time' value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField size='small' label='종료 시간' type='time' value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            </Box>
            <TextField size='small' label='장소' value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} fullWidth />
            <TextField size='small' label='메모' value={form.memo} onChange={e => setForm({ ...form, memo: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'text.secondary' }}>취소</Button>
          <Button onClick={addSchedule} variant='contained'>추가</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
