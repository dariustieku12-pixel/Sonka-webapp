// Reusable list of every Android store SONKA is published on.
// Used on the Profile page so users can pick the store on their phone
// (not just be sent to Play Store, which Tecno/Huawei users may not
// even have set up).
import { STORES } from '../lib/stores';

export default function StoreList() {
  const stores = STORES.filter((s) => s.url);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {stores.map((s) => (
        <a
          key={s.id}
          href={s.url}
          target="_blank"
          rel="noopener"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--white)',
            border: '1.5px solid var(--gold)',
            borderRadius: 12,
            padding: '12px 14px',
            color: 'var(--navy)',
            fontWeight: 700,
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: 18 }}>{s.emoji}</span>
          {s.name}
        </a>
      ))}
    </div>
  );
}
