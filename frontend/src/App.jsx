import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from './components/Toast';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import HeadDashboard from './pages/head/HeadDashboard';
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import EmployerDashboard from './pages/employer/EmployerDashboard';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const routes = {
    admin: '/admin',
    head: '/head',
    supervisor: '/supervisor',
    student: '/student',
    employer: '/employer',
  };
  return <Navigate to={routes[user.role] || '/login'} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col text-text-primary transition-colors duration-200">
            <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Role-Based Dashboards */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['head']} />}>
                <Route path="/head" element={<HeadDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['supervisor']} />}>
                <Route path="/supervisor" element={<SupervisorDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/student" element={<StudentDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['employer']} />}>
                <Route path="/employer" element={<EmployerDashboard />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="*" element={<HomeRedirect />} />
            </Routes>
          </main>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  </ThemeProvider>
  );
}
