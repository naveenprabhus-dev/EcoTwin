import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'info' | 'critical' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'success', className = '', ...props }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',
    info: 'bg-sky-50 text-sky-700 border border-sky-100',
    critical: 'bg-rose-50 text-rose-700 border border-rose-100',
    neutral: 'bg-gray-50 text-gray-600 border border-gray-100'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sans border tracking-tight ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
