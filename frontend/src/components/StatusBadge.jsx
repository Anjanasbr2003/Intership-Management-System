import React from 'react';

export default function StatusBadge({ status, size = 'md' }) {
  const normalized = (status || 'pending').toLowerCase();

  const configs = {
    active: {
      bg: 'badge-success',
      label: 'Active',
      dot: 'bg-success',
    },
    approved: {
      bg: 'badge-success',
      label: 'Approved',
      dot: 'bg-success',
    },
    verified: {
      bg: 'badge-success',
      label: 'Verified',
      dot: 'bg-success',
    },
    pending: {
      bg: 'badge-warning',
      label: 'Pending',
      dot: 'bg-warning',
    },
    submitted: {
      bg: 'badge-warning',
      label: 'Submitted',
      dot: 'bg-warning',
    },
    interviewing: {
      bg: 'badge-info',
      label: 'Interviewing',
      dot: 'bg-info',
    },
    shortlisted: {
      bg: 'badge-primary',
      label: 'Shortlisted',
      dot: 'bg-primary',
    },
    offered: {
      bg: 'badge-success',
      label: 'Offered',
      dot: 'bg-success',
    },
    rejected: {
      bg: 'badge-error',
      label: 'Rejected',
      dot: 'bg-error',
    },
    open: {
      bg: 'badge-info',
      label: 'Open',
      dot: 'bg-info',
    },
    closed: {
      bg: 'bg-secondary text-text-secondary border-border-subtle',
      label: 'Closed',
      dot: 'bg-text-muted',
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

