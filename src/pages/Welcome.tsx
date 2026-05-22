import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Welcome() {
  const { user } = useAuth();
  if (user) return <Navigate to="/map" replace />;

  return (
    <div className="screen" style={{ background: 'var(--navy)', color: 'var(--white)' }}>
      <div
        className="screen-scroll"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 28px 32px',
        }}
      >
        <div>
          <div className="logo" style={{ fontSize: 38, color: 'var(--gold)', letterSpacing: 4 }}>
            SONKA
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 6, fontSize: 14 }}>
            Ghana's Cargo Marketplace
          </p>

          <h1 style={{ color: 'var(--white)', fontSize: 38, marginTop: 48, lineHeight: 1.15 }}>
            Move anything.
            <br />
            <span style={{ color: 'var(--gold)' }}>Find drivers near you.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 16, fontSize: 16 }}>
            See trucks, tricycles and cargo bikes on a live map. Book in seconds. Pay the driver
            directly by cash or MoMo.
          </p>

          <ul style={{ listStyle: 'none', marginTop: 28, display: 'grid', gap: 12 }}>
            {[
              ['🗺️', 'Live map of drivers around you'],
              ['⚡', 'Book instantly — no agent, no fees'],
              ['📍', 'Track your trip from pickup to delivery'],
            ].map(([icon, text]) => (
              <li key={text} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15 }}>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: 40, display: 'grid', gap: 12 }}>
          <Link to="/signup" className="btn btn-primary">
            Create an account
          </Link>
          <Link to="/login" className="btn btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
            I already have an account
          </Link>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            Driver? Get the SONKA app on Android to go live on the map.
          </p>
        </div>
      </div>
    </div>
  );
}
