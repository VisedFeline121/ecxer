'use client';

import { useCallback, useState } from 'react';

export interface AppError {
  message: string;
  type: 'network' | 'api' | 'data' | 'general';
  timestamp: number;
  details?: any;
}

export function useErrorHandler() {
  const [error, setError] = useState<AppError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((error: any, type: AppError['type'] = 'general') => {
    console.error(`[${type.toUpperCase()}] Error:`, error);
    
    let message = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error?.message) {
      message = error.message;
    }

    // Handle specific error types
    if (type === 'network') {
      if (message.includes('Server might be down') || message.includes('service might be temporarily down')) {
        message = 'Unable to connect to our servers. The service might be temporarily down.';
      } else if (message.includes('fetch') || message.includes('Failed to fetch')) {
        message = 'Unable to connect to our servers. The service might be temporarily down.';
      } else if (message.includes('timeout')) {
        message = 'Request timed out. Please try again.';
      } else if (message.includes('connection')) {
        message = 'Connection lost. Please check your internet connection.';
      }
    } else if (type === 'api') {
      if (message.includes('rate limit') || message.includes('429')) {
        message = 'Too many requests. Please wait a moment and try again.';
      } else if (message.includes('401') || message.includes('403')) {
        message = 'Authentication failed. Please refresh the page.';
      } else if (message.includes('500')) {
        message = 'Server error. Please try again later.';
      }
    }

    setError({
      message,
      type,
      timestamp: Date.now(),
      details: error
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async (retryFn: () => Promise<any>) => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    clearError();
    
    try {
      await retryFn();
    } catch (err) {
      handleError(err, 'general');
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, clearError, handleError]);

  return {
    error,
    isRetrying,
    handleError,
    clearError,
    retry
  };
}

// Utility function to check if error is network related
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  const message = error.message || error.toString();
  return (
    message.includes('fetch') ||
    message.includes('Failed to fetch') ||
    message.includes('network') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    error.name === 'TypeError' ||
    error.name === 'NetworkError' ||
    error.name === 'AbortError'
  );
}

// Utility function to check if error is API related
export function isAPIError(error: any): boolean {
  if (!error) return false;
  
  const message = error.message || error.toString();
  return (
    message.includes('rate limit') ||
    message.includes('429') ||
    message.includes('401') ||
    message.includes('403') ||
    message.includes('500') ||
    message.includes('API')
  );
}
