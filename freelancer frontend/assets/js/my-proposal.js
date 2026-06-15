function setProposalTab(status, button) {
  document.querySelectorAll('.proposal-tab').forEach(tab => tab.classList.remove('active'));
  button.classList.add('active');
  document.querySelectorAll('.proposal-card').forEach(card => {
    card.classList.toggle('hidden', status !== 'all' && card.dataset.status !== status);
  });
}

async function loadMyProposals() {
  const container = document.getElementById('proposalsContainer');
  try {
    const { data: proposals } = await Proposals.myList();

    // Update tab counts
    const activeCount = proposals.filter(p => p.status === 'ACCEPTED').length;
    const submittedCount = proposals.filter(p => p.status === 'PENDING').length;
    const activeTab = document.querySelector('[data-status="active"]');
    const pendingTab = document.querySelector('[data-status="pending"]');
    if (activeTab) activeTab.textContent = `Active (${activeCount})`;
    if (pendingTab) pendingTab.textContent = `Submitted (${submittedCount})`;

    if (!proposals || proposals.length === 0) {
      container.innerHTML = '<p class="text-slate-500 text-center py-10">You have no active proposals.</p>';
      return;
    }

    container.innerHTML = proposals.map(p => {
      const job = p.job || {};
      const statusColor = p.status === 'PENDING'  ? 'bg-blue-100 text-blue-700'  :
                          p.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                                    'bg-red-100 text-red-700';
      return `
        <article class="proposal-card sb-card p-6" data-status="${p.status.toLowerCase()}">
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="${statusColor} px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">${p.status}</span>
                <span class="text-xs text-slate-400">Submitted ${new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 class="font-jakarta text-xl font-extrabold text-slate-900">${job.title || 'Unknown Job'}</h3>
              <p class="text-sm text-slate-500 mt-1">Budget: $${(job.budget || 0).toLocaleString()} • Status: ${job.status || 'N/A'}</p>
            </div>
            <div class="text-right">
              <p class="text-2xl font-extrabold text-slate-900">$${(p.amount || 0).toLocaleString()}</p>
              <p class="text-[10px] font-bold uppercase text-slate-400">Your Bid</p>
            </div>
          </div>
          <div class="mt-4 flex gap-3">
            <a href="messages.html?userId=${job.clientId || ''}&name=${encodeURIComponent(job.client?.name || 'Client')}" class="px-4 py-2 text-[13px] font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors">Messages</a>
          </div>
        </article>
      `;
    }).join('');
  } catch (err) {
    console.error('Proposals error:', err);
    if (container) {
      container.innerHTML = '<p class="text-slate-500 text-center py-10">No proposals yet. <a href="find-work.html" class="text-green-700 font-bold">Find work to get started.</a></p>';
    }
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  const layoutConfig = {
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
  };

  // Auth + layout + data all in parallel — layout renders the shell immediately
  const [, user] = await Promise.all([
    window.initializeFreelancerLayout(layoutConfig).catch(() => {}),
    requireAuth('../login.html').catch(() => null),
  ]);

  if (!user) return; // requireAuth already redirected to login

  // Load proposals only after auth is confirmed
  await loadMyProposals();

  document.querySelectorAll('.proposal-tab').forEach(button => {
    button.addEventListener('click', () => setProposalTab(button.dataset.status, button));
  });

  if (window.lucide) window.lucide.createIcons();
});
