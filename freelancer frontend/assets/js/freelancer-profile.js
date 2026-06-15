document.addEventListener('DOMContentLoaded', function () {
  window.initializeFreelancerLayout({
    activeNav: 'profile',
    headerLeft: `
      <div class="relative hidden md:block w-full max-w-sm">
        <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
        <input class="sb-input w-full pl-9 pr-3 py-2" placeholder="Search projects or skills...">
      </div>
    `,
    headerRight: `
      <a href="notification.html" class="relative p-2 rounded-lg hover:bg-green-50 text-slate-500 inline-flex"><i data-lucide="bell" class="w-5 h-5"></i></a>
      <a href="find-work.html" class="sb-btn sb-btn-primary">Find Work <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
    `
  }).then(function () {
    const user = typeof getSession === 'function' ? getSession() : null;
    if (user) {
      const nameEl = document.getElementById('profile-name');
      const roleEl = document.getElementById('profile-role');
      const initialsEl = document.getElementById('profile-initials');
      const bioEl = document.getElementById('profile-bio');
      
      if (nameEl) nameEl.textContent = user.name;
      if (roleEl) roleEl.textContent = user.role === 'FREELANCER' ? 'Freelancer Profile' : 'Client Profile';
      if (initialsEl) initialsEl.textContent = user.name.split(/\s+/).slice(0, 2).map(word => word[0] || '').join('').toUpperCase() || 'U';
      if (bioEl) bioEl.textContent = user.bio || 'Freelancer specializing in delivering great work on time.';
    }

    if (window.lucide) window.lucide.createIcons();
  });
});
