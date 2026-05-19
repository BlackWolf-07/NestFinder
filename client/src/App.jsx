import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UIProvider from './components/UIProvider';
import ProtectedRoute from './components/ProtectedRoute';
import { Skeleton } from './components/UIElements';

const Home = lazy(() => import('./pages/Home'));
const Discover = lazy(() => import('./pages/Discover'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AddProperty = lazy(() => import('./pages/AddProperty'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Recommendations = lazy(() => import('./pages/Recommendations'));
const Bookings = lazy(() => import('./pages/Bookings'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen flex flex-col justify-center">
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-white/5 rounded-2xl w-1/4 mx-auto" />
      <div className="h-64 bg-white/5 rounded-[40px] w-full" />
      <div className="grid grid-cols-3 gap-6">
        <div className="h-40 bg-white/5 rounded-3xl" />
        <div className="h-40 bg-white/5 rounded-3xl" />
        <div className="h-40 bg-white/5 rounded-3xl" />
      </div>
    </div>
  </div>
);

const CursorGlow = memo(() => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    let frameId;
    const handleMouseMove = (e) => {
      frameId = window.requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div 
      className="cursor-glow hidden lg:block pointer-events-none fixed z-0" 
      style={{ 
        left: mousePos.x, 
        top: mousePos.y,
        opacity: mousePos.x === -100 ? 0 : 1,
        willChange: 'transform'
      }}
    />
  );
});

function App() {
  return (
    <UIProvider>
      <Router>
        <CursorGlow />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/host/add-property"
              element={
                <ProtectedRoute>
                  <AddProperty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </UIProvider>
  );
}

export default App;
