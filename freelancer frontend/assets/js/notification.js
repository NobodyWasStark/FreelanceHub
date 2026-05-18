function showNotificationToast(text) {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 1800);
}

function markItemRead(item) {
  item.classList.remove('unread');
  const button = item.querySelector('.notification-read');
  if (button) button.remove();
}

document.addEventListener('DOMContentLoaded', function () {
  window.initializeFreelancerLayout({
    activeNav: '',
    headerLeft: `
      <div class="flex items-center gap-3">
        <a href="dashboard.html" class="inline-flex items-center gap-2 font-bold text-green-700 no-underline">
          <i data-lucide="arrow-left" class="w-5 h-5"></i>Back to dashboard
        </a>
      </div>
    `,
    headerRight: `
      <a href="find-work.html" class="sb-btn sb-btn-primary">Find Work <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
    `
  }).then(function () {
    document.querySelectorAll('.notification-read').forEach(button => {
      button.addEventListener('click', function () {
        const item = this.closest('.notification-item');
        if (!item) return;
        markItemRead(item);
        showNotificationToast('Notification marked as read');
      });
    });

    document.getElementById('markAllRead').addEventListener('click', function () {
      document.querySelectorAll('.notification-item.unread').forEach(markItemRead);
      showNotificationToast('All notifications marked as read');
    });

    if (window.lucide) window.lucide.createIcons();
  });
});
