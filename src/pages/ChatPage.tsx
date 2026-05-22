import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Message } from '../lib/types';
import { FullSpinner, TopBar } from '../components/ui';
import { useToast } from '../components/Toast';

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const otherName = (location.state as { name?: string } | null)?.name || 'Chat';

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/chat/conversations/${conversationId}/messages`, {
        params: { limit: 80 },
      });
      setMessages(res.data.messages || []);
    } catch {
      /* keep previous */
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 5000);
    return () => window.clearInterval(t);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setDraft('');
    try {
      const res = await api.post(`/chat/conversations/${conversationId}/messages`, { content: text });
      setMessages((m) => [...m, res.data.message]);
    } catch (err) {
      setDraft(text);
      toast(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="screen">
      <TopBar title={otherName} back />
      {loading ? (
        <FullSpinner label="Loading chat…" />
      ) : (
        <div className="screen-scroll pad" style={{ background: 'var(--off-white)' }}>
          {messages.length === 0 && (
            <p className="muted" style={{ textAlign: 'center', marginTop: 20 }}>
              No messages yet. Say hello 👋
            </p>
          )}
          {messages.map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div
                key={m.id}
                style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 6 }}
              >
                <div
                  style={{
                    maxWidth: '78%',
                    padding: '9px 13px',
                    borderRadius: 14,
                    borderBottomRightRadius: mine ? 3 : 14,
                    borderBottomLeftRadius: mine ? 14 : 3,
                    background: mine ? 'var(--gold)' : 'var(--white)',
                    color: mine ? 'var(--navy)' : 'var(--dark-grey)',
                    fontSize: 14,
                    boxShadow: 'var(--shadow)',
                  }}
                >
                  {m.media_url && (
                    <img src={m.media_url} alt="" style={{ width: '100%', borderRadius: 8, marginBottom: 4 }} />
                  )}
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Composer */}
      <div
        className="row"
        style={{ gap: 8, padding: 10, background: 'var(--white)', borderTop: '1px solid var(--light-grey)' }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a message…"
          style={{ flex: 1, padding: '11px 14px', border: '1.5px solid var(--light-grey)', borderRadius: 22 }}
        />
        <button className="btn btn-primary btn-sm" disabled={!draft.trim() || sending} onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}
