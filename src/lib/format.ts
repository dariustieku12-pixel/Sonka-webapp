import { formatDistanceToNow } from 'date-fns';

export function timeAgo(iso?: string | null): string {
  if (!iso) return '';
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

export function initials(name?: string | null): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

export function ghs(amount?: number | null): string {
  if (amount == null || isNaN(Number(amount))) return '—';
  return `GHS ${Number(amount).toFixed(2)}`;
}

// Human label + badge class for each booking status the backend returns.
export function statusMeta(status: string): { label: string; cls: string } {
  switch (status) {
    case 'pending':
      return { label: 'Waiting for driver', cls: 'badge-gold' };
    case 'accepted':
      return { label: 'Driver on the way', cls: 'badge-navy' };
    case 'driver_arrived':
      return { label: 'Driver arrived', cls: 'badge-navy' };
    case 'in_progress':
      return { label: 'Trip in progress', cls: 'badge-navy' };
    case 'completed_driver':
      return { label: 'Confirm your trip', cls: 'badge-gold' };
    case 'completed':
    case 'completed_customer':
      return { label: 'Completed', cls: 'badge-green' };
    case 'cancelled_driver':
      return { label: 'Cancelled by driver', cls: 'badge-red' };
    case 'cancelled_customer':
      return { label: 'Cancelled', cls: 'badge-red' };
    default:
      return { label: status.replace(/_/g, ' '), cls: 'badge-grey' };
  }
}

export const ACTIVE_STATUSES = ['accepted', 'driver_arrived', 'in_progress'];
export const FINAL_STATUSES = [
  'completed',
  'completed_customer',
  'cancelled_driver',
  'cancelled_customer',
];
