const conversations = [
  {
    id: 'sarah',
    name: 'Sarah Williams',
    role: 'Project Lead @ DesignHaus',
    status: 'Online Now',
    online: true,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    preview: 'The project scope looks great...',
    time: '10:45 AM',
    unread: true,
    messages: [
      {
        date: 'YESTERDAY',
        from: 'them',
        text: "Hi Alexander! I've had a chance to review the strategy deck you sent over. The market segmentation piece is particularly strong.",
        time: '11:20 AM'
      },
      {
        from: 'me',
        text: 'Thanks, Sarah! Glad to hear the segmentation resonated. I wanted to make sure we highlighted those untapped niches.',
        time: '11:45 AM'
      },
      {
        from: 'them',
        text: 'Exactly. My team was wondering if we could expand on the "Tech-Enabled Artisan" segment. Do you think we could have that ready by the Monday kick-off?',
        time: '12:02 PM',
        attachment: {
          name: 'Updated_Brief.pdf',
          size: '1.2 MB'
        }
      },
      {
        date: 'TODAY',
        from: 'them',
        text: "The project scope looks great. Let's start Monday?",
        time: '10:45 AM'
      }
    ]
  },
  {
    id: 'james',
    name: 'James D.',
    role: 'Marketing Director',
    status: 'Offline',
    online: false,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    preview: "I've attached the final logo files in ...",
    time: 'Yesterday',
    unread: false,
    messages: [
      {
        date: 'YESTERDAY',
        from: 'them',
        text: "I've attached the final logo files in the shared project folder. Let me know if the export format works.",
        time: '4:18 PM'
      }
    ]
  },
  {
    id: 'lila',
    name: 'Lila Lowndes',
    role: 'Founder @ CraftNote',
    status: 'Online Now',
    online: true,
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    preview: 'Can we jump on a quick call about...',
    time: 'Oct 12',
    unread: false,
    messages: [
      {
        date: 'OCT 12',
        from: 'them',
        text: 'Can we jump on a quick call about the homepage wireframe? I have a few notes from the team.',
        time: '9:05 AM'
      }
    ]
  },
  {
    id: 'marcus',
    name: 'Marcus Chen',
    role: 'Product Owner',
    status: 'Offline',
    online: false,
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    preview: 'Payment received. Thank you...',
    time: 'Oct 11',
    unread: true,
    messages: [
      {
        date: 'OCT 11',
        from: 'them',
        text: 'Payment received. Thank you for the quick turnaround on the final dashboard screens.',
        time: '2:25 PM'
      }
    ]
  },
  {
    id: 'elena',
    name: 'Elena Burke',
    role: 'Operations Lead',
    status: 'Offline',
    online: false,
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    preview: 'Sent the briefing document over e...',
    time: 'Oct 10',
    unread: false,
    messages: [
      {
        date: 'OCT 10',
        from: 'them',
        text: 'Sent the briefing document over email. The new timeline should be much easier to review.',
        time: '1:12 PM'
      }
    ]
  }
];

let activeConversationId = 'sarah';

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[character]));
}

function getActiveConversation() {
  return conversations.find(conversation => conversation.id === activeConversationId) || conversations[0];
}

function renderConversationList(filter = '') {
  const list = document.getElementById('conversationList');
  const query = filter.trim().toLowerCase();
  const filtered = conversations.filter(conversation => [
    conversation.name,
    conversation.role,
    conversation.preview
  ].join(' ').toLowerCase().includes(query));

  list.innerHTML = filtered.map(conversation => `
    <button type="button" class="message-chat-item ${conversation.id === activeConversationId ? 'active' : ''}" data-conversation-id="${conversation.id}">
      <span class="message-chat-avatar">
        <img src="${conversation.avatar}" alt="${escapeHTML(conversation.name)}" />
        ${conversation.online ? '<span></span>' : ''}
      </span>
      <span class="message-chat-copy">
        <span class="message-chat-row">
          <strong>${escapeHTML(conversation.name)}</strong>
          <small>${escapeHTML(conversation.time)}</small>
        </span>
        <span>${escapeHTML(conversation.preview)}</span>
      </span>
      ${conversation.unread ? '<span class="message-unread-dot" aria-label="Unread message"></span>' : ''}
    </button>
  `).join('');

  if (filtered.length === 0) {
    list.innerHTML = '<p class="messages-empty">No conversations found.</p>';
  }
}

function renderHeader(conversation) {
  document.getElementById('chatHeaderAvatar').src = conversation.avatar;
  document.getElementById('chatHeaderAvatar').alt = conversation.name;
  document.getElementById('chatHeaderStatusDot').classList.toggle('offline', !conversation.online);
  document.getElementById('chatHeaderName').textContent = conversation.name;
  document.getElementById('chatHeaderMeta').innerHTML = `
    <span class="${conversation.online ? 'online' : ''}">${escapeHTML(conversation.status)}</span>
    <span>-</span>
    <span>${escapeHTML(conversation.role)}</span>
  `;
}

function renderMessages(conversation) {
  const thread = document.getElementById('messageThread');

  thread.innerHTML = conversation.messages.map(message => {
    const dateLabel = message.date
      ? `<div class="messages-date-label"><span>${escapeHTML(message.date)}</span></div>`
      : '';
    const isMe = message.from === 'me';
    const attachment = message.attachment
      ? `
        <div class="message-attachment">
          <span><i data-lucide="file-text" class="w-5 h-5"></i></span>
          <div>
            <strong>${escapeHTML(message.attachment.name)}</strong>
            <small>${escapeHTML(message.attachment.size)}</small>
          </div>
          <button type="button" aria-label="Download attachment"><i data-lucide="download" class="w-4 h-4"></i></button>
        </div>
      `
      : '';

    return `
      ${dateLabel}
      <div class="message-row ${isMe ? 'from-me' : 'from-them'}">
        ${isMe ? '' : `<img src="${conversation.avatar}" alt="${escapeHTML(conversation.name)}" />`}
        <div>
          <div class="message-bubble">${escapeHTML(message.text)}</div>
          ${attachment}
          <time>${escapeHTML(message.time)}</time>
        </div>
      </div>
    `;
  }).join('');

  thread.scrollTop = thread.scrollHeight;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function selectConversation(id, openChat) {
  activeConversationId = id;
  const conversation = getActiveConversation();
  conversation.unread = false;
  renderConversationList(document.getElementById('conversationSearch').value);
  renderHeader(conversation);
  renderMessages(conversation);

  if (openChat) {
    document.querySelector('.messages-app').classList.add('show-chat');
  }
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text) return;

  const conversation = getActiveConversation();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  conversation.messages.push({ from: 'me', text, time });
  conversation.preview = text.length > 36 ? `${text.slice(0, 36)}...` : text;
  conversation.time = 'Now';
  input.value = '';

  renderConversationList(document.getElementById('conversationSearch').value);
  renderMessages(conversation);
}

function wireMessages() {
  const search = document.getElementById('conversationSearch');
  const composer = document.getElementById('messageComposer');
  const app = document.querySelector('.messages-app');

  renderConversationList();
  selectConversation(activeConversationId, false);

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
    sendMessage();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  window.initializeFreelancerLayout({
    activeNav: 'messages'
  }).then(function () {
    wireMessages();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
});
