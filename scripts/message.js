const chats = [
  {
    id:1, name:"Emma Watson", project:"Re: Web Dev Portfolio",
    preview:"That sounds like a great plan...", time:"2m ago", unread:2, online:true,
    avatar:"https://randomuser.me/api/portraits/women/44.jpg",
    profile:{
      role:"Full-Stack Developer", location:"London, UK", rating:4.9, reviews:87,
      bio:"Passionate full-stack developer specialising in React and Node.js. I love building clean, accessible, and highly performant web applications. 5+ years of professional experience.",
      skills:["React","Node.js","TypeScript","Figma","REST APIs"],
      project:"Web Dev Portfolio", hourlyRate:"$65/hr", completedJobs:124
    },
    messages:[
      {from:"them",text:"Hi Alexander! I've just uploaded the initial wireframes for the homepage and the search results page. Would love to hear your thoughts.",time:"10:14 AM",date:"MONDAY, JUNE 12"},
      {from:"me",  text:"Excellent! I'll take a look at them now. Did you manage to include the new filtering requirements we discussed on Friday?",time:"10:16 AM"},
      {from:"them",text:"Yes, I've implemented the multi-select category filter and the price range slider. It's on page 4 of the PDF.",time:"10:18 AM"},
      {from:"me",  text:"The range slider looks perfect. Regarding the multi-select — do we want those to be tags or a standard checkbox list?",time:"10:20 AM"},
      {from:"them",text:"I went with a tag-style UI because it feels more modern for the \"Atelier\" look we're going for.",time:"10:22 AM"},
      {from:"them",text:"That sounds like a great plan. I can have the functional prototype ready by Wednesday afternoon if these get approved.",time:"10:23 AM"},
    ]
  },
  {
    id:2, name:"Marcus Chen", project:"Re: API Integration",
    preview:"Let me check the documentation o...", time:"1h ago", unread:0, online:false,
    initials:"MC", color:"bg-blue-100 text-blue-700",
    profile:{
      role:"Backend Engineer", location:"San Francisco, CA", rating:4.7, reviews:52,
      bio:"Backend engineer with deep expertise in distributed systems, REST/GraphQL APIs, and cloud infrastructure. I take pride in building robust, scalable services.",
      skills:["Python","Go","PostgreSQL","AWS","GraphQL"],
      project:"API Integration", hourlyRate:"$80/hr", completedJobs:78
    },
    messages:[
      {from:"them",text:"Hey, just checking in on the API integration. Did the auth tokens work after the refresh?",time:"9:05 AM",date:"MONDAY, JUNE 12"},
      {from:"me",  text:"Yes! The tokens are working now. I had to update the refresh logic slightly.",time:"9:10 AM"},
      {from:"them",text:"Let me check the documentation one more time to make sure we're not missing any edge cases.",time:"9:15 AM"},
    ]
  },
  {
    id:3, name:"Lucia Alvarez", project:"Re: UI Redesign",
    preview:"The latest mocks are looking ama...", time:"3h ago", unread:1, online:true,
    initials:"LA", color:"bg-purple-100 text-purple-700",
    profile:{
      role:"UI/UX Designer", location:"Barcelona, Spain", rating:5.0, reviews:34,
      bio:"Creative UI/UX designer who loves transforming complex problems into beautiful, intuitive interfaces. Expert in Figma, design systems, and user research.",
      skills:["Figma","Design Systems","Prototyping","Tailwind CSS","User Research"],
      project:"UI Redesign", hourlyRate:"$55/hr", completedJobs:56
    },
    messages:[
      {from:"them",text:"Hey! Sent over the latest UI mocks for the redesign.",time:"7:30 AM",date:"MONDAY, JUNE 12"},
      {from:"me",  text:"Just opening them now — love the new color palette!",time:"7:45 AM"},
      {from:"them",text:"The latest mocks are looking amazing, especially the dashboard section.",time:"7:50 AM"},
    ]
  },
  {
    id:4, name:"David Thorne", project:"Re: Brand Identity",
    preview:"Payment has been released for mil...", time:"Yesterday", unread:0, online:false,
    initials:"DT", color:"bg-orange-100 text-orange-700",
    profile:{
      role:"Brand Designer", location:"Toronto, Canada", rating:4.8, reviews:61,
      bio:"Brand designer with a passion for storytelling through visual identity. I help startups and established companies craft memorable brands that resonate with their audience.",
      skills:["Brand Identity","Illustrator","Photoshop","Logo Design","Typography"],
      project:"Brand Identity", hourlyRate:"$70/hr", completedJobs:93
    },
    messages:[
      {from:"them",text:"Hi, the brand identity assets were delivered on time. The client loved it!",time:"Yesterday 3:00 PM",date:"SUNDAY, JUNE 11"},
      {from:"me",  text:"Great to hear! Please confirm the milestone is complete on your end.",time:"Yesterday 3:15 PM"},
      {from:"them",text:"Payment has been released for milestone 2. Thanks for the smooth collaboration.",time:"Yesterday 4:00 PM"},
    ]
  }
];


// STATE
let activeChatId = null;
let profileOpen  = false;
let dropdownOpen = false;
const isMobile  = () => window.innerWidth < 640;
const isDesktop = () => window.innerWidth >= 1024;

//  CHAT LIST
function renderChatList(filter = "") {
  const list = document.getElementById("chat-list");
  list.innerHTML = "";
  chats
    .filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || c.project.toLowerCase().includes(filter.toLowerCase()))
    .forEach(chat => {
      const div = document.createElement("div");
      div.className = `chat-item flex items-start gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-green-50 ${chat.id === activeChatId ? "active" : ""}`;

      const avatarHTML = chat.avatar
        ? `<div class="relative shrink-0"><img src="${chat.avatar}" class="w-11 h-11 rounded-full object-cover" alt="${chat.name}"/>${chat.online?`<span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>`:""}</div>`
        : `<div class="relative shrink-0"><div class="w-11 h-11 rounded-full ${chat.color} font-bold text-sm flex items-center justify-center">${chat.initials}</div>${chat.online?`<span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>`:""}</div>`;

      div.innerHTML = `
        ${avatarHTML}
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1 mb-0.5">
            <p class="text-sm font-semibold text-gray-900 truncate">${chat.name}</p>
            <span class="text-[10px] text-gray-400 shrink-0">${chat.time}</span>
          </div>
          <p class="text-xs font-medium text-green-700 truncate mb-0.5">${chat.project}</p>
          <p class="text-xs text-gray-400 truncate">${chat.preview}</p>
        </div>
        ${chat.unread > 0 ? `<span class="shrink-0 mt-1 w-5 h-5 rounded-full bg-green-600 text-white text-[10px] font-bold flex items-center justify-center">${chat.unread}</span>` : ""}
      `;
      div.addEventListener("click", () => selectChat(chat.id));
      list.appendChild(div);
    });
}
// SELECT CHAT
function selectChat(id) {
  activeChatId = id;
  const chat = chats.find(c => c.id === id);
  if (!chat) return;
  chat.unread = 0;
  renderChatList(document.getElementById("chat-search").value);

  // Header
  const hdrAvatar   = document.getElementById("hdr-avatar");
  const hdrInitials = document.getElementById("hdr-initials");
  const hdrDot      = document.getElementById("hdr-dot");
  if (chat.avatar) {
    hdrAvatar.src = chat.avatar;
    hdrAvatar.classList.remove("hidden");
    hdrInitials.classList.add("hidden");
  } else {
    hdrInitials.textContent = chat.initials;
    hdrInitials.className = `w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center ${chat.color}`;
    hdrInitials.classList.remove("hidden");
    hdrAvatar.classList.add("hidden");
  }
  hdrDot.classList.toggle("hidden", !chat.online);
  document.getElementById("hdr-name").textContent = chat.name;
  const statusEl = document.getElementById("hdr-status");
  statusEl.textContent = chat.online ? "Active Online" : "Offline";
  statusEl.className = `text-xs font-medium ${chat.online ? "text-green-500" : "text-gray-400"}`;

  renderMessages(chat);

  // Show chat area, hide empty state
  document.getElementById("empty-state").classList.add("hidden");
  const chatArea = document.getElementById("chat-area");
  chatArea.classList.remove("hidden");
  chatArea.classList.add("flex");

  // Mobile: hide list
  if (isMobile()) document.getElementById("chat-list-panel").classList.add("hidden");

  // Update profile content if panel is open
  if (profileOpen) renderProfileContent();
  closeDropdown();
}

//  MESSAGES
function renderMessages(chat) {
  const container = document.getElementById("chat-messages");
  container.innerHTML = "";
  let lastDate = null;
  chat.messages.forEach(msg => {
    if (msg.date && msg.date !== lastDate) {
      lastDate = msg.date;
      const lbl = document.createElement("div");
      lbl.className = "flex items-center justify-center my-2";
      lbl.innerHTML = `<span class="text-[11px] font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full tracking-wide">${msg.date}</span>`;
      container.appendChild(lbl);
    }
    const isMe = msg.from === "me";
    const wrap = document.createElement("div");
    wrap.className = `flex ${isMe ? "justify-end" : "justify-start"} bubble-in`;
    wrap.innerHTML = `
      <div class="max-w-[75%] sm:max-w-[62%]">
        <div class="${isMe ? "bg-green-700 text-white rounded-2xl rounded-tr-sm" : "bg-white text-gray-800 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100"} px-4 py-2.5 text-sm leading-relaxed">${msg.text}</div>
        <p class="text-[10px] text-gray-400 mt-1 px-1 ${isMe ? "text-right" : "text-left"}">${msg.time}</p>
      </div>`;
    container.appendChild(wrap);
  });
  container.scrollTop = container.scrollHeight;
}

// SEND
function sendMessage() {
  if (!activeChatId) return;
  const input = document.getElementById("msg-input");
  const text  = input.value.trim();
  if (!text) return;
  const chat = chats.find(c => c.id === activeChatId);
  const time = new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
  chat.messages.push({from:"me", text, time});
  chat.preview = text.length > 38 ? text.slice(0,38)+"..." : text;
  chat.time = "Just now";
  input.value = "";
  renderMessages(chat);
  renderChatList(document.getElementById("chat-search").value);
}
// PROFILE
function buildProfileHTML(chat) {
  const p = chat.profile;
  const starsHTML = Array.from({length:5},(_,i) =>
    `<svg class="w-3.5 h-3.5 ${i < Math.floor(p.rating) ? "text-amber-400" : "text-gray-200"}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`
  ).join("");
  const avatarHTML = chat.avatar
    ? `<img src="${chat.avatar}" class="w-16 h-16 rounded-full object-cover ring-4 ring-green-100" alt="${chat.name}"/>`
    : `<div class="w-16 h-16 rounded-full ${chat.color} font-bold text-xl flex items-center justify-center ring-4 ring-green-100">${chat.initials}</div>`;
  const skillsHTML = p.skills.map(s =>
    `<span class="text-xs bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full font-medium">${s}</span>`
  ).join("");

  return `
    <div class="flex flex-col items-center text-center pb-5 border-b border-gray-100">
      ${avatarHTML}
      <h3 class="font-bold text-gray-900 mt-3 text-base">${chat.name}</h3>
      <p class="text-sm text-gray-500 mt-0.5">${p.role}</p>
      <div class="flex items-center gap-1 mt-1.5 text-gray-400">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span class="text-xs">${p.location}</span>
      </div>
      <div class="flex items-center gap-0.5 mt-2">
        ${starsHTML}
        <span class="text-xs font-semibold text-gray-700 ml-1.5">${p.rating}</span>
        <span class="text-xs text-gray-400 ml-0.5">(${p.reviews})</span>
      </div>
    </div>
    <div class="py-4 border-b border-gray-100">
      <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">About</p>
      <p class="text-sm text-gray-600 leading-relaxed">${p.bio}</p>
    </div>
    <div class="py-4 border-b border-gray-100">
      <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Skills</p>
      <div class="flex flex-wrap gap-1.5">${skillsHTML}</div>
    </div>
    <div class="py-4">
      <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Project Info</p>
      <div class="space-y-2.5">
        <div class="flex items-center justify-between"><span class="text-xs text-gray-500">Current Project</span><span class="text-xs font-semibold text-gray-800">${p.project}</span></div>
        <div class="flex items-center justify-between"><span class="text-xs text-gray-500">Hourly Rate</span><span class="text-xs font-semibold text-green-700">${p.hourlyRate}</span></div>
        <div class="flex items-center justify-between"><span class="text-xs text-gray-500">Jobs Completed</span><span class="text-xs font-semibold text-gray-800">${p.completedJobs}</span></div>
      </div>
    </div>`;
}

function renderProfileContent() {
  if (!activeChatId) return;
  const chat = chats.find(c => c.id === activeChatId);
  const html = buildProfileHTML(chat);
  document.getElementById("profile-panel-body").innerHTML = html;
  document.getElementById("profile-modal-body").innerHTML = html;
}

function openProfile() {
  if (!activeChatId) return;
  profileOpen = true;
  renderProfileContent();
  closeDropdown();
  if (isDesktop()) {
    const p = document.getElementById("profile-panel");
    p.classList.remove("hidden","panel-closed");
    p.classList.add("panel-open");
  } else {
    const m = document.getElementById("profile-modal");
    m.classList.remove("modal-hidden");
    m.classList.add("modal-visible");
  }
}

function closeProfile() {
  profileOpen = false;
  // Desktop
  const p = document.getElementById("profile-panel");
  p.classList.remove("panel-open");
  p.classList.add("panel-closed");
  setTimeout(() => { if (!profileOpen) p.classList.add("hidden"); }, 300);
  // Mobile
  const m = document.getElementById("profile-modal");
  m.classList.remove("modal-visible");
  m.classList.add("modal-hidden");
}

// ─── DROPDOWN
function toggleDropdown(e) {
  e.stopPropagation();
  dropdownOpen = !dropdownOpen;
  const menu = document.getElementById("three-dot-menu");
  menu.classList.toggle("dd-open",  dropdownOpen);
  menu.classList.toggle("dd-closed", !dropdownOpen);
}
function closeDropdown() {
  dropdownOpen = false;
  const menu = document.getElementById("three-dot-menu");
  menu.classList.remove("dd-open");
  menu.classList.add("dd-closed");
}
function dropdownAction(action) {
  closeDropdown();
  if (action === "profile") { openProfile(); return; }
  if (action === "unread" && activeChatId) {
    chats.find(c => c.id === activeChatId).unread = 1;
    renderChatList(document.getElementById("chat-search").value);
    return;
  }
  if ((action === "archive" || action === "delete") && activeChatId) {
    const idx = chats.findIndex(c => c.id === activeChatId);
    if (idx !== -1) chats.splice(idx, 1);
    activeChatId = null;
    closeProfile();
    renderChatList(document.getElementById("chat-search").value);
    document.getElementById("chat-area").classList.add("hidden");
    document.getElementById("chat-area").classList.remove("flex");
    document.getElementById("empty-state").classList.remove("hidden");
    if (isMobile()) document.getElementById("chat-list-panel").classList.remove("hidden");
  }
}

// ─── MOBILE NAV
function openSidebar() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("mobile-overlay").classList.add("show");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("mobile-overlay").classList.remove("show");
}
function showChatList() {
  activeChatId = null;
  document.getElementById("chat-list-panel").classList.remove("hidden");
  document.getElementById("chat-area").classList.add("hidden");
  document.getElementById("chat-area").classList.remove("flex");
  document.getElementById("empty-state").classList.remove("hidden");
  renderChatList();
}

// ─── CLOSE DROPDOWN OUTSIDE
document.addEventListener("click", e => {
  const menu = document.getElementById("three-dot-menu");
  const btn  = document.getElementById("three-dot-btn");
  if (dropdownOpen && !menu.contains(e.target) && !btn.contains(e.target)) closeDropdown();
});

// ─── RESIZE
window.addEventListener("resize", () => {
  if (!isMobile()) {
    document.getElementById("chat-list-panel").classList.remove("hidden");
    if (activeChatId) {
      document.getElementById("chat-area").classList.remove("hidden");
      document.getElementById("chat-area").classList.add("flex");
      document.getElementById("empty-state").classList.add("hidden");
    }
  }
});

// ─── EVENTS
document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("msg-input").addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
document.getElementById("chat-search").addEventListener("input", e => renderChatList(e.target.value));

// ─── INIT — show empty state, nothing selected ───────────────
renderChatList();