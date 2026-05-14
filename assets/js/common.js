const sidebarHTML = `
<div class="w-72 bg-[#F8FCF8] border-r border-green-50 flex flex-col h-screen sticky top-0">
    <div class="px-5 pt-5 pb-8">
        <div class="flex items-center gap-3 text-green-700 font-extrabold text-3xl tracking-tight">
            <i data-lucide="network" class="w-10 h-10 stroke-[3]"></i>
            SkillBridge
        </div>
    </div>
    <nav class="flex-1 px-6 space-y-4">
        <a href="dashboard.html" class="nav-item flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group text-gray-600 hover:bg-green-50 hover:text-green-700">
            <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
            <span class="font-semibold">Dashboard</span>
        </a>
        <a href="dashboard.html#recommended-work" class="nav-item flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group text-gray-600 hover:bg-green-50 hover:text-green-700">
            <i data-lucide="briefcase" class="w-5 h-5"></i>
            <span class="font-semibold">Find Work</span>
        </a>
        <a href="proposals.html" class="nav-item flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group text-gray-600 hover:bg-green-50 hover:text-green-700">
            <i data-lucide="file-text" class="w-5 h-5"></i>
            <span class="font-semibold">My Proposals</span>
        </a>
        <a href="messages.html" class="nav-item flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group text-gray-600 hover:bg-green-50 hover:text-green-700">
            <i data-lucide="mail" class="w-5 h-5"></i>
            <span class="font-semibold">Messages</span>
        </a>
        <a href="reports.html" class="nav-item flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group text-gray-600 hover:bg-green-50 hover:text-green-700">
            <i data-lucide="bar-chart-3" class="w-5 h-5"></i>
            <span class="font-semibold">Reports</span>
        </a>
        <a href="settings.html" class="nav-item flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group text-gray-600 hover:bg-green-50 hover:text-green-700">
            <i data-lucide="settings" class="w-5 h-5"></i>
            <span class="font-semibold">Settings</span>
        </a>
    </nav>
    <div class="p-5 mt-auto space-y-6">
        <div class="border-t border-green-100"></div>
        <button class="w-full bg-green-700 text-white py-3 rounded-lg font-extrabold tracking-widest text-xs hover:bg-green-800 transition-colors shadow-lg shadow-green-100">POST A SERVICE</button>
        <div class="flex items-center gap-3 px-2">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" class="w-10 h-10 rounded-full border border-gray-200">
            <div class="flex flex-col">
                <span class="text-sm font-bold text-gray-900 leading-tight">Noor chowdhury</span>
                <span class="text-xs text-gray-500 font-medium">View Public Profile</span>
            </div>
        </div>
    </div>
</div>`;

const navbarHTML = `
<div class="h-[72px] bg-[#F8FCF8] border-b border-green-50 px-9 flex items-center justify-between sticky top-0 z-10">
    <div class="flex-1 max-w-md" id="navbar-left">
        <div class="relative group" data-search-box>
            <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"></i>
            <input type="text" placeholder="Search for jobs..." class="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-green-600/20 transition-all outline-none">
        </div>
    </div>
    <div class="flex items-center gap-5">
        <button class="p-2 text-gray-500 hover:text-green-700 transition-all relative" aria-label="Notifications">
            <i data-lucide="bell" class="w-5 h-5"></i>
        </button>
        <button class="p-2 text-gray-500 hover:text-green-700 transition-all" aria-label="Help">
            <i data-lucide="circle-help" class="w-5 h-5"></i>
        </button>
        <button class="bg-green-700 text-white px-6 py-2.5 rounded-xl font-extrabold hover:bg-green-800 transition-all">Upgrade</button>
    </div>
</div>`;

document.addEventListener('DOMContentLoaded', () => {
    const sidebarContainer = document.getElementById('sidebar-container');
    const navbarContainer = document.getElementById('navbar-container');

    if (sidebarContainer) sidebarContainer.innerHTML = sidebarHTML;
    if (navbarContainer) navbarContainer.innerHTML = navbarHTML;

    const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
    const navbarLeft = document.getElementById('navbar-left');
    if (navbarLeft && currentPath === 'settings.html') {
        navbarLeft.innerHTML = '<h1 class="text-2xl font-extrabold text-gray-950 tracking-tight">Settings</h1>';
    }

    // Highlight active nav item
    const currentHash = window.location.hash;
    document.querySelectorAll('.nav-item').forEach(item => {
        const itemHref = item.getAttribute('href');
        const [itemPath, itemHash] = itemHref.split('#');
        const isCurrentPage = itemPath === currentPath;
        const isHashMatch = itemHash && currentHash === `#${itemHash}`;
        const isDashboardDefault = itemHref === 'dashboard.html' && isCurrentPage && !currentHash;

        if (isDashboardDefault || (isCurrentPage && isHashMatch) || (isCurrentPage && !itemHash && currentPath !== 'dashboard.html')) {
            item.classList.remove('text-gray-600');
            item.classList.add('bg-green-700', 'text-white', 'shadow-lg', 'shadow-green-100');
        }
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
});
