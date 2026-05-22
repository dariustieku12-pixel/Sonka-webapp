import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { timeAgo } from '../lib/format';
import type { Conversation } from '../lib/types';
import { Avatar, EmptyState, FullSpinner, TabBar, TopBar } from '../components/ui';

export default function MessagesPage() {
  const nav = useNavigate();
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api
      .get('/chat/conversations')
      .then((res) => alive && setConvos(res.data.conversations || []))
      .catch((err) => alive && setError(errorMessage(err)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="screen">
      <TopBar title="Messages" />
      <div className="screen-scroll">
        {loading ? (
          <FullSpinner label="Loading messages…" />
        ) : error ? (
          <EmptyState icon="⚠️" title="Couldn't load messages" text={error} />
        ) : convos.length === 0 ? (
          <EmptyState
            icon="💬"
            title="No conversations yet"
            text="Message a driver from their profile to start chatting."
          />
        ) : (
          <div className="pad">
            {convos.map((c) => (
              <div
                key={c.id}
                className="card card-tap row"
                onClick={() =>
                  nav(`/chat/${c.id}`, {
                    state: { name: c.other_user.name, photo: c.other_user.profile_photo_url },
                  })
                }
              >
                <Avatar src={c.other_user.profile_photo_url} name={c.other_user.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-between">
                    <strong style={{ fontSize: 14 }}>{c.other_user.name}</strong>
                    <span className="muted" style={{ fontSize: 11 }}>
                      {timeAgo(c.last_message_at)}
                    </span>
                  </div>
                  <div
                    className="muted"
                    style={{
                      fontSize: 13,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: c.unread > 0 ? 700 : 400,
                      color: c.unread > 0 ? 'var(--dark-grey)' : 'var(--grey)',
                    }}
                  >
                    {c.last_message || 'No messages yet'}
                  </div>
                </div>
                {c.unread > 0 && (
                  <span
                    className="badge badge-gold"
                    style={{ borderRadius: '50%', minWidth: 22, textAlign: 'center' }}
                  >
                    {c.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <TabBar />
    </div>
  );
}
