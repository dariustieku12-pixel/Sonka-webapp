import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { timeAgo } from '../lib/format';
import type { AppNotification } from '../lib/types';
import { EmptyState, FullSpinner, TopBar } from '../components/ui';

export default function NotificationsPage() {
  const nav = useNavigate();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api
      .get('/notifications/history')
      .then((res) => alive && setItems(res.data.notifications || []))
      .catch((err) => alive && setError(errorMessage(err)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  function open(n: AppNotification) {
    if (!n.read) {
      api.put(`/notifications/history/${n.id}/read`).catch(() => {});
      setItems((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
    const bookingId = n.data?.booking_id as string | undefined;
    if (bookingId) nav(`/bookings/${bookingId}`);
  }

  return (
    <div className="screen">
      <TopBar title="Notifications" back />
      <div className="screen-scroll">
        {loading ? (
          <FullSpinner label="Loading…" />
        ) : error ? (
          <EmptyState icon="⚠️" title="Couldn't load notifications" text={error} />
        ) : items.length === 0 ? (
          <EmptyState icon="🔔" title="No notifications yet" text="Updates about your trips show up here." />
        ) : (
          <div className="pad">
            {items.map((n) => (
              <div
                key={n.id}
                className="card card-tap"
                onClick={() => open(n)}
                style={{
                  background: n.read ? 'var(--white)' : 'rgba(245,168,0,0.08)',
                  borderLeft: n.read ? 'none' : '3px solid var(--gold)',
                }}
              >
                <div className="row-between">
                  <strong style={{ fontSize: 14 }}>{n.title}</strong>
                  <span className="muted" style={{ fontSize: 11 }}>
                    {timeAgo(n.created_at)}
                  </span>
                </div>
                <p style={{ fontSize: 13, marginTop: 2 }}>{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
