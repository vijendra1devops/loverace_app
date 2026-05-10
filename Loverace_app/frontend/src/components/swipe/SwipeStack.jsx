import { useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import SwipeCard from './SwipeCard';
import { useSwipeStore } from '../../store/swipeStore';
import { recordSwipe } from '../../services/api';
import { triggerLike, triggerPass, triggerMatch } from './SwipeEffects';

export default function SwipeStack({ onMatch }) {
  const { feed, currentIndex, advance, markSwiped, setLastMatch } = useSwipeStore();

  const visibleCards = feed.slice(currentIndex, currentIndex + 3).reverse();

  const handleSwipe = useCallback(
    async (direction, profile) => {
      markSwiped(profile.user_id);

      if (direction === 'right') {
        triggerLike();
        try {
          const result = await recordSwipe(profile.user_id, 'right');
          if (result.matched) {
            setLastMatch(profile);
            triggerMatch();
            onMatch?.(profile);
          }
        } catch {
          // Optimistic — ignore errors in demo
        }
      } else {
        triggerPass();
        await recordSwipe(profile.user_id, 'left').catch(() => {});
      }

      advance();
    },
    [advance, markSwiped, setLastMatch, onMatch],
  );

  const empty = currentIndex >= feed.length;

  if (empty) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
        <span className="text-6xl animate-heartbeat">💕</span>
        <h3 className="text-xl font-bold text-primary">You've seen everyone nearby!</h3>
        <p className="text-sm text-gray-500">Expand your range on the Radar or check back later.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <AnimatePresence>
        {visibleCards.map((profile, reversedIdx) => {
          const isTop = reversedIdx === visibleCards.length - 1;
          const stackOffset = visibleCards.length - 1 - reversedIdx;
          return (
            <SwipeCard
              key={profile.user_id}
              profile={profile}
              isTop={isTop}
              stackOffset={stackOffset}
              onSwipe={isTop ? handleSwipe : undefined}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
