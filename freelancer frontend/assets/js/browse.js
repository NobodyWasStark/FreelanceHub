function showToast(text, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.className = `fixed bottom-5 right-5 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-xl ${type === 'error' ? 'bg-red-600' : 'bg-slate-950'}`;
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 1800);
}

let currentJobId = null;

async function loadJobDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');
  if (!jobId) {
    showToast('Invalid Job ID', 'error');
    setTimeout(() => { window.location.href = 'find-work.html'; }, 1500);
    return;
  }

  currentJobId = jobId;

  try {
    const data = await Jobs.get(jobId);
    const job = data.job;

    document.getElementById('jobTitle').textContent = job.title;
    document.getElementById('jobDescription').textContent = job.description;
    document.getElementById('jobBudget').textContent = `$${job.budget}`;
    document.getElementById('clientName').textContent = job.client?.name || 'Unknown Client';
    
    const skillsList = document.getElementById('jobSkills');
    skillsList.innerHTML = (job.skills || []).map(tag => `<span class="sb-chip min-h-[44px] px-7 text-base bg-white border border-slate-200 text-slate-700">${tag}</span>`).join('');
  } catch (err) {
    console.error(err);
    showToast('Failed to load job details', 'error');
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  await window.initializeFreelancerLayout({
    activeNav: 'browse',
    headerLeft: `
      <a href="find-work.html" class="inline-flex items-center gap-2 font-bold text-green-700 no-underline">
        <i data-lucide="arrow-left" class="w-5 h-5"></i>Back to search
      </a>
    `,
    headerRight: `
      <a href="notification.html" class="relative p-2 rounded-lg hover:bg-green-50 text-slate-500 inline-flex"><i data-lucide="bell" class="w-5 h-5"></i></a>
    `
  });

  await loadJobDetails();

  document.getElementById('saveJob').addEventListener('click', () => showToast('Job saved'));
  
  document.getElementById('submitProposal').addEventListener('click', () => {
    if (currentJobId) {
      window.location.href = `submit_proposal.html?id=${currentJobId}`;
    }
  });

  if (window.lucide) window.lucide.createIcons();
});
