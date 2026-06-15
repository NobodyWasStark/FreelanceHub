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

  // Fetch everything in parallel: layout shell, auth check, jobs, stats, activity
  const [, user, jobsData, statsData, activityData] = await Promise.all([
    window.initializeFreelancerLayout(layoutConfig).catch(() => {}),
    requireAuth('../login.html').catch(() => null),
    Jobs.listCached({ limit: 3 }, {
      onUpdate: (fresh) => renderRecommendedJobs(fresh.data || []),
    }).catch(() => ({ data: [] })),
    Users.getMyStats().catch(() => ({ stats: {} })),
    Users.getMyActivity().catch(() => ({ activity: [] })),
  ]);

  if (!user) return;

  // ── Welcome header ───────────────────────────────────────────────────────────
  const welcomeMsg = document.getElementById('dashboard-welcome-msg');
  const subtitleMsg = document.getElementById('dashboard-subtitle');

  if (welcomeMsg) {
    welcomeMsg.textContent = `Welcome back, ${user.name || 'Freelancer'}`;
  }

  if (subtitleMsg) {
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    subtitleMsg.textContent = `${dateString} — Your dashboard is ready.`;
  }

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const stats = statsData.stats || {};
  const statProposals = document.getElementById('stat-proposals');
  const statContracts = document.getElementById('stat-contracts');
  const statEarned    = document.getElementById('stat-earned');

  if (statProposals) statProposals.textContent = String(stats.proposalsSent ?? 0).padStart(2, '0');
  if (statContracts) statContracts.textContent = String(stats.activeContracts ?? 0).padStart(2, '0');
  if (statEarned)    statEarned.textContent    = `$${(stats.totalEarned ?? 0).toLocaleString()}`;

  // ── Recommended jobs ──────────────────────────────────────────────────────────
  renderRecommendedJobs(jobsData.data || []);

  // ── Recent activity ───────────────────────────────────────────────────────────
  renderRecentActivity(activityData.activity || []);
});

// ── Job cards ─────────────────────────────────────────────────────────────────
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
    const company     = job.client?.name || 'Unknown Client';
    const budgetStr   = `$${job.budget}`;
    const tags        = job.skills || [];
    const description = job.description || '';

    const article = document.createElement('article');
    article.className = 'sb-card p-6';
    article.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h3 class="font-jakarta text-[18px] font-extrabold text-slate-900">${escapeHtml(job.title)}</h3>
          <p class="mt-2 text-sm text-slate-500">${escapeHtml(company)} · Payment Verified</p>
        </div>
        <div class="sm:text-right"><p class="text-xl font-extrabold">${budgetStr}</p><p class="text-[10px] font-bold uppercase text-slate-400">Fixed Price</p></div>
      </div>
      <p class="mt-5 text-sm leading-7 text-slate-600">${escapeHtml(description)}</p>
      <div class="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex flex-wrap gap-2">
          ${tags.map(tag => `<span class="sb-chip">${escapeHtml(tag)}</span>`).join('')}
        </div>
        <a href="browse.html?id=${job.id}" class="sb-btn sb-btn-primary">View Job</a>
      </div>
    `;
    container.appendChild(article);
  });

  if (window.lucide) window.lucide.createIcons();
}

// ── Activity feed ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:   { label: 'Proposal Submitted',  color: 'bg-slate-300',  desc: (a) => `Applied to "${a.jobTitle}" by ${a.clientName}` },
  ACCEPTED:  { label: 'Contract Started',    color: 'bg-green-700',  desc: (a) => `Your proposal for "${a.jobTitle}" was accepted!` },
  REJECTED:  { label: 'Proposal Declined',   color: 'bg-red-400',    desc: (a) => `"${a.jobTitle}" by ${a.clientName}` },
  WITHDRAWN: { label: 'Proposal Withdrawn',  color: 'bg-slate-300',  desc: (a) => `You withdrew your bid on "${a.jobTitle}"` },
};

function renderRecentActivity(activity) {
  const container = document.getElementById('recent-activity-container');
  if (!container) return;

  if (activity.length === 0) {
    container.innerHTML = `<p class="text-sm text-slate-400">No recent activity yet. Submit a proposal to get started!</p>`;
    return;
  }

  container.innerHTML = activity.map(item => {
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
    return `
      <div class="flex gap-3">
        <span class="mt-1 w-2 h-2 rounded-full flex-shrink-0 ${cfg.color}"></span>
        <div>
          <p class="text-sm font-bold">${cfg.label}</p>
          <p class="text-xs text-slate-500">${escapeHtml(cfg.desc(item))}</p>
        </div>
      </div>`;
  }).join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
