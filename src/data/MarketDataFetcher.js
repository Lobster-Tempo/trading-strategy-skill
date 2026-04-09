/**
 * 市场数据获取器
 * 支持从OKX API获取市场数据
 */

const axios = require('axios');

class MarketDataFetcher {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.OKX_API_KEY,
      secretKey: config.secretKey || process.env.OKX_SECRET_KEY,
      passphrase: config.passphrase || process.env.OKX_PASSPHRASE,
      baseURL: config.baseURL || 'https://www.okx.com',
      timeout: config.timeout || 10000,
      cacheDuration: config.cacheDuration || 60000 // 1分钟缓存
    };
    
    this.cache = new Map();
    this.requestCount = 0;
  }
  
  /**
   * 获取K线数据
   * @param {string} symbol - 交易对，如 BTC-USDT
   * @param {string} timeframe - 时间周期，如 1h, 4h, 1d
   * @param {number} limit - 数据条数限制
   * @returns {Promise<Array>} K线数据
   */
  async getCandles(symbol, timeframe = '1h', limit = 100) {
    const cacheKey = `candles_${symbol}_${timeframe}_${limit}`;
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheDuration) {
        return cached.data;
      }
    }
    
    try {
      this.requestCount++;
      
      // 转换时间周期为OKX格式
      const okxTimeframe = this.convertTimeframe(timeframe);
      
      // 构建请求URL
      const url = `${this.config.baseURL}/api/v5/market/candles`;
      const params = {
        instId: symbol.replace('/', '-'),
        bar: okxTimeframe,
        limit: Math.min(limit, 300) // OKX最大限制300
      };
      
      const response = await axios.get(url, {
        params,
        timeout: this.config.timeout,
        headers: this.getHeaders()
      });
      
      if (response.data.code === '0' && response.data.data) {
        const candles = this.parseCandles(response.data.data);
        
        // 缓存数据
        this.cache.set(cacheKey, {
          timestamp: Date.now(),
          data: candles
        });
        
        return candles;
      } else {
        throw new Error(`API错误: ${response.data.msg || '未知错误'}`);
      }
    } catch (error) {
      console.error('获取K线数据失败:', error.message);
      
      // 如果API失败，返回模拟数据（开发环境）
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockCandles(symbol, timeframe, limit);
      }
      
      throw error;
    }
  }
  
  /**
   * 获取当前价格
   * @param {string} symbol - 交易对
   * @returns {Promise<number>} 当前价格
   */
  async getCurrentPrice(symbol) {
    const cacheKey = `price_${symbol}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 30000) { // 价格缓存30秒
        return cached.data;
      }
    }
    
    try {
      this.requestCount++;
      
      const url = `${this.config.baseURL}/api/v5/market/ticker`;
      const params = {
        instId: symbol.replace('/', '-')
      };
      
      const response = await axios.get(url, {
        params,
        timeout: this.config.timeout,
        headers: this.getHeaders()
      });
      
      if (response.data.code === '0' && response.data.data && response.data.data.length > 0) {
        const price = parseFloat(response.data.data[0].last);
        
        this.cache.set(cacheKey, {
          timestamp: Date.now(),
          data: price
        });
        
        return price;
      } else {
        throw new Error('获取价格失败');
      }
    } catch (error) {
      console.error('获取当前价格失败:', error.message);
      
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockPrice(symbol);
      }
      
      throw error;
    }
  }
  
  /**
   * 获取24小时市场概况
   * @param {string} symbol - 交易对
   * @returns {Promise<Object>} 市场概况
   */
  async getMarketOverview(symbol) {
    try {
      this.requestCount++;
      
      const url = `${this.config.baseURL}/api/v5/market/ticker`;
      const params = {
        instId: symbol.replace('/', '-')
      };
      
      const response = await axios.get(url, {
        params,
        timeout: this.config.timeout,
        headers: this.getHeaders()
      });
      
      if (response.data.code === '0' && response.data.data && response.data.data.length > 0) {
        const data = response.data.data[0];
        
        return {
          symbol,
          lastPrice: parseFloat(data.last),
          open24h: parseFloat(data.open24h),
          high24h: parseFloat(data.high24h),
          low24h: parseFloat(data.low24h),
          volume24h: parseFloat(data.vol24h),
          volumeCurrency24h: parseFloat(data.volCcy24h),
          change24h: parseFloat(data.change24h),
          changePercent24h: parseFloat(data.changePercent24h),
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('获取市场概况失败');
      }
    } catch (error) {
      console.error('获取市场概况失败:', error.message);
      
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockMarketOverview(symbol);
      }
      
      throw error;
    }
  }
  
  /**
   * 获取多个交易对的价格
   * @param {Array} symbols - 交易对数组
   * @returns {Promise<Object>} 价格映射
   */
  async getBatchPrices(symbols) {
    try {
      this.requestCount++;
      
      const instIds = symbols.map(s => s.replace('/', '-')).join(',');
      const url = `${this.config.baseURL}/api/v5/market/tickers`;
      const params = {
        instType: 'SPOT',
        instId: instIds
      };
      
      const response = await axios.get(url, {
        params,
        timeout: this.config.timeout,
        headers: this.getHeaders()
      });
      
      if (response.data.code === '0' && response.data.data) {
        const prices = {};
        response.data.data.forEach(item => {
          const symbol = item.instId.replace('-', '/');
          prices[symbol] = {
            price: parseFloat(item.last),
            change24h: parseFloat(item.change24h),
            changePercent24h: parseFloat(item.changePercent24h),
            volume24h: parseFloat(item.vol24h)
          };
        });
        
        return prices;
      } else {
        throw new Error('获取批量价格失败');
      }
    } catch (error) {
      console.error('获取批量价格失败:', error.message);
      
      if (process.env.NODE_ENV === 'development') {
        return this.generateMockBatchPrices(symbols);
      }
      
      throw error;
    }
  }
  
  /**
   * 转换时间周期格式
   * @param {string} timeframe - 通用时间周期
   * @returns {string} OKX格式时间周期
   */
  convertTimeframe(timeframe) {
    const mapping = {
      '1m': '1m',
      '3m': '3m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1H',
      '2h': '2H',
      '4h': '4H',
      '6h': '6H',
      '12h': '12H',
      '1d': '1D',
      '1w': '1W',
      '1M': '1M'
    };
    
    return mapping[timeframe] || '1H';
  }
  
  /**
   * 解析K线数据
   * @param {Array} rawCandles - 原始K线数据
   * @returns {Array} 解析后的K线数据
   */
  parseCandles(rawCandles) {
    return rawCandles.map(candle => ({
      timestamp: parseInt(candle[0]),
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5]),
      volumeCurrency: parseFloat(candle[6]),
      confirm: candle[7] === '1'
    })).reverse(); // 反转使最新数据在最后
  }
  
  /**
   * 获取请求头
   * @returns {Object} 请求头
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'TradingStrategySkill/1.0.0'
    };
    
    // 如果有API密钥，添加认证头
    if (this.config.apiKey && this.config.secretKey && this.config.passphrase) {
      // 这里可以添加OKX的签名逻辑
      // 简化版本，实际需要实现完整的签名
      headers['OK-ACCESS-KEY'] = this.config.apiKey;
      headers['OK-ACCESS-PASSPHRASE'] = this.config.passphrase;
    }
    
    return headers;
  }
  
  /**
   * 生成模拟K线数据（开发环境用）
   * @param {string} symbol - 交易对
   * @param {string} timeframe - 时间周期
   * @param {number} limit - 数据条数
   * @returns {Array} 模拟K线数据
   */
  generateMockCandles(symbol, timeframe, limit) {
    console.log(`生成模拟K线数据: ${symbol} ${timeframe} ${limit}条`);
    
    const candles = [];
    const basePrice = symbol.includes('BTC') ? 60000 : 
                     symbol.includes('ETH') ? 3000 : 
                     symbol.includes('SOL') ? 150 : 100;
    
    let currentTime = Date.now();
    
    for (let i = 0; i < limit; i++) {
      const open = basePrice * (0.95 + Math.random() * 0.1);
      const close = open * (0.98 + Math.random() * 0.04);
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      const volume = 1000 + Math.random() * 9000;
      
      candles.push({
        timestamp: currentTime - (i * 3600000), // 每小时一条
        open,
        high,
        low,
        close,
        volume,
        volumeCurrency: volume * ((open + close) / 2),
        confirm: true
      });
    }
    
    return candles.reverse();
  }
  
  /**
   * 生成模拟价格（开发环境用）
   * @param {string} symbol - 交易对
   * @returns {number} 模拟价格
   */
  generateMockPrice(symbol) {
    const basePrice = symbol.includes('BTC') ? 60000 : 
                     symbol.includes('ETH') ? 3000 : 
                     symbol.includes('SOL') ? 150 : 100;
    
    return basePrice * (0.95 + Math.random() * 0.1);
  }
  
  /**
   * 生成模拟市场概况（开发环境用）
   * @param {string} symbol - 交易对
   * @returns {Object} 模拟市场概况
   */
  generateMockMarketOverview(symbol) {
    const basePrice = symbol.includes('BTC') ? 60000 : 
                     symbol.includes('ETH') ? 3000 : 
                     symbol.includes('SOL') ? 150 : 100;
    
    const lastPrice = basePrice * (0.95 + Math.random() * 0.1);
    const open24h = lastPrice * (0.9 + Math.random() * 0.2);
    
    return {
      symbol,
      lastPrice,
      open24h,
      high24h: lastPrice * (1 + Math.random() * 0.05),
      low24h: lastPrice * (1 - Math.random() * 0.05),
      volume24h: 10000 + Math.random() * 90000,
      volumeCurrency24h: (10000 + Math.random() * 90000) * lastPrice,
      change24h: lastPrice - open24h,
      changePercent24h: ((lastPrice - open24h) / open24h) * 100,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * 生成模拟批量价格（开发环境用）
   * @param {Array} symbols - 交易对数组
   * @returns {Object} 模拟价格映射
   */
  generateMockBatchPrices(symbols) {
    const prices = {};
    
    symbols.forEach(symbol => {
      const basePrice = symbol.includes('BTC') ? 60000 : 
                       symbol.includes('ETH') ? 3000 : 
                       symbol.includes('SOL') ? 150 : 100;
      
      const price = basePrice * (0.95 + Math.random() * 0.1);
      
      prices[symbol] = {
        price,
        change24h: price * (Math.random() * 0.1 - 0.05),
        changePercent24h: (Math.random() * 10 - 5),
        volume24h: 10000 + Math.random() * 90000
      };
    });
    
    return prices;
  }
  
  /**
   * 获取请求统计
   * @returns {Object} 请求统计
   */
  getRequestStats() {
    return {
      totalRequests: this.requestCount,
      cacheHits: Array.from(this.cache.values()).filter(
        item => Date.now() - item.timestamp < this.config.cacheDuration
      ).length,
      cacheSize: this.cache.size,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * 清空缓存
   */
  clearCache() {
    this.cache.clear();
  }
  
  /**
   * 设置API凭证
   * @param {Object} credentials - API凭证
   */
  setCredentials(credentials) {
    if (credentials.apiKey) this.config.apiKey = credentials.apiKey;
    if (credentials.secretKey) this.config.secretKey = credentials.secretKey;
    if (credentials.passphrase) this.config.passphrase = credentials.passphrase;
    
    // 清空缓存，因为凭证可能已更改
    this.clearCache();
  }
}

module.exports = MarketDataFetcher;