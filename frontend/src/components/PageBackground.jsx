import React from 'react';

// Atmospheric tints tailored for each stakeholder workflow - calibrated for vivid glassmorphic refraction
const AMBIENT_TINTS = {
  login: 'from-blue-600/25 via-indigo-500/18 to-transparent dark:from-blue-500/15 dark:via-indigo-900/10 dark:to-transparent',
  register: 'from-blue-600/28 via-sky-500/20 to-transparent dark:from-blue-500/20 dark:via-sky-900/15 dark:to-transparent',
  admin: 'from-blue-600/28 via-indigo-600/18 to-transparent dark:from-blue-500/20 dark:via-indigo-950/15 dark:to-transparent',
  head: 'from-sky-600/28 via-blue-500/18 to-transparent dark:from-sky-600/20 dark:via-blue-900/15 dark:to-transparent',
  supervisor: 'from-teal-600/28 via-emerald-500/18 to-transparent dark:from-teal-600/20 dark:via-emerald-900/15 dark:to-transparent',
  student: 'from-indigo-600/28 via-blue-500/18 to-transparent dark:from-indigo-600/20 dark:via-blue-900/15 dark:to-transparent',
  employer: 'from-sky-600/28 via-blue-600/18 to-transparent dark:from-sky-600/20 dark:via-blue-900/15 dark:to-transparent',
  default: 'from-blue-600/25 via-indigo-500/18 to-transparent dark:from-blue-500/15 dark:via-indigo-900/10 dark:to-transparent',
};

// UI Background image mapping based on stakeholder workflow
const UI_BACKGROUNDS = {
  register: '/backgrounds/register.jpg',       // High-tech deep blue network wallpaper
  student: '/backgrounds/student.jpg',         // Productivity desk workspace with laptop, notes, coffee
  employer: '/backgrounds/employer.jpg',       // Analytical corporate workspace with charts & reports
  admin: '/backgrounds/admin.jpg',             // 3D globe with connected cloud & user telemetry
  head: '/backgrounds/head.jpg',               // Faculty engineering PCB circuit traces & gradient
  supervisor: '/backgrounds/supervisor.jpg',   // Cyan/teal low-poly geometric network mesh
  default: '/backgrounds/default.jpg',
};

export default function PageBackground({
  variant = 'default',
  videoSrc = variant === 'login' ? '/backgrounds/853946-hd_1280_720_50fps.mp4' : null,
  videoPoster = variant === 'login' ? '/backgrounds/register.jpg' : null,
  imageSrc,
}) {
  const tint = AMBIENT_TINTS[variant] || AMBIENT_TINTS.default;
  const isVideo = variant === 'login' || Boolean(videoSrc);
  const resolvedImage = imageSrc || UI_BACKGROUNDS[variant] || UI_BACKGROUNDS.default;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* 1. Video Background (Login Screen) */}
      {isVideo && (
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={(el) => {
              if (el) el.muted = true;
            }}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={videoPoster || undefined}
            className="w-full h-full object-cover scale-105 filter brightness-[0.96] dark:brightness-[0.85] contrast-[1.05]"
          >
            <source src={videoSrc || '/backgrounds/853946-hd_1280_720_50fps.mp4'} type="video/mp4" />
          </video>
          {/* Calibrated glass backdrop scrim: rich and non-whitish in day mode, deep obsidian in night mode */}
          <div className="absolute inset-0 bg-slate-200/35 dark:bg-black/75 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#eef2f7]/80 via-transparent to-[#eef2f7]/45 dark:from-black/90 dark:via-transparent dark:to-black/60" />
        </div>
      )}

      {/* 2. High-Resolution Domain Background Image (Dashboards & Register) */}
      {!isVideo && resolvedImage && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={resolvedImage}
            alt=""
            className="w-full h-full object-cover scale-105 filter brightness-[0.98] dark:brightness-[0.65] contrast-[1.05] transition-all duration-700"
          />
          {/* Translucent theme scrim & backdrop frosting to blend seamlessly with scrolling UI */}
          <div className="absolute inset-0 bg-slate-200/30 dark:bg-slate-950/80 backdrop-blur-[2px]" />
          {/* Subtle directional vignette for soft edges, depth, and contrast without blinding white */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#eef2f7]/40 via-transparent to-[#e2e8f0]/70 dark:from-black/60 dark:via-transparent dark:to-black/90" />
        </div>
      )}

      {/* 3. Precision Engineering Grid Pattern */}
      <svg
        className="absolute inset-0 w-full h-full stroke-slate-900/[0.05] dark:stroke-white/[0.035] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_90%)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="arch-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M0 32V.5H32" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#arch-grid)" />
      </svg>

      {/* 4. Top Ambient Wash - Atmospheric color bloom for optical glass refraction */}
      <div
        className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[580px] rounded-full blur-[140px] bg-gradient-to-b ${tint} pointer-events-none`}
      />

      {/* 5. Bottom-Right Ambient Color Orb - Dynamic color glow as user scrolls down */}
      <div
        className="absolute -bottom-48 -right-32 w-[650px] h-[550px] rounded-full blur-[140px] bg-gradient-to-tl from-blue-500/20 via-sky-400/15 to-transparent dark:from-blue-600/10 dark:via-sky-900/10 dark:to-transparent pointer-events-none"
      />
    </div>
  );
}
