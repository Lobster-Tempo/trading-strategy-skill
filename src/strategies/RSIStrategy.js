/**
 * RSI (Relative Strength Index) 交易策略
 * 基于RSI超买超卖原理的交易策略
 */

class RSIStrategy {
  constructor(config = {}) {
    // 默认配置
    this.config = {
      rsiPeriod: config.rsiPeriod || 14,      // RSI计算周期
      overbought: config.overbought || 70,    // 超买阈值
      oversold: config.oversold || 30,        // 超卖阈值
      timeframe: config.timeframe || '1h',    // 时间周期
      symbol: config.symbol || 'BTC/USDT',    // 交易对
      riskLevel: config.riskLevel || 'medium' // 风险等级
    };
    
    // 状态变量
    this.previousRSI = null;
    this.signals = [];
    this.performance = {
      totalSignals: 0,
      profitableSignals: 0,
      winRate: 0
    };
  }
  
  /**
   * 计算RSI指标
   * @param {Array} prices - 价格数组
   * @returns {Array} RSI值数组
   */
  calculateRSI(prices) {
    if (prices.length < this.config.rsiPeriod + 1) {
      throw new Error(`需要至少${this.config.rsiPeriod + 1}个价格数据点`);
    }
    
    const rsiValues = [];
    const gains = [];
    const losses = [];
    
    // 计算价格变化
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    // 计算初始平均增益和平均损失
    let avgGain = gains.slice(0, this.config.rsiPeriod).reduce((a, b) => a + b, 0) / this.config.rsiPeriod;
    let avgLoss = losses.slice(0, this.config.rsiPeriod).reduce((a, b) => a + b, 0) / this.config.rsiPeriod;
    
    // 第一个RSI值
    if (avgLoss === 0) {
      rsiValues.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsiValues.push(100 - (100 / (1 + rs)));
    }
    
    // 计算后续RSI值
    for (let i = this.config.rsiPeriod; i < gains.length; i++) {
      avgGain = ((avgGain * (this.config.rsiPeriod - 1)) + gains[i]) / this.config.rsiPeriod;
      avgLoss = ((avgLoss * (this.config.rsiPeriod - 1)) + losses[i]) / this.config.rsiPeriod;
      
      if (avgLoss === 0) {
        rsiValues.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsiValues.push(100 - (100 / (1 + rs)));
      }
    }
    
    return rsiValues;
  }
  
  /**
   * 分析市场数据并生成交易信号
   * @param {Object} marketData - 市场数据
   * @returns {Object} 分析结果
   */
  analyze(marketData) {
    const { prices, timestamp } = marketData;
    
    if (!prices || prices.length < this.config.rsiPeriod + 1) {
      throw new Error('市场数据不足');
    }
    
    // 计算RSI
    const rsiValues = this.calculateRSI(prices);
    const currentRSI = rsiValues[rsiValues.length - 1];
    
    // 生成信号
    const signal = this.generateSignal(currentRSI, rsiValues);
    
    // 更新状态
    this.previousRSI = currentRSI;
    this.signals.push({
      timestamp: timestamp || new Date().toISOString(),
      rsi: currentRSI,
      signal: signal.type,
      strength: signal.strength,
      price: prices[prices.length - 1]
    });
    
    // 更新绩效
    this.updatePerformance(signal);
    
    return {
      symbol: this.config.symbol,
      timeframe: this.config.timeframe,
      currentRSI,
      signal,
      marketCondition: this.assessMarketCondition(currentRSI, rsiValues),
      riskAssessment: this.assessRisk(currentRSI, signal),
      confidence: this.calculateConfidence(currentRSI, rsiValues),
      recommendation: this.generateRecommendation(signal, currentRSI),
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * 生成交易信号
   * @param {number} currentRSI - 当前RSI值
   * @param {Array} rsiHistory - RSI历史数据
   * @returns {Object} 交易信号
   */
  generateSignal(currentRSI, rsiHistory) {
    const previousRSI = rsiHistory.length > 1 ? rsiHistory[rsiHistory.length - 2] : this.previousRSI;
    
    // 判断信号类型
    let signalType = 'HOLD';
    let strength = 0;
    
    if (currentRSI > this.config.overbought) {
      signalType = 'SELL';
      strength = (currentRSI - this.config.overbought) / (100 - this.config.overbought);
    } else if (currentRSI < this.config.oversold) {
      signalType = 'BUY';
      strength = (this.config.oversold - currentRSI) / this.config.oversold;
    }
    
    // 判断金叉死叉
    let crossover = null;
    if (previousRSI !== null) {
      if (previousRSI <= this.config.overbought && currentRSI > this.config.overbought) {
        crossover = 'OVERBOUGHT_CROSS';
        if (signalType === 'HOLD') {
          signalType = 'SELL';
          strength = 0.5;
        }
      } else if (previousRSI >= this.config.oversold && currentRSI < this.config.oversold) {
        crossover = 'OVERSOLD_CROSS';
        if (signalType === 'HOLD') {
          signalType = 'BUY';
          strength = 0.5;
        }
      }
    }
    
    // 判断趋势
    const trend = previousRSI !== null 
      ? (currentRSI > previousRSI ? 'BULLISH' : 'BEARISH')
      : 'NEUTRAL';
    
    return {
      type: signalType,
      strength: Math.min(strength, 1),
      crossover,
      trend,
      rsiValue: currentRSI,
      overboughtThreshold: this.config.overbought,
      oversoldThreshold: this.config.oversold
    };
  }
  
  /**
   * 评估市场状况
   * @param {number} currentRSI - 当前RSI
   * @param {Array} rsiHistory - RSI历史
   * @returns {Object} 市场状况
   */
  assessMarketCondition(currentRSI, rsiHistory) {
    const condition = {
      isOverbought: currentRSI > this.config.overbought,
      isOversold: currentRSI < this.config.oversold,
      isNeutral: currentRSI >= this.config.oversold && currentRSI <= this.config.overbought,
      zone: this.getRSIZone(currentRSI),
      volatility: this.calculateVolatility(rsiHistory),
      momentum: this.calculateMomentum(rsiHistory)
    };
    
    return condition;
  }
  
  /**
   * 获取RSI区域
   * @param {number} rsi - RSI值
   * @returns {string} 区域名称
   */
  getRSIZone(rsi) {
    if (rsi > 80) return 'EXTREME_OVERBOUGHT';
    if (rsi > 70) return 'OVERBOUGHT';
    if (rsi > 60) return 'BULLISH';
    if (rsi > 40) return 'NEUTRAL';
    if (rsi > 30) return 'BEARISH';
    if (rsi > 20) return 'OVERSOLD';
    return 'EXTREME_OVERSOLD';
  }
  
  /**
   * 计算波动率
   * @param {Array} rsiHistory - RSI历史
   * @returns {number} 波动率
   */
  calculateVolatility(rsiHistory) {
    if (rsiHistory.length < 2) return 0;
    
    const mean = rsiHistory.reduce((a, b) => a + b, 0) / rsiHistory.length;
    const variance = rsiHistory.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rsiHistory.length;
    
    return Math.sqrt(variance);
  }
  
  /**
   * 计算动量
   * @param {Array} rsiHistory - RSI历史
   * @returns {number} 动量值
   */
  calculateMomentum(rsiHistory) {
    if (rsiHistory.length < 5) return 0;
    
    const recent = rsiHistory.slice(-5);
    const oldest = rsiHistory.slice(0, 5);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const oldestAvg = oldest.reduce((a, b) => a + b, 0) / oldest.length;
    
    return recentAvg - oldestAvg;
  }
  
  /**
   * 风险评估
   * @param {number} currentRSI - 当前RSI
   * @param {Object} signal - 交易信号
   * @returns {Object} 风险评估
   */
  assessRisk(currentRSI, signal) {
    let riskLevel = 'LOW';
    let riskScore = 0;
    
    // 基于RSI位置的风险评估
    if (currentRSI > 80 || currentRSI < 20) {
      riskLevel = 'HIGH';
      riskScore = 0.8;
    } else if (currentRSI > 70 || currentRSI < 30) {
      riskLevel = 'MEDIUM';
      riskScore = 0.5;
    } else {
      riskLevel = 'LOW';
      riskScore = 0.2;
    }
    
    // 基于信号强度的调整
    if (signal.strength > 0.7) {
      riskScore += 0.2;
      if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
    }
    
    return {
      level: riskLevel,
      score: Math.min(riskScore, 1),
      factors: [
        `RSI位置: ${this.getRSIZone(currentRSI)}`,
        `信号强度: ${(signal.strength * 100).toFixed(1)}%`,
        `趋势: ${signal.trend}`
      ],
      recommendations: this.getRiskRecommendations(riskLevel, signal)
    };
  }
  
  /**
   * 获取风险建议
   * @param {string} riskLevel - 风险等级
   * @param {Object} signal - 交易信号
   * @returns {Array} 风险建议
   */
  getRiskRecommendations(riskLevel, signal) {
    const recommendations = [];
    
    if (riskLevel === 'HIGH') {
      recommendations.push('建议小仓位操作');
      recommendations.push('设置严格止损');
      recommendations.push('考虑分批建仓');
    } else if (riskLevel === 'MEDIUM') {
      recommendations.push('建议中等仓位');
      recommendations.push('设置合理止损');
      recommendations.push('关注市场变化');
    } else {
      recommendations.push('可以正常仓位操作');
      recommendations.push('设置基础止损');
    }
    
    if (signal.type === 'BUY' && signal.strength > 0.7) {
      recommendations.push('强势买入信号，可适当增加仓位');
    } else if (signal.type === 'SELL' && signal.strength > 0.7) {
      recommendations.push('强势卖出信号，建议减仓或离场');
    }
    
    return recommendations;
  }
  
  /**
   * 计算置信度
   * @param {number} currentRSI - 当前RSI
   * @param {Array} rsiHistory - RSI历史
   * @returns {number} 置信度
   */
  calculateConfidence(currentRSI, rsiHistory) {
    let confidence = 0.5; // 基础置信度
    
    // RSI极端值的置信度更高
    if (currentRSI > 80 || currentRSI < 20) {
      confidence += 0.3;
    } else if (currentRSI > 70 || currentRSI < 30) {
      confidence += 0.2;
    }
    
    // 历史一致性
    if (rsiHistory.length >= 10) {
      const recentTrend = this.checkTrendConsistency(rsiHistory.slice(-10));
      if (recentTrend.consistent) {
        confidence += 0.1;
      }
    }
    
    // 波动率影响（低波动率时置信度更高）
    const volatility = this.calculateVolatility(rsiHistory);
    if (volatility < 5) {
      confidence += 0.1;
    } else if (volatility > 15) {
      confidence -= 0.1;
    }
    
    return Math.max(0.1, Math.min(confidence, 0.95));
  }
  
  /**
   * 检查趋势一致性
   * @param {Array} rsiSlice - RSI片段
   * @returns {Object} 趋势一致性
   */
  checkTrendConsistency(rsiSlice) {
    let bullishCount = 0;
    let bearishCount = 0;
    
    for (let i = 1; i < rsiSlice.length; i++) {
      if (rsiSlice[i] > rsiSlice[i - 1]) {
        bullishCount++;
      } else if (rsiSlice[i] < rsiSlice[i - 1]) {
        bearishCount++;
      }
    }
    
    const total = rsiSlice.length - 1;
    const bullishRatio = bullishCount / total;
    const bearishRatio = bearishCount / total;
    
    return {
      consistent: bullishRatio > 0.7 || bearishRatio > 0.7,
      bullishRatio,
      bearishRatio,
      dominantTrend: bullishRatio > bearishRatio ? 'BULLISH' : 'BEARISH'
    };
  }
  
  /**
   * 生成交易建议
   * @param {Object} signal - 交易信号
   * @param {number} currentRSI - 当前RSI
   * @returns {Object} 交易建议
   */
  generateRecommendation(signal, currentRSI) {
    const baseRecommendation = {
      action: signal.type,
      confidence: this.calculateConfidence(currentRSI, []),
      rationale: [],
      suggestedPosition: this.calculatePositionSize(signal, currentRSI),
      stopLoss: this.calculateStopLoss(signal, currentRSI),
      takeProfit: this.calculateTakeProfit(signal, currentRSI)
    };
    
    // 根据信号类型添加理由
    if (signal.type === 'BUY') {
      baseRecommendation.rationale.push(`RSI处于超卖区域 (${currentRSI.toFixed(2)} < ${this.config.oversold})`);
      if (signal.crossover === 'OVERSOLD_CROSS') {
        baseRecommendation.rationale.push('RSI从超卖区域向上突破');
      }
    } else if (signal.type === 'SELL') {
      baseRecommendation.rationale.push(`RSI处于超买区域 (${currentRSI.toFixed(2)} > ${this.config.overbought})`);
      if (signal.crossover === 'OVERBOUGHT_CROSS') {
        baseRecommendation.rationale.push('RSI从超买区域向下突破');
      }
    } else {
      baseRecommendation.rationale.push(`RSI处于中性区域 (${this.config.oversold} < ${currentRSI.toFixed(2)} < ${this.config.overbought})`);
      baseRecommendation.rationale.push('建议观望等待更好机会');
    }
    
    // 添加趋势信息
    baseRecommendation.rationale.push(`当前趋势: ${signal.trend}`);
    
    return baseRecommendation;
  }
  
  /**
   * 计算建议仓位大小
   * @param {Object} signal - 交易信号
   * @param {number} currentRSI - 当前RSI
   * @returns {Object} 仓位建议
   */
  calculatePositionSize(signal, currentRSI) {
    let size = 'SMALL';
    let percentage = 0.1; // 默认10%
    
    if (signal.type === 'HOLD') {
      return { size: 'NONE', percentage: 0 };
    }
    
    // 基于信号强度调整仓位
    if (signal.strength > 0.7) {
      size = 'LARGE';
      percentage = 0.3;
    } else if (signal.strength > 0.4) {
      size = 'MEDIUM';
      percentage = 0.2;
    }
    
    // 基于风险等级调整
    const risk = this.assessRisk(currentRSI, signal);
    if (risk.level === 'HIGH') {
      percentage *= 0.5;
      size = 'SMALL';
    } else if (risk.level === 'MEDIUM') {
      percentage *= 0.75;
    }
    
    return {
      size,
      percentage: Math.min(percentage, 0.5), // 最大不超过50%
      description: `${size}仓位 (建议${(percentage * 100).toFixed(1)}%资金)`
    };
  }
  
  /**
   * 计算止损位
   * @param {Object} signal - 交易信号
   * @param {number} currentRSI - 当前RSI
   * @returns {Object} 止损建议
   */
  calculateStopLoss(signal, currentRSI) {
    if (signal.type === 'HOLD') {
      return { level: 'N/A', percentage: 0, rationale: '无持仓' };
    }
    
    let percentage = 5; // 默认5%
    
    // 基于风险等级调整
    const risk = this.assessRisk(currentRSI, signal);
    if (risk.level === 'HIGH') {
      percentage = 3; // 高风险时止损更紧
    } else if (risk.level === 'LOW') {
      percentage = 7; // 低风险时可以放宽止损
    }
    
    // 基于信号强度调整
    if (signal.strength > 0.7) {
      percentage += 2; // 强信号时可以放宽止损
    }
    
    const action = signal.type === 'BUY' ? 'below' : 'above';
    
    return {
      level: `${percentage}%`,
      percentage,
      rationale: `建议设置在当前价格${action} ${percentage}%的位置`,
      type: 'FIXED_PERCENTAGE'
    };
  }
  
  /**
   * 计算止盈位
   * @param {Object} signal - 交易信号
   * @param {number} currentRSI - 当前RSI
   * @returns {Object} 止盈建议
   */
  calculateTakeProfit(signal, currentRSI) {
    if (signal.type === 'HOLD') {
      return { level: 'N/A', percentage: 0, rationale: '无持仓' };
    }
    
    let percentage = 10; // 默认10%
    const riskRewardRatio = 2; // 风险回报比
    
    // 基于信号强度调整
    if (signal.strength > 0.7) {
      percentage = 15;
    } else if (signal.strength < 0.3) {
      percentage = 8;
    }
    
    const action = signal.type === 'BUY' ? 'above' : 'below';
    
    return {
      level: `${percentage}%`,
      percentage,
      riskRewardRatio,
      rationale: `建议设置在当前价格${action} ${percentage}%的位置 (风险回报比: ${riskRewardRatio}:1)`,
      type: 'FIXED_PERCENTAGE'
    };
  }
  
  /**
   * 更新绩效统计
   * @param {Object} signal - 交易信号
   */
  updatePerformance(signal) {
    this.performance.totalSignals++;
    
    // 简单绩效评估（实际应用中需要价格数据验证）
    if (signal.type !== 'HOLD') {
      // 这里可以添加实际的绩效跟踪逻辑
      // 暂时使用模拟数据
      const isProfitable = Math.random() > 0.4; // 60%胜率模拟
      if (isProfitable) {
        this.performance.profitableSignals++;
      }
    }
    
    this.performance.winRate = this.performance.totalSignals > 0 
      ? (this.performance.profitableSignals / this.performance.totalSignals) * 100 
      : 0;
  }
  
  /**
   * 获取策略统计信息
   * @returns {Object} 统计信息
   */
  getStatistics() {
    return {
      ...this.performance,
      totalAnalyses: this.signals.length,
      lastSignal: this.signals.length > 0 ? this.signals[this.signals.length - 1] : null,
      config: this.config,
      createdAt: new Date().toISOString()
    };
  }
  
  /**
   * 重置策略状态
   */
  reset() {
    this.previousRSI = null;
    this.signals = [];
    this.performance = {
      totalSignals: 0,
      profitableSignals: 0,
      winRate: 0
    };
  }
  
  /**
   * 更新配置
   * @param {Object} newConfig - 新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

module.exports = RSIStrategy;