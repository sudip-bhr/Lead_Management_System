import { useState, useRef, useEffect, useCallback } from 'react';
import { BotMessageSquare } from 'lucide-react';
/**
 * EmbeddableChatWidget — A self-contained, configurable AI chatbot widget
 * that communicates with the LEAD MS backend.
 * 
 * Props:
 *   apiUrl      — Base URL for the LEAD MS API (e.g. "https://api.example.com/api")
 *   brandName   — Display name in the chat header (e.g. "Verve Innovation")
 *   primaryColor — Hex color for the theme (e.g. "#F59E0B")
 *   greeting    — Optional custom greeting override
 *   position    — "right" (default) or "left"
 */

// ── Utility: Parse simple markdown bold + newlines ────────────────────────────
function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

// ── Utility: Darken a hex color for hover states ──────────────────────────────
function darkenHex(hex, percent = 15) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(2.55 * percent));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(2.55 * percent));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, primaryColor }) {
  const isBot = msg.role === 'assistant';
  return (
    <div style={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end', marginBottom: '12px' }}>
      {isBot && (
        <div style={{
          marginRight: '8px',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: primaryColor,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 700,
          flexShrink: 0,
        }}>AI</div>
      )}
      <div
        style={{
          maxWidth: '80%',
          padding: '10px 16px',
          borderRadius: isBot ? '2px 16px 16px 16px' : '16px 2px 16px 16px',
          backgroundColor: isBot ? '#ffffff' : primaryColor,
          color: isBot ? '#1f2937' : '#ffffff',
          fontSize: '14px',
          lineHeight: '1.6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          wordBreak: 'break-word',
        }}
        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
      />
    </div>
  );
}

// ── Typing Indicator ──────────────────────────────────────────────────────────
function TypingIndicator({ primaryColor }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
      <div style={{
        marginRight: '8px', width: '28px', height: '28px', borderRadius: '50%',
        backgroundColor: primaryColor, color: '#fff', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0,
      }}>AI</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        borderRadius: '2px 16px 16px 16px', backgroundColor: '#ffffff',
        padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        {[0, 150, 300].map(delay => (
          <span key={delay} style={{
            width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#9ca3af',
            animation: 'embchat-bounce 1.4s infinite ease-in-out',
            animationDelay: `${delay}ms`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Main Widget Component ─────────────────────────────────────────────────────
export default function EmbeddableChatWidget({
  apiUrl = 'http://localhost:4000/api',
  brandName = 'AI Assistant',
  primaryColor = '#2563eb',
  greeting = null,
  position = 'right',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [hasNotification, setHasNotification] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const hoverColor = darkenHex(primaryColor);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // ── Session Init ────────────────────────────────────────────────────────────
  const initializeSession = useCallback(async () => {
    if (sessionId) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/chat/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_website: brandName }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setMessages([{ role: 'assistant', content: greeting || data.reply }]);
    } catch {
      setMessages([{
        role: 'assistant',
        content: greeting || `Hello! 👋 Welcome to ${brandName}. How can I help you today?`,
      }]);
    } finally {
      setLoading(false);
    }
  }, [sessionId, apiUrl, greeting, brandName]);

  // ── Open ────────────────────────────────────────────────────────────────────
  const handleOpen = () => {
    setIsOpen(true);
    setHasNotification(false);
    if (!sessionId) initializeSession();
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  // ── Send Message ────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, sessionId }),
      });
      const data = await res.json();
      if (data.sessionId && !sessionId) setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I ran into an issue. Please try again!',
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // ── Human Escalation ────────────────────────────────────────────────────────
  const requestHuman = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      await fetch(`${apiUrl}/chat/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '🙋 I\'ve notified our team. A counselor will reach out to you shortly. In the meantime, feel free to keep asking questions!',
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Please contact us directly for human assistance.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Position style ──────────────────────────────────────────────────────────
  const positionStyle = position === 'left'
    ? { left: '24px', right: 'auto', alignItems: 'flex-start' }
    : { right: '24px', left: 'auto', alignItems: 'flex-end' };

  return (
    <>
      {/* Keyframe animation for typing dots */}
      <style>{`
        @keyframes embchat-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        @keyframes embchat-fadein {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes embchat-fadeout {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.95) translateY(10px); }
        }
        .embchat-panel-open {
          animation: embchat-fadein 0.25s ease-out forwards;
        }
        .embchat-panel-close {
          animation: embchat-fadeout 0.2s ease-in forwards;
          pointer-events: none;
        }
        .embchat-textarea:focus { outline: none; }
        .embchat-textarea::placeholder { color: #9ca3af; }
        .embchat-scrollbar::-webkit-scrollbar { width: 4px; }
        .embchat-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .embchat-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
      `}</style>

      <div style={{
        position: 'fixed',
        bottom: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        ...positionStyle,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}>
        {/* ── Chat Panel ──────────────────────────────────────────────────── */}
        {isOpen && (
          <div
            className={`embchat-panel-open`}
            style={{
              marginBottom: '16px',
              width: '380px',
              maxWidth: 'calc(100vw - 48px)',
              height: '540px',
              maxHeight: 'calc(100vh - 120px)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: '#f3f4f6',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
              transformOrigin: position === 'left' ? 'bottom left' : 'bottom right',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              background: `linear-gradient(135deg, ${primaryColor}, ${hoverColor})`,
              color: '#fff',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '18px',
              }}>🤖</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{brandName}</div>
                <div style={{ fontSize: '11px', opacity: 0.85 }}>Powered by AI • Always online</div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: '#fff',
                  fontSize: '16px', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
                aria-label="Close chat"
              >✕</button>
            </div>

            {/* Messages Area */}
            <div className="embchat-scrollbar" style={{
              flex: 1, overflowY: 'auto', padding: '16px',
            }}>
              {messages.length === 0 && loading && <TypingIndicator primaryColor={primaryColor} />}
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} primaryColor={primaryColor} />
              ))}
              {loading && messages.length > 0 && <TypingIndicator primaryColor={primaryColor} />}
              <div ref={messagesEndRef} />
            </div>

            {/* Human Escalation Button */}
            {messages.length > 2 && (
              <div style={{ padding: '0 16px 4px', textAlign: 'center' }}>
                <button
                  onClick={requestHuman}
                  disabled={loading}
                  style={{
                    background: 'none', border: 'none', color: primaryColor,
                    fontSize: '12px', cursor: 'pointer', textDecoration: 'underline',
                    opacity: loading ? 0.5 : 1,
                  }}
                >🙋 Talk to a human</button>
              </div>
            )}

            {/* Input Area */}
            <div style={{
              borderTop: '1px solid #e5e7eb', backgroundColor: '#fff', padding: '12px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: '8px',
                borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb',
                padding: '8px 12px', transition: 'border-color 0.2s',
              }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  className="embchat-textarea"
                  style={{
                    flex: 1, resize: 'none', border: 'none', backgroundColor: 'transparent',
                    fontSize: '14px', color: '#1f2937', maxHeight: '96px',
                    fontFamily: 'inherit', lineHeight: '1.5',
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  style={{
                    flexShrink: 0, width: '36px', height: '36px', borderRadius: '10px',
                    backgroundColor: !input.trim() || loading ? '#d1d5db' : primaryColor,
                    border: 'none', color: '#fff', cursor: !input.trim() || loading ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background-color 0.2s',
                  }}
                  aria-label="Send message"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                </button>
              </div>
              <div style={{ marginTop: '4px', textAlign: 'center', fontSize: '10px', color: '#9ca3af' }}>
                AI may make mistakes. For urgent queries contact us directly.
              </div>
            </div>
          </div>
        )}

        {/* ── Floating Action Button ──────────────────────────────────────── */}
        <button
          onClick={isOpen ? () => setIsOpen(false) : handleOpen}
          style={{
            width: '56px', height: '56px', borderRadius: '50%',
            backgroundColor: primaryColor, border: 'none', color: '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s, background-color 0.2s',
            position: 'relative',
          }}
          onMouseEnter={e => { e.target.style.transform = 'scale(1.08)'; e.target.style.backgroundColor = hoverColor; }}
          onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.backgroundColor = primaryColor; }}
          aria-label="Open chat assistant"
        >
          {hasNotification && !isOpen && (
            <span style={{
              position: 'absolute', top: '-2px', right: '-2px',
              width: '16px', height: '16px', borderRadius: '50%',
              backgroundColor: '#ef4444', fontSize: '9px', fontWeight: 700,
              color: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', border: '2px solid #fff',
            }}>1</span>
          )}
          {isOpen ? '✕' : <BotMessageSquare/>}
        </button>
      </div>
    </>
  );
}
