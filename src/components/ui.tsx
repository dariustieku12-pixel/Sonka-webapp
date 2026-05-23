// Small shared UI primitives.
import { NavLink, useNavigate } from 'react-router-dom';
import { initials } from '../lib/format';
import { useUnreadCount } from '../lib/unread';

export function Spinner() {
  return <div className="spinner" />;
}

export function FullSpinner({ label }: { label?: string }) {
  return (
    <div className="center-state" style={{ flex: 1 }}>
      <Spinner />
      {label && <div className="muted">{label}</div>}
    </div>
  );
}

export function Avatar({
  src,
  name,
  large,
}: {
  src?: string | null;
  name?: string | null;
  large?: boolean;
}) {
  const cls = large ? 'avatar avatar-lg' : 'avatar';
  if (src) return <img className={cls} src={src} alt={name || 'user'} />;
  return <div className={cls}>{initials(name)}</div>;
}

export function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span className="stars" aria-label={`${value} stars`}>
      {'★'.repeat(rounded)}
      {'☆'.repeat(Math.max(0, 5 - rounded))}
    </span>
  );
}

// Top bar with optional back button.
export function TopBar({
  title,
  back,
  logo,
  right,
}: {
  title?: string;
  back?: boolean;
  logo?: boolean;
  right?: React.ReactNode;
}) {
  const nav = useNavigate();
  return (
    <div className="topbar">
      {back && (
        <button className="topbar-back" onClick={() => nav(-1)} aria-label="Back">
          ‹
        </button>
      )}
      {logo ? <span className="logo">SONKA</span> : <h2>{title}</h2>}
      <div className="topbar-spacer" />
      {right}
    </div>
  );
}

// Bottom tab bar — Feed / Map / Trips / Messages / Profile.
export function TabBar() {
  const unread = useUnreadCount();
  const tabs = [
    { to: '/feed', icon: '📰', label: 'Feed', badge: 0 },
    { to: '/map', icon: '🗺️', label: 'Map', badge: 0 },
    { to: '/bookings', icon: '🚚', label: 'Trips', badge: 0 },
    { to: '/messages', icon: '💬', label: 'Chat', badge: unread },
    { to: '/profile', icon: '👤', label: 'Profile', badge: 0 },
  ];
  return (
    <nav className="tabbar">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} className={({ isActive }) => (isActive ? 'active' : '')}>
          {t.badge > 0 && <span className="tab-badge">{t.badge > 99 ? '99+' : t.badge}</span>}
          <span className="tab-icon">{t.icon}</span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  children,
}: {
  icon: string;
  title: string;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="center-state">
      <div className="big">{icon}</div>
      <h3>{title}</h3>
      {text && <p className="muted">{text}</p>}
      {children}
    </div>
  );
}
