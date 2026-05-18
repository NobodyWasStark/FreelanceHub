document.addEventListener('DOMContentLoaded', function () {
  window.initializeFreelancerLayout({
    activeNav: 'my-proposal',
    headerLeft: `
      <a href="my-proposal.html" class="inline-flex items-center gap-2 font-bold text-green-700 no-underline">
        <i data-lucide="arrow-left" class="w-5 h-5"></i>Back to proposals
      </a>
    `,
    headerRight: `
      <a href="notification.html" class="relative p-2 rounded-lg hover:bg-green-50 text-slate-500 inline-flex"><i data-lucide="bell" class="w-5 h-5"></i></a>
    `
  }).then(function () {
    if (window.lucide) window.lucide.createIcons();
  });
});
