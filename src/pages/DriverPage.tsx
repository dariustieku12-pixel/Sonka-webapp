import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { vehicleEmoji, vehicleLabel, DRIVER_LEVEL_COLORS } from '../lib/constants';
import { timeAgo } from '../lib/format';
import type { Review } from '../lib/types';
import { Avatar, EmptyState, FullSpinner, Stars, TopBar } from '../components/ui';
import { useToast } from '../components/Toast';

interface DriverProfile {
  vehicle_type?: string | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_colour?: string | null;
  plate_number?: string | null;
  capacity_kg?: number | null;
  rating?: number;
  total_trips?: number;
  driver_level?: string | null;
  subscription_status?: string | null;
}

interface DriverDetail {
  id: string;
  name: string;
  phone: string;
  city?: string | null;
  profile_photo_url?: string | null;
  bio?: string | null;
  driver_profiles: DriverProfile[];
  location?: { status?: string; last_seen?: string } | null;
  active_status?: { content?: string; created_at?: string } | null;
  recent_reviews: Review[];
}

export default function DriverPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const toast = useToast();
  const [driver, setDriver] = useState<DriverDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .get(`/search/drivers/${id}`)
      .then((res) => {
        if (alive) setDriver(res.data.driver);
      })
      .catch((err) => {
        if (alive) setError(errorMessage(err, 'Driver not found.'));
      })
      .finally(() => alive && setLoading(false));
    api
      .get(`/feed/users/${id}/follow-stats`)
      .then((res) => {
        if (!alive) return;
        setFollowing(!!res.data.is_following);
        setFollowers(res.data.follower_count || 0);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id]);

  async function toggleFollow() {
    const next = !following;
    setFollowing(next);
    setFollowers((n) => n + (next ? 1 : -1));
    try {
      await api.post(`/feed/follow/${id}`);
    } catch (err) {
      setFollowing(!next);
      setFollowers((n) => n + (next ? -1 : 1));
      toast(errorMessage(err));
    }
  }

  async function startChat() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await api.post('/chat/conversations', { other_user_id: id });
      nav(`/chat/${res.data.conversation_id}`, {
        state: { name: driver?.name, photo: driver?.profile_photo_url },
      });
    } catch (err) {
      toast(errorMessage(err));
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="screen">
        <TopBar title="Driver" back />
        <FullSpinner label="Loading driver…" />
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="screen">
        <TopBar title="Driver" back />
        <EmptyState icon="🚫" title="Driver unavailable" text={error} />
      </div>
    );
  }

  const p = driver.driver_profiles?.[0] || {};
  const online = driver.location?.status === 'online';
  const level = p.driver_level || 'bronze';

  return (
    <div className="screen">
      <TopBar title="Driver profile" back />
      <div className="screen-scroll">
        {/* Header */}
        <div style={{ background: 'var(--navy)', color: '#fff', padding: '20px 16px 24px' }}>
          <div className="row">
            <Avatar src={driver.profile_photo_url} name={driver.name} large />
            <div style={{ flex: 1 }}>
              <h2 style={{ color: '#fff', fontSize: 21 }}>{driver.name}</h2>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                {driver.city || 'Ghana'}
              </div>
              <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span
                  className="badge"
                  style={{ background: DRIVER_LEVEL_COLORS[level] || '#CD7F32', color: '#1B2A4A' }}
                >
                  {level}
                </span>
                <span className={`badge ${online ? 'badge-green' : 'badge-grey'}`}>
                  {online ? 'Online now' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          <div className="row-between" style={{ marginTop: 16 }}>
            <div className="row" style={{ gap: 24 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {p.rating ? Number(p.rating).toFixed(1) : '—'}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Rating</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{p.total_trips || 0}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Trips</div>
              </div>
              <div
                onClick={() => nav(`/follows/${driver.id}`, { state: { tab: 'followers' } })}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ fontSize: 20, fontWeight: 700 }}>{followers}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Followers</div>
              </div>
            </div>
            <button
              onClick={toggleFollow}
              className="btn btn-sm"
              style={{
                width: 'auto',
                background: following ? 'transparent' : 'var(--gold)',
                color: following ? '#fff' : 'var(--navy)',
                border: following ? '1.5px solid rgba(255,255,255,0.4)' : 'none',
              }}
            >
              {following ? 'Following ✓' : '+ Follow'}
            </button>
          </div>
        </div>

        <div className="pad">
          {driver.bio && (
            <p style={{ marginBottom: 14, fontSize: 14 }}>{driver.bio}</p>
          )}

          {driver.active_status?.content && (
            <div className="card" style={{ borderLeft: '3px solid var(--gold)' }}>
              <div className="muted" style={{ fontSize: 12, marginBottom: 2 }}>
                Driver status · {timeAgo(driver.active_status.created_at)}
              </div>
              <div style={{ fontSize: 14 }}>{driver.active_status.content}</div>
            </div>
          )}

          {/* Vehicle */}
          <div className="section-title">Vehicle</div>
          <div className="card">
            <div className="row" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 32 }}>{vehicleEmoji(p.vehicle_type)}</span>
              <strong>{vehicleLabel(p.vehicle_type)}</strong>
            </div>
            <DetailRow label="Make / model" value={[p.vehicle_make, p.vehicle_model].filter(Boolean).join(' ') || '—'} />
            <DetailRow label="Colour" value={p.vehicle_colour || '—'} />
            <DetailRow label="Plate number" value={p.plate_number || '—'} />
            <DetailRow label="Capacity" value={p.capacity_kg ? `${p.capacity_kg} kg` : '—'} />
          </div>

          {/* Reviews */}
          <div className="section-title">Recent reviews</div>
          {driver.recent_reviews.length === 0 && (
            <p className="muted" style={{ marginBottom: 12 }}>No reviews yet.</p>
          )}
          {driver.recent_reviews.map((r, i) => (
            <div className="card" key={i}>
              <div className="row-between">
                <strong style={{ fontSize: 14 }}>{r.rater?.name || 'Customer'}</strong>
                <Stars value={r.score} />
              </div>
              {r.review && <p style={{ fontSize: 14, marginTop: 4 }}>{r.review}</p>}
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                {timeAgo(r.created_at)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky book button */}
      <div
        className="pad row"
        style={{ background: 'var(--white)', borderTop: '1px solid var(--light-grey)', gap: 10 }}
      >
        <button className="btn btn-outline" style={{ flex: 1 }} disabled={busy} onClick={startChat}>
          💬 Message
        </button>
        <button className="btn btn-primary" style={{ flex: 1.4 }} onClick={() => nav(`/book/${driver.id}`)}>
          Book this driver
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="row-between" style={{ padding: '6px 0', fontSize: 14 }}>
      <span className="muted">{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
