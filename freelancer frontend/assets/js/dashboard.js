document.addEventListener('DOMContentLoaded', async function () {
  await window.initializeFreelancerLayout({
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
  });

  loadRecommendedJobs();
});

async function loadRecommendedJobs() {
  const container = document.getElementById('recommended-jobs-container');
  if (!container) return;

  try {
    const data = await Jobs.list();
    const jobs = data.data || [];
    
    container.innerHTML = '';
    
    if (jobs.length === 0) {
      container.innerHTML = `
        <article class="sb-card p-6 text-center text-slate-500">
          No recommended jobs found at the moment.
        </article>`;
      return;
    }

    // Display first 3 jobs as recommendations
    const recommendedJobs = jobs.slice(0, 3);
    
    recommendedJobs.forEach(job => {
      const company = job.client?.name || 'Unknown Client';
      const budgetStr = `$${job.budget}`;
      const tags = job.skills || [];
      const description = job.description || '';

      const article = document.createElement('article');
      article.className = 'sb-card p-6';
      
      article.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h3 class="font-jakarta text-[18px] font-extrabold text-slate-900">${job.title}</h3>
            <p class="mt-2 text-sm text-slate-500">${company} - Payment Verified - Intermediate</p>
          </div>
          <div class="sm:text-right"><p class="text-xl font-extrabold">${budgetStr}</p><p class="text-[10px] font-bold uppercase text-slate-400">Fixed Price</p></div>
        </div>
        <p class="mt-5 text-sm leading-7 text-slate-600">${description}</p>
        <div class="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="flex flex-wrap gap-2">
            ${tags.map(tag => `<span class="sb-chip">${tag}</span>`).join('')}
          </div>
          <a href="browse.html?id=${job.id}" class="sb-btn sb-btn-primary">View Job</a>
        </div>
      `;
      container.appendChild(article);
    });

    if (window.lucide) window.lucide.createIcons();

  } catch (error) {
    console.error('Failed to load recommended jobs:', error);
    container.innerHTML = `
      <article class="sb-card p-6 text-center text-red-500">
        Failed to load recommended jobs. Please try again later.
      </article>`;
  }
}
