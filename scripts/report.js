//Side-bar
function openSidebar(){ 
  document.getElementById("sidebar").classList.add("open");    
  document.getElementById("mobile-overlay").classList.add("show"); 
}
function closeSidebar(){ 
  document.getElementById("sidebar").classList.remove("open"); 
  document.getElementById("mobile-overlay").classList.remove("show"); 
}

let currentUser = null;

async function init() {
  currentUser = await requireAuth();
  if (!currentUser) return;
  await loadReports();
}

async function loadReports() {
  try {
    const res = await Jobs.list({ clientId: currentUser.id });
    const jobs = res.data || [];

    // Calculate metrics
    let totalSpent = 0;
    let activeContracts = 0;
    let pendingPayments = 0;

    const transactions = [];

    for (const job of jobs) {
      if (job.status === 'COMPLETED') {
        totalSpent += job.budget || 0;
        transactions.push({
          date: new Date(job.updatedAt || job.createdAt),
          title: job.title,
          amount: job.budget,
          status: 'Paid',
          statusClass: 'bg-green-100 text-green-700'
        });
      } else if (job.status === 'IN_PROGRESS') {
        activeContracts++;
        pendingPayments += job.budget || 0;
        transactions.push({
          date: new Date(job.updatedAt || job.createdAt),
          title: job.title,
          amount: job.budget,
          status: 'Pending',
          statusClass: 'bg-amber-100 text-amber-700'
        });
      }
    }

    // Update DOM
    const totalEl = document.getElementById('report-total-spent');
    const activeEl = document.getElementById('report-active-contracts');
    const pendingEl = document.getElementById('report-pending-payments');
    
    if (totalEl) totalEl.innerText = '$' + totalSpent.toLocaleString();
    if (activeEl) activeEl.innerText = activeContracts.toString();
    if (pendingEl) pendingEl.innerText = '$' + pendingPayments.toLocaleString();

    // Sort transactions by date descending
    transactions.sort((a, b) => b.date - a.date);

    const tbody = document.getElementById('report-transaction-tbody');
    if (tbody) {
      if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-sm text-gray-500">No transactions to display.</td></tr>`;
      } else {
        tbody.innerHTML = transactions.map(t => {
          const dateStr = t.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
          return `
            <tr>
              <td class="py-4 pr-6 text-[13px] text-gray-500 font-medium whitespace-nowrap">${dateStr}</td>
              <td class="py-4 pr-6 whitespace-nowrap">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0 ring-1 ring-gray-100">F</div>
                  <span class="text-[13px] font-semibold text-gray-800">Assigned Freelancer</span>
                </div>
              </td>
              <td class="py-4 pr-6 text-[13px] text-gray-500 whitespace-nowrap line-clamp-1 max-w-[200px]">${t.title}</td>
              <td class="py-4 pr-6 text-[13px] font-bold text-gray-900 whitespace-nowrap">$${t.amount?.toLocaleString() || 0}</td>
              <td class="py-4 pr-6 text-[13px] text-gray-500 whitespace-nowrap">Fixed Price</td>
              <td class="py-4 whitespace-nowrap">
                <span class="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full ${t.statusClass}">${t.status}</span>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Render Dynamic Graph
    renderGraph(jobs);

  } catch (err) {
    console.error('Failed to load reports', err);
  }
}

function renderGraph(jobs) {
  // 1. Determine the last 6 months
  const monthsData = [];
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    monthsData.push({
      label: d.toLocaleString('en-US', { month: 'short' }),
      month: d.getMonth(),
      year: d.getFullYear(),
      spent: 0
    });
  }

  // 2. Aggregate spending for COMPLETED jobs
  for (const job of jobs) {
    if (job.status === 'COMPLETED') {
      const jobDate = new Date(job.updatedAt || job.createdAt);
      // Find matching month in our array
      const match = monthsData.find(m => m.month === jobDate.getMonth() && m.year === jobDate.getFullYear());
      if (match) {
        match.spent += (job.budget || 0);
      }
    }
  }

  // 3. Calculate scales
  const maxSpent = Math.max(100, Math.max(...monthsData.map(m => m.spent)));
  // Round to nearest hundred for the label
  const ceilMax = Math.ceil(maxSpent / 100) * 100;
  
  document.getElementById('chart-max-label').innerText = '$' + ceilMax.toLocaleString();
  document.getElementById('chart-mid-label').innerText = '$' + (ceilMax / 2).toLocaleString();
  document.getElementById('chart-min-label').innerText = '$0';

  const xCoords = [60, 222, 384, 546, 708, 870];
  const yMin = 192; // 0 value
  const yMax = 28;  // max value
  const yRange = yMin - yMax;

  const getPoints = monthsData.map((m, i) => {
    const ratio = m.spent / ceilMax;
    return {
      x: xCoords[i],
      y: yMin - (ratio * yRange)
    };
  });

  // 4. Generate SVG Paths
  let dArea = `M \${getPoints[0].x},\${getPoints[0].y} `;
  let dLine = `M \${getPoints[0].x},\${getPoints[0].y} `;

  for (let i = 1; i < getPoints.length; i++) {
    const prev = getPoints[i - 1];
    const curr = getPoints[i];
    const cx = (prev.x + curr.x) / 2;
    const curve = `C \${cx},\${prev.y} \${cx},\${curr.y} \${curr.x},\${curr.y} `;
    dArea += curve;
    dLine += curve;
  }
  
  dArea += `L \${getPoints[getPoints.length - 1].x},\${yMin} L \${getPoints[0].x},\${yMin} Z`;

  // 5. Build inner HTML for chart dynamic content
  let svgContent = `
    <!-- Area -->
    <path d="\${dArea}" fill="url(#areaGrad)" clip-path="url(#chartClip)" />
    <!-- Line -->
    <path d="\${dLine}" fill="none" stroke="#16a34a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
  `;

  // Data Points and X Labels
  getPoints.forEach((p, i) => {
    svgContent += `<circle cx="\${p.x}" cy="\${p.y}" r="7" fill="white" stroke="#16a34a" stroke-width="2.5"/>`;
    svgContent += `<text x="\${p.x}" y="222" text-anchor="middle" font-size="13" font-weight="600" fill="#9ca3af" font-family="Plus Jakarta Sans, sans-serif">\${monthsData[i].label}</text>`;
  });

  const chartContainer = document.getElementById('chart-dynamic-content');
  if (chartContainer) {
    chartContainer.innerHTML = svgContent;
  }
}

document.addEventListener('DOMContentLoaded', init);