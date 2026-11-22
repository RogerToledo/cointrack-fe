import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-card rounded-2xl border border-border shadow-[var(--shadow-xs)] ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
