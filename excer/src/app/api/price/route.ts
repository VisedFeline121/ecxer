import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
    }

    // Try multiple APIs to get real price data
    const apis = [
      // Alpha Vantage (free tier)
      async () => {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=demo`,
          { timeout: 5000 }
        );
        if (response.data?.['Global Quote']?.['05. price']) {
          const quote = response.data['Global Quote'];
          return {
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
          };
        }
        return null;
      },
      
      // Yahoo Finance (scraping)
      async () => {
        const response = await axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
          { 
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 5000 
          }
        );
        if (response.data?.chart?.result?.[0]?.meta) {
          const meta = response.data.chart.result[0].meta;
          return {
            price: meta.regularMarketPrice,
            change: meta.regularMarketPrice - meta.previousClose,
            changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
          };
        }
        return null;
      },

      // IEX Cloud (free tier)
      async () => {
        const response = await axios.get(
          `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=pk_test_123456789`,
          { timeout: 5000 }
        );
        if (response.data?.latestPrice) {
          return {
            price: response.data.latestPrice,
            change: response.data.change,
            changePercent: response.data.changePercent * 100
          };
        }
        return null;
      }
    ];

    // Try each API until one works
    for (const apiCall of apis) {
      try {
        const result = await apiCall();
        if (result) {
          return NextResponse.json({
            symbol: symbol,
            price: result.price.toFixed(4),
            change: result.change.toFixed(4),
            changePercent: result.changePercent.toFixed(2),
            lastUpdated: Date.now()
          });
        }
      } catch (error) {
        console.log(`API failed for ${symbol}:`, error.message);
        continue;
      }
    }

    // If all APIs fail, return error
    return NextResponse.json({ 
      error: 'Could not fetch price data from any source',
      symbol: symbol 
    }, { status: 404 });

  } catch (error) {
    console.error('Error in price API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
