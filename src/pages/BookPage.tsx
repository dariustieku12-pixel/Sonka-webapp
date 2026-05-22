import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { vehicleEmoji, vehicleLabel } from '../lib/constants';
import { useToast } from '../components/Toast';
import { Avatar, FullSpinner, TopBar } from '../components/ui';
import LocationField, { type PlaceValue } from '../components/LocationField';

const EMPTY: PlaceValue = { name: '', lat: null, lng: null };

export default function BookPage() {
  const { driverId } = useParams<{ driverId: string }>();
  const nav = useNavigate();
  const toast = useToast();

  const [driver, setDriver] = useState<{
    id: string;
    name: string;
    profile_photo_url?: string | null;
    vehicle_type?: string | null;
  } | null>(null);
  const [loadingDriver, setLoadingDriver] = useState(true);

  const [pickup, setPickup] = useState<PlaceValue>(EMPTY);
  const [delivery, setDelivery] = useState<PlaceValue>(EMPTY);
  const [goods, setGoods] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/search/drivers/${driverId}`)
      .then((res) => {
        const d = res.data.driver;
        setDriver({
          id: d.id,
          name: d.name,
          profile_photo_url: d.profile_photo_url,
          vehicle_type: d.driver_profiles?.[0]?.vehicle_type,
        });
      })
      .catch(() => setError('Could not load this driver.'))
      .finally(() => setLoadingDriver(false));
  }, [driverId]);

  const valid = pickup.name.trim() && delivery.name.trim();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/bookings', {
        driver_id: driverId,
        pickup_name: pickup.name.trim(),
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        delivery_name: delivery.name.trim(),
        delivery_lat: delivery.lat,
        delivery_lng: delivery.lng,
        vehicle_type: driver?.vehicle_type || undefined,
        goods_description: goods.trim() || undefined,
        agreed_price: price.trim() ? Number(price) : undefined,
      });
      toast('Booking request sent 🚚');
      nav(`/bookings/${res.data.booking.id}`, { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Booking failed. Try again.'));
      setSubmitting(false);
    }
  }

  if (loadingDriver) {
    return (
      <div className="screen">
        <TopBar title="Book a trip" back />
        <FullSpinner label="Loading…" />
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar title="Book a trip" back />
      <form className="screen-scroll pad" onSubmit={submit}>
        {driver && (
          <div className="card row">
            <Avatar src={driver.profile_photo_url} name={driver.name} />
            <div>
              <strong>{driver.name}</strong>
              <div className="muted" style={{ fontSize: 13 }}>
                {vehicleEmoji(driver.vehicle_type)} {vehicleLabel(driver.vehicle_type)}
              </div>
            </div>
          </div>
        )}

        <div className="section-title">Pickup</div>
        <LocationField label="Where should the driver collect from?" value={pickup} onChange={setPickup} allowMyLocation />

        <div className="section-title">Delivery</div>
        <LocationField label="Where is it going?" value={delivery} onChange={setDelivery} />

        <div className="section-title">Details</div>
        <div className="field">
          <label htmlFor="goods">What are you moving? (optional)</label>
          <textarea
            id="goods"
            placeholder="e.g. 20 bags of cement, a fridge and a bed frame"
            value={goods}
            onChange={(e) => setGoods(e.target.value)}
            maxLength={500}
          />
        </div>

        <div className="field">
          <label htmlFor="price">Agreed price — GHS (optional)</label>
          <input
            id="price"
            type="number"
            inputMode="decimal"
            min={0}
            placeholder="Leave blank to agree with the driver"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <div className="field-hint">
            SONKA takes no commission. You pay the driver directly by cash or MoMo.
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-primary" disabled={!valid || submitting}>
          {submitting ? 'Sending request…' : 'Send booking request'}
        </button>
        <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 10 }}>
          The driver gets notified instantly and can accept your request.
        </p>
      </form>
    </div>
  );
}
