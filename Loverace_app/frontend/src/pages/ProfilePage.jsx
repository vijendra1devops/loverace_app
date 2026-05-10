import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProfileForm from '../components/profile/ProfileForm';
import Avatar from '../components/common/Avatar';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Navigate } from 'react-router-dom';
import hotSound from '@assets/hot.mp3';

const STAGE_LABELS = ['', 'Dating', 'Couples', 'Soulmate', 'Lovers'];
const STAGE_EMOJIS = ['', '💕', '👫', '🌟', '🔥'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  // Play hot.mp3 once when the profile page is visited
  useEffect(() => {
    const audio = new Audio(hotSound);
    audio.volume = 0.5;
    audio.play().catch(() => {}); // ignore autoplay policy blocks
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  // Demo-mode toggle (reads/writes localStorage, reloads to re-init stores)
  const [demoMode, setDemoMode] = useState(() => {
    const override = localStorage.getItem('lr_demo_mode');
    return override !== null ? override === 'true' : import.meta.env.VITE_DUMMY_DATA === 'true';
  });
  const toggleDemoMode = () => {
    const next = !demoMode;
    setDemoMode(next);
    localStorage.setItem('lr_demo_mode', String(next));
    localStorage.removeItem('lr_auth'); // reset persisted auth so store re-inits cleanly
    window.location.reload();
  };

  // Only redirect when definitely not authenticated; if auth is valid but user
  // object is missing (edge case) show a fallback rather than looping.
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) return (
    <div className="flex-1 flex items-center justify-center h-full">
      <p className="text-gray-400 text-sm">Loading profile…</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ paddingBottom: 'var(--nav-height)' }}>
      {/* Desktop: two-column grid wrapper. Mobile: single column (unchanged). */}
      <div className="md:max-w-4xl md:mx-auto md:w-full md:grid md:grid-cols-[300px_1fr] md:gap-8 md:p-8 md:items-start">

      {/* ── LEFT COLUMN (avatar, name, stats, actions) ── */}
      <div>
      {/* Header */}
      <div className="relative">
        {/* Cover gradient */}
        <div className="h-36 bg-gradient-to-br from-primary via-rose to-primary-dark md:rounded-2xl" />

        {/* Avatar */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <Avatar
            src={user.photos?.[0]?.url}
            name={user.display_name || user.name || '?'}
            size="xl"
            className="ring-4 ring-white shadow-xl"
          />
        </div>
      </div>

      {/* User info */}
      <div className="mt-16 text-center px-4 space-y-1">
        <h2 className="text-2xl font-black text-gray-900">
          {user.display_name || user.name}
          {user.age && <span className="font-normal text-gray-500">, {user.age}</span>}
        </h2>
        {user.occupation && <p className="text-sm text-gray-500">{user.occupation}</p>}
        {user.gender && (
          <p className="text-xs text-gray-400 capitalize">{user.gender} · {user.orientation}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mx-4 mt-5">
        {[
          { label: 'Connections', value: '12' },
          { label: 'Bond stage', value: '💕 Dating' },
          { label: 'Active days', value: '7' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-blush/50 rounded-2xl p-3 text-center">
            <p className="font-bold text-base text-primary">{value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mx-4 mt-6 space-y-3">
        <Button onClick={() => setEditing(true)}>Edit Profile ✏️</Button>
        <Button variant="ghost" onClick={() => setLogoutModal(true)}>Sign Out</Button>
      </div>
      </div>{/* end left column */}

      {/* ── RIGHT COLUMN (bio, interests, settings) ── */}
      <div className="md:mt-4">

      {/* Bio */}
      {user.bio && (
        <div className="mx-4 mt-4 p-4 bg-blush/50 rounded-2xl md:mx-0 md:mt-0">
          <p className="text-sm text-gray-700 text-center leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* Interests */}
      {user.interests?.length > 0 && (
        <div className="mx-4 mt-4 md:mx-0">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((tag) => (
              <span key={tag} className="tag-chip">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="mx-4 mt-6 md:mx-0">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Settings</h3>
        <div className="bg-blush/40 rounded-2xl divide-y divide-gray-100">
          {/* Demo / Dummy data toggle */}
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">Demo mode</p>
              <p className="text-xs text-gray-400 mt-0.5">Use sample data — no backend required</p>
            </div>
            <button
              onClick={toggleDemoMode}
              aria-pressed={demoMode}
              aria-label="Toggle demo mode"
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
                demoMode ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  demoMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-8" />

      </div>{/* end right column */}
      </div>{/* end grid wrapper */}

      {/* Edit profile sheet */}
      {editing && (
        <motion.div
          className="fixed inset-0 z-50 bg-white overflow-y-auto"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] sticky top-0 bg-white z-10">
            <h2 className="font-bold text-lg text-primary">Edit Profile</h2>
            <button onClick={() => setEditing(false)} className="text-gray-400 text-2xl leading-none hover:text-gray-600">×</button>
          </div>
          <div className="py-6">
            <ProfileForm
              initialData={user}
              onSaved={() => setEditing(false)}
            />
          </div>
        </motion.div>
      )}

      {/* Logout confirm */}
      <Modal open={logoutModal} onClose={() => setLogoutModal(false)} title="Sign out?">
        <div className="space-y-4 text-center">
          <p className="text-gray-600 text-sm">You'll need to sign in again to access Loverace.</p>
          <Button variant="danger" onClick={() => { logout(); navigate('/login', { replace: true }); }}>
            Sign Out
          </Button>
          <Button variant="ghost" onClick={() => setLogoutModal(false)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
