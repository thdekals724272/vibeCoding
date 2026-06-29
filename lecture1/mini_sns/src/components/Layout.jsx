import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Box, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PersonIcon from '@mui/icons-material/Person';

const NAV_ITEMS = [
  { label: 'Home', icon: <HomeIcon />, path: '/home' },
  { label: 'Check', icon: <ChecklistIcon />, path: '/checklist' },
  { label: 'Calendar', icon: <CalendarMonthIcon />, path: '/calendar' },
  { label: 'Log', icon: <AutoStoriesIcon />, path: '/log' },
  { label: 'My', icon: <PersonIcon />, path: '/my' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const current = NAV_ITEMS.findIndex(item => location.pathname.startsWith(item.path));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#FFFDFB' }}>
      <Box sx={{ flex: 1, overflowY: 'auto', pb: '64px' }}>
        <Outlet />
      </Box>
      <Paper
        elevation={0}
        sx={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, zIndex: 100 }}
      >
        <BottomNavigation
          value={current}
          onChange={(_, val) => navigate(NAV_ITEMS[val].path)}
          showLabels
        >
          {NAV_ITEMS.map(item => (
            <BottomNavigationAction key={item.path} label={item.label} icon={item.icon} />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
