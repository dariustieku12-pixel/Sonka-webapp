import { useEffect, useState } from 'react';
import { ACCRA } from './constants';

export interface GeoState {
  coords: [number, number];
  precise: boolean; // true once the browser gives a real fix
  denied: boolean;
}

// One-shot browser geolocation with an Accra fallback so the map always
// has somewhere to start, even if the user blocks location access.
export function useGeolocation(): GeoState {
  const [state, setState] = useState<GeoState>({
    coords: ACCRA,
    precise: false,
    denied: false,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, denied: true }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coords: [pos.coords.latitude, pos.coords.longitude],
          precise: true,
          denied: false,
        });
      },
      () => setState((s) => ({ ...s, denied: true })),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  return state;
}
