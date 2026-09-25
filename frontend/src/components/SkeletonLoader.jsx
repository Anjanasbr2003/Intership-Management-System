import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 1, className = '' }) {
  const renderSkeleton = (index) => {
    switch (type) {
      case 'card':
        return (
          <div key={index} className={`card p-5 rounded-2xl space-y-4 animate-pulse ${className}`}>
            <div className="h-6 bg-white/40 dark:bg-white/10 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-white/40 dark:bg-white/10 rounded w-3/4"></div>
              <div className="h-4 bg-white/40 dark:bg-white/10 rounded w-1/2"></div>
            </div>
            <div className="flex justify-between pt-4">
              <div className="h-8 bg-white/40 dark:bg-white/10 rounded-full w-24"></div>
              <div className="h-8 bg-white/40 dark:bg-white/10 rounded-full w-24"></div>
            </div>
          </div>
        );
      case 'list':
        return (
          <div key={index} className={`card-elevated p-6 p-4 rounded-xl flex items-center gap-4 animate-pulse ${className}`}>
            <div className="w-12 h-12 rounded-full bg-white/40 dark:bg-white/10 shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-white/40 dark:bg-white/10 rounded w-1/4"></div>
              <div className="h-4 bg-white/40 dark:bg-white/10 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-white/40 dark:bg-white/10 rounded-full w-20"></div>
          </div>
        );
      case 'metric':
        return (
          <div key={index} className={`card p-4 rounded-2xl text-center animate-pulse ${className}`}>
            <div className="h-3 bg-white/40 dark:bg-white/10 rounded w-1/2 mx-auto mb-3"></div>
            <div className="h-8 bg-white/40 dark:bg-white/10 rounded w-2/3 mx-auto"></div>
          </div>
        );
      default:
        return (
          <div key={index} className={`h-10 bg-white/40 dark:bg-white/10 rounded animate-pulse ${className}`}></div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => renderSkeleton(idx))}
    </>
  );
}
