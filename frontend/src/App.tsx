import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { UserRole } from './types';

import ProtectedRoute    from './components/ProtectedRoute';
import AppLayout         from './components/AppLayout';
import LoginPage         from './pages/LoginPage';
import DashboardPage     from './pages/DashboardPage';
import BetsPage          from './pages/BetsPage';
import RankingPage       from './pages/RankingPage';
import WinningsPage      from './pages/WinningsPage';
import AdminUsersPage    from './pages/AdminUsersPage';
import AdminMatchesPage  from './pages/AdminMatchesPage';
import AdminNotificationsPage from './pages/AdminNotificationsPage';
import NotFoundPage      from './pages/NotFoundPage';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const { isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/palpites"    element={<BetsPage />} />
          <Route path="/ranking"    element={<RankingPage />} />
          <Route path="/ganhos"     element={<WinningsPage />} />

          <Route element={<ProtectedRoute requiredRole={UserRole.ADMIN} />}>
            <Route path="/admin/partidas"  element={<AdminMatchesPage />} />
            <Route path="/admin/usuarios"  element={<AdminUsersPage />} />
            <Route path="/admin/notificacoes" element={<AdminNotificationsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<NotFoundPage />} />
    </Routes>
  );
}