// ── State
let conversations = [];   // list of users we've talked to
let activeChatUserId = null;
let currentUser = null;
let profileOpen = false;
let dropdownOpen = false;
const isMobile  = () => window.innerWidth < 640;
const isDesktop = () => window.innerWidth >= 1024;

// ── Render chat list from real conversations
function renderChatList(filter = '') {
  const list = document.getElementById('chat-list');
  if (!list) return;
  list.innerHTML = '';
  conversations
    .filter(c => (c.name || '').toLowerCase().includes(filter.toLowerCase()))
    .forEach(chat => {
      const div = document.createElement('div');
      div.className = `chat-item flex items-start gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-green-50 ${chat.userId === activeChatUserId ? 'active' : ''}`;
      const initials = (chat.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      div.innerHTML = `
        <div class="relative shrink-0">
          <div class="w-11 h-11 rounded-full bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center">${initials}</div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1 mb-0.5">
            <p class="text-sm font-semibold text-gray-900 truncate">${chat.name}</p>
          </div>
          <p class="text-xs text-gray-400 truncate">${chat.lastMessage || 'No messages yet'}</p>
        </div>`;
      div.addEventListener('click', () => selectChat(chat.userId, chat.name));
      list.appendChild(div);
    });
}

// ── Select a conversation
async function selectChat(userId, name) {
  activeChatUserId = userId;
  renderChatList(document.getElementById('chat-search')?.value || '');

  document.getElementById('hdr-name').textContent = name || '';
  document.getElementById('hdr-status').textContent = '';
  const hdrInitials = document.getElementById('hdr-initials');
  const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  if (hdrInitials) {
    hdrInitials.textContent = initials;
    hdrInitials.className = 'w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center';
    hdrInitials.classList.remove('hidden');
  }

  document.getElementById('empty-state')?.classList.add('hidden');
  const chatArea = document.getElementById('chat-area');
  chatArea?.classList.remove('hidden');
  chatArea?.classList.add('flex');

  if (isMobile()) document.getElementById('chat-list-panel')?.classList.add('hidden');

  await loadMessages(userId);
  closeDropdown();
}

// ── Load messages from backend
async function loadMessages(userId) {
  try {
    const { data: messages } = await Messages.getConversation(userId);
    renderMessages(messages);
  } catch (err) {
    console.error('Failed to load messages:', err);
  }
}

// ── Render messages
function renderMessages(messages) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  container.innerHTML = '';
  messages.forEach(msg => {
    const isMe = msg.senderId === currentUser?.id;
    const wrap = document.createElement('div');
    wrap.className = `flex ${isMe ? 'justify-end' : 'justify-start'} bubble-in`;
    const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    wrap.innerHTML = `
      <div class="max-w-[75%] sm:max-w-[62%]">
        <div class="${isMe ? 'bg-green-700 text-white rounded-2xl rounded-tr-sm' : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100'} px-4 py-2.5 text-sm leading-relaxed">${msg.content}</div>
        <p class="text-[10px] text-gray-400 mt-1 px-1 ${isMe ? 'text-right' : 'text-left'}">${time}</p>
      </div>`;
    container.appendChild(wrap);
  });
  container.scrollTop = container.scrollHeight;
}

// ── Send message
async function sendMessage() {
  if (!activeChatUserId) return;
  const input = document.getElementById('msg-input');
  const content = input?.value.trim();
  if (!content) return;

  input.value = '';
  try {
    const { data: msg } = await Messages.send({ receiverId: activeChatUserId, content });
    // Append locally without reload
    const isMe = true;
    const container = document.getElementById('chat-messages');
    const wrap = document.createElement('div');
    wrap.className = 'flex justify-end bubble-in';
    const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    wrap.innerHTML = `
      <div class="max-w-[75%] sm:max-w-[62%]">
        <div class="bg-green-700 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">${msg.content}</div>
        <p class="text-[10px] text-gray-400 mt-1 px-1 text-right">${time}</p>
      </div>`;
    container?.appendChild(wrap);
    container && (container.scrollTop = container.scrollHeight);
  } catch (err) {
    showToast('Failed to send message.', 'error');
    input.value = content; // restore
  }
}

// ── Dropdown / profile helpers (UI-only, kept from original)
function toggleDropdown(e) { e.stopPropagation(); dropdownOpen = !dropdownOpen; const m = document.getElementById('three-dot-menu'); m?.classList.toggle('dd-open', dropdownOpen); m?.classList.toggle('dd-closed', !dropdownOpen); }
function closeDropdown() { dropdownOpen = false; const m = document.getElementById('three-dot-menu'); m?.classList.remove('dd-open'); m?.classList.add('dd-closed'); }
function openProfile() { profileOpen = true; closeDropdown(); }
function closeProfile() { profileOpen = false; const p = document.getElementById('profile-panel'); p?.classList.add('hidden'); }
function dropdownAction(action) { closeDropdown(); if (action === 'profile') openProfile(); }
function openSidebar() { document.getElementById('sidebar')?.classList.add('open'); document.getElementById('mobile-overlay')?.classList.add('show'); }
function closeSidebar() { document.getElementById('sidebar')?.classList.remove('open'); document.getElementById('mobile-overlay')?.classList.remove('show'); }
function showChatList() { activeChatUserId = null; document.getElementById('chat-list-panel')?.classList.remove('hidden'); document.getElementById('chat-area')?.classList.add('hidden'); document.getElementById('empty-state')?.classList.remove('hidden'); renderChatList(); }

// ── Close dropdown outside
document.addEventListener('click', e => {
  const menu = document.getElementById('three-dot-menu');
  const btn  = document.getElementById('three-dot-btn');
  if (dropdownOpen && !menu?.contains(e.target) && !btn?.contains(e.target)) closeDropdown();
});

// ── Resize
window.addEventListener('resize', () => {
  if (!isMobile()) {
    document.getElementById('chat-list-panel')?.classList.remove('hidden');
    if (activeChatUserId) {
      document.getElementById('chat-area')?.classList.remove('hidden');
      document.getElementById('chat-area')?.classList.add('flex');
      document.getElementById('empty-state')?.classList.add('hidden');
    }
  }
});

// ── Events
document.getElementById('send-btn')?.addEventListener('click', sendMessage);
document.getElementById('msg-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
document.getElementById('chat-search')?.addEventListener('input', e => renderChatList(e.target.value));

// ── Socket initialization
const socket = SocketManager.init();
if (socket) {
  socket.on('newMessage', async (msg) => {
    // If the message is from our active chat user, append it without reload
    if (msg.senderId === activeChatUserId || msg.receiverId === activeChatUserId) {
      const isMe = msg.senderId === currentUser?.id;
      // If it's me, we already appended in sendMessage(), so skip to avoid duplicates.
      if (!isMe) {
        const container = document.getElementById('chat-messages');
        const wrap = document.createElement('div');
        wrap.className = 'flex justify-start bubble-in';
        const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        wrap.innerHTML = `
          <div class="max-w-[75%] sm:max-w-[62%]">
            <div class="bg-white text-gray-800 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 px-4 py-2.5 text-sm leading-relaxed">${escapeHTML(msg.content)}</div>
            <p class="text-[10px] text-gray-400 mt-1 px-1 text-left">${time}</p>
          </div>`;
        container?.appendChild(wrap);
        container && (container.scrollTop = container.scrollHeight);
      }
    }
    
    // Refresh the list to update last message preview and order
    try {
      const { data: fetchedConversations } = await Messages.getConversationsList();
      conversations = fetchedConversations.map(c => ({
        userId: c.user.id,
        name: c.user.name,
        lastMessage: c.lastMessage?.content || ''
      }));
      renderChatList(document.getElementById('chat-search')?.value || '');
    } catch (err) {}
  });
}

function escapeHTML(value) {
  if (!value) return '';
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[character]));
}

// ── Boot: load real conversation partners
(async () => {
  try {
    // Always do a live server check — never trust stale localStorage cache for
    // user identity. A new login may have overwritten the cookie but the old
    // account's name/id may still be sitting in localStorage.
    try {
      const { user } = await Auth.me();
      saveSession(user);
      currentUser = user;
    } catch {
      clearSession();
      window.location.href = '/login.html';
      return;
    }
    if (!currentUser) return;

    try {
      const { data: fetchedConversations } = await Messages.getConversationsList();
      conversations = fetchedConversations.map(c => ({
        userId: c.user.id,
        name: c.user.name,
        lastMessage: c.lastMessage?.content || ''
      }));
    } catch (err) {
      console.error('Failed to load conversations', err);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const chatWith = urlParams.get('userId');
    const chatName = urlParams.get('name');

    if (chatWith && chatName) {
      if (!conversations.find(c => c.userId === chatWith)) {
        conversations.unshift({ userId: chatWith, name: decodeURIComponent(chatName), lastMessage: '' });
      }
      renderChatList();
      selectChat(chatWith, decodeURIComponent(chatName));
    } else {
      renderChatList();
      if (conversations.length > 0) {
        selectChat(conversations[0].userId, conversations[0].name);
      }
    }
  } finally {
    window.hideClientLoader && window.hideClientLoader();
  }
})();