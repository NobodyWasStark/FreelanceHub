document.addEventListener('DOMContentLoaded', async function () {
  const layoutConfig = {
    activeNav: 'dashboard',
    headerLeft: `
      <div class="hidden md:flex flex-1 max-w-sm">
        <div class="relative w-full">
          <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
          <input type="text" placeholder="Search for jobs..." class="sb-input w-full pl-9 pr-3 py-2">
        </div>
      </div>
    `,
    headerRight: `
      <a href="notification.html" class="relative p-2 rounded-lg hover:bg-green-50 text-slate-500 inline-flex"><i data-lucide="bell" class="w-5 h-5"></i><span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span></a>
      <a href="find-work.html" class="sb-btn sb-btn-primary">Find Work <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
    `
  };

  // Run all three in parallel: layout, auth check, and job data
  // Layout MUST NOT wait on auth — it renders the shell unconditionally
  const [, user, jobsData] = await Promise.all([
    window.initializeFreelancerLayout(layoutConfig).catch(() => {}),
    requireAuth('../login.html').catch(() => null),
    // listCached: returns localStorage instantly, refreshes in background
    Jobs.listCached({ limit: 3 }, {
      onUpdate: (fresh) => renderRecommendedJobs(fresh.data || []),
    }).catch(() => ({ data: [] })),
  ]);

  // If auth failed or no session, requireAuth already redirected — stop here
  if (!user) return;

  // Populate welcome header
  const welcomeMsg = document.getElementById('dashboard-welcome-msg');
  const subtitleMsg = document.getElementById('dashboard-subtitle');

  if (welcomeMsg) {
    welcomeMsg.textContent = `Welcome back, ${user.name || 'Freelancer'}`;
  }

  if (subtitleMsg) {
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const newMessages = user.stats?.newMessages || 0;
    const activeInterviews = user.stats?.activeInterviews || 0;
    subtitleMsg.textContent = `${dateString} — You have ${newMessages} new messages and ${activeInterviews} active interviews.`;
  }

  // Populate stats
  const statProposals = document.getElementById('stat-proposals');
  const statContracts = document.getElementById('stat-contracts');
  const statEarned = document.getElementById('stat-earned');

  if (statProposals) statProposals.textContent = (user.stats?.proposalsSent || 0).toString().padStart(2, '0');
  if (statContracts) statContracts.textContent = (user.stats?.activeContracts || 0).toString().padStart(2, '0');
  if (statEarned) statEarned.textContent = `$${(user.stats?.totalEarned || 0).toLocaleString()}`;

  renderRecommendedJobs(jobsData.data || []);
});

function renderRecommendedJobs(jobs) {
  const container = document.getElementById('recommended-jobs-container');
  if (!container) return;

  if (jobs.length === 0) {
    container.innerHTML = `
      <article class="sb-card p-6 text-center text-slate-500">
        No recommended jobs found at the moment.
      </article>`;
    return;
  }

  container.innerHTML = '';
  jobs.forEach(job => {
    const company = job.client?.name || 'Unknown Client';
    const budgetStr = `$${job.budget}`;
    const tags = job.skills || [];
    const description = job.description || '';

    const article = document.createElement('article');
    article.className = 'sb-card p-6';
    article.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h3 class="font-jakarta text-[18px] font-extrabold text-slate-900">${job.title}</h3>
          <p class="mt-2 text-sm text-slate-500">${company} - Payment Verified - Intermediate</p>
        </div>
        <div class="sm:text-right"><p class="text-xl font-extrabold">${budgetStr}</p><p class="text-[10px] font-bold uppercase text-slate-400">Fixed Price</p></div>
      </div>
      <p class="mt-5 text-sm leading-7 text-slate-600">${description}</p>
      <div class="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex flex-wrap gap-2">
          ${tags.map(tag => `<span class="sb-chip">${tag}</span>`).join('')}
        </div>
        <a href="browse.html?id=${job.id}" class="sb-btn sb-btn-primary">View Job</a>
      </div>
    `;
    container.appendChild(article);
  });

  if (window.lucide) window.lucide.createIcons();
}
