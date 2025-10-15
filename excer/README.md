# excer - Penny Stock Sentiment Tracker

A real-time dashboard that tracks the most discussed penny stocks on Reddit, analyzing sentiment and trending discussions to help identify potential investment opportunities.

## Features

- **Real-time Reddit Data**: Monitors r/pennystocks, r/wallstreetbets, r/10xPennyStocks, and r/SmallStreetBets
- **Stock Symbol Detection**: Automatically identifies stock symbols in posts and comments
- **Sentiment Analysis**: Analyzes positive/negative sentiment using keyword matching
- **Trending Calculation**: Ranks stocks by discussion volume and sentiment score
- **Live Dashboard**: Clean, modern interface showing trending stocks and recent discussions

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Data Collection**: Reddit API (public JSON endpoints)
- **Background Processing**: Node.js worker with cron scheduling
- **Deployment**: Vercel (ready for deployment)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create `.env.local` with your Reddit API credentials:
   ```bash
   REDDIT_CLIENT_ID=your_client_id
   REDDIT_CLIENT_SECRET=your_client_secret
   REDDIT_USERNAME=your_reddit_username
   REDDIT_PASSWORD=your_reddit_password
   WORKER_SECRET=your_random_secret_key
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Set up the worker** (optional):
   ```bash
   # Manual worker run
   curl -X GET http://localhost:3000/api/worker
   
   # Or set up automatic scheduling (see WORKER_SETUP.md)
   ```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## API Endpoints

- `GET /api/reddit` - Returns cached stock data
- `POST /api/worker` - Triggers data collection worker

## Deployment

The app is ready for deployment on Vercel. The `vercel.json` file includes cron job configuration for automatic data updates.

## Disclaimer

This tool is for research and entertainment purposes only. It is not financial advice. Always do your own research before making investment decisions.

## License

MIT