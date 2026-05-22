import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { vehicleEmoji, vehicleLabel } from '../lib/constants';
import { FINAL_STATUSES, statusMeta, timeAgo } from '../lib/format';
import type { Booking } from '../lib/types';
import { Avatar, EmptyState, FullSpinner, TabBar, TopBar } from '../components/ui';

export default function BookingsPage() {
  const nav = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api
      .get('/bookings')
      .then((res) => alive && setBookings(res.data.bookings || []))
      .catch((err) => alive && setError(errorMessage(err)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const active = bookings.filter((b) => !FINAL_STATUSES.includes(b.status));
  const past = bookings.filter((b) => FINAL_STATUSES.includes(b.status));

  return (
    <div className="screen">
      <TopBar title="My Trips" />
      <div className="screen-scroll">
        {loading ? (
          <FullSpinner label="Loading your trips…" />
        ) : error ? (
          <EmptyState icon="⚠️" title="Couldn't load trips" text={error} />
        ) : bookings.length === 0 ? (
          <EmptyState icon="🚚" title="No trips yet" text="Find a driver on the map and book your first trip.">
            <button className="btn btn-primary btn-sm" onClick={() => nav('/map')}>
              Find a driver
            </button>
          </EmptyState>
        ) : (
          <div className="pad">
            {active.length > 0 && (
              <>
                <div className="section-title" style={{ marginTop: 4 }}>
                  Active
                </div>
                {active.map((b) => (
                  <BookingCard key={b.id} b={b} onClick={() => nav(`/bookings/${b.id}`)} />
                ))}
              </>
            )}
            {past.length > 0 && (
              <>
                <div className="section-title">Past trips</div>
                {past.map((b) => (
                  <BookingCard key={b.id} b={b} onClick={() => nav(`/bookings/${b.id}`)} />
                ))}
              </>
            )}
          </div>
        )}
      </div>
      <TabBar />
    </div>
  );
}

function BookingCard({ b, onClick }: { b: Booking; onClick: () => void }) {
  const meta = statusMeta(b.status);
  return (
    <div className="card card-tap" onClick={onClick}>
      <div className="row-between" style={{ marginBottom: 8 }}>
        <span className={`badge ${meta.cls}`}>{meta.label}</span>
        <span className="muted" style={{ fontSize: 12 }}>
          {timeAgo(b.created_at)}
        </span>
      </div>
      <div className="row">
        <Avatar src={b.driver?.profile_photo_url} name={b.driver?.name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ fontSize: 14 }}>{b.driver?.name || 'Driver'}</strong>
          <div className="muted" style={{ fontSize: 13 }}>
            {vehicleEmoji(b.vehicle_type)} {vehicleLabel(b.vehicle_type)}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 13, marginTop: 8, color: 'var(--dark-grey)' }}>
        <div>📍 {b.pickup_name}</div>
        <div>🏁 {b.delivery_name}</div>
      </div>
    </div>
  );
}
