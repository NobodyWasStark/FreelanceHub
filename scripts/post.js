let currentUser = null;
let allJobs = [];

async function init() {
  currentUser = await requireAuth();
  if (!currentUser) return;
  await loadJobs();
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const isOpen = !sidebar.classList.contains('-translate-x-full');
  sidebar.classList.toggle('-translate-x-full', isOpen);
  overlay.classList.toggle('hidden', isOpen);
}

document.getElementById('btn-post-new-job')?.addEventListener('click', function(){
  window.location.replace("/skillbridge-post-job.html")
});

function setTab(btn, tab) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('border-brand-600','text-brand-700','font-semibold');
    b.classList.add('border-transparent','text-gray-500','font-medium');
  });
  btn.classList.add('border-brand-600','text-brand-700','font-semibold');
  btn.classList.remove('border-transparent','text-gray-500');
  
  const list = document.getElementById('job-list');
  if (list) {
    const cards = list.querySelectorAll('.job-card');
    cards.forEach(c => {
      c.classList.toggle('hidden', tab !== 'all' && c.dataset.status !== tab);
    });
  }
}

async function loadJobs() {
  try {
    const { jobs } = await Jobs.list({ clientId: currentUser.id });
    allJobs = jobs;
    renderJobs();
    updateStats();
  } catch (err) {
    showToast(err.message || 'Failed to load jobs', 'error');
  }
}

function updateStats() {
  const stats = {
    total: allJobs.length,
    open: allJobs.filter(j => j.status === 'OPEN').length,
    inprogress: allJobs.filter(j => j.status === 'IN_PROGRESS').length,
    completed: allJobs.filter(j => j.status === 'COMPLETED').length
  };
  
  const statContainers = document.querySelectorAll('.grid.grid-cols-2.sm\\:grid-cols-4.gap-3 > div p.text-2xl');
  if (statContainers.length >= 4) {
    statContainers[0].innerText = stats.total;
    statContainers[1].innerText = stats.open;
    statContainers[2].innerText = stats.inprogress;
    statContainers[3].innerText = stats.completed;
  }

  updateRightPanel();
}

function updateRightPanel() {
  const totalSpentEl = document.getElementById('total-spent');
  if (totalSpentEl) {
    // Sum the budget of all COMPLETED jobs
    const total = allJobs
      .filter(j => j.status === 'COMPLETED')
      .reduce((sum, j) => sum + (j.budget || 0), 0);
    totalSpentEl.innerText = '$' + total.toLocaleString();
  }

  const recentList = document.getElementById('recent-activity-list');
  if (recentList) {
    recentList.innerHTML = `<div class="text-xs text-gray-400 py-2">No recent activity to display.</div>`;
  }

  const savedList = document.getElementById('saved-talents-list');
  if (savedList) {
    savedList.innerHTML = `<div class="text-xs text-gray-400 py-2">You haven't saved any talents yet.</div>`;
  }
}

function renderJobs() {
  const list = document.getElementById('job-list');
  if (!list) return;

  if (allJobs.length === 0) {
    list.innerHTML = `<div class="text-center py-16 text-slate-400 text-[14px]">You haven't posted any jobs yet.</div>`;
    return;
  }

  list.innerHTML = allJobs.map(job => {
    const isClosed = job.status === 'COMPLETED' || job.status === 'CANCELLED';
    const statusLower = job.status.toLowerCase().replace('_', '');
    
    let statusClass = '';
    let iconClass = '';
    let badgeColor = '';
    
    if (job.status === 'OPEN') {
      statusClass = 'bg-green-50 text-green-700';
      iconClass = 'bg-orange-50 text-orange-500';
      badgeColor = 'bg-orange-50 text-orange-600';
    } else if (job.status === 'IN_PROGRESS') {
      statusClass = 'bg-blue-100 text-blue-800';
      iconClass = 'bg-blue-50 text-blue-500';
      badgeColor = 'bg-blue-50 text-blue-600';
    } else {
      statusClass = 'bg-gray-100 text-gray-500';
      iconClass = 'bg-amber-50 text-amber-500';
      badgeColor = 'bg-amber-50 text-amber-600';
    }

    const skillLabel = job.skills?.[0] || 'General';
    const dateStr = new Date(job.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const proposalCount = job.proposals?.length || 0;

    return `
      <div data-status="${statusLower}" class="job-card group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 ${isClosed ? 'opacity-80' : ''}">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl ${iconClass} flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1.5">
              <span class="text-xs font-semibold ${badgeColor} px-2.5 py-0.5 rounded-full">${skillLabel}</span>
              <span class="flex items-center gap-1 text-xs font-semibold ${statusClass} px-2.5 py-0.5 rounded-full">
                ${job.status === 'OPEN' ? '<span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>' : ''}
                ${job.status.replace('_', ' ')}
              </span>
            </div>
            <h2 class="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors leading-snug">${job.title}</h2>
            <p class="text-xs text-gray-400 mt-0.5">Posted ${dateStr}</p>
            <div class="flex flex-wrap gap-6 mt-3">
              <div><p class="text-xs text-gray-400 mb-0.5">Budget</p><p class="text-sm font-semibold text-gray-800">$${job.budget}</p></div>
              <div><p class="text-xs text-gray-400 mb-0.5">Proposals</p><p class="text-sm font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md inline-block">${proposalCount} proposals</p></div>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-2 shrink-0">
            <a href="/skillbridge-proposal.html?jobId=${job.id}" class="text-xs font-semibold text-brand-700 border border-brand-200 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap text-center no-underline inline-block">Manage</a>
            <button class="p-1.5 rounded-md hover:bg-gray-100 transition-colors"><svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', init);