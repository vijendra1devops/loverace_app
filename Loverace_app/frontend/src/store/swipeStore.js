import { create } from 'zustand';

export const useSwipeStore = create((set, get) => ({
  feed: [],           // ProfileCard[]
  currentIndex: 0,
  swipedIds: new Set(),
  lastMatch: null,    // matched user profile (for match modal)

  setFeed: (feed) => set({ feed, currentIndex: 0, swipedIds: new Set() }),

  advance: () =>
    set((s) => ({ currentIndex: s.currentIndex + 1 })),

  markSwiped: (userId) =>
    set((s) => ({ swipedIds: new Set([...s.swipedIds, userId]) })),

  setLastMatch: (profile) => set({ lastMatch: profile }),
  clearLastMatch: () => set({ lastMatch: null }),

  currentCard: () => {
    const { feed, currentIndex } = get();
    return feed[currentIndex] || null;
  },

  remaining: () => {
    const { feed, currentIndex } = get();
    return Math.max(0, feed.length - currentIndex);
  },
}));
