import React from 'react';
import { Card } from './Card';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  iconBg?: 'secondary' | 'success' | 'accent';
}

const iconBgStyles = {
  secondary: 'bg-secondary text-muted',
  success: 'bg-success-light text-success',
  accent: 'bg-accent-light text-accent',
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  iconBg = 'accent',
}: EmptyStateProps) {
  return (
    <Card padding="lg" className="text-center py-14">
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${iconBgStyles[iconBg]}`}
      >
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </Card>
  );
}

export default EmptyState;
