import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import MyEventsPage from './pages/MyEventsPage';
import EventsManagementPage from './pages/admin/EventsManagementPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './styles/Auth.css';
import './i18n';

// Helper to check authentication
const isAuthenticated = () => !!localStorage.getItem('token');

// Helper to check if user has admin permission (example check)
const hasAdminPermission = () => {
  const roles = localStorage.getItem('roles');
  if (!roles) return false;
  try {
    const parsedRoles = JSON.parse(roles);
    return parsedRoles[0].includes('admin');
  } catch {
    return false;
  }
};

// PrivateRoute component
function PrivateRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// AdminRoute component
function AdminRoute({ children }: { children: ReactNode }) {
    const location = useLocation();
    if (!isAuthenticated()) {
      // If not authenticated, redirect to login
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (!hasAdminPermission()) {
      // If authenticated but not admin, redirect to home or a "forbidden" page
      message.warning('Access Denied: Admin permission required.'); // Optional feedback
      return <Navigate to="/" replace />;
    }
    // If authenticated and has admin permission, render the child component
    return children;
}

function App() {
  return (
    <Router>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private Routes (Alumni & Admin) */}
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/events" element={<PrivateRoute><EventsPage /></PrivateRoute>} />
            <Route path="/events/:id" element={<PrivateRoute><EventDetailPage /></PrivateRoute>} />
            <Route path="/my-events" element={<PrivateRoute><MyEventsPage /></PrivateRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/events" element={
              <AdminRoute>
                <EventsManagementPage />
              </AdminRoute>
            } />

            {/* Redirect unknown authenticated routes to home, unauthenticated to login */}
             <Route path="*" element={isAuthenticated() ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
