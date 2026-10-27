import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return (
    <div className={`bg-gray-100 animate-pulse rounded-md ${className}`} />
  );
};

export const TableRowSkeleton = ({ rows = 3 }) => {
  return (
    <div
      className="flex flex-col divide-y-2 divide-black bg-white border-2 border-black rounded-xl shadow-brut"
      role="status"
      aria-label="Loading study materials"
    >
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="py-4 px-4 sm:px-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-11 h-11 rounded-lg" />
            <div className="flex flex-col gap-2 flex-1 max-w-md">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="hidden sm:block h-7 w-20" />
        </div>
      ))}
    </div>
  );
};
