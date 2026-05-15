const jobs = [
  ['Stellar SaaS', '4.8', 'Senior UI/UX Designer for Fintech SaaS Redesign', '$2,500 Fixed', 'Expert Level', '3+ Months', 'We are looking for a world-class UI/UX Designer to lead the complete overhaul of our fintech dashboard.', ['Figma', 'UI Design', 'Prototyping', 'Fintech'], '5-10'],
  ['Nexus Labs', '4.9', 'Mobile App Interaction Designer (HealthTech)', '$60-80/hr', 'Intermediate', '1-3 Months', 'Seeking a motion-savvy designer to create delightful interactions for our patient-facing mobile application.', ['Mobile', 'UX', 'Accessibility'], 'Less than 5'],
  ['Velocity AI', '4.7', 'Senior Designer for AI Training Interface', '$5,000 Fixed', 'Expert Level', '6+ Months', 'Build the next generation of AI training tools with interfaces that make complex data labeling intuitive.', ['AI Tools', 'Design Systems'], '20-50'],
  ['Leaf & Co.', '4.5', 'E-commerce UI Design for Sustainable Fashion Brand', '$1,200 Fixed', 'Intermediate', '1 Month', 'A clean editorial Shopify theme customization focused on typography and minimalist product grids.', ['E-commerce', 'Shopify'], '15-20']
];

function renderJobs(filter = '') {
  const list = document.getElementById('jobList');
  const query = filter.toLowerCase();
  list.innerHTML = '';
  jobs
    .filter(job => job.join(' ').toLowerCase().includes(query))
    .forEach(job => {
      const card = document.createElement('article');
      card.className = 'sb-card p-6';
      card.innerHTML = `
        <div class="flex items-start justify-between gap-4 mb-5">
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-green-800">${job[0][0]}</div>
            <div><p class="font-bold text-slate-900">${job[0]} <span class="text-amber-400">*</span> ${job[1]}</p><p class="text-sm text-slate-500">Remote - Posted 2 hours ago</p></div>
          </div>
          <button class="save-job text-slate-400 hover:text-green-700"><i data-lucide="bookmark" class="w-5 h-5"></i></button>
        </div>
        <a href="browse.html" class="font-jakarta text-xl font-extrabold text-green-700 no-underline hover:text-green-800">${job[2]}</a>
        <div class="flex flex-wrap gap-2 mt-4"><span class="sb-chip bg-green-100 text-green-800">${job[3]}</span><span class="sb-chip">${job[4]}</span><span class="sb-chip">${job[5]}</span></div>
        <p class="mt-5 text-sm leading-7 text-slate-600">${job[6]}</p>
        <div class="mt-5 flex flex-wrap gap-2">${job[7].map(tag => `<span class="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded">${tag}</span>`).join('')}</div>
        <div class="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p class="text-sm text-slate-500">Proposals: ${job[8]}</p>
          <div class="flex gap-3"><button class="save-job sb-btn sb-btn-outline">Save Job</button><button class="sb-btn sb-btn-primary">Apply Now</button></div>
        </div>`;
      list.appendChild(card);
    });
  if (window.lucide) window.lucide.createIcons();
}

function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 1600);
}

document.addEventListener('DOMContentLoaded', function () {
  window.initializeFreelancerLayout({
    activeNav: 'find-work',
    headerLeft: `
      <div class="relative flex-1 max-w-3xl">
        <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
        <input id="jobSearch" type="text" placeholder="Search for jobs, skills, or clients..." class="sb-input w-full pl-12 pr-4 py-3 bg-white">
      </div>
    `,
    headerRight: `
      <button class="sb-btn sb-btn-primary ml-4 hidden sm:inline-flex">Search</button>
    `
  }).then(function () {
    renderJobs();
    document.getElementById('jobSearch').addEventListener('input', event => renderJobs(event.target.value));
    document.querySelectorAll('.category-btn').forEach(btn => btn.addEventListener('click', function () {
      document.querySelectorAll('.category-btn').forEach(item => item.classList.remove('active'));
      this.classList.add('active');
    }));
    document.addEventListener('click', event => {
      if (event.target.closest('.save-job')) showToast();
    });
    if (window.lucide) window.lucide.createIcons();
  });
});
