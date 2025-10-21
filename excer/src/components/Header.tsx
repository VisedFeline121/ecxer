'use client';

interface HeaderProps {
  marketTimer: string;
  lastUpdated: number;
  nextUpdate: number;
  refreshing: boolean;
  formatTimeAgo: (timestamp: number) => string;
  formatTimeToNext: (nextUpdateTime: number) => string;
}

export default function Header({ 
  marketTimer, 
  lastUpdated, 
  nextUpdate, 
  refreshing, 
  formatTimeAgo, 
  formatTimeToNext 
}: HeaderProps) {
  return (
    <header className="border-b border-gray-800 p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Excer</h1>
          <p className="text-gray-400 text-sm">Penny Stock Sentiment Tracker</p>
        </div>
        <div className="text-center flex-1 mx-12">
          <div className="text-sm text-white font-medium">{marketTimer}</div>
        </div>
        <div className="text-right">
          <div className="flex gap-6">
            <div>
              <div className="text-sm text-gray-400">Last updated</div>
              <div className="text-sm text-white">{formatTimeAgo(lastUpdated)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Time to next update</div>
              <div className="text-sm text-white flex items-center gap-1">
                {refreshing && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                {formatTimeToNext(nextUpdate)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
