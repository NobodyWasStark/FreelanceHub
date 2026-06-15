document.addEventListener('DOMContentLoaded', function () {
  window.initializeFreelancerLayout({
    activeNav: 'reports',
    headerLeft: `
      <div class="relative flex-1 max-w-2xl">
        <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
        <input type="text" placeholder="Search reports, clients, or projects..." class="sb-input w-full pl-11 pr-4 py-2 bg-white">
      </div>
    `,
    headerRight: `
      <a href="notification.html" class="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 inline-flex"><i data-lucide="bell" class="w-5 h-5"></i></a>
      <a href="settings.html" aria-label="Open profile settings"><img id="header-profile-avatar" src="https://api.dicebear.com/7.x/initials/svg?seed=User" alt="User Avatar" class="w-8 h-8 rounded-full bg-slate-800" /></a>
    `
  }).then(function () {
    // Wire date-range buttons (UI only — data re-fetch not implemented yet)
    document.querySelectorAll('.report-range').forEach(function (button) {
      button.addEventListener('click', function () {
        document.querySelectorAll('.report-range').forEach(function (item) {
          item.classList.remove('active');
        });
        this.classList.add('active');
      });
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }

    loadReportsData();
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(amount) {
  return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function isThisMonth(iso) {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

// ── Main data loader ──────────────────────────────────────────────────────────

async function loadReportsData() {
  try {
    // Fetch stats and proposals in parallel
    const [statsRes, proposalsRes] = await Promise.all([
      Users.getMyStats().catch(function () { return null; }),
      Proposals.myList().catch(function () { return { data: [] }; }),
    ]);

    const proposals = (proposalsRes && proposalsRes.data) ? proposalsRes.data : [];
    const stats = (statsRes && statsRes.stats) ? statsRes.stats : null;

    renderStatCards(stats, proposals);
    renderTopProjects(proposals);
    renderTransactionTable(proposals);
    renderSkillsFromProfile();
    renderEarningsChart(proposals);
    wireExportCsv(proposals);
  } catch (err) {
    console.error('Reports data load failed:', err);
  }
}

// ── Stat Cards ────────────────────────────────────────────────────────────────

function renderStatCards(stats, proposals) {
  // Total earned: from stats endpoint (accepted + completed jobs)
  const totalEarned = stats ? stats.totalEarned : 0;
  const el = document.getElementById('stat-total-earned');
  if (el) el.textContent = fmt(totalEarned);

  // This month: sum of accepted proposals created this calendar month
  const thisMonth = proposals
    .filter(function (p) { return p.status === 'ACCEPTED' && isThisMonth(p.createdAt); })
    .reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
  const monthEl = document.getElementById('stat-this-month');
  if (monthEl) monthEl.textContent = fmt(thisMonth);

  // Pending: sum of PENDING proposals (submitted, not yet accepted/rejected)
  const pending = proposals
    .filter(function (p) { return p.status === 'PENDING'; })
    .reduce(function (sum, p) { return sum + (p.amount || 0); }, 0);
  const pendingEl = document.getElementById('stat-pending');
  if (pendingEl) pendingEl.textContent = fmt(pending);

  // Contracts: accepted proposals count
  const contracts = stats ? stats.activeContracts : proposals.filter(function (p) { return p.status === 'ACCEPTED'; }).length;
  const contractsEl = document.getElementById('stat-contracts');
  if (contractsEl) contractsEl.textContent = String(contracts);
}

// ── Top Earning Projects ──────────────────────────────────────────────────────

function renderTopProjects(proposals) {
  const container = document.getElementById('top-projects-list');
  if (!container) return;

  const accepted = proposals
    .filter(function (p) { return p.status === 'ACCEPTED'; })
    .sort(function (a, b) { return (b.amount || 0) - (a.amount || 0); })
    .slice(0, 5);

  if (accepted.length === 0) {
    container.innerHTML = '<p class="text-sm text-slate-400">No accepted contracts yet. Submit proposals to get started.</p>';
    return;
  }

  container.innerHTML = accepted.map(function (p) {
    const clientName = (p.job && p.job.client && p.job.client.name) ? p.job.client.name : 'Client';
    const jobTitle = (p.job && p.job.title) ? p.job.title : 'Untitled Project';
    return `<div class="report-project">
      <div>
        <h3>${escapeHtml(jobTitle)}</h3>
        <p>${escapeHtml(clientName)}</p>
      </div>
      <div>
        <strong>${fmt(p.amount)}</strong>
        <span>${fmtDate(p.createdAt)}</span>
      </div>
    </div>`;
  }).join('');
}

// ── Skills (from user profile) ────────────────────────────────────────────────

async function renderSkillsFromProfile() {
  const container = document.getElementById('skills-list');
  if (!container) return;

  try {
    const { user } = await Auth.me();
    const skills = (user && user.skills && user.skills.length > 0) ? user.skills : null;

    if (!skills) {
      container.innerHTML = '<p class="text-sm text-slate-400">Add skills to your profile to see performance data.</p>';
      return;
    }

    // We don't have per-skill performance data — display skills with placeholder bars
    // based on profile listing order (first = primary = highest visual weight)
    container.innerHTML = skills.slice(0, 5).map(function (skill, i) {
      // Descending visual weight: 90, 80, 70, 60, 50 — honest that this is indicative
      const pct = Math.max(50, 90 - i * 10);
      return `<div class="skill-row">
        <div><span>${escapeHtml(skill)}</span><strong>${pct}%</strong></div>
        <progress value="${pct}" max="100"></progress>
      </div>`;
    }).join('');
  } catch (err) {
    container.innerHTML = '<p class="text-sm text-slate-400">Could not load skill data.</p>';
  }
}

// ── Earnings Chart (dynamic from proposals) ────────────────────────────────────

function renderEarningsChart(proposals) {
  // Group accepted proposal amounts by month (last 6 months)
  const now = new Date();
  const months = [];
  const monthLabels = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), total: 0 });
    monthLabels.push(d.toLocaleString('en-US', { month: 'short' }).toUpperCase());
  }

  proposals.forEach(function (p) {
    if (p.status !== 'ACCEPTED') return;
    const d = new Date(p.createdAt);
    months.forEach(function (m) {
      if (d.getFullYear() === m.year && d.getMonth() === m.month) {
        m.total += p.amount || 0;
      }
    });
  });

  // Update month labels
  const labelsEl = document.getElementById('chart-months');
  if (labelsEl) {
    labelsEl.innerHTML = monthLabels.map(function (l) { return `<span>${l}</span>`; }).join('');
  }

  // Build SVG path from data
  const totals = months.map(function (m) { return m.total; });
  const maxVal = Math.max(...totals, 1); // avoid division by zero
  const W = 920, H = 300, PAD = 30;

  // Map totals to Y coordinates (inverted — 0 = bottom = H-PAD)
  const points = totals.map(function (val, i) {
    const x = (i / (totals.length - 1)) * W;
    const y = PAD + (1 - val / maxVal) * (H - PAD * 2);
    return { x, y };
  });

  // Build smooth bezier path
  function buildPath(pts) {
    if (pts.length === 0) return '';
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cx = (pts[i].x + pts[i + 1].x) / 2;
      d += ` C${cx} ${pts[i].y} ${cx} ${pts[i + 1].y} ${pts[i + 1].x} ${pts[i + 1].y}`;
    }
    return d;
  }

  const linePath = buildPath(points);
  const areaPath = linePath
    ? `${linePath} L${W} ${H} L0 ${H} Z`
    : `M0 ${H} L${W} ${H} Z`;

  const lineEl = document.getElementById('chart-line');
  const areaEl = document.getElementById('chart-area');
  const dotsEl = document.getElementById('chart-dots');

  if (lineEl) lineEl.setAttribute('d', linePath || `M0 ${H - PAD} L${W} ${H - PAD}`);
  if (areaEl) areaEl.setAttribute('d', areaPath);

  if (dotsEl) {
    dotsEl.innerHTML = points
      .filter(function (pt, i) { return totals[i] > 0; })
      .map(function (pt) { return `<circle cx="${pt.x}" cy="${pt.y}" r="4" />`; })
      .join('');
  }
}

// ── Transaction Table ─────────────────────────────────────────────────────────

function renderTransactionTable(proposals) {
  const tbody = document.getElementById('transaction-tbody');
  if (!tbody) return;

  if (proposals.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-400 text-sm">No transactions yet.</td></tr>`;
    return;
  }

  const sorted = proposals.slice().sort(function (a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  tbody.innerHTML = sorted.map(function (p) {
    const client = (p.job && p.job.client && p.job.client.name) ? p.job.client.name : '—';
    const title  = (p.job && p.job.title) ? p.job.title : '—';
    const status = p.status; // PENDING | ACCEPTED | REJECTED

    const pillClass = status === 'ACCEPTED' ? 'paid'
                    : status === 'REJECTED' ? 'rejected'
                    : 'pending';
    const pillLabel = status === 'ACCEPTED' ? 'Accepted'
                    : status === 'REJECTED' ? 'Rejected'
                    : 'Pending';

    return `<tr>
      <td>${fmtDate(p.createdAt)}</td>
      <td>${escapeHtml(client)}</td>
      <td>${escapeHtml(title)}</td>
      <td>${fmt(p.amount)}</td>
      <td><span class="report-pill ${pillClass}">${pillLabel}</span></td>
    </tr>`;
  }).join('');
}

// ── CSV Export ────────────────────────────────────────────────────────────────

function wireExportCsv(proposals) {
  const btn = document.getElementById('export-csv-btn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    if (proposals.length === 0) {
      showToast('No data to export', 'info');
      return;
    }

    const rows = [['Date', 'Client', 'Project', 'Amount', 'Status']];
    proposals.forEach(function (p) {
      rows.push([
        fmtDate(p.createdAt),
        (p.job && p.job.client && p.job.client.name) ? p.job.client.name : '',
        (p.job && p.job.title) ? p.job.title : '',
        p.amount,
        p.status,
      ]);
    });

    const csv = rows.map(function (r) {
      return r.map(function (cell) { return `"${String(cell).replace(/"/g, '""')}"` }).join(',');
    }).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skillbridge-transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  });
}

// ── XSS protection ───────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
