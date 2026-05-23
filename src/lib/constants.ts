// SONKA web app — shared constants. Mirrors the mobile app's constants
// so the two clients stay consistent against the same backend.

export const API_URL = 'https://sonka-backend-production.up.railway.app';

// Accra — fallback map centre when the browser denies geolocation.
export const ACCRA: [number, number] = [5.6037, -0.187];

export const TOKEN_KEY = 'sonka_token';
export const USER_KEY = 'sonka_user';

// Vehicle types the booking endpoint accepts (current set).
export const VEHICLE_TYPES = [
  'aboboyaa',
  'motorcargo',
  'kia_truck',
  'rhino_truck',
  'mini_bus',
  'trailer',
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const VEHICLE_LABELS: Record<string, string> = {
  aboboyaa: 'Aboboyaa',
  motorcargo: 'Two Tyres',
  kia_truck: 'Kia Truck',
  rhino_truck: 'Rhino Truck',
  mini_bus: 'Light Vehicle',
  trailer: 'Trailer',
  // legacy values still returned by older driver rows
  truck_heavy: 'Heavy Truck',
  truck_medium: 'Medium Truck',
  cargo_bike: 'Cargo Bike',
};

export const VEHICLE_EMOJIS: Record<string, string> = {
  aboboyaa: '🛺',
  motorcargo: '🏍️',
  kia_truck: '🚐',
  rhino_truck: '🚛',
  mini_bus: '🚌',
  trailer: '🚚',
  truck_heavy: '🚛',
  truck_medium: '🚚',
  cargo_bike: '🚲',
};

export const DRIVER_LEVEL_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#F5A800',
  platinum: '#9aa0a6',
};

export function vehicleLabel(type?: string | null): string {
  if (!type) return 'Vehicle';
  return VEHICLE_LABELS[type] || type.replace(/_/g, ' ');
}

export function vehicleEmoji(type?: string | null): string {
  if (!type) return '🚚';
  return VEHICLE_EMOJIS[type] || '🚚';
}

// Ghana's 16 administrative regions — matches the backend's region filter.
export const GHANA_REGIONS = [
  'Ahafo',
  'Ashanti',
  'Bono',
  'Bono East',
  'Central',
  'Eastern',
  'Greater Accra',
  'North East',
  'Northern',
  'Oti',
  'Savannah',
  'Upper East',
  'Upper West',
  'Volta',
  'Western',
  'Western North',
];
