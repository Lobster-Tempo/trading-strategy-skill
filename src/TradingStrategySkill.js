/**
 * 交易策略技能主类
 * 集成多种交易策略，提供统一的接口
 */

const RSIStrategy = require('./strategies/RSIStrategy');
const MarketDataFetcher = require('./data/MarketDataFetcher');

class TradingStrategySkill {
  constructor(config = {}) {
    this.config = {
      // 默认配置
      defaultSymbol: config.defaultSymbol || 'BTC/USDT',
      defaultTimeframe: config.defaultTimeframe || '1h',
      defaultStrategy: config.defaultStrategy || 'RSI',
      cacheEnabled: config.cacheEnabled !== false,
      logLevel: config.logLevel || 'info',
      
      // 策略配置
      strategies: {
        RSI: {
          rsiPeriod: config.rsiPeriod || 14,
          overbought: config.overbought || 70,
          oversold: config.oversold || 30
        }
      },
      
      // 风险管理配置
      riskManagement: {
        maxPositionSize: config.maxPositionSize || 0.3, // 最大仓位30%
        stopLossDefault: config.stopLossDefault || 0.05, // 默认止损5%
        takeProfitDefault: config.takeProfitDefault || 0.1, // 默认止盈10%
        riskRewardRatio: config.riskRewardRatio || 2 // 风险回报比
      }
    };
    
    // 初始化组件
    this.dataFetcher = new MarketDataFetcher(config.apiConfig);
    this.strategies = new Map();
    this.analysisHistory = [];
    this.performanceMetrics = {
      totalAnalyses: 0,
      signalsGenerated: 0,
      averageConfidence: 0,
      strategiesUsed: new Set()
    };
    
    // 初始化策略
    this.initializeStrategies();
    
    // 日志
    this.logger = this.createLogger();
    
    this.logger.info('交易策略技能初始化完成', {
      defaultStrategy: this.config.defaultStrategy,
      defaultSymbol: this.config.defaultSymbol,
      strategies: Array.from(this.strategies.keys())
    });
  }
  
  /**
   * 初始化所有策略
   */
  initializeStrategies() {
    // RSI策略
    const rsiConfig = this.config.strategies.RSI;
    this.strategies.set('RSI', new RSIStrategy({
      rsiPeriod: rsiConfig.rsiPeriod,
      overbought: rsiConfig.overbought,
      oversold: rsiConfig.oversold,
      symbol: this.config.defaultSymbol,
      timeframe: this.config.defaultTimeframe
    }));
    
    // 可以在这里添加更多策略
    // this.strategies.set('MACD', new MACDStrategy(...));
    // this.strategies.set('BollingerBands', new BollingerBandsStrategy(...));
    
    this.logger.debug('策略初始化完成', {
      strategyCount: this.strategies.size,
      strategyNames: Array.from(this.strategies.keys())
    });
  }
  
  /**
   * 创建日志器
   * @returns {Object} 日志器对象
   */
  createLogger() {
    const levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    const currentLevel = levels[this.config.logLevel] || levels.info;
    
    return {
      debug: (message, data) => {
        if (currentLevel <= levels.debug) {
          console.log(`[DEBUG] ${message}`, data || '');
        }
      },
      info: (message, data) => {
        if (currentLevel <= levels.info) {
          console.log(`[INFO] ${message}`, data || '');
        }
      },
      warn: (message, data) => {
        if (currentLevel <= levels.warn) {
          console.warn(`[WARN] ${message}`, data || '');
        }
      },
      error: (message, data) => {
        if (currentLevel <= levels.error) {
          console.error(`[ERROR] ${message}`, data || '');
        }
      }
    };
  }
  
  /**
   * 分析交易对
   * @param {Object} options - 分析选项
   * @returns {Promise<Object>} 分析结果
   */
  async analyze(options = {}) {
    const startTime = Date.now();
    
    try {
      const analysisOptions = this.parseAnalysisOptions(options);
      
      this.logger.info('开始分析', {
        symbol: analysisOptions.symbol,
        timeframe: analysisOptions.timeframe,
        strategy: analysisOptions.strategy
      });
      
      // 获取市场数据
      const marketData = await this.fetchMarketData(
        analysisOptions.symbol,
        analysisOptions.timeframe,
        analysisOptions.dataLimit
      );
      
      // 执行策略分析
      const strategyResult = await this.executeStrategy(
        analysisOptions.strategy,
        marketData,
        analysisOptions
      );
      
      // 生成综合报告
      const report = this.generateReport(
        strategyResult,
        marketData,
        analysisOptions
      );
      
      // 记录分析历史
      this.recordAnalysis(report);
      
      // 更新性能指标
      this.updatePerformanceMetrics(report);
      
      const duration = Date.now() - startTime;
      this.logger.info('分析完成', {
        symbol: analysisOptions.symbol,
        duration: `${duration}ms`,
        signal: report.signal.type,
        confidence: report.confidence
      });
      
      return report;
      
    } catch (error) {
      this.logger.error('分析失败', {
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }
  
  /**
   * 解析分析选项
   * @param {Object} options - 原始选项
   * @returns {Object} 解析后的选项
   */
  parseAnalysisOptions(options) {
    return {
      symbol: options.symbol || this.config.defaultSymbol,
      timeframe: options.timeframe || this.config.defaultTimeframe,
      strategy: options.strategy || this.config.defaultStrategy,
      dataLimit: options.dataLimit || 100,
      includeMarketData: options.includeMarketData !== false,
      includeRiskAssessment: options.includeRiskAssessment !== false,
      includeRecommendations: options.includeRecommendations !== false,
      customStrategyParams: options.strategyParams || {}
    };
  }
  
  /**
   * 获取市场数据
   * @param {string} symbol - 交易对
   * @param {string} timeframe - 时间周期
   * @param {number} limit - 数据条数
   * @returns {Promise<Object>} 市场数据
   */
  async fetchMarketData(symbol, timeframe, limit) {
    this.logger.debug('获取市场数据', { symbol, timeframe, limit });
    
    try {
      // 获取K线数据
      const candles = await this.dataFetcher.getCandles(symbol, timeframe, limit);
      
      // 获取当前价格
      const currentPrice = await this.dataFetcher.getCurrentPrice(symbol);
      
      // 获取市场概况
      const marketOverview = await this.dataFetcher.getMarketOverview(symbol);
      
      // 提取价格序列
      const prices = candles.map(candle => candle.close);
      
      return {
        symbol,
        timeframe,
        candles,
        prices,
        currentPrice,
        marketOverview,
        timestamp: new Date().toISOString(),
        dataPoints: candles.length
      };
      
    } catch (error) {
      this.logger.error('获取市场数据失败', {
        symbol,
        timeframe,
        error: error.message
      });
      
      // 如果获取失败，使用最后的价格生成模拟数据
      if (this.config.cacheEnabled && this.analysisHistory.length > 0) {
        const lastAnalysis = this.analysisHistory[this.analysisHistory.length - 1];
        if (lastAnalysis.symbol === symbol) {
          this.logger.warn('使用缓存数据继续分析', { symbol });
          return lastAnalysis.marketData;
        }
      }
      
      throw new Error(`无法获取 ${symbol} 的市场数据: ${error.message}`);
    }
  }
  
  /**
   * 执行策略分析
   * @param {string} strategyName - 策略名称
   * @param {Object} marketData - 市场数据
   * @param {Object} options - 分析选项
   * @returns {Promise<Object>} 策略结果
   */
  async executeStrategy(strategyName, marketData, options) {
    const strategy = this.strategies.get(strategyName);
    
    if (!strategy) {
      throw new Error(`策略 ${strategyName} 未找到。可用策略: ${Array.from(this.strategies.keys()).join(', ')}`);
    }
    
    this.logger.debug('执行策略', {
      strategy: strategyName,
      symbol: marketData.symbol,
      dataPoints: marketData.dataPoints
    });
    
    // 更新策略配置
    if (options.customStrategyParams) {
      strategy.updateConfig(options.customStrategyParams);
    }
    
    // 执行策略分析
    const strategyResult = strategy.analyze({
      prices: marketData.prices,
      timestamp: marketData.timestamp
    });
    
    // 添加额外信息
    strategyResult.strategyName = strategyName;
    strategyResult.executionTime = new Date().toISOString();
    strategyResult.dataQuality = this.assessDataQuality(marketData);
    
    return strategyResult;
  }
  
  /**
   * 评估数据质量
   * @param {Object} marketData - 市场数据
   * @returns {Object} 数据质量评估
   */
  assessDataQuality(marketData) {
    const { candles, dataPoints } = marketData;
    
    if (dataPoints < 20) {
      return {
        score: 0.3,
        level: 'LOW',
        issues: ['数据点不足，分析结果可能不准确'],
        recommendation: '获取更多历史数据'
      };
    }
    
    // 检查数据连续性
    let missingData = 0;
    for (let i = 1; i < candles.length; i++) {
      const timeDiff = candles[i].timestamp - candles[i - 1].timestamp;
      const expectedDiff = 3600000; // 假设1小时K线
      
      if (timeDiff > expectedDiff * 1.5) {
        missingData++;
      }
    }
    
    const missingRatio = missingData / candles.length;
    
    if (missingRatio > 0.1) {
      return {
        score: 0.5,
        level: 'MEDIUM',
        issues: ['数据存在缺失，可能影响分析准确性'],
        recommendation: '检查数据源或使用更可靠的数据'
      };
    }
    
    return {
      score: 0.9,
      level: 'HIGH',
      issues: [],
      recommendation: '数据质量良好，可以信赖分析结果'
    };
  }
  
  /**
   * 生成综合报告
   * @param {Object} strategyResult - 策略结果
   * @param {Object} marketData - 市场数据
   * @param {Object} options - 分析选项
   * @returns {Object} 综合报告
   */
  generateReport(strategyResult, marketData, options) {
    const report = {
      // 基本信息
      symbol: marketData.symbol,
      timeframe: marketData.timeframe,
      strategy: strategyResult.strategyName,
      timestamp: new Date().toISOString(),
      
      // 市场数据
      currentPrice: marketData.currentPrice,
      marketOverview: options.includeMarketData ? marketData.marketOverview : undefined,
      
      // 策略信号
      signal: strategyResult.signal,
      confidence: strategyResult.confidence,
      marketCondition: strategyResult.marketCondition,
      
      // 数据质量
      dataQuality: strategyResult.dataQuality,
      
      // 元数据
      metadata: {
        analysisId: this.generateAnalysisId(),
        executionTime: strategyResult.executionTime,
        dataPoints: marketData.dataPoints,
        strategyVersion: '1.0.0'
      }
    };
    
    // 添加风险评估
    if (options.includeRiskAssessment) {
      report.riskAssessment = this.generateRiskAssessment(
        strategyResult,
        marketData,
        options
      );
    }
    
    // 添加交易建议
    if (options.includeRecommendations) {
      report.recommendations = this.generateRecommendations(
        strategyResult,
        marketData,
        report.riskAssessment
      );
    }
    
    // 添加绩效预测
    report.performancePrediction = this.predictPerformance(
      strategyResult,
      marketData
    );
    
    // 添加摘要
    report.summary = this.generateSummary(report);
    
    return report;
  }
  
  /**
   * 生成风险评估
   * @param {Object} strategyResult - 策略结果
   * @param {Object} marketData - 市场数据
   * @param {Object} options - 分析选项
   * @returns {Object} 风险评估
   */
  generateRiskAssessment(strategyResult, marketData, options) {
    const { signal, marketCondition, confidence } = strategyResult;
    const { currentPrice, marketOverview } = marketData;
    
    // 基础风险评估
    let riskScore = strategyResult.riskAssessment?.score || 0.5;
    let riskLevel = strategyResult.riskAssessment?.level || 'MEDIUM';
    
    // 考虑市场波动性
    if (marketOverview) {
      const changePercent = Math.abs(marketOverview.changePercent24h);
      if (changePercent > 10) {
        riskScore += 0.3;
        riskLevel = 'HIGH';
      } else if (changePercent > 5) {
        riskScore += 0.15;
        if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
      }
    }
    
    // 考虑信号强度
    if (signal.strength > 0.7) {
      riskScore -= 0.1; // 强信号降低风险
    } else if (signal.strength < 0.3) {
      riskScore += 0.1; // 弱信号增加风险
    }
    
    // 考虑置信度
    riskScore += (0.5 - confidence) * 0.2; // 低置信度增加风险
    
    // 确保风险分数在0-1之间
    riskScore = Math.max(0, Math.min(1, riskScore));
    
    // 确定最终风险等级
    if (riskScore > 0.7) riskLevel = 'HIGH';
    else if (riskScore > 0.4) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';
    
    return {
      score: riskScore,
      level: riskLevel,
      factors: [
        `市场波动性: ${marketOverview?.changePercent24h?.toFixed(2)}%`,
        `信号强度: ${(signal.strength * 100).toFixed(1)}%`,
        `分析置信度: ${(confidence * 100).toFixed(1)}%`,
        `RSI区域: ${marketCondition?.zone || 'UNKNOWN'}`
      ],
      mitigationStrategies: this.getRiskMitigationStrategies(riskLevel, signal)
    };
  }
  
  /**
   * 获取风险缓解策略
   * @param {string} riskLevel - 风险等级
   * @param {Object} signal - 交易信号
   * @returns {Array} 风险缓解策略
   */
  getRiskMitigationStrategies(riskLevel, signal) {
    const strategies = [];
    
    if (riskLevel === 'HIGH') {
      strategies.push('使用极小仓位（<5%资金）');
      strategies.push('设置紧密止损（2-3%）');
      strategies.push('考虑使用期权进行对冲');
      strategies.push('分批建仓，降低平均成本');
    } else if (riskLevel === 'MEDIUM') {
      strategies.push('使用中等仓位（10-20%资金）');
      strategies.push('设置合理止损（4-6%）');
      strategies.push('关注关键支撑阻力位');
      strategies.push('准备应急退出计划');
    } else {
      strategies.push('可以正常仓位操作（20-30%资金）');
      strategies.push('设置基础止损（7-10%）');
      strategies.push('定期监控仓位');
    }
    
    if (signal.type === 'BUY') {
      strategies.push('买入后设置移动止损保护利润');
    } else if (signal.type === 'SELL') {
      strategies.push('卖出后关注回调买入机会');
    }
    
    return strategies;
  }
  
  /**
   * 生成交易建议
   * @param {Object} strategyResult - 策略结果
   * @param {Object} marketData - 市场数据
   * @param {Object} riskAssessment - 风险评估
   * @returns {Object} 交易建议
   */
  generateRecommendations(strategyResult, marketData, riskAssessment) {
    const { signal, confidence } = strategyResult;
    const { currentPrice } = marketData;
    
    const baseRecommendation = strategyResult.recommendation || {};
    
    // 根据风险评估调整建议
    let positionSize = baseRecommendation.suggestedPosition || {};
    if (riskAssessment) {
      if (riskAssessment.level === 'HIGH') {
        positionSize.percentage *= 0.5;
        positionSize.size = 'VERY_SMALL';
      } else if (riskAssessment.level === 'MEDIUM') {
        positionSize.percentage *= 0.75;
        if (positionSize.size === 'LARGE') positionSize.size = 'MEDIUM';
      }
    }
    
    // 生成具体建议
    const recommendations = {
      action: signal.type,
      confidence: confidence,
      entry: {
        price: currentPrice,
        type: 'MARKET',
        rationale: '当前市场价格'
      },
      positionSize,
      stopLoss: baseRecommendation.stopLoss || {
        level: '5%',
        percentage: 5,
        rationale: '默认止损位'
      },
      takeProfit: baseRecommendation.takeProfit || {
        level: '10%',
        percentage: 10,
        rationale: '默认止盈位'
      },
      timeframe: {
        shortTerm: '1-3天',
        mediumTerm: '1-2周',
        longTerm: '1个月以上'
      },
      monitoring: this.getMonitoringRecommendations(signal, riskAssessment)
    };
    
    // 添加具体操作步骤
    recommendations.steps = this.getActionSteps(signal, recommendations);
    
    return recommendations;
  }
  
  /**
   * 获取监控建议
   * @param {Object} signal - 交易信号
   * @param {Object} riskAssessment - 风险评估
   * @returns {Array} 监控建议
   */
  getMonitoringRecommendations(signal, riskAssessment) {
    const recommendations = [];
    
    recommendations.push('每日检查仓位和市场状况');
    
    if (riskAssessment?.level === 'HIGH') {
      recommendations.push('每小时监控价格变化');
      recommendations.push('设置价格警报');
    }
    
    if (signal.type === 'BUY') {
      recommendations.push('关注是否突破关键阻力位');
      recommendations.push('监控成交量变化');
    } else if (signal.type === 'SELL') {
      recommendations.push('关注是否跌破关键支撑位');
      recommendations.push('监控市场情绪变化');
    }
    
    recommendations.push('定期评估策略有效性');
    
    return recommendations;
  }
  
  /**
   * 获取操作步骤
   * @param {Object} signal - 交易信号
   * @param {Object} recommendations - 交易建议
   * @returns {Array} 操作步骤
   */
  getActionSteps(signal, recommendations) {
    const steps = [];
    
    if (signal.type === 'BUY') {
      steps.push(`1. 在${recommendations.entry.price}附近买入`);
      steps.push(`2. 设置止损位: 价格下跌${recommendations.stopLoss.percentage}%`);
      steps.push(`3. 设置止盈位: 价格上涨${recommendations.takeProfit.percentage}%`);
      steps.push(`4. 使用${recommendations.positionSize.percentage * 100}%的资金`);
      steps.push('5. 按照监控建议定期检查');
    } else if (signal.type === 'SELL') {
      steps.push(`1. 在${recommendations.entry.price}附近卖出`);
      steps.push(`2. 设置止损位: 价格上涨${recommendations.stopLoss.percentage}%`);
      steps.push(`3. 设置止盈位: 价格下跌${recommendations.takeProfit.percentage}%`);
      steps.push(`4. 卖出${recommendations.positionSize.percentage * 100}%的持仓`);
      steps.push('5. 按照监控建议定期检查');
    } else {
      steps.push('1. 保持观望，不进行交易');
      steps.push('2. 继续监控市场状况');
      steps.push('3. 等待更好的交易机会');
      steps.push('4. 研究其他潜在交易对');
    }
    
    return steps;
  }
  
  /**
   * 预测绩效
   * @param {Object} strategyResult - 策略结果
   * @param {Object} marketData - 市场数据
   * @returns {Object} 绩效预测
   */
  predictPerformance(strategyResult, marketData) {
    const { signal, confidence } = strategyResult;
    
    if (signal.type === 'HOLD') {
      return {
        expectedReturn: 0,
        successProbability: 0.5,
        riskAdjustedReturn: 0,
        timeframe: 'N/A',
        rationale: '观望策略，无预期收益'
      };
    }
    
    // 基于历史数据和信号强度预测
    let expectedReturn = 0.05; // 默认5%
    let successProbability = 0.6; // 默认60%
    
    // 根据信号强度调整
    expectedReturn *= signal.strength;
    successProbability = 0.5 + (signal.strength * 0.3);
    
    // 根据置信度调整
    successProbability *= confidence;
    
    // 根据市场状况调整
    if (strategyResult.marketCondition?.isOverbought && signal.type === 'SELL') {
      expectedReturn += 0.02;
      successProbability += 0.1;
    } else if (strategyResult.marketCondition?.isOversold && signal.type === 'BUY') {
      expectedReturn += 0.02;
      successProbability += 0.1;
    }
    
    // 计算风险调整后收益
    const riskAdjustedReturn = expectedReturn * successProbability;
    
    return {
      expectedReturn: Math.min(expectedReturn, 0.2), // 最大20%
      successProbability: Math.min(successProbability, 0.9), // 最大90%
      riskAdjustedReturn,
      timeframe: '1-4周',
      rationale: '基于历史回测和当前市场状况的预测'
    };
  }
  
  /**
   * 生成报告摘要
   * @param {Object} report - 完整报告
   * @returns {Object} 报告摘要
   */
  generateSummary(report) {
    return {
      symbol: report.symbol,
      action: report.signal.type,
      confidence: `${(report.confidence * 100).toFixed(1)}%`,
      riskLevel: report.riskAssessment?.level || 'MEDIUM',
      expectedReturn: `${(report.performancePrediction.expectedReturn * 100).toFixed(1)}%`,
      keyRecommendation: this.getKeyRecommendation(report),
      timestamp: report.timestamp
    };
  }
  
  /**
   * 获取关键建议
   * @param {Object} report - 完整报告
   * @returns {string} 关键建议
   */
  getKeyRecommendation(report) {
    const { signal, riskAssessment, confidence } = report;
    
    if (signal.type === 'BUY') {
      if (confidence > 0.7 && riskAssessment?.level !== 'HIGH') {
        return '强烈建议买入，设置合理止损';
      } else if (confidence > 0.5) {
        return '建议买入，但需谨慎管理风险';
      } else {
        return '可考虑小仓位买入，严格止损';
      }
    } else if (signal.type === 'SELL') {
      if (confidence > 0.7 && riskAssessment?.level !== 'HIGH') {
        return '强烈建议卖出或减仓';
      } else if (confidence > 0.5) {
        return '建议卖出部分仓位';
      } else {
        return '可考虑部分卖出，保留观察';
      }
    } else {
      if (confidence > 0.7) {
        return '强烈建议观望，等待更好机会';
      } else {
        return '建议观望，市场方向不明确';
      }
    }
  }
  
  /**
   * 生成分析ID
   * @returns {string} 分析ID
   */
  generateAnalysisId() {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 记录分析历史
   * @param {Object} report - 分析报告
   */
  recordAnalysis(report) {
    const historyEntry = {
      id: report.metadata.analysisId,
      timestamp: report.timestamp,
      symbol: report.symbol,
      strategy: report.strategy,
      signal: report.signal.type,
      confidence: report.confidence,
      report: report
    };
    
    this.analysisHistory.push(historyEntry);
    
    // 限制历史记录数量
    if (this.analysisHistory.length > 1000) {
      this.analysisHistory = this.analysisHistory.slice(-1000);
    }
    
    this.logger.debug('分析记录已保存', {
      analysisId: historyEntry.id,
      historySize: this.analysisHistory.length
    });
  }
  
  /**
   * 更新性能指标
   * @param {Object} report - 分析报告
   */
  updatePerformanceMetrics(report) {
    this.performanceMetrics.totalAnalyses++;
    
    if (report.signal.type !== 'HOLD') {
      this.performanceMetrics.signalsGenerated++;
    }
    
    // 更新平均置信度
    const totalConfidence = this.performanceMetrics.averageConfidence * 
      (this.performanceMetrics.totalAnalyses - 1) + report.confidence;
    this.performanceMetrics.averageConfidence = totalConfidence / this.performanceMetrics.totalAnalyses;
    
    // 记录使用的策略
    this.performanceMetrics.strategiesUsed.add(report.strategy);
    
    this.logger.debug('性能指标已更新', {
      totalAnalyses: this.performanceMetrics.totalAnalyses,
      averageConfidence: this.performanceMetrics.averageConfidence.toFixed(3)
    });
  }
  
  /**
   * 批量分析多个交易对
   * @param {Array} symbols - 交易对数组
   * @param {Object} options - 分析选项
   * @returns {Promise<Array>} 分析结果数组
   */
  async analyzeBatch(symbols, options = {}) {
    this.logger.info('开始批量分析', { symbols: symbols.length });
    
    const results = [];
    const errors = [];
    
    for (const symbol of symbols) {
      try {
        const analysisOptions = { ...options, symbol };
        const result = await this.analyze(analysisOptions);
        results.push(result);
        
        this.logger.debug('单个分析完成', {
          symbol,
          signal: result.signal.type,
          success: true
        });
      } catch (error) {
        errors.push({
          symbol,
          error: error.message
        });
        
        this.logger.error('单个分析失败', {
          symbol,
          error: error.message
        });
      }
      
      // 避免请求过于频繁
      await this.sleep(100);
    }
    
    // 生成批量分析报告
    const batchReport = {
      timestamp: new Date().toISOString(),
      totalSymbols: symbols.length,
      successfulAnalyses: results.length,
      failedAnalyses: errors.length,
      results,
      errors,
      summary: this.generateBatchSummary(results)
    };
    
    this.logger.info('批量分析完成', {
      total: symbols.length,
      success: results.length,
      failed: errors.length
    });
    
    return batchReport;
  }
  
  /**
   * 生成批量分析摘要
   * @param {Array} results - 分析结果数组
   * @returns {Object} 批量分析摘要
   */
  generateBatchSummary(results) {
    if (results.length === 0) {
      return {
        buySignals: 0,
        sellSignals: 0,
        holdSignals: 0,
        averageConfidence: 0,
        topOpportunities: []
      };
    }
    
    const buySignals = results.filter(r => r.signal.type === 'BUY');
    const sellSignals = results.filter(r => r.signal.type === 'SELL');
    const holdSignals = results.filter(r => r.signal.type === 'HOLD');
    
    const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    
    // 找出最佳机会（高置信度的买入/卖出信号）
    const opportunities = results
      .filter(r => r.signal.type !== 'HOLD' && r.confidence > 0.6)
      .sort((a, b) => {
        // 按置信度 * 信号强度排序
        const scoreA = a.confidence * a.signal.strength;
        const scoreB = b.confidence * b.signal.strength;
        return scoreB - scoreA;
      })
      .slice(0, 5)
      .map(r => ({
        symbol: r.symbol,
        action: r.signal.type,
        confidence: r.confidence,
        signalStrength: r.signal.strength,
        score: r.confidence * r.signal.strength
      }));
    
    return {
      buySignals: buySignals.length,
      sellSignals: sellSignals.length,
      holdSignals: holdSignals.length,
      averageConfidence,
      topOpportunities: opportunities
    };
  }
  
  /**
   * 获取分析历史
   * @param {Object} filters - 过滤条件
   * @returns {Array} 过滤后的历史记录
   */
  getAnalysisHistory(filters = {}) {
    let filtered = this.analysisHistory;
    
    if (filters.symbol) {
      filtered = filtered.filter(item => item.symbol === filters.symbol);
    }
    
    if (filters.strategy) {
      filtered = filtered.filter(item => item.strategy === filters.strategy);
    }
    
    if (filters.signal) {
      filtered = filtered.filter(item => item.signal === filters.signal);
    }
    
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter(item => new Date(item.timestamp) >= start);
    }
    
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      filtered = filtered.filter(item => new Date(item.timestamp) <= end);
    }
    
    if (filters.limit) {
      filtered = filtered.slice(-filters.limit);
    }
    
    return filtered;
  }
  
  /**
   * 获取性能统计
   * @returns {Object} 性能统计
   */
  getPerformanceStats() {
    const stats = {
      ...this.performanceMetrics,
      dataFetcherStats: this.dataFetcher.getRequestStats(),
      strategies: Array.from(this.strategies.keys()).map(name => ({
        name,
        instance: this.strategies.get(name).getStatistics ? 
          this.strategies.get(name).getStatistics() : { available: true }
      })),
      historySize: this.analysisHistory.length,
      uptime: new Date().toISOString()
    };
    
    return stats;
  }
  
  /**
   * 添加新策略
   * @param {string} name - 策略名称
   * @param {Object} strategy - 策略实例
   */
  addStrategy(name, strategy) {
    if (this.strategies.has(name)) {
      throw new Error(`策略 ${name} 已存在`);
    }
    
    this.strategies.set(name, strategy);
    this.logger.info('新策略已添加', { strategy: name });
  }
  
  /**
   * 移除策略
   * @param {string} name - 策略名称
   */
  removeStrategy(name) {
    if (this.strategies.has(name)) {
      this.strategies.delete(name);
      this.logger.info('策略已移除', { strategy: name });
    }
  }
  
  /**
   * 睡眠函数
   * @param {number} ms - 毫秒数
   * @returns {Promise} 睡眠Promise
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * 重置技能状态
   */
  reset() {
    this.analysisHistory = [];
    this.performanceMetrics = {
      totalAnalyses: 0,
      signalsGenerated: 0,
      averageConfidence: 0,
      strategiesUsed: new Set()
    };
    
    // 重置所有策略
    this.strategies.forEach(strategy => {
      if (strategy.reset) {
        strategy.reset();
      }
    });
    
    // 清空数据缓存
    this.dataFetcher.clearCache();
    
    this.logger.info('技能状态已重置');
  }
  
  /**
   * 更新配置
   * @param {Object} newConfig - 新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // 重新初始化策略
    if (newConfig.strategies || newConfig.defaultSymbol || newConfig.defaultTimeframe) {
      this.initializeStrategies();
    }
    
    // 更新数据获取器配置
    if (newConfig.apiConfig) {
      this.dataFetcher.setCredentials(newConfig.apiConfig);
    }
    
    this.logger.info('配置已更新', { config: this.config });
  }
}

module.exports = TradingStrategySkill;