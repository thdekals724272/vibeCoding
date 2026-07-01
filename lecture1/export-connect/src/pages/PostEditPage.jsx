import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

function PostEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', category_id: '', content: '' });
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const init = async () => {
      const [{ data: catData }, { data: postData }] = await Promise.all([
        supabase.from('categories').select('*').order('id'),
        supabase.from('posts').select('*').eq('id', id).single(),
      ]);
      if (catData) setCategories(catData);
      if (postData) {
        setForm({ title: postData.title, category_id: postData.category_id, content: postData.content });
        setExistingImages(postData.images || []);
      }
      setLoading(false);
    };
    init();
  }, [id]);

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = '제목을 입력해주세요.';
    if (!form.category_id) newErrors.category_id = '카테고리를 선택해주세요.';
    if (!form.content.trim()) newErrors.content = '내용을 입력해주세요.';
    return newErrors;
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const total = existingImages.length + newImageFiles.length + files.length;
    if (total > 5) {
      alert('사진은 최대 5장까지 첨부할 수 있습니다.');
      return;
    }
    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    setNewImageFiles((prev) => [...prev, ...validFiles]);
    validFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewImagePreviews((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
    e.target.value = '';
  };

  const handleRemoveExisting = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNew = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setSaving(true);
    setServerError('');

    const uploadedUrls = [];
    for (const file of newImageFiles) {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('post-images').upload(path, file);
      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path);
        uploadedUrls.push(publicUrl);
      }
    }

    const { error } = await supabase.from('posts').update({
      title: form.title.trim(),
      content: form.content.trim(),
      category_id: Number(form.category_id),
      images: [...existingImages, ...uploadedUrls],
    }).eq('id', id);

    setSaving(false);
    if (error) {
      setServerError('수정 중 오류가 발생했습니다.');
    } else {
      navigate(`/posts/${id}`);
    }
  };

  const totalImages = existingImages.length + newImageFiles.length;

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
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/posts/${id}`)} sx={{ mb: 3, color: '#0D1F4E' }}>
          게시물로 돌아가기
        </Button>

        <Paper sx={{ borderRadius: 2, p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0D1F4E', mb: 3 }}>
            게시물 수정
          </Typography>

          {serverError && <Alert severity="error" sx={{ mb: 3 }}>{serverError}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 3 }} size="small" error={!!errors.category_id}>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={form.category_id}
                label="카테고리"
                onChange={(e) => { setForm({ ...form, category_id: e.target.value }); setErrors({ ...errors, category_id: '' }); }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
              {errors.category_id && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.category_id}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth label="제목" value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: '' }); }}
              error={!!errors.title} helperText={errors.title}
              sx={{ mb: 3 }} size="small"
              inputProps={{ 'data-gramm': 'false', spellCheck: false }}
            />

            <TextField
              fullWidth label="내용" multiline rows={12} value={form.content}
              onChange={(e) => { setForm({ ...form, content: e.target.value }); setErrors({ ...errors, content: '' }); }}
              error={!!errors.content} helperText={errors.content}
              sx={{ mb: 3 }}
              inputProps={{ 'data-gramm': 'false', spellCheck: false }}
            />

            {/* 이미지 첨부 영역 */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#5A6A8A', fontWeight: 600 }}>
                  사진 첨부
                </Typography>
                <Typography variant="caption" sx={{ color: '#9AA3B5' }}>
                  (최대 5장)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {existingImages.map((url, i) => (
                  <Box key={`ex-${i}`} sx={{ position: 'relative', width: 100, height: 100, borderRadius: 1, overflow: 'hidden', border: '1px solid #E0E4EF' }}>
                    <img src={url} alt={`existing-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveExisting(i)}
                      sx={{ position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', p: 0.3, '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' } }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ))}

                {newImagePreviews.map((src, i) => (
                  <Box key={`new-${i}`} sx={{ position: 'relative', width: 100, height: 100, borderRadius: 1, overflow: 'hidden', border: '1px solid #E0E4EF' }}>
                    <img src={src} alt={`new-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveNew(i)}
                      sx={{ position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', p: 0.3, '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' } }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ))}

                {totalImages < 5 && (
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      width: 100, height: 100, borderRadius: 1,
                      border: '2px dashed #C9A86A',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#C9A86A',
                      '&:hover': { backgroundColor: '#FDF8EF' },
                    }}
                  >
                    <AddPhotoAlternateIcon />
                    <Typography variant="caption" sx={{ mt: 0.5, fontSize: 11 }}>사진 추가</Typography>
                  </Box>
                )}
              </Box>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate(`/posts/${id}`)} disabled={saving}
                sx={{ px: 4, borderColor: '#9AA3B5', color: '#5A6A8A' }}>
                취소
              </Button>
              <Button type="submit" variant="contained" disabled={saving}
                sx={{ px: 4, backgroundColor: '#0D1F4E', '&:hover': { backgroundColor: '#162B6B' } }}>
                {saving ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : '수정 완료'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default PostEditPage;
