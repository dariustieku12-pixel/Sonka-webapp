import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/ui';

export default function Login() {
  const nav = useNavigate();
  const { signIn } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { phone: phone.trim() });
      signIn(res.data.token, res.data.user);
      nav('/map', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <TopBar title="Log in" back />
      <form className="screen-scroll pad" onSubmit={submit}>
        <h1 style={{ fontSize: 26, marginTop: 12 }}>Welcome back</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Enter the phone number on your SONKA account.
        </p>

        <div className="field">
          <label htmlFor="phone">Phone number</label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            placeholder="024 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoFocus
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-primary" disabled={loading || !phone.trim()}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>

        <p className="muted" style={{ textAlign: 'center', marginTop: 18 }}>
          No account yet?{' '}
          <Link to="/signup" style={{ color: 'var(--navy)', fontWeight: 700 }}>
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
