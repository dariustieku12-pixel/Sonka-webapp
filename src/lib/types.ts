// Shared shapes returned by the SONKA backend.

export interface User {
  id: string;
  name: string;
  phone: string;
  user_type: 'customer' | 'driver' | 'both' | 'shop';
  city?: string | null;
  profile_photo_url?: string | null;
  bio?: string | null;
  referral_code?: string | null;
  is_affiliate?: boolean;
}

export interface Driver {
  id: string;
  name: string;
  first_name?: string;
  phone: string;
  profile_photo_url?: string | null;
  city?: string | null;
  region?: string | null;
  vehicle_type?: string | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_colour?: string | null;
  plate_number?: string | null;
  capacity_kg?: number | null;
  rating: number;
  total_trips: number;
  driver_level?: string | null;
  lat: number;
  lng: number;
  heading?: number;
  distance_m?: number;
  distance_display?: string;
  eta_display?: string;
  last_seen?: string | null;
}

export interface Review {
  score: number;
  review?: string | null;
  created_at: string;
  rater?: { name?: string; profile_photo_url?: string | null } | null;
}

export interface BookingParty {
  id: string;
  name: string;
  phone: string;
  profile_photo_url?: string | null;
}

export interface Booking {
  id: string;
  booking_ref?: string | null;
  status: string;
  pickup_name: string;
  pickup_lat?: number | null;
  pickup_lng?: number | null;
  delivery_name: string;
  delivery_lat?: number | null;
  delivery_lng?: number | null;
  vehicle_type?: string | null;
  goods_description?: string | null;
  agreed_price?: number | null;
  driver_arrived_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  completed_by_driver?: boolean;
  completed_by_customer?: boolean;
  customer_rating?: number | null;
  driver_rating?: number | null;
  created_at: string;
  customer: BookingParty;
  driver?: BookingParty | null;
}

export interface DriverLocation {
  status: string;
  driver_id: string;
  lat: number;
  lng: number;
  heading?: number | null;
  speed_kmh?: number | null;
  last_seen?: string | null;
  stale: boolean;
}
