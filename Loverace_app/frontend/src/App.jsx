import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { getMyProfile } from './services/api';
import FloatingHearts from './components/hearts/FloatingHearts';
import BottomNav from './components/common/BottomNav';
import Sidebar from './components/common/Sidebar';
import DemoBanner from './components/common/DemoBanner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RadarPage from './pages/RadarPage';
import SwipeFeedPage from './pages/SwipeFeedPage';
import MatchesPage from './pages/MatchesPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import { useWebSocket } from './hooks/useWebSocket';

const isDemoMode = import.meta.env.VITE_DUMMY_DATA === 'true';
const DEMO_BANNER_H = isDemoMode ? 36 : 0;

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppInner() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  useWebSocket();

  useEffect(() => {
    if (isAuthenticated && token && !user) {
      let active = true;
      getMyProfile()
        .then((profile) => {
          if (active) setAuth(profile, token);
        })
        .catch(() => {
          if (active) logout();
        });
      return () => {
        active = false;
      };
    }
    return undefined;
  }, [isAuthenticated, token, user, setAuth, logout]);

  return (
    <div
      className="flex relative"
      style={{
        height: '100dvh',
        paddingTop: DEMO_BANNER_H,
      }}
    >
      {/* Ambient floating hearts (z=0, behind everything) */}
      <FloatingHearts />

      {/* Demo ribbon */}
      {isDemoMode && <DemoBanner />}

      {/* Sidebar — desktop only (hidden on mobile) */}
      {isAuthenticated && <Sidebar />}

      {/* Main content area — offset by sidebar width on desktop */}
      <div
        className={`flex flex-col flex-1 overflow-hidden relative ${isAuthenticated ? 'md:ml-64' : ''}`}
        style={{ zIndex: 1 }}
      >
        {/* Page content */}
        <div className="relative flex-1 overflow-hidden">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/radar" element={<ProtectedRoute><RadarPage /></ProtectedRoute>} />
            <Route path="/swipe" element={<ProtectedRoute><SwipeFeedPage /></ProtectedRoute>} />
            <Route path="/matches" element={<ProtectedRoute><MatchesPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/chat/:conversationId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to={isAuthenticated ? '/radar' : '/login'} replace />} />
          </Routes>
        </div>

        {/* Bottom navigation — mobile only (hidden on desktop) */}
        {isAuthenticated && (
          <div className="md:hidden">
            <BottomNav />
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
