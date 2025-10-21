'use client';

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: boolean;
}

export function Skeleton({ className = '', height = 'h-4', width = 'w-full', rounded = true }: SkeletonProps) {
  return (
    <div 
      className={`bg-gray-700 animate-pulse ${height} ${width} ${rounded ? 'rounded' : ''} ${className}`}
    />
  );
}

export function StockCardSkeleton() {
  return (
    <div className="p-4 rounded-lg bg-gray-700 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <Skeleton width="w-16" height="h-6" />
        <div className="flex items-center gap-2">
          <Skeleton width="w-4" height="h-4" rounded />
          <Skeleton width="w-12" height="h-4" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton width="w-4" height="h-4" rounded />
          <Skeleton width="w-16" height="h-4" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width="w-4" height="h-4" rounded />
          <Skeleton width="w-20" height="h-4" />
        </div>
      </div>
    </div>
  );
}

export function DiscussionCardSkeleton() {
  return (
    <div className="bg-gray-700 rounded-lg p-4 animate-pulse">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <Skeleton height="h-4" className="mb-2" />
          <Skeleton height="h-4" width="w-3/4" />
        </div>
        <Skeleton width="w-8" height="h-4" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton width="w-20" height="h-3" />
        <Skeleton width="w-24" height="h-3" />
      </div>
    </div>
  );
}

export function PriceDisplaySkeleton() {
  return (
    <div className="bg-gray-700 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton width="w-24" height="h-4" className="mb-2" />
          <div className="flex items-center">
            <Skeleton width="w-6" height="h-6" rounded className="mr-3" />
            <Skeleton width="w-20" height="h-8" />
          </div>
          <Skeleton width="w-16" height="h-4" className="mt-2" />
        </div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-gray-700 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <Skeleton width="w-24" height="h-6" />
        <div className="flex gap-2">
          <Skeleton width="w-12" height="h-6" rounded />
          <Skeleton width="w-16" height="h-6" rounded />
        </div>
      </div>
      <div className="w-full h-96 bg-gray-600 rounded flex items-center justify-center">
        <Skeleton width="w-32" height="h-8" />
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-gray-700 rounded-lg p-4 text-center animate-pulse">
      <Skeleton width="w-12" height="h-8" className="mx-auto mb-2" />
      <Skeleton width="w-20" height="h-4" className="mx-auto" />
    </div>
  );
}
