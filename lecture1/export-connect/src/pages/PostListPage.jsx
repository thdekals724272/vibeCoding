import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Stack,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import Navbar from '../components/Navbar';

const CATEGORY_COLORS = {
  '차량 요청': 'primary',
  '차량 판매': 'success',
  '시세 정보': 'warning',
  '수출 규정': 'error',
  '선적 후기': 'info',
  '쇼링 정보': 'secondary',
  '포워더 추천': 'primary',
  '자유게시판': 'default',
};

const PAGE_SIZE = 10;

function PostListPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [sortBy, setSortBy] = useState('latest');
  const [searchText, setSearchText] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('id');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, sortBy, searchText, page]);

  const fetchPosts = async () => {
    setLoading(true);

    let query = supabase
      .from('posts')
      .select(`
        id, title, views, likes, created_at,
        categories(name),
        profiles(name),
        comments(count)
      `, { count: 'exact' });

    if (selectedCategory !== '전체') {
      const cat = categories.find((c) => c.name === selectedCategory);
      if (cat) query = query.eq('category_id', cat.id);
    }

    if (searchText) {
      query = query.ilike('title', `%${searchText}%`);
    }

    if (sortBy === 'views') {
      query = query.order('views', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const from = (page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, count, error } = await query;
    if (error) {
      console.error('PostListPage fetch error:', error);
    }
    if (data) {
      setPosts(data);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setSearchText(searchInput);
    setPage(1);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const formatDate = (dateStr) => dateStr?.slice(0, 10) || '';

  return (
    <Box sx={{ backgroundColor: '#F5F6FA', minHeight: '100vh' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          {['전체', ...categories.map((c) => c.name)].map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => handleCategoryChange(cat)}
              variant={selectedCategory === cat ? 'filled' : 'outlined'}
              sx={{
                backgroundColor: selectedCategory === cat ? '#0D1F4E' : 'transparent',
                color: selectedCategory === cat ? '#FFFFFF' : '#0D1F4E',
                borderColor: '#0D1F4E',
                fontWeight: selectedCategory === cat ? 700 : 400,
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="제목 검색"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ 'data-gramm': 'false', spellCheck: false }}
              sx={{ width: 240 }}
            />
            <Button variant="outlined" onClick={handleSearch} sx={{ borderColor: '#0D1F4E', color: '#0D1F4E' }}>
              검색
            </Button>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>정렬</InputLabel>
              <Select value={sortBy} label="정렬" onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
                <MenuItem value="latest">최신순</MenuItem>
                <MenuItem value="views">조회순</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate('/posts/write')}
            sx={{ backgroundColor: '#C9A86A', color: '#0D1F4E', '&:hover': { backgroundColor: '#B8924F' } }}
          >
            글쓰기
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#0D1F4E' }}>
                {['번호', '카테고리', '제목', '작성자', '댓글', '조회', '작성일'].map((h) => (
                  <TableCell key={h} sx={{ color: '#FFFFFF', fontWeight: 600, py: 1.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                    <CircularProgress sx={{ color: '#0D1F4E' }} />
                  </TableCell>
                </TableRow>
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#9AA3B5' }}>
                    게시물이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post, index) => (
                  <TableRow
                    key={post.id}
                    hover
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#F0F4FF' } }}
                    onClick={() => navigate(`/posts/${post.id}`)}
                  >
                    <TableCell sx={{ color: '#5A6A8A', width: 60 }}>
                      {totalCount - (page - 1) * PAGE_SIZE - index}
                    </TableCell>
                    <TableCell sx={{ width: 110 }}>
                      <Chip
                        label={post.categories?.name}
                        size="small"
                        color={CATEGORY_COLORS[post.categories?.name] || 'default'}
                        sx={{ fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{post.title}</TableCell>
                    <TableCell sx={{ color: '#5A6A8A', width: 120 }}>{post.profiles?.name}</TableCell>
                    <TableCell sx={{ color: '#C9A86A', fontWeight: 700, width: 60, textAlign: 'center' }}>
                      {post.comments?.[0]?.count > 0 ? `[${post.comments[0].count}]` : ''}
                    </TableCell>
                    <TableCell sx={{ color: '#5A6A8A', width: 70, textAlign: 'center' }}>{post.views}</TableCell>
                    <TableCell sx={{ color: '#9AA3B5', width: 100 }}>{formatDate(post.created_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalCount > PAGE_SIZE && (
          <Stack alignItems="center" sx={{ mt: 4 }}>
            <Pagination
              count={Math.ceil(totalCount / PAGE_SIZE)}
              page={page}
              onChange={(_, v) => setPage(v)}
              sx={{
                '& .MuiPaginationItem-root.Mui-selected': {
                  backgroundColor: '#0D1F4E',
                  color: '#FFFFFF',
                },
              }}
            />
          </Stack>
        )}
      </Container>
    </Box>
  );
}

export default PostListPage;
