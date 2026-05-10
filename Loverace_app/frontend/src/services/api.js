import axios from 'axios';
import { isDummy, DUMMY_USERS, DUMMY_MATCHES, DUMMY_MESSAGES, DUMMY_BOND_PROGRESS, DEMO_USER, DEMO_CENTER_LAT, DEMO_CENTER_LNG } from './dummyData';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const http = axios.create({ baseURL: BASE_URL });

// Attach JWT to every request
http.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('lr_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── Auth ──────────────────────────────────────────────────────────────────

export async function login(email, password) {
  if (isDummy()) {
    const fake = { token: DEMO_USER.token, user: { ...DEMO_USER, email } };
    return fake;
  }
  const { data } = await http.post('/v1/auth/login', { email, password });
  // backend returns { access_token, token_type, user_id }
  return { user: null, token: data.access_token };
}

export async function register(payload) {
  if (isDummy()) {
    return { token: DEMO_USER.token, user: { ...DEMO_USER, ...payload } };
  }
  const { data } = await http.post('/v1/auth/register', payload);
  // backend returns { access_token, token_type, user_id }
  return { user: null, token: data.access_token };
}

// ── Profile ───────────────────────────────────────────────────────────────

export async function getMyProfile() {
  if (isDummy()) return DEMO_USER;
  const { data } = await http.get('/v1/profiles/me');
  return data;
}

export async function updateMyProfile(body) {
  if (isDummy()) return { ...DEMO_USER, ...body };
  const { data } = await http.patch('/v1/profiles/me', body);
  return data;
}

export async function getProfile(userId) {
  if (isDummy()) return DUMMY_USERS.find((u) => u.id === userId) || null;
  const { data } = await http.get(`/v1/profiles/${userId}`);
  return data;
}

// ── Location ──────────────────────────────────────────────────────────────

export async function updateLocation(lat, lng) {
  if (isDummy()) return { ok: true };
  const { data } = await http.post('/v1/location', { lat, lng });
  return data;
}

// ── Radar ─────────────────────────────────────────────────────────────────

export async function getRadar(lat, lng, radius = 5000) {
  if (isDummy()) {
    // Use fixed Delhi centre for stable positions — ignore live geolocation
    return DUMMY_USERS.filter((u) => u.distance_m <= radius).map((u) => ({
      user_id: u.id,
      display_name: u.name,
      age: u.age,
      avatar_url: u.photos[0]?.url || null,
      fuzzy_distance_m: u.distance_m,
      lat: u.lat,   // pre-computed absolute coords
      lng: u.lng,
    }));
  }
  const { data } = await http.get('/v1/radar', { params: { lat, lng, radius } });
  return data.users;
}

// ── Feed (swipe deck) ─────────────────────────────────────────────────────

export async function getFeed(limit = 20) {
  if (isDummy()) {
    return DUMMY_USERS.map((u) => ({
      user_id: u.id,
      display_name: u.name,
      age: u.age,
      gender: u.gender,
      orientation: u.orientation,
      bio: u.bio,
      interests: u.interests,
      photos: u.photos,
      height: u.height,
      occupation: u.occupation,
      education: u.education,
      distance_m: u.distance_m,
    }));
  }
  const { data } = await http.get('/v1/feed', { params: { limit } });
  return data.users;
}

// ── Swipes ────────────────────────────────────────────────────────────────

export async function recordSwipe(targetUserId, direction) {
  if (isDummy()) {
    // Simulate a random match (30% chance on like)
    const isMatch = direction === 'right' && Math.random() < 0.3;
    return { matched: isMatch, match_id: isMatch ? `m_new_${Date.now()}` : null };
  }
  const { data } = await http.post('/v1/swipes', { target_user_id: targetUserId, direction });
  return data;
}

export async function undoSwipe() {
  if (isDummy()) return { ok: true };
  const { data } = await http.post('/v1/swipes/undo');
  return data;
}

// ── Matches ───────────────────────────────────────────────────────────────

export async function getMatches() {
  if (isDummy()) return DUMMY_MATCHES;
  const { data } = await http.get('/v1/matches');
  return data.matches;
}

export async function getLikesReceived() {
  if (isDummy()) return [];
  const { data } = await http.get('/v1/likes/received');
  return data.likes;
}

export async function blockMatch(matchId) {
  if (isDummy()) return { ok: true };
  await http.post(`/v1/matches/${matchId}/block`);
}

// ── Messages (REST fallback for history) ──────────────────────────────────

export async function getMessages(conversationId) {
  if (isDummy()) return DUMMY_MESSAGES[conversationId] || [];
  const { data } = await http.get(`/v1/conversations/${conversationId}/messages`);
  return data.messages;
}

export async function getBondProgress(conversationId) {
  if (isDummy()) return DUMMY_BOND_PROGRESS[conversationId] || null;
  const { data } = await http.get(`/v1/conversations/${conversationId}/bond`);
  return data;
}
