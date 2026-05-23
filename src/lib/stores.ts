// Android store registry. The web app's install banner picks the right
// primary store based on the user's device brand (Transsion phones use
// PalmStore, Huawei phones use AppGallery, etc.) — Play Store isn't
// universal in Ghana.
//
// To add a store: paste the SONKA listing URL into `url`. Leave `url`
// empty and the store is hidden until you have a real link.

export interface Store {
  id: string;
  name: string;
  emoji: string;
  url: string;                    // empty = not yet published / unknown
  primaryFor: BrandKey[];         // devices where this is the primary store
  showFor?: BrandKey[];           // devices where this is also offered (in addition to primaryFor)
}

export type BrandKey = 'transsion' | 'huawei' | 'samsung' | 'xiaomi' | 'other';

export const STORES: Store[] = [
  {
    id: 'play',
    name: 'Google Play',
    emoji: '▶',
    url: 'https://play.google.com/store/apps/details?id=com.teleportprime.sonka',
    primaryFor: ['samsung', 'xiaomi', 'other'],
  },
  {
    id: 'palmstore',
    name: 'PalmStore',
    emoji: '🌴',
    // TODO: paste the SONKA listing URL on PalmStore — Tecno/Itel/Infinix devices.
    url: '',
    primaryFor: ['transsion'],
  },
  {
    id: 'appgallery',
    name: 'Huawei AppGallery',
    emoji: '🟥',
    // TODO: paste the SONKA listing URL on Huawei AppGallery.
    url: '',
    primaryFor: ['huawei'],
  },
  {
    id: 'apkpure',
    name: 'APKPure',
    emoji: '⬇',
    url: 'https://apkpure.com/sonka/com.teleportprime.sonka',
    primaryFor: [],
    showFor: ['transsion', 'huawei', 'samsung', 'xiaomi', 'other'],
  },
];

export function detectBrand(): BrandKey {
  const ua = navigator.userAgent.toLowerCase();
  if (/tecno|itel|infinix|transsion/.test(ua)) return 'transsion';
  if (/huawei|honor|hwhonor/.test(ua)) return 'huawei';
  if (/samsung|sm-/.test(ua)) return 'samsung';
  if (/xiaomi|redmi|mi /.test(ua)) return 'xiaomi';
  return 'other';
}

export function brandLabel(b: BrandKey): string {
  return (
    {
      transsion: 'Tecno / Itel / Infinix',
      huawei: 'Huawei / Honor',
      samsung: 'Samsung',
      xiaomi: 'Xiaomi',
      other: 'Android',
    } as const
  )[b];
}

// Return the ordered list of available stores for a given device brand.
// Primary store(s) for the brand first, then alternates. Stores with no URL set are dropped.
export function storesFor(brand: BrandKey): Store[] {
  const primary = STORES.filter((s) => s.url && s.primaryFor.includes(brand));
  const alts = STORES.filter(
    (s) => s.url && !s.primaryFor.includes(brand) && (s.showFor?.includes(brand) ?? false)
  );
  // If we know the brand but have no primary URL yet, fall back to Play Store
  // so the user is never stranded.
  if (primary.length === 0 && brand !== 'samsung' && brand !== 'xiaomi' && brand !== 'other') {
    const play = STORES.find((s) => s.id === 'play');
    if (play?.url) primary.push(play);
  }
  return [...primary, ...alts];
}
