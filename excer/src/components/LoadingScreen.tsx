'use client';

import { ChartSkeleton, DiscussionCardSkeleton, PriceDisplaySkeleton, StatsCardSkeleton, StockCardSkeleton } from './SkeletonLoader';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Skeleton */}
      <header className="border-b border-gray-800 p-6 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-700 rounded animate-pulse" />
            <div>
              <div className="w-20 h-6 bg-gray-700 rounded animate-pulse mb-2" />
              <div className="w-32 h-4 bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="text-center flex-1 mx-12">
            <div className="inline-flex items-center gap-3 bg-gray-700 rounded-xl px-6 py-3 animate-pulse">
              <div className="w-5 h-5 bg-gray-600 rounded" />
              <div className="w-4 h-4 bg-gray-600 rounded" />
              <div className="w-48 h-4 bg-gray-600 rounded" />
            </div>
          </div>
          <div className="text-right">
            <div className="flex gap-6">
              <div className="bg-gray-700 rounded-lg px-4 py-2 animate-pulse">
                <div className="w-16 h-3 bg-gray-600 rounded mb-1" />
                <div className="w-12 h-3 bg-gray-600 rounded" />
              </div>
              <div className="bg-gray-700 rounded-lg px-4 py-2 animate-pulse">
                <div className="w-20 h-3 bg-gray-600 rounded mb-1" />
                <div className="w-16 h-3 bg-gray-600 rounded" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Mobile Button Skeleton */}
        <div className="lg:hidden mb-4">
          <div className="w-48 h-10 bg-gray-700 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Left Panel - Trending Stocks Skeleton */}
          <div className="hidden lg:flex lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 w-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-700 rounded animate-pulse" />
                  <div className="w-32 h-6 bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="w-20 h-8 bg-gray-700 rounded animate-pulse" />
                  <div className="w-8 h-8 bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <StockCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Stock Details Skeleton */}
          <div className="col-span-1 lg:col-span-2 flex">
            <div className="bg-gray-800 rounded-lg p-6 w-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="w-24 h-8 bg-gray-700 rounded animate-pulse" />
                <div className="text-right">
                  <div className="w-20 h-4 bg-gray-700 rounded animate-pulse mb-1" />
                  <div className="w-16 h-6 bg-gray-700 rounded animate-pulse" />
                </div>
              </div>

              {/* Price Display Skeleton */}
              <div className="mb-4">
                <PriceDisplaySkeleton />
              </div>

              {/* Chart Skeleton */}
              <div className="mb-6">
                <ChartSkeleton />
              </div>

              {/* Stats Cards Skeleton */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </div>

              {/* Discussions Skeleton */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-40 h-6 bg-gray-700 rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="w-24 h-8 bg-gray-700 rounded animate-pulse" />
                    <div className="w-8 h-8 bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
                <div className="space-y-3" style={{ height: '1200px' }}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <DiscussionCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
