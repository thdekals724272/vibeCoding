import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Fab, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Button, MenuItem,
  Stack, Chip, IconButton, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const CATEGORIES = ['예식장', '스드메', '스냅', '한복', '청첩장', '신혼여행', '가전/가구', '기타'];
const STATUSES = ['예정', '계약금 결제', '잔금 결제', '완료'];
const COLORS = ['#F7C9D4', '#DCEEFF', '#FFF5C8', '#DCEFD8', '#E8D5FF', '#D5E8FF', '#FFD5C8', '#E0E0E0'];
const STATUS_COLORS = { '예정': '#E0E0E0', '계약금 결제': '#FFF5C8', '잔금 결제': '#DCEEFF', '완료': '#DCEFD8' };

function won(n) { return (n || 0).toLocaleString() + '원'; }

function generatePrintHTML({ items, couple, totalEstimated, totalActual }) {
  const today = format(new Date(), 'yyyy년 M월 d일 EEEE', { locale: ko });
  const weddingDate = couple?.wedding_date
    ? format(new Date(couple.wedding_date), 'yyyy년 M월 d일', { locale: ko })
    : '미설정';

  const categoryRows = CATEGORIES.map(cat => {
    const catItems = items.filter(i => i.category === cat);
    if (catItems.length === 0) return '';
    const catEst = catItems.reduce((s, i) => s + (i.estimated_amount || 0), 0);
    const catAct = catItems.reduce((s, i) => s + (i.actual_amount || 0), 0);
    return `
      <tr style="background:#FFF0F5;">
        <td colspan="4" style="padding:8px 12px;font-weight:700;color:#5a3040;font-size:13px;">📁 ${cat}</td>
        <td style="padding:8px 12px;font-weight:700;color:#2d5a27;text-align:right;">${won(catEst)}</td>
        <td style="padding:8px 12px;font-weight:700;color:#c96a88;text-align:right;">${won(catAct)}</td>
        <td style="padding:8px 12px;font-weight:700;text-align:right;">${won(catEst - catAct)}</td>
      </tr>
      ${catItems.map(item => `
        <tr>
          <td style="padding:6px 12px 6px 24px;color:#333;">${item.item_name}</td>
          <td style="padding:6px 12px;color:#888;font-size:12px;">${item.category}</td>
          <td style="padding:6px 12px;font-size:12px;">
            <span style="background:${STATUS_COLORS[item.payment_status]};padding:2px 8px;border-radius:10px;font-size:11px;">${item.payment_status}</span>
          </td>
          <td style="padding:6px 12px;color:#888;font-size:12px;">${item.memo || '-'}</td>
          <td style="padding:6px 12px;text-align:right;color:#2d5a27;">${won(item.estimated_amount)}</td>
          <td style="padding:6px 12px;text-align:right;color:#c96a88;">${won(item.actual_amount)}</td>
          <td style="padding:6px 12px;text-align:right;color:${(item.estimated_amount - item.actual_amount) >= 0 ? '#2d5a27' : '#c96a88'};">${won(item.estimated_amount - item.actual_amount)}</td>
        </tr>
      `).join('')}
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <title>Our Pages - 결혼 준비 예산 리포트</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Apple SD Gothic Neo', '맑은 고딕', 'Malgun Gothic', sans-serif; color: #333; background: #fff; padding: 40px; }
        .header { text-align: center; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #F7C9D4; }
        .logo { font-size: 28px; font-weight: 800; color: #5a3040; margin-bottom: 4px; }
        .subtitle { font-size: 14px; color: #888; }
        .meta { font-size: 12px; color: #aaa; margin-top: 8px; }
        .summary { display: flex; gap: 16px; margin-bottom: 28px; }
        .summary-card { flex: 1; padding: 16px; border-radius: 12px; text-align: center; }
        .summary-label { font-size: 12px; margin-bottom: 6px; }
        .summary-value { font-size: 18px; font-weight: 800; }
        .section-title { font-size: 15px; font-weight: 700; color: #5a3040; margin-bottom: 12px; padding-left: 4px; border-left: 4px solid #F7C9D4; padding-left: 10px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 32px; }
        th { background: #5a3040; color: white; padding: 10px 12px; text-align: left; font-weight: 600; }
        th:last-child, th:nth-child(5), th:nth-child(6) { text-align: right; }
        tr:nth-child(even):not([style*="background"]) { background: #FFFDFB; }
        tr:hover { background: #FFF5F7; }
        .total-row { background: #5a3040 !important; color: white; font-weight: 800; font-size: 14px; }
        .total-row td { padding: 12px; text-align: right; }
        .total-row td:first-child { text-align: left; }
        .footer { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; font-size: 11px; color: #bbb; }
        @media print {
          body { padding: 20px; }
          @page { margin: 1.5cm; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">💕 Our Pages</div>
        <div class="subtitle">결혼 준비 예산 리포트</div>
        <div class="meta">생성일: ${today}${couple?.wedding_date ? `  ·  결혼식: ${weddingDate}` : ''}</div>
      </div>

      <div class="summary">
        <div class="summary-card" style="background:#DCEFD8;">
          <div class="summary-label" style="color:#2d5a27;">총 예상 금액</div>
          <div class="summary-value" style="color:#2d5a27;">${won(totalEstimated)}</div>
        </div>
        <div class="summary-card" style="background:#FFE8EF;">
          <div class="summary-label" style="color:#c96a88;">실제 지출</div>
          <div class="summary-value" style="color:#c96a88;">${won(totalActual)}</div>
        </div>
        <div class="summary-card" style="background:#DCEEFF;">
          <div class="summary-label" style="color:#1a3a5c;">남은 예산</div>
          <div class="summary-value" style="color:#1a3a5c;">${won(totalEstimated - totalActual)}</div>
        </div>
      </div>

      <div class="section-title">항목별 상세 내역 (${items.length}건)</div>
      <table>
        <thead>
          <tr>
            <th style="width:22%">항목명</th>
            <th style="width:10%">카테고리</th>
            <th style="width:12%">결제 상태</th>
            <th style="width:16%">메모</th>
            <th style="width:13%;text-align:right">예상 금액</th>
            <th style="width:13%;text-align:right">실제 금액</th>
            <th style="width:14%;text-align:right">차액</th>
          </tr>
        </thead>
        <tbody>
          ${categoryRows}
          <tr class="total-row">
            <td colspan="4">합계 (${items.length}건)</td>
            <td>${won(totalEstimated)}</td>
            <td>${won(totalActual)}</td>
            <td>${won(totalEstimated - totalActual)}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">Our Pages · 결혼 준비를 함께 기록해요 💕</div>

      <script>window.onload = () => { window.print(); }</script>
    </body>
    </html>
  `;
}

export default function BudgetPage() {
  const { couple } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    item_name: '', category: '기타', estimated_amount: '', actual_amount: '', payment_status: '예정', memo: '',
  });

  useEffect(() => { if (couple?.id) load(); }, [couple]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('budgets').select('*').eq('couple_id', couple.id).order('created_at');
    setItems(data || []);
    setLoading(false);
  }

  async function addItem() {
    if (!form.item_name.trim()) return;
    const { data } = await supabase.from('budgets').insert({
      couple_id: couple.id,
      item_name: form.item_name,
      category: form.category,
      estimated_amount: Number(form.estimated_amount) || 0,
      actual_amount: Number(form.actual_amount) || 0,
      payment_status: form.payment_status,
      memo: form.memo,
    }).select().single();
    if (data) setItems(prev => [...prev, data]);
    setForm({ item_name: '', category: '기타', estimated_amount: '', actual_amount: '', payment_status: '예정', memo: '' });
    setOpen(false);
  }

  async function deleteItem(id) {
    await supabase.from('budgets').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function exportPDF() {
    const win = window.open('', '_blank');
    win.document.write(generatePrintHTML({ items, couple, totalEstimated, totalActual }));
    win.document.close();
  }

  const totalEstimated = items.reduce((s, i) => s + (i.estimated_amount || 0), 0);
  const totalActual = items.reduce((s, i) => s + (i.actual_amount || 0), 0);

  const chartData = CATEGORIES.map((cat, idx) => ({
    name: cat,
    value: items.filter(i => i.category === cat).reduce((s, i) => s + (i.estimated_amount || 0), 0),
    color: COLORS[idx],
  })).filter(d => d.value > 0);

  if (!couple) return (
    <Box sx={{ p: 3, textAlign: 'center', mt: 8 }}>
      <Typography color='text.secondary'>마이페이지에서 커플 정보를 먼저 설정해주세요 💕</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 2, pb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pt: 1 }}>
        <Typography variant='h6' color='#5a3040'>예산 관리</Typography>
        {items.length > 0 && (
          <Button
            size='small'
            startIcon={<PictureAsPdfIcon sx={{ fontSize: 16 }} />}
            onClick={exportPDF}
            sx={{
              bgcolor: '#DCEEFF', color: '#1a3a5c', borderRadius: 3,
              fontWeight: 600, fontSize: 12, px: 1.5, py: 0.5,
              '&:hover': { bgcolor: '#b8d8ff' },
            }}
          >
            PDF 내보내기
          </Button>
        )}
      </Box>

      <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
        <Card sx={{ flex: 1, bgcolor: '#DCEFD8' }}>
          <CardContent sx={{ py: 1.5, textAlign: 'center' }}>
            <Typography variant='caption' color='#2d5a27'>총 예상</Typography>
            <Typography variant='body2' fontWeight={700} color='#2d5a27'>{(totalEstimated / 10000).toFixed(0)}만원</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, bgcolor: '#FFE8EF' }}>
          <CardContent sx={{ py: 1.5, textAlign: 'center' }}>
            <Typography variant='caption' color='#c96a88'>실제 지출</Typography>
            <Typography variant='body2' fontWeight={700} color='#c96a88'>{(totalActual / 10000).toFixed(0)}만원</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, bgcolor: '#DCEEFF' }}>
          <CardContent sx={{ py: 1.5, textAlign: 'center' }}>
            <Typography variant='caption' color='#1a3a5c'>남은 예산</Typography>
            <Typography variant='body2' fontWeight={700} color='#1a3a5c'>{((totalEstimated - totalActual) / 10000).toFixed(0)}만원</Typography>
          </CardContent>
        </Card>
      </Stack>

      {chartData.length > 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant='subtitle2' fontWeight={600} color='text.primary' mb={1}>카테고리별 예산</Typography>
            <ResponsiveContainer width='100%' height={180}>
              <PieChart>
                <Pie data={chartData} cx='50%' cy='50%' innerRadius={40} outerRadius={70} dataKey='value' paddingAngle={3}>
                  {chartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `${(v / 10000).toFixed(0)}만원`} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress sx={{ color: '#F7C9D4' }} /></Box>
      ) : (
        <Stack spacing={1}>
          {items.map(item => (
            <Card key={item.id}>
              <CardContent sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2' fontWeight={600}>{item.item_name}</Typography>
                    <Typography variant='caption' color='text.secondary'>{item.category}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip label={item.payment_status} size='small'
                      sx={{ bgcolor: STATUS_COLORS[item.payment_status], fontSize: 10, height: 20 }} />
                    <IconButton size='small' onClick={() => deleteItem(item.id)}>
                      <DeleteIcon fontSize='small' sx={{ color: '#ddd' }} />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant='caption' color='text.secondary'>예상: {(item.estimated_amount || 0).toLocaleString()}원</Typography>
                  <Typography variant='caption' color='#c96a88'>실제: {(item.actual_amount || 0).toLocaleString()}원</Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && (
            <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', mt: 4 }}>예산 항목을 추가해보세요 💰</Typography>
          )}
        </Stack>
      )}

      <Fab size='medium' sx={{ position: 'fixed', bottom: 80, right: 20 }} onClick={() => setOpen(true)}>
        <AddIcon />
      </Fab>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='xs' PaperProps={{ sx: { borderRadius: 4, mx: 2 } }}>
        <DialogTitle sx={{ pb: 1, color: '#5a3040' }}>예산 항목 추가</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField size='small' label='항목명' value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} fullWidth />
            <TextField select size='small' label='카테고리' value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} fullWidth>
              {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <TextField size='small' label='예상 금액 (원)' type='number' value={form.estimated_amount} onChange={e => setForm({ ...form, estimated_amount: e.target.value })} fullWidth />
            <TextField size='small' label='실제 금액 (원)' type='number' value={form.actual_amount} onChange={e => setForm({ ...form, actual_amount: e.target.value })} fullWidth />
            <TextField select size='small' label='결제 상태' value={form.payment_status} onChange={e => setForm({ ...form, payment_status: e.target.value })} fullWidth>
              {STATUSES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField size='small' label='메모 (선택)' value={form.memo} onChange={e => setForm({ ...form, memo: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'text.secondary' }}>취소</Button>
          <Button onClick={addItem} variant='contained'>추가</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
