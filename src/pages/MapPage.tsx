import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../lib/api';
import { useGeolocation } from '../lib/geo';
import { GHANA_REGIONS, VEHICLE_TYPES, vehicleEmoji, vehicleLabel } from '../lib/constants';
import type { Driver } from '../lib/types';
import MapView, { type MapPin } from '../components/MapView';
import { Avatar, Spinner, Stars, TabBar, TopBar } from '../components/ui';

export default function MapPage() {
  const nav = useNavigate();
  const geo = useGeolocation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicle, setVehicle] = useState<string>('all');
  const [region, setRegion] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [lat, lng] = geo.coords;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/search/drivers', {
        params: {
          lat,
          lng,
          ...(vehicle !== 'all' ? { vehicle_type: vehicle } : {}),
          ...(region !== 'all' ? { region } : {}),
        },
      });
      setDrivers(res.data.drivers || []);
      setNotice(res.data.expanded_message || '');
    } catch (err) {
      setError(errorMessage(err, 'Could not load drivers.'));
    } finally {
      setLoading(false);
    }
  }, [lat, lng, vehicle, region]);

  useEffect(() => {
    load();
  }, [load]);

  const pins: MapPin[] = [
    { id: 'me', lat, lng, kind: 'me' },
    ...drivers.map<MapPin>((d) => ({
      id: d.id,
      lat: d.lat,
      lng: d.lng,
      kind: 'driver',
      emoji: vehicleEmoji(d.vehicle_type),
      onClick: () => nav(`/driver/${d.id}`),
    })),
  ];

  return (
    <div className="screen">
      <TopBar
        logo
        right={
          <button className="topbar-back" onClick={load} aria-label="Refresh" title="Refresh">
            ↻
          </button>
        }
      />

      {/* Region selector */}
      <div
        className="row"
        style={{
          padding: '8px 12px',
          gap: 8,
          background: 'var(--white)',
          borderBottom: '1px solid var(--off-white)',
          fontSize: 13,
        }}
      >
        <span style={{ fontSize: 16 }}>📍</span>
        <span className="muted" style={{ fontSize: 12 }}>Region</span>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          style={{
            flex: 1,
            padding: '6px 8px',
            border: '1.5px solid var(--light-grey)',
            borderRadius: 8,
            background: 'var(--white)',
            fontSize: 14,
            color: 'var(--navy)',
            fontWeight: 600,
          }}
        >
          <option value="all">All Ghana (nearby first)</option>
          {GHANA_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Vehicle filter chips */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          padding: '10px 12px',
          background: 'var(--white)',
          borderBottom: '1px solid var(--light-grey)',
        }}
      >
        {['all', ...VEHICLE_TYPES].map((v) => {
          const active = vehicle === v;
          return (
            <button
              key={v}
              onClick={() => setVehicle(v)}
              className={`badge ${active ? 'badge-navy' : 'badge-grey'}`}
              style={{
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                border: 'none',
                padding: '7px 13px',
                fontSize: 12,
              }}
            >
              {v === 'all' ? 'All' : `${vehicleEmoji(v)} ${vehicleLabel(v)}`}
            </button>
          );
        })}
      </div>

      <div className="map-wrap">
        <MapView center={geo.coords} pins={pins} />

        {/* Driver list sheet over the map */}
        <div className="sheet">
          <div className="sheet-handle" />
          <div className="sheet-head row-between">
            <span>
              {loading
                ? 'Finding drivers…'
                : `${drivers.length} driver${drivers.length === 1 ? '' : 's'} near you`}
            </span>
            {loading && <Spinner />}
          </div>

          {notice && (
            <p className="muted" style={{ padding: '0 16px 6px', fontSize: 12 }}>
              {notice}
            </p>
          )}
          {geo.denied && (
            <p className="muted" style={{ padding: '0 16px 6px', fontSize: 12 }}>
              📍 Location is off — showing drivers around Accra. Enable location for accurate
              results.
            </p>
          )}
          {error && (
            <p className="error-text" style={{ padding: '0 16px' }}>
              {error}
            </p>
          )}

          <div className="sheet-list">
            {!loading && drivers.length === 0 && !error && (
              <p className="muted" style={{ padding: '16px', textAlign: 'center' }}>
                No drivers available right now. Pull refresh in a moment.
              </p>
            )}
            {drivers.map((d) => (
              <div
                key={d.id}
                className="card card-tap"
                onClick={() => nav(`/driver/${d.id}`)}
                style={{ marginBottom: 8 }}
              >
                <div className="row">
                  <Avatar src={d.profile_photo_url} name={d.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row-between">
                      <strong style={{ fontSize: 15 }}>{d.first_name || d.name}</strong>
                      <span className="muted" style={{ fontSize: 13 }}>
                        {d.distance_display}
                      </span>
                    </div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      {vehicleEmoji(d.vehicle_type)} {vehicleLabel(d.vehicle_type)}
                      {d.eta_display ? ` · ${d.eta_display}` : ''}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 2 }}>
                      <Stars value={d.rating} />{' '}
                      <span className="muted">
                        {d.rating ? d.rating.toFixed(1) : 'New'} · {d.total_trips} trips
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TabBar />
    </div>
  );
}
