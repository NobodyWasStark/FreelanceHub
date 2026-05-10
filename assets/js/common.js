const sidebarHTML = `
<div class="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
    <div class="p-6">
        <div class="flex items-center gap-2 text-green-600 font-bold text-2xl">
            <div class="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <div class="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            SkillBridge
        </div>
    </div>
    <nav class="flex-1 px-4 space-y-2 mt-4">
        <a href="dashboard.html" class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-gray-500 hover:bg-gray-50 hover:text-green-600">
            <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
            <span class="font-medium">Dashboard</span>
        </a>
        <a href="dashboard.html#recommended-work" class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-gray-500 hover:bg-gray-50 hover:text-green-600">
            <i data-lucide="briefcase" class="w-5 h-5"></i>
            <span class="font-medium">Find Work</span>
        </a>
        <a href="proposals.html" class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-gray-500 hover:bg-gray-50 hover:text-green-600">
            <i data-lucide="file-text" class="w-5 h-5"></i>
            <span class="font-medium">Proposals</span>
        </a>
        <a href="reports.html" class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-gray-500 hover:bg-gray-50 hover:text-green-600">
            <i data-lucide="bar-chart-3" class="w-5 h-5"></i>
            <span class="font-medium">Reports</span>
        </a>
        <a href="settings.html" class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-gray-500 hover:bg-gray-50 hover:text-green-600">
            <i data-lucide="settings" class="w-5 h-5"></i>
            <span class="font-medium">Settings</span>
        </a>
    </nav>
    <div class="p-4 mt-auto space-y-4">
        <button class="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">POST A SERVICE</button>
        <div class="flex items-center gap-3 p-3 border-t border-gray-100">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" class="w-10 h-10 rounded-full border border-gray-200">
            <div class="flex flex-col">
                <span class="text-sm font-bold text-gray-900 leading-tight">Alex Mitchell</span>
                <span class="text-xs text-gray-500 uppercase tracking-wider font-medium">View Profile</span>
            </div>
        </div>
    </div>
</div>`;

const navbarHTML = `
<div class="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10">
    <div class="flex-1 max-w-md">
        <div class="relative group">
            <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"></i>
            <input type="text" placeholder="Search for jobs..." class="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-green-600/20 transition-all outline-none">
        </div>
    </div>
    <div class="flex items-center gap-6">
        <button class="p-2 text-gray-400 hover:text-green-600 transition-all relative">
            <i data-lucide="bell" class="w-5 h-5"></i>
            <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button class="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100">UPGRADE</button>
    </div>
</div>`;

document.addEventListener('DOMContentLoaded', () => {
    const sidebarContainer = document.getElementById('sidebar-container');
    const navbarContainer = document.getElementById('navbar-container');

    if (sidebarContainer) sidebarContainer.innerHTML = sidebarHTML;
    if (navbarContainer) navbarContainer.innerHTML = navbarHTML;

    // Highlight active nav item
    const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
    const currentHash = window.location.hash;
    document.querySelectorAll('.nav-item').forEach(item => {
        const itemHref = item.getAttribute('href');
        const [itemPath, itemHash] = itemHref.split('#');
        const isCurrentPage = itemPath === currentPath;
        const isHashMatch = itemHash && currentHash === `#${itemHash}`;
        const isDashboardDefault = itemHref === 'dashboard.html' && isCurrentPage && !currentHash;

        if (isDashboardDefault || (isCurrentPage && isHashMatch) || (isCurrentPage && !itemHash && currentPath !== 'dashboard.html')) {
            item.classList.remove('text-gray-500');
            item.classList.add('bg-green-700', 'text-white', 'shadow-lg', 'shadow-green-200');
        }
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
});
