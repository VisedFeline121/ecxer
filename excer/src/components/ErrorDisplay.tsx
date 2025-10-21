'use client';

import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  type?: 'network' | 'api' | 'data' | 'general';
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function ErrorDisplay({ 
  error, 
  type = 'general', 
  onRetry, 
  showRetry = true 
}: ErrorDisplayProps) {
  const getIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff className="w-8 h-8 text-red-400" />;
      case 'api':
        return <AlertTriangle className="w-8 h-8 text-yellow-400" />;
      case 'data':
        return <AlertTriangle className="w-8 h-8 text-orange-400" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-red-400" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'network':
        return 'Connection Error';
      case 'api':
        return 'Service Temporarily Unavailable';
      case 'data':
        return 'Data Error';
      default:
        return 'Something went wrong';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'network':
        return 'Our servers might be temporarily down. Please try again in a moment.';
      case 'api':
        return 'Our data services are temporarily unavailable. Please try again in a moment.';
      case 'data':
        return 'There was an issue processing the data. Please refresh to try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            {getTitle()}
          </h3>
          <p className="text-gray-400 mb-4">
            {getDescription()}
          </p>
          {error && (
            <p className="text-sm text-gray-500 mb-4">
              Error: {error}
            </p>
          )}
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
