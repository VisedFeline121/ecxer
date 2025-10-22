'use client';

import { Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import ErrorDisplay from '../components/ErrorDisplay';
import Footer from '../components/Footer';
import Header from '../components/Header';
import LoadingScreen from '../components/LoadingScreen';
import MobileTrendingStocks from '../components/MobileTrendingStocks';
import StockDetails from '../components/StockDetails';
import TrendingStocks from '../components/TrendingStocks';
import { isAPIError, isNetworkError, useErrorHandler } from '../hooks/useErrorHandler';
import { ChartType, DiscussionSortBy, SortBy, SortOrder, StockData, StockPrice } from '../types';

export default function Home() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const { error, handleError, clearError, retry } = useErrorHandler();
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [nextUpdate, setNextUpdate] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [marketTimer, setMarketTimer] = useState<string>('Calculating...');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [stockPrice, setStockPrice] = useState<StockPrice | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('posts');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [discussionSortBy, setDiscussionSortBy] = useState<DiscussionSortBy>('date');
  const [discussionSortOrder, setDiscussionSortOrder] = useState<SortOrder>('desc');
  const [showDiscussionSortMenu, setShowDiscussionSortMenu] = useState(false);
  const [showMobileTrendingStocks, setShowMobileTrendingStocks] = useState(false);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    fetchStocks();

    // Set up SSE connection to get notified when worker updates data
    let eventSource = new EventSource('/api/updates');
    
    eventSource.onmessage = (event) => {
      console.log('[SSE] Event received:', event.data);
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Parsed data:', data);
        if (data.type === 'update') {
          console.log('[Worker] Finished, fetching new data...');
          fetchStocks(true);
        } else if (data.type === 'connected') {
          console.log('[SSE] Connection established');
        } else if (data.type === 'keepalive') {
          console.log('[SSE] Keep-alive received');
        } else {
          console.log('[SSE] Unknown event type:', data.type);
        }
      } catch (error) {
        console.error('[SSE] Error parsing event data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      handleError('Real-time updates connection lost. Server might be down.', 'network');
      
      // Try to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect SSE...');
        eventSource.close();
        
        // Create new connection with all handlers
        const newEventSource = new EventSource('/api/updates');
        newEventSource.onmessage = eventSource.onmessage;  // Copy over the message handler
        newEventSource.onerror = eventSource.onerror;      // Copy over the error handler
        eventSource = newEventSource;
      }, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSortMenu) {
        setShowSortMenu(false);
      }
      if (showDiscussionSortMenu) {
        setShowDiscussionSortMenu(false);
      }
    };

    if (showSortMenu || showDiscussionSortMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSortMenu, showDiscussionSortMenu]);

  // Set next update time once when data loads, then just count down
  useEffect(() => {
    if (lastUpdated > 0) {
      const nextUpdateTime = lastUpdated + (15 * 60 * 1000); // 15 minutes from last update
      setNextUpdate(nextUpdateTime);
    }
  }, [lastUpdated]);

  // Simple timer that updates every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      setMarketTimer(formatMarketTimer());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Load TradingView script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      // Script loaded, charts will be initialized when selectedStock changes
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // Initialize TradingView chart when selectedStock changes
  useEffect(() => {
    if (selectedStock && (window as any).TradingView) {
      const containerId = `tradingview_${selectedStock.symbol}`;
      
      // Remove existing widget if it exists
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }

      // Create new widget with fallback exchanges
      const exchanges = ['', 'NASDAQ:', 'NYSE:', 'AMEX:', 'OTC:'];
      let widgetCreated = false;
      
      for (const exchange of exchanges) {
        try {
          const symbol = exchange ? `${exchange}${selectedStock.symbol}` : selectedStock.symbol;
          console.log(`Trying TradingView symbol: ${symbol}`);
          
          widgetRef.current = new (window as any).TradingView.widget({
            container_id: containerId,
            width: '100%',
            height: 400,
            symbol: symbol,
            interval: 'D',
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: chartType === 'area' ? 3 : 1, // 3 for area, 1 for candlesticks
            locale: 'en',
            enable_publishing: false,
            allow_symbol_change: true,
            hide_top_toolbar: false,
            hide_side_toolbar: true,
            details: true, // Show price details
            studies: [],
            show_popup_button: true,
            popup_width: '1000',
            popup_height: '650',
          });
          
          widgetCreated = true;
          console.log(`Successfully created TradingView widget for ${symbol}`);
          break;
        } catch (error) {
          console.log(`Failed to create widget for ${exchange}${selectedStock.symbol}:`, error);
          continue;
        }
      }
      
      if (!widgetCreated) {
        console.error(`Failed to create TradingView widget for ${selectedStock.symbol} on any exchange`);
      }
    }
  }, [selectedStock, chartType]);

  // Fetch stock price when selectedStock changes
  useEffect(() => {
    if (selectedStock) {
      fetchStockPrice(selectedStock.symbol);
    }
  }, [selectedStock]);

  const fetchStockPrice = async (symbol: string) => {
    setPriceLoading(true);
    try {
      console.log(`Fetching real price data for ${symbol}...`);
      const response = await fetch(`/api/price?symbol=${symbol}`);
      const data = await response.json();
      
      if (response.ok && !data.error) {
        console.log(`Real price data received for ${symbol}:`, data);
        setStockPrice({
          price: data.price,
          change: data.change,
          changePercent: data.changePercent
        });
      } else {
        console.log(`No price data found for ${symbol}:`, data);
        setStockPrice({
          price: 'N/A',
          change: 'N/A',
          changePercent: 'N/A'
        });
      }
    } catch (error) {
      console.error('Error fetching stock price:', error);
      setStockPrice({
        price: 'Error',
        change: 'N/A',
        changePercent: 'N/A'
      });
    } finally {
      setPriceLoading(false);
    }
  };

  const fetchStocks = async (isAutoRefresh = false) => {
    try {
      if (isAutoRefresh) {
        console.log('[Refresh] Starting auto-refresh...');
        setRefreshing(true);
      }
      
      // Clear any previous errors
      clearError();
      
      // Add cache-busting parameter to prevent caching
      console.log('[API] Fetching data...');
      const response = await fetch('/api/reddit?_=' + Date.now());
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format received from server');
      }
      
      console.log('[API] Received data:', {
        stocksCount: data.stocks?.length || 0,
        lastUpdated: new Date(data.lastUpdated).toISOString(),
        currentLastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : 'none',
        firstStock: data.stocks?.[0]?.symbol,
        dataSource: data.dataSource
      });
      
      // Validate and sanitize data
      const newStocks = Array.isArray(data.stocks) ? data.stocks.filter(stock => 
        stock && 
        typeof stock.symbol === 'string' && 
        stock.symbol.length > 0 &&
        Array.isArray(stock.posts)
      ) : [];
      
      setStocks(newStocks);
      setLastUpdated(typeof data.lastUpdated === 'number' ? data.lastUpdated : Date.now());
      
      // Update selected stock with fresh data (with validation)
      if (selectedStock && newStocks.length > 0) {
        const updatedStock = newStocks.find((s: StockData) => s.symbol === selectedStock.symbol);
        if (updatedStock) {
          setSelectedStock(updatedStock);
        }
      } else if (newStocks.length > 0) {
        // Validate first stock before selecting
        const firstStock = newStocks[0];
        if (firstStock && firstStock.symbol) {
          setSelectedStock(firstStock);
        }
      }
      
      if (isAutoRefresh) {
        console.log('Auto-refresh completed successfully');
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
      
      // Determine error type and handle appropriately
      if (isNetworkError(error)) {
        handleError(error, 'network');
      } else if (isAPIError(error)) {
        handleError(error, 'api');
      } else {
        handleError(error, 'data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatTimeToNext = (nextUpdateTime: number) => {
    if (!nextUpdateTime || nextUpdateTime === 0) {
      return 'Calculating...';
    }
    const diff = nextUpdateTime - currentTime;
    
    // If we're past the update time but not by much (within 30 seconds), show updating
    if (diff <= 0 && diff > -30000) return 'Updating...';
    
    // If we're way past the update time, recalculate
    if (diff <= -30000) return 'Calculating...';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getNextMarketTime = () => {
    // Get current time in NY timezone
    const now = new Date();
    
    // Get NY time components using Intl.DateTimeFormat
    const nyFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const nyParts = nyFormatter.formatToParts(now);
    const nyDate = {
      year: parseInt(nyParts.find(p => p.type === 'year')?.value || '0'),
      month: parseInt(nyParts.find(p => p.type === 'month')?.value || '0'),
      day: parseInt(nyParts.find(p => p.type === 'day')?.value || '0'),
      hour: parseInt(nyParts.find(p => p.type === 'hour')?.value || '0'),
      minute: parseInt(nyParts.find(p => p.type === 'minute')?.value || '0'),
      second: parseInt(nyParts.find(p => p.type === 'second')?.value || '0')
    };

    // Calculate what day of week it is in NY
    const nyDayOfWeek = new Date(nyDate.year, nyDate.month - 1, nyDate.day).getDay();

    // Check if it's a weekday (Monday = 1, Friday = 5)
    const isWeekday = nyDayOfWeek >= 1 && nyDayOfWeek <= 5;

    // Check if market is currently open (9:30 AM - 4:00 PM ET on weekdays)
    const isMarketOpen = isWeekday && 
      ((nyDate.hour > 9) || (nyDate.hour === 9 && nyDate.minute >= 30)) &&
      ((nyDate.hour < 16) || (nyDate.hour === 16 && nyDate.minute === 0));

    if (isMarketOpen) {
      // Market is open, show time until close (4:00 PM ET)
      const targetUTC = new Date(Date.UTC(
        nyDate.year,
        nyDate.month - 1,
        nyDate.day,
        20, // 4:00 PM ET = 20:00 UTC (during EDT)
        0
      ));
      
      return { time: targetUTC.getTime(), isOpening: false };
    } else {
      // Market is closed, show time until next open (9:30 AM ET)
      let targetYear = nyDate.year;
      let targetMonth = nyDate.month;
      let targetDay = nyDate.day;
      
      // If we're past 4:00 PM today or it's weekend, move to next trading day
      if (nyDate.hour >= 16 || !isWeekday) {
        targetDay += 1;
      }

      // Skip weekends - if target is weekend, move to Monday
      let targetDate = new Date(targetYear, targetMonth - 1, targetDay);
      while (targetDate.getDay() === 0 || targetDate.getDay() === 6) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      // Create a UTC date string for 9:30 AM on the target date
      const targetUTC = new Date(Date.UTC(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        13, // 9:30 AM ET = 13:30 UTC (during EDT)
        30
      ));

      return { time: targetUTC.getTime(), isOpening: true };
    }
  };

  const formatMarketTimer = () => {
    const { time, isOpening } = getNextMarketTime();
    const now = Date.now();
    const diff = time - now;
    
    if (diff <= 0) return 'Calculating...';
    
    // Calculate days first
    const days = Math.floor(diff / (24 * 3600000));
    const remainingMs = diff % (24 * 3600000);
    
    // Then hours from remaining
    const hours = Math.floor(remainingMs / 3600000);
    const remainingAfterHours = remainingMs % 3600000;
    
    // Then minutes and seconds
    const minutes = Math.floor(remainingAfterHours / 60000);
    const seconds = Math.floor((remainingAfterHours % 60000) / 1000);
    
    // Format with colons between values
    const timeStr = `${days}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    return `Time to market ${isOpening ? 'open' : 'close'}: ${timeStr}`;
  };

  const getSortedStocks = () => {
    const sorted = [...stocks].sort((a, b) => {
      let aValue: number;
      let bValue: number;
      
      switch (sortBy) {
        case 'posts':
          aValue = a.uniquePosts;
          bValue = b.uniquePosts;
          break;
        case 'sentiment':
          aValue = a.sentimentScore;
          bValue = b.sentimentScore;
          break;
        case 'mentions':
          aValue = a.mentions;
          bValue = b.mentions;
          break;
        default:
          aValue = a.uniquePosts;
          bValue = b.uniquePosts;
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    return sorted;
  };

  const handleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setShowSortMenu(false);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'posts': return 'Posts';
      case 'sentiment': return 'Sentiment';
      case 'mentions': return 'Mentions';
      default: return 'Posts';
    }
  };

  const getSortedDiscussions = () => {
    if (!selectedStock) return [];
    
    const sorted = [...selectedStock.posts].sort((a, b) => {
      let aValue: number;
      let bValue: number;
      
      switch (discussionSortBy) {
        case 'date':
          aValue = a.created_utc;
          bValue = b.created_utc;
          break;
        case 'upvotes':
          aValue = a.score;
          bValue = b.score;
          break;
        default:
          aValue = a.created_utc;
          bValue = b.created_utc;
      }
      
      return discussionSortOrder === 'desc' ? aValue - bValue : bValue - aValue;
    });
    
    return sorted;
  };

  const handleDiscussionSort = (newSortBy: DiscussionSortBy) => {
    if (discussionSortBy === newSortBy) {
      setDiscussionSortOrder(discussionSortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setDiscussionSortBy(newSortBy);
      setDiscussionSortOrder('desc');
    }
    setShowDiscussionSortMenu(false);
  };

  const toggleDiscussionSortOrder = () => {
    setDiscussionSortOrder(discussionSortOrder === 'desc' ? 'asc' : 'desc');
  };

  const getDiscussionSortLabel = () => {
    switch (discussionSortBy) {
      case 'date': return 'Date';
      case 'upvotes': return 'Upvotes';
      default: return 'Date';
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white">
      <Header 
        marketTimer={marketTimer}
        lastUpdated={lastUpdated}
        nextUpdate={nextUpdate}
        refreshing={refreshing}
        formatTimeAgo={formatTimeAgo}
        formatTimeToNext={formatTimeToNext}
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay
              error={error.message}
              type={error.type}
              onRetry={() => retry(fetchStocks)}
            />
          </div>
        )}

        {/* Mobile Trending Stocks Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileTrendingStocks(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
            <span>Trending Stocks ({stocks.length})</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <TrendingStocks
            stocks={stocks}
            selectedStock={selectedStock}
            sortBy={sortBy}
            sortOrder={sortOrder}
            showSortMenu={showSortMenu}
            onStockSelect={setSelectedStock}
            onSortChange={handleSort}
            onSortOrderToggle={toggleSortOrder}
            onSortMenuToggle={() => setShowSortMenu(!showSortMenu)}
            getSortedStocks={getSortedStocks}
            getSortLabel={getSortLabel}
          />

          <StockDetails
            selectedStock={selectedStock}
            stockPrice={stockPrice}
            priceLoading={priceLoading}
            chartType={chartType}
            discussionSortBy={discussionSortBy}
            discussionSortOrder={discussionSortOrder}
            showDiscussionSortMenu={showDiscussionSortMenu}
            onChartTypeChange={setChartType}
            onDiscussionSortChange={handleDiscussionSort}
            onDiscussionSortOrderToggle={toggleDiscussionSortOrder}
            onDiscussionSortMenuToggle={() => setShowDiscussionSortMenu(!showDiscussionSortMenu)}
            getSortedDiscussions={getSortedDiscussions}
            getDiscussionSortLabel={getDiscussionSortLabel}
          />
        </div>
      </div>

      {/* Mobile Trending Stocks Popup */}
      <MobileTrendingStocks
        isOpen={showMobileTrendingStocks}
        stocks={stocks}
        selectedStock={selectedStock}
        sortBy={sortBy}
        sortOrder={sortOrder}
        showSortMenu={showSortMenu}
        onClose={() => setShowMobileTrendingStocks(false)}
        onStockSelect={setSelectedStock}
        onSortChange={handleSort}
        onSortOrderToggle={toggleSortOrder}
        onSortMenuToggle={() => setShowSortMenu(!showSortMenu)}
        getSortedStocks={getSortedStocks}
        getSortLabel={getSortLabel}
      />

      <Footer />
      </div>
    </ErrorBoundary>
  );
}