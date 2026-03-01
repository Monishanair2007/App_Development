// Backend server URL - same port since backend serves frontend too
const BASE = 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('token');

const headers = () => {
  const h = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) h['Authorization'] = `Bearer ${t}`;
  return h;
};

async function req(path, options = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, { headers: headers(), ...options });
    const text = await res.text();
    if (!text) throw new Error('Server ne empty response diya - backend check karo');
    let data;
    try { data = JSON.parse(text); }
    catch (e) { throw new Error('Server response parse nahi hua: ' + text.substring(0, 100)); }
    if (!res.ok) throw new Error(data.error || 'Request failed with status ' + res.status);
    return data;
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      throw new Error('Backend se connect nahi ho pa raha. Kya START_APP.bat chala hai?');
    }
    throw err;
  }
}

export const api = {
  login: (email, password) => req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (username, email, password) => req('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) }),
  getProfile: () => req('/auth/profile'),
  updateProfile: (data) => req('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getShows: (params = {}) => req(`/shows?${new URLSearchParams(params)}`),
  getShow: (id) => req(`/shows/${id}`),
  getRecommendations: (id) => req(`/shows/${id}/recommendations`),
  getWatchlist: (status) => req(`/watchlist${status && status !== 'all' ? '?status=' + status : ''}`),
  addToWatchlist: (show_id, status) => req('/watchlist', { method: 'POST', body: JSON.stringify({ show_id, status }) }),
  updateWatchlist: (showId, data) => req(`/watchlist/${showId}`, { method: 'PUT', body: JSON.stringify(data) }),
  removeFromWatchlist: (showId) => req(`/watchlist/${showId}`, { method: 'DELETE' }),
  getWatchlistStats: () => req('/watchlist/stats'),
  getClubs: () => req('/clubs'),
  getClub: (id) => req(`/clubs/${id}`),
  createClub: (data) => req('/clubs', { method: 'POST', body: JSON.stringify(data) }),
  joinClub: (id) => req(`/clubs/${id}/join`, { method: 'POST' }),
  leaveClub: (id) => req(`/clubs/${id}/leave`, { method: 'DELETE' }),
  getDiscussions: (clubId) => req(`/clubs/${clubId}/discussions`),
  createDiscussion: (clubId, data) => req(`/clubs/${clubId}/discussions`, { method: 'POST', body: JSON.stringify(data) }),
  getComments: (clubId, discId) => req(`/clubs/${clubId}/discussions/${discId}/comments`),
  addComment: (clubId, discId, data) => req(`/clubs/${clubId}/discussions/${discId}/comments`, { method: 'POST', body: JSON.stringify(data) }),
  getPolls: (clubId) => req(`/clubs/${clubId}/polls`),
  createPoll: (clubId, data) => req(`/clubs/${clubId}/polls`, { method: 'POST', body: JSON.stringify(data) }),
  votePoll: (clubId, pollId, option) => req(`/clubs/${clubId}/polls/${pollId}/vote`, { method: 'POST', body: JSON.stringify({ option }) }),
  getReviews: (showId) => req(`/reviews/show/${showId}`),
  submitReview: (showId, data) => req(`/reviews/show/${showId}`, { method: 'POST', body: JSON.stringify(data) }),
  getAnalytics: () => req('/analytics'),
  getNotifications: () => req('/notifications'),
  markRead: (id) => req(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => req('/notifications/read-all', { method: 'PUT' }),
};
