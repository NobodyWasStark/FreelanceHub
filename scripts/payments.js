/**
 * payments.js — Dynamic data for the Payments & Withdrawals page.
 * Derives all figures from the freelancer's real proposal data.
 */

document.addEventListener('DOMContentLoaded', async function () {
  initSidebar();

  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Auth: populate sidebar user info
  const user = typeof getSession === 'function' ? getSession() : null;
  if (user) {
    const nameEl    = document.getElementById('sidebar-profile-name');
    const roleEl    = document.getElementById('sidebar-profile-role');
    const avatarEl  = document.getElementById('sidebar-profile-avatar');
    const hAvatarEl = document.getElementById('header-profile-avatar');
    const avatarUrl = user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;

    if (nameEl)    nameEl.textContent = user.name;
    if (roleEl)    roleEl.textContent = user.role === 'FREELANCER' ? 'Freelancer' : user.role;
    if (avatarEl)  avatarEl.src = avatarUrl;
    if (hAvatarEl) hAvatarEl.src = avatarUrl;
  }

  // Re-validate session in background
  if (typeof Auth !== 'undefined') {
    Auth.me().then(function (res) {
      if (typeof saveSession === 'function') saveSession(res.user);
    }).catch(function () {
      if (typeof clearSession === 'function') clearSession();
      window.location.href = '/login.html';
    });
  }

  await loadPaymentsData();
  wireSearch();
  wireExport();
  wireWithdraw();
  wireNavBadge();
});

// ── Data loader ───────────────────────────────────────────────────────────────

let _proposals = [];

async function loadPaymentsData() {
  try {
    const res = await Proposals.myList();
    _proposals = (res && res.data) ? res.data : [];
  } catch (err) {
    console.error('Failed to load proposals:', err);
    _proposals = [];
  }

  renderStatCards(_proposals);
  renderHistoryTable(_proposals);
}

// ── Stat Cards ────────────────────────────────────────────────────────────────

function renderStatCards(proposals) {
  const now = new Date();
  const thisYear  = now.getFullYear();
  const thisMonth = now.getMonth();

  // Available = sum of ACCEPTED proposals (earned but not withdrawn — no withdrawals API)
  const available = proposals
    .filter(function (p) { return p.status === 'ACCEPTED'; })
    .reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);

  // Pending = sum of PENDING proposals (submitted, awaiting client decision)
  const pending = proposals
    .filter(function (p) { return p.status === 'PENDING'; })
    .reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);

  // This month = ACCEPTED proposals created in the current calendar month
  const thisMonthEarned = proposals
    .filter(function (p) {
      if (p.status !== 'ACCEPTED') return false;
      const d = new Date(p.createdAt);
      return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
    })
    .reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);

  setText('stat-available',   fmt(available));
  setText('stat-pending',     fmt(pending));
  setText('stat-withdrawn',   fmt(0));        // No withdrawals endpoint yet
  setText('stat-this-month',  fmt(thisMonthEarned));

  // Update withdraw form available label
  const label = document.getElementById('withdraw-available-label');
  if (label) label.textContent = 'Available: ' + fmt(available);

  // Store available for withdrawal validation
  const input = document.getElementById('withdraw-amount');
  if (input) input.dataset.max = available;
}

// ── Payment History Table ─────────────────────────────────────────────────────

function renderHistoryTable(proposals) {
  const tbody = document.getElementById('payment-history-tbody');
  if (!tbody) return;

  const sorted = proposals.slice().sort(function (a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (sorted.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-10 text-center text-sm text-slate-400 font-medium">
          No transactions yet. Submit proposals to start earning.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = sorted.map(function (p) {
    const client  = (p.job && p.job.client && p.job.client.name) ? escHtml(p.job.client.name) : '—';
    const project = (p.job && p.job.title) ? escHtml(p.job.title) : '—';
    const amount  = (p.amount || 0);
    const status  = p.status; // PENDING | ACCEPTED | REJECTED

    const amountClass = status === 'ACCEPTED' ? 'text-green-700' : 'text-slate-900';
    const amountSign  = status === 'ACCEPTED' ? '+' : '';

    const pillHtml = status === 'ACCEPTED'
      ? '<span class="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Completed</span>'
      : status === 'REJECTED'
      ? '<span class="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Rejected</span>'
      : '<span class="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Pending</span>';

    return `<tr class="hover:bg-slate-50 transition-colors">
      <td class="px-6 py-5 text-sm font-medium text-slate-500 whitespace-nowrap">${fmtDate(p.createdAt)}</td>
      <td class="px-6 py-5 font-bold text-sm text-slate-900">${project}</td>
      <td class="px-6 py-5 text-sm text-slate-600">${client}</td>
      <td class="px-6 py-5 text-right font-bold ${amountClass} text-sm whitespace-nowrap">${amountSign}${fmt(amount)}</td>
      <td class="px-6 py-5 text-right">${pillHtml}</td>
    </tr>`;
  }).join('');
}

// ── Search ────────────────────────────────────────────────────────────────────

function wireSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('input', function () {
    const q = this.value.toLowerCase().trim();
    const rows = document.querySelectorAll('#payment-history-tbody tr');
    rows.forEach(function (row) {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// ── CSV Export ────────────────────────────────────────────────────────────────

function wireExport() {
  const btn = document.getElementById('export-csv-btn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    if (_proposals.length === 0) {
      if (typeof showToast === 'function') showToast('No data to export', 'info');
      return;
    }

    const rows = [['Date', 'Project', 'Client', 'Amount', 'Status']];
    _proposals.forEach(function (p) {
      rows.push([
        fmtDate(p.createdAt),
        (p.job && p.job.title) ? p.job.title : '',
        (p.job && p.job.client && p.job.client.name) ? p.job.client.name : '',
        p.amount || 0,
        p.status,
      ]);
    });

    const csv = rows.map(function (r) {
      return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(',');
    }).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'skillbridge-payments.csv';
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ── Withdraw button ───────────────────────────────────────────────────────────

function wireWithdraw() {
  const btn = document.getElementById('confirm-withdraw-btn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    const input   = document.getElementById('withdraw-amount');
    const maxVal  = parseFloat((input && input.dataset.max) || '0');
    const amount  = parseFloat((input && input.value) || '0');

    if (isNaN(amount) || amount <= 0) {
      if (typeof showToast === 'function') showToast('Please enter a valid amount', 'error');
      return;
    }
    if (amount > maxVal) {
      if (typeof showToast === 'function') showToast('Amount exceeds available balance', 'error');
      return;
    }
    // No real withdrawal API — inform user
    if (typeof showToast === 'function') {
      showToast('Withdrawal feature coming soon. No payment processor is connected yet.', 'info');
    }
  });
}

// ── Nav badge (My Proposals) ──────────────────────────────────────────────────

function wireNavBadge() {
  // Reuse already-loaded proposals data
  const count  = _proposals.length;
  const badge  = document.getElementById('nav-proposals-badge');
  if (!badge) return;

  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.classList.remove('hidden');
  }
}

// ── Sidebar mobile toggle ─────────────────────────────────────────────────────

function initSidebar() {
  const toggle  = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobile-overlay');
  if (!toggle || !sidebar || !overlay) return;

  toggle.addEventListener('click', function () {
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
  });
  overlay.addEventListener('click', function () {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  });
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function fmt(amount) {
  return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
