import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Divider,
  Button,
  IconButton,
  TextField,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import Navbar from '../components/Navbar';

const CATEGORY_COLORS = {
  '차량 요청': 'primary', '차량 판매': 'success', '시세 정보': 'warning',
  '수출 규정': 'error', '선적 후기': 'info', '쇼링 정보': 'secondary',
  '포워더 추천': 'primary', '자유게시판': 'default',
};

function PostDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const postId = parseInt(id, 10);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (!postId || isNaN(postId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      await fetchPost();
      await fetchComments();
      setLoading(false);
    };
    init();
  }, [id]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, categories(name), profiles(name)')
      .eq('id', postId)
      .maybeSingle();

    if (error) {
      console.error('Post fetch error:', error);
      setNotFound(true);
      return;
    }
    if (!data) {
      setNotFound(true);
      return;
    }
    setPost(data);
    supabase.from('posts').update({ views: (data.views || 0) + 1 }).eq('id', postId);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(name)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (data) setComments(data);
  };

  const handleLike = async () => {
    if (!post) return;
    const newLiked = !liked;
    setLiked(newLiked);
    const newCount = (post.likes || 0) + (newLiked ? 1 : -1);
    setPost({ ...post, likes: newCount });
    await supabase.from('posts').update({ likes: newCount }).eq('id', postId);
  };

  const handleDeletePost = async () => {
    if (!window.confirm('게시물을 삭제하시겠습니까?')) return;
    await supabase.from('posts').delete().eq('id', postId);
    navigate('/posts');
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !currentUser) return;
    setCommentLoading(true);
    await supabase.from('comments').insert({
      content: newComment.trim(),
      post_id: postId,
      author_id: currentUser.id,
      parent_id: replyTo || null,
    });
    setNewComment('');
    setReplyTo(null);
    await fetchComments();
    setCommentLoading(false);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    await supabase.from('comments').delete().eq('id', commentId);
    await fetchComments();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const rootComments = comments.filter((c) => !c.parent_id);
  const getReplies = (cId) => comments.filter((c) => c.parent_id === cId);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#0D1F4E' }} />
      </Box>
    );
  }

  if (notFound || !post) {
    return (
      <Box sx={{ backgroundColor: '#F5F6FA', minHeight: '100vh' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>게시물을 찾을 수 없습니다.</Alert>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/posts')} sx={{ color: '#0D1F4E' }}>
            목록으로 돌아가기
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#F5F6FA', minHeight: '100vh' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/posts')} sx={{ mb: 3, color: '#0D1F4E' }}>
          목록으로
        </Button>

        <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip label={post.categories?.name} color={CATEGORY_COLORS[post.categories?.name] || 'default'} size="small" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1F4E', mb: 2 }}>
              {post.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, color: '#5A6A8A', fontSize: 14, flexWrap: 'wrap' }}>
              <span>작성자: <strong>{post.profiles?.name}</strong></span>
              <span>작성일: {formatDate(post.created_at)}</span>
              <span>조회수: {(post.views || 0) + 1}</span>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 2, color: '#1A2A4A' }}>
              {post.content}
            </Typography>

            {post.images?.length > 0 && (
              <Box sx={{ mt: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {post.images.map((url, i) => (
                  <Box
                    key={i}
                    component="a"
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'block', borderRadius: 1, overflow: 'hidden', border: '1px solid #E0E4EF' }}
                  >
                    <img
                      src={url}
                      alt={`첨부이미지-${i + 1}`}
                      style={{ maxWidth: 280, maxHeight: 280, objectFit: 'cover', display: 'block' }}
                    />
                  </Box>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  startIcon={liked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                  onClick={handleLike}
                  variant={liked ? 'contained' : 'outlined'}
                  sx={{
                    color: liked ? '#FFFFFF' : '#0D1F4E',
                    borderColor: '#0D1F4E',
                    backgroundColor: liked ? '#0D1F4E' : 'transparent',
                  }}
                >
                  좋아요 {post.likes || 0}
                </Button>
                <IconButton onClick={() => setBookmarked(!bookmarked)} sx={{ color: bookmarked ? '#C9A86A' : '#9AA3B5' }}>
                  {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
              </Box>
              {currentUser?.id === post.author_id && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button startIcon={<EditIcon />} size="small" sx={{ color: '#5A6A8A' }}
                    onClick={() => navigate(`/posts/${postId}/edit`)}>
                    수정
                  </Button>
                  <Button startIcon={<DeleteIcon />} size="small" sx={{ color: '#d32f2f' }} onClick={handleDeletePost}>
                    삭제
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ borderRadius: 2, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, color: '#0D1F4E', fontWeight: 700 }}>
            댓글 {comments.length}개
          </Typography>

          {rootComments.map((comment) => (
            <Box key={comment.id}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Avatar sx={{ backgroundColor: '#0D1F4E', width: 36, height: 36, fontSize: 14 }}>
                  {(comment.profiles?.name || '?')[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{comment.profiles?.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#9AA3B5' }}>{formatDate(comment.created_at)}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>{comment.content}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" sx={{ fontSize: 12, color: '#5A6A8A', minWidth: 0, p: 0 }}
                      onClick={() => setReplyTo(comment.id)}>
                      답글
                    </Button>
                    {currentUser?.id === comment.author_id && (
                      <Button size="small" sx={{ fontSize: 12, color: '#d32f2f', minWidth: 0, p: 0 }}
                        onClick={() => handleDeleteComment(comment.id)}>
                        삭제
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Box>

              {getReplies(comment.id).map((reply) => (
                <Box key={reply.id} sx={{ display: 'flex', gap: 2, mb: 2, pl: 6 }}>
                  <Avatar sx={{ backgroundColor: '#C9A86A', color: '#0D1F4E', width: 32, height: 32, fontSize: 12 }}>
                    {(reply.profiles?.name || '?')[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{reply.profiles?.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#9AA3B5' }}>{formatDate(reply.created_at)}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>{reply.content}</Typography>
                    {currentUser?.id === reply.author_id && (
                      <Button size="small" sx={{ fontSize: 12, color: '#d32f2f', minWidth: 0, p: 0 }}
                        onClick={() => handleDeleteComment(reply.id)}>
                        삭제
                      </Button>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          ))}

          {comments.length === 0 && (
            <Typography variant="body2" sx={{ color: '#9AA3B5', textAlign: 'center', py: 3 }}>
              첫 번째 댓글을 작성해보세요!
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          {replyTo && (
            <Typography variant="body2" sx={{ mb: 1, color: '#C9A86A' }}>
              ↳ 댓글에 답글 작성 중{' '}
              <Button size="small" onClick={() => setReplyTo(null)} sx={{ fontSize: 12, p: 0, minWidth: 0 }}>
                취소
              </Button>
            </Typography>
          )}

          {currentUser ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth multiline rows={3}
                placeholder="댓글을 작성해주세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                size="small"
                disabled={commentLoading}
                inputProps={{ 'data-gramm': 'false', spellCheck: false }}
              />
              <Button
                variant="contained"
                onClick={handleCommentSubmit}
                disabled={commentLoading || !newComment.trim()}
                sx={{ backgroundColor: '#0D1F4E', alignSelf: 'flex-end', whiteSpace: 'nowrap', px: 3 }}
              >
                {commentLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : '등록'}
              </Button>
            </Box>
          ) : (
            <Alert severity="info">
              댓글을 작성하려면{' '}
              <Button size="small" onClick={() => navigate('/login')} sx={{ p: 0, fontWeight: 700 }}>
                로그인
              </Button>
              이 필요합니다.
            </Alert>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default PostDetailPage;
