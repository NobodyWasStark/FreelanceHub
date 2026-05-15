function setProposalTab(status, button) {
  document.querySelectorAll('.proposal-tab').forEach(tab => tab.classList.remove('active'));
  button.classList.add('active');
  document.querySelectorAll('.proposal-card').forEach(card => {
    card.classList.toggle('hidden', status !== 'all' && card.dataset.status !== status);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  window.initializeFreelancerLayout({
    activeNav: 'my-proposal',
    headerLeft: `
      <div class="relative hidden md:block w-full max-w-sm">
        <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
        <input class="sb-input w-full pl-9 pr-3 py-2" placeholder="Search proposals...">
      </div>
    `,
    headerRight: `
      <a href="find-work.html" class="sb-btn sb-btn-primary ml-auto">Find More Work</a>
    `
  }).then(function () {
    document.querySelectorAll('.proposal-tab').forEach(button => {
      button.addEventListener('click', () => setProposalTab(button.dataset.status, button));
    });
    if (window.lucide) window.lucide.createIcons();
  });
});
