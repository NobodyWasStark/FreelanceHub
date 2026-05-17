const jobs = [
  {
    company: 'Stellar SaaS',
    rating: 4.8,
    title: 'Senior UI/UX Designer for Fintech SaaS Redesign',
    budget: '$2,500 Fixed',
    budgetType: 'Fixed Price',
    experience: 'Expert Level',
    duration: '3+ Months',
    description: 'We are looking for a world-class UI/UX Designer to lead the complete overhaul of our fintech dashboard.',
    tags: ['Figma', 'UI Design', 'Prototyping', 'Fintech'],
    proposals: '5-10',
    category: 'UI/UX Design'
  },
  {
    company: 'Nexus Labs',
    rating: 4.9,
    title: 'Mobile App Interaction Designer (HealthTech)',
    budget: '$60-80/hr',
    budgetType: 'Hourly Rate',
    experience: 'Intermediate',
    duration: '1-3 Months',
    description: 'Seeking a motion-savvy designer to create delightful interactions for our patient-facing mobile application.',
    tags: ['Mobile', 'UX', 'Accessibility'],
    proposals: 'Less than 5',
    category: 'Development'
  },
  {
    company: 'Velocity AI',
    rating: 4.7,
    title: 'Senior Designer for AI Training Interface',
    budget: '$5,000 Fixed',
    budgetType: 'Fixed Price',
    experience: 'Expert Level',
    duration: '6+ Months',
    description: 'Build the next generation of AI training tools with interfaces that make complex data labeling intuitive.',
    tags: ['AI Tools', 'Design Systems'],
    proposals: '20-50',
    category: 'Project Management'
  },
  {
    company: 'Leaf & Co.',
    rating: 4.5,
    title: 'E-commerce UI Design for Sustainable Fashion Brand',
    budget: '$1,200 Fixed',
    budgetType: 'Fixed Price',
    experience: 'Intermediate',
    duration: '1 Month',
    description: 'A clean editorial Shopify theme customization focused on typography and minimalist product grids.',
    tags: ['E-commerce', 'Shopify'],
    proposals: '15-20',
    category: 'Marketing'
  },
  {
    company: 'Quest Partners',
    rating: 5.0,
    title: 'Enterprise Design System Consultant',
    budget: '$100-120/hr',
    budgetType: 'Hourly Rate',
    experience: 'Expert Level',
    duration: 'Ongoing',
    description: 'Help unify three product lines with reusable tokens, component patterns, and scalable design documentation.',
    tags: ['Design Systems', 'Audit'],
    proposals: '10-15',
    category: 'Sales'
  },
  {
    company: 'Clearline Studio',
    rating: 4.6,
    title: 'Website Content and UX Copy Specialist',
    budget: '$900 Fixed',
    budgetType: 'Fixed Price',
    experience: 'Entry Level',
    duration: '2-4 Weeks',
    description: 'Write landing page and product content that fits a modern UX voice and supports cleaner conversion flows.',
    tags: ['Content', 'UX Writing'],
    proposals: 'Less than 10',
    category: 'Writing'
  }
];

const defaultFilters = {
  category: 'UI/UX Design',
  search: '',
  budget: ['Fixed Price'],
  experience: ['Intermediate', 'Expert Level']
};

const state = {
  category: defaultFilters.category,
  search: defaultFilters.search,
  budget: [...defaultFilters.budget],
  experience: [...defaultFilters.experience]
};

function getFilteredJobs() {
  const query = state.search.trim().toLowerCase();

  return jobs.filter(job => {
    const matchesSearch = query === '' || [
      job.company,
      job.title,
      job.description,
      job.category,
      ...job.tags
    ].join(' ').toLowerCase().includes(query);

    const matchesCategory = !state.category || job.category === state.category;
    const matchesBudget = state.budget.length === 0 || state.budget.includes(job.budgetType);
    const matchesExperience = state.experience.length === 0 || state.experience.includes(job.experience);
    const matchesRating = job.rating >= 4;

    return matchesSearch && matchesCategory && matchesBudget && matchesExperience && matchesRating;
  });
}

function renderJobs() {
  const list = document.getElementById('jobList');
  const jobsCount = document.getElementById('jobsCount');
  const filteredJobs = getFilteredJobs();

  list.innerHTML = '';
  jobsCount.textContent = `${filteredJobs.length} jobs found`;

  filteredJobs.forEach(job => {
      const card = document.createElement('article');
      card.className = 'sb-card p-6';
      card.innerHTML = `
        <div class="flex items-start justify-between gap-4 mb-5">
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-green-800">${job.company[0]}</div>
            <div><p class="font-bold text-slate-900">${job.company} <span class="text-amber-400">*</span> ${job.rating}</p><p class="text-sm text-slate-500">Remote - Posted 2 hours ago</p></div>
          </div>
          <button class="save-job text-slate-400 hover:text-green-700"><i data-lucide="bookmark" class="w-5 h-5"></i></button>
        </div>
        <a href="browse.html" class="font-jakarta text-xl font-extrabold text-green-700 no-underline hover:text-green-800">${job.title}</a>
        <div class="flex flex-wrap gap-2 mt-4"><span class="sb-chip bg-green-100 text-green-800">${job.budget}</span><span class="sb-chip">${job.experience}</span><span class="sb-chip">${job.duration}</span></div>
        <p class="mt-5 text-sm leading-7 text-slate-600">${job.description}</p>
        <div class="mt-5 flex flex-wrap gap-2">${job.tags.map(tag => `<span class="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded">${tag}</span>`).join('')}</div>
        <div class="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p class="text-sm text-slate-500">Proposals: ${job.proposals}</p>
          <div class="flex gap-3"><button class="save-job sb-btn sb-btn-outline" type="button">Save Job</button><a href="browse.html" class="sb-btn sb-btn-primary">Apply Now</a></div>
        </div>`;
      list.appendChild(card);
    });

  if (filteredJobs.length === 0) {
    list.innerHTML = `
      <article class="sb-card p-8 text-center">
        <h3 class="font-jakarta text-xl font-extrabold text-slate-900 mb-2">No jobs matched these filters</h3>
        <p class="text-slate-500">Try a different category or reset the filters to see more opportunities.</p>
      </article>
    `;
  }

  if (window.lucide) window.lucide.createIcons();
}

function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 1600);
}

function syncFilterCheckboxes() {
  document.querySelectorAll('.filter-checkbox').forEach(input => {
    const box = input.nextElementSibling;
    if (!box) return;

    if (input.checked) {
      box.className = 'filter-box bg-green-700 text-white';
      box.innerHTML = '<i data-lucide="check" class="w-3 h-3"></i>';
    } else {
      box.className = 'filter-box';
      box.innerHTML = '';
    }
  });

  if (window.lucide) window.lucide.createIcons();
}

function applyFiltersFromInputs() {
  state.budget = Array.from(document.querySelectorAll('.filter-checkbox[data-filter-group="budget"]:checked')).map(input => input.value);
  state.experience = Array.from(document.querySelectorAll('.filter-checkbox[data-filter-group="experience"]:checked')).map(input => input.value);
  renderJobs();
}

function resetFilters() {
  state.category = defaultFilters.category;
  state.search = defaultFilters.search;
  state.budget = [...defaultFilters.budget];
  state.experience = [...defaultFilters.experience];

  const searchInput = document.getElementById('jobSearch');
  if (searchInput) searchInput.value = '';

  document.querySelectorAll('.category-btn').forEach(button => {
    button.classList.toggle('active', button.dataset.category === state.category);
  });

  document.querySelectorAll('.filter-checkbox').forEach(input => {
    const group = input.dataset.filterGroup;
    const values = defaultFilters[group] || [];
    input.checked = values.includes(input.value);
  });

  syncFilterCheckboxes();
  renderJobs();
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
    syncFilterCheckboxes();

    document.getElementById('jobSearch').addEventListener('input', event => {
      state.search = event.target.value;
      renderJobs();
    });

    document.querySelectorAll('.category-btn').forEach(btn => btn.addEventListener('click', function () {
      document.querySelectorAll('.category-btn').forEach(item => item.classList.remove('active'));
      this.classList.add('active');
      state.category = this.dataset.category;
      renderJobs();
    }));

    document.querySelectorAll('.filter-checkbox').forEach(input => {
      input.addEventListener('change', syncFilterCheckboxes);
    });

    document.getElementById('applyFilters').addEventListener('click', applyFiltersFromInputs);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);

    document.addEventListener('click', event => {
      if (event.target.closest('.save-job')) showToast();
    });

    if (window.lucide) window.lucide.createIcons();
  });
});
