import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import UIProvider from './components/UIProvider';
import ProtectedRoute from './components/ProtectedRoute';
import { Skeleton } from './components/UIElements';

const Home = lazy(() => import('./pages/Home'));
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
  <div className="p-8 max-w-7xl mx-auto space-y-8">
    <Skeleton className="h-64 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
    </div>
  </div>
);

function App() {
  return (
    <UIProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
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
