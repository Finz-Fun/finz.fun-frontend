import { createChart, IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Candle, PriceUpdate } from '../../types/trading';

const WS_URL = process.env.NEXT_PUBLIC_WS_URI || 'http://localhost:8080';


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

const TradingChart = ({tokenMint}: {tokenMint: string}) => {
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
      console.log(WS_URL)
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
      fetch(`${WS_URL}/candles/${tokenMint}`),
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
      socket.emit('subscribe', tokenMint);
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
      socket.emit('unsubscribe', tokenMint);
      socket.disconnect();
    };
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 600,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333333',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: '#f0f0f0', style: 1 },
        horzLines: { color: '#f0f0f0', style: 1 },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#758696',
          width: 1,
          style: 3,
          labelBackgroundColor: '#ffffff',
        },
        horzLine: {
          color: '#758696',
          width: 1,
          style: 3,
          labelBackgroundColor: '#ffffff',
        },
      },
      timeScale: {
        borderColor: '#e1e4e8',
        timeVisible: true,
        secondsVisible: true,
        barSpacing: 6,
        minBarSpacing: 2,
        rightOffset: 12,
        lockVisibleTimeRangeOnResize: true,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000);
          const month = date.toLocaleString('default', { month: 'short' });
          const day = date.getDate();
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          
          // Show different formats based on the time
          const now = new Date();
          const isToday = date.toDateString() === now.toDateString();
          const isThisYear = date.getFullYear() === now.getFullYear();
          
          if (isToday) {
            return `${hours}:${minutes}`;
          } else if (isThisYear) {
            return `${month} ${day} ${hours}:${minutes}`;
          } else {
            return `${month} ${day}, ${date.getFullYear()}`;
          }
        },
      },
      rightPriceScale: {
        borderColor: '#e1e4e8',
        scaleMargins: {
          top: 0.2,
          bottom: 0.2,
        },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
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

    chart.timeScale().applyOptions({
      timeVisible: true,
      secondsVisible: false,
      ticksVisible: true,
    });

    chart.timeScale().setVisibleLogicalRange({
      from: -150, 
      to: 20,
    });

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