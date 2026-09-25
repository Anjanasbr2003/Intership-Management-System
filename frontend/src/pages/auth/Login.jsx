import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import { toast } from '../../components/Toast';
import PageBackground from '../../components/PageBackground';
import InterlinkLogo from '../../components/InterlinkLogo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      toast.success('Welcome back to Internship Management System');
      const routes = {
        admin: '/admin',
        head: '/head',
        supervisor: '/supervisor',
        student: '/student',
        employer: '/employer',
      };
      navigate(routes[loggedUser?.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or login failed');
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <PageBackground
        variant="login"
        videoSrc="/backgrounds/853946-hd_1280_720_50fps.mp4"
        videoPoster="/backgrounds/register.jpg"
      />

      {/* Hero Header */}
      <div className="relative z-10 max-w-xl mx-auto text-center mb-7 animate-applePageEnter flex flex-col items-center">
        <InterlinkLogo className="w-12 h-12 mb-3" />
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
          Internship Management System
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-text-muted font-medium max-w-md leading-relaxed">
          National undergraduate internship placement and institutional governance platform.
        </p>
      </div>

      {/* Login Card with Reference-Grade Frosted Glass */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md animate-applePageEnter">
        <div className="card-elevated p-6 py-8 px-6 sm:px-8 rounded-2xl shadow-card-elevated shadow-lg relative">
          {error && (
            <div className="mb-4 badge-error px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Email or Student / Staff ID
              </label>
              <input
                type="text"
                name="identifier"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Institutional email, personal email, or Reg No"
                className="input-field w-full h-11 px-3.5 rounded-xl text-sm font-medium placeholder:text-text-disabled dark:placeholder:text-text-muted text-text-primary"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-text-secondary">
                  Password
                </label>
              </div>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field w-full h-11 px-3.5 rounded-xl text-sm font-medium placeholder:text-text-disabled dark:placeholder:text-text-muted text-text-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 mt-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border-subtle text-center text-xs text-text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}