import { useState, useRef, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const MessageBubble = ({ msg }) => {
  const isBot = msg.role === 'assistant';
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}>
      {isBot && (
        <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          AI
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isBot
            ? 'rounded-tl-sm bg-white text-gray-800'
            : 'rounded-tr-sm bg-blue-600 text-white'
        }`}
        // Allow bold markdown rendering (simple approach)
        dangerouslySetInnerHTML={{
          __html: msg.content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>')
        }}
      />
    </div>
  );
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [hasNotification, setHasNotification] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const initializeSession = useCallback(async () => {
    if (sessionId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/chat/session`, { method: 'POST' });
      const data = await res.json();
      setSessionId(data.sessionId);
      setMessages([{ role: 'assistant', content: data.reply }]);
    } catch {
      setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?' }]);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasNotification(false);
    if (!sessionId) initializeSession();
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, sessionId })
      });
      const data = await res.json();
      if (data.sessionId && !sessionId) setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I ran into an issue. Please try again!'
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-9999 flex flex-col items-end">
      {/* Chat Panel */}
      <div
        className={`mb-4 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl bg-gray-50 shadow-2xl transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
        style={{ transformOrigin: 'bottom right' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 bg-blue-600 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <span className="text-lg">🤖</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Dursikshya Assistant</p>
            <p className="text-xs text-blue-100">Powered by AI • Always online</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && loading && (
            <div className="flex justify-start mb-3">
              <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">AI</div>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </div>
            </div>
          )}
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
          {loading && messages.length > 0 && (
            <div className="flex justify-start mb-3">
              <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">AI</div>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-white p-3">
          <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type in English or नेपाली..."
              rows={1}
              className="max-h-24 flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="shrink-0 rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-center text-[10px] text-gray-400">AI may make mistakes. For urgent queries call us directly.</p>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-all hover:bg-blue-700 hover:scale-105 active:scale-95"
        aria-label="Open chat assistant"
      >
        {hasNotification && !isOpen && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">1</span>
        )}
        <span className="text-2xl transition-transform duration-200" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(0deg)' }}>
          {isOpen ? '✕' : '💬'}
        </span>
      </button>
    </div>
  );
}
