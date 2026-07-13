(function() {
  // Prevent multiple injections
  if (document.getElementById('leadms-chatbot-root')) return;

  // 1. Get Configuration from the current script tag
  const currentScript = document.currentScript || document.getElementById('leadms-chatbot');
  const API_BASE    = currentScript?.dataset.apiUrl  || 'http://localhost:5000/api';
  const BRAND_NAME  = currentScript?.dataset.brand   || 'Dursikshya Assistant';
  const BRAND_COLOR = currentScript?.dataset.color   || '#2563eb';

  // ── 2. Inject CSS (style element — not affected by script-src CSP) ──────────
  const style = document.createElement('style');
  style.textContent = [
    '* { box-sizing: border-box; margin: 0; padding: 0; }',
    '#leadms-chatbot-root { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }',
    '#dsk-chat-widget { position: fixed; bottom: 24px; right: 24px; z-index: 999999; display: flex; flex-direction: column; align-items: flex-end; }',
    '#dsk-chat-panel { width: 360px; height: 520px; background: #f9fafb; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; margin-bottom: 12px; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); transform-origin: bottom right; }',
    '#dsk-chat-panel.hidden { transform: scale(0.95); opacity: 0; pointer-events: none; }',
    '#dsk-chat-header { padding: 12px 16px; display: flex; align-items: center; gap: 12px; background: var(--dsk-brand); }',
    '#dsk-chat-header .avatar { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 20px; }',
    '#dsk-chat-header .info { flex: 1; }',
    '#dsk-chat-header .info h3 { color: #fff; font-size: 14px; font-weight: 600; }',
    '#dsk-chat-header .info p { color: rgba(255,255,255,0.7); font-size: 11px; }',
    '#dsk-close-btn { background: none; border: none; color: rgba(255,255,255,0.7); font-size: 20px; cursor: pointer; padding: 4px; }',
    '#dsk-close-btn:hover { color: #fff; }',
    '#dsk-messages { flex: 1; overflow-y: auto; padding: 16px; background: #fff; }',
    '.dsk-msg { display: flex; margin-bottom: 12px; }',
    '.dsk-msg.bot { justify-content: flex-start; }',
    '.dsk-msg.user { justify-content: flex-end; }',
    '.dsk-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--dsk-brand); color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-right: 8px; flex-shrink: 0; }',
    '.dsk-bubble { max-width: 80%; padding: 10px 14px; border-radius: 16px; font-size: 13px; line-height: 1.5; }',
    '.dsk-msg.bot .dsk-bubble { background: #f3f4f6; color: #1f2937; border-radius: 4px 16px 16px 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }',
    '.dsk-msg.user .dsk-bubble { background: var(--dsk-brand); color: #fff; border-radius: 16px 4px 16px 16px; }',
    '.dsk-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; }',
    '.dsk-dot { width: 8px; height: 8px; border-radius: 50%; background: #9ca3af; animation: dsk-bounce 1.2s infinite; }',
    '.dsk-dot:nth-child(2) { animation-delay: 0.15s; }',
    '.dsk-dot:nth-child(3) { animation-delay: 0.3s; }',
    '@keyframes dsk-bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }',
    '#dsk-input-area { border-top: 1px solid #e5e7eb; background: #fff; padding: 12px; }',
    '#dsk-input-row { display: flex; align-items: flex-end; gap: 8px; border: 1px solid #d1d5db; border-radius: 12px; padding: 8px 12px; background: #fff; }',
    '#dsk-input-row:focus-within { border-color: var(--dsk-brand); box-shadow: 0 0 0 2px rgba(0,0,0,0.05); }',
    '#dsk-input { flex: 1; border: none; outline: none; font-size: 13px; resize: none; max-height: 80px; font-family: inherit; background: transparent; color: #000; }',
    '#dsk-send { background: var(--dsk-brand); border: none; border-radius: 8px; width: 32px; height: 32px; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: opacity 0.15s; }',
    '#dsk-send:hover { opacity: 0.9; }',
    '#dsk-send:disabled { opacity: 0.4; cursor: not-allowed; }',
    '#dsk-footer { text-align: center; font-size: 10px; color: #9ca3af; margin-top: 6px; }',
    '#dsk-fab { width: 56px; height: 56px; border-radius: 50%; background: var(--dsk-brand); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 14px rgba(0,0,0,0.15); transition: transform 0.15s, opacity 0.15s; position: relative; }',
    '#dsk-fab:hover { transform: scale(1.08); opacity: 0.9; }',
    '#dsk-fab:active { transform: scale(0.96); }',
    '#dsk-notification { position: absolute; top: -2px; right: -2px; width: 18px; height: 18px; background: #ef4444; border-radius: 50%; border: 2px solid #fff; font-size: 9px; color: #fff; font-weight: 700; display: flex; align-items: center; justify-content: center; }'
  ].join('\n');
  document.head.appendChild(style);

  // ── 3. Build DOM without innerHTML (CSP-safe) ────────────────────────────────

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'className') node.className = v;
      else if (k === 'textContent') node.textContent = v;
      else node.setAttribute(k, v);
    });
    (children || []).forEach(c => c && node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return node;
  }

  // Send icon SVG (safe - no innerHTML)
  const sendSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  sendSvg.setAttribute('width', '16'); sendSvg.setAttribute('height', '16');
  sendSvg.setAttribute('viewBox', '0 0 24 24'); sendSvg.setAttribute('fill', 'none');
  sendSvg.setAttribute('stroke', 'currentColor'); sendSvg.setAttribute('stroke-width', '2.5');
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  ['x1','y1','x2','y2'].forEach((a,i) => line.setAttribute(a, ['22','2','11','13'][i]));
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  poly.setAttribute('points', '22 2 15 22 11 13 2 9 22 2');
  sendSvg.appendChild(line); sendSvg.appendChild(poly);

  const inputEl  = el('textarea', { id: 'dsk-input', rows: '1', placeholder: 'Type a message...' });
  const sendBtn  = el('button',   { id: 'dsk-send', disabled: '' }, [sendSvg]);
  const messagesEl = el('div',    { id: 'dsk-messages' });
  const closeBtn = el('button',   { id: 'dsk-close-btn', textContent: '✕' });
  const fabEl    = el('button',   { id: 'dsk-fab', 'aria-label': 'Open chat' });
  const notifEl  = el('span',     { id: 'dsk-notification', textContent: '1' });
  fabEl.appendChild(notifEl);
  fabEl.appendChild(document.createTextNode('💬'));

  const header = el('div', { id: 'dsk-chat-header' }, [
    el('div', { className: 'avatar' }, [document.createTextNode('🤖')]),
    el('div', { className: 'info' }, [
      el('h3', { textContent: BRAND_NAME }),
      el('p',  { textContent: 'Powered by AI • Always Available' })
    ]),
    closeBtn
  ]);

  const panel = el('div', { id: 'dsk-chat-panel', className: 'hidden' }, [
    header,
    messagesEl,
    el('div', { id: 'dsk-input-area' }, [
      el('div', { id: 'dsk-input-row' }, [inputEl, sendBtn]),
      el('p',   { id: 'dsk-footer', textContent: 'AI responses may not be 100% accurate.' })
    ])
  ]);

  const widget = el('div', { id: 'dsk-chat-widget' }, [panel, fabEl]);
  const root   = el('div', { id: 'leadms-chatbot-root' });
  root.appendChild(widget);

  // Set brand color via CSS custom property (avoids inline styles)
  root.style.setProperty('--dsk-brand', BRAND_COLOR);
  document.body.appendChild(root);

  // ── 4. State & Logic ─────────────────────────────────────────────────────────

  let sessionId = null;
  let isOpen    = false;
  let isLoading = false;

  function appendMessage(role, content) {
    const isBot = role === 'assistant';
    const wrap  = el('div', { className: 'dsk-msg ' + (isBot ? 'bot' : 'user') });

    if (isBot) {
      wrap.appendChild(el('div', { className: 'dsk-avatar', textContent: 'AI' }));
    }

    const bubble = el('div', { className: 'dsk-bubble' });
    // Safely render **bold** and newlines without innerHTML or eval
    content.split(/(\*\*.*?\*\*|\n)/g).forEach(part => {
      if (part.startsWith('**') && part.endsWith('**')) {
        bubble.appendChild(el('strong', { textContent: part.slice(2, -2) }));
      } else if (part === '\n') {
        bubble.appendChild(document.createElement('br'));
      } else if (part) {
        bubble.appendChild(document.createTextNode(part));
      }
    });

    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap;
  }

  function showTyping() {
    const wrap = el('div', { className: 'dsk-msg bot', id: 'dsk-typing' }, [
      el('div', { className: 'dsk-avatar', textContent: 'AI' }),
      el('div', { className: 'dsk-bubble dsk-typing' }, [
        el('div', { className: 'dsk-dot' }),
        el('div', { className: 'dsk-dot' }),
        el('div', { className: 'dsk-dot' })
      ])
    ]);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('dsk-typing');
    if (t) t.remove();
  }

  async function initSession() {
    showTyping();
    try {
      const res  = await fetch(API_BASE + '/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_website: BRAND_NAME })
      });
      const data = await res.json();
      sessionId  = data.sessionId;
      hideTyping();
      appendMessage('assistant', data.reply);
      sendBtn.disabled = false;
    } catch {
      hideTyping();
      appendMessage('assistant', 'Hello! How can I help you today?');
    }
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isLoading) return;

    appendMessage('user', text);
    inputEl.value = '';
    inputEl.style.height = 'auto';
    isLoading = true;
    sendBtn.disabled = true;
    showTyping();

    try {
      const res  = await fetch(API_BASE + '/chat/message', {
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
      inputEl.focus();
    }
  }

  fabEl.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('hidden', !isOpen);
    notifEl.style.display = 'none';
    fabEl.lastChild.textContent = isOpen ? '✕' : '💬';
    if (isOpen && !sessionId) initSession();
    if (isOpen) setTimeout(() => inputEl.focus(), 300);
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    panel.classList.add('hidden');
    fabEl.lastChild.textContent = '💬';
  });

  sendBtn.addEventListener('click', sendMessage);

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + 'px';
    sendBtn.disabled = !inputEl.value.trim();
  });

})();
