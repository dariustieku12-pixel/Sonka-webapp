import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/ui';

const SITE = 'https://dariustieku12-pixel.github.io/Sonka-website';

export default function Signup() {
  const nav = useNavigate();
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [tc, setTc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const valid = name.trim().length > 1 && phone.trim().length >= 9 && tc;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/signup', {
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim() || undefined,
        user_type: 'customer',
        tc_accepted: 'true',
      });
      signIn(res.data.token, res.data.user);
      nav('/map', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <TopBar title="Create account" back />
      <form className="screen-scroll pad" onSubmit={submit}>
        <h1 style={{ fontSize: 26, marginTop: 12 }}>Join SONKA</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Book cargo drivers near you. Takes 30 seconds — no OTP.
        </p>

        <div className="field">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            placeholder="Ama Mensah"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="phone">Phone number</label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            placeholder="024 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div className="field-hint">This is how drivers reach you. Used to log in.</div>
        </div>

        <div className="field">
          <label htmlFor="city">City / town (optional)</label>
          <input
            id="city"
            placeholder="Accra"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <label className="row" style={{ alignItems: 'flex-start', gap: 10, margin: '8px 0 16px' }}>
          <input
            type="checkbox"
            checked={tc}
            onChange={(e) => setTc(e.target.checked)}
            style={{ width: 18, height: 18, marginTop: 2 }}
          />
          <span style={{ fontSize: 13, color: 'var(--grey)' }}>
            I agree to SONKA's{' '}
            <a href={`${SITE}/terms-of-service.html`} target="_blank" rel="noopener" style={{ color: 'var(--navy)', fontWeight: 700 }}>
              Terms
            </a>{' '}
            and{' '}
            <a href={`${SITE}/privacy-policy.html`} target="_blank" rel="noopener" style={{ color: 'var(--navy)', fontWeight: 700 }}>
              Privacy Policy
            </a>
            .
          </span>
        </label>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-primary" disabled={loading || !valid}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="muted" style={{ textAlign: 'center', marginTop: 18 }}>
          Already on SONKA?{' '}
          <Link to="/login" style={{ color: 'var(--navy)', fontWeight: 700 }}>
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
