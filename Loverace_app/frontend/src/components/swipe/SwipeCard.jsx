import { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useAnimationControls } from 'framer-motion';
import clsx from 'clsx';

const SWIPE_THRESHOLD = 100;   // px to trigger swipe
const VELOCITY_THRESHOLD = 500; // px/s

const INTEREST_COLORS = [
  'bg-pink-100 text-pink-700',
  'bg-red-100 text-red-700',
  'bg-rose-100 text-rose-600',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-purple-100 text-purple-700',
];

export default function SwipeCard({ profile, onSwipe, stackOffset = 0, isTop = false }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [30, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -30], [1, 0]);
  const controls = useAnimationControls();
  const isDragging = useRef(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  async function handleDragEnd(_, info) {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      await controls.start({ x: 600, rotate: 25, opacity: 0, transition: { duration: 0.35 } });
      onSwipe?.('right', profile);
    } else if (offset < -SWIPE_THRESHOLD || velocity < -VELOCITY_THRESHOLD) {
      await controls.start({ x: -600, rotate: -25, opacity: 0, transition: { duration: 0.35 } });
      onSwipe?.('left', profile);
    } else {
      controls.start({ x: 0, rotate: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } });
    }
  }

  const photos = profile.photos || [];
  const currentPhoto = photos[photoIdx]?.url || null;

  return (
    <motion.div
      className={clsx(
        'absolute w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-card bg-white no-select',
        isTop ? 'cursor-grab active:cursor-grabbing z-30' : 'z-20',
      )}
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        scale: 1 - stackOffset * 0.04,
        y: stackOffset * 12,
        originY: 1.2,
      }}
      animate={isTop ? controls : undefined}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={() => { isDragging.current = true; }}
      onDragEnd={handleDragEnd}
    >
      {/* Photo */}
      <div className="relative h-[65vw] max-h-96 bg-blush">
        {currentPhoto ? (
          <img
            src={currentPhoto}
            alt={profile.display_name}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blush to-rose-soft">
            <span className="text-7xl">{profile.display_name?.[0] || '?'}</span>
          </div>
        )}

        {/* Photo dots */}
        {photos.length > 1 && (
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                className={clsx(
                  'h-1.5 rounded-full transition-all duration-200',
                  i === photoIdx ? 'bg-white w-5' : 'bg-white/50 w-1.5',
                )}
                onClick={(e) => { e.stopPropagation(); setPhotoIdx(i); }}
              />
            ))}
          </div>
        )}

        {/* Photo tap zones */}
        {isTop && photos.length > 1 && (
          <>
            <button
              className="absolute left-0 top-0 w-1/3 h-full opacity-0"
              onClick={() => setPhotoIdx((i) => Math.max(0, i - 1))}
              aria-label="Previous photo"
            />
            <button
              className="absolute right-0 top-0 w-1/3 h-full opacity-0"
              onClick={() => setPhotoIdx((i) => Math.min(photos.length - 1, i + 1))}
              aria-label="Next photo"
            />
          </>
        )}

        {/* Like overlay */}
        {isTop && (
          <motion.div
            className="absolute inset-0 flex items-center justify-start pl-8 swipe-like-overlay rounded-3xl"
            style={{ opacity: likeOpacity }}
          >
            <span className="text-white font-black text-4xl border-4 border-white rounded-xl px-4 py-2 rotate-[-20deg]">
              LIKE
            </span>
          </motion.div>
        )}

        {/* Nope overlay */}
        {isTop && (
          <motion.div
            className="absolute inset-0 flex items-center justify-end pr-8 swipe-nope-overlay rounded-3xl"
            style={{ opacity: nopeOpacity }}
          >
            <span className="text-white font-black text-4xl border-4 border-white rounded-xl px-4 py-2 rotate-[20deg]">
              NOPE
            </span>
          </motion.div>
        )}

        {/* Gradient fade to info */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Name + age on photo */}
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <h2 className="font-bold text-2xl leading-tight">
            {profile.display_name}, <span className="font-normal">{profile.age}</span>
          </h2>
          {profile.occupation && (
            <p className="text-sm text-white/80 mt-0.5">{profile.occupation}</p>
          )}
        </div>
      </div>

      {/* Info panel */}
      <div className="p-4 space-y-3">
        {/* Distance */}
        {profile.distance_m != null && (
          <p className="text-xs text-gray-400 font-medium">
            📍 ~{profile.distance_m < 1000 ? `${profile.distance_m}m` : `${(profile.distance_m / 1000).toFixed(1)}km`} away
          </p>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{profile.bio}</p>
        )}

        {/* Interests */}
        {profile.interests?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 5).map((tag, i) => (
              <span
                key={tag}
                className={clsx('tag-chip text-xs', INTEREST_COLORS[i % INTEREST_COLORS.length])}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
