import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router';
import { MotionConfig } from 'motion/react';
import { JourneyProvider } from '@/hooks/useJourney';
import { ToastProvider } from '@/components/ui/Toast';
import { Footer, Navbar, StickyCTA } from '@/components/layout/Layout';
import { DemoBar } from '@/components/layout/DemoBar';
import { RegisterModal } from '@/components/growth/RegisterModal';
import Home from '@/pages/Home';
import { captureAttribution } from '@/lib/attribution';
import { track } from '@/lib/analytics';

// Everything except the landing page loads on demand — first paint stays light on mobile data.
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Admin = lazy(() => import('@/pages/Admin'));
const ReferralLanding = lazy(() => import('@/pages/Routes').then((m) => ({ default: m.ReferralLanding })));
const SharedProject = lazy(() => import('@/pages/Routes').then((m) => ({ default: m.SharedProject })));
const Privacy = lazy(() => import('@/pages/Routes').then((m) => ({ default: m.Privacy })));
const NotFound = lazy(() => import('@/pages/Routes').then((m) => ({ default: m.NotFound })));
const QRPage = lazy(() => import('@/pages/Tools').then((m) => ({ default: m.QRPage })));
const OgPage = lazy(() => import('@/pages/Tools').then((m) => ({ default: m.OgPage })));
const Deck = lazy(() => import('@/pages/Deck'));
const PackPage = lazy(() => import('@/pages/Tools').then((m) => ({ default: m.PackPage })));

function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    captureAttribution();
    if (!pathname.startsWith('/r/') && pathname !== '/og') track('page_view', { path: pathname });
    if (!window.location.hash) window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function Shell() {
  const { pathname } = useLocation();
  const bare = pathname === '/og';
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-btn focus:bg-ink focus:px-4 focus:py-3 focus:text-dark-text">
        Skip to content
      </a>
      <RouteEffects />
      {!bare && <Navbar />}
      <main id="main">
        <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/me" element={<Dashboard />} />
          <Route path="/r/:code" element={<ReferralLanding />} />
          <Route path="/p/:id" element={<SharedProject />} />
          <Route path="/pack" element={<PackPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/qr" element={<QRPage />} />
          <Route path="/deck" element={<Deck />} />
          <Route path="/og" element={<OgPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      {!bare && <Footer />}
      {pathname === '/' && <StickyCTA />}
      <RegisterModal />
      <DemoBar />
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ToastProvider>
          <JourneyProvider>
            <Shell />
          </JourneyProvider>
        </ToastProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}
