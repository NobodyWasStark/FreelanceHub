// api.js must be loaded by the page before this script

// ─── Page Loader ─────────────────────────────────────────────────────────────
// Injected synchronously so it appears instantly before any async work starts
(function () {
  const style = document.createElement('style');
  style.textContent = `
    #sb-loader {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 28px;
      background: #f8faf8;
      transition: opacity 0.35s ease, visibility 0.35s ease;
    }
    #sb-loader.sb-loader--hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }
    .sb-loader__brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .sb-loader__icon {
      width: 40px;
      height: 40px;
      background: #15803d;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sb-loader__icon svg {
      width: 22px;
      height: 22px;
      fill: none;
      stroke: #fff;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .sb-loader__wordmark {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .sb-loader__wordmark span {
      color: #15803d;
    }
    .sb-loader__bar {
      width: 180px;
      height: 3px;
      background: #e2e8f0;
      border-radius: 99px;
      overflow: hidden;
    }
    .sb-loader__bar-fill {
      height: 100%;
      width: 40%;
      background: #15803d;
      border-radius: 99px;
      animation: sb-slide 1.2s ease-in-out infinite;
    }
    @keyframes sb-slide {
      0%   { transform: translateX(-100%); }
      50%  { transform: translateX(150%); }
      100% { transform: translateX(350%); }
    }
  `;
  document.head.appendChild(style);

  const loader = document.createElement('div');
  loader.id = 'sb-loader';
  loader.innerHTML = `
    <div class="sb-loader__brand">
      <div class="sb-loader__icon">
        <svg viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div class="sb-loader__wordmark">Skill<span>Bridge</span></div>
    </div>
    <div class="sb-loader__bar">
      <div class="sb-loader__bar-fill"></div>
    </div>
  `;

  // Append as soon as body is available — use documentElement as fallback
  if (document.body) {
    document.body.appendChild(loader);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.appendChild(loader);
    });
  }
}());

function hidePageLoader() {
  const loader = document.getElementById('sb-loader');
  if (loader) {
    loader.classList.add('sb-loader--hidden');
    // Remove from DOM after transition so it doesn't affect accessibility
    setTimeout(function () { loader.remove(); }, 400);
  }
}

// ─── Component loader ─────────────────────────────────────────────────────────
async function loadComponent(targetId, path) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load component: ${path}`);
  }

  target.innerHTML = await response.text();
}

function wireSidebar() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');

  if (!menuToggle || !sidebar || !overlay) return;

  menuToggle.addEventListener('click', function () {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });

  overlay.addEventListener('click', function () {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });
}

function setActiveNav(navKey) {
  document.querySelectorAll('[data-nav-key]').forEach(link => {
    link.classList.toggle('active', link.dataset.navKey === navKey);
  });
}

function fillHeader(config) {
  const left = document.getElementById('shared-header-left');
  const right = document.getElementById('shared-header-right');

  if (left) left.innerHTML = config.headerLeft || '';
  if (right) right.innerHTML = config.headerRight || '';
}

window.initializeFreelancerLayout = async function (config) {
  // Fetch all 3 components in parallel instead of sequentially
  await Promise.all([
    loadComponent('navbar-root', 'components/navbar.html').catch(() => {}),
    loadComponent('header-root', 'components/header.html').catch(() => {}),
    loadComponent('footer-root', 'components/footer.html').catch(() => {}),
  ]);

  setActiveNav(config.activeNav);
  fillHeader(config);
  wireSidebar();

  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Populate dynamic user info in the sidebar
  const user = typeof getSession === 'function' ? getSession() : null;
  if (user) {
    const nameEl = document.getElementById('sidebar-profile-name');
    const roleEl = document.getElementById('sidebar-profile-role');
    const avatarEl = document.getElementById('sidebar-profile-avatar');
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role === 'CLIENT' ? 'Client' : 'Freelancer';
    if (avatarEl) {
      avatarEl.src = user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;
    }
  }

  // Hide the loader once the layout shell is fully rendered
  hidePageLoader();

  // Populate the My Proposals sidebar badge with live data
  if (typeof Proposals !== 'undefined' && typeof Proposals.myList === 'function') {
    Proposals.myList()
      .then(function (res) {
        const count = (res.data || []).length;
        const badge = document.getElementById('nav-proposals-badge');
        if (!badge) return;
        if (count > 0) {
          badge.textContent = count > 99 ? '99+' : String(count);
          badge.classList.remove('hidden');
        } else {
          badge.classList.add('hidden');
        }
      })
      .catch(function () {
        // Silently fail — badge stays hidden
      });
  }
};
