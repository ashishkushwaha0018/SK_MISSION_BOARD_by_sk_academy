import { useEffect, useRef, useState } from 'react';
import introVideoUrl from '../assets/intro.mp4';

interface SplashScreenProps {
  onFinished: () => void;
}

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fadingOut, setFadingOut] = useState(false);

  // Remove the pre-React overlay as soon as SplashScreen mounts
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

    // Safety timeout: 7 seconds to let full intro animation play
    const safety = setTimeout(finish, 7000);

    // Enforce DOM properties for mobile/iframe autoplay policy
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    video.addEventListener('ended', finish, { once: true });
    video.addEventListener('error', finish, { once: true });

    const promise = video.play();
    if (promise !== undefined) {
      promise.catch((err) => {
        console.warn('Intro video autoplay prevented by browser policy:', err);
      });
    }

    return () => {
      clearTimeout(safety);
      if (video) {
        video.removeEventListener('ended', finish);
        video.removeEventListener('error', finish);
      }
      done = true;
    };
  }, [onFinished]);

  const handleSkip = () => {
    setFadingOut(true);
    setTimeout(() => onFinished(), 300);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#000314',
        opacity: fadingOut ? 0 : 1,
        transition: fadingOut ? 'opacity 0.4s ease-in-out' : 'none',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
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

      {/* Top Branding Bar */}
      <div
        style={{
          position: 'absolute',
          top: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <img
          src="/logo.png"
          alt="SK MISSION BOARD"
          style={{
            height: '40px',
            width: '40px',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(124, 59, 237, 0.4)',
          }}
        />
        <span
          style={{
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '18px',
            letterSpacing: '0.5px',
            fontFamily: 'sans-serif',
            textShadow: '0 2px 10px rgba(0,0,0,0.8)',
          }}
        >
          SK MISSION BOARD
        </span>
      </div>

      {/* Skip button for immediate entry */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          top: '28px',
          right: '20px',
          zIndex: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '20px',
          padding: '6px 16px',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s',
        }}
      >
        Skip
      </button>

      {/* Footer Branding */}
      <p
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          color: 'rgba(255,255,255,0.65)',
          fontSize: '11px',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
          margin: 0,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        by SK Academy
      </p>
    </div>
  );
}

