import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SwipeStack from '../components/swipe/SwipeStack';
import Modal from '../components/common/Modal';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import { useSwipeStore } from '../store/swipeStore';
import { getFeed, undoSwipe } from '../services/api';
import { useSwipeEffects } from '../components/swipe/SwipeEffects';

export default function SwipeFeedPage() {
  const { setFeed, remaining, lastMatch, clearLastMatch, currentCard } = useSwipeStore();
  const [loading, setLoading] = useState(true);
  const [undoing, setUndoing] = useState(false);

  useSwipeEffects();

  useEffect(() => {
    getFeed().then((feed) => {
      setFeed(feed || []);
    }).catch(() => {
      setFeed([]);
    }).finally(() => setLoading(false));
  }, [setFeed]);

  const handleUndo = async () => {
    setUndoing(true);
    try {
      await undoSwipe();
      // Re-fetch feed after undo (simple approach)
      const feed = await getFeed();
      setFeed(feed || []);
    } catch {
      // Ignore
    } finally {
      setUndoing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <span className="text-4xl animate-heartbeat">💕</span>
          <p className="text-sm text-gray-500 font-medium">Finding people near you…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ paddingBottom: 'var(--nav-height)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur border-b border-[var(--border)] z-10">
        <h1 className="font-bold text-lg text-primary">Discover 💕</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-medium">{remaining()} left</span>
          <button
            onClick={handleUndo}
            disabled={undoing}
            className="text-xs font-semibold text-gray-500 border border-[var(--border)] px-3 py-1.5 rounded-full hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
          >
            ↩ Undo
          </button>
        </div>
      </div>

      {/* Desktop: side-by-side layout. Mobile: stacked (unchanged). */}
      <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-center md:gap-10 md:px-10 overflow-hidden">

        {/* Card stack — mobile: fills space, desktop: fixed width */}
        <div className="flex-1 relative px-4 pt-4 pb-2 md:flex-none md:w-96 md:px-0 md:py-0 md:self-stretch md:flex md:flex-col md:justify-center">
          <SwipeStack onMatch={() => {}} />
        </div>

        {/* Action buttons — mobile only (below card) */}
        <div className="flex md:hidden items-center justify-center gap-6 px-8 py-4 bg-white/80 backdrop-blur border-t border-[var(--border)]">
          <ActionButton emoji="💔" label="Pass" bg="bg-white" ring="ring-gray-200" size="w-14 h-14" />
          <ActionButton emoji="⭐" label="Super" bg="bg-white" ring="ring-yellow-200" size="w-12 h-12" />
          <ActionButton emoji="💕" label="Like" bg="bg-gradient-to-br from-primary to-rose" ring="" size="w-14 h-14" textWhite />
        </div>

        {/* Info panel — desktop only */}
        {(() => {
          const card = currentCard();
          return (
            <div className="hidden md:flex md:flex-col md:w-80 md:gap-5 md:self-center">
              {card ? (
                <>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      {card.display_name || card.name}
                      {card.age && <span className="font-normal text-gray-500">, {card.age}</span>}
                    </h2>
                    {card.occupation && (
                      <p className="text-sm text-gray-500 mt-0.5">{card.occupation}</p>
                    )}
                    {card.distance_km != null && (
                      <p className="text-xs text-primary font-medium mt-1">
                        📍 {card.distance_km < 1 ? `${Math.round(card.distance_km * 1000)}m` : `${card.distance_km.toFixed(1)}km`} away
                      </p>
                    )}
                  </div>

                  {card.bio && (
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{card.bio}</p>
                  )}

                  {card.interests?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {card.interests.slice(0, 6).map((tag) => (
                        <span key={tag} className="tag-chip">{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Desktop action buttons */}
                  <div className="flex items-center gap-4 pt-2">
                    <ActionButton emoji="💔" label="Pass" bg="bg-white" ring="ring-gray-200" size="w-14 h-14" />
                    <ActionButton emoji="⭐" label="Super" bg="bg-white" ring="ring-yellow-200" size="w-12 h-12" />
                    <ActionButton emoji="💕" label="Like" bg="bg-gradient-to-br from-primary to-rose" ring="" size="w-14 h-14" textWhite />
                  </div>
                </>
              ) : (
                <div className="text-center space-y-3 text-gray-400">
                  <span className="text-5xl">💕</span>
                  <p className="text-sm font-medium">You've seen everyone nearby!</p>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Match modal */}
      <AnimatePresence>
        {lastMatch && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 text-center space-y-5 shadow-2xl w-full max-w-sm"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div className="text-5xl animate-match-burst">🎉</div>
              <h2 className="text-2xl font-black text-gradient">It's a Match!</h2>
              <p className="text-gray-600 text-sm">
                You and <strong>{lastMatch.display_name}</strong> liked each other!
              </p>
              <div className="flex justify-center gap-4">
                <Avatar
                  src={lastMatch.photos?.[0]?.url}
                  name={lastMatch.display_name}
                  size="xl"
                />
              </div>
              <Button onClick={clearLastMatch}>Start Chatting 💬</Button>
              <Button variant="ghost" onClick={clearLastMatch}>Keep Swiping</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({ emoji, label, bg, ring, size, textWhite }) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      className={`${size} rounded-full flex flex-col items-center justify-center shadow-md ring-2 ${ring} ${bg} gap-0.5`}
    >
      <span className="text-2xl leading-none">{emoji}</span>
      <span className={`text-[9px] font-bold ${textWhite ? 'text-white' : 'text-gray-500'}`}>{label}</span>
    </motion.button>
  );
}
