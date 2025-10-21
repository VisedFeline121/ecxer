export interface StockData {
  symbol: string;
  mentions: number;
  uniquePosts: number;
  positiveMentions: number;
  negativeMentions: number;
  sentimentScore: number;
  posts: Array<{
    id: string;
    title: string;
    score: number;
    subreddit: string;
    permalink: string;
    author: string;
    created_utc: number;
  }>;
  lastUpdated: number;
}

export interface StockPrice {
  price: string;
  change: string;
  changePercent: string;
}

export type SortBy = 'posts' | 'sentiment' | 'mentions';
export type SortOrder = 'asc' | 'desc';
export type DiscussionSortBy = 'date' | 'upvotes';
export type ChartType = 'area' | 'candles';
