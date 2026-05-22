import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';
import { Avatar, TabBar, TopBar } from '../components/ui';

const SITE = 'https://dariustieku12-pixel.github.io/Sonka-website';

export default function ProfilePage() {
  const { user, signOut, refresh } = useAuth();
  const nav = useNavigate();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  async function save() {
    setSaving(true);
    try {
      await api.put('/auth/profile', { name: name.trim(), city: city.trim(), bio: bio.trim() });
      await refresh();
      toast('Profile updated');
      setEditing(false);
    } catch (err) {
      toast(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    if (!window.confirm('Log out of SONKA?')) return;
    signOut();
    nav('/welcome', { replace: true });
  }

  async function deleteAccount() {
    if (!window.confirm('Delete your SONKA account? You can sign up again with the same number later.')) return;
    try {
      await api.post('/auth/delete-account', {});
      signOut();
      nav('/welcome', { replace: true });
    } catch (err) {
      toast(errorMessage(err));
    }
  }

  return (
    <div className="screen">
      <TopBar title="Profile" />
      <div className="screen-scroll">
        {/* Header */}
        <div style={{ background: 'var(--navy)', color: '#fff', padding: '24px 16px' }}>
          <div className="row">
            <Avatar src={user.profile_photo_url} name={user.name} large />
            <div>
              <h2 style={{ color: '#fff', fontSize: 20 }}>{user.name}</h2>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{user.phone}</div>
              <span className="badge badge-gold" style={{ marginTop: 6, display: 'inline-block' }}>
                {user.user_type === 'both' ? 'Customer + Driver' : user.user_type}
              </span>
            </div>
          </div>
        </div>

        <div className="pad">
          {user.referral_code && (
            <div className="card" style={{ borderLeft: '3px solid var(--gold)' }}>
              <div className="muted" style={{ fontSize: 12 }}>
                Your referral code
              </div>
              <strong style={{ fontSize: 18, letterSpacing: 1 }}>{user.referral_code}</strong>
              <p className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                Share it — friends enter it when they sign up.
              </p>
            </div>
          )}

          {/* Edit details */}
          <div className="section-title">Account details</div>
          {editing ? (
            <div className="card">
              <div className="field">
                <label>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label>City / town</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="field">
                <label>Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} />
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button className="btn btn-outline" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={save} disabled={saving || !name.trim()}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <Line label="Name" value={user.name} />
              <Line label="Phone" value={user.phone} />
              <Line label="City" value={user.city || '—'} />
              {user.bio && <Line label="Bio" value={user.bio} />}
              <button
                className="btn btn-outline btn-sm"
                style={{ marginTop: 10 }}
                onClick={() => setEditing(true)}
              >
                Edit details
              </button>
            </div>
          )}

          {/* In-app navigation */}
          <div className="section-title">Activity</div>
          <div className="card" style={{ padding: 0 }}>
            <NavRow label="🔔 Notifications" onClick={() => nav('/notifications')} />
            <NavRow
              label="🚚 My Trips"
              onClick={() => nav('/bookings')}
              last={user.user_type !== 'customer'}
            />
            {user.user_type === 'customer' && (
              <NavRow label="🚛 Become a driver" onClick={() => nav('/become-driver')} last />
            )}
          </div>

          {/* Links */}
          <div className="section-title">SONKA</div>
          <div className="card" style={{ padding: 0 }}>
            <LinkRow label="📱 Get the mobile app" href="https://play.google.com/store/apps/details?id=com.teleportprime.sonka" />
            <LinkRow label="📄 Terms of Service" href={`${SITE}/terms-of-service.html`} />
            <LinkRow label="🔒 Privacy Policy" href={`${SITE}/privacy-policy.html`} />
            <LinkRow label="✉️ Contact support" href="mailto:dariustieku12@gmail.com" last />
          </div>

          <button className="btn btn-outline" style={{ marginTop: 14 }} onClick={logout}>
            Log out
          </button>
          <button
            onClick={deleteAccount}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--error)',
              fontSize: 13,
              marginTop: 14,
              width: '100%',
              cursor: 'pointer',
            }}
          >
            Delete my account
          </button>
          <p className="muted" style={{ textAlign: 'center', fontSize: 11, margin: '14px 0 4px' }}>
            SONKA · Tele-Port Prime Ghana Ltd
          </p>
        </div>
      </div>
      <TabBar />
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="row-between" style={{ padding: '6px 0', fontSize: 14 }}>
      <span className="muted">{label}</span>
      <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '65%' }}>{value}</span>
    </div>
  );
}

function LinkRow({ label, href, last }: { label: string; href: string; last?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="row-between"
      style={{
        padding: '14px 16px',
        borderBottom: last ? 'none' : '1px solid var(--off-white)',
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      <span>{label}</span>
      <span className="muted">›</span>
    </a>
  );
}

function NavRow({ label, onClick, last }: { label: string; onClick: () => void; last?: boolean }) {
  return (
    <div
      onClick={onClick}
      className="row-between"
      style={{
        padding: '14px 16px',
        borderBottom: last ? 'none' : '1px solid var(--off-white)',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      <span>{label}</span>
      <span className="muted">›</span>
    </div>
  );
}
