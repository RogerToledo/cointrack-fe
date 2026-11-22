import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2.5">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
