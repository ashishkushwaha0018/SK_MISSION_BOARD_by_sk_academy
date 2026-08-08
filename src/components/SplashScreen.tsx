import { useEffect, useRef, useState } from 'react';

interface SplashScreenProps {
  onFinished: () => void;
}

// Bundled asset — Vite emits this with a content-hash so it's cache-first
// in the service worker → works 100% offline after the first visit.
const introVideoUrl = new URL('../assets/intro.mp4', import.meta.url).href;

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fadingOut, setFadingOut] = useState(false);

  // Remove the pre-React overlay as soon as SplashScreen paints its dark bg
  useEffect(() => {
    const el = document.getElementById('sk-pre-splash');
    if (el) el.remove();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let done = false;

    function finish() {
      if (done) return;
      done = true;
      setFadingOut(true);
      setTimeout(() => onFinished(), 400);
    }

    // Safety: 3.5s max timeout to prevent black screen if video stalls or fails
    const safety = setTimeout(finish, 3500);

    video.addEventListener('ended', finish, { once: true });
    video.addEventListener('error', finish, { once: true });
    video.addEventListener('stalled', finish, { once: true });

    // Start playing immediately — if autoplay is blocked or fails, reveal app after short delay
    video.play().catch(() => {
      // Autoplay blocked (e.g. iframe policy); finish gracefully
      setTimeout(finish, 300);
    });

    return () => {
      clearTimeout(safety);
      video.removeEventListener('ended', finish);
      video.removeEventListener('error', finish);
      video.removeEventListener('stalled', finish);
      done = true;
    };
  }, [onFinished]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#000314',
        opacity: fadingOut ? 0 : 1,
        transition: fadingOut ? 'opacity 0.55s ease-in-out' : 'none',
        overflow: 'hidden',
      }}
    >
      <video
        ref={videoRef}
        src={introVideoUrl}
        muted
        playsInline
        autoPlay
        preload="auto"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          backgroundColor: '#000314',
        }}
      />

      <p
        style={{
          position: 'absolute',
          bottom: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
          color: 'rgba(255,255,255,0.55)',
          fontSize: '11px',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
          margin: 0,
          whiteSpace: 'nowrap',
        }}
      >
        by SK Academy
      </p>
    </div>
  );
}
