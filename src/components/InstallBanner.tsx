import { useEffect, useState } from 'react';

export function InstallBanner() {
  // Capture the deferred prompt
  const [prompt, setPrompt] = useState<Event | null>(null);
  // Show guide if prompt not available (iOS / already dismissed native prompt)
  const [showGuide, setShowGuide] = useState(false);
  // Always start hidden; show after checking standalone mode on mount
  const [visible, setVisible] = useState(false);
  // Session-level dismiss (hidden until user refreshes)
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already running as installed PWA (standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-ignore
      window.navigator.standalone === true;

    if (isStandalone || dismissed) return;

    // Show the install banner
    setVisible(true);

    // Capture beforeinstallprompt so we can trigger it on button click
    const promptHandler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', promptHandler);

    // When PWA is actually installed, hide the banner
    const installedHandler = () => {
      setVisible(false);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', promptHandler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, [dismissed]);

  const handleInstall = async () => {
    if (prompt) {
      // @ts-ignore
      prompt.prompt();
      // @ts-ignore
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setVisible(false);
      }
      setPrompt(null);
    } else {
      // No native prompt (iOS or already dismissed) — show guide
      setShowGuide(true);
    }
  };

  const handleDismiss = () => {
    // Hide for this session only — will reappear on next page load/visit
    setDismissed(true);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Install Banner */}
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9998,
          width: 'calc(100% - 32px)',
          maxWidth: '420px',
          background: 'linear-gradient(135deg, #1a0533 0%, #0d0225 100%)',
          border: '1px solid rgba(124,59,237,0.5)',
          borderRadius: '16px',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 32px rgba(124,59,237,0.3)',
          animation: 'slideUp 0.35s ease-out',
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}</style>

        {/* Icon — new logo */}
        <img
          src="/logo.png"
          alt="SK MISSION BOARD"
          style={{ width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0, objectFit: 'cover' }}
        />

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, color: '#ffffff', fontWeight: 700, fontSize: '13px', fontFamily: 'sans-serif' }}>
            SK MISSION BOARD
          </p>
          <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontFamily: 'sans-serif' }}>
            Install the app — free, offline ready
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
            flexShrink: 0,
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>

        {/* Install */}
        <button
          onClick={handleInstall}
          style={{
            background: '#7c3bed',
            border: 'none',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '12px',
            fontFamily: 'sans-serif',
            borderRadius: '8px',
            padding: '8px 14px',
            cursor: 'pointer',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          Install
        </button>
      </div>

      {/* Add to Home Screen Guide Modal (for iOS / no native prompt) */}
      {showGuide && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowGuide(false)}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1a0533 0%, #0d0225 100%)',
              border: '1px solid rgba(124,59,237,0.5)',
              borderRadius: '20px',
              padding: '24px 20px',
              width: '100%',
              maxWidth: '420px',
              marginBottom: '8px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ margin: '0 0 12px', color: '#ffffff', fontWeight: 700, fontSize: '15px', fontFamily: 'sans-serif', textAlign: 'center' }}>
              📲 App Install करें
            </p>
            <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontFamily: 'sans-serif' }}>
              <b style={{ color: '#a78bfa' }}>Android Chrome:</b> Browser menu (⋮) → "Add to Home screen" tap करें
            </p>
            <p style={{ margin: '0 0 16px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontFamily: 'sans-serif' }}>
              <b style={{ color: '#a78bfa' }}>iPhone Safari:</b> Share button (□↑) → "Add to Home Screen" tap करें
            </p>
            <button
              onClick={() => setShowGuide(false)}
              style={{
                width: '100%',
                background: '#7c3bed',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                fontFamily: 'sans-serif',
                borderRadius: '10px',
                padding: '12px',
                cursor: 'pointer',
              }}
            >
              समझ गया ✓
            </button>
          </div>
        </div>
      )}
    </>
  );
}
