// Thin Leaflet wrapper. Renders an OpenStreetMap (free, no API key) map
// with custom SONKA pins. Used by the Map page and trip tracking.
import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  kind: 'driver' | 'me' | 'pickup' | 'dropoff';
  emoji?: string;
  onClick?: () => void;
}

function icon(pin: MapPin): L.DivIcon {
  if (pin.kind === 'me') {
    return L.divIcon({ className: '', html: '<div class="me-pin"></div>', iconSize: [20, 20], iconAnchor: [10, 10] });
  }
  const glyph = pin.emoji || (pin.kind === 'pickup' ? '📍' : pin.kind === 'dropoff' ? '🏁' : '🚚');
  return L.divIcon({
    className: '',
    html: `<div class="driver-pin">${glyph}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

// Keeps the map centred on `center` and fixes sizing inside flex layouts.
function Controller({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    // Leaflet miscalculates size when mounted inside a flex column.
    const t = window.setTimeout(() => map.invalidateSize(), 120);
    return () => window.clearTimeout(t);
  }, [map, center[0], center[1], zoom]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function MapView({
  center,
  zoom = 14,
  pins,
}: {
  center: [number, number];
  zoom?: number;
  pins: MapPin[];
}) {
  return (
    <MapContainer center={center} zoom={zoom} zoomControl={false} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      <Controller center={center} zoom={zoom} />
      {pins.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={icon(p)}
          eventHandlers={p.onClick ? { click: p.onClick } : undefined}
        />
      ))}
    </MapContainer>
  );
}
