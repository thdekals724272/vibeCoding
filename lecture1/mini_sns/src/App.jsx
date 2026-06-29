import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ChecklistPage from './pages/ChecklistPage';
import CalendarPage from './pages/CalendarPage';
import WeddingLogPage from './pages/WeddingLogPage';
import MyPage from './pages/MyPage';
import BudgetPage from './pages/BudgetPage';
import VendorPage from './pages/VendorPage';
import { CircularProgress, Box } from '@mui/material';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress sx={{ color: '#F7C9D4' }} />
    </Box>
  );
  return user ? children : <Navigate to='/login' replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress sx={{ color: '#F7C9D4' }} />
    </Box>
  );
  return !user ? children : <Navigate to='/home' replace />;
}

export default function App() {
  return (
    <BrowserRouter basename='/vibeCoding/mini_sns'>
      <Routes>
        <Route path='/login' element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path='/home' element={<HomePage />} />
          <Route path='/checklist' element={<ChecklistPage />} />
          <Route path='/calendar' element={<CalendarPage />} />
          <Route path='/log' element={<WeddingLogPage />} />
          <Route path='/my' element={<MyPage />} />
          <Route path='/budget' element={<BudgetPage />} />
          <Route path='/vendors' element={<VendorPage />} />
        </Route>
        <Route path='*' element={<Navigate to='/home' replace />} />
      </Routes>
    </BrowserRouter>
  );
}
