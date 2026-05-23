// PWA install prompt. Captures the browser's beforeinstallprompt event
// and shows a banner so the user can add SONKA to their home screen and
// run it standalone (no browser chrome — feels like the real app).
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'sonka_install_dismissed';

export default function InstallBanner() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(
    () => !!localStorage.getItem(DISMISS_KEY) || isStandalone()
  );

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setDismissed(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (dismissed || !evt) return null;

  async function install() {
    if (!evt) return;
    await evt.prompt();
    await evt.userChoice;
    setEvt(null);
    setDismissed(true);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  }

  return (
    <div className="install-banner">
      <span style={{ fontSize: 18 }}>📲</span>
      <span>Install SONKA to your home screen</span>
      <button onClick={install}>Install</button>
      <button onClick={dismiss} className="dismiss" aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error iOS-specific
    window.navigator.standalone === true
  );
}
