import React from 'react';
import { Card } from './Card';

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-secondary ${className}`} />
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="border-b border-border bg-background/80 px-6 py-4 flex gap-6">
        {Array.from({ length: columns }).map((_, idx) => (
          <SkeletonBlock key={idx} className="h-4 flex-1 max-w-[120px]" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="px-6 py-4 flex items-center gap-6">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <SkeletonBlock
                key={colIdx}
                className={`h-4 flex-1 ${colIdx === columns - 1 ? 'max-w-[80px] ml-auto' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={idx}>
          <div className="flex items-start justify-between">
            <div className="space-y-2.5 flex-1">
              <SkeletonBlock className="h-3.5 w-24" />
              <SkeletonBlock className="h-7 w-32" />
              <SkeletonBlock className="h-3 w-28" />
            </div>
            <SkeletonBlock className="w-11 h-11 rounded-xl" />
          </div>
        </Card>
      ))}
    </div>
  );
}
