// Location picker — searches Ghana places via the backend's
// /search/locations endpoint (Nominatim + SONKA community map).
// Optionally lets the user drop their current GPS position.
import { useEffect, useRef, useState } from 'react';
import api from '../lib/api';

export interface PlaceValue {
  name: string;
  lat: number | null;
  lng: number | null;
}

interface Result {
  id: string;
  name: string;
  display_name: string;
  lat: number;
  lng: number;
  source: string;
}

export default function LocationField({
  label,
  value,
  onChange,
  allowMyLocation,
}: {
  label: string;
  value: PlaceValue;
  onChange: (v: PlaceValue) => void;
  allowMyLocation?: boolean;
}) {
  const [query, setQuery] = useState(value.name);
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const timer = useRef<number>();

  useEffect(() => {
    setQuery(value.name);
  }, [value.name]);

  function handleInput(text: string) {
    setQuery(text);
    onChange({ name: text, lat: null, lng: null });
    window.clearTimeout(timer.current);
    if (text.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    timer.current = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get('/search/locations', { params: { q: text.trim() } });
        setResults(res.data.results || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }

  function pick(r: Result) {
    onChange({ name: r.name, lat: r.lat, lng: r.lng });
    setQuery(r.name);
    setOpen(false);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({
          name: 'My current location',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setQuery('My current location');
        setOpen(false);
      },
      () => alert('Could not get your location. Type the place name instead.')
    );
  }

  return (
    <div className="field" style={{ position: 'relative' }}>
      <label>{label}</label>
      <input
        value={query}
        placeholder="Search a town, market, landmark…"
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
      />
      {allowMyLocation && (
        <button
          type="button"
          onClick={useMyLocation}
          className="badge badge-navy"
          style={{ marginTop: 6, border: 'none', cursor: 'pointer', padding: '6px 12px' }}
        >
          📍 Use my current location
        </button>
      )}
      {value.lat != null && (
        <div className="field-hint" style={{ color: 'var(--success)' }}>
          ✓ Pinned on map
        </div>
      )}
      {searching && <div className="field-hint">Searching…</div>}

      {open && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '100%',
            background: '#fff',
            border: '1px solid var(--light-grey)',
            borderRadius: 10,
            marginTop: 4,
            zIndex: 20,
            boxShadow: 'var(--shadow-lg)',
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {results.map((r) => (
            <div
              key={r.id}
              onClick={() => pick(r)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--off-white)',
                fontSize: 14,
              }}
            >
              <strong>{r.name}</strong>
              <div className="muted" style={{ fontSize: 12 }}>
                {r.display_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
