import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';
import { register, getMyProfile } from '../services/api';
import { useAuthStore } from '../store/authStore';

const GENDERS = ['man', 'woman', 'non-binary', 'genderfluid', 'agender', 'prefer not to say'];
const ORIENTATIONS = ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'queer', 'prefer not to say'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    email: '', password: '', confirm: '',
    display_name: '', date_of_birth: '', gender: '', orientation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0); // 0: account, 1: identity

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const formatApiError = (err) => {
    const detail = err.response?.data?.detail;
    if (Array.isArray(detail)) {
      return detail.map((item) => {
        if (typeof item === 'string') return item;
        if (item?.msg) return `${item.loc?.join('.') || 'error'}: ${item.msg}`;
        return JSON.stringify(item);
      }).join(' • ');
    }
    if (typeof detail === 'string') return detail;
    if (typeof detail === 'object' && detail !== null) return JSON.stringify(detail);
    return 'Registration failed. Please try again.';
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!form.date_of_birth) { setError('Please enter your date of birth'); return; }
    setError('');
    setLoading(true);
    try {
      const { user, token } = await register({
        email: form.email,
        password: form.password,
        display_name: form.display_name,
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        orientation: form.orientation,
      });
      setAuth(user, token);
      const profile = await getMyProfile();
      setAuth(profile, token);
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[var(--surface-alt)] px-6 py-8 overflow-y-auto relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blush via-white to-rose-soft/30 pointer-events-none" />

      <motion.div
        className="relative w-full max-w-sm md:max-w-md md:bg-white/80 md:backdrop-blur md:rounded-3xl md:shadow-xl md:p-10 space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center space-y-1">
          <div className="text-5xl animate-heartbeat">💕</div>
          <h1 className="text-3xl font-black text-gradient">Create Account</h1>
          <p className="text-gray-500 text-sm">Join Loverace · Find love nearby</p>
        </div>

        {/* Step dots */}
        <div className="flex gap-2 justify-center">
          {[0, 1].map((i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-primary' : i < step ? 'w-2 bg-primary/50' : 'w-2 bg-gray-200'}`} />
          ))}
        </div>

        <form onSubmit={step === 0 ? (e) => { e.preventDefault(); if (form.email && form.password && form.confirm) setStep(1); } : handleSubmit} className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email *</label>
                <input type="email" className="input-field" placeholder="you@example.com"
                  value={form.email} onChange={(e) => set('email', e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Password *</label>
                <input type="password" className="input-field" placeholder="Min 8 characters"
                  value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={8} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Confirm password *</label>
                <input type="password" className="input-field" placeholder="Repeat password"
                  value={form.confirm} onChange={(e) => set('confirm', e.target.value)} required />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>}
              <Button type="submit">Continue →</Button>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Display name *</label>
                <input className="input-field" placeholder="How others see you" maxLength={50}
                  value={form.display_name} onChange={(e) => set('display_name', e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Date of birth *</label>
                <input type="date" className="input-field" placeholder="YYYY-MM-DD"
                  value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Gender *</label>
                <select className="input-field" value={form.gender} onChange={(e) => set('gender', e.target.value)} required>
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Orientation *</label>
                <select className="input-field" value={form.orientation} onChange={(e) => set('orientation', e.target.value)} required>
                  <option value="">Select orientation</option>
                  {ORIENTATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>}
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(0)} type="button" className="flex-1">← Back</Button>
                <Button type="submit" loading={loading} className="flex-1">Sign Up 🚀</Button>
              </div>
            </>
          )}
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
