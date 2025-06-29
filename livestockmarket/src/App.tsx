import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
  TimeScale,
  BarElement,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler,
  Legend,
  TimeScale
);

import {
  Clock, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Wallet, 
  Bell, 
  BarChart3,
  PieChart,
  X,
  Eye,
  Target,
  Briefcase,
  Sun,
  Moon
} from 'lucide-react';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
  volume?: number;
  marketCap?: string;
  high52w?: number;
  low52w?: number;
}

interface HistoricalPoint {
  time: string;
  price: number;
  timestamp: Date;
}

interface HistoricalData {
  [symbol: string]: HistoricalPoint[];
}

interface Order {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  quantity: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: Date;
  total: number;
}

interface PortfolioItem {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface Alert {
  id: string;
  symbol: string;
  type: 'price_above' | 'price_below' | 'volume_spike';
  targetValue: number;
  triggered: boolean;
  message: string;
}

const App = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalData>({});
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  // Trading State
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [balance, setBalance] = useState(45000); // Starting balance
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    type: 'buy' as 'buy' | 'sell',
    orderType: 'market' as 'market' | 'limit' | 'stop',
    quantity: 1,
    price: 0
  });

  // UI State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'orders' | 'alerts'>('dashboard');

  // Dark mode toggle function
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Your existing data fetching functions
  const fetchStockData = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

      
      if (!supabaseUrl || !supabaseKey) {
        generateMockData();
        return;
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/stock_market?select=*&order=timestamp.desc&limit=50`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        processStockData(data);
        setIsConnected(true);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setIsConnected(false);
      generateMockData();
    }
  };

  const processStockData = (data: any[]) => {
    const groupedData: { [symbol: string]: StockData } = {};
    const historical: HistoricalData = {};

    data.forEach((item: any) => {
      const symbol = item.symbol;
      const price = parseFloat(item.price.toString());
      const timestamp = new Date(item.timestamp);

      if (!groupedData[symbol] || new Date(groupedData[symbol].timestamp) < timestamp) {
        groupedData[symbol] = {
          symbol,
          price,
          timestamp: timestamp.toISOString(),
          change: 0,
          changePercent: 0,
          volume: Math.floor(Math.random() * 1000000) + 100000,
          marketCap: `${(Math.random() * 500 + 50).toFixed(1)}B`,
          high52w: price * (1 + Math.random() * 0.5),
          low52w: price * (1 - Math.random() * 0.3)
        };
      }

      if (!historical[symbol]) {
        historical[symbol] = [];
      }
      historical[symbol].push({
        time: timestamp.toLocaleTimeString(),
        price,
        timestamp
      });
    });

    Object.keys(groupedData).forEach(symbol => {
      const hist = historical[symbol];
      if (hist && hist.length > 1) {
        const current = hist[hist.length - 1].price;
        const previous = hist[hist.length - 2].price;
        const change = current - previous;
        const changePercent = ((change / previous) * 100);
        
        groupedData[symbol].change = change;
        groupedData[symbol].changePercent = changePercent;
      }
    });

    setStocks(Object.values(groupedData));
    setHistoricalData(historical);
    updatePortfolio(Object.values(groupedData));
  };

  const generateMockData = () => {
    const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'NFLX'];
    const basePrices: { [key: string]: number } = { 
      AAPL: 175, TSLA: 240, MSFT: 340, GOOGL: 140, AMZN: 145, 
      NVDA: 450, META: 320, NFLX: 400 
    };
    
    const mockStocks: StockData[] = symbols.map(symbol => {
      const basePrice = basePrices[symbol];
      const price = basePrice + (Math.random() - 0.5) * 10;
      const change = (Math.random() - 0.5) * 5;
      const changePercent = (change / price) * 100;
      
      return {
        symbol,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        timestamp: new Date().toISOString(),
        volume: Math.floor(Math.random() * 1000000) + 100000,
        marketCap: `${(Math.random() * 500 + 50).toFixed(1)}B`,
        high52w: price * (1 + Math.random() * 0.5),
        low52w: price * (1 - Math.random() * 0.3)
      };
    });

    const historical: HistoricalData = {};
    symbols.forEach(symbol => {
      historical[symbol] = [];
      const basePrice = basePrices[symbol];
      for (let i = 20; i >= 0; i--) {
        const time = new Date(Date.now() - i * 30000);
        const price = basePrice + (Math.random() - 0.5) * 15;
        historical[symbol].push({
          time: time.toLocaleTimeString(),
          price: parseFloat(price.toFixed(2)),
          timestamp: time
        });
      }
    });

    setStocks(mockStocks);
    setHistoricalData(historical);
    setLastUpdate(new Date());
    updatePortfolio(mockStocks);
  };

  // Update portfolio with current prices
  const updatePortfolio = (currentStocks: StockData[]) => {
    setPortfolio(prevPortfolio => 
      prevPortfolio.map(item => {
        const currentStock = currentStocks.find(s => s.symbol === item.symbol);
        if (currentStock) {
          const currentPrice = currentStock.price;
          const totalValue = item.quantity * currentPrice;
          const costBasis = item.quantity * item.avgPrice;
          const gainLoss = totalValue - costBasis;
          const gainLossPercent = (gainLoss / costBasis) * 100;

          return {
            ...item,
            currentPrice,
            totalValue,
            gainLoss,
            gainLossPercent
          };
        }
        return item;
      })
    );
  };

  // Trading Functions
  const executeOrder = (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => {
    const newOrder: Order = {
      ...order,
      id: `order_${Date.now()}`,
      timestamp: new Date(),
      status: 'filled' // Simulate immediate fill for demo
    };

    if (order.type === 'buy') {
      const cost = order.total;
      if (balance >= cost) {
        setBalance(prev => prev - cost);
        
        // Add to portfolio
        setPortfolio(prev => {
          const existing = prev.find(p => p.symbol === order.symbol);
          if (existing) {
            const newQuantity = existing.quantity + order.quantity;
            const newAvgPrice = ((existing.avgPrice * existing.quantity) + (order.price * order.quantity)) / newQuantity;
            return prev.map(p => 
              p.symbol === order.symbol 
                ? { ...p, quantity: newQuantity, avgPrice: newAvgPrice }
                : p
            );
          } else {
            return [...prev, {
              symbol: order.symbol,
              quantity: order.quantity,
              avgPrice: order.price,
              currentPrice: order.price,
              totalValue: order.total,
              gainLoss: 0,
              gainLossPercent: 0
            }];
          }
        });
      } else {
        alert('Insufficient balance');
        return;
      }
    } else {
      // Sell logic
      const portfolioItem = portfolio.find(p => p.symbol === order.symbol);
      if (portfolioItem && portfolioItem.quantity >= order.quantity) {
        setBalance(prev => prev + order.total);
        
        setPortfolio(prev => 
          prev.map(p => 
            p.symbol === order.symbol && p.quantity > order.quantity
              ? { ...p, quantity: p.quantity - order.quantity }
              : p
          ).filter(p => p.symbol !== order.symbol || p.quantity > order.quantity)
        );
      } else {
        alert('Insufficient shares');
        return;
      }
    }

    setOrders(prev => [newOrder, ...prev]);
    setShowOrderModal(false);
  };

  const openOrderModal = (stock: StockData, type: 'buy' | 'sell') => {
    setSelectedStock(stock);
    setOrderForm({
      type,
      orderType: 'market',
      quantity: 1,
      price: stock.price
    });
    setShowOrderModal(true);
  };

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Utility functions
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatChange = (change: number) => `${change >= 0 ? '+' : ''}${change.toFixed(2)}`;
  const formatChangePercent = (percent: number) => `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  const getStockColor = (change: number) => change >= 0 ? 'text-green-500' : 'text-red-500';

  const totalPortfolioValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
  const totalGainLoss = portfolio.reduce((sum, item) => sum + item.gainLoss, 0);
  const totalGainLossPercent = totalPortfolioValue > 0 ? (totalGainLoss / (totalPortfolioValue - totalGainLoss)) * 100 : 0;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border-b transition-colors duration-200`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>TradePro Dashboard</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Real-time trading platform</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-500'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {isConnected ? 'Live Data' : 'Reconnecting...'}
                </span>
              </div>
              
              <div className={`flex items-center space-x-2 ${isDarkMode ? 'bg-green-900' : 'bg-green-50'} px-3 py-2 rounded-lg`}>
                <Wallet className={`h-4 w-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>{formatPrice(balance)}</span>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {lastUpdate && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{lastUpdate.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-4 flex space-x-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'alerts', label: 'Alerts', icon: Bell }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'dashboard' | 'portfolio' | 'orders' | 'alerts')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id 
                    ? isDarkMode 
                      ? 'bg-blue-900 text-blue-300' 
                      : 'bg-blue-100 text-blue-700'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm transition-colors duration-200`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Account Balance</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatPrice(balance)}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm transition-colors duration-200`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Portfolio Value</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatPrice(totalPortfolioValue)}</p>
                  </div>
                  <PieChart className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm transition-colors duration-200`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Gain/Loss</p>
                    <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPrice(totalGainLoss)}
                    </p>
                  </div>
                  {totalGainLoss >= 0 ? 
                    <TrendingUp className="h-8 w-8 text-green-500" /> :
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  }
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm transition-colors duration-200`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Positions</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{portfolio.length}</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Stock Grid */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 transition-colors duration-200`}>
              <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Live Market Data</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stocks.map((stock) => (
                  <div key={stock.symbol} className={`border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} rounded-lg p-4 hover:shadow-md transition-all duration-200 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stock.symbol}</h3>
                      {stock.change >= 0 ? 
                        <TrendingUp className="h-5 w-5 text-green-500" /> :
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      }
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatPrice(stock.price)}</span>
                        <div className={`text-sm font-medium ${getStockColor(stock.change)}`}>
                          {formatChange(stock.change)} ({formatChangePercent(stock.changePercent)})
                        </div>
                      </div>
                      
                      <div className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div>Vol: {stock.volume?.toLocaleString()}</div>
                        <div>Cap: {stock.marketCap}</div>
                      </div>

                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => openOrderModal(stock, 'buy')}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Buy
                        </button>
                        <button
                          onClick={() => openOrderModal(stock, 'sell')}
                          className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Sell
                        </button>
                        <button className={`px-3 py-2 border rounded text-sm font-medium transition-colors ${
                          isDarkMode 
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}>
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {stocks.slice(0, 4).map((stock) => (
                <div key={`chart-${stock.symbol}`} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 transition-colors duration-200`}>
                  <h3 className={`text-lg font-bold mb-4 flex items-center justify-between ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span>{stock.symbol} Price Chart</span>
                    <span className={`text-sm font-semibold ${getStockColor(stock.change)}`}>
                      {formatChangePercent(stock.changePercent)}
                    </span>
                  </h3>
                  
                  <div className="h-64">
                    <Line
                      data={{
                        labels: (historicalData[stock.symbol] || []).map((point) => point.time),
                        datasets: [
                          {
                            label: stock.symbol,
                            data: (historicalData[stock.symbol] || []).map((point) => point.price),
                            borderColor: stock.change >= 0 ? '#10b981' : '#ef4444',
                            backgroundColor: stock.change >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            tension: 0.3,
                            pointRadius: 2,
                            fill: true,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            ticks: { color: isDarkMode ? '#d1d5db' : '#6b7280' },
                            grid: { color: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(107, 114, 128, 0.1)' },
                          },
                          y: {
                            ticks: { color: isDarkMode ? '#d1d5db' : '#6b7280' },
                            grid: { color: isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(107, 114, 128, 0.1)' },
                          },
                        },
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                            titleColor: isDarkMode ? '#f9fafb' : '#111827',
                            bodyColor: isDarkMode ? '#d1d5db' : '#6b7280',
                            borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
                            borderWidth: 1,
                            callbacks: {
                              label: (context) => `Price: $${context.parsed.y.toFixed(2)}`
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 transition-colors duration-200`}>
              <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Portfolio Holdings</h2>
              
              {portfolio.length === 0 ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No positions yet. Start trading to build your portfolio!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Symbol</th>
                        <th className={`text-right py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Shares</th>
                        <th className={`text-right py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Avg Cost</th>
                        <th className={`text-right py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Current</th>
                        <th className={`text-right py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Value</th>
                        <th className={`text-right py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Gain/Loss</th>
                        <th className={`text-right py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.map((item) => (
                        <tr key={item.symbol} className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                          <td className={`py-3 px-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.symbol}</td>
                          <td className={`py-3 px-4 text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.quantity}</td>
                          <td className={`py-3 px-4 text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatPrice(item.avgPrice)}</td>
                          <td className={`py-3 px-4 text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatPrice(item.currentPrice)}</td>
                          <td className={`py-3 px-4 text-right font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatPrice(item.totalValue)}</td>
                          <td className={`py-3 px-4 text-right font-medium ${item.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPrice(item.gainLoss)}
                          </td>
                          <td className={`py-3 px-4 text-right font-medium ${item.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatChangePercent(item.gainLossPercent)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 transition-colors duration-200`}>
              <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order History</h2>
              
              {orders.length === 0 ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No orders yet. Place your first trade!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Time</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Symbol</th>
                        <th className={`text-left py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Type</th>
                        <th className={`text-right py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quantity</th>
                        <th className={`text-right py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price</th>
                        <th className={`text-right py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total</th>
                        <th className={`text-center py-3 px-4 font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'}`}>
                          <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{order.timestamp.toLocaleTimeString()}</td>
                          <td className={`py-3 px-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{order.symbol}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              order.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {order.type.toUpperCase()}
                            </span>
                          </td>
                          <td className={`py-3 px-4 text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{order.quantity}</td>
                          <td className={`py-3 px-4 text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatPrice(order.price)}</td>
                          <td className={`py-3 px-4 text-right font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatPrice(order.total)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              order.status === 'filled' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 transition-colors duration-200`}>
              <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Price Alerts</h2>
              
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Alert system coming soon! Set price targets and get notified.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Order Modal */}
      {showOrderModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md mx-4 transition-colors duration-200`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {orderForm.type === 'buy' ? 'Buy' : 'Sell'} {selectedStock.symbol}
              </h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Order Type</label>
                <select
                  value={orderForm.orderType}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, orderType: e.target.value as 'market' | 'limit' | 'stop' }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="market">Market Order</option>
                  <option value="limit">Limit Order</option>
                  <option value="stop">Stop Order</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border-gray-300'
                  }`}
                />
              </div>

              {orderForm.orderType !== 'market' && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={orderForm.price}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              )}

              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Price:</span>
                  <span className="font-medium">{formatPrice(selectedStock.price)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Estimated Total:</span>
                  <span className="font-medium">
                    {formatPrice((orderForm.orderType === 'market' ? selectedStock.price : orderForm.price) * orderForm.quantity)}
                  </span>
                </div>
                {orderForm.type === 'buy' && (
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Available Balance:</span>
                    <span className="font-medium">{formatPrice(balance)}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className={`flex-1 px-4 py-2 border rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => executeOrder({
                    symbol: selectedStock.symbol,
                    type: orderForm.type,
                    orderType: orderForm.orderType,
                    quantity: orderForm.quantity,
                    price: orderForm.orderType === 'market' ? selectedStock.price : orderForm.price,
                    total: (orderForm.orderType === 'market' ? selectedStock.price : orderForm.price) * orderForm.quantity
                  })}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                    orderForm.type === 'buy' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {orderForm.type === 'buy' ? 'Buy' : 'Sell'} {orderForm.quantity} Shares
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border-t mt-12 transition-colors duration-200`}>
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <strong className={`${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Data Source:</strong> Finnhub API via Kafka
            </div>
            <div>
              <strong className={`${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Update Frequency:</strong> Every 15 seconds
            </div>
            <div>
              <strong className={`${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Storage:</strong> Supabase Database
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>This is a demo trading platform. All trades are simulated for educational purposes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

