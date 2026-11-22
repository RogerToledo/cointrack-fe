import React from 'react';

type BadgeVariant = 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'primary';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const badgeStyles: Record<BadgeVariant, string> = {
  success: 'bg-success-light text-success-foreground border border-success/20',
  info: 'bg-accent-light text-accent border border-accent/20',
  primary: 'bg-primary-light text-primary border border-primary/20',
  warning: 'bg-warning-light text-warning border border-warning/20',
  danger: 'bg-danger-light text-danger border border-danger/20',
  neutral: 'bg-secondary text-muted border border-border',
};

const dotStyles: Record<BadgeVariant, string> = {
  success: 'bg-success',
  info: 'bg-accent',
  primary: 'bg-primary',
  warning: 'bg-warning',
  danger: 'bg-danger',
  neutral: 'bg-muted-light',
};

export function Badge({
  variant = 'neutral',
  dot = false,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${badgeStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />}
      {children}
    </span>
  );
}

export default Badge;
