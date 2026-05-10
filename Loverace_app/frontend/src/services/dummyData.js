/**
 * Dummy data for demo/showcase mode (VITE_DUMMY_DATA=true).
 * No backend required — all API calls are intercepted and return this data.
 */

// Fixed demo centre — New Delhi.  All radar offsets are relative to this.
export const DEMO_CENTER_LAT = 28.6139;
export const DEMO_CENTER_LNG = 77.2090;

export const DEMO_USER = {
  id: 'me',
  name: 'You',
  age: 25,
  gender: 'woman',
  orientation: 'straight',
  bio: 'Exploring Loverace in demo mode 💕 | Delhi girl | Coffee & chaos',
  interests: ['music', 'art', 'travel', 'food'],
  photos: [{ url: '/assests/gojo.jpeg' }],
  token: 'demo-token-abc123',
};

// Known avatar files in the assets folder — use these for demo users so
// we don't repeat the same face across radar/swipe in demo mode.
const AVATAR_FILES = [
  'nyra-post-04.jpg',
  'nyra-post-05.jpg',
  'nyra-post-06.jpg',
  'nyra-post-07.jpg',
  'nyra-post-08.jpg',
  'sakshi-post-04.jpg',
  'sakshi-post-23.jpg',
  'sakshi-post-24.jpg',
  'sakshi-post-25.jpg',
  'sakshi-post-35.jpg',
  'sakshi-post-37.jpg',
];

const av = (name) => `/assests/avatars/${name}`;
const avatarAt = (i) => av(AVATAR_FILES[i % AVATAR_FILES.length]);

// All profiles use real avatar images from the assets folder (unique per user)
// Names are authentic Indian female full names.
export const DUMMY_USERS = [
  {
    id: 'u1', name: 'Priya Sharma', age: 26, gender: 'woman', orientation: 'straight',
    bio: 'Coffee lover ☕ | Solo traveler ✈️ | UX nerd',
    interests: ['travel', 'coffee', 'yoga', 'design'],
    photos: [{ url: avatarAt(0) }],
    lat_offset: 0.0009, lng_offset: 0.0005, distance_m: 100,
    height: '165 cm', occupation: 'UX Designer', education: 'B.Design',
    lat: DEMO_CENTER_LAT + 0.0009, lng: DEMO_CENTER_LNG + 0.0005,
  },
  {
    id: 'u2', name: 'Anika Mehta', age: 24, gender: 'woman', orientation: 'bisexual',
    bio: 'Software engineer 💻 | Guitar enthusiast 🎸 | Dog mom 🐕',
    interests: ['music', 'tech', 'hiking', 'dogs'],
    photos: [{ url: avatarAt(1) }],
    lat_offset: 0.0022, lng_offset: 0.0012, distance_m: 250,
    height: '163 cm', occupation: 'Software Engineer', education: 'B.Tech',
    lat: DEMO_CENTER_LAT + 0.0022, lng: DEMO_CENTER_LNG + 0.0012,
  },
  {
    id: 'u3', name: 'Kavya Kapoor', age: 23, gender: 'woman', orientation: 'lesbian',
    bio: 'Artist 🎨 | Plant parent 🌿 | Overthinker with good vibes',
    interests: ['art', 'plants', 'vegan', 'meditation'],
    photos: [{ url: avatarAt(2) }],
    lat_offset: 0.0041, lng_offset: -0.0022, distance_m: 500,
    height: '162 cm', occupation: 'Illustrator', education: 'Fine Arts',
    lat: DEMO_CENTER_LAT + 0.0041, lng: DEMO_CENTER_LNG - 0.0022,
  },
  {
    id: 'u4', name: 'Sneha Verma', age: 27, gender: 'woman', orientation: 'straight',
    bio: 'Foodie 🍜 | Fitness freak 💪 | Weekend hiker',
    interests: ['food', 'fitness', 'hiking', 'cooking'],
    photos: [{ url: avatarAt(3) }],
    lat_offset: 0.0082, lng_offset: 0.0035, distance_m: 1000,
    height: '167 cm', occupation: 'Nutritionist', education: 'M.Sc Nutrition',
    lat: DEMO_CENTER_LAT + 0.0082, lng: DEMO_CENTER_LNG + 0.0035,
  },
  {
    id: 'u5', name: 'Pooja Singh', age: 25, gender: 'woman', orientation: 'straight',
    bio: 'Doctor by day 👩‍⚕️ Dancer by night 💃',
    interests: ['dance', 'health', 'music', 'travel'],
    photos: [{ url: avatarAt(4) }],
    lat_offset: 0.0148, lng_offset: -0.0095, distance_m: 2000,
    height: '158 cm', occupation: 'Physician', education: 'MBBS',
    lat: DEMO_CENTER_LAT + 0.0148, lng: DEMO_CENTER_LNG - 0.0095,
  },
  {
    id: 'u6', name: 'Divya Iyer', age: 28, gender: 'woman', orientation: 'pansexual',
    bio: 'Storyteller 🎙️ | Movie buff 🎬 | Yoga is my therapy',
    interests: ['content', 'movies', 'yoga', 'books'],
    photos: [{ url: avatarAt(5) }],
    lat_offset: 0.025, lng_offset: 0.019, distance_m: 3500,
    height: '170 cm', occupation: 'Content Creator', education: 'Mass Communication',
    lat: DEMO_CENTER_LAT + 0.025, lng: DEMO_CENTER_LNG + 0.019,
  },
  {
    id: 'u7', name: 'Ishita Joshi', age: 22, gender: 'woman', orientation: 'bisexual',
    bio: 'Fashion designer ✂️ | Vintage collector | LGBTQ+ advocate 🏳️‍🌈',
    interests: ['fashion', 'art', 'activism', 'vintage'],
    photos: [{ url: avatarAt(6) }],
    lat_offset: -0.0028, lng_offset: 0.0065, distance_m: 750,
    height: '169 cm', occupation: 'Fashion Designer', education: 'NIFT',
    lat: DEMO_CENTER_LAT - 0.0028, lng: DEMO_CENTER_LNG + 0.0065,
  },
  {
    id: 'u8', name: 'Riya Bose', age: 29, gender: 'woman', orientation: 'straight',
    bio: 'Entrepreneur 🚀 | Traveler | Life is an adventure',
    interests: ['business', 'travel', 'food', 'adventure'],
    photos: [{ url: avatarAt(7) }],
    lat_offset: 0.0118, lng_offset: -0.0082, distance_m: 1500,
    height: '164 cm', occupation: 'Startup Founder', education: 'MBA',
    lat: DEMO_CENTER_LAT + 0.0118, lng: DEMO_CENTER_LNG - 0.0082,
  },
  {
    id: 'u9', name: 'Tanvi Kulkarni', age: 26, gender: 'woman', orientation: 'straight',
    bio: 'Architect 🏛️ | Bookworm | Coffee shop hopper ☕',
    interests: ['architecture', 'books', 'coffee', 'art'],
    photos: [{ url: avatarAt(8) }],
    lat_offset: 0.0178, lng_offset: 0.0122, distance_m: 2500,
    height: '163 cm', occupation: 'Architect', education: 'B.Arch',
    lat: DEMO_CENTER_LAT + 0.0178, lng: DEMO_CENTER_LNG + 0.0122,
  },
  {
    id: 'u10', name: 'Meera Pillai', age: 31, gender: 'woman', orientation: 'bisexual',
    bio: 'Musician 🎵 | Yoga teacher 🧘 | Ocean soul 🌊',
    interests: ['music', 'yoga', 'ocean', 'meditation'],
    photos: [{ url: avatarAt(9) }],
    lat_offset: -0.0052, lng_offset: -0.0043, distance_m: 650,
    height: '161 cm', occupation: 'Music Instructor', education: 'B.Music',
    lat: DEMO_CENTER_LAT - 0.0052, lng: DEMO_CENTER_LNG - 0.0043,
  },
];

// Fuzzy bucket distances (mirrors backend)
export const DISTANCE_BUCKETS = [100, 250, 500, 1000, 2000, 5000];
export function fuzzyDistance(d) {
  return DISTANCE_BUCKETS.find((b) => b >= d) || DISTANCE_BUCKETS[DISTANCE_BUCKETS.length - 1];
}
export function formatDistance(d) {
  if (d < 1000) return `~${d}m`;
  return `~${(d / 1000).toFixed(1)}km`;
}

export const DUMMY_MATCHES = [
  {
    id: 'm1', userId: 'u1', conversationId: 'c1',
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    lastMessage: 'Hey! Nice to match with you 😊',
    lastMessageAt: new Date(Date.now() - 1_800_000).toISOString(),
    unread: 1, bondStage: 1, bondLevel: 5, stageName: 'Dating',
  },
  {
    id: 'm2', userId: 'u3', conversationId: 'c2',
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    lastMessage: 'What are your hobbies?',
    lastMessageAt: new Date(Date.now() - 43_200_000).toISOString(),
    unread: 0, bondStage: 1, bondLevel: 12, stageName: 'Dating',
  },
  {
    id: 'm3', userId: 'u5', conversationId: 'c3',
    createdAt: new Date(Date.now() - 172_800_000).toISOString(),
    lastMessage: 'That sounds amazing!',
    lastMessageAt: new Date(Date.now() - 86_400_000).toISOString(),
    unread: 2, bondStage: 2, bondLevel: 7, stageName: 'Couples',
  },
];

export const DUMMY_MESSAGES = {
  c1: [
    { id: 'msg1', senderId: 'u1', text: 'Hey! Nice to match with you 😊', createdAt: new Date(Date.now() - 1_800_000).toISOString() },
    { id: 'msg2', senderId: 'me', text: 'Hi Priya! Love your travel pics!', createdAt: new Date(Date.now() - 1_700_000).toISOString() },
    { id: 'msg3', senderId: 'u1', text: 'Thank you! Where are you from?', createdAt: new Date(Date.now() - 1_600_000).toISOString() },
  ],
  c2: [
    { id: 'msg4', senderId: 'u3', text: 'Hey, your profile looks so interesting!', createdAt: new Date(Date.now() - 43_200_000).toISOString() },
    { id: 'msg5', senderId: 'me', text: 'Thanks! I love art too 🎨', createdAt: new Date(Date.now() - 43_100_000).toISOString() },
    { id: 'msg6', senderId: 'u3', text: 'What are your hobbies?', createdAt: new Date(Date.now() - 43_000_000).toISOString() },
  ],
  c3: [
    { id: 'msg7', senderId: 'u5', text: 'Hi! I saw you like dancing too!', createdAt: new Date(Date.now() - 86_400_000).toISOString() },
    { id: 'msg8', senderId: 'me', text: 'Yes! Salsa is my favorite. Do you dance?', createdAt: new Date(Date.now() - 86_300_000).toISOString() },
    { id: 'msg9', senderId: 'u5', text: 'That sounds amazing!', createdAt: new Date(Date.now() - 86_200_000).toISOString() },
  ],
};

export const DUMMY_BOND_PROGRESS = {
  c1: { stage: 1, level: 5, stageXp: 65, stageName: 'Dating', wordsNeeded: 18, totalWords: 127 },
  c2: { stage: 1, level: 12, stageXp: 132, stageName: 'Dating', wordsNeeded: 32, totalWords: 458 },
  c3: { stage: 2, level: 7, stageXp: 78, stageName: 'Couples', wordsNeeded: 62, totalWords: 1340 },
};

export const getUserById = (id) => DUMMY_USERS.find((u) => u.id === id);
export const getMatchByConvId = (cid) => DUMMY_MATCHES.find((m) => m.conversationId === cid);

/**
 * Returns true when running in demo/dummy mode.
 * Priority: localStorage override (set via Settings toggle) → VITE_DUMMY_DATA env var.
 * Changing via the settings toggle triggers a page reload so all stores re-initialise.
 */
export const isDummy = () => {
  const override = localStorage.getItem('lr_demo_mode');
  if (override !== null) return override === 'true';
  return import.meta.env.VITE_DUMMY_DATA === 'true';
};

// XP engine mirror (pure client-side for demo)
export function wordsNeeded(level, stage) {
  return 10 + (level - 1) * 2 + (stage - 1) * 50;
}
export function xpToLevel(stageXp, stage) {
  let remaining = stageXp;
  for (let l = 1; l <= 101; l++) {
    const needed = wordsNeeded(l, stage);
    if (remaining < needed) return { level: l, progressXp: remaining, levelXp: needed };
    remaining -= needed;
  }
  return { level: 101, progressXp: stageXp, levelXp: wordsNeeded(101, stage) };
}
