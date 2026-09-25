import React from 'react';

export default function StatusBadge({ status, size = 'md' }) {
  const normalized = (status || 'pending').toLowerCase();

  const configs = {
    active: {
      bg: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/25 dark:border-emerald-500/30',
      label: 'Active',
      dot: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]',
    },
    approved: {
      bg: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/25 dark:border-emerald-500/30',
      label: 'Approved',
      dot: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]',
    },
    verified: {
      bg: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/25 dark:border-emerald-500/30',
      label: 'Verified',
      dot: 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]',
    },
    pending: {
      bg: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/25 dark:border-amber-500/30',
      label: 'Pending',
      dot: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]',
    },
    submitted: {
      bg: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/25 dark:border-amber-500/30',
      label: 'Submitted',
      dot: 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]',
    },
    interviewing: {
      bg: 'bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/25 dark:border-blue-500/30',
      label: 'Interviewing',
      dot: 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]',
    },
    shortlisted: {
      bg: 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-500/25 dark:border-indigo-500/30',
      label: 'Shortlisted',
      dot: 'bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]',
    },
    offered: {
      bg: 'bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/25 dark:border-teal-500/30',
      label: 'Offered',
      dot: 'bg-teal-500 shadow-[0_0_6px_rgba(20,184,166,0.6)]',
    },
    rejected: {
      bg: 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/25 dark:border-rose-500/30',
      label: 'Rejected',
      dot: 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]',
    },
    open: {
      bg: 'bg-sky-500/10 text-sky-800 dark:text-sky-300 border-sky-500/25 dark:border-sky-500/30',
      label: 'Open',
      dot: 'bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.6)]',
    },
    closed: {
      bg: 'bg-slate-500/10 text-slate-700 dark:text-neutral-300 border-slate-500/20 dark:border-white/10',
      label: 'Closed',
      dot: 'bg-slate-400 dark:bg-neutral-500',
    },
  };

  const config = configs[normalized] || configs.pending;
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border backdrop-blur-md transition-all ${config.bg} ${sizeClasses}`}>
      <span className={`inline-block rounded-full h-1.5 w-1.5 shrink-0 ${config.dot}`} />
      <span className="tracking-tight">{config.label}</span>
    </span>
  );
}

