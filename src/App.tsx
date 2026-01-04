import { useEffect } from 'react';
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

function PageAnimateWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 20, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -20, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full flex-shrink-0"
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_e, { offset }) => {
          const swipeThreshold = 50;
          const currentIndex = pages.indexOf(location.pathname);

          if (currentIndex === -1) return;

          if (offset.x > swipeThreshold && currentIndex > 0) {
            // Swipe Right -> Go to previous page
            navigate(pages[currentIndex - 1]);
          } else if (offset.x < -swipeThreshold && currentIndex < pages.length - 1) {
            // Swipe Left -> Go to next page
            navigate(pages[currentIndex + 1]);
          }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
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
