import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Auth/Login';
import { SignUp } from './components/Auth/SignUp';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { Dashboard } from './components/Dashboard';
import { MandiEntryForm } from './components/MandiEntryForm';
import { History } from './components/History';
import { Stats } from './components/Stats';
import { Profile } from './components/Profile';
import { PersonalDetails } from './components/PersonalDetails';
import { Preferences } from './components/Preferences';
import { BottomNav } from './components/BottomNav';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeContext';



// Persistent Layout that includes BottomNav
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const pages = ['/', '/add', '/history', '/stats', '/profile'];

function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased pb-24 md:pb-0 overflow-x-hidden">
      <main className="container mx-auto px-4 py-6 md:py-8 relative">
        <PageAnimateWrapper>
          <Outlet />
        </PageAnimateWrapper>
      </main>
      <BottomNav />
    </div>
  );
}

const pageVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    position: 'absolute' as const,
  }),
  animate: {
    x: 0,
    opacity: 1,
    position: 'relative' as const,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    position: 'absolute' as const,
  })
};



function PageAnimateWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  // We need to track the direction of navigation
  // simple way: compare indices

  // We need to store the previous index to determine direction
  // However, in a functional component, we can't easily get "previous" render value for this purpose 
  // without a ref or state that updates *after* render. 
  // Actually, useLocation().key changes on every navigate. 

  // Let's use a simpler approach: compare with a ref that holds the previous path
  const prevPathRef = React.useRef(location.pathname);


  // Update ref after determining direction (effectively for next render)
  // But strictly, we want the direction for *this* transition. 
  // If we update it in useEffect, it might be too late for the initial render of the new page?
  // Actually, we can just use the previous value from the ref *before* updating it.

  // Note: On mount, prevPathRef.current is initial path. 
  // On update, distinct path.

  // Better approach: State for direction might cause re-renders. 
  // Let's rely on the fact effectively we just need to know if we are going "forward" or "backward" in the list.

  const [directionState, setDirectionState] = React.useState(0);

  useEffect(() => {
    const prevIndex = pages.indexOf(prevPathRef.current);
    const currIndex = pages.indexOf(location.pathname);
    if (prevIndex !== -1 && currIndex !== -1 && prevIndex !== currIndex) {
      setDirectionState(currIndex > prevIndex ? 1 : -1);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]);


  // Touch handling
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const currIndex = pages.indexOf(location.pathname);
    if (currIndex === -1) return;

    if (isLeftSwipe && currIndex < pages.length - 1) {
      navigate(pages[currIndex + 1]);
    }
    if (isRightSwipe && currIndex > 0) {
      navigate(pages[currIndex - 1]);
    }
  };

  return (
    <div
      className="w-full relative min-h-[80vh]" // Ensure touch area exists
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence mode="popLayout" initial={false} custom={directionState}>
        <motion.div
          key={location.pathname}
          custom={directionState}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            x: { type: "tween", ease: [0.4, 0.0, 0.2, 1], duration: 0.3 }, // Standard material easing
            opacity: { duration: 0.25 }
          }}
          style={{ willChange: "transform, opacity" }} // Hardware acceleration hint
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/" replace /> : <SignUp />}
      />

      {/* Protected Routes with Persistent Layout */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<MandiEntryForm />} />
        <Route path="/edit/:id" element={<MandiEntryForm />} />
        <Route path="/history" element={<History />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/details" element={<PersonalDetails />} />
        <Route path="/profile/preferences" element={<Preferences />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppRoutes />
      </ThemeProvider>
    </BrowserRouter>
  );
}
