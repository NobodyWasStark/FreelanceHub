function showToast(text) {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 1800);
}

document.addEventListener('DOMContentLoaded', function () {
  window.initializeFreelancerLayout({
    activeNav: 'browse',
    headerLeft: `
      <a href="find-work.html" class="inline-flex items-center gap-2 font-bold text-green-700 no-underline">
        <i data-lucide="arrow-left" class="w-5 h-5"></i>Back to search
      </a>
    `,
    headerRight: `
      <a href="notification.html" class="relative p-2 rounded-lg hover:bg-green-50 text-slate-500 inline-flex"><i data-lucide="bell" class="w-5 h-5"></i></a>
    `
  }).then(function () {
    document.getElementById('saveJob').addEventListener('click', () => showToast('Job saved'));
    document.getElementById('submitProposal').addEventListener('click', () => {
      window.location.href = 'submit_proposal.html';
    });
    if (window.lucide) window.lucide.createIcons();
  });
});
