import React from 'react';
import logoImg from '../assets/logo.jpg';

export default function InterlinkLogo({ className = "w-9 h-9", alt = "Internship Management System Logo" }) {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-200/90 dark:border-white/20 transition-all duration-200 ${className}`}
    >
      <img
        src={logoImg}
        alt={alt}
        className="w-full h-full object-contain p-0.5 select-none pointer-events-none"
      />
    </div>
  );
}

