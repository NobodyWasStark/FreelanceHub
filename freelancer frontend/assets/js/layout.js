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
  await loadComponent('navbar-root', 'components/navbar.html');
  await loadComponent('header-root', 'components/header.html');
  await loadComponent('footer-root', 'components/footer.html');

  setActiveNav(config.activeNav);
  fillHeader(config);
  wireSidebar();

  if (window.lucide) {
    window.lucide.createIcons();
  }
};
