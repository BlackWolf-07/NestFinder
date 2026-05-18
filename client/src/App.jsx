import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddProperty from './pages/AddProperty';
import PropertyDetails from './pages/PropertyDetails';
import NotFound from './pages/NotFound';

import Recommendations from './pages/Recommendations';
import Bookings from './pages/Bookings';
import PropertyDetails from './pages/PropertyDetails';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
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
...
          <Route path="/register" element={<Register />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />

          <Route 
            path="/dashboard" 
            element={
...
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-property" 
            element={
              <ProtectedRoute roles={['owner', 'admin']}>
                <AddProperty />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
