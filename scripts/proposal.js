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
// Set to true when proposals are loaded via forJob() (client path).
// The server enforces /proposals/job/:id is only accessible by the job owner,
// so if we reached that path we are definitely the client — no need to trust
// the frontend role field which can be stale or wrong.
let isClientView = false;

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
    // Use name if it's not an email, otherwise fall back to email field
    const displayName = (f.name && !f.name.includes('@')) ? f.name : (f.email || f.name || 'Unknown');
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    const gradients = ['from-sky-400 to-blue-600','from-violet-400 to-purple-600','from-emerald-400 to-green-600','from-rose-400 to-pink-600','from-amber-400 to-orange-500'];
    const grad = gradients[Math.floor(Math.random() * gradients.length)];

    let statusBadge = '';
    if (p.status === 'ACCEPTED') {
      statusBadge = `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">✓ Accepted</span>`;
    } else if (p.status === 'REJECTED') {
      statusBadge = `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">✗ Rejected</span>`;
    }

    const isPending = p.status === 'PENDING';
    const safeName = displayName.replace(/'/g, "\\'");

    // Show Accept/Reject only in client view (loaded via forJob — server-enforced)
    const actionButtons = (isClientView && isPending) ? `
      <button onclick="confirmAccept('${p.id}', '${safeName}')"
        class="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-[12px] font-bold px-4 py-2 rounded-lg transition-all border-none cursor-pointer">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        Accept
      </button>
      <button onclick="confirmReject('${p.id}', '${safeName}')"
        class="flex items-center gap-1.5 bg-white hover:bg-red-50 active:scale-95 text-red-500 text-[12px] font-semibold px-4 py-2 rounded-lg border border-red-200 transition-all cursor-pointer">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        Reject
      </button>` : '';

    const skillChips = (f.skills && f.skills.length > 0)
      ? `<div class="flex flex-wrap gap-1.5 mb-3">${f.skills.slice(0, 4).map(s => `<span class="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">${s}</span>`).join('')}</div>`
      : '';

    return `
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 hover:border-green-200 transition-colors">
      <div class="flex flex-col sm:flex-row sm:items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-[15px] shrink-0">${initials}</div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <span class="font-jakarta text-[15px] font-bold text-slate-900">${displayName}</span>
            ${statusBadge}
          </div>
          ${skillChips}
          <p class="text-[13px] text-slate-500 leading-relaxed mb-4">${p.coverLetter}</p>
          <div class="flex flex-wrap gap-2">
            ${actionButtons}
            <a href="skillbridge-message.html?userId=${p.freelancerId}&name=${encodeURIComponent(displayName)}"
              class="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[12px] font-semibold px-4 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer no-underline">
              <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Message
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

// ── Confirmation wrappers
function confirmAccept(proposalId, name) {
  showConfirmModal(
    'Accept Proposal',
    `Accept <strong>${name}</strong>'s proposal? This will mark the job as <em>In Progress</em> and close it to new applicants.`,
    'Accept',
    'bg-green-600 hover:bg-green-700',
    () => handleAccept(proposalId)
  );
}

function confirmReject(proposalId, name) {
  showConfirmModal(
    'Reject Proposal',
    `Reject <strong>${name}</strong>'s proposal? They will not be notified automatically.`,
    'Reject',
    'bg-red-500 hover:bg-red-600',
    () => handleReject(proposalId)
  );
}

function showConfirmModal(title, body, confirmLabel, confirmClass, onConfirm) {
  let modal = document.getElementById('confirmModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'confirmModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" id="confirmModalBackdrop"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
        <h3 id="confirmModalTitle" class="font-jakarta text-[16px] font-extrabold text-slate-900 mb-2"></h3>
        <p id="confirmModalBody" class="text-[13px] text-slate-500 leading-relaxed mb-6"></p>
        <div class="flex gap-3">
          <button id="confirmModalOk" class="flex-1 text-white text-[13px] font-bold py-2.5 rounded-xl border-none cursor-pointer transition-colors"></button>
          <button onclick="closeConfirmModal()" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[13px] font-semibold py-2.5 rounded-xl border-none cursor-pointer transition-colors">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('confirmModalBackdrop').addEventListener('click', closeConfirmModal);
  }

  document.getElementById('confirmModalTitle').textContent = title;
  document.getElementById('confirmModalBody').innerHTML = body;
  const okBtn = document.getElementById('confirmModalOk');
  okBtn.textContent = confirmLabel;
  okBtn.className = `flex-1 text-white text-[13px] font-bold py-2.5 rounded-xl border-none cursor-pointer transition-colors ${confirmClass}`;
  okBtn.onclick = () => { closeConfirmModal(); onConfirm(); };
  modal.style.display = 'flex';
}

function closeConfirmModal() {
  const modal = document.getElementById('confirmModal');
  if (modal) modal.style.display = 'none';
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

// ── Load proposals for a specific job (CLIENT path)
// Server enforces that only the job owner can call /proposals/job/:id
async function loadProposals() {
  const jobSelect = document.getElementById('jobSelect');
  const jobId = jobSelect?.value;
  if (!jobId) return;
  try {
    const { data: proposals } = await Proposals.forJob(jobId);
    allProposals = proposals;
    isClientView = true; // confirmed: server only returns this for the job owner
    renderProposals(proposals);

    const badge = document.getElementById('nav-proposals-badge');
    if (badge) {
      badge.textContent = proposals.length;
      badge.classList.toggle('hidden', proposals.length === 0);
    }
  } catch (err) {
    console.error('Failed to load proposals:', err);
    document.getElementById('proposalList').innerHTML =
      '<div class="text-center py-16 text-slate-400 text-[14px]">Failed to load proposals.</div>';
  }
}

// ── Boot
(async () => {
  try {
    // Always do a real server-side auth check — never trust localStorage role.
    let freshUser;
    try {
      const { user } = await Auth.me();
      freshUser = user;
      saveSession(user);
    } catch {
      clearSession();
      window.location.href = '/login.html';
      return;
    }
    currentUser = freshUser;

    // CRITICAL FIX: Always try the client path first, regardless of role field.
    // A user's DB role may say FREELANCER but they may have also posted jobs.
    // Jobs.list() is scoped by the server to req.user.id so this is safe.
    let clientJobs = [];
    try {
      const { data } = await Jobs.list({ clientId: currentUser.id });
      clientJobs = Array.isArray(data) ? data : [];
    } catch {
      clientJobs = [];
    }

    const jobSelect = document.getElementById('jobSelect');

    if (clientJobs.length > 0) {
      // CLIENT VIEW: this user has posted jobs — show incoming proposals with Accept/Reject
      jobSelect.innerHTML = clientJobs
        .map(j => `<option value="${j.id}">${j.title}</option>`)
        .join('');

      // Pre-select if navigated from My Jobs page with ?jobId=...
      const preselectJobId = new URLSearchParams(window.location.search).get('jobId');
      if (preselectJobId && clientJobs.some(j => j.id === preselectJobId)) {
        jobSelect.value = preselectJobId;
      }

      jobSelect.addEventListener('change', loadProposals);
      jobSelect.dispatchEvent(new Event('change'));
    } else {
      // FREELANCER VIEW: no posted jobs — show their own submitted proposals
      jobSelect.innerHTML = '<option value="">No jobs posted</option>';
      try {
        const { data: proposals } = await Proposals.myList();
        if (!proposals || proposals.length === 0) {
          document.getElementById('proposalList').innerHTML =
            '<div class="text-center py-16 text-slate-400 text-[14px]">You have not submitted any proposals yet.</div>';
        } else {
          // isClientView stays false here — no Accept/Reject for own submitted proposals
          renderProposals(proposals.map(p => ({ ...p, freelancer: currentUser })));
        }
      } catch (err) {
        console.error('Failed to load submitted proposals:', err);
        document.getElementById('proposalList').innerHTML =
          '<div class="text-center py-16 text-slate-400 text-[14px]">Failed to load proposals.</div>';
      }
    }
  } finally {
    window.hideClientLoader && window.hideClientLoader();
  }
})();