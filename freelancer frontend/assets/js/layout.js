// Ensure api.js is loaded for logout functionality
if (!document.querySelector('script[src*="api.js"]')) {
  const script = document.createElement('script');
  script.src = '../scripts/api.js';
  document.head.appendChild(script);
}

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
    loadComponent('navbar-root', 'components/navbar.html'),
    loadComponent('header-root', 'components/header.html'),
    loadComponent('footer-root', 'components/footer.html'),
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
};
