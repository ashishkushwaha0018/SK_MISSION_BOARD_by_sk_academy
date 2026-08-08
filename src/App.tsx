import type { ReactNode } from 'react';
import { useState, useCallback, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SplashScreen } from '@/components/SplashScreen';
import { InstallBanner } from '@/components/InstallBanner';

// Pages
import { Home } from '@/pages/Home';
import { Notes } from '@/pages/Notes';
import { Downloads } from '@/pages/Downloads';
import { Videos } from '@/pages/Videos';
import { About } from '@/pages/About';

// Show splash only once per browser session
const SPLASH_KEY = 'sk_splash_shown';

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/notes" component={Notes} />
        <Route path="/downloads" component={Downloads} />
        <Route path="/videos" component={Videos} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SPLASH_KEY) === '1';
    } catch {
      return false;
    }
  });

  const [fadeInStarted, setFadeInStarted] = useState(splashDone);

  const handleSplashFinished = useCallback(() => {
    try {
      sessionStorage.setItem(SPLASH_KEY, '1');
    } catch {
      // ignore
    }
    setSplashDone(true);
    setFadeInStarted(true);
  }, []);

  useEffect(() => {
    if (!splashDone) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [splashDone]);

  return (
    <TooltipProvider>
      {!splashDone && <SplashScreen onFinished={handleSplashFinished} />}
      <div
        aria-hidden={!splashDone}
        style={{
          visibility: splashDone ? 'visible' : 'hidden',
          opacity: fadeInStarted ? 1 : 0,
          transition: fadeInStarted && splashDone ? 'opacity 0.45s ease-in' : 'none',
          pointerEvents: splashDone ? 'auto' : 'none',
        }}
      >
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <InstallBanner />
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
