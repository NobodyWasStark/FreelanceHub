document.addEventListener('DOMContentLoaded', function () {
  window.initializeFreelancerLayout({
    activeNav: 'reports',
    headerLeft: `
      <div class="relative flex-1 max-w-2xl">
        <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
        <input type="text" placeholder="Search reports, clients, or projects..." class="sb-input w-full pl-11 pr-4 py-2 bg-white">
      </div>
    `,
    headerRight: `
      <button type="button" class="p-2 rounded-lg hover:bg-green-50 text-slate-500 inline-flex" aria-label="Notifications"><i data-lucide="bell" class="w-5 h-5"></i></button>
      <button type="button" class="p-2 rounded-lg hover:bg-green-50 text-slate-500 inline-flex" aria-label="Help"><i data-lucide="circle-help" class="w-5 h-5"></i></button>
      <a href="settings.html" aria-label="Open profile settings"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Noor Chowdhury" class="w-8 h-8 rounded-full bg-slate-800" /></a>
    `
  }).then(function () {
    document.querySelectorAll('.report-range').forEach(button => {
      button.addEventListener('click', function () {
        document.querySelectorAll('.report-range').forEach(item => item.classList.remove('active'));
        this.classList.add('active');
      });
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
});
