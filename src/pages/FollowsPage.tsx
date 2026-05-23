// Followers / Following list — opened from a driver profile.
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { Avatar, EmptyState, FullSpinner, TopBar } from '../components/ui';

interface FollowUser {
  id: string;
  name: string;
  city?: string | null;
  profile_photo_url?: string | null;
  user_type?: string;
  driver_profiles?: { driver_level?: string; rating?: number }[];
}

export default function FollowsPage() {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const nav = useNavigate();
  const initialTab = (location.state as { tab?: 'followers' | 'following' } | null)?.tab || 'followers';
  const [tab, setTab] = useState<'followers' | 'following'>(initialTab);
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api
      .get(`/feed/users/${userId}/${tab}`)
      .then((res) => {
        if (!alive) return;
        setUsers(res.data[tab] || []);
      })
      .catch((err) => alive && setError(errorMessage(err)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [userId, tab]);

  return (
    <div className="screen">
      <TopBar title={tab === 'followers' ? 'Followers' : 'Following'} back />

      {/* Tabs */}
      <div
        className="row"
        style={{
          borderBottom: '1px solid var(--light-grey)',
          background: 'var(--white)',
        }}
      >
        {(['followers', 'following'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '13px 0',
              background: 'transparent',
              border: 'none',
              fontWeight: 700,
              fontSize: 14,
              color: tab === t ? 'var(--navy)' : 'var(--grey)',
              borderBottom: tab === t ? '2.5px solid var(--gold)' : '2.5px solid transparent',
              cursor: 'pointer',
            }}
          >
            {t === 'followers' ? 'Followers' : 'Following'}
          </button>
        ))}
      </div>

      <div className="screen-scroll">
        {loading ? (
          <FullSpinner />
        ) : error ? (
          <EmptyState icon="⚠️" title="Couldn't load" text={error} />
        ) : users.length === 0 ? (
          <EmptyState
            icon={tab === 'followers' ? '👥' : '🔍'}
            title={tab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
          />
        ) : (
          <div className="pad">
            {users.map((u) => (
              <div
                key={u.id}
                className="card card-tap row"
                onClick={() => nav(`/driver/${u.id}`)}
              >
                <Avatar src={u.profile_photo_url} name={u.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ gap: 6 }}>
                    <strong style={{ fontSize: 14 }}>{u.name}</strong>
                    {u.driver_profiles?.[0]?.driver_level && (
                      <span className="badge badge-gold" style={{ fontSize: 9 }}>
                        {u.driver_profiles[0].driver_level}
                      </span>
                    )}
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {u.city || 'Ghana'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
