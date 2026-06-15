let conversations = [];
let activeConversationId = null;
let currentUser = null;

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

function getActiveConversation() {
  return conversations.find(c => c.user.id === activeConversationId) || conversations[0];
}

function renderConversationList(filter = '') {
  const list = document.getElementById('conversationList');
  const query = filter.trim().toLowerCase();
  
  const filtered = conversations.filter(c => {
    return c.user.name.toLowerCase().includes(query) || (c.lastMessage?.content || '').toLowerCase().includes(query);
  });

  list.innerHTML = filtered.map(c => {
    const isActive = c.user.id === activeConversationId ? 'active' : '';
    const avatar = c.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user.name)}&background=random`;
    const preview = c.lastMessage?.content || 'No messages yet';
    const time = c.lastMessage ? new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    
    return `
      <button type="button" class="message-chat-item ${isActive}" data-conversation-id="${c.user.id}">
        <span class="message-chat-avatar">
          <img src="${avatar}" alt="${escapeHTML(c.user.name)}" />
        </span>
        <span class="message-chat-copy">
          <span class="message-chat-row">
            <strong>${escapeHTML(c.user.name)}</strong>
            <small>${escapeHTML(time)}</small>
          </span>
          <span>${escapeHTML(preview)}</span>
        </span>
      </button>
    `;
  }).join('');

  if (filtered.length === 0) {
    list.innerHTML = '<p class="messages-empty">No conversations found.</p>';
  }
}

function renderHeader(conversation) {
  if (!conversation) return;
  const avatar = conversation.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.user.name)}&background=random`;
  document.getElementById('chatHeaderAvatar').src = avatar;
  document.getElementById('chatHeaderAvatar').alt = conversation.user.name;
  document.getElementById('chatHeaderName').textContent = conversation.user.name;
  document.getElementById('chatHeaderMeta').innerHTML = `
    <span>${escapeHTML(conversation.user.role)}</span>
  `;
}

async function renderMessages(userId) {
  const thread = document.getElementById('messageThread');
  try {
    const data = await Messages.getConversation(userId);
    const msgs = data.data || [];
    
    thread.innerHTML = msgs.map(message => {
      const isMe = message.senderId === currentUser.id;
      const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      return `
        <div class="message-row ${isMe ? 'from-me' : 'from-them'}">
          <div>
            <div class="message-bubble">${escapeHTML(message.content)}</div>
            <time>${escapeHTML(time)}</time>
          </div>
        </div>
      `;
    }).join('');
    
    thread.scrollTop = thread.scrollHeight;
  } catch (err) {
    console.error('Failed to load messages', err);
  }
}

async function selectConversation(id, openChat) {
  activeConversationId = id;
  const conversation = getActiveConversation();
  if (!conversation) return;
  
  renderConversationList(document.getElementById('conversationSearch').value);
  renderHeader(conversation);
  await renderMessages(id);

  if (openChat) {
    document.querySelector('.messages-app').classList.add('show-chat');
  }
}

async function handleSendMessage() {
  const input = document.getElementById('messageInput');
  const content = input.value.trim();
  if (!content || !activeConversationId) return;

  input.value = '';

  try {
    const { data: message } = await Messages.send({ receiverId: activeConversationId, content });
    // Optimistically append to thread — no full conversation refetch needed
    const thread = document.getElementById('messageThread');
    const time = new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.className = 'message-row from-me';
    div.innerHTML = `<div><div class="message-bubble">${escapeHTML(content)}</div><time>${escapeHTML(time)}</time></div>`;
    thread.appendChild(div);
    thread.scrollTop = thread.scrollHeight;

    // Update conversation preview in-memory without a server call
    const conv = conversations.find(c => c.user.id === activeConversationId);
    if (conv) {
      conv.lastMessage = { content, createdAt: new Date().toISOString() };
      renderConversationList(document.getElementById('conversationSearch').value);
    }
  } catch (err) {
    console.error('Failed to send message', err);
  }
}

async function loadConversations(initialLoad = false) {
  try {
    const data = await Messages.getConversationsList();
    conversations = data.data || [];
    
    if (initialLoad) {
      const urlParams = new URLSearchParams(window.location.search);
      const chatWith = urlParams.get('userId');
      const chatName = urlParams.get('name');

      if (chatWith && chatName) {
        if (!conversations.find(c => c.user.id === chatWith)) {
          conversations.unshift({ 
            user: { id: chatWith, name: decodeURIComponent(chatName), role: 'CLIENT' },
            lastMessage: null
          });
        }
        activeConversationId = chatWith;
      }
    }

    if (conversations.length > 0 && !activeConversationId) {
      activeConversationId = conversations[0].user.id;
    }
    
    renderConversationList();
    
    if (activeConversationId && initialLoad) {
      const conv = getActiveConversation();
      renderHeader(conv);
      await renderMessages(activeConversationId);
      
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('userId') && window.innerWidth < 1024) {
        document.querySelector('.messages-app').classList.add('show-chat');
      }
    } else if (activeConversationId) {
      // Just re-render header and list but don't force messages fetch unless needed
      const conv = getActiveConversation();
      renderHeader(conv);
    }
  } catch (err) {
    console.error('Failed to load conversations', err);
  }
}

function wireMessages() {
  const search = document.getElementById('conversationSearch');
  const composer = document.getElementById('messageComposer');
  const app = document.querySelector('.messages-app');

  search.addEventListener('input', event => renderConversationList(event.target.value));

  document.getElementById('conversationList').addEventListener('click', event => {
    const button = event.target.closest('[data-conversation-id]');
    if (!button) return;
    selectConversation(button.dataset.conversationId, true);
  });

  document.getElementById('backToConversations').addEventListener('click', () => {
    app.classList.remove('show-chat');
  });

  composer.addEventListener('submit', event => {
    event.preventDefault();
    handleSendMessage();
  });

  const socket = SocketManager.init();
  if (socket) {
    socket.on('newMessage', (msg) => {
      if (activeConversationId === msg.senderId || activeConversationId === msg.receiverId) {
        // Append incoming message to active thread without a full conversations refetch
        renderMessages(activeConversationId);
      } else {
        // Update the preview for the other conversation in-memory
        const senderId = msg.senderId;
        const conv = conversations.find(c => c.user.id === senderId);
        if (conv) {
          conv.lastMessage = { content: msg.content, createdAt: msg.createdAt };
          renderConversationList(document.getElementById('conversationSearch').value);
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  currentUser = await requireAuth();
  if (!currentUser) return;
  
  await window.initializeFreelancerLayout({
    activeNav: 'messages'
  });

  wireMessages();
  await loadConversations(true);

  if (window.lucide) {
    window.lucide.createIcons();
  }
});
