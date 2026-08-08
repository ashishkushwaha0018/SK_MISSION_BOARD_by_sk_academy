import { createRoot } from 'react-dom/client';

import App from './App';

import './index.css';

// Register service worker for PWA support with auto-update
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        reg.update();
      })
      .catch(() => {
        // SW registration failed silently — app still works normally
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
