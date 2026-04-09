/**
 * 交易策略技能主类
 * 集成OKX CLI的多策略交易信号分析
 */

const RSIStrategy = require('./strategies/RSIStrategy');
const MACDStrategy = require('./strategies/MACDStrategy');

class TradingStrategySkill {
  constructor(config = {}) {
    this.name = 'smart-trading-signals';
    this.version = '1.0.0';
    this.description = '基于OKX CLI的多策略交易信号分析技能';
    
    // 默认配置
    this.config = {
      defaultSymbol: config.defaultSymbol || 'BTC/USDT',
      defaultTimeframe: config.defaultTimeframe || '1h',
      defaultStrategy: config.defaultStrategy || 'ALL',
      cacheEnabled: config.cacheEnabled !== false,
      cacheTTL: config.cacheTTL || 30000, // 30秒缓存
      logLevel: config.logLevel || 'info',
      maxBatchSize: config.maxBatchSize || 10,
      riskTolerance: config.riskTolerance || 'medium', // low, medium, high
      ...config
    };
    
    // 初始化策略
    this.strategies = {
      RSI: new RSIStrategy(config.strategies?.RSI),
      MACD: new MACDStrategy(config.strategies?.MACD)
    };
    
    // 缓存系统
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    
    // 性能统计
    this.stats = {
      totalAnalyses: 0,
      successfulAnalyses: 0,
      failedAnalyses: 0,
      averageResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    // 初始化日志
    this.initLogging();
  }
  
  /**
   * 初始化日志系统
   */
  initLogging() {
    const levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    this.log = (level, message, data = {}) => {
      const currentLevel = levels[this.config.logLevel] || 1;
      const messageLevel = levels[level] || 1;
      
      if (messageLevel >= currentLevel) {
        const timestamp = new Date().toISOString();
        const logEntry = {
          timestamp,
          level: level.toUpperCase(),
          message,
          ...data
        };
        
        if (level === 'error') {
          console.error(JSON.stringify(logEntry));
        } else if (level === 'warn') {
          console.warn(JSON.stringify(logEntry));
        } else {
          console.log(JSON.stringify(logEntry));
        }
      }
    };
  }
  
  /**
   * 分析单个交易对
   * @param {Object} options - 分析选项
   * @returns {Promise<Object>} 分析结果
   */
  async analyze(options = {}) {
    const startTime = Date.now();
    this.stats.totalAnalyses++;
    
    try {
      // 合并选项
      const analysisOptions = {
        symbol: options.symbol || this.config.defaultSymbol,
        timeframe: options.timeframe || this.config.defaultTimeframe,
        strategy: options.strategy || this.config.defaultStrategy,
        dataLimit: options.dataLimit || 100,
        includeMarketData: options.includeMarketData !== false,
        includeRiskAssessment: options.includeRiskAssessment !== false,
        includeRecommendations: options.includeRecommendations !== false,
        strategyParams: options.strategyParams || {},
        ...options
      };
      
      this.log('info', '开始分析', analysisOptions);
      
      // 检查缓存
      const cacheKey = this.generateCacheKey(analysisOptions);
      if (this.config.cacheEnabled) {
        const cachedResult = this.getFromCache(cacheKey);
        if (cachedResult) {
          this.stats.cacheHits++;
          this.log('debug', '缓存命中', { cacheKey });
          return {
            ...cachedResult,
            metadata: {
              ...cachedResult.metadata,
              cacheHit: true,
              responseTime: Date.now() - startTime
            }
          };
        }
        this.stats.cacheMisses++;
      }
      
      // 获取市场数据（模拟OKX CLI调用）
      const marketData = await this.fetchMarketData(analysisOptions);
      
      if (!marketData.success) {
        throw new Error(`获取市场数据失败: ${marketData.error}`);
      }
      
      // 执行策略分析
      const strategyResults = await this.executeStrategies(
        marketData.data, 
        analysisOptions
      );
      
      // 生成综合信号
      const compositeSignal = this.generateCompositeSignal(strategyResults);
      
      // 风险评估
      const riskAssessment = analysisOptions.includeRiskAssessment 
        ? this.assessRisk(strategyResults, marketData.data)
        : null;
      
      // 交易建议
      const recommendations = analysisOptions.includeRecommendations
        ? this.generateRecommendations(compositeSignal, riskAssessment, analysisOptions)
        : null;
      
      // 构建结果
      const result = {
        success: true,
        symbol: analysisOptions.symbol,
        timeframe: analysisOptions.timeframe,
        timestamp: new Date().toISOString(),
        currentPrice: marketData.data.currentPrice,
        marketCondition: marketData.data.marketCondition,
        strategies: strategyResults,
        compositeSignal: compositeSignal,
        riskAssessment: riskAssessment,
        recommendations: recommendations,
        summary: this.generateSummary(compositeSignal, riskAssessment, recommendations),
        metadata: {
          analysisTime: Date.now() - startTime,
          strategiesUsed: Object.keys(strategyResults).filter(k => strategyResults[k].success),
          dataPoints: marketData.data.prices?.length || 0,
          cacheKey: cacheKey,
          cacheHit: false
        }
      };
      
      // 更新性能统计
      const responseTime = Date.now() - startTime;
      this.stats.successfulAnalyses++;
      this.stats.averageResponseTime = 
        (this.stats.averageResponseTime * (this.stats.successfulAnalyses - 1) + responseTime) / 
        this.stats.successfulAnalyses;
      
      // 缓存结果
      if (this.config.cacheEnabled) {
        this.setCache(cacheKey, result);
      }
      
      this.log('info', '分析完成', {
        symbol: analysisOptions.symbol,
        signal: compositeSignal.type,
        confidence: compositeSignal.confidence,
        responseTime
      });
      
      return result;
      
    } catch (error) {
      this.stats.failedAnalyses++;
      const errorTime = Date.now() - startTime;
      
      this.log('error', '分析失败', {
        error: error.message,
        options,
        responseTime: errorTime
      });
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        signal: {
          type: 'NEUTRAL',
          confidence: 0,
          description: '分析失败'
        },
        recommendations: {
          action: 'HOLD',
          reason: '技术分析暂时不可用'
        },
        metadata: {
          analysisTime: errorTime,
          error: true
        }
      };
    }
  }
  
  /**
   * 批量分析多个交易对
   * @param {Array|string} symbols - 交易对列表或预设列表名称
   * @param {Object} options - 分析选项
   * @returns {Promise<Object>} 批量分析结果
   */
  async analyzeBatch(symbols, options = {}) {
    const startTime = Date.now();
    
    try {
      // 处理符号列表
      let symbolList = [];
      if (Array.isArray(symbols)) {
        symbolList = symbols;
      } else if (typeof symbols === 'string') {
        symbolList = this.parseSymbolList(symbols);
      } else {
        throw new Error('无效的符号列表格式');
      }
      
      // 限制批量大小
      const limitedSymbols = symbolList.slice(0, this.config.maxBatchSize);
      
      this.log('info', '开始批量分析', {
        totalSymbols: symbolList.length,
        analyzing: limitedSymbols.length,
        options
      });
      
      // 并行分析
      const analysisPromises = limitedSymbols.map(symbol => 
        this.analyze({
          ...options,
          symbol,
          includeMarketData: false, // 批量分析时减少数据获取
          cacheEnabled: false // 批量分析不使用缓存
        })
      );
      
      const results = await Promise.allSettled(analysisPromises);
      
      // 处理结果
      const successful = [];
      const failed = [];
      const buySignals = [];
      const sellSignals = [];
      const holdSignals = [];
      
      results.forEach((result, index) => {
        const symbol = limitedSymbols[index];
        
        if (result.status === 'fulfilled' && result.value.success) {
          successful.push({
            symbol,
            ...result.value
          });
          
          // 分类信号
          const signal = result.value.compositeSignal?.type;
          if (signal === 'BUY' || signal === 'STRONG_BUY') {
            buySignals.push({ symbol, ...result.value });
          } else if (signal === 'SELL' || signal === 'STRONG_SELL') {
            sellSignals.push({ symbol, ...result.value });
          } else {
            holdSignals.push({ symbol, ...result.value });
          }
        } else {
          const error = result.status === 'rejected' 
            ? result.reason.message 
            : result.value?.error || '未知错误';
          
          failed.push({
            symbol,
            error
          });
        }
      });
      
      // 计算最佳机会
      const topOpportunities = this.rankOpportunities(successful);
      
      // 构建批量报告
      const batchReport = {
        timestamp: new Date().toISOString(),
        totalSymbols: symbolList.length,
        analyzedSymbols: limitedSymbols.length,
        successfulAnalyses: successful.length,
        failedAnalyses: failed.length,
        summary: {
          buySignals: buySignals.length,
          sellSignals: sellSignals.length,
          holdSignals: holdSignals.length,
          averageConfidence: successful.length > 0 
            ? successful.reduce((sum, r) => sum + (r.compositeSignal?.confidence || 0), 0) / successful.length
            : 0,
          topOpportunities: topOpportunities.slice(0, 5)
        },
        results: successful,
        errors: failed.length > 0 ? failed : undefined,
        metadata: {
          analysisTime: Date.now() - startTime,
          batchSize: limitedSymbols.length,
          optionsUsed: options
        }
      };
      
      this.log('info', '批量分析完成', {
        total: batchReport.totalSymbols,
        success: batchReport.successfulAnalyses,
        failed: batchReport.failedAnalyses,
        buySignals: batchReport.summary.buySignals,
        analysisTime: batchReport.metadata.analysisTime
      });
      
      return batchReport;
      
    } catch (error) {
      this.log('error', '批量分析失败', {
        error: error.message,
        symbols,
        responseTime: Date.now() - startTime
      });
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        metadata: {
          analysisTime: Date.now() - startTime,
          error: true
        }
      };
    }
  }
  
  /**
   * 获取市场数据（模拟OKX CLI调用）
   */
  async fetchMarketData(options) {
    try {
      // 模拟OKX CLI命令调用
      // 实际实现应该调用: okx market ticker --symbol BTC/USDT
      // 和: okx market candles --symbol BTC/USDT --timeframe 1h --limit 100
      
      const { symbol, timeframe, dataLimit } = options;
      
      this.log('debug', '获取市场数据', { symbol, timeframe, dataLimit });
      
      // 模拟数据 - 实际应该从OKX CLI获取
      const mockData = this.generateMockMarketData(symbol, timeframe, dataLimit);
      
      return {
        success: true,
        data: mockData,
        metadata: {
          source: 'OKX CLI模拟数据',
          symbol,
          timeframe,
          dataPoints: mockData.prices.length,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        metadata: {
          source: 'OKX CLI',
          error: true
        }
      };
    }
  }
  
  /**
   * 生成模拟市场数据
   */
  generateMockMarketData(symbol, timeframe, limit) {
    // 基础价格（模拟）
    const basePrice = symbol.includes('BTC') ? 42500 :
                     symbol.includes('ETH') ? 2850 :
                     symbol.includes('SOL') ? 150 :
                     symbol.includes('BNB') ? 315 : 100;
    
    // 生成价格序列
    const prices = [];
    const volumes = [];
    const timestamps = [];
    
    const now = Date.now();
    const intervalMs = this.timeframeToMs(timeframe);
    
    // 添加一些随机波动
    let currentPrice = basePrice;
    for (let i = 0; i < limit; i++) {
      // 随机波动 (-2% 到 +2%)
      const change = (Math.random() * 0.04 - 0.02) * currentPrice;
      currentPrice += change;
      
      // 确保价格为正
      currentPrice = Math.max(currentPrice, basePrice * 0.5);
      
      prices.push({
        timestamp: new Date(now - (limit - i - 1) * intervalMs).toISOString(),
        open: currentPrice - change * 0.3,
        high: currentPrice + Math.abs(change) * 0.5,
        low: currentPrice - Math.abs(change) * 0.5,
        close: currentPrice,
        volume: Math.random() * 1000 + 500
      });
      
      volumes.push(prices[i].volume);
      timestamps.push(prices[i].timestamp);
    }
    
    // 计算市场状况
    const recentPrices = prices.slice(-20).map(p => p.close);
    const priceChange = recentPrices.length > 1 
      ? ((recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0]) * 100
      : 0;
    
    // 计算波动率
    const returns = [];
    for (let i = 1; i < recentPrices.length; i++) {
      returns.push(Math.abs((recentPrices[i] - recentPrices[i-1]) / recentPrices[i-1]));
    }
    const volatility = returns.length > 0 
      ? (returns.reduce((a, b) => a + b, 0) / returns.length) * 100
      : 0;
    
    return {
      symbol,
      timeframe,
      currentPrice: prices[prices.length - 1].close,
      prices: prices.map(p => p.close),
      ohlc: prices,
      volumes,
      timestamps,
      marketCondition: {
        trend: priceChange > 2 ? 'BULLISH' : priceChange < -2 ? 'BEARISH' : 'SIDEWAYS',
        volatility: volatility.toFixed(2),
        priceChange: priceChange.toFixed(2),
        volumeTrend: this.calculateVolumeTrend(volumes),
        support: basePrice * 0.95,
        resistance: basePrice * 1.05
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: prices.length,
        isMockData: true
      }
    };
  }
  
  /**
   * 时间周期转毫秒
   */
  timeframeToMs(timeframe) {
    const multipliers = {
      '1m': 60000,
      '5m': 300000,
      '15m': 900000,
      '30m': 1800000,
      '1h': 3600000,
      '4h': 14400000,
      '1d': 86400000,
      '1w': 604800000
    };
    
    return multipliers[timeframe] || 3600000; // 默认1小时
  }
  
  /**
   * 计算成交量趋势
   */
  calculateVolumeTrend(volumes) {
    if (volumes.length < 5) return 'NEUTRAL';
    
    const recent = volumes.slice(-5);
    const older = volumes.slice(-10, -5);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    if (recentAvg > olderAvg * 1.2) return 'INCREASING';
    if (recentAvg < olderAvg * 0.8) return 'DECREASING';
    return 'STABLE';
  }
  
  /**
   * 执行策略分析
   */
  async executeStrategies(marketData, options) {
    const results = {};
    const strategyNames = options.strategy === 'ALL' 
      ? Object.keys(this.strategies)
      : [options.strategy].filter(s => this.strategies[s]);
    
    for (const strategyName of strategyNames) {
      const strategy = this.strategies[strategyName];
      
      try {
        const strategyOptions = {
          ...options.strategyParams[strategyName],
          ...options
        };
        
        const result = strategy.analyze(marketData.prices, strategyOptions);
        results[strategyName] = result;
        
      } catch (error) {
        results[strategyName] = {
          success: false,
          error: error.message,
          strategy: strategyName
        };
      }
    }
    
    return results;
  }
  
  /**
   * 生成综合信号
   */
  generateCompositeSignal(strategyResults) {
    const successfulResults = Object.values(strategyResults)
      .filter(r => r.success);
    
    if (successfulResults.length === 0) {
      return {
        type: 'NEUTRAL',
        confidence: 0.3,
        description: '所有策略分析失败',
        source: 'ERROR'
      };
    }
    
    // 收集所有信号
    const signals = successfulResults.map(r => ({
      type: r.signal.type,
      strength: r.signal.strength || 0.5,
      confidence: r.confidence || 0.5,
      strategy: r.strategy
    }));
    
    // 按策略类型分组
    const buySignals = signals.filter(s => s.type.includes('BUY'));
    const sellSignals = signals.filter(s => s.type.includes('SELL'));
    const neutralSignals = signals.filter(s => s.type === 'NEUTRAL');
    
    // 确定主导信号
    let compositeType = 'NEUTRAL';
    let compositeConfidence = 0.5;
    let description = '';
    
    if (buySignals.length > 0 && sellSignals.length === 0) {
      // 只有买入信号
      const avgStrength = buySignals.reduce((sum, s) => sum + s.strength, 0) / buySignals.length;
      const avgConfidence = buySignals.reduce((sum, s) => sum + s.confidence, 0) / buySignals.length;
      
      compositeType = avgStrength > 0.7 ? 'STRONG_BUY' : 'BUY';
      compositeConfidence = avgConfidence;
      description = `${buySignals.length}个策略发出买入信号`;
      
    } else if (sellSignals.length > 0 && buySignals.length === 0) {
      // 只有卖出信号
      const avgStrength = sellSignals.reduce((sum, s) => sum + s.strength, 0) / sellSignals.length;
      const avgConfidence = sellSignals.reduce((sum, s) => sum + s.confidence, 0) / sellSignals.length;
      
      compositeType = avgStrength > 0.7 ? 'STRONG_SELL' : 'SELL';
      compositeConfidence = avgConfidence;
      description = `${sellSignals.length}个策略发出卖出信号`;
      
    } else if (buySignals.length > 0 && sellSignals.length > 0) {
      // 信号冲突
      const buyStrength = buySignals.reduce((sum, s) => sum + s.strength * s.confidence, 0);
      const sellStrength = sellSignals.reduce((sum, s) => sum + s.strength * s.confidence, 0);
      
      if (Math.abs(buyStrength - sellStrength) < 0.1) {
        compositeType = 'NEUTRAL';
        compositeConfidence = 0.4;
        description = '策略信号冲突，建议观望';
      } else if (buyStrength > sellStrength) {
        compositeType = 'BUY';
        compositeConfidence = (buyStrength - sellStrength) / buyStrength;
        description = '买入信号占优，但存在分歧';
      } else {
        compositeType = 'SELL';
        compositeConfidence = (sellStrength - buyStrength) / sellStrength;
        description = '卖出信号占优，但存在分歧';
      }
      
    } else {
      // 只有中性信号
      compositeType = 'NEUTRAL';
      compositeConfidence = neutralSignals.length > 0 
        ? neutralSignals.reduce((sum, s) => sum + s.confidence, 0) / neutralSignals.length
        : 0.5;
      description = '所有策略显示中性信号';
    }
    
    // 根据策略数量调整置信度
    if (successfulResults.length >= 2) {
      compositeConfidence = Math.min(0.95, compositeConfidence * 1.1);
    }
    
    return {
      type: compositeType,
      confidence: Math.max(0.3, Math.min(0.95, compositeConfidence)),
      description,
      source: successfulResults.map(r => r.strategy).join('+'),
      strategyDetails: successfulResults.map(r => ({
        strategy: r.strategy,
        signal: r.signal.type,
        confidence: r.confidence
      }))
    };
  }
  
  /**
   * 风险评估
   */
  assessRisk(strategyResults, marketData) {
    const successfulResults = Object.values(strategyResults)
      .filter(r => r.success);
    
    if (successfulResults.length === 0) {
      return {
        level: 'HIGH',
        score: 80,
        description: '策略分析失败，高风险',
        factors: ['技术分析不可用']
      };
    }
    
    // 收集风险分数
    const riskScores = successfulResults
      .map(r => r.riskAssessment?.score || 50)
      .filter(score => score !== undefined);
    
    const avgRiskScore = riskScores.length > 0
      ? riskScores.reduce((a, b) => a + b, 0) / riskScores.length
      : 50;
    
    // 考虑市场波动性
    const marketVolatility = parseFloat(marketData.marketCondition.volatility) || 0;
    const adjustedScore = avgRiskScore + (marketVolatility * 5);
    
    // 确定风险等级
    let level, description;
    if (adjustedScore >= 70) {
      level = 'HIGH';
      description = '高风险，建议谨慎操作';
    } else if (adjustedScore >= 40) {
      level = 'MEDIUM';
      description = '中等风险，建议中等仓位';
    } else {
      level = 'LOW';
      description = '低风险，适合操作';
    }
    
    // 收集风险因素
    const factors = [];
    
    // 市场风险因素
    if (marketVolatility > 10) factors.push(`高波动性: ${marketVolatility.toFixed(1)}%`);
    if (marketData.marketCondition.trend === 'BEARISH') factors.push('市场处于下跌趋势');
    
    // 策略风险因素
    successfulResults.forEach(r => {
      if (r.riskAssessment?.factors) {
        factors.push(...r.riskAssessment.factors);
      }
    });
    
    // 去重
    const uniqueFactors = [...new Set(factors)];
    
    return {
      level,
      score: Math.min(100, Math.max(0, adjustedScore)),
      description,
      factors: uniqueFactors.slice(0, 5), // 最多显示5个因素
      marketCondition: marketData.marketCondition
    };
  }
  
  /**
   * 生成交易建议
   */
  generateRecommendations(signal, riskAssessment, options) {
    const baseRecommendation = {
      action: 'HOLD',
      confidence: signal.confidence,
      riskLevel: riskAssessment?.level || 'MEDIUM',
      timestamp: new Date().toISOString(),
      details: []
    };
    
    // 根据信号类型生成建议
    switch (signal.type) {
      case 'STRONG_BUY':
        baseRecommendation.action = 'BUY';
        baseRecommendation.details.push('强烈买入信号，多个策略确认');
        break;
        
      case 'BUY':
        baseRecommendation.action = 'BUY';
        baseRecommendation.details.push('买入信号，建议建仓');
        break;
        
      case 'STRONG_SELL':
        baseRecommendation.action = 'SELL';
        baseRecommendation.details.push('强烈卖出信号，建议减仓或清仓');
        break;
        
      case 'SELL':
        baseRecommendation.action = 'SELL';
        baseRecommendation.details.push('卖出信号，建议部分减仓');
        break;
        
      default:
        baseRecommendation.action = 'HOLD';
        baseRecommendation.details.push('无明显交易信号，建议观望');
    }
    
    // 根据风险等级调整建议
    if (riskAssessment) {
      const { level, score } = riskAssessment;
      
      // 仓位建议
      let positionSize;
      if (level === 'LOW') {
        positionSize = baseRecommendation.action === 'BUY' ? '中等仓位 (15-25%)' : '逐步减仓';
        baseRecommendation.details.push('低风险环境，适合操作');
      } else if (level === 'MEDIUM') {
        positionSize = baseRecommendation.action === 'BUY' ? '小仓位 (5-15%)' : '部分减仓';
        baseRecommendation.details.push('中等风险，建议谨慎操作');
      } else {
        positionSize = baseRecommendation.action === 'BUY' ? '极小仓位 (<5%) 或观望' : '强烈建议减仓';
        baseRecommendation.details.push('高风险警告，严格控制仓位');
      }
      
      if (positionSize) {
        baseRecommendation.positionSize = positionSize;
        baseRecommendation.details.push(`建议仓位: ${positionSize}`);
      }
      
      // 止损建议
      const stopLossPercent = level === 'HIGH' ? 3 : level === 'MEDIUM' ? 5 : 8;
      baseRecommendation.stopLoss = `${stopLossPercent}%`;
      baseRecommendation.details.push(`止损位: ${stopLossPercent}%`);
      
      // 止盈建议
      const takeProfitPercent = stopLossPercent * 2; // 风险回报比 2:1
      baseRecommendation.takeProfit = `${takeProfitPercent}%`;
      baseRecommendation.details.push(`止盈位: ${takeProfitPercent}% (风险回报比 2:1)`);
      
      // 时间框架
      baseRecommendation.timeHorizon = '1-4周';
      baseRecommendation.details.push('预期持有时间: 1-4周');
    }
    
    // 添加信号说明
    baseRecommendation.details.push(`信号说明: ${signal.description}`);
    
    return baseRecommendation;
  }
  
  /**
   * 生成摘要
   */
  generateSummary(signal, riskAssessment, recommendations) {
    return {
      symbol: this.config.defaultSymbol,
      action: signal.type,
      confidence: `${(signal.confidence * 100).toFixed(1)}%`,
      riskLevel: riskAssessment?.level || 'UNKNOWN',
      expectedReturn: '5-15%',
      keyRecommendation: recommendations?.details?.[0] || '建议观望',
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * 解析符号列表
   */
  parseSymbolList(listName) {
    const predefinedLists = {
      top10: [
        'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT',
        'ADA/USDT', 'AVAX/USDT', 'DOGE/USDT', 'DOT/USDT', 'TRX/USDT'
      ],
      top20: [
        'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT',
        'ADA/USDT', 'AVAX/USDT', 'DOGE/USDT', 'DOT/USDT', 'TRX/USDT',
        'MATIC/USDT', 'LTC/USDT', 'LINK/USDT', 'ATOM/USDT', 'UNI/USDT',
        'XLM/USDT', 'ETC/USDT', 'ICP/USDT', 'FIL/USDT', 'ALGO/USDT'
      ],
      defi: [
        'UNI/USDT', 'AAVE/USDT', 'COMP/USDT', 'MKR/USDT', 'SNX/USDT',
        'CRV/USDT', 'SUSHI/USDT', 'YFI/USDT', 'BAL/USDT', '1INCH/USDT'
      ],
      layer1: [
        'ETH/USDT', 'SOL/USDT', 'AVAX/USDT', 'DOT/USDT', 'ATOM/USDT',
        'ADA/USDT', 'ALGO/USDT', 'NEAR/USDT', 'FTM/USDT', 'ONE/USDT'
      ]
    };
    
    return predefinedLists[listName] || [listName];
  }
  
  /**
   * 排序机会
   */
  rankOpportunities(results) {
    return results
      .filter(r => r.compositeSignal && r.compositeSignal.type !== 'NEUTRAL')
      .map(r => ({
        symbol: r.symbol,
        action: r.compositeSignal.type,
        confidence: r.compositeSignal.confidence,
        signalStrength: this.calculateSignalStrength(r),
        riskScore: r.riskAssessment?.score || 50,
        score: this.calculateOpportunityScore(r)
      }))
      .sort((a, b) => b.score - a.score);
  }
  
  /**
   * 计算信号强度
   */
  calculateSignalStrength(result) {
    const signal = result.compositeSignal;
    if (!signal) return 0;
    
    let strength = signal.confidence;
    
    // 增强强烈信号的强度
    if (signal.type === 'STRONG_BUY' || signal.type === 'STRONG_SELL') {
      strength *= 1.2;
    }
    
    // 考虑策略数量
    const strategyCount = Object.keys(result.strategies || {}).length;
    if (strategyCount >= 2) {
      strength *= 1.1;
    }
    
    return Math.min(1, strength);
  }
  
  /**
   * 计算机会分数
   */
  calculateOpportunityScore(result) {
    const signalStrength = this.calculateSignalStrength(result);
    const riskScore = result.riskAssessment?.score || 50;
    const riskFactor = 1 - (riskScore / 100); // 风险越低，分数越高
    
    return signalStrength * riskFactor * 10;
  }
  
  /**
   * 生成缓存键
   */
  generateCacheKey(options) {
    const { symbol, timeframe, strategy, dataLimit, strategyParams } = options;
    const paramsStr = JSON.stringify(strategyParams || {});
    return `${symbol}:${timeframe}:${strategy}:${dataLimit}:${paramsStr}`;
  }
  
  /**
   * 从缓存获取
   */
  getFromCache(key) {
    if (!this.config.cacheEnabled) return null;
    
    const cached = this.cache.get(key);
    const timestamp = this.cacheTimestamps.get(key);
    
    if (cached && timestamp) {
      const age = Date.now() - timestamp;
      if (age < this.config.cacheTTL) {
        return cached;
      } else {
        // 缓存过期，清理
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
    
    return null;
  }
  
  /**
   * 设置缓存
   */
  setCache(key, value) {
    if (!this.config.cacheEnabled) return;
    
    this.cache.set(key, value);
    this.cacheTimestamps.set(key, Date.now());
    
    // 清理过期缓存
    this.cleanupCache();
  }
  
  /**
   * 清理缓存
   */
  cleanupCache() {
    const now = Date.now();
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (now - timestamp > this.config.cacheTTL * 2) {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
  }
  
  /**
   * 获取分析历史
   */
  getAnalysisHistory(filters = {}) {
    // 这里应该从数据库或文件系统获取历史记录
    // 目前返回空数组，实际实现需要存储历史记录
    return {
      success: true,
      history: [],
      total: 0,
      filters,
      metadata: {
        timestamp: new Date().toISOString(),
        note: '历史记录功能需要实现数据存储'
      }
    };
  }
  
  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    return {
      ...this.stats,
      timestamp: new Date().toISOString(),
      cacheSize: this.cache.size,
      strategies: Object.keys(this.strategies).map(name => ({
        name,
        info: this.strategies[name].getInfo?.() || {}
      }))
    };
  }
  
  /**
   * 重置技能状态
   */
  reset() {
    this.cache.clear();
    this.cacheTimestamps.clear();
    this.stats = {
      totalAnalyses: 0,
      successfulAnalyses: 0,
      failedAnalyses: 0,
      averageResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    this.log('info', '技能状态已重置');
    
    return {
      success: true,
      message: '技能状态已重置',
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    // 更新策略配置
    if (newConfig.strategies) {
      Object.keys(newConfig.strategies).forEach(strategyName => {
        if (this.strategies[strategyName] && this.strategies[strategyName].updateConfig) {
          this.strategies[strategyName].updateConfig(newConfig.strategies[strategyName]);
        }
      });
    }
    
    this.log('info', '配置已更新', {
      oldConfig,
      newConfig: this.config
    });
    
    return {
      success: true,
      oldConfig,
      newConfig: this.config,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * 获取技能信息
   */
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      config: this.config,
      strategies: Object.keys(this.strategies).map(name => ({
        name,
        ...this.strategies[name].getInfo?.() || { description: '未知策略' }
      })),
      stats: this.stats,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = TradingStrategySkill;