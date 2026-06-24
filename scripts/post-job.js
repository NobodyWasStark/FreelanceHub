// ── Skill tag management
function addSkillPrompt() {
  const skill = prompt('Enter a skill:');
  if (!skill || !skill.trim()) return;
  const container = document.getElementById('skills-container');
  const addBtn = container.querySelector('button[onclick="addSkillPrompt()"]');
  const tag = document.createElement('span');
  tag.className = 'inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-semibold';
  tag.innerHTML = skill.trim() + ' <button onclick="removeSkill(this)" class="text-green-500 hover:text-green-800 transition-colors leading-none bg-transparent border-none cursor-pointer p-0 text-sm">×</button>';
  container.insertBefore(tag, addBtn);
}

function removeSkill(el) {
  el.parentElement.remove();
}

// ── Budget type toggle
function toggleBudgetType(type) {
  const fixed  = document.getElementById('btn-fixed');
  const hourly = document.getElementById('btn-hourly');
  if (type === 'fixed') {
    fixed.classList.add('bg-green-600','text-white','border-green-600');
    fixed.classList.remove('bg-white','text-slate-600','border-slate-300');
    hourly.classList.add('bg-white','text-slate-600','border-slate-300');
    hourly.classList.remove('bg-green-600','text-white','border-green-600');
  } else {
    hourly.classList.add('bg-green-600','text-white','border-green-600');
    hourly.classList.remove('bg-white','text-slate-600','border-slate-300');
    fixed.classList.add('bg-white','text-slate-600','border-slate-300');
    fixed.classList.remove('bg-green-600','text-white','border-green-600');
  }
}

function selectLevel(level) {
  ['entry','intermediate','expert'].forEach(l => {
    const card = document.getElementById('level-' + l);
    const dot  = document.getElementById('dot-' + l);
    if (l === level) {
      card.classList.add('border-green-600','bg-green-50');
      card.classList.remove('border-slate-200','bg-white');
      dot.classList.add('bg-green-600','border-green-600');
      dot.classList.remove('border-slate-300');
      dot.innerHTML = '<span class="w-2 h-2 rounded-full bg-white block"></span>';
    } else {
      card.classList.remove('border-green-600','bg-green-50');
      card.classList.add('border-slate-200','bg-white');
      dot.classList.remove('bg-green-600','border-green-600');
      dot.classList.add('border-slate-300');
      dot.innerHTML = '';
    }
  });
}

// ── Responsive sidebar
function closeSidebar() {
  document.getElementById('sidebar').classList.add('-translate-x-full');
  document.getElementById('sidebarOverlay').classList.add('hidden');
}
document.getElementById('menuToggle').addEventListener('click', function () {
  document.getElementById('sidebar').classList.toggle('-translate-x-full');
  document.getElementById('sidebarOverlay').classList.toggle('hidden');
});

// ── Auth guard (CLIENT only)
requireAuth().then(user => {
  if (user && user.role !== 'CLIENT') {
    showToast('Only clients can post jobs.', 'error');
    setTimeout(() => window.location.href = '/skillbridge-dashboard.html', 1500);
  }
}).finally(() => {
  window.hideClientLoader && window.hideClientLoader();
});

// ── Submit job to backend
async function submitJob(event) {
  event.preventDefault();

  const titleEl       = document.getElementById('job-title');
  const descEl        = document.getElementById('job-description');
  const budgetEl      = document.getElementById('job-budget');
  const skillTags     = document.querySelectorAll('#skills-container span');

  const title       = titleEl?.value.trim();
  const description = descEl?.value.trim();
  const budget      = parseFloat(budgetEl?.value || '0');
  const skills      = Array.from(skillTags).map(t => t.textContent.replace('×','').trim()).filter(Boolean);

  if (!title || !description || !budget || skills.length === 0) {
    showToast('Please fill in all required fields and add at least one skill.', 'error');
    return;
  }

  const submitBtn = document.getElementById('submit-job-btn');
  const originalText = submitBtn?.textContent || 'Post Job';
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Posting...'; }

  try {
    await Jobs.create({ title, description, budget, skills });
    showToast('Job posted successfully!');
    setTimeout(() => window.location.href = '/skillbridge-post.html', 1000);
  } catch (err) {
    showToast(err.message || 'Failed to post job.', 'error');
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
  }
}