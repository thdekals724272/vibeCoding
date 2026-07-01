import { useState } from 'react';
import {
  Box, Container, Typography, Paper, TextField, Select, MenuItem,
  FormControl, InputLabel, Button, Divider, Table, TableBody,
  TableCell, TableRow, Alert, InputAdornment, Grid,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import RefreshIcon from '@mui/icons-material/Refresh';
import Navbar from '../components/Navbar';

const COUNTRIES = [
  { name: '🇦🇪 UAE (두바이)', duty: 5, vat: 5, other: 0 },
  { name: '🇯🇴 요르단', duty: 30, vat: 16, other: 0 },
  { name: '🇰🇪 케냐', duty: 25, vat: 16, other: 2.25 },
  { name: '🇹🇿 탄자니아', duty: 25, vat: 18, other: 0 },
  { name: '🇳🇬 나이지리아', duty: 35, vat: 7.5, other: 0 },
  { name: '🇬🇭 가나', duty: 20, vat: 12.5, other: 0 },
  { name: '🇪🇹 에티오피아', duty: 35, vat: 15, other: 0 },
  { name: '🇲🇳 몽골', duty: 5, vat: 10, other: 0 },
  { name: '🇷🇼 르완다', duty: 25, vat: 18, other: 0 },
  { name: '🇺🇬 우간다', duty: 25, vat: 18, other: 0 },
  { name: '🇿🇦 남아프리카공화국', duty: 25, vat: 15, other: 0 },
  { name: '🇲🇾 말레이시아', duty: 30, vat: 10, other: 0 },
  { name: '기타 (직접 입력)', duty: 0, vat: 0, other: 0, custom: true },
];

const USD_TO_KRW = 1380;

function fmt(num) {
  return Math.round(num).toLocaleString();
}

function CalculatorPage() {
  const [form, setForm] = useState({
    vehiclePrice: '',
    shipping: '',
    insurance: '',
    countryIndex: 0,
    customDuty: '',
    customVat: '',
    customOther: '',
    miscCost: '',
  });
  const [result, setResult] = useState(null);

  const country = COUNTRIES[form.countryIndex];

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleCalculate = () => {
    const vehicle = parseFloat(form.vehiclePrice) || 0;
    const shipping = parseFloat(form.shipping) || 0;
    const insurance = parseFloat(form.insurance) || vehicle * 0.005;
    const misc = parseFloat(form.miscCost) || 0;

    const dutyRate = country.custom
      ? parseFloat(form.customDuty) || 0
      : country.duty;
    const vatRate = country.custom
      ? parseFloat(form.customVat) || 0
      : country.vat;
    const otherRate = country.custom
      ? parseFloat(form.customOther) || 0
      : country.other;

    const cif = vehicle + shipping + insurance;
    const duty = cif * (dutyRate / 100);
    const otherLevy = cif * (otherRate / 100);
    const vat = (cif + duty + otherLevy) * (vatRate / 100);
    const total = cif + duty + otherLevy + vat + misc;

    setResult({ vehicle, shipping, insurance, cif, duty, otherLevy, vat, misc, total, dutyRate, vatRate, otherRate });
  };

  const handleReset = () => {
    setForm({ vehiclePrice: '', shipping: '', insurance: '', countryIndex: 0, customDuty: '', customVat: '', customOther: '', miscCost: '' });
    setResult(null);
  };

  return (
    <Box sx={{ backgroundColor: '#F5F6FA', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <CalculateIcon sx={{ color: '#0D1F4E', fontSize: 32 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1F4E' }}>
              수출 계산기
            </Typography>
            <Typography variant="body2" sx={{ color: '#5A6A8A' }}>
              차량 수출 예상 원가를 자동으로 계산합니다
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ borderRadius: 2, p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1F4E', mb: 3 }}>
                입력 정보
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }} size="small">
                <InputLabel>수출 목적지 국가</InputLabel>
                <Select
                  value={form.countryIndex}
                  label="수출 목적지 국가"
                  onChange={(e) => setForm({ ...form, countryIndex: e.target.value })}
                >
                  {COUNTRIES.map((c, i) => (
                    <MenuItem key={i} value={i}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {!country.custom && (
                <Alert severity="info" sx={{ mb: 2, fontSize: 12 }}>
                  관세 {country.duty}% · VAT {country.vat}%{country.other > 0 ? ` · 기타부과금 ${country.other}%` : ''}
                </Alert>
              )}

              {country.custom && (
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField size="small" label="관세율 (%)" value={form.customDuty} onChange={handleChange('customDuty')} type="number" fullWidth />
                  <TextField size="small" label="VAT율 (%)" value={form.customVat} onChange={handleChange('customVat')} type="number" fullWidth />
                  <TextField size="small" label="기타부과 (%)" value={form.customOther} onChange={handleChange('customOther')} type="number" fullWidth />
                </Box>
              )}

              <TextField
                fullWidth size="small" label="차량 매입가" type="number"
                value={form.vehiclePrice} onChange={handleChange('vehiclePrice')}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                sx={{ mb: 2 }} placeholder="예: 15000"
              />
              <TextField
                fullWidth size="small" label="해상운임 (Freight)" type="number"
                value={form.shipping} onChange={handleChange('shipping')}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                sx={{ mb: 2 }} placeholder="예: 1200"
              />
              <TextField
                fullWidth size="small" label="보험료 (Insurance)" type="number"
                value={form.insurance} onChange={handleChange('insurance')}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                sx={{ mb: 2 }} placeholder="미입력 시 차량가의 0.5% 자동 계산"
                helperText="비워두면 차량가의 0.5%로 자동 계산"
              />
              <TextField
                fullWidth size="small" label="기타 비용 (통관료, 운반비 등)" type="number"
                value={form.miscCost} onChange={handleChange('miscCost')}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                sx={{ mb: 3 }} placeholder="예: 300"
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  fullWidth variant="contained" onClick={handleCalculate}
                  disabled={!form.vehiclePrice}
                  sx={{ py: 1.3, backgroundColor: '#0D1F4E', '&:hover': { backgroundColor: '#162B6B' } }}
                >
                  계산하기
                </Button>
                <Button
                  variant="outlined" onClick={handleReset} startIcon={<RefreshIcon />}
                  sx={{ borderColor: '#9AA3B5', color: '#5A6A8A', minWidth: 80 }}
                >
                  초기화
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ borderRadius: 2, p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1F4E', mb: 3 }}>
                계산 결과
              </Typography>

              {!result ? (
                <Box sx={{ textAlign: 'center', py: 6, color: '#9AA3B5' }}>
                  <CalculateIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                  <Typography variant="body2">좌측에 정보를 입력하고<br />계산하기를 눌러주세요</Typography>
                </Box>
              ) : (
                <>
                  <Table size="small">
                    <TableBody>
                      {[
                        { label: '차량 매입가', value: result.vehicle, highlight: false },
                        { label: '해상운임', value: result.shipping, highlight: false },
                        { label: '보험료', value: result.insurance, highlight: false },
                        { label: 'CIF 합계', value: result.cif, highlight: true, bold: true },
                        { label: `관세 (${result.dutyRate}%)`, value: result.duty, highlight: false },
                        result.otherRate > 0 && { label: `기타부과금 (${result.otherRate}%)`, value: result.otherLevy, highlight: false },
                        { label: `VAT (${result.vatRate}%)`, value: result.vat, highlight: false },
                        result.misc > 0 && { label: '기타 비용', value: result.misc, highlight: false },
                      ].filter(Boolean).map((row, i) => (
                        <TableRow key={i} sx={{ backgroundColor: row.highlight ? '#F0F4FF' : 'transparent' }}>
                          <TableCell sx={{ color: '#5A6A8A', fontSize: 13, py: 1, fontWeight: row.bold ? 700 : 400 }}>
                            {row.label}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: row.bold ? 700 : 400, fontSize: 13, py: 1 }}>
                            ${fmt(row.value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ backgroundColor: '#0D1F4E', borderRadius: 2, p: 2.5, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#C9A86A', mb: 0.5 }}>
                      총 예상 수입 원가
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                      ${fmt(result.total)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9AA3B5', mt: 0.5 }}>
                      ≈ ₩{fmt(result.total * USD_TO_KRW)}
                    </Typography>
                  </Box>

                  <Alert severity="warning" sx={{ mt: 2, fontSize: 11 }}>
                    실제 비용은 환율·현지 규정에 따라 달라질 수 있습니다. 참고용으로만 사용하세요.
                  </Alert>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default CalculatorPage;
