import { create } from 'zustand';

export const useRadarStore = create((set) => ({
  users: [],          // RadarUser[]
  radius: 2000,       // metres
  userLat: null,
  userLng: null,
  lastFetch: null,

  setUsers: (users) => set({ users }),
  setRadius: (radius) => set({ radius }),
  setPosition: (lat, lng) => set({ userLat: lat, userLng: lng }),
  markFetched: () => set({ lastFetch: Date.now() }),

  addUser: (user) =>
    set((s) => ({
      users: s.users.some((u) => u.user_id === user.user_id)
        ? s.users
        : [...s.users, user],
    })),

  removeUser: (userId) =>
    set((s) => ({ users: s.users.filter((u) => u.user_id !== userId) })),
}));
