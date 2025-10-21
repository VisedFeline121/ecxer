'use client';

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, TrendingUp } from 'lucide-react';
import { ChartType, DiscussionSortBy, SortOrder, StockData, StockPrice } from '../types';

interface StockDetailsProps {
  selectedStock: StockData | null;
  stockPrice: StockPrice | null;
  priceLoading: boolean;
  chartType: ChartType;
  discussionSortBy: DiscussionSortBy;
  discussionSortOrder: SortOrder;
  showDiscussionSortMenu: boolean;
  onChartTypeChange: (type: ChartType) => void;
  onDiscussionSortChange: (newSortBy: DiscussionSortBy) => void;
  onDiscussionSortOrderToggle: () => void;
  onDiscussionSortMenuToggle: () => void;
  getSortedDiscussions: () => any[];
  getDiscussionSortLabel: () => string;
}

export default function StockDetails({
  selectedStock,
  stockPrice,
  priceLoading,
  chartType,
  discussionSortBy,
  discussionSortOrder,
  showDiscussionSortMenu,
  onChartTypeChange,
  onDiscussionSortChange,
  onDiscussionSortOrderToggle,
  onDiscussionSortMenuToggle,
  getSortedDiscussions,
  getDiscussionSortLabel
}: StockDetailsProps) {
  if (!selectedStock) {
    return (
      <div className="col-span-1 lg:col-span-2 flex">
        <div className="bg-gray-800 rounded-lg p-6 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-4" />
            <p>Select a stock to view details</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-1 lg:col-span-2 flex">
      <div className="bg-gray-800 rounded-lg p-6 w-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">${selectedStock.symbol}</h2>
          <div className="text-right">
            <div className="text-sm text-gray-400">Sentiment Score</div>
            <div className={`text-xl font-bold ${
              selectedStock.sentimentScore > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {selectedStock.sentimentScore > 0 ? '+' : ''}{selectedStock.sentimentScore.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Stock Price Display */}
        <div className="mb-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Current Price</div>
                <div className="text-2xl font-bold text-white flex items-center">
                  {priceLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Loading...
                    </>
                  ) : stockPrice ? (
                    stockPrice.price === 'N/A' ? 'Price N/A' : 
                    stockPrice.price === 'Error' ? 'Price Error' : 
                    `$${stockPrice.price}`
                  ) : (
                    'Loading...'
                  )}
                </div>
                {!priceLoading && stockPrice && stockPrice.change !== 'N/A' && stockPrice.change !== 'Error' && (
                  <div className={`text-sm ${parseFloat(stockPrice.change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stockPrice.change >= 0 ? '+' : ''}{stockPrice.change} ({stockPrice.changePercent}%)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stock Price Chart */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Price Chart</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => onChartTypeChange('area')}
                className={`px-3 py-1 text-xs rounded ${
                  chartType === 'area' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Area
              </button>
              <button 
                onClick={() => onChartTypeChange('candles')}
                className={`px-3 py-1 text-xs rounded ${
                  chartType === 'candles' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Candles
              </button>
            </div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div 
              id={`tradingview_${selectedStock.symbol}`}
              className="w-full h-96"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{selectedStock.uniquePosts}</div>
            <div className="text-sm text-gray-400">Unique Posts</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{selectedStock.positiveMentions}</div>
            <div className="text-sm text-gray-400">Bullish</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{selectedStock.negativeMentions}</div>
            <div className="text-sm text-gray-400">Bearish</div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Discussions</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={onDiscussionSortMenuToggle}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span>{getDiscussionSortLabel()}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showDiscussionSortMenu && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-10">
                    <button
                      onClick={() => onDiscussionSortChange('date')}
                      className={`w-full px-3 py-2 text-left text-sm rounded-t-lg transition-colors ${
                        discussionSortBy === 'date' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Date
                    </button>
                    <button
                      onClick={() => onDiscussionSortChange('upvotes')}
                      className={`w-full px-3 py-2 text-left text-sm rounded-b-lg transition-colors ${
                        discussionSortBy === 'upvotes' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      Upvotes
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={onDiscussionSortOrderToggle}
                className="p-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                title={discussionSortOrder === 'desc' ? 'Most to least' : 'Least to most'}
              >
                {discussionSortOrder === 'desc' ? (
                  <ArrowDown className="w-4 h-4" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-3 overflow-y-auto pr-2" style={{ height: '1200px' }}>
            {getSortedDiscussions().map((post, index) => (
              <a 
                key={index} 
                href={`https://www.reddit.com${post.permalink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm line-clamp-2 text-white hover:text-blue-300 transition-colors">{post.title}</h4>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                    {post.score} ↑
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>r/{post.subreddit}</span>
                  <span>Published: {new Date(post.created_utc * 1000).toLocaleDateString()}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
