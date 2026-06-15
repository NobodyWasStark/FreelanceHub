function showToast(text, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  if (type === 'error') {
    toast.className = 'fixed bottom-5 right-5 bg-red-600 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-xl';
  } else {
    toast.className = 'fixed bottom-5 right-5 bg-slate-950 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-xl';
  }
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 1800);
}

document.addEventListener('DOMContentLoaded', async function () {
  await window.initializeFreelancerLayout({
    activeNav: 'find-work',
    headerLeft: `
      <a href="browse.html" class="inline-flex items-center gap-2 font-bold text-green-700 no-underline">
        <i data-lucide="arrow-left" class="w-5 h-5"></i>Back to jobs
      </a>
    `,
    headerRight: `
      <a href="notification.html" class="relative p-2 rounded-lg hover:bg-green-50 text-slate-500 inline-flex"><i data-lucide="bell" class="w-5 h-5"></i></a>
    `
  });

  if (window.lucide) window.lucide.createIcons();

  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');

  if (!jobId) {
    showToast('Invalid Job ID', 'error');
    setTimeout(() => window.location.href = 'find-work.html', 1500);
    return;
  }

  try {
    const data = await Jobs.get(jobId);
    const job = data.job;
    if (job) {
      document.getElementById('jobTitleDisplay').textContent = job.title;
      document.getElementById('jobBudgetDisplay').textContent = `$${job.budget}`;
      document.getElementById('bidAmount').value = job.budget;
    }
  } catch (err) {
    showToast('Failed to load job details', 'error');
  }

  const form = document.getElementById('proposalForm');
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    const amount = parseFloat(document.getElementById('bidAmount').value);
    const coverLetter = document.getElementById('coverLetter').value;

    try {
      await Proposals.submit({
        jobId,
        amount,
        coverLetter
      });
      showToast('Proposal submitted successfully!');
      setTimeout(() => {
        window.location.href = 'my-proposal.html';
      }, 1000);
    } catch (err) {
      showToast(err.message || 'Failed to submit proposal', 'error');
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
});
