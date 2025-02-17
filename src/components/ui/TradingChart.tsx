import { useEffect, useRef, useState, Dispatch, SetStateAction } from "react";
import { ChartingLibraryWidgetOptions, ResolutionString, widget } from "../../../public/static/charting_library";
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import { AiAgent, IDL } from '../../idl/ai_agent';
import { connection, PROGRAM_ID } from '../../config';
import { subscribeToPoolUpdates, unsubscribeFromPool } from '../../utils/pool';
import { Candle } from '../../types/trading';

const DUMMY_PRIVATE_KEY = process.env.NEXT_PUBLIC_DUMMY_PRIVATE_KEY as string;
const WS_URL = process.env.NEXT_PUBLIC_CHART_URI || 'http://localhost:8080';

// Create dummy wallet
const dummyWallet = {
  publicKey: Keypair.fromSecretKey(new Uint8Array(JSON.parse(DUMMY_PRIVATE_KEY))).publicKey,
  signTransaction: async (tx: any) => tx,
  signAllTransactions: async (txs: any) => txs,
};

const TradingChart = ({ tokenName, tokenMint, displayCurrency = 'USD', setMcap }: { 
  tokenName: string,
  tokenMint: string, 
  displayCurrency: 'USD' | 'SOL',
  setMcap: Dispatch<SetStateAction<string>> 
}) => {

  if(!tokenName || !tokenMint || !displayCurrency) {
    return null;
  }

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [solPrice, setSolPrice] = useState<number>(0);
  const subscriptionIdRef = useRef<number | null>(null);
  const lastCandleRef = useRef<Candle | null>(null);
  const realtimeCallbackRef = useRef<((bar: any) => void) | null>(null);
  const providerRef = useRef<AnchorProvider | null>(null);
  const programRef = useRef<Program<AiAgent> | null>(null);

  // Add SOL price caching constants
  const SOL_PRICE_CACHE_KEY = 'solana_price_cache';
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes


  // Add enhanced SOL price fetching function
  const fetchSolPrice = async () => {
    try {
      const cachedData = localStorage.getItem(SOL_PRICE_CACHE_KEY);
      if (cachedData) {
        const { price, timestamp } = JSON.parse(cachedData);
        const isExpired = Date.now() - timestamp > CACHE_DURATION;
        
        if (!isExpired) {
          setSolPrice(price);
          return price;
        }
      }

      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      const data = await response.json();
      const newPrice = data.solana.usd;
      
      localStorage.setItem(SOL_PRICE_CACHE_KEY, JSON.stringify({
        price: newPrice,
        timestamp: Date.now()
      }));

      setSolPrice(newPrice);
      return newPrice;
    } catch (error) {
      console.error('Error fetching SOL price:', error);
      const cachedData = localStorage.getItem(SOL_PRICE_CACHE_KEY);
      return cachedData ? JSON.parse(cachedData).price : 1;
    }
  };

  // Initialize program
  useEffect(() => {
    try {
      const provider = new AnchorProvider(
        connection,
        dummyWallet,
        AnchorProvider.defaultOptions()
      );
      providerRef.current = provider;
      
      const program = new Program<AiAgent>(
        IDL,
        PROGRAM_ID,
        provider
      );
      programRef.current = program;
    } catch (error) {
      console.error('Error initializing program:', error);
    }
  }, []);

  // Add effect to track SOL price
  useEffect(() => {
    const updateSolPrice = async () => {
      await fetchSolPrice();
    };

    // Initial fetch
    updateSolPrice();
    
    // Update every 5 minutes (300000ms)
    const interval = setInterval(updateSolPrice, 300000);
    
    return () => clearInterval(interval);
  }, []);

  const formatCandleData = (candle: any) => {
    const multiplier = displayCurrency === 'USD' ? solPrice : 1;
    return {
      time: candle.time || candle.t * 1000,
      open: Number(candle.open || candle.o) * multiplier,
      high: Number(candle.high || candle.h) * multiplier,
      low: Number(candle.low || candle.l) * multiplier,
      close: Number(candle.close || candle.c) * multiplier,
      volume: candle.volume || 0
    };
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: tokenName,
      datafeed: {
        onReady: (callback) => {
          callback({
            supported_resolutions: ['1S', '5S', '15S', '30S', '1', '5', '15', '30','1D','5D'] as ResolutionString[],
          });
        },
        searchSymbols: () => {},
        resolveSymbol: (symbolName, onSymbolResolvedCallback) => {
          onSymbolResolvedCallback({
            name: symbolName,
            description: '',
            type: 'crypto',
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: '',
            minmov: 1,
            pricescale: 1000000000,
            has_intraday: true,
            has_seconds: true,
            has_ticks: true,
            has_empty_bars: false,
            visible_plots_set: 'ohlcv',
            data_status: 'streaming',
            supported_resolutions: ['30S'] as ResolutionString[],
            format: 'price',
            listed_exchange: 'binance',
          });
        },
        getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
          try {
            if (resolution !== '30S') {
              onHistoryCallback([], { noData: true });
              return;
            }

            console.log('Fetching historical data...');

            if (!periodParams.firstDataRequest) {
              onHistoryCallback([], { noData: true });
              return;
            }

            const response = await fetch(`${WS_URL}/candles/${tokenMint}`);
            const candlesData = await response.json();
            
            if (!Array.isArray(candlesData)) {
              console.error('Invalid candles data:', candlesData);
              onHistoryCallback([], { noData: true });
              return;
            }

            const bars = candlesData.map(candle => ({
              time: candle.t * 1000,
              open: Number(candle.o) * (displayCurrency === 'USD' ? solPrice : 1),
              high: Number(candle.h) * (displayCurrency === 'USD' ? solPrice : 1),
              low: Number(candle.l) * (displayCurrency === 'USD' ? solPrice : 1),
              close: Number(candle.c) * (displayCurrency === 'USD' ? solPrice : 1),
              volume: 0
            }));

            if (bars.length > 0) {
              lastCandleRef.current = candlesData[candlesData.length - 1];
              const lastClose = Number(candlesData[candlesData.length - 1].c) * (displayCurrency === 'USD' ? solPrice : 1);
              setMcap(lastClose.toFixed(2));
              onHistoryCallback(bars, {
                noData: false,
                nextTime: undefined
              });
            } else {
              onHistoryCallback([], { noData: true });
            }
          } catch (error: any) {
            console.error('Error fetching historical data:', error);
            onErrorCallback(error.message);
          }
        },
        subscribeBars: async (symbolInfo, resolution, onRealtimeCallback, subscribeUID) => {
          console.log('Setting up real-time subscription...');
          realtimeCallbackRef.current = onRealtimeCallback;

          try {
            const mintPubkey = new PublicKey(tokenMint);
            const subscriptionId = await subscribeToPoolUpdates(
              programRef.current!,
              mintPubkey.toString(),
              (poolData) => {
                // Update mcap based on display currency
                if (displayCurrency === "USD") {
                  setMcap((poolData.price * solPrice).toFixed(2));
                } else {
                  setMcap(poolData.price.toFixed(4));
                }

                const currentTimestamp = Math.floor(Date.now() / 1000);
                const price = Number(poolData.price) * (displayCurrency === 'USD' ? solPrice : 1);

                if (!lastCandleRef.current || currentTimestamp > lastCandleRef.current.t) {
                  const newCandle = {
                    t: currentTimestamp,
                    o: price,
                    h: price,
                    l: price,
                    c: price
                  };
                  lastCandleRef.current = newCandle;
                  
                  onRealtimeCallback({
                    time: currentTimestamp * 1000,
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                    volume: 0
                  });
                } else {
                  const lastCandle = lastCandleRef.current;
                  lastCandle.h = Math.max(lastCandle.h, price);
                  lastCandle.l = Math.min(lastCandle.l, price);
                  lastCandle.c = price;
                  
                  onRealtimeCallback({
                    time: lastCandle.t * 1000,
                    open: lastCandle.o * (displayCurrency === 'USD' ? solPrice : 1),
                    high: lastCandle.h * (displayCurrency === 'USD' ? solPrice : 1),
                    low: lastCandle.l * (displayCurrency === 'USD' ? solPrice : 1),
                    close: lastCandle.c * (displayCurrency === 'USD' ? solPrice : 1),
                    volume: 0
                  });
                }
              }
            );

            subscriptionIdRef.current = subscriptionId;
          } catch (error) {
            console.error('Error in subscribeBars:', error);
          }
        },
        unsubscribeBars: (subscribeUID) => {
          if (subscriptionIdRef.current !== null) {
            unsubscribeFromPool(connection, subscriptionIdRef.current);
            subscriptionIdRef.current = null;
          }
          realtimeCallbackRef.current = null;
        }
      },
      interval: '30S' as ResolutionString,
      container: chartContainerRef.current,
      library_path: '/static/charting_library/',
      locale: 'en',
      disabled_features: [
        'use_localstorage_for_settings',
        'volume_force_overlay',
        'create_volume_indicator_by_default',
        'header_symbol_search',
        'header_compare',
        'symbol_search_hot_key'
      ],
      enabled_features: [
        'hide_resolution_in_legend',
        'seconds_resolution'
      ],
      time_frames: [
        // { text: "30S", resolution: "30S" as ResolutionString, description: "30 Seconds" },
        // { text: "1m", resolution: "1" as ResolutionString, description: "1 Minute" },
        // { text: "5m", resolution: "5" as ResolutionString, description: "5 Minutes" },
        // { text: "15m", resolution: "15" as ResolutionString, description: "15 Minutes"},
        // { text: "30m", resolution: "30" as ResolutionString, description: "30 Minutes"},
        // { text: "1h", resolution: "60" as ResolutionString, description: "1 Hour" },
        // { text: "4h", resolution: "240" as ResolutionString, description: "4 Hours"},
        { text: "1D", resolution: "1D" as ResolutionString, description: "1 Day"},
        { text: "5D", resolution: "5D" as ResolutionString, description: "5 Day"},
      ],
      client_id: 'tradingview.com',
      user_id: 'public_user',
      fullscreen: false,
      autosize: true,
      theme: 'light',
      overrides: {
        'mainSeriesProperties.style': 1,
        'mainSeriesProperties.visible': true,
        'mainSeriesProperties.showPriceLine': true,
        'mainSeriesProperties.priceLineWidth': 1,
        'mainSeriesProperties.priceLineColor': '#3179f5',
        'mainSeriesProperties.baseLineColor': '#5d606b',
        'mainSeriesProperties.showPrevClosePriceLine': false,
        'mainSeriesProperties.priceFormat.type': 'price',
        'mainSeriesProperties.priceFormat.precision': displayCurrency === 'USD' ? 2 : 9,
        'mainSeriesProperties.priceFormat.minMove': displayCurrency === 'USD' ? 0.01 : 0.000000001,
      },
      loading_screen: { backgroundColor: "#131722" },
    };

    const tvWidget = new widget(widgetOptions);

    return () => {
      if (subscriptionIdRef.current !== null) {
        unsubscribeFromPool(connection, subscriptionIdRef.current);
      }
      tvWidget.remove();
    };
  }, [tokenMint, displayCurrency, solPrice, setMcap]);

  // Add effect to handle currency display changes
  useEffect(() => {
    const updateChartPrices = async () => {
      console.log('updateChartPrices called'); // Debug log 1
      try {
        const response = await fetch(`${WS_URL}/candles/${tokenMint}`);
        const candlesData = await response.json();
        
        if (Array.isArray(candlesData) && candlesData.length > 0) {
          
          if (realtimeCallbackRef.current && lastCandleRef.current) {
            const lastCandle = formatCandleData(lastCandleRef.current);
            realtimeCallbackRef.current(lastCandle);
          }
        }
      } catch (error) {
        console.error('Error updating chart prices:', error);
      }
    };

    console.log('Effect triggered with:', { displayCurrency, solPrice }); // Debug log 5
    updateChartPrices();
  }, [displayCurrency, solPrice]);

  return (
    <div className="p-4">
      <div 
        ref={chartContainerRef} 
        className="w-full h-[500px] bg-[#131722] rounded-lg shadow-lg"
      />
    </div>
  );
};

export default TradingChart;