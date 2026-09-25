import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, GraduationCap, Building2, ShieldCheck, UserCheck, Briefcase, User, Sun, Moon } from 'lucide-react';
import StatusBadge from './StatusBadge';
import InterlinkLogo from './InterlinkLogo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-text-secondary" />;
      case 'head':
        return <Building2 className="w-4 h-4 text-primary" />;
      case 'supervisor':
        return <UserCheck className="w-4 h-4 text-success" />;
      case 'student':
        return <GraduationCap className="w-4 h-4 text-primary" />;
      case 'employer':
        return <Briefcase className="w-4 h-4 text-warning" />;
      default:
        return <User className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin': return '/admin';
      case 'head': return '/head';
      case 'supervisor': return '/supervisor';
      case 'student': return '/student';
      case 'employer': return '/employer';
      default: return '/';
    }
  };

  return (
    <header className="sticky top-3 z-40 px-3 sm:px-6 lg:px-8 pointer-events-none transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="card-elevated shadow-lg pointer-events-auto rounded-2xl sm:rounded-full px-4 sm:px-6 h-16 flex justify-between items-center transition-all duration-300">
          {/* Brand Mark & Title */}
          <Link to={user ? getDashboardPath(user.role) : '/'} className="flex items-center gap-3 group transition-transform active:scale-95">
            <InterlinkLogo className="w-9 h-9 transition-transform duration-200 group-hover:scale-105" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-text-primary transition-colors">
                  Internship Management System
                </span>
              </div>
              <p className="text-[11px] text-text-muted font-medium tracking-tight">University Internship & Placement Platform</p>
            </div>
          </Link>

          {/* Controls: Tactile Theme Switch & User Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Tactile Pill Theme Toggle Switch: Pure Apple Minimal Toggle */}
            <button
              onClick={toggleTheme}
              type="button"
              role="switch"
              aria-checked={isDark}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="transition-transform active:scale-95 p-1 rounded-full card shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 cursor-pointer"
            >
              {/* Physical Pill Switch Track with Sliding Knob */}
              <div
                className={`relative inline-flex h-6 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors duration-300 ${
                  isDark
                    ? 'bg-surface-elevated border border-border-strong'
                    : 'bg-surface-elevated border border-border-strong'
                }`}
              >
                {/* Sun Icon Track Ambient */}
                <span className="absolute left-1.5 flex items-center justify-center text-amber-500/70 pointer-events-none">
                  <Sun className="w-3 h-3" />
                </span>
                {/* Moon Icon Track Ambient */}
                <span className="absolute right-1.5 flex items-center justify-center text-indigo-400/70 pointer-events-none">
                  <Moon className="w-3 h-3" />
                </span>

                {/* Sliding Tactile Knob */}
                <span
                  className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition-transform duration-300 ease-apple ${
                    isDark
                      ? 'translate-x-6 bg-primary text-primary-foreground border-transparent'
                      : 'translate-x-0 bg-primary text-primary-foreground border-transparent'
                  }`}
                >
                  {isDark ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                </span>
              </div>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 bg-secondary text-text-secondary border border-border-subtle rounded-full px-3 py-1">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-white/90 dark:bg-white/10 flex items-center justify-center shadow-xs border border-white/30 dark:border-white/10 shrink-0">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      getRoleIcon(user.role)
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-text-primary leading-tight">{user.name}</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-text-muted capitalize">{user.role}</span>
                      <span className="text-border">•</span>
                      <StatusBadge status={user.status} size="sm" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="transition-transform active:scale-95 flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-error px-3 py-2 rounded-full hover:bg-error-background border border-transparent transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="transition-transform active:scale-95 text-xs font-semibold text-text-secondary hover:text-text-primary px-3.5 py-1.5 rounded-full hover:bg-surface-hover transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs font-semibold px-4 py-1.5 rounded-full"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

