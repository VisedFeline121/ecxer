# Excer - Penny Stock Sentiment Tracker

A real-time dashboard that tracks the most discussed penny stocks on Reddit, analyzing sentiment and trending discussions to help identify potential investment opportunities.

![Excer Dashboard](public/excer_logo.png)

## ✨ Features

- **📊 Real-time Reddit Data**: Monitors r/pennystocks, r/wallstreetbets, r/10xPennyStocks, and r/SmallStreetBets
- **🔍 Smart Stock Detection**: Automatically identifies stock symbols with false-positive filtering
- **📈 Sentiment Analysis**: Analyzes positive/negative sentiment using advanced keyword matching
- **🔥 Trending Calculation**: Ranks stocks by discussion volume and sentiment score
- **📱 Responsive Dashboard**: Clean, modern interface with mobile-optimized popup navigation
- **⚡ Real-time Updates**: Server-Sent Events for live data updates without page refresh
- **📊 Interactive Charts**: TradingView integration with area and candlestick views

## 🛠 Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Data Collection**: Reddit API with rate limiting and retry logic
- **Background Processing**: Node.js worker with cron scheduling
- **Real-time**: Server-Sent Events (SSE) for live updates
- **Charts**: TradingView widget integration
- **Deployment**: Vercel with automatic deployments
- **Error Handling**: Custom error boundaries and fallback states

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Reddit API credentials (see [Reddit App Preferences](https://www.reddit.com/prefs/apps))

### Installation

1. **Clone and install**:
   ```bash
   git clone <your-repo-url>
   cd excer
   npm install
   ```

2. **Environment setup**:
   Create `.env.local` with your Reddit API credentials:
   ```bash
   # Reddit API Configuration
   REDDIT_CLIENT_ID=your_reddit_client_id
   REDDIT_CLIENT_SECRET=your_reddit_client_secret
   REDDIT_USERNAME=your_reddit_username
   REDDIT_PASSWORD=your_reddit_password
   
   # Worker Security
   WORKER_SECRET=your_random_secret_key_here
   ```

3. **Start development**:
   ```bash
   npm run dev
   ```

4. **Set up the Reddit worker**:
   ```bash
   # Manual worker run (collects data from Reddit)
   curl -X GET http://localhost:3000/api/worker
   
   # Or use the provided script
   chmod +x run-worker.sh
   ./run-worker.sh
   ```

5. **Verify data collection**:
   - Check that data appears in the dashboard
   - Look for the "Last updated" timestamp in the header
   - Verify stocks are showing in the trending list

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Getting Reddit API Credentials

1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Choose "script" as the app type
4. Note down the client ID and secret
5. Use your Reddit username and password

## 📡 API Endpoints

- `GET /api/reddit` - Returns cached stock data with sentiment analysis
- `GET /api/worker` - Triggers data collection worker (manual)
- `POST /api/worker` - Triggers data collection worker (with auth)
- `GET /api/updates` - Server-Sent Events endpoint for real-time updates
- `GET /api/price?symbol=SYMBOL` - Returns current stock price data

## 🚀 Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/excer)

1. Click the deploy button above
2. Add your environment variables
3. Deploy!

### Manual Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Vercel deployment instructions including:
- Environment configuration
- Cron job setup
- Monitoring and maintenance

## 🏗 Project Structure

```
excer/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── page.tsx        # Main dashboard
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── Header.tsx      # Dashboard header
│   │   ├── TrendingStocks.tsx
│   │   ├── StockDetails.tsx
│   │   ├── MobileTrendingStocks.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ErrorDisplay.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── SkeletonLoader.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useErrorHandler.ts
│   ├── lib/                # Utility libraries
│   │   └── reddit-worker.ts
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
├── vercel.json            # Vercel configuration
└── DEPLOYMENT.md          # Deployment guide
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Key Features Implementation

- **Real-time Updates**: Server-Sent Events for live data
- **Error Handling**: Comprehensive error boundaries and fallbacks
- **Loading States**: Skeleton screens and loading indicators
- **Mobile Responsive**: Popup navigation for mobile devices
- **Data Validation**: Input validation and sanitization
- **Performance**: Optimized rendering and caching

## 📊 Data Sources

- **Reddit Subreddits**: r/pennystocks, r/wallstreetbets, r/10xPennyStocks, r/SmallStreetBets
- **Update Frequency**: Every 15 minutes via cron job
- **Data Processing**: Real-time sentiment analysis and trending calculation

## ⚠️ Disclaimer

**This tool is for research and entertainment purposes only. It is not financial advice.**

- Always do your own research before making investment decisions
- Past performance does not guarantee future results
- Penny stocks are highly volatile and risky investments
- Never invest more than you can afford to lose

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- Create an issue for bugs or feature requests
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review the code comments for implementation details

---

**Built with ❤️ for the Reddit trading community**