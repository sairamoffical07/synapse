import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return (
    <div className={`bg-[#182032] animate-pulse rounded-md ${className}`} />
  );
};

export const TableRowSkeleton = ({ rows = 3 }) => {
  return (
    <div className="flex flex-col divide-y divide-[#26334a]">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="py-3.5 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex flex-col gap-1.5 flex-1 max-w-md">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
};
