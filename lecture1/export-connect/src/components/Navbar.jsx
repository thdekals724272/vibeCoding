import {
  AppBar, Toolbar, Typography, Button, Box,
  Avatar, Menu, MenuItem, Divider,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    setAnchorEl(null);
    await supabase.auth.signOut();
    navigate('/login');
  };

  const displayName = user?.user_metadata?.name || user?.email || '';
  const initials = displayName[0]?.toUpperCase() || '?';

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: '#0D1F4E' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>

        {/* 왼쪽: 로고 + 메뉴 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
            onClick={() => navigate('/posts')}
          >
            <DirectionsCarIcon sx={{ color: '#C9A86A', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, lineHeight: 1.2, letterSpacing: 0.5 }}>
                Export Connect
              </Typography>
              <Typography variant="caption" sx={{ color: '#C9A86A', lineHeight: 1 }}>
                Connecting Exporters Worldwide
              </Typography>
            </Box>
          </Box>

          <Button
            onClick={() => navigate('/calculator')}
            startIcon={<CalculateIcon />}
            sx={{ color: '#C9A86A', textTransform: 'none', fontWeight: 600, fontSize: 14 }}
          >
            수출 계산기
          </Button>
        </Box>

        {/* 오른쪽: 사용자 메뉴 */}
        {user ? (
          <Box>
            <Button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{ color: '#FFFFFF', textTransform: 'none', gap: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, backgroundColor: '#C9A86A', color: '#0D1F4E', fontSize: 14, fontWeight: 700 }}>
                {initials}
              </Avatar>
              <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                {displayName}
              </Typography>
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { mt: 1, minWidth: 160 } }}
            >
              <MenuItem disabled sx={{ fontSize: 13, color: '#9AA3B5' }}>
                {user.email}
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }} sx={{ gap: 1, fontSize: 14 }}>
                <PersonIcon fontSize="small" sx={{ color: '#5A6A8A' }} />
                내 정보
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ gap: 1, fontSize: 14, color: '#d32f2f' }}>
                <LogoutIcon fontSize="small" />
                로그아웃
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => navigate('/login')} sx={{ color: '#FFFFFF', textTransform: 'none' }}>
              로그인
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/register')}
              sx={{ borderColor: '#C9A86A', color: '#C9A86A', textTransform: 'none', '&:hover': { borderColor: '#B8924F' } }}
            >
              회원가입
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
