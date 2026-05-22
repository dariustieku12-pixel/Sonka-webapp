import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';
import { TopBar } from '../components/ui';

export default function PostCreatePage() {
  const nav = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const isDriver = user?.user_type === 'driver' || user?.user_type === 'both';

  const [type, setType] = useState('general');
  const [content, setContent] = useState('');
  const [productName, setProductName] = useState('');
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');
  const [price, setPrice] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const types = [
    { key: 'general', label: '💬 Update' },
    { key: 'product', label: '🛒 For sale' },
    { key: 'road_alert', label: '⚠️ Road alert' },
    ...(isDriver
      ? [
          { key: 'availability', label: '🟢 Availability' },
          { key: 'price_board', label: '💰 Price board' },
        ]
      : []),
  ];

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/feed', {
        post_type: type,
        content: content.trim(),
        city: user?.city || undefined,
        product_name: type === 'product' ? productName.trim() || undefined : undefined,
        route_from: ['availability', 'price_board'].includes(type) ? routeFrom.trim() || undefined : undefined,
        route_to: ['availability', 'price_board'].includes(type) ? routeTo.trim() || undefined : undefined,
        price_ghs:
          ['product', 'price_board'].includes(type) && price.trim() ? Number(price) : undefined,
        alert_severity: type === 'road_alert' ? severity : undefined,
      });
      toast('Posted to the feed 🎉');
      nav('/feed', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Post failed.'));
      setSubmitting(false);
    }
  }

  return (
    <div className="screen">
      <TopBar title="Create post" back />
      <form className="screen-scroll pad" onSubmit={submit}>
        <div className="section-title" style={{ marginTop: 0 }}>
          Post type
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {types.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setType(t.key)}
              className={`badge ${type === t.key ? 'badge-navy' : 'badge-grey'}`}
              style={{ cursor: 'pointer', border: 'none', padding: '8px 13px', fontSize: 12 }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="field">
          <label>Say something</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              type === 'road_alert'
                ? 'Describe the road situation…'
                : type === 'availability'
                ? "Tell customers where you're available…"
                : "What's on your mind?"
            }
            maxLength={2000}
            style={{ minHeight: 110 }}
            autoFocus
          />
        </div>

        {type === 'product' && (
          <>
            <div className="field">
              <label>Product name</label>
              <input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Cement (50kg bag)" />
            </div>
            <div className="field">
              <label>Price — GHS</label>
              <input type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </>
        )}

        {['availability', 'price_board'].includes(type) && (
          <div className="row" style={{ gap: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>From</label>
              <input value={routeFrom} onChange={(e) => setRouteFrom(e.target.value)} placeholder="Accra" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>To</label>
              <input value={routeTo} onChange={(e) => setRouteTo(e.target.value)} placeholder="Kumasi" />
            </div>
          </div>
        )}

        {type === 'price_board' && (
          <div className="field">
            <label>Price — GHS</label>
            <input type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        )}

        {type === 'road_alert' && (
          <div className="field">
            <label>Severity</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-primary" disabled={!content.trim() || submitting}>
          {submitting ? 'Posting…' : 'Post to feed'}
        </button>
      </form>
    </div>
  );
}
