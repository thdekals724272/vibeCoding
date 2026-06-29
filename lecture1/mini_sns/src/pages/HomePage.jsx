import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, LinearProgress,
  Chip, IconButton, Stack,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function HomePage() {
  const { profile, couple } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, done: 0 });
  const [budget, setBudget] = useState({ estimated: 0, actual: 0 });
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  const dday = couple?.wedding_date
    ? differenceInDays(parseISO(couple.wedding_date), new Date())
    : null;

  useEffect(() => {
    if (!couple?.id) return;
    loadStats();
  }, [couple]);

  async function loadStats() {
    const today = format(new Date(), 'yyyy-MM-dd');

    const [{ data: cl }, { data: bd }, { data: sc }, { data: lg }] = await Promise.all([
      supabase.from('checklists').select('is_done').eq('couple_id', couple.id),
      supabase.from('budgets').select('estimated_amount,actual_amount').eq('couple_id', couple.id),
      supabase.from('schedules').select('*').eq('couple_id', couple.id).eq('schedule_date', today),
      supabase.from('wedding_logs').select('*').eq('couple_id', couple.id).order('created_at', { ascending: false }).limit(3),
    ]);

    if (cl) setStats({ total: cl.length, done: cl.filter(c => c.is_done).length });
    if (bd) setBudget({
      estimated: bd.reduce((s, b) => s + (b.estimated_amount || 0), 0),
      actual: bd.reduce((s, b) => s + (b.actual_amount || 0), 0),
    });
    if (sc) setTodaySchedules(sc);
    if (lg) setRecentLogs(lg);
  }

  const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  function SectionHeader({ title, path }) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant='subtitle1' fontWeight={600} color='text.primary'>{title}</Typography>
        {path && (
          <IconButton size='small' onClick={() => navigate(path)}>
            <ArrowForwardIosIcon sx={{ fontSize: 14, color: '#c96a88' }} />
          </IconButton>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 2 }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, pt: 1 }}>
        <Box>
          <Typography variant='h6' color='#5a3040'>
            안녕하세요, {profile?.display_name || ''}님 💕
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {format(new Date(), 'M월 d일 EEEE', { locale: ko })}
          </Typography>
        </Box>
        <FavoriteIcon sx={{ color: '#F7C9D4', fontSize: 32 }} />
      </Box>

      {/* D-Day */}
      <Card sx={{ background: 'linear-gradient(135deg, #F7C9D4 0%, #DCEEFF 100%)', mb: 2 }}>
        <CardContent sx={{ py: 2.5, textAlign: 'center' }}>
          {couple?.wedding_date ? (
            <>
              <Typography variant='h3' fontWeight={700} color='#5a3040'>
                {dday === 0 ? 'D-Day!' : dday > 0 ? `D-${dday}` : `D+${Math.abs(dday)}`}
              </Typography>
              <Typography variant='body2' color='#5a3040' mt={0.5}>
                {couple.venue ? `💒 ${couple.venue}` : '결혼식 날짜가 설정되었어요'}
              </Typography>
              <Typography variant='caption' color='#7a6a70'>
                {format(parseISO(couple.wedding_date), 'yyyy년 M월 d일 EEEE', { locale: ko })}
              </Typography>
            </>
          ) : (
            <Box onClick={() => navigate('/my')} sx={{ cursor: 'pointer' }}>
              <Typography variant='body1' color='#5a3040' fontWeight={600}>💍 결혼식 날짜를 설정해보세요</Typography>
              <Typography variant='caption' color='#7a6a70'>마이페이지에서 설정 가능해요</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 체크리스트 진행률 */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <SectionHeader title='체크리스트 진행률' path='/checklist' />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LinearProgress variant='determinate' value={progress}
              sx={{ flex: 1, height: 10, borderRadius: 5, bgcolor: '#FFE8EF', '& .MuiLinearProgress-bar': { bgcolor: '#F7C9D4' } }} />
            <Typography variant='body2' fontWeight={600} color='#c96a88'>{progress}%</Typography>
          </Box>
          <Typography variant='caption' color='text.secondary' mt={0.5} display='block'>
            전체 {stats.total}개 중 {stats.done}개 완료
          </Typography>
        </CardContent>
      </Card>

      {/* 오늘의 일정 */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <SectionHeader title='오늘의 일정' path='/calendar' />
          {todaySchedules.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>오늘 일정이 없어요 🌸</Typography>
          ) : (
            <Stack spacing={1}>
              {todaySchedules.map(s => (
                <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip label={s.start_time ? s.start_time.slice(0, 5) : '종일'} size='small'
                    sx={{ bgcolor: '#DCEEFF', color: '#1a3a5c', fontSize: 11, height: 22 }} />
                  <Typography variant='body2' color='text.primary'>{s.title}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* 이번 달 예산 */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ py: 2 }}>
          <SectionHeader title='예산 현황' path='/budget' />
          <Stack direction='row' spacing={2}>
            <Box sx={{ flex: 1, textAlign: 'center', bgcolor: '#DCEFD8', borderRadius: 2, py: 1.5 }}>
              <Typography variant='caption' color='#2d5a27'>예상 금액</Typography>
              <Typography variant='body2' fontWeight={700} color='#2d5a27'>
                {budget.estimated.toLocaleString()}원
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center', bgcolor: '#FFE8EF', borderRadius: 2, py: 1.5 }}>
              <Typography variant='caption' color='#c96a88'>실제 지출</Typography>
              <Typography variant='body2' fontWeight={700} color='#c96a88'>
                {budget.actual.toLocaleString()}원
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* 최근 웨딩 로그 */}
      <Card>
        <CardContent sx={{ py: 2 }}>
          <SectionHeader title='최근 웨딩 로그' path='/log' />
          {recentLogs.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>아직 작성된 로그가 없어요 ✍️</Typography>
          ) : (
            <Stack spacing={1}>
              {recentLogs.map(log => (
                <Box key={log.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1, borderBottom: '1px solid #FFF0F3' }}>
                  <Typography fontSize={20}>📝</Typography>
                  <Box>
                    <Typography variant='body2' fontWeight={500} color='text.primary' noWrap>{log.title}</Typography>
                    <Typography variant='caption' color='text.secondary'>{log.log_date}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
