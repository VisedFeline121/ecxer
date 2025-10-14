import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

// Target subreddits for penny stock discussions
const SUBREDDITS = [
  'pennystocks',
  'wallstreetbets', 
  '10xPennyStocks',
  'SmallStreetBets'
];

// Stock symbol regex pattern (2-5 letters, with optional $ prefix)
const STOCK_SYMBOL_REGEX = /\$?([A-Z]{2,5})\b(?![\w\d])/g;

// Sentiment keywords
const POSITIVE_KEYWORDS = [
  'moon', 'rocket', 'breakout', 'squeeze', 'catalyst', 'bullish', 'pump',
  'explosive', 'gains', 'profit', 'buy', 'long', 'hodl', 'diamond hands'
];

const NEGATIVE_KEYWORDS = [
  'dump', 'crash', 'avoid', 'scam', 'bearish', 'sell', 'short', 'paper hands',
  'loss', 'bag', 'pump and dump', 'manipulation'
];

interface RedditPost {
  title: string;
  selftext: string;
  score: number;
  created_utc: number;
  subreddit: string;
  permalink: string;
  author: string;
}

interface StockData {
  symbol: string;
  mentions: number;
  positiveMentions: number;
  negativeMentions: number;
  sentimentScore: number;
  posts: RedditPost[];
  lastUpdated: number;
}

interface WorkerData {
  stocks: StockData[];
  lastUpdated: number;
  totalSubreddits: number;
  dataSource: 'reddit' | 'error';
}

class RedditWorker {
  private dataPath: string;

  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'stocks.json');
  }

  // Fetch posts from a subreddit
  private async fetchSubredditPosts(subreddit: string): Promise<RedditPost[]> {
    try {
      console.log(`Fetching posts from r/${subreddit}...`);
      
      // Use Reddit's public JSON API
      const response = await axios.get(`https://www.reddit.com/r/${subreddit}/new.json?limit=100`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 15000
      });

      const posts = response.data.data.children.map((child: { data: any }) => ({
        title: child.data.title,
        selftext: child.data.selftext || '',
        score: child.data.score,
        created_utc: child.data.created_utc,
        subreddit: child.data.subreddit,
        permalink: child.data.permalink,
        author: child.data.author
      }));

      console.log(`Found ${posts.length} posts in r/${subreddit}`);
      if (posts.length > 0) {
        console.log(`Sample post titles:`, posts.slice(0, 3).map(p => p.title));
      }
      
      return posts;
      } catch (error) {
        console.error(`Error fetching from r/${subreddit}:`, error);
        if (error.response) {
          console.error(`Response status: ${error.response.status}`);
          console.error(`Response data:`, error.response.data);
        }
        return [];
      } finally {
        // Add a delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

  // Process posts for stock mentions and sentiment
  private processPostsForStocks(posts: RedditPost[]): { [key: string]: StockData } {
    const stockData: { [key: string]: StockData } = {};
    let totalMatches = 0;

    posts.forEach((post: RedditPost) => {
      // Look for stock symbols in both original and lowercase text
      const originalText = `${post.title} ${post.selftext}`;
      const text = originalText.toLowerCase();
      
      // Find potential stock symbols
      const matches = originalText.match(STOCK_SYMBOL_REGEX) || [];
      
      // Also look for common stock mention patterns
      const tickerMatches = text.match(/\$[a-z]{2,5}\b/g) || [];  // $ticker
      const tickerWordMatches = text.match(/\b(?:ticker|stock|share)s?\s+([a-z]{2,5})\b/gi) || []; // "ticker ABC"
      
      const allMatches = [
        ...matches,
        ...tickerMatches.map(m => m.toUpperCase()),
        ...tickerWordMatches.map(m => m.split(/\s+/).pop()?.toUpperCase() || '')
      ].filter(Boolean);
      
      if (allMatches.length > 0) {
        console.log(`Found potential stock symbols in post: "${post.title}" - matches:`, allMatches);
        totalMatches += allMatches.length;
        
        allMatches.forEach(match => {
          const symbol = match.replace(/^\$/, '').toUpperCase();
          
          // Skip common false positives and very short/long symbols
          if (symbol.length < 2 || symbol.length > 5 || 
              ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'HAD', 'WHAT', 'WERE', 'WHEN', 'YOUR', 'HOW', 'SAID', 'EACH', 'WHICH', 'THEIR', 'TIME', 'WILL', 'ABOUT', 'IF', 'UP', 'OUT', 'MANY', 'THEN', 'THEM', 'THESE', 'SO', 'SOME', 'WOULD', 'MAKE', 'LIKE', 'INTO', 'HIM', 'HAS', 'MORE', 'GO', 'NO', 'WAY', 'COULD', 'MY', 'THAN', 'FIRST', 'BEEN', 'CALL', 'WHO', 'ITS', 'NOW', 'FIND', 'LONG', 'DOWN', 'DAY', 'DID', 'GET', 'COME', 'MADE', 'MAY', 'PART', 'NEW', 'WORK', 'USE', 'MAN', 'FIND', 'GIVE', 'JUST', 'WHERE', 'MOST', 'GOOD', 'MUCH', 'SOME', 'TIME', 'VERY', 'WHEN', 'COME', 'HERE', 'JUST', 'LIKE', 'LONG', 'MAKE', 'MANY', 'OVER', 'SUCH', 'TAKE', 'THAN', 'THEM', 'WELL', 'WERE'].includes(symbol)) {
            console.log(`Skipping symbol: ${symbol} (false positive)`);
            return;
          }
          
          console.log(`Processing stock symbol: ${symbol}`);
          
          if (!stockData[symbol]) {
            stockData[symbol] = {
              symbol,
              mentions: 0,
              positiveMentions: 0,
              negativeMentions: 0,
              sentimentScore: 0,
              posts: [],
              lastUpdated: Date.now()
            };
          }
          
          stockData[symbol].mentions++;
          stockData[symbol].posts.push(post);
          
          // Calculate sentiment
          const positiveCount = POSITIVE_KEYWORDS.filter(keyword => text.includes(keyword)).length;
          const negativeCount = NEGATIVE_KEYWORDS.filter(keyword => text.includes(keyword)).length;
          
          if (positiveCount > negativeCount) {
            stockData[symbol].positiveMentions++;
          } else if (negativeCount > positiveCount) {
            stockData[symbol].negativeMentions++;
          }
        });
      }
    });

    console.log(`Total potential stock matches found: ${totalMatches}`);
    console.log(`Valid stock symbols processed: ${Object.keys(stockData).length}`);
    
    return stockData;
  }

  // Save data to file
  private async saveData(data: WorkerData): Promise<void> {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dataPath);
      await fs.mkdir(dataDir, { recursive: true });
      
      await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2));
      console.log('Data saved to file');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Load data from file
  public async loadData(): Promise<WorkerData | null> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.log('No existing data file found');
      return null;
    }
  }

  // Main worker function
  public async run(): Promise<void> {
    console.log('Starting Reddit worker...');
    
    try {
      const allStockData: { [key: string]: StockData } = {};
      
      // Fetch from all subreddits
      for (const subreddit of SUBREDDITS) {
        console.log(`Fetching from r/${subreddit}...`);
        const posts = await this.fetchSubredditPosts(subreddit);
        const stockData = this.processPostsForStocks(posts);
        
        // Merge stock data
        Object.keys(stockData).forEach(symbol => {
          if (allStockData[symbol]) {
            allStockData[symbol].mentions += stockData[symbol].mentions;
            allStockData[symbol].positiveMentions += stockData[symbol].positiveMentions;
            allStockData[symbol].negativeMentions += stockData[symbol].negativeMentions;
            allStockData[symbol].posts.push(...stockData[symbol].posts);
          } else {
            allStockData[symbol] = stockData[symbol];
          }
        });
        
        // Small delay between subreddits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Calculate sentiment scores and sort by trending
      const stocks = Object.values(allStockData)
        .filter(stock => stock.mentions >= 2) // Only include stocks with 2+ mentions
        .map(stock => ({
          ...stock,
          sentimentScore: stock.positiveMentions - stock.negativeMentions,
          trendingScore: stock.mentions * (stock.positiveMentions - stock.negativeMentions)
        }))
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 20); // Top 20 trending stocks
      
      const workerData: WorkerData = {
        stocks,
        lastUpdated: Date.now(),
        totalSubreddits: SUBREDDITS.length,
        dataSource: 'reddit'
      };
      
      await this.saveData(workerData);
      console.log(`Worker completed. Found ${stocks.length} trending stocks.`);
      
    } catch (error) {
      console.error('Worker error:', error);
      
      // Save error state
      const errorData: WorkerData = {
        stocks: [],
        lastUpdated: Date.now(),
        totalSubreddits: SUBREDDITS.length,
        dataSource: 'error'
      };
      
      await this.saveData(errorData);
    }
  }
}

export default RedditWorker;
