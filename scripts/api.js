/**
 * FreelanceHub - Shared API Utility
 * Central helper for all backend communication
 *
 * SESSION ISOLATION ARCHITECTURE
 * ─────────────────────────────────────────────────────────────────────────────
 * Problem: HttpOnly cookies and localStorage are BOTH shared across all tabs
 * on the same browser origin. Two tabs logged in as different users would
 * constantly overwrite each other's session state.
 *
 * Solution: Store the JWT and all session data in sessionStorage, which is
 * 100% tab-isolated (each tab gets its own empty namespace on creation, and
 * it is destroyed when the tab closes). Send the token via Authorization header
 * instead of relying on the shared cookie. The backend already reads the Bearer
 * token first before falling back to the cookie.
 */

if (window.location.protocol === 'file:') {
  console.error("CRITICAL: You are running this app via the file:/// protocol. HttpOnly cookies will NOT work, and you will be caught in a login redirect loop. Please serve the frontend using a local web server (e.g. Live Server, npx serve).");
  setTimeout(() => alert("Please open this app through a local web server (like VS Code Live Server) instead of double-clicking the HTML file. Security cookies do not work on file:/// paths."), 1000);
}

const hostname = window.location.hostname || 'localhost';
const PROD_API = 'https://freelancehub-wjf2.onrender.com/api';
const IS_LOCAL = hostname === 'localhost' || hostname === '127.0.0.1';
let API_BASE = IS_LOCAL ? `http://${hostname}:5000/api` : PROD_API;

// ─── Backend warm-up ping ─────────────────────────────────────────────────────
(function warmUp() {
  fetch(`${API_BASE}/jobs?limit=1`, { method: 'GET', credentials: 'omit' }).catch(() => {});
}());

// ─── Tab-isolated session storage ─────────────────────────────────────────────
// All session data lives in sessionStorage. It is scoped per-tab — opening a
// new tab starts a fresh session regardless of what other tabs are doing.
const SESSION_KEY  = 'fh_user';
const TOKEN_KEY    = 'fh_token';
const CACHE_PREFIX = 'fh_cache_';

function _ssGet(key)         { try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { return null; } }
function _ssSet(key, value)  { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {} }
function _ssRemove(key)      { try { sessionStorage.removeItem(key); } catch {} }
function _ssToken()          { try { return sessionStorage.getItem(TOKEN_KEY) || null; } catch { return null; } }

// ─── Response cache (stale-while-revalidate) ──────────────────────────────────
// Cache lives in sessionStorage — tab-isolated, cleared on tab close.
const ApiCache = {
  get(key) {
    return _ssGet(CACHE_PREFIX + key); // { data, ts } — caller decides freshness
  },

  set(key, data) {
    _ssSet(CACHE_PREFIX + key, { data, ts: Date.now() });
  },

  isFresh(entry, ttl = 5 * 60 * 1000) {
    return entry && (Date.now() - entry.ts) < ttl;
  },

  clear(key) {
    _ssRemove(CACHE_PREFIX + key);
  },
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  // Inject the per-tab Bearer token if available.
  // The backend checks Authorization: Bearer first, then falls back to cookie.
  // This ensures Tab 1 always uses Token_A and Tab 2 always uses Token_B,
  // even if the shared cookie has been overwritten by the other tab.
  const tabToken = _ssToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(tabToken ? { Authorization: `Bearer ${tabToken}` } : {}),
    ...options.headers,
  };

  async function doFetch(base) {
    // 8-second timeout — prevents permanent hangs on cold/slow backends.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`${base}${endpoint}`, {
        credentials: 'include', // still send cookie as fallback for older sessions
        headers,
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) {
        const message = data.details?.[0]?.message || data.error || `Request failed: ${res.status}`;
        throw new Error(message);
      }
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. The server may be starting up — please try again.');
      }
      throw err;
    }
  }

  return doFetch(API_BASE);
}

/**
 * Stale-while-revalidate fetch.
 * Returns cached data instantly if available, refreshes in background.
 */
async function cachedFetch(cacheKey, fetcher, { ttl, onUpdate } = {}) {
  const cached = ApiCache.get(cacheKey);

  if (cached) {
    fetcher().then(fresh => {
      ApiCache.set(cacheKey, fresh);
      if (typeof onUpdate === 'function') onUpdate(fresh);
    }).catch(() => {});

    return cached.data;
  }

  const fresh = await fetcher();
  ApiCache.set(cacheKey, fresh);
  return fresh;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
const Auth = {
  register: async (payload) => {
    const data = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    // Store the tab-isolated token immediately so all subsequent requests
    // in this tab use it — even before the cookie might be overwritten by another tab.
    if (data.token) sessionStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },
  login: async (payload) => {
    const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
    if (data.token) sessionStorage.setItem(TOKEN_KEY, data.token);
    return data;
  },
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  me:     () => apiFetch('/auth/me'),
};

// ─── Users ────────────────────────────────────────────────────────────────────
const Users = {
  getProfile:    (id)     => apiFetch(`/users/${id}`),
  updateMe:      (payload) => apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(payload) }),
  getMyStats:    ()        => apiFetch('/users/me/stats'),
  getMyActivity: ()        => apiFetch('/users/me/activity'),
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────
const Jobs = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/jobs?${query}` : '/jobs';
    return apiFetch(url);
  },
  listCached: (params = {}, { onUpdate } = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/jobs?${query}` : '/jobs';
    const cacheKey = 'jobs_' + (query || 'all');
    return cachedFetch(cacheKey, () => apiFetch(url), { onUpdate });
  },
  get:    (id)          => apiFetch(`/jobs/${id}`),
  create: (payload)     => apiFetch('/jobs',       { method: 'POST',   body: JSON.stringify(payload) }),
  update: (id, payload) => apiFetch(`/jobs/${id}`, { method: 'PUT',    body: JSON.stringify(payload) }),
  delete: (id)          => apiFetch(`/jobs/${id}`, { method: 'DELETE' }),
};

// ─── Proposals ────────────────────────────────────────────────────────────────
const Proposals = {
  submit: (payload) => apiFetch('/proposals',                  { method: 'POST', body: JSON.stringify(payload) }),
  myList: ()        => apiFetch('/proposals/my'),
  forJob: (jobId)   => apiFetch(`/proposals/job/${jobId}`),
  accept: (id)      => apiFetch(`/proposals/${id}/accept`,     { method: 'PUT' }),
  reject: (id)      => apiFetch(`/proposals/${id}/reject`,     { method: 'PUT' }),
};

// ─── Messages ─────────────────────────────────────────────────────────────────
const Messages = {
  send:                 (payload) => apiFetch('/messages',          { method: 'POST', body: JSON.stringify(payload) }),
  getConversationsList: ()        => apiFetch('/messages'),
  getConversation:      (userId)  => apiFetch(`/messages/${userId}`),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
const Reviews = {
  create:  (payload) => apiFetch('/reviews',          { method: 'POST', body: JSON.stringify(payload) }),
  forUser: (userId)  => apiFetch(`/reviews/${userId}`),
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
  get: () => socketInstance,
};

// ─── Session helpers ──────────────────────────────────────────────────────────
// All session data is stored in sessionStorage (tab-isolated).
// Each tab maintains its own independent session — logging in/out in Tab 2
// has zero effect on Tab 1's session data or API credentials.

function getSession() {
  return _ssGet(SESSION_KEY);
}

function saveSession(user) {
  _ssSet(SESSION_KEY, user);
}

function clearSession() {
  _ssRemove(SESSION_KEY);
  _ssRemove(TOKEN_KEY);
  // Purge all per-tab API cache entries
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) keysToRemove.push(key);
  }
  keysToRemove.forEach(key => sessionStorage.removeItem(key));
}

/**
 * Guard: redirect to login if not authenticated.
 * Returns the cached session IMMEDIATELY for instant page renders,
 * then silently re-validates the token in the background.
 */
async function requireAuth(redirectTo = '/login.html') {
  const cached = getSession();
  if (cached) {
    // Re-validate in background — don't block rendering
    Auth.me().then(({ user }) => {
      saveSession(user);
    }).catch(() => {
      clearSession();
      window.location.href = redirectTo;
    });
    return cached;
  }

  // No cache: blocking check (first visit / after logout)
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
 * Guard for guest-only pages (login / signup).
 * Returns the active session object if a valid session exists, or null.
 */
async function requireGuest() {
  const session = getSession();
  if (!session) return null;

  try {
    const { user } = await Auth.me();
    saveSession(user);
    return user;
  } catch {
    clearSession();
    return null;
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