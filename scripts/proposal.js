   //Data
const proposals = {
    ux: [
    {
        id: 1,
        name: 'Julian Henderson',
        initials: 'JH',
        color: 'from-sky-400 to-blue-600',
        rating: 4.9,
        reviews: 120,
        success: '98%',
        badge: null,
        bid: '$1,200',
        preview: 'I have over 8 years of experience designing complex financial interfaces. My approach focuses on simplifying dense data into actionable insights for end-users while maintaining bank-grade trust…',
        location: 'New York, USA',
        skills: ['UI/UX Design', 'Figma', 'FinTech', 'Design Systems', 'Prototyping'],
        bio: 'Senior product designer with a focus on financial technology and data-heavy dashboards. I\'ve shipped design systems for 3 Series B startups and love turning complexity into clarity.',
        hourly: '$95/hr',
        completed: 47,
    },
    {
        id: 2,
        name: 'Sarah Al-Mansour',
        initials: 'SA',
        color: 'from-violet-400 to-purple-600',
        rating: 5.0,
        reviews: 42,
        success: '100%',
        badge: 'HIGH VALUE',
        bid: '$2,450',
        preview: 'Award-winning Fintech UI designer with a specialty in mobile-first banking applications. I\'ve previously worked with 3 Series B fintech startups to overhaul their customer onboarding…',
        location: 'Dubai, UAE',
        skills: ['Mobile UI', 'Banking Apps', 'User Research', 'Figma', 'Branding'],
        bio: 'Award-winning designer passionate about building trust through great design. Formerly led design at two unicorn startups. Every pixel is intentional.',
        hourly: '$120/hr',
        completed: 29,
    },
    {
        id: 3,
        name: 'David Chen',
        initials: 'DC',
        color: 'from-emerald-400 to-green-600',
        rating: 4.8,
        reviews: 215,
        success: '95%',
        badge: null,
        bid: '$1,800',
        preview: 'I specialize in creating pixel-perfect Design Systems that scale. For your Fintech App, I propose building a modular component library that will reduce your dev time by 40%…',
        location: 'San Francisco, USA',
        skills: ['Design Systems', 'Figma', 'Storybook', 'UI Architecture', 'React'],
        bio: 'Systems thinker and UI craftsman. I build scalable component libraries that designers and engineers both love. 215 successful projects and counting.',
        hourly: '$85/hr',
        completed: 215,
    },
    {
        id: 4,
        name: 'Elena Rodriguez',
        initials: 'ER',
        color: 'from-rose-400 to-pink-600',
        rating: 4.9,
        reviews: 89,
        success: '96%',
        badge: null,
        bid: '$950',
        preview: 'Passionate about user psychology and clean aesthetics. I can help you create an app experience that not only looks professional but converts visitors into loyal users…',
        location: 'Barcelona, Spain',
        skills: ['UX Research', 'Interaction Design', 'Usability Testing', 'Figma', 'Adobe XD'],
        bio: 'UX architect who marries psychology with design. I obsess over user journeys and micro-interactions that feel effortless. Top-rated on SkillBridge for 3 years running.',
        hourly: '$75/hr',
        completed: 89,
    },
    ],
    brand: [
    {
        id: 5,
        name: 'Priya Sharma',
        initials: 'PS',
        color: 'from-amber-400 to-orange-500',
        rating: 4.9,
        reviews: 63,
        success: '97%',
        badge: 'TOP RATED',
        bid: '$2,800',
        preview: 'Brand identity is my craft. I\'ve built visual systems for over 60 e-commerce brands, with a focus on scalable design language that works across digital and print…',
        location: 'London, UK',
        skills: ['Branding', 'Logo Design', 'Style Guides', 'Illustrator', 'Typography'],
        bio: 'Brand strategist and visual identity designer. I create cohesive design systems that turn products into brands people remember.',
        hourly: '$110/hr',
        completed: 63,
    },
    {
        id: 6,
        name: 'Lucas Ferreira',
        initials: 'LF',
        color: 'from-cyan-400 to-sky-600',
        rating: 4.7,
        reviews: 38,
        success: '92%',
        badge: null,
        bid: '$1,600',
        preview: 'Specialized in e-commerce brand storytelling. My style guide deliverables include full token systems and usage documentation for dev handoff…',
        location: 'São Paulo, Brazil',
        skills: ['Brand Design', 'E-commerce', 'Style Guides', 'Figma', 'Motion'],
        bio: 'Visual storyteller who bridges brand and UX. I bring brands to life across every touchpoint — from logo to loading animation.',
        hourly: '$70/hr',
        completed: 38,
    },
    ],
    react: [
    {
        id: 7,
        name: 'Marcus Chen',
        initials: 'MC',
        color: 'from-slate-500 to-slate-700',
        rating: 5.0,
        reviews: 54,
        success: '100%',
        badge: 'HIGH VALUE',
        bid: '$4,200',
        preview: 'Full-stack React Native specialist with 6 years shipping production apps. I\'ll deliver clean, performant, and testable feature code with full documentation…',
        location: 'Toronto, Canada',
        skills: ['React Native', 'TypeScript', 'Redux', 'Node.js', 'CI/CD'],
        bio: 'Senior React Native engineer who ships fast and documents everything. Worked with teams at Series A through IPO stages. Code quality is non-negotiable.',
        hourly: '$130/hr',
        completed: 54,
    },
    {
        id: 8,
        name: 'Amara Osei',
        initials: 'AO',
        color: 'from-teal-400 to-emerald-600',
        rating: 4.8,
        reviews: 97,
        success: '94%',
        badge: null,
        bid: '$3,100',
        preview: 'React Native developer with a strong background in performance optimization and offline-first architecture. I\'ll get your feature shipped on time and on spec…',
        location: 'Accra, Ghana',
        skills: ['React Native', 'GraphQL', 'Firebase', 'Performance', 'Testing'],
        bio: 'Mobile engineer focused on developer experience and app performance. I care about bundle size, render counts, and test coverage — things that matter long term.',
        hourly: '$95/hr',
        completed: 97,
    },
    ],
};

    /*  RENDER CARDS  */
function renderProposals(key) {
    const list = document.getElementById('proposalList');
    const items = proposals[key] || [];
    if (items.length === 0) {
    list.innerHTML = `<div class="text-center py-16 text-slate-400 text-[14px]">No proposals yet for this job.</div>`;
    return;
    }
    list.innerHTML = items.map(p => `
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 hover:border-green-200 transition-colors">
        <div class="flex flex-col sm:flex-row sm:items-start gap-4">

        <!-- Avatar -->
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-[15px] shrink-0">
            ${p.initials}
        </div>

        <!-- Middle info -->
        <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
            <span class="font-jakarta text-[15px] font-bold text-slate-900">${p.name}</span>
            ${p.badge ? `<span class="bg-pink-50 text-pink-600 border border-pink-100 text-[10px] font-bold px-2 py-0.5 rounded-full">${p.badge}</span>` : ''}
            </div>
            <div class="flex flex-wrap items-center gap-2.5 mb-2.5">
            <!-- Stars -->
            <span class="flex items-center gap-1 text-[12px] text-amber-500 font-semibold">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ${p.rating}
            </span>
            <span class="text-[12px] text-slate-400">(${p.reviews} reviews)</span>
            <span class="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                ${p.success} Job Success
            </span>
            </div>
            <p class="text-[13px] text-slate-500 leading-relaxed mb-4">${p.preview}</p>
            <div class="flex flex-wrap gap-2">
            <button onclick="openMessageModal(${p.id})"
                class="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-[12px] font-bold px-4 py-2 rounded-lg transition-colors border-none cursor-pointer">
                <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                MESSAGE
            </button>
            <button onclick="openProfileModal(${p.id})"
                class="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-[12px] font-semibold px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
                <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                VIEW PROFILE
            </button>
            </div>
        </div>

        <!-- Bid -->
        <div class="sm:text-right shrink-0">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Proposed Bid</div>
            <div class="font-jakarta text-[22px] font-extrabold text-slate-900">${p.bid}</div>
        </div>

        </div>
    </div>
    `).join('');
    
}

    /*  DROPDOWN  */
document.getElementById('jobSelect').addEventListener('change', function () {
    renderProposals(this.value);
});

/*  PROFILE MODAL  */
function findProposal(id) {
    return Object.values(proposals).flat().find(p => p.id === id);
}

function openProfileModal(id) {
    const p = findProposal(id);
    if (!p) return;
    document.getElementById('profileModalContent').innerHTML = `
    <div class="flex items-center gap-4 mb-5">
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-[18px] shrink-0">${p.initials}</div>
        <div>
        <div class="font-jakarta text-[17px] font-extrabold text-slate-900 mb-0.5">${p.name}</div>
        <div class="flex items-center gap-2 text-[12px] text-slate-400">
            <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${p.location}
        </div>
        </div>
    </div>
    <div class="flex items-center gap-4 mb-4 p-3 bg-slate-50 rounded-xl">
        <div class="text-center flex-1">
        <div class="font-jakarta text-[16px] font-extrabold text-slate-900">${p.rating}</div>
        <div class="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Rating</div>
        </div>
        <div class="w-px h-8 bg-slate-200"></div>
        <div class="text-center flex-1">
        <div class="font-jakarta text-[16px] font-extrabold text-slate-900">${p.completed}</div>
        <div class="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Jobs Done</div>
        </div>
        <div class="w-px h-8 bg-slate-200"></div>
        <div class="text-center flex-1">
        <div class="font-jakarta text-[16px] font-extrabold text-green-600">${p.hourly}</div>
        <div class="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Rate</div>
        </div>
    </div>
    <p class="text-[13px] text-slate-500 leading-relaxed mb-4">${p.bio}</p>
    <div class="mb-5">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Skills</div>
        <div class="flex flex-wrap gap-1.5">
        ${p.skills.map(s => `<span class="bg-green-50 text-green-700 border border-green-100 text-[11px] font-semibold px-2.5 py-1 rounded-full">${s}</span>`).join('')}
        </div>
    </div>
    <div class="flex gap-2 pt-1">
        <button onclick="closeProfileModal(); openMessageModal(${p.id})"
        class="flex-1 bg-green-600 hover:bg-green-700 text-white text-[12px] font-bold py-2.5 rounded-xl border-none cursor-pointer transition-colors">
        Message
        </button>
        <button onclick="closeProfileModal()"
        class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[12px] font-semibold py-2.5 rounded-xl border-none cursor-pointer transition-colors">
        Close
        </button>
    </div>
    `;
    const modal = document.getElementById('profileModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}
//Sidebar toggle

    function closeSidebar() {
      document.getElementById('sidebar').classList.add('-translate-x-full');
      document.getElementById('sidebarOverlay').classList.add('hidden');
    }

    document.getElementById('menuToggle').addEventListener('click', function () {
      document.getElementById('sidebar').classList.toggle('-translate-x-full');
      document.getElementById('sidebarOverlay').classList.toggle('hidden');
    });

renderProposals('ux');

/*  Message model  */
function openMessageModal(id) {
    const p = findProposal(id);
    if (!p) return;
    document.getElementById('messageModalContent').innerHTML = `
    <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-[13px] shrink-0">${p.initials}</div>
        <div>
        <div class="font-jakarta text-[14px] font-extrabold text-slate-900">${p.name}</div>
        <div class="text-[11px] text-slate-400">Send a message</div>
        </div>
    </div>
    <textarea id="msgText" rows="4" placeholder="Write your message here…"
        class="w-full border border-slate-200 rounded-xl text-[13px] text-slate-700 placeholder-slate-400 p-3 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 resize-none transition-colors mb-3"></textarea>
    <div class="flex gap-2">
        <button onclick="sendMessage()"
        class="flex-1 bg-green-600 hover:bg-green-700 text-white text-[12px] font-bold py-2.5 rounded-xl border-none cursor-pointer transition-colors">
        Send Message
        </button>
        <button onclick="closeMessageModal()"
        class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[12px] font-semibold py-2.5 rounded-xl border-none cursor-pointer transition-colors">
        Cancel
        </button>
    </div>
    `;
    const modal = document.getElementById('messageModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeMessageModal(e) {
    if (e && e.target !== document.getElementById('messageModal')) return;
    const modal = document.getElementById('messageModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function sendMessage() {
    const txt = document.getElementById('msgText').value.trim();
    if (!txt) { document.getElementById('msgText').focus(); return; }
    document.getElementById('messageModalContent').innerHTML = `
    <div class="text-center py-6">
        <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
        <svg width="22" height="22" fill="none" stroke="#16a34a" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="font-jakarta text-[15px] font-extrabold text-slate-900 mb-1">Message Sent!</div>
        <p class="text-[13px] text-slate-400 mb-5">Your message has been delivered successfully.</p>
        <button onclick="closeMessageModal()" class="bg-green-600 hover:bg-green-700 text-white text-[12px] font-bold px-6 py-2.5 rounded-xl border-none cursor-pointer transition-colors">Done</button>
    </div>
    `;
}
