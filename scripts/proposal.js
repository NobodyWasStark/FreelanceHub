// Sidebar toggle
function closeSidebar() {
  document.getElementById('sidebar').classList.add('-translate-x-full');
  document.getElementById('sidebarOverlay').classList.add('hidden');
}
document.getElementById('menuToggle').addEventListener('click', function () {
  document.getElementById('sidebar').classList.toggle('-translate-x-full');
  document.getElementById('sidebarOverlay').classList.toggle('hidden');
});

// ── State
let allProposals = [];
let currentUser  = null;

// ── Render proposal cards
function renderProposals(proposals) {
  const list = document.getElementById('proposalList');
  if (!list) return;

  if (proposals.length === 0) {
    list.innerHTML = `<div class="text-center py-16 text-slate-400 text-[14px]">No proposals yet for this job.</div>`;
    return;
  }

  list.innerHTML = proposals.map(p => {
    const f = p.freelancer || {};
    const initials = (f.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const gradients = ['from-sky-400 to-blue-600','from-violet-400 to-purple-600','from-emerald-400 to-green-600','from-rose-400 to-pink-600','from-amber-400 to-orange-500'];
    const grad = gradients[Math.floor(Math.random() * gradients.length)];
    const statusBadge = p.status !== 'PENDING'
      ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === 'ACCEPTED' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-500 border border-red-100'}">${p.status}</span>`
      : '';

    return `
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 hover:border-green-200 transition-colors">
      <div class="flex flex-col sm:flex-row sm:items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-[15px] shrink-0">${initials}</div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="font-jakarta text-[15px] font-bold text-slate-900">${f.name || 'Unknown'}</span>
            ${statusBadge}
          </div>
          <p class="text-[13px] text-slate-500 leading-relaxed mb-4">${p.coverLetter}</p>
          <div class="flex flex-wrap gap-2">
            ${p.status === 'PENDING' && currentUser?.role === 'CLIENT' ? `
            <button onclick="handleAccept('${p.id}')"
              class="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-[12px] font-bold px-4 py-2 rounded-lg transition-colors border-none cursor-pointer">
              ✓ ACCEPT
            </button>
            <button onclick="handleReject('${p.id}')"
              class="flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-500 text-[12px] font-semibold px-4 py-2 rounded-lg border border-red-200 transition-colors cursor-pointer">
              ✗ REJECT
            </button>
            ` : ''}
            <a href="skillbridge-message.html?userId=${p.freelancerId}&name=${encodeURIComponent(f.name || '')}"
              class="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[12px] font-semibold px-4 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer no-underline">
              MESSAGE
            </a>
          </div>
        </div>
        <div class="sm:text-right shrink-0">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Proposed Bid</div>
          <div class="font-jakarta text-[22px] font-extrabold text-slate-900">$${p.amount.toLocaleString()}</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── Accept proposal
async function handleAccept(proposalId) {
  try {
    await Proposals.accept(proposalId);
    showToast('Proposal accepted! Job is now In Progress.');
    await loadProposals();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Reject proposal
async function handleReject(proposalId) {
  try {
    await Proposals.reject(proposalId);
    showToast('Proposal rejected.', 'info');
    await loadProposals();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Message modal
function openMessageModal(receiverId, name) {
  const modal = document.getElementById('messageModal');
  if (!modal) return;
  document.getElementById('messageModalContent').innerHTML = `
    <div class="flex items-center gap-3 mb-5">
      <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-[13px] shrink-0">${(name||'?').charAt(0)}</div>
      <div>
        <div class="font-jakarta text-[14px] font-extrabold text-slate-900">${name}</div>
        <div class="text-[11px] text-slate-400">Send a message</div>
      </div>
    </div>
    <textarea id="msgText" rows="4" placeholder="Write your message here…"
      class="w-full border border-slate-200 rounded-xl text-[13px] text-slate-700 placeholder-slate-400 p-3 outline-none focus:border-green-400 resize-none transition-colors mb-3"></textarea>
    <div class="flex gap-2">
      <button onclick="sendMsg('${receiverId}')"
        class="flex-1 bg-green-600 hover:bg-green-700 text-white text-[12px] font-bold py-2.5 rounded-xl border-none cursor-pointer transition-colors">Send Message</button>
      <button onclick="closeMessageModal()"
        class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[12px] font-semibold py-2.5 rounded-xl border-none cursor-pointer transition-colors">Cancel</button>
    </div>`;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

async function sendMsg(receiverId) {
  const content = document.getElementById('msgText')?.value.trim();
  if (!content) { showToast('Message cannot be empty.', 'error'); return; }
  try {
    await Messages.send({ receiverId, content });
    document.getElementById('messageModalContent').innerHTML = `
      <div class="text-center py-6">
        <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <svg width="22" height="22" fill="none" stroke="#16a34a" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="font-jakarta text-[15px] font-extrabold text-slate-900 mb-1">Message Sent!</div>
        <p class="text-[13px] text-slate-400 mb-5">Your message was delivered.</p>
        <button onclick="closeMessageModal()" class="bg-green-600 hover:bg-green-700 text-white text-[12px] font-bold px-6 py-2.5 rounded-xl border-none cursor-pointer transition-colors">Done</button>
      </div>`;
  } catch (err) {
    showToast(err.message || 'Failed to send message.', 'error');
  }
}

function closeMessageModal() {
  const modal = document.getElementById('messageModal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
}

// ── Load proposals from backend
async function loadProposals() {
  const jobSelect = document.getElementById('jobSelect');
  const jobId = jobSelect?.value;
  if (!jobId) return;
  try {
    const { proposals } = await Proposals.forJob(jobId);
    allProposals = proposals;
    renderProposals(proposals);
  } catch (err) {
    console.error('Failed to load proposals:', err);
  }
}

// ── Boot
(async () => {
  currentUser = await requireAuth();
  if (!currentUser) return;

  if (currentUser.role === 'FREELANCER') {
    // Freelancers see their own proposals
    const { proposals } = await Proposals.myList();
    renderProposals(proposals.map(p => ({ ...p, freelancer: currentUser })));
    return;
  }

  // CLIENT: populate job dropdown with their jobs
  const { jobs } = await Jobs.list();
  const myJobs = jobs.filter(j => j.clientId === currentUser.id);
  const jobSelect = document.getElementById('jobSelect');
  if (jobSelect && myJobs.length) {
    jobSelect.innerHTML = myJobs.map(j => `<option value="${j.id}">${j.title}</option>`).join('');
    
    // Check if URL specifies a jobId
    const urlParams = new URLSearchParams(window.location.search);
    const preselectJobId = urlParams.get('jobId');
    if (preselectJobId && myJobs.some(j => j.id === preselectJobId)) {
      jobSelect.value = preselectJobId;
    }
    
    jobSelect.addEventListener('change', loadProposals);
    jobSelect.dispatchEvent(new Event('change'));
  }
})();

