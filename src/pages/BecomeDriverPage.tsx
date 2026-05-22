import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { VEHICLE_TYPES, vehicleEmoji, vehicleLabel } from '../lib/constants';
import { useToast } from '../components/Toast';
import { TopBar } from '../components/ui';

export default function BecomeDriverPage() {
  const nav = useNavigate();
  const toast = useToast();
  const { signIn } = useAuth();

  const [vehicleType, setVehicleType] = useState<string>('aboboyaa');
  const [plate, setPlate] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [colour, setColour] = useState('');
  const [capacity, setCapacity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/auth/become-driver', {
        vehicle_type: vehicleType,
        plate_number: plate.trim() || undefined,
        vehicle_make: make.trim() || undefined,
        vehicle_model: model.trim() || undefined,
        vehicle_colour: colour.trim() || undefined,
        capacity_kg: capacity.trim() ? Number(capacity) : undefined,
      });
      signIn(res.data.token, res.data.user);
      toast('You are now a SONKA driver 🚚');
      nav('/profile', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="screen">
      <TopBar title="Become a driver" back />
      <form className="screen-scroll pad" onSubmit={submit}>
        <h1 style={{ fontSize: 24, marginTop: 8 }}>Drive with SONKA</h1>
        <p className="muted" style={{ marginBottom: 18 }}>
          Add your vehicle to get a driver profile, post availability and prices on the feed, and
          appear in customer searches.
        </p>

        <div className="section-title" style={{ marginTop: 0 }}>
          Vehicle type
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {VEHICLE_TYPES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVehicleType(v)}
              className="card"
              style={{
                margin: 0,
                cursor: 'pointer',
                textAlign: 'center',
                border: vehicleType === v ? '2px solid var(--gold)' : '2px solid transparent',
              }}
            >
              <div style={{ fontSize: 28 }}>{vehicleEmoji(v)}</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{vehicleLabel(v)}</div>
            </button>
          ))}
        </div>

        <div className="field">
          <label>Plate number</label>
          <input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="GR 1234-24" />
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Make</label>
            <input value={make} onChange={(e) => setMake(e.target.value)} placeholder="Kia" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Model</label>
            <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="K2700" />
          </div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Colour</label>
            <input value={colour} onChange={(e) => setColour(e.target.value)} placeholder="White" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Capacity (kg)</label>
            <input
              type="number"
              inputMode="numeric"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="1000"
            />
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating driver profile…' : 'Create my driver profile'}
        </button>
        <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 10 }}>
          To go live on the map and accept trips, install the SONKA mobile app — it broadcasts your
          location to nearby customers.
        </p>
      </form>
    </div>
  );
}
