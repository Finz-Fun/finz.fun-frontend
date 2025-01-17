import { createChart, IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Candle, PriceUpdate } from '../../types/trading';

const WS_URL = process.env.WS_URI || 'http://localhost:8080';
const TOKEN_MINT = 'BrZURiP9oNPQ5KxUMy6hjJUZZi4az2wQot7bhCq9pJHZ';

const getPriceFormatter = (currency: 'SOL' | 'USD') => {
  return {
    type: 'price' as const,
    precision: currency === 'USD' ? 2 : 9,
    minMove: currency === 'USD' ? 0.01 : 0.000000001,
    formatter: (price: number) => 
      currency === 'USD' 
        ? `$${price.toFixed(2)}`
        : `◎${price.toFixed(9)}`
  };
};

const TradingChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const lastCandleRef = useRef<Candle | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState<'SOL' | 'USD'>('SOL');
  const solPriceRef = useRef<number>(0);

  useEffect(() => {
    const cleanup = initializeSocket();
    return () => cleanup();
  }, [displayCurrency]);

  useEffect(() => {
    const updateSolPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        solPriceRef.current = data.solana.usd;
        console.log('Updated SOL price:', solPriceRef.current);
      } catch (error) {
        console.error('Error updating SOL price:', error);
      }
    };
  
    updateSolPrice();
    const interval = setInterval(updateSolPrice, 300000);
  
    return () => clearInterval(interval);
  }, []);

  function formatCandleData(candle: Candle, solPrice: number = 0) {
    const multiplier = displayCurrency === 'USD' ? solPriceRef.current : 1;
    return {
      time: candle.t as Time,
      open: Number(candle.o) * multiplier,
      high: Number(candle.h) * multiplier,
      low: Number(candle.l) * multiplier,
      close: Number(candle.c) * multiplier
    };
  }


const updateChartData = () => {
  if (!candlestickSeriesRef.current || !lastCandleRef.current) return;
  
  // Update price format based on currency
  candlestickSeriesRef.current.applyOptions({
    priceFormat: getPriceFormatter(displayCurrency),
  });

  // Refresh all candles with new currency
  fetchHistoricalData();
};

const fetchHistoricalData = async () => {
  try {
    const [candlesResponse, solPriceResponse] = await Promise.all([
      fetch(`${WS_URL}/candles/${TOKEN_MINT}`),
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
    ]);

    const candlesData: Candle[] = await candlesResponse.json();
    const solPriceData = await solPriceResponse.json();
    solPriceRef.current = solPriceData.solana.usd;

    if (candlestickSeriesRef.current && Array.isArray(candlesData)) {
      const sortedData = candlesData.sort((a, b) => a.t - b.t);
      const formattedData = sortedData.map(candle => 
        formatCandleData(candle, solPriceRef.current)
      );
      candlestickSeriesRef.current.setData(formattedData);
      
      if (sortedData.length > 0) {
        lastCandleRef.current = sortedData[sortedData.length - 1];
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

  const initializeSocket = () => {
    const socket = io(WS_URL, {
      transports: ['websocket']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket Connected');
      socket.emit('subscribe', TOKEN_MINT);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket Disconnected');
    });

    socket.on('price', (update: PriceUpdate) => {
      if (!candlestickSeriesRef.current) return;
    
      const currentTimestamp = Math.floor(update.ts / 30) * 30;
      
      // Always store original SOL price in the candle
      if (!lastCandleRef.current) {
        const newCandle: Candle = {
          t: currentTimestamp,
          o: update.p,
          h: update.p,
          l: update.p,
          c: update.p
        };
        lastCandleRef.current = newCandle;
        candlestickSeriesRef.current.update(formatCandleData(newCandle));
        return;
      }
    
      const lastCandle = lastCandleRef.current;
    
      if (currentTimestamp > lastCandle.t) {
        const newCandle: Candle = {
          t: currentTimestamp,
          o: update.p,
          h: update.p,
          l: update.p,
          c: update.p
        };
        lastCandleRef.current = newCandle;
        candlestickSeriesRef.current.update(formatCandleData(newCandle));
      } else {
        lastCandle.h = Math.max(lastCandle.h, update.p);
        lastCandle.l = Math.min(lastCandle.l, update.p);
        lastCandle.c = update.p;
        candlestickSeriesRef.current.update(formatCandleData(lastCandle));
      }
    });

    return () => {
      socket.emit('unsubscribe', TOKEN_MINT);
      socket.disconnect();
    };
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: 600,
      height: 400,
      layout: {
        background: { color: '#131722' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#363c4e' },
        horzLines: { color: '#363c4e' },
      },
      timeScale: {
        borderColor: '#555555',
        timeVisible: true,
        secondsVisible: true,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#4caf50',
      downColor: '#f44336',
      borderUpColor: '#4caf50',
      borderDownColor: '#f44336',
      wickUpColor: '#4caf50',
      wickDownColor: '#f44336',
      priceFormat: getPriceFormatter(displayCurrency),
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    fetchHistoricalData();

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [displayCurrency]);

  useEffect(() => {
    updateChartData();
  }, [displayCurrency]);

  return (
    <div className="p-4">
      <div className="mb-4">
        <select 
          value={displayCurrency}
          onChange={(e) => setDisplayCurrency(e.target.value as 'SOL' | 'USD')}
          className="px-4 py-2 bg-[#2a2e39] text-white rounded"
        >
          <option value="SOL">SOL</option>
          <option value="USD">USD</option>
        </select>
      </div>
      <div 
        ref={chartContainerRef} 
        className="w-full h-[600px] bg-[#131722] rounded-lg shadow-lg"
      />
      <div className="mt-4 flex gap-4">
        <div 
          className={`px-4 py-2 rounded ${
            isConnected ? 'bg-green-600' : 'bg-red-600'
          } text-white`}
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        <button
          onClick={fetchHistoricalData}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default TradingChart;