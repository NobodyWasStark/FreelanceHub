/**
 * FreelanceHub - Shared API Utility
 * Central helper for all backend communication
 */

const API_BASE = 'http://localhost:5000/api';

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('fh_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
    headers,
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    // Surface the first Zod validation detail if available
    const message = data.details?.[0]?.message || data.error || `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
const Auth = {
  register: (payload) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login:    (payload) => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(payload) }),
  logout:   ()        => apiFetch('/auth/logout',   { method: 'POST' }),
  me:       ()        => apiFetch('/auth/me'),
};

// ─── Users ────────────────────────────────────────────────────────────────────
const Users = {
  getProfile: (id)     => apiFetch(`/users/${id}`),
  updateMe:   (payload) => apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(payload) }),
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────
const Jobs = {
  list:   (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/jobs?${query}` : '/jobs';
    return apiFetch(url);
  },
  get:    (id)          => apiFetch(`/jobs/${id}`),
  create: (payload)     => apiFetch('/jobs',     { method: 'POST',   body: JSON.stringify(payload) }),
  update: (id, payload) => apiFetch(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (id)          => apiFetch(`/jobs/${id}`, { method: 'DELETE' }),
};

// ─── Proposals ────────────────────────────────────────────────────────────────
const Proposals = {
  submit:  (payload) => apiFetch('/proposals',                   { method: 'POST', body: JSON.stringify(payload) }),
  myList:  ()        => apiFetch('/proposals/my'),
  forJob:  (jobId)   => apiFetch(`/proposals/job/${jobId}`),
  accept:  (id)      => apiFetch(`/proposals/${id}/accept`,      { method: 'PUT' }),
  reject:  (id)      => apiFetch(`/proposals/${id}/reject`,      { method: 'PUT' }),
};

// ─── Messages ─────────────────────────────────────────────────────────────────
const Messages = {
  send:           (payload) => apiFetch('/messages',           { method: 'POST', body: JSON.stringify(payload) }),
  getConversationsList: ()  => apiFetch('/messages'),
  getConversation:(userId)  => apiFetch(`/messages/${userId}`),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
const Reviews = {
  create:   (payload) => apiFetch('/reviews',          { method: 'POST', body: JSON.stringify(payload) }),
  forUser:  (userId)  => apiFetch(`/reviews/${userId}`),
};

// ─── Session helpers ──────────────────────────────────────────────────────────

/**
 * Reads the cached user from localStorage.
 * The server sets the JWT in an HttpOnly cookie; we store public info in localStorage.
 */
function getSession() {
  try {
    return JSON.parse(localStorage.getItem('fh_user') || 'null');
  } catch {
    return null;
  }
}

function saveSession(user, token) {
  localStorage.setItem('fh_user', JSON.stringify(user));
  if (token) localStorage.setItem('fh_token', token);
}

function clearSession() {
  localStorage.removeItem('fh_user');
  localStorage.removeItem('fh_token');
}

/**
 * Guard: redirect to login if not authenticated.
 * Call at the top of any protected page.
 */
async function requireAuth(redirectTo = '/login.html') {
  try {
    const { user } = await Auth.me();
    saveSession(user);
    return user;
  } catch {
    clearSession();
    window.location.href = redirectTo;
    return null;
  }
}

/**
 * Guard: redirect to dashboard if already logged in.
 * Call on login/signup pages.
 */
async function requireGuest() {
  const session = getSession();
  if (session) {
    // Verify cookie is still valid
    try {
      await Auth.me();
      redirectToDashboard(session.role);
    } catch {
      clearSession();
    }
  }
}

function redirectToDashboard(role) {
  if (role === 'FREELANCER') {
    window.location.href = '/freelancer%20frontend/dashboard.html';
  } else {
    window.location.href = '/skillbridge-dashboard.html';
  }
}

async function handleLogout(event) {
  if (event) event.preventDefault();
  try {
    await Auth.logout();
  } catch (err) {
    console.error('Logout error:', err);
  }
  clearSession();
  window.location.href = '/login.html';
}

// ─── Toast notification ───────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const existing = document.getElementById('fh-toast');
  if (existing) existing.remove();

  const colors = {
    success: 'bg-green-600',
    error:   'bg-red-600',
    info:    'bg-blue-600',
  };

  const toast = document.createElement('div');
  toast.id = 'fh-toast';
  toast.className = `fixed bottom-6 right-6 z-[9999] ${colors[type] || colors.success} text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in`;
  toast.style.cssText = 'animation: slideUp 0.3s ease; max-width: 340px;';
  toast.innerHTML = `
    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
      ${type === 'success' ? '<polyline points="20 6 9 17 4 12"/>' : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
    </svg>
    ${message}
  `;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// Add slide-up animation
const toastStyle = document.createElement('style');
toastStyle.textContent = `@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }`;
document.head.appendChild(toastStyle);
