import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import { login, getMyProfile } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { isDummy } from '../services/dummyData';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await login(email, password);
      setAuth(user, token);
      const profile = await getMyProfile();
      setAuth(profile, token);
      navigate('/radar', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin() {
    navigate('/radar', { replace: true });
  }

  // Demo-mode toggle — works before any login
  const [demoMode, setDemoMode] = useState(() => {
    const override = localStorage.getItem('lr_demo_mode');
    return override !== null ? override === 'true' : import.meta.env.VITE_DUMMY_DATA === 'true';
  });
  const toggleDemoMode = () => {
    const next = !demoMode;
    setDemoMode(next);
    localStorage.setItem('lr_demo_mode', String(next));
    localStorage.removeItem('lr_auth'); // reset persisted auth so store re-inits
    window.location.reload();
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[var(--surface-alt)] px-6 relative overflow-hidden"
      style={{ paddingTop: isDummy() ? 36 : 0 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blush via-white to-rose-soft/30 pointer-events-none" />

      <motion.div
        className="relative w-full max-w-sm md:max-w-md md:bg-white/80 md:backdrop-blur md:rounded-3xl md:shadow-xl md:p-10 space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="text-6xl animate-heartbeat">💕</div>
          <h1 className="text-4xl font-black text-gradient">Loverace</h1>
          <p className="text-gray-500 text-sm">Proximity-first dating · Find love nearby</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading}>Sign In</Button>
        </form>

        {/* Demo mode button */}
        {isDummy() && (
          <Button variant="secondary" onClick={handleDemoLogin}>
            ✨ Continue in Demo Mode
          </Button>
        )}

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </p>

        {/* Demo mode toggle — always visible, no auth required */}
        <div className="flex items-center justify-between bg-blush/60 rounded-2xl px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">Demo mode</p>
            <p className="text-xs text-gray-500">Run with sample data, no backend needed</p>
          </div>
          <button
            type="button"
            onClick={toggleDemoMode}
            aria-pressed={demoMode}
            aria-label="Toggle demo mode"
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              demoMode ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                demoMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
