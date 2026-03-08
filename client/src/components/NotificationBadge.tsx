import React from 'react';

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({ count, className = '' }: NotificationBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > 99 ? '99+' : count;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-5 h-5 px-1.5 py-0.5
        bg-red-500 text-white text-xs font-bold rounded-full
        animate-pulse-badge
        shadow-lg
        ${className}
      `}
    >
      {displayCount}
    </span>
  );
}
