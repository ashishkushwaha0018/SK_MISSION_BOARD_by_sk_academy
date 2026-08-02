import { useEffect, useRef, useState } from 'react';

interface SplashScreenProps {
  onFinished: () => void;
}

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Safety fallback: after 5.5s always finish
    const safetyTimer = setTimeout(() => {
      triggerFadeOut();
    }, 5500);

    function triggerFadeOut() {
      setFadingOut(true);
      setTimeout(() => {
        onFinished();
      }, 500); // match CSS transition duration
    }

    video.addEventListener('ended', triggerFadeOut);
    // Try to play — on some browsers autoplay is blocked; if so, fall back to timer
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked — still wait for safety timer
      });
    }

    return () => {
      clearTimeout(safetyTimer);
      video.removeEventListener('ended', triggerFadeOut);
    };
  }, [onFinished]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#000314',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
        overflow: 'hidden',
      }}
    >
      {/* Background glow matching app theme */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(124,59,237,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Intro video — fullscreen cover */}
      <video
        ref={videoRef}
        src="/intro.mp4"
        muted
        playsInline
        autoPlay
        preload="auto"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Logo overlay at bottom for branding */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10,
        }}
      >
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '11px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
          }}
        >
          by SK Academy
        </p>
      </div>
    </div>
  );
}
