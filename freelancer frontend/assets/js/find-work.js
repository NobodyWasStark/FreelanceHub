let jobs = [];

async function loadJobs() {
  try {
    jobs = await Jobs.listCached({}, {
      onUpdate: (fresh) => {
        jobs = fresh.data || [];
        renderJobs();
      },
    }).then(data => (data && data.data) ? data.data : (data || []));
    renderJobs();
  } catch (err) {
    console.error('Failed to load jobs:', err);
  }
}

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
      job.client?.name || '',
      job.title || '',
      job.description || '',
      ...(job.skills || [])
    ].join(' ').toLowerCase().includes(query);

    return matchesSearch;
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
      
      const company = job.client?.name || 'Unknown Client';
      const companyInitial = company[0] ? company[0].toUpperCase() : 'U';
      const rating = '5.0'; // Placeholder
      const budgetStr = `$${job.budget}`;
      const proposals = job._count?.proposals || 0;
      const tags = job.skills || [];
      const description = job.description || '';
      
      card.innerHTML = `
        <div class="flex items-start justify-between gap-4 mb-5">
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-green-800">${companyInitial}</div>
            <div><p class="font-bold text-slate-900">${company} <span class="text-amber-400">*</span> ${rating}</p><p class="text-sm text-slate-500">Remote - Posted recently</p></div>
          </div>
          <button class="save-job text-slate-400 hover:text-green-700"><i data-lucide="bookmark" class="w-5 h-5"></i></button>
        </div>
        <a href="browse.html?id=${job.id}" class="font-jakarta text-xl font-extrabold text-green-700 no-underline hover:text-green-800">${job.title}</a>
        <div class="flex flex-wrap gap-2 mt-4"><span class="sb-chip bg-green-100 text-green-800">${budgetStr} Fixed</span><span class="sb-chip">Intermediate</span><span class="sb-chip">Remote</span></div>
        <p class="mt-5 text-sm leading-7 text-slate-600">${description}</p>
        <div class="mt-5 flex flex-wrap gap-2">${tags.map(tag => `<span class="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded">${tag}</span>`).join('')}</div>
        <div class="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p class="text-sm text-slate-500">Proposals: ${proposals}</p>
          <div class="flex gap-3"><button class="save-job sb-btn sb-btn-outline" type="button">Save Job</button><a href="browse.html?id=${job.id}" class="sb-btn sb-btn-primary">Apply Now</a></div>
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
    loadJobs();
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
