// Smart install banner — picks the right install target by device.
//
//   Android (any brand) → multi-store list with the right primary store
//                         per brand (Transsion → PalmStore, Huawei →
//                         AppGallery, Samsung/Xiaomi/other → Play Store)
//   iOS                 → "Add to Home Screen" instructions
//   Desktop             → PWA install via beforeinstallprompt
//
// Dismissals are remembered in localStorage so it doesn't nag.

import { useEffect, useState } from 'react';
import { brandLabel, detectBrand, storesFor, type Store } from '../lib/stores';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'sonka_install_dismissed_v3';

type Mode = 'android' | 'ios' | 'desktop' | null;

function detectMode(): Mode {
  if (isStandalone()) return null;
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua) && !/Android/.test(ua)) return 'ios';
  return 'desktop';
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error iOS-specific
    window.navigator.standalone === true
  );
}

export default function InstallBanner() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<Mode>(null);
  const [iosHelp, setIosHelp] = useState(false);
  const [expandStores, setExpandStores] = useState(false);
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(DISMISS_KEY));

  useEffect(() => {
    setMode(detectMode());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDismissed(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (dismissed || !mode) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  }

  async function installPwa() {
    if (!evt) return;
    await evt.prompt();
    await evt.userChoice;
    setEvt(null);
    setDismissed(true);
  }

  // ── Android: device-aware multi-store ─────────────────────────────
  if (mode === 'android') {
    const brand = detectBrand();
    const stores = storesFor(brand);
    if (stores.length === 0) return null;
    const primary = stores[0];
    const others = stores.slice(1);

    return (
      <div className="install-banner" style={{ flexWrap: 'wrap' }}>
        <span style={{ fontSize: 18 }}>📲</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          Get SONKA on your {brandLabel(brand)}
        </span>
        <StoreLink store={primary} />
        {others.length > 0 && (
          <button onClick={() => setExpandStores((v) => !v)} className="dismiss" title="Other stores">
            {expandStores ? '×' : '⋯'}
          </button>
        )}
        {!others.length && (
          <button onClick={dismiss} className="dismiss" aria-label="Dismiss">
            ×
          </button>
        )}
        {expandStores && (
          <div
            style={{ flexBasis: '100%', display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}
          >
            {others.map((s) => (
              <StoreLink key={s.id} store={s} small />
            ))}
            <button onClick={dismiss} className="dismiss" aria-label="Dismiss" style={{ marginLeft: 'auto' }}>
              ×
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── iOS: instructions (Apple has no install prompt API) ───────────
  if (mode === 'ios') {
    return (
      <>
        <div className="install-banner">
          <span style={{ fontSize: 18 }}>📲</span>
          <span>Add SONKA to your home screen</span>
          <button onClick={() => setIosHelp(true)}>How</button>
          <button onClick={dismiss} className="dismiss" aria-label="Dismiss">
            ×
          </button>
        </div>
        {iosHelp && (
          <div
            onClick={() => setIosHelp(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(13,24,38,0.7)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--white)',
                borderRadius: 14,
                padding: 22,
                maxWidth: 340,
                width: '100%',
              }}
            >
              <strong style={{ fontSize: 16, color: 'var(--navy)' }}>Install SONKA on iPhone</strong>
              <ol style={{ fontSize: 14, marginTop: 12, paddingLeft: 20, lineHeight: 1.8 }}>
                <li>
                  Tap the <strong>Share</strong> icon at the bottom of Safari (the square with an
                  arrow ↑).
                </li>
                <li>
                  Scroll and tap <strong>"Add to Home Screen"</strong>.
                </li>
                <li>
                  Tap <strong>Add</strong>. SONKA appears as an app icon.
                </li>
              </ol>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIosHelp(false)}
                style={{ marginTop: 14 }}
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── Desktop: PWA install (only when browser offers it) ────────────
  if (!evt) return null;
  return (
    <div className="install-banner">
      <span style={{ fontSize: 18 }}>📲</span>
      <span>Install SONKA on this device</span>
      <button onClick={installPwa}>Install</button>
      <button onClick={dismiss} className="dismiss" aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}

function StoreLink({ store, small }: { store: Store; small?: boolean }) {
  return (
    <a
      href={store.url}
      target="_blank"
      rel="noopener"
      style={{
        background: small ? 'transparent' : 'var(--navy)',
        color: small ? 'var(--navy)' : 'var(--white)',
        padding: small ? '4px 10px' : '6px 12px',
        borderRadius: 8,
        fontWeight: 700,
        fontSize: small ? 11 : 12,
        textDecoration: 'none',
        border: small ? '1px solid rgba(27,42,74,0.3)' : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {store.emoji} {store.name}
    </a>
  );
}
