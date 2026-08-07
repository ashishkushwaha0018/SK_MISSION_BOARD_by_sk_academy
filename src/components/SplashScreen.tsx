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
      setTimeout(() => onFinished(), 550);
    }

    // Safety: always finish even if video never fires 'ended'
    const safety = setTimeout(finish, 8000);

    video.addEventListener('ended', finish, { once: true });

    // Start playing immediately — don't wait for any buffering event
    video.play().catch(() => {
      // Autoplay blocked (some mobile browsers); safety timer will rescue
    });

    return () => {
      clearTimeout(safety);
      video.removeEventListener('ended', finish);
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
