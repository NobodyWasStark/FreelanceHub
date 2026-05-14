  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const isOpen = !sidebar.classList.contains('-translate-x-full');
    sidebar.classList.toggle('-translate-x-full', isOpen);
    overlay.classList.toggle('hidden', isOpen);
  }
  function setTab(btn, tab) {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('border-brand-600','text-brand-700','font-semibold');
      b.classList.add('border-transparent','text-gray-500','font-medium');
    });
    btn.classList.add('border-brand-600','text-brand-700','font-semibold');
    btn.classList.remove('border-transparent','text-gray-500');
    document.querySelectorAll('.job-card').forEach(c => {
      c.classList.toggle('hidden', tab !== 'all' && c.dataset.status !== tab);
    });
  }
  // Wait until the whole HTML page is loaded
  document.addEventListener('DOMContentLoaded', function () {
    
    // Get the element with id="my-jobs"
    const myJobsBtn = document.getElementById('my-jobs');

    // Check if the element exists
    if (myJobsBtn) {
      myJobsBtn.addEventListener('click', function (e) {
        e.preventDefault(); // Prevent default link behavior

        // Open the profile page
        window.location.href = './skillbridge-profile.html';
      });
    }
  });