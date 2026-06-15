/**
 * FreelanceHub - Shared API Utility
 * Central helper for all backend communication
 */

if (window.location.protocol === 'file:') {
  console.error("CRITICAL: You are running this app via the file:/// protocol. HttpOnly cookies will NOT work, and you will be caught in a login redirect loop. Please serve the frontend using a local web server (e.g. Live Server, npx serve).");
  setTimeout(() => alert("Please open this app through a local web server (like VS Code Live Server) instead of double-clicking the HTML file. Security cookies do not work on file:/// paths."), 1000);
}

const hostname = window.location.hostname || 'localhost';
let API_BASE = `http://${hostname}:5000/api`;

if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
  API_BASE = 'https://freelancehub-wjf2.onrender.com/api'; 
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
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

// ─── Socket helpers ──────────────────────────────────────────────────────────
let socketInstance = null;
const SocketManager = {
  init: () => {
    if (socketInstance) return socketInstance;
    if (typeof io !== 'undefined') {
      socketInstance = io(API_BASE.replace('/api', ''), {
        withCredentials: true,
      });
      return socketInstance;
    }
    return null;
  },
  get: () => socketInstance
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

function saveSession(user) {
  localStorage.setItem('fh_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('fh_user');
  localStorage.removeItem('fh_token'); // Cleanup old tokens
}

/**
 * Guard: redirect to login if not authenticated.
 * Returns the cached session IMMEDIATELY for instant page renders,
 * then silently re-validates the token in the background.
 */
async function requireAuth(redirectTo = '/login.html') {
  // 1. Return cached user instantly — page renders with no network wait
  const cached = getSession();
  if (cached) {
    // 2. Re-validate in background — don't block rendering
    Auth.me().then(({ user }) => {
      saveSession(user);
    }).catch(() => {
      // Token expired or invalid — clear session and redirect
      clearSession();
      window.location.href = redirectTo;
    });
    return cached;
  }

  // 3. No cache: must do a blocking check (first visit / after logout)
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
    // Verify cookie is still valid in background
    Auth.me().then(() => {
      redirectToDashboard(session.role);
    }).catch(() => {
      clearSession();
    });
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