function showToast(text) {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 1800);
}

document.addEventListener('DOMContentLoaded', function () {
  window.initializeFreelancerLayout({
    activeNav: 'find-work',
    headerLeft: `
      <a href="browse.html" class="inline-flex items-center gap-2 font-bold text-green-700 no-underline">
        <i data-lucide="arrow-left" class="w-5 h-5"></i>Back to job details
      </a>
    `,
    headerRight: `
      <a href="notification.html" class="relative p-2 rounded-lg hover:bg-green-50 text-slate-500 inline-flex"><i data-lucide="bell" class="w-5 h-5"></i></a>
    `
  }).then(function () {
    const form = document.getElementById('proposalForm');
    const saveDraft = document.getElementById('saveDraft');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      window.location.href = 'proposal_view.html';
    });

    saveDraft.addEventListener('click', function () {
      showToast('Proposal draft saved');
    });

    if (window.lucide) window.lucide.createIcons();
  });
});
