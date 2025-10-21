# Developer Guide - Excer

This guide is for developers who want to understand, modify, or contribute to the Excer codebase.

## 🏗 Architecture Overview

### Frontend Architecture
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Component-based** architecture with reusable components

### Backend Architecture
- **API Routes** for data serving
- **Server-Sent Events** for real-time updates
- **Background Worker** for data collection
- **File-based storage** for data persistence

### Data Flow
```
Reddit API → Worker → File Storage → API Routes → Frontend → SSE Updates
```

## 📁 Project Structure Deep Dive

### `/src/app/` - Next.js App Router
- `page.tsx` - Main dashboard component
- `layout.tsx` - Root layout with metadata
- `api/` - API routes for data and worker

### `/src/components/` - React Components
- `Header.tsx` - Dashboard header with market timer
- `TrendingStocks.tsx` - Left panel stock list
- `StockDetails.tsx` - Right panel stock details
- `MobileTrendingStocks.tsx` - Mobile popup navigation
- `ErrorBoundary.tsx` - Error handling wrapper
- `ErrorDisplay.tsx` - Error message display
- `LoadingScreen.tsx` - Full page loading state
- `SkeletonLoader.tsx` - Skeleton loading components

### `/src/hooks/` - Custom React Hooks
- `useErrorHandler.ts` - Centralized error management

### `/src/lib/` - Utility Libraries
- `reddit-worker.ts` - Reddit data collection and processing

### `/src/types/` - TypeScript Definitions
- `index.ts` - Shared type definitions

## 🔧 Key Components Explained

### Main Dashboard (`page.tsx`)
- **State Management**: Uses React hooks for all state
- **Data Fetching**: Fetches data on mount and via SSE
- **Error Handling**: Wrapped in ErrorBoundary
- **Real-time Updates**: SSE connection for live data

### Reddit Worker (`reddit-worker.ts`)
- **Data Collection**: Fetches from multiple Reddit subreddits
- **Stock Detection**: Regex-based symbol identification
- **Sentiment Analysis**: Keyword-based sentiment scoring
- **Data Processing**: Deduplication and aggregation
- **File Storage**: Saves processed data to JSON file

### Error Handling System
- **Error Boundary**: Catches React component errors
- **Error Display**: User-friendly error messages
- **Error Handler Hook**: Centralized error management
- **Error Types**: Network, API, data, and general errors

### Loading States
- **Skeleton Components**: Mimic actual content structure
- **Loading Screen**: Full page loading state
- **Component Loading**: Individual component loading states

## 🚀 Development Workflow

### Setting Up Development Environment

1. **Clone and install**:
   ```bash
   git clone <repo-url>
   cd excer
   npm install
   ```

2. **Environment setup**:
   ```bash
   # Create environment file
   touch .env.local
   
   # Add your Reddit API credentials
   echo "REDDIT_CLIENT_ID=your_reddit_client_id" >> .env.local
   echo "REDDIT_CLIENT_SECRET=your_reddit_client_secret" >> .env.local
   echo "REDDIT_USERNAME=your_reddit_username" >> .env.local
   echo "REDDIT_PASSWORD=your_reddit_password" >> .env.local
   echo "WORKER_SECRET=your_random_secret_key" >> .env.local
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Set up Reddit data collection**:
   ```bash
   # Option 1: Manual worker run
   curl -X GET http://localhost:3000/api/worker
   
   # Option 2: Use the provided script
   chmod +x run-worker.sh
   ./run-worker.sh
   
   # Option 3: Set up automatic scheduling (macOS/Linux)
   # Add to crontab for every 15 minutes:
   crontab -e
   # Add this line:
   */15 * * * * curl -X GET http://localhost:3000/api/worker
   ```

5. **Verify everything is working**:
   - Open http://localhost:3000
   - Check that stocks appear in the trending list
   - Verify "Last updated" timestamp shows recent time
   - Test clicking on stocks to see details
   - Check mobile responsiveness by resizing browser

### Worker Script

The `run-worker.sh` script provides an easy way to trigger the Reddit data collection:

```bash
# Make executable
chmod +x run-worker.sh

# Run the worker
./run-worker.sh
```

The script will:
- Call the worker endpoint
- Show success/failure status
- Provide helpful error messages if something goes wrong

**For automatic updates**, you can set up a cron job:
```bash
# Edit crontab
crontab -e

# Add this line to run every 15 minutes
*/15 * * * * cd /path/to/excer && ./run-worker.sh
```

### Code Style and Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for Next.js and React
- **Prettier**: Code formatting (if configured)
- **Component Structure**: Functional components with hooks
- **File Naming**: PascalCase for components, camelCase for utilities

### Testing Strategy

Manual testing includes:
- **Error Scenarios**: Network failures, API errors, malformed data
- **Loading States**: Skeleton screens, loading indicators
- **Responsive Design**: Mobile and desktop layouts
- **Real-time Updates**: SSE connection and reconnection

## 🔍 Key Features Implementation

### Real-time Updates (SSE)
```typescript
// Server-Sent Events implementation
const eventSource = new EventSource('/api/updates');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'update') {
    fetchStocks(true); // Refresh data
  }
};
```

### Error Handling
```typescript
// Custom error handler hook
const { error, handleError, retry } = useErrorHandler();

// Usage in components
try {
  const response = await fetch('/api/reddit');
  if (!response.ok) throw new Error('API Error');
} catch (error) {
  handleError(error, 'api');
}
```

### Data Validation
```typescript
// Validate and sanitize API responses
const newStocks = Array.isArray(data.stocks) ? data.stocks.filter(stock => 
  stock && 
  typeof stock.symbol === 'string' && 
  stock.symbol.length > 0 &&
  Array.isArray(stock.posts)
) : [];
```

### Mobile Responsiveness
```typescript
// Mobile popup navigation
const [showMobileTrendingStocks, setShowMobileTrendingStocks] = useState(false);

// Conditional rendering
{showMobileTrendingStocks && (
  <MobileTrendingStocks
    isOpen={showMobileTrendingStocks}
    onClose={() => setShowMobileTrendingStocks(false)}
    // ... other props
  />
)}
```

## 🐛 Debugging Guide

### Common Issues and Solutions

**1. No data showing**
- Check Reddit API credentials in `.env.local`
- Verify worker endpoint: `GET /api/worker`
- Check browser console for errors
- Verify data file exists in `/data/` directory
- Run worker manually: `curl -X GET http://localhost:3000/api/worker`

**2. Worker not running**
- Check Reddit API credentials are correct
- Verify Reddit API is accessible (test with curl)
- Check worker logs in terminal
- Ensure environment variables are loaded
- Test with: `curl -X GET http://localhost:3000/api/worker`

**3. SSE connection issues**
- Check network tab in dev tools
- Verify `/api/updates` endpoint
- Check for CORS issues
- Test SSE connection manually
- Restart development server

**4. Build errors**
- Check TypeScript errors: `npm run build`
- Verify all imports are correct
- Check for missing dependencies
- Ensure Node.js version is 18+
- Clear `.next` folder and rebuild

**5. Local development issues**
- Make sure `.env.local` exists and has correct values
- Check that `npm run dev` is running
- Verify port 3000 is not in use by another process
- Check that Reddit API credentials are valid
- Test worker script: `./run-worker.sh`

### Debug Tools

**Browser Dev Tools**:
- Console for errors and logs
- Network tab for API calls
- Performance tab for bottlenecks
- Application tab for storage

**Server Logs**:
- Check Vercel function logs
- Monitor API response times
- Track worker execution
- Monitor error rates

## 🔄 Data Processing Pipeline

### 1. Data Collection
```typescript
// Fetch from Reddit subreddits
const subreddits = ['pennystocks', 'wallstreetbets', '10xPennyStocks', 'SmallStreetBets'];
for (const subreddit of subreddits) {
  const posts = await fetchRedditPosts(subreddit);
  // Process posts...
}
```

### 2. Stock Detection
```typescript
// Regex-based symbol detection
const symbolRegex = /\$?([A-Z]{1,5})\b/g;
const matches = post.title.match(symbolRegex);
// Filter false positives...
```

### 3. Sentiment Analysis
```typescript
// Keyword-based sentiment scoring
const positiveKeywords = ['bullish', 'moon', 'rocket', 'buy', 'long'];
const negativeKeywords = ['bearish', 'crash', 'sell', 'short', 'dump'];
// Calculate sentiment score...
```

### 4. Data Aggregation
```typescript
// Combine and deduplicate data
const allStockData = {};
posts.forEach(post => {
  // Aggregate mentions, sentiment, posts...
});
```

## 🚀 Performance Optimization

### Current Optimizations
- **Data Validation**: Prevent crashes from malformed data
- **Error Boundaries**: Isolate errors to prevent app crashes
- **Skeleton Loading**: Improve perceived performance
- **Component Structure**: Efficient React component organization

## 🔒 Security Considerations

### Current Security Measures
- **Environment Variables**: Secrets not in code
- **Input Validation**: Sanitize all inputs
- **Error Handling**: Don't expose sensitive info
- **Worker Authentication**: Secret key for worker endpoints

## 📈 Monitoring

### Current Monitoring
- **Error Logging**: Console errors and custom error tracking
- **User Feedback**: Error messages and retry mechanisms
- **Vercel Dashboard**: Function execution logs and performance

## 🤝 Contributing Guidelines

### Code Contributions
1. **Fork** the repository
2. **Create** a feature branch
3. **Follow** existing code style
4. **Add** comments for complex logic
5. **Test** your changes thoroughly
6. **Submit** a pull request

### Documentation
- Update README for new features
- Add comments for complex code
- Document API changes
- Update deployment guide if needed

### Testing
- Test error scenarios
- Verify mobile responsiveness
- Check performance impact
- Test with different data sets

---

For more specific implementation details, check the code comments and inline documentation.
