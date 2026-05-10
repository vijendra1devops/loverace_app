import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadarMap from '../components/radar/RadarMap';
import Modal from '../components/common/Modal';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import { useRadarStore } from '../store/radarStore';
import { useRadar } from '../hooks/useRadar';
import { getUserById } from '../services/dummyData';
import { isDummy } from '../services/dummyData';

const RADIUS_OPTIONS = [
  { label: '100m', value: 100 },
  { label: '250m', value: 250 },
  { label: '500m', value: 500 },
  { label: '1km', value: 1000 },
  { label: '2km', value: 2000 },
  { label: '5km', value: 5000 },
];

export default function RadarPage() {
  const { radius, setRadius, users } = useRadarStore();
  const [selectedUser, setSelectedUser] = useState(null);
  useRadar();

  const handleUserClick = (radarUser) => {
    const full = isDummy() ? getUserById(radarUser.user_id) : null;
    setSelectedUser(full || radarUser);
  };

  return (
    <div className="flex flex-col h-full" style={{ paddingBottom: 'var(--nav-height)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur border-b border-[var(--border)] z-10 md:px-8">
        <div>
          <h1 className="font-bold text-lg text-primary">Radar 📡</h1>
          <p className="text-xs text-gray-500">{users.length} {users.length === 1 ? 'person' : 'people'} within {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}</p>
        </div>

        {/* Radius selector */}
        <div className="flex gap-1.5 flex-wrap justify-end max-w-xs">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRadius(opt.value)}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border transition-all duration-200 ${
                radius === opt.value
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-gray-500 border-[var(--border)] hover:border-primary hover:text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Radar fills remaining space — taller on desktop */}
      <div className="relative flex-1 overflow-hidden md:min-h-0">
        <RadarMap onUserClick={handleUserClick} />
      </div>

      {/* Profile preview modal */}
      <Modal open={!!selectedUser} onClose={() => setSelectedUser(null)}>
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar
                src={selectedUser.photos?.[0]?.url || selectedUser.avatar_url}
                name={selectedUser.display_name || selectedUser.name || '?'}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 truncate">
                  {selectedUser.display_name || selectedUser.name}
                  {selectedUser.age && <span className="font-normal text-gray-500">, {selectedUser.age}</span>}
                </h3>
                {(selectedUser.occupation) && (
                  <p className="text-sm text-gray-500">{selectedUser.occupation}</p>
                )}
                <p className="text-xs text-primary font-medium mt-0.5">
                  📍 ~{selectedUser.fuzzy_distance_m < 1000
                    ? `${selectedUser.fuzzy_distance_m}m`
                    : `${(selectedUser.fuzzy_distance_m / 1000).toFixed(1)}km`} away
                </p>
              </div>
            </div>

            {selectedUser.bio && (
              <p className="text-sm text-gray-700 line-clamp-3">{selectedUser.bio}</p>
            )}

            {selectedUser.interests?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedUser.interests.slice(0, 5).map((tag) => (
                  <span key={tag} className="tag-chip">{tag}</span>
                ))}
              </div>
            )}

            <Button onClick={() => setSelectedUser(null)}>View Full Profile 💕</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
