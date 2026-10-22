import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X, LoaderCircle, Sparkles } from 'lucide-react';
import { apiRequest } from '../lib/api.js';

const BOTTOM_THRESHOLD = 80;

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState([{
    role: 'assistant',
    text: 'Hi! I’m Riyadvi’s AI assistant. I can help you choose a service, shape your project brief, explore the portfolio, or find the right next step.',
  }]);
  const messagesRef = useRef(null);
  // Only follow new messages while the visitor is already near the bottom.
  // This prevents an incoming AI answer from pulling someone away from older messages.
  const followLatestRef = useRef(true);

  useEffect(() => {
    const onFocus = (e) => {
      if (e.target?.matches?.('input,textarea,select,[contenteditable="true"]') && !e.target.closest?.('.assistant-compose')) {
        setOpen(false);
      }
    };
    document.addEventListener('focusin', onFocus);
    return () => document.removeEventListener('focusin', onFocus);
  }, []);

  useEffect(() => {
    if (!open || !followLatestRef.current) return;
    const container = messagesRef.current;
    if (!container) return;
    // Scroll the chat's own overflow container only; never scroll the page.
    container.scrollTop = container.scrollHeight;
  }, [items, busy, open]);

  function handleMessagesScroll() {
    const container = messagesRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    followLatestRef.current = distanceFromBottom <= BOTTOM_THRESHOLD;
  }

  async function sendText(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    // Keep following only if the user was already near the bottom.
    const container = messagesRef.current;
    if (container) {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      followLatestRef.current = distanceFromBottom <= BOTTOM_THRESHOLD;
    }
    setItems((v) => [...v, { role: 'user', text }]);
    setMessage('');
    setBusy(true);
    try {
      const history = items.slice(-8)
        .filter((item) => item.role === 'user' || item.role === 'assistant')
        .map((item) => ({ role: item.role === 'assistant' ? 'model' : 'user', text: item.text }));
      const result = await apiRequest('/api/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, history }),
      });
      setItems((v) => [...v, {
        role: 'assistant',
        text: result.reply + (result.notice ? `\n\n${result.notice}` : ''),
      }]);
    } catch (error) {
      setItems((v) => [...v, {
        role: 'assistant',
        text: error?.message || 'The assistant could not connect to the AI service. Please try again shortly or use the Contact page.',
      }]);
    } finally {
      setBusy(false);
    }
  }

  async function send(e) {
    e?.preventDefault();
    await sendText(message);
  }

  return (
    <div className="assistant-widget">
      <button className="assistant-launcher" onClick={() => setOpen(!open)} aria-label={open ? 'Close assistant' : 'Open Riyadvi assistant'}>
        {open ? <X /> : <MessageCircle />}<span>{open ? 'Close' : 'Ask Riyadvi'}</span>
      </button>
      {open && (
        <section className="assistant-panel" aria-label="Riyadvi website assistant">
          <header>
            <span className="assistant-avatar"><Sparkles size={16} /></span>
            <div><strong>Riyadvi Assistant</strong><small><i /> Website guide</small></div>
            <button aria-label="Close assistant" onClick={() => setOpen(false)}><X size={17} /></button>
          </header>
          <div className="assistant-quick-prompts">
            {["Which service fits my idea?", "View portfolio", "Plan a website"].map((q) => (
              <button type="button" key={q} onClick={() => sendText(q)}>{q}</button>
            ))}
          </div>
          <div className="assistant-messages" ref={messagesRef} onScroll={handleMessagesScroll}>
            {items.map((item, i) => <div key={i} className={`assistant-message ${item.role}`}>{item.text}</div>)}
            {busy && <div className="assistant-message assistant typing"><LoaderCircle size={14} className="spin" /> Thinking…</div>}
          </div>
          <form onSubmit={send} className="assistant-compose">
            <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask about our services…" maxLength={2000} aria-label="Message to assistant" />
            <button disabled={busy || !message.trim()} aria-label="Send message"><Send size={16} /></button>
          </form>
          <small className="assistant-disclaimer">AI answers can be imperfect. Confirm important details with the team.</small>
        </section>
      )}
    </div>
  );
}
