let currentUser = null;

async function init() {
  currentUser = await requireAuth();
  if (!currentUser) return;

  if (currentUser.role === 'CLIENT') {
    await renderClientProfile();
  } else {
    // Basic freelancer profile implementation for now
    await renderFreelancerProfile();
  }
}

async function renderClientProfile() {
  const container = document.getElementById('profile-main');
  if (!container) return;

  let jobs = [];
  try {
    const res = await Jobs.list({ clientId: currentUser.id });
    jobs = res.data || [];
  } catch (err) {
    console.error('Failed to load jobs', err);
  }

  const totalSpent = jobs.filter(j => j.status === 'COMPLETED').reduce((sum, j) => sum + (j.budget || 0), 0);
  const initials = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?';

  const recentJobsHtml = jobs.length > 0 
    ? jobs.slice(0, 3).map(job => `
        <div class="pb-4 border-b border-slate-100 mb-4 last:mb-0 last:border-b-0 last:pb-0">
          <div class="flex justify-between items-start gap-2.5">
            <div>
              <div class="text-[13px] font-semibold text-blue-600 cursor-pointer">${job.title}</div>
              <div class="text-[11px] text-slate-400 mt-0.5">Budget: $${job.budget} • Status: ${job.status.replace('_', ' ')}</div>
            </div>
          </div>
          <p class="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">${job.description}</p>
        </div>
      `).join('')
    : `<div class="text-xs text-slate-500 py-2">No jobs posted yet.</div>`;

  const skeleton = document.getElementById('profile-skeleton');
  if (skeleton) skeleton.remove();

  const dateJoined = new Date(currentUser.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  container.innerHTML = `
    <!-- Profile Banner -->
    <div class="bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600 px-4 sm:px-8 pt-5 sm:pt-7 pb-0 flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5 relative">
      <div class="relative sm:-mb-10 z-10 shrink-0 mt-2 sm:mt-0">
        <div class="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-gradient-to-br from-blue-400 to-blue-800 flex items-center justify-center text-white text-[28px] font-extrabold font-jakarta shadow-sm">
          ${initials}
        </div>
        <span class="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full block"></span>
      </div>
      <div class="pb-3 sm:pb-4 flex-1">
        <h1 class="text-white text-lg sm:text-xl font-extrabold font-jakarta m-0 leading-tight">${currentUser.name}</h1>
        <p class="text-blue-200 text-xs mt-0.5 mb-2">Client</p>
        <div class="flex gap-1.5 flex-wrap">
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 text-blue-50">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-300 inline-block"></span>
            Verified Client
          </span>
        </div>
      </div>
      <div class="flex gap-2 pb-4 sm:pb-5 shrink-0 self-end sm:self-auto">
        <a href="/skillbridge-post-job.html" class="bg-white text-blue-800 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors no-underline">
          Post a Job
        </a>
      </div>
    </div>

    <!-- Body -->
    <div class="px-3 sm:px-6 pt-4 sm:pt-14 pb-10 flex flex-col lg:flex-row gap-4 sm:gap-5 items-start flex-1">
      <div class="flex-1 min-w-0 flex flex-col gap-4">
        <!-- About -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <div class="font-jakarta text-[15px] font-bold text-slate-900 mb-2.5">About Company</div>
          <p class="text-slate-500 text-[13px] leading-relaxed mb-4">
            ${currentUser.bio || 'We are looking for top talent to help us build amazing products.'}
          </p>
          <div class="flex pt-3.5 border-t border-slate-100">
            <div class="flex-1 text-center px-3">
              <div class="font-jakarta text-lg font-extrabold text-slate-900">${jobs.length}</div>
              <div class="text-[11px] text-slate-400 mt-0.5">Jobs Posted</div>
            </div>
            <div class="w-px bg-slate-200"></div>
            <div class="flex-1 text-center px-3">
              <div class="font-jakarta text-lg font-extrabold text-slate-900">$${totalSpent.toLocaleString()}</div>
              <div class="text-[11px] text-slate-400 mt-0.5">Total Spent</div>
            </div>
          </div>
        </div>

        <!-- Recent Jobs -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <div class="font-jakarta text-[15px] font-bold text-slate-900 mb-4">Recent Jobs Posted</div>
          <div class="flex flex-col gap-0">
            ${recentJobsHtml}
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="w-full lg:w-60 lg:shrink-0 flex flex-col gap-3.5">
        <!-- Verifications -->
        <div class="bg-white rounded-2xl border border-slate-200 p-[18px]">
          <div class="font-jakarta text-sm font-bold text-slate-900 mb-3">Verifications</div>
          <div class="flex flex-col gap-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-500">Payment Method</span>
              <span class="w-[18px] h-[18px] bg-green-600 rounded-full flex items-center justify-center">
                <svg width="10" height="10" fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-500">Email Address</span>
              <span class="w-[18px] h-[18px] bg-green-600 rounded-full flex items-center justify-center">
                <svg width="10" height="10" fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
            </div>
          </div>
        </div>

        <!-- Meta -->
        <div class="bg-white rounded-2xl border border-slate-200 p-[18px] flex flex-col gap-2.5">
          <div class="flex items-center gap-2">
            <svg width="13" height="13" fill="none" stroke="#94a3b8" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span class="text-[11px] text-slate-500">Member since <strong class="text-slate-700 font-semibold">${dateJoined}</strong></span>
          </div>
        </div>
      </div>
    </div>
    
    <footer class="px-6 py-4 border-t border-gray-100 text-xs text-gray-400 flex flex-wrap items-center justify-between gap-2 mt-auto">
      <span>© 2026 · SkillBridge. All rights reserved.</span>
      <div class="flex gap-4">
        <a href="#" class="hover:text-gray-600 transition-colors">Privacy Policy</a>
        <a href="#" class="hover:text-gray-600 transition-colors">Terms of Service</a>
      </div>
    </footer>
  `;
}

async function renderFreelancerProfile() {
  const container = document.getElementById('profile-main');
  if (!container) return;

  const initials = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?';
  const dateJoined = new Date(currentUser.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  const skeleton = document.getElementById('profile-skeleton');
  if (skeleton) skeleton.remove();

  // A simplified freelancer layout based on the original HTML, but dynamically populated.
  container.innerHTML = `
    <!-- Profile Banner -->
    <div class="bg-gradient-to-r from-green-950 via-green-800 to-green-600 px-4 sm:px-8 pt-5 sm:pt-7 pb-0 flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5 relative">
      <div class="relative sm:-mb-10 z-10 shrink-0 mt-2 sm:mt-0">
        <div class="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-gradient-to-br from-green-400 to-green-800 flex items-center justify-center text-white text-[28px] font-extrabold font-jakarta">
          ${initials}
        </div>
        <span class="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full block"></span>
      </div>
      <div class="pb-3 sm:pb-4 flex-1">
        <h1 class="text-white text-lg sm:text-xl font-extrabold font-jakarta m-0 leading-tight">${currentUser.name}</h1>
        <p class="text-green-200 text-xs mt-0.5 mb-2">Freelancer</p>
      </div>
    </div>

    <!-- Body -->
    <div class="px-3 sm:px-6 pt-4 sm:pt-14 pb-10 flex flex-col lg:flex-row gap-4 sm:gap-5 items-start flex-1">
      <div class="flex-1 min-w-0 flex flex-col gap-4">
        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <div class="font-jakarta text-[15px] font-bold text-slate-900 mb-2.5">About</div>
          <p class="text-slate-500 text-[13px] leading-relaxed mb-4">
            ${currentUser.bio || 'Freelancer bio not provided.'}
          </p>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <div class="font-jakarta text-[15px] font-bold text-slate-900 mb-3">Skills</div>
          <div class="flex flex-wrap gap-2">
            ${currentUser.skills && currentUser.skills.length > 0 
              ? currentUser.skills.map(s => `<span class="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-medium">${s}</span>`).join('') 
              : '<span class="text-xs text-slate-400">No skills listed</span>'}
          </div>
        </div>
      </div>
      <div class="w-full lg:w-60 lg:shrink-0 flex flex-col gap-3.5">
         <div class="bg-white rounded-2xl border border-slate-200 p-[18px]">
          <div class="font-jakarta text-sm font-bold text-slate-900 mb-3">Verifications</div>
          <div class="flex flex-col gap-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-500">Email Address</span>
              <span class="w-[18px] h-[18px] bg-green-600 rounded-full flex items-center justify-center">
                <svg width="10" height="10" fill="none" stroke="white" stroke-width="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-[18px] flex flex-col gap-2.5">
          <div class="flex items-center gap-2">
            <svg width="13" height="13" fill="none" stroke="#94a3b8" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span class="text-[11px] text-slate-500">Member since <strong class="text-slate-700 font-semibold">${dateJoined}</strong></span>
          </div>
        </div>
      </div>
    </div>
    
    <footer class="px-6 py-4 border-t border-gray-100 text-xs text-gray-400 flex flex-wrap items-center justify-between gap-2 mt-auto">
      <span>© 2026 · SkillBridge. All rights reserved.</span>
    </footer>
  `;
}

document.addEventListener('DOMContentLoaded', init);

// Sidebar Logic
const menuToggle = document.getElementById('menuToggle');
if (menuToggle) {
  menuToggle.addEventListener('click', function () {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('-translate-x-full');
  });
}