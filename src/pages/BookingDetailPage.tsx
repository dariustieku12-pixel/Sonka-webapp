import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { vehicleEmoji, vehicleLabel } from '../lib/constants';
import { ghs } from '../lib/format';
import { ACTIVE_STATUSES, FINAL_STATUSES, statusMeta } from '../lib/format';
import type { Booking, DriverLocation } from '../lib/types';
import { useToast } from '../components/Toast';
import { Avatar, EmptyState, FullSpinner, TopBar } from '../components/ui';
import MapView, { type MapPin } from '../components/MapView';

const STEPS = [
  { key: 'requested', label: 'Request sent', sub: 'Waiting for the driver to accept' },
  { key: 'accepted', label: 'Driver accepted', sub: 'Driver is heading to pickup' },
  { key: 'driver_arrived', label: 'Driver arrived', sub: 'At your pickup location' },
  { key: 'in_progress', label: 'Trip started', sub: 'Your goods are on the move' },
  { key: 'completed', label: 'Delivered', sub: 'Trip complete' },
];

function stepIndex(status: string): number {
  if (status === 'pending') return 0;
  if (status === 'accepted') return 1;
  if (status === 'driver_arrived') return 2;
  if (status === 'in_progress') return 3;
  if (status.startsWith('completed')) return 4;
  return 0;
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [driverLoc, setDriverLoc] = useState<DriverLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState(0);
  const [review, setReview] = useState('');

  const loadBooking = useCallback(async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.booking);
    } catch (err) {
      setError(errorMessage(err, 'Booking not found.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  // Poll the booking for status changes until it reaches a final state.
  const status = booking?.status;
  useEffect(() => {
    if (!status || FINAL_STATUSES.includes(status)) return;
    const t = window.setInterval(loadBooking, 8000);
    return () => window.clearInterval(t);
  }, [status, loadBooking]);

  // While the trip is active, poll the driver's live location.
  useEffect(() => {
    if (!status || !ACTIVE_STATUSES.includes(status)) {
      setDriverLoc(null);
      return;
    }
    let alive = true;
    const fetchLoc = async () => {
      try {
        const res = await api.get(`/bookings/${id}/driver-location`);
        if (alive) setDriverLoc(res.data);
      } catch {
        if (alive) setDriverLoc(null);
      }
    };
    fetchLoc();
    const t = window.setInterval(fetchLoc, 7000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, [status, id]);

  async function act(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      toast(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function cancelTrip() {
    if (!window.confirm('Cancel this booking?')) return;
    act(async () => {
      await api.put(`/bookings/${id}/cancel`, {});
      toast('Booking cancelled');
      await loadBooking();
    });
  }

  function confirmTrip() {
    act(async () => {
      await api.put(`/bookings/${id}/customer-complete`, {});
      toast('Trip confirmed — thank you!');
      await loadBooking();
    });
  }

  function submitRating() {
    if (!score) return;
    act(async () => {
      await api.post(`/bookings/${id}/rate`, { score, review: review.trim() || undefined });
      toast('Rating submitted. Medaase!');
      await loadBooking();
    });
  }

  if (loading) {
    return (
      <div className="screen">
        <TopBar title="Trip" back />
        <FullSpinner label="Loading trip…" />
      </div>
    );
  }
  if (error || !booking) {
    return (
      <div className="screen">
        <TopBar title="Trip" back />
        <EmptyState icon="🚫" title="Trip unavailable" text={error} />
      </div>
    );
  }

  const meta = statusMeta(booking.status);
  const cancelled = booking.status.startsWith('cancelled');
  const activeIdx = stepIndex(booking.status);
  const showMap = ACTIVE_STATUSES.includes(booking.status) && driverLoc;
  const canCancel = ['pending', 'accepted'].includes(booking.status);
  const canConfirm = booking.status === 'completed_driver';
  const canRate = booking.status === 'completed' && !booking.customer_rating;

  const pins: MapPin[] = [];
  if (showMap && driverLoc) {
    pins.push({ id: 'drv', lat: driverLoc.lat, lng: driverLoc.lng, kind: 'driver', emoji: vehicleEmoji(booking.vehicle_type) });
    if (booking.pickup_lat && booking.pickup_lng) {
      pins.push({ id: 'pk', lat: booking.pickup_lat, lng: booking.pickup_lng, kind: 'pickup' });
    }
  }

  return (
    <div className="screen">
      <TopBar title="Trip detail" back />
      <div className="screen-scroll">
        {/* Live tracking map */}
        {showMap && driverLoc && (
          <div style={{ height: 220, position: 'relative' }}>
            <MapView center={[driverLoc.lat, driverLoc.lng]} zoom={15} pins={pins} />
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                right: 8,
                background: 'rgba(13,24,38,0.9)',
                color: '#fff',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 12,
                zIndex: 1000,
              }}
            >
              {driverLoc.stale
                ? '⚠️ Driver location updating…'
                : '🟢 Live — driver location updates every few seconds'}
            </div>
          </div>
        )}

        <div className="pad">
          <div className="row-between" style={{ marginBottom: 12 }}>
            <span className={`badge ${meta.cls}`}>{meta.label}</span>
            {booking.booking_ref && (
              <span className="muted" style={{ fontSize: 12 }}>
                Ref {booking.booking_ref}
              </span>
            )}
          </div>

          {/* Driver card */}
          {booking.driver && (
            <div className="card row-between">
              <div className="row">
                <Avatar src={booking.driver.profile_photo_url} name={booking.driver.name} />
                <div>
                  <strong>{booking.driver.name}</strong>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {vehicleEmoji(booking.vehicle_type)} {vehicleLabel(booking.vehicle_type)}
                  </div>
                </div>
              </div>
              <a href={`tel:${booking.driver.phone}`} className="btn btn-navy btn-sm" style={{ width: 'auto' }}>
                📞 Call
              </a>
            </div>
          )}

          {/* Timeline or cancelled banner */}
          {cancelled ? (
            <div className="card" style={{ borderLeft: '3px solid var(--error)' }}>
              <strong style={{ color: 'var(--error)' }}>{meta.label}</strong>
              <p className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                This trip was cancelled.
              </p>
            </div>
          ) : (
            <>
              <div className="section-title">Progress</div>
              <div className="card">
                <div className="timeline">
                  {STEPS.map((s, i) => {
                    const done = i < activeIdx;
                    const active = i === activeIdx;
                    return (
                      <div className="timeline-step" key={s.key}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div className={`timeline-dot ${done ? 'done' : active ? 'active' : ''}`} />
                          {i < STEPS.length - 1 && <div className={`timeline-line ${done ? 'done' : ''}`} />}
                        </div>
                        <div className="timeline-label">
                          <div className="t" style={{ opacity: done || active ? 1 : 0.45 }}>
                            {s.label}
                          </div>
                          {active && <div className="s">{s.sub}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Trip details */}
          <div className="section-title">Trip</div>
          <div className="card">
            <Detail icon="📍" label="Pickup" value={booking.pickup_name} />
            <Detail icon="🏁" label="Delivery" value={booking.delivery_name} />
            {booking.goods_description && (
              <Detail icon="📦" label="Goods" value={booking.goods_description} />
            )}
            <Detail icon="💵" label="Agreed price" value={booking.agreed_price ? ghs(booking.agreed_price) : 'To agree with driver'} />
          </div>

          {/* Actions */}
          {canConfirm && (
            <div className="card" style={{ borderLeft: '3px solid var(--gold)' }}>
              <strong>Did this trip happen?</strong>
              <p className="muted" style={{ fontSize: 13, margin: '4px 0 10px' }}>
                Your driver marked this trip complete. Confirm so you can rate them.
              </p>
              <button className="btn btn-primary" disabled={busy} onClick={confirmTrip}>
                Yes, confirm trip
              </button>
            </div>
          )}

          {canRate && (
            <div className="card">
              <strong>Rate your driver</strong>
              <div style={{ fontSize: 30, margin: '8px 0', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    onClick={() => setScore(n)}
                    style={{ color: n <= score ? 'var(--gold)' : 'var(--light-grey)' }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="field">
                <textarea
                  placeholder="Add a review (optional)"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  maxLength={500}
                />
              </div>
              <button className="btn btn-primary" disabled={busy || !score} onClick={submitRating}>
                Submit rating
              </button>
            </div>
          )}

          {booking.status === 'completed' && booking.customer_rating && (
            <p className="muted" style={{ textAlign: 'center', marginTop: 8 }}>
              ✓ You rated this trip {booking.customer_rating}★
            </p>
          )}

          {canCancel && (
            <button
              className="btn btn-outline"
              style={{ marginTop: 8, color: 'var(--error)' }}
              disabled={busy}
              onClick={cancelTrip}
            >
              Cancel booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="row" style={{ alignItems: 'flex-start', padding: '6px 0' }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div className="muted" style={{ fontSize: 12 }}>
          {label}
        </div>
        <div style={{ fontSize: 14 }}>{value}</div>
      </div>
    </div>
  );
}
