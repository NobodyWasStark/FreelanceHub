function showToast(text) {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 1800);
}

document.addEventListener('DOMContentLoaded', function () {
  window.initializeFreelancerLayout({
    activeNav: 'settings',
    headerLeft: `<h1 class="font-jakarta text-xl font-extrabold">Settings</h1>`,
    headerRight: `
      <div class="flex gap-3">
        <button id="resetSettings" class="sb-btn sb-btn-outline">Cancel</button>
        <button id="saveSettings" class="sb-btn sb-btn-primary">Save Changes</button>
      </div>
    `
  }).then(function () {
    const form = document.getElementById('settingsForm');
    const nameInput = document.querySelector('input[name="name"]');
    const emailInput = document.querySelector('input[name="email"]');
    const initials = document.getElementById('avatarInitials');
    const displayRole = document.getElementById('settings-display-role');
    const displayName = document.getElementById('settings-display-name');

    const user = typeof getSession === 'function' ? getSession() : null;
    if (user) {
      if (nameInput) nameInput.value = user.name;
      if (emailInput) emailInput.value = user.email;
      if (displayName) displayName.textContent = user.name;
      if (displayRole) displayRole.textContent = user.role === 'FREELANCER' ? 'Freelancer' : user.role;
      if (initials) initials.textContent = user.name.split(/\s+/).slice(0, 2).map(word => word[0] || '').join('').toUpperCase() || 'U';
    }

    nameInput.addEventListener('input', function () {
      initials.textContent = nameInput.value.trim().split(/\s+/).slice(0, 2).map(word => word[0] || '').join('').toUpperCase() || 'U';
      if (displayName) displayName.textContent = nameInput.value.trim() || 'User';
    });

    document.querySelectorAll('.toggle-input').forEach(input => {
      input.addEventListener('change', function () {
        const ui = input.nextElementSibling;
        ui.classList.toggle('bg-green-700', input.checked);
        ui.classList.toggle('bg-slate-200', !input.checked);
        ui.classList.toggle('after:right-1', input.checked);
        ui.classList.toggle('after:left-1', !input.checked);
      });
    });

    document.getElementById('resetSettings').addEventListener('click', function () {
      form.reset();
      initials.textContent = 'AM';
      showToast('Changes cancelled');
    });
    document.getElementById('saveSettings').addEventListener('click', () => showToast('Settings saved'));
    if (window.lucide) window.lucide.createIcons();
  });
});
