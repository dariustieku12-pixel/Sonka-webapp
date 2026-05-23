// Smart install banner — picks the right install target by device.
//
//   Android   → "Get the SONKA Android app" → Play Store (real native app)
//   iOS       → "Add to Home Screen" instructions (iOS has no Play Store
//               for SONKA and doesn't fire beforeinstallprompt)
//   Desktop   → PWA install via beforeinstallprompt (when the browser
//               offers it; otherwise hidden)
//
// Dismissals are remembered in localStorage so it doesn't nag.

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'sonka_install_dismissed_v2';
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.teleportprime.sonka';
const APKPURE_URL = 'https://apkpure.com/sonka/com.teleportprime.sonka';

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
  // On desktop we only show the banner if the browser actually offers PWA install.
  if (mode === 'desktop' && !evt) return null;

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

  // ── Android: push to Play Store ─────────────────────────────────────
  if (mode === 'android') {
    return (
      <div className="install-banner">
        <span style={{ fontSize: 18 }}>📲</span>
        <span>Get the full SONKA Android app</span>
        <a
          href={PLAY_URL}
          target="_blank"
          rel="noopener"
          style={{
            marginLeft: 'auto',
            background: 'var(--navy)',
            color: 'var(--white)',
            padding: '6px 12px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 12,
            textDecoration: 'none',
          }}
        >
          Play Store
        </a>
        <a
          href={APKPURE_URL}
          target="_blank"
          rel="noopener"
          style={{
            color: 'var(--navy)',
            fontSize: 11,
            textDecoration: 'underline',
            marginLeft: 4,
          }}
        >
          APKPure
        </a>
        <button onClick={dismiss} className="dismiss" aria-label="Dismiss">
          ×
        </button>
      </div>
    );
  }

  // ── iOS: instructions (Apple has no install prompt API) ─────────────
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
                <li>Tap <strong>Add</strong>. SONKA appears as an app icon.</li>
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

  // ── Desktop: PWA install ────────────────────────────────────────────
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
