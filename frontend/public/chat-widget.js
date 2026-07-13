(function() {
  // Prevent multiple injections
  if (document.getElementById('leadms-chatbot-root')) return;

  // 1. Get Configuration from the current script tag
  const currentScript = document.currentScript || document.getElementById('leadms-chatbot');
  const API_BASE = currentScript?.dataset.apiUrl || 'http://localhost:5000/api';
  const BRAND_NAME = currentScript?.dataset.brand || 'Dursikshya Assistant';
  const BRAND_COLOR = currentScript?.dataset.color || '#2563eb'; // Default Blue

  // 2. Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    #leadms-chatbot-root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    
    #dsk-chat-widget {
      position: fixed; bottom: 24px; right: 24px; z-index: 999999;
      display: flex; flex-direction: column; align-items: flex-end;
    }
    
    #dsk-chat-panel {
      width: 360px; height: 520px; background: #f9fafb; border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15); display: flex; flex-direction: column;
      overflow: hidden; margin-bottom: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: bottom right;
    }
    #dsk-chat-panel.hidden { transform: scale(0.95); opacity: 0; pointer-events: none; }
    
    #dsk-chat-header {
      background: ${BRAND_COLOR}; padding: 12px 16px; display: flex;
      align-items: center; gap: 12px;
    }
    #dsk-chat-header .avatar {
      width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center; font-size: 20px;
    }
    #dsk-chat-header .info { flex: 1; }
    #dsk-chat-header .info h3 { color: #fff; font-size: 14px; font-weight: 600; }
    #dsk-chat-header .info p { color: rgba(255,255,255,0.7); font-size: 11px; }
    #dsk-close-btn { background: none; border: none; color: rgba(255,255,255,0.7); font-size: 20px; cursor: pointer; padding: 4px; }
    #dsk-close-btn:hover { color: #fff; }
    
    #dsk-messages { flex: 1; overflow-y: auto; padding: 16px; background: #fff;}
    .dsk-msg { display: flex; margin-bottom: 12px; }
    .dsk-msg.bot { justify-content: flex-start; }
    .dsk-msg.user { justify-content: flex-end; }
    .dsk-avatar { width: 28px; height: 28px; border-radius: 50%; background: ${BRAND_COLOR}; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-right: 8px; flex-shrink: 0; }
    .dsk-bubble { max-width: 80%; padding: 10px 14px; border-radius: 16px; font-size: 13px; line-height: 1.5; }
    .dsk-msg.bot .dsk-bubble { background: #f3f4f6; color: #1f2937; border-radius: 4px 16px 16px 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
    .dsk-msg.user .dsk-bubble { background: ${BRAND_COLOR}; color: #fff; border-radius: 16px 4px 16px 16px; }
    
    .dsk-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; }
    .dsk-dot { width: 8px; height: 8px; border-radius: 50%; background: #9ca3af; animation: dsk-bounce 1.2s infinite; }
    .dsk-dot:nth-child(2) { animation-delay: 0.15s; }
    .dsk-dot:nth-child(3) { animation-delay: 0.3s; }
    @keyframes dsk-bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
    
    #dsk-input-area { border-top: 1px solid #e5e7eb; background: #fff; padding: 12px; }
    #dsk-input-row { display: flex; align-items: flex-end; gap: 8px; border: 1px solid #d1d5db; border-radius: 12px; padding: 8px 12px; background: #fff;}
    #dsk-input-row:focus-within { border-color: ${BRAND_COLOR}; box-shadow: 0 0 0 2px rgba(0,0,0,0.05); }
    #dsk-input { flex: 1; border: none; outline: none; font-size: 13px; resize: none; max-height: 80px; font-family: inherit; background: transparent; color:#000; }
    #dsk-send { background: ${BRAND_COLOR}; border: none; border-radius: 8px; width: 32px; height: 32px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: opacity 0.15s; }
    #dsk-send:hover { opacity: 0.9; }
    #dsk-send:disabled { opacity: 0.4; cursor: not-allowed; }
    #dsk-footer { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 6px; }
    
    #dsk-fab {
      width: 56px; height: 56px; border-radius: 50%; background: ${BRAND_COLOR}; border: none;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 24px; box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      transition: transform 0.15s, opacity 0.15s;
      position: relative;
    }
    #dsk-fab:hover { transform: scale(1.08); opacity: 0.9; }
    #dsk-fab:active { transform: scale(0.96); }
    #dsk-notification {
      position: absolute; top: -2px; right: -2px;
      width: 18px; height: 18px; background: #ef4444; border-radius: 50%;
      border: 2px solid #fff; font-size: 9px; color: #fff; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
  `;
  document.head.appendChild(style);

  // 3. Inject HTML
  const root = document.createElement('div');
  root.id = 'leadms-chatbot-root';
  root.innerHTML = `
    <div id="dsk-chat-widget">
      <div id="dsk-chat-panel" class="hidden">
        <div id="dsk-chat-header">
          <div class="avatar">🤖</div>
          <div class="info">
            <h3>${BRAND_NAME}</h3>
            <p>Powered by AI • Always Available</p>
          </div>
          <button id="dsk-close-btn">✕</button>
        </div>
        <div id="dsk-messages"></div>
        <div id="dsk-input-area">
          <div id="dsk-input-row">
            <textarea id="dsk-input" rows="1" placeholder="Type a message..."></textarea>
            <button id="dsk-send" disabled>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p id="dsk-footer">AI responses may not be 100% accurate.</p>
        </div>
      </div>

      <button id="dsk-fab" aria-label="Open chat">
        <span id="dsk-notification">1</span>
        💬
      </button>
    </div>
  `;
  document.body.appendChild(root);

  // 4. State & Logic
  let sessionId = null;
  let isOpen = false;
  let isLoading = false;

  const panel = document.getElementById('dsk-chat-panel');
  const fab = document.getElementById('dsk-fab');
  const notification = document.getElementById('dsk-notification');
  const messages = document.getElementById('dsk-messages');
  const input = document.getElementById('dsk-input');
  const sendBtn = document.getElementById('dsk-send');
  const closeBtn = document.getElementById('dsk-close-btn');

  function appendMessage(role, content) {
    const div = document.createElement('div');
    div.className = `dsk-msg ${role === 'assistant' ? 'bot' : 'user'}`;
    
    const html = role === 'assistant'
      ? `<div class="dsk-avatar">AI</div><div class="dsk-bubble">${content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')}</div>`
      : `<div class="dsk-bubble">${content}</div>`;
    div.innerHTML = html;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'dsk-msg bot'; div.id = 'dsk-typing';
    div.innerHTML = `<div class="dsk-avatar">AI</div><div class="dsk-bubble dsk-typing"><div class="dsk-dot"></div><div class="dsk-dot"></div><div class="dsk-dot"></div></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('dsk-typing');
    if(el) el.remove();
  }

  async function initSession() {
    showTyping();
    try {
      const res = await fetch(`${API_BASE}/chat/session`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_website: BRAND_NAME })
      });
      const data = await res.json();
      sessionId = data.sessionId;
      hideTyping();
      appendMessage('assistant', data.reply);
      sendBtn.disabled = false;
    } catch {
      hideTyping();
      appendMessage('assistant', 'Hello! How can I help you today?');
    }
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isLoading) return;
    
    appendMessage('user', text);
    input.value = ''; input.style.height = 'auto';
    isLoading = true; sendBtn.disabled = true;
    showTyping();

    try {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId, source_website: BRAND_NAME })
      });
      const data = await res.json();
      if (data.sessionId) sessionId = data.sessionId;
      hideTyping();
      appendMessage('assistant', data.reply);
    } catch {
      hideTyping();
      appendMessage('assistant', 'Sorry, something went wrong. Please try again.');
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  fab.addEventListener('click', () => {
    isOpen = !isOpen;
    if(isOpen) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
    notification.style.display = 'none';
    fab.innerHTML = isOpen ? '✕' : '💬';
    if (isOpen && !sessionId) initSession();
    if (isOpen) setTimeout(() => input.focus(), 300);
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false; 
    panel.classList.add('hidden');
    fab.innerHTML = '💬';
  });

  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 80) + 'px';
    if(input.value.trim()) {
      sendBtn.disabled = false;
    } else {
      sendBtn.disabled = true;
    }
  });

})();
