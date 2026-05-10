import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import { updateMyProfile } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import clsx from 'clsx';

const GENDERS = ['man', 'woman', 'non-binary', 'genderfluid', 'agender', 'prefer not to say'];
const ORIENTATIONS = ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'queer', 'prefer not to say'];
const LOOKING_FOR = ['dating', 'relationship', 'friendship', 'casual', 'marriage', 'not sure yet'];
const BODY_TYPES = ['slim', 'athletic', 'average', 'curvy', 'plus-size', 'prefer not to say'];
const EDUCATION = ['High school', 'Some college', "Bachelor's", "Master's", 'PhD', 'Vocational', 'Other'];
const INTERESTS_LIST = [
  'travel', 'music', 'art', 'fitness', 'cooking', 'reading', 'gaming', 'hiking',
  'yoga', 'dance', 'photography', 'movies', 'tech', 'fashion', 'sports', 'food',
  'meditation', 'dogs', 'cats', 'coffee', 'nature', 'activism', 'comedy', 'theatre',
];
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Bengali', 'Spanish', 'French', 'Arabic', 'Mandarin', 'Japanese', 'Korean', 'Portuguese', 'German'];

const STEPS = ['Basics', 'About You', 'Details', 'Preferences'];

function StepDots({ step, total }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'rounded-full transition-all duration-300',
            i === step ? 'w-6 h-2.5 bg-primary' : i < step ? 'w-2.5 h-2.5 bg-primary/50' : 'w-2.5 h-2.5 bg-gray-200',
          )}
        />
      ))}
    </div>
  );
}

function MultiSelect({ options, value = [], onChange, max = 6 }) {
  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else if (value.length < max) onChange([...value, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={clsx(
            'px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 tap',
            value.includes(opt)
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'bg-white text-gray-600 border-[var(--border)] hover:border-primary hover:text-primary',
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function ProfileForm({ initialData = {}, onSaved }) {
  const updateUser = useAuthStore((s) => s.updateUser);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: initialData.name || initialData.display_name || '',
    age: initialData.age || '',
    gender: initialData.gender || '',
    orientation: initialData.orientation || '',
    bio: initialData.bio || '',
    interests: initialData.interests || [],
    looking_for: initialData.looking_for || [],
    height: initialData.height || '',
    body_type: initialData.body_type || '',
    education: initialData.education || '',
    occupation: initialData.occupation || '',
    languages: initialData.languages || ['English'],
    relationship_status: initialData.relationship_status || 'single',
    max_distance: initialData.max_distance || 5000,
    age_min: initialData.age_min || 18,
    age_max: initialData.age_max || 50,
    show_age: initialData.show_age !== false,
    show_distance: initialData.show_distance !== false,
    ...initialData,
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateMyProfile(form);
      updateUser(updated);
      onSaved?.(updated);
    } catch (e) {
      console.error('Profile save error', e);
    } finally {
      setSaving(false);
    }
  };

  const stepVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  return (
    <div className="max-w-md mx-auto w-full px-4">
      <StepDots step={step} total={STEPS.length} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25 }}
          className="space-y-5"
        >
          {/* ── Step 0: Basics ── */}
          {step === 0 && (
            <>
              <h2 className="text-xl font-bold text-center text-primary">The Basics 👤</h2>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Display name *</label>
                <input className="input-field" placeholder="Your name" value={form.display_name}
                  onChange={(e) => set('display_name', e.target.value)} maxLength={50} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Age *</label>
                  <input className="input-field" type="number" placeholder="25" min={18} max={99}
                    value={form.age} onChange={(e) => set('age', parseInt(e.target.value) || '')} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Height</label>
                  <input className="input-field" placeholder="170 cm" value={form.height}
                    onChange={(e) => set('height', e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Gender *</label>
                <MultiSelect options={GENDERS} value={form.gender ? [form.gender] : []} max={1}
                  onChange={(v) => set('gender', v[0] || '')} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sexual orientation *</label>
                <MultiSelect options={ORIENTATIONS} value={form.orientation ? [form.orientation] : []} max={1}
                  onChange={(v) => set('orientation', v[0] || '')} />
              </div>
            </>
          )}

          {/* ── Step 1: About You ── */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-center text-primary">About You ✨</h2>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Bio ({form.bio.length}/300)</label>
                <textarea
                  className="input-field resize-none h-28"
                  placeholder="Tell people what makes you you…"
                  value={form.bio}
                  onChange={(e) => set('bio', e.target.value.slice(0, 300))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Interests <span className="text-gray-400 font-normal">({form.interests.length}/8)</span>
                </label>
                <MultiSelect options={INTERESTS_LIST} value={form.interests} max={8}
                  onChange={(v) => set('interests', v)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Looking for</label>
                <MultiSelect options={LOOKING_FOR} value={form.looking_for} max={3}
                  onChange={(v) => set('looking_for', v)} />
              </div>
            </>
          )}

          {/* ── Step 2: Details ── */}
          {step === 2 && (
            <>
              <h2 className="text-xl font-bold text-center text-primary">Details 📋</h2>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Occupation</label>
                <input className="input-field" placeholder="Software Engineer, Artist…" value={form.occupation}
                  onChange={(e) => set('occupation', e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Education</label>
                <MultiSelect options={EDUCATION} value={form.education ? [form.education] : []} max={1}
                  onChange={(v) => set('education', v[0] || '')} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Body type</label>
                <MultiSelect options={BODY_TYPES} value={form.body_type ? [form.body_type] : []} max={1}
                  onChange={(v) => set('body_type', v[0] || '')} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Languages <span className="text-gray-400 font-normal">({form.languages.length}/4)</span>
                </label>
                <MultiSelect options={LANGUAGES} value={form.languages} max={4}
                  onChange={(v) => set('languages', v)} />
              </div>
            </>
          )}

          {/* ── Step 3: Preferences ── */}
          {step === 3 && (
            <>
              <h2 className="text-xl font-bold text-center text-primary">Preferences 🔧</h2>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Max distance: {form.max_distance >= 1000 ? `${form.max_distance / 1000}km` : `${form.max_distance}m`}
                </label>
                <input type="range" min={100} max={50000} step={100} value={form.max_distance}
                  onChange={(e) => set('max_distance', +e.target.value)}
                  className="w-full accent-primary" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Age range: {form.age_min} – {form.age_max}
                </label>
                <div className="flex gap-3">
                  <input type="number" min={18} max={form.age_max} value={form.age_min}
                    onChange={(e) => set('age_min', +e.target.value)}
                    className="input-field w-20 text-center" />
                  <span className="self-center text-gray-400">to</span>
                  <input type="number" min={form.age_min} max={99} value={form.age_max}
                    onChange={(e) => set('age_max', +e.target.value)}
                    className="input-field w-20 text-center" />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'show_age', label: 'Show my age' },
                  { key: 'show_distance', label: 'Show distance' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between py-2 border-b border-[var(--border)] cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <button
                      type="button"
                      onClick={() => set(key, !form[key])}
                      className={clsx(
                        'w-12 h-6 rounded-full transition-colors duration-200 relative',
                        form[key] ? 'bg-primary' : 'bg-gray-200',
                      )}
                    >
                      <span className={clsx(
                        'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
                        form[key] ? 'translate-x-6' : 'translate-x-0.5',
                      )} />
                    </button>
                  </label>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button variant="ghost" onClick={prev} className="flex-1">← Back</Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={next} className="flex-1">Continue →</Button>
        ) : (
          <Button onClick={save} loading={saving} className="flex-1">Save Profile ✓</Button>
        )}
      </div>
    </div>
  );
}
