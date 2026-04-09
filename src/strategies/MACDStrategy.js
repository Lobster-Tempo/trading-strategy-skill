/**
 * MACD策略实现
 * 移动平均收敛发散指标策略
 */

class MACDStrategy {
  constructor(config = {}) {
    this.name = 'MACD';
    this.description = '移动平均收敛发散指标策略';
    
    // 默认配置
    this.config = {
      fastPeriod: config.fastPeriod || 12,      // 快线EMA周期
      slowPeriod: config.slowPeriod || 26,      // 慢线EMA周期
      signalPeriod: config.signalPeriod || 9,   // 信号线周期
      threshold: config.threshold || 0.001,     // 信号阈值
      useHistogram: config.useHistogram !== false, // 使用柱状图信号
      useZeroCross: config.useZeroCross !== false, // 使用零轴交叉信号
      ...config
    };
    
    // 信号类型
    this.SIGNAL_TYPES = {
      STRONG_BUY: 'STRONG_BUY',
      BUY: 'BUY',
      NEUTRAL: 'NEUTRAL',
      SELL: 'SELL',
      STRONG_SELL: 'STRONG_SELL'
    };
    
    // 交叉类型
    this.CROSSOVER_TYPES = {
      GOLDEN_CROSS: 'GOLDEN_CROSS',      // 金叉
      DEAD_CROSS: 'DEAD_CROSS',          // 死叉
      ZERO_POSITIVE: 'ZERO_POSITIVE',    // 零轴上穿
      ZERO_NEGATIVE: 'ZERO_NEGATIVE',    // 零轴下穿
      NONE: 'NONE'
    };
  }
  
  /**
   * 分析价格数据，生成MACD信号
   * @param {Array} prices - 价格数组
   * @param {Object} options - 分析选项
   * @returns {Object} 分析结果
   */
  analyze(prices, options = {}) {
    try {
      if (!prices || prices.length < this.config.slowPeriod + this.config.signalPeriod) {
        throw new Error(`需要至少${this.config.slowPeriod + this.config.signalPeriod}个价格数据点`);
      }
      
      // 计算MACD指标
      const macdData = this.calculateMACD(prices);
      
      if (!macdData || macdData.length === 0) {
        throw new Error('MACD计算失败');
      }
      
      // 获取最新数据
      const latest = macdData[macdData.length - 1];
      const previous = macdData.length > 1 ? macdData[macdData.length - 2] : latest;
      
      // 生成信号
      const signal = this.generateSignal(latest, previous);
      
      // 计算置信度
      const confidence = this.calculateConfidence(latest, previous, macdData);
      
      // 风险评估
      const riskAssessment = this.assessRisk(latest, previous, macdData);
      
      // 生成建议
      const recommendations = this.generateRecommendations(signal, confidence, riskAssessment);
      
      return {
        success: true,
        strategy: this.name,
        config: this.config,
        data: {
          macd: latest.macd,
          signal: latest.signal,
          histogram: latest.histogram,
          values: {
            macdLine: latest.macd,
            signalLine: latest.signal,
            histogram: latest.histogram
          },
          trends: {
            macdTrend: this.calculateTrend(macdData.map(d => d.macd)),
            signalTrend: this.calculateTrend(macdData.map(d => d.signal)),
            histogramTrend: this.calculateTrend(macdData.map(d => d.histogram))
          }
        },
        signal: {
          type: signal.type,
          strength: signal.strength,
          crossover: signal.crossover,
          description: signal.description,
          conditions: signal.conditions
        },
        confidence: confidence,
        riskAssessment: riskAssessment,
        recommendations: recommendations,
        metadata: {
          dataPoints: prices.length,
          calculationTime: Date.now(),
          strategyVersion: '1.0.0'
        }
      };
      
    } catch (error) {
      return {
        success: false,
        strategy: this.name,
        error: error.message,
        signal: {
          type: 'NEUTRAL',
          strength: 0,
          crossover: 'NONE',
          description: '分析失败',
          conditions: []
        },
        confidence: 0,
        riskAssessment: { level: 'HIGH', score: 100, factors: ['计算错误'] },
        recommendations: { action: 'HOLD', reason: '技术分析暂时不可用' }
      };
    }
  }
  
  /**
   * 计算MACD指标
   * @param {Array} prices - 价格数组
   * @returns {Array} MACD数据数组
   */
  calculateMACD(prices) {
    const closePrices = prices.map(p => typeof p === 'object' ? p.close : p);
    
    // 计算EMA
    const fastEMA = this.calculateEMA(closePrices, this.config.fastPeriod);
    const slowEMA = this.calculateEMA(closePrices, this.config.slowPeriod);
    
    // 计算MACD线（快EMA - 慢EMA）
    const macdLine = [];
    for (let i = 0; i < closePrices.length; i++) {
      if (fastEMA[i] !== undefined && slowEMA[i] !== undefined) {
        macdLine.push(fastEMA[i] - slowEMA[i]);
      } else {
        macdLine.push(null);
      }
    }
    
    // 计算信号线（MACD线的EMA）
    const signalLine = this.calculateEMA(macdLine.filter(v => v !== null), this.config.signalPeriod);
    
    // 计算柱状图（MACD线 - 信号线）
    const histogram = [];
    const result = [];
    
    for (let i = 0; i < closePrices.length; i++) {
      const macd = macdLine[i];
      const signal = signalLine[i];
      
      if (macd !== null && signal !== null) {
        const hist = macd - signal;
        histogram.push(hist);
        
        result.push({
          index: i,
          price: closePrices[i],
          macd: macd,
          signal: signal,
          histogram: hist,
          timestamp: Date.now() - (closePrices.length - i - 1) * 3600000 // 假设每小时一个数据点
        });
      }
    }
    
    return result;
  }
  
  /**
   * 计算指数移动平均线
   * @param {Array} data - 数据数组
   * @param {number} period - 周期
   * @returns {Array} EMA数组
   */
  calculateEMA(data, period) {
    if (!data || data.length < period) {
      return new Array(data.length).fill(null);
    }
    
    const ema = new Array(data.length).fill(null);
    const multiplier = 2 / (period + 1);
    
    // 第一个EMA是简单移动平均
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i];
    }
    ema[period - 1] = sum / period;
    
    // 计算后续EMA
    for (let i = period; i < data.length; i++) {
      ema[i] = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
    }
    
    return ema;
  }
  
  /**
   * 生成MACD信号
   * @param {Object} latest - 最新MACD数据
   * @param {Object} previous - 前一个MACD数据
   * @returns {Object} 信号对象
   */
  generateSignal(latest, previous) {
    const signals = [];
    const conditions = [];
    
    // 1. 柱状图信号
    if (this.config.useHistogram) {
      const histogramSignal = this.analyzeHistogram(latest, previous);
      if (histogramSignal) {
        signals.push(histogramSignal);
        conditions.push('柱状图分析');
      }
    }
    
    // 2. 零轴交叉信号
    if (this.config.useZeroCross) {
      const zeroCrossSignal = this.analyzeZeroCross(latest, previous);
      if (zeroCrossSignal) {
        signals.push(zeroCrossSignal);
        conditions.push('零轴交叉分析');
      }
    }
    
    // 3. MACD线与信号线交叉
    const crossoverSignal = this.analyzeCrossover(latest, previous);
    if (crossoverSignal) {
      signals.push(crossoverSignal);
      conditions.push('MACD交叉分析');
    }
    
    // 4. 趋势强度分析
    const trendSignal = this.analyzeTrend(latest);
    if (trendSignal) {
      signals.push(trendSignal);
      conditions.push('趋势强度分析');
    }
    
    // 综合所有信号
    return this.combineSignals(signals, conditions);
  }
  
  /**
   * 分析柱状图信号
   */
  analyzeHistogram(latest, previous) {
    const currentHist = latest.histogram;
    const prevHist = previous.histogram;
    
    // 柱状图转正（负转正）
    if (prevHist < 0 && currentHist > 0 && Math.abs(currentHist) > this.config.threshold) {
      return {
        type: this.SIGNAL_TYPES.BUY,
        strength: Math.min(0.7, Math.abs(currentHist) * 10),
        crossover: this.CROSSOVER_TYPES.ZERO_POSITIVE,
        description: '柱状图由负转正，买入信号'
      };
    }
    
    // 柱状图转负（正转负）
    if (prevHist > 0 && currentHist < 0 && Math.abs(currentHist) > this.config.threshold) {
      return {
        type: this.SIGNAL_TYPES.SELL,
        strength: Math.min(0.7, Math.abs(currentHist) * 10),
        crossover: this.CROSSOVER_TYPES.ZERO_NEGATIVE,
        description: '柱状图由正转负，卖出信号'
      };
    }
    
    // 柱状图增强（正值增大）
    if (currentHist > 0 && currentHist > prevHist && (currentHist - prevHist) > this.config.threshold) {
      return {
        type: this.SIGNAL_TYPES.BUY,
        strength: Math.min(0.5, (currentHist - prevHist) * 5),
        crossover: this.CROSSOVER_TYPES.NONE,
        description: '柱状图增强，看涨信号'
      };
    }
    
    // 柱状图减弱（负值减小）
    if (currentHist < 0 && currentHist > prevHist && (prevHist - currentHist) > this.config.threshold) {
      return {
        type: this.SIGNAL_TYPES.BUY,
        strength: Math.min(0.4, (prevHist - currentHist) * 4),
        crossover: this.CROSSOVER_TYPES.NONE,
        description: '柱状图减弱，空头减弱'
      };
    }
    
    return null;
  }
  
  /**
   * 分析零轴交叉
   */
  analyzeZeroCross(latest, previous) {
    const currentMACD = latest.macd;
    const prevMACD = previous.macd;
    
    // MACD上穿零轴
    if (prevMACD < 0 && currentMACD > 0 && Math.abs(currentMACD) > this.config.threshold) {
      return {
        type: this.SIGNAL_TYPES.BUY,
        strength: Math.min(0.8, currentMACD * 8),
        crossover: this.CROSSOVER_TYPES.ZERO_POSITIVE,
        description: 'MACD上穿零轴，强烈买入信号'
      };
    }
    
    // MACD下穿零轴
    if (prevMACD > 0 && currentMACD < 0 && Math.abs(currentMACD) > this.config.threshold) {
      return {
        type: this.SIGNAL_TYPES.SELL,
        strength: Math.min(0.8, Math.abs(currentMACD) * 8),
        crossover: this.CROSSOVER_TYPES.ZERO_NEGATIVE,
        description: 'MACD下穿零轴，强烈卖出信号'
      };
    }
    
    return null;
  }
  
  /**
   * 分析MACD线与信号线交叉
   */
  analyzeCrossover(latest, previous) {
    const currentMACD = latest.macd;
    const currentSignal = latest.signal;
    const prevMACD = previous.macd;
    const prevSignal = previous.signal;
    
    // 金叉：MACD线上穿信号线
    if (prevMACD < prevSignal && currentMACD > currentSignal && 
        (currentMACD - currentSignal) > this.config.threshold) {
      return {
        type: this.SIGNAL_TYPES.BUY,
        strength: Math.min(0.9, (currentMACD - currentSignal) * 9),
        crossover: this.CROSSOVER_TYPES.GOLDEN_CROSS,
        description: 'MACD金叉，买入信号'
      };
    }
    
    // 死叉：MACD线下穿信号线
    if (prevMACD > prevSignal && currentMACD < currentSignal && 
        (prevSignal - currentMACD) > this.config.threshold) {
      return {
        type: this.SIGNAL_TYPES.SELL,
        strength: Math.min(0.9, (prevSignal - currentMACD) * 9),
        crossover: this.CROSSOVER_TYPES.DEAD_CROSS,
        description: 'MACD死叉，卖出信号'
      };
    }
    
    return null;
  }
  
  /**
   * 分析趋势强度
   */
  analyzeTrend(latest) {
    const macd = latest.macd;
    const histogram = latest.histogram;
    
    // 强看涨趋势
    if (macd > 0.05 && histogram > 0.02) {
      return {
        type: this.SIGNAL_TYPES.STRONG_BUY,
        strength: 0.85,
        crossover: this.CROSSOVER_TYPES.NONE,
        description: '强看涨趋势，MACD和柱状图均为正值'
      };
    }
    
    // 强看跌趋势
    if (macd < -0.05 && histogram < -0.02) {
      return {
        type: this.SIGNAL_TYPES.STRONG_SELL,
        strength: 0.85,
        crossover: this.CROSSOVER_TYPES.NONE,
        description: '强看跌趋势，MACD和柱状图均为负值'
      };
    }
    
    // 弱看涨趋势
    if (macd > 0 && histogram > 0) {
      return {
        type: this.SIGNAL_TYPES.BUY,
        strength: 0.6,
        crossover: this.CROSSOVER_TYPES.NONE,
        description: '弱看涨趋势，MACD和柱状图微正'
      };
    }
    
    // 弱看跌趋势
    if (macd < 0 && histogram < 0) {
      return {
        type: this.SIGNAL_TYPES.SELL,
        strength: 0.6,
        crossover: this.CROSSOVER_TYPES.NONE,
        description: '弱看跌趋势，MACD和柱状图微负'
      };
    }
    
    return null;
  }
  
  /**
   * 组合多个信号
   */
  combineSignals(signals, conditions) {
    if (signals.length === 0) {
      return {
        type: this.SIGNAL_TYPES.NEUTRAL,
        strength: 0.3,
        crossover: this.CROSSOVER_TYPES.NONE,
        description: '无明显信号，建议观望',
        conditions: ['无明确信号']
      };
    }
    
    // 按强度排序
    signals.sort((a, b) => b.strength - a.strength);
    
    const primarySignal = signals[0];
    let finalStrength = primarySignal.strength;
    
    // 如果有多个同向信号，增强强度
    const sameDirectionSignals = signals.filter(s => s.type === primarySignal.type);
    if (sameDirectionSignals.length > 1) {
      finalStrength = Math.min(0.95, primarySignal.strength * 1.2);
    }
    
    // 如果有反向信号，降低强度
    const oppositeSignals = signals.filter(s => 
      (primarySignal.type.includes('BUY') && s.type.includes('SELL')) ||
      (primarySignal.type.includes('SELL') && s.type.includes('BUY'))
    );
    
    if (oppositeSignals.length > 0) {
      finalStrength = Math.max(0.4, finalStrength * 0.7);
    }
    
    return {
      type: primarySignal.type,
      strength: finalStrength,
      crossover: primarySignal.crossover,
      description: primarySignal.description + (signals.length > 1 ? ` (${signals.length}个信号确认)` : ''),
      conditions: conditions
    };
  }
  
  /**
   * 计算置信度
   */
  calculateConfidence(latest, previous, macdData) {
    let confidence = 0.5; // 基础置信度
    
    // 1. 信号强度贡献
    const signalStrength = Math.abs(latest.histogram);
    confidence += Math.min(0.3, signalStrength * 3);
    
    // 2. 趋势一致性贡献
    const trendConsistency = this.calculateTrendConsistency(macdData);
    confidence += trendConsistency * 0.2;
    
    // 3. 数据质量贡献
    const dataQuality = macdData.length > 50 ? 0.15 : (macdData.length / 50) * 0.15;
    confidence += dataQuality;
    
    // 4. 信号清晰度贡献
    const signalClarity = this.calculateSignalClarity(latest, previous);
    confidence += signalClarity * 0.1;
    
    return Math.min(0.95, Math.max(0.3, confidence));
  }
  
  /**
   * 计算趋势一致性
   */
  calculateTrendConsistency(macdData) {
    if (macdData.length < 10) return 0.5;
    
    const recentData = macdData.slice(-10);
    const positiveCount = recentData.filter(d => d.histogram > 0).length;
    const negativeCount = recentData.filter(d => d.histogram < 0).length;
    
    const consistency = Math.abs(positiveCount - negativeCount) / 10;
    return consistency;
  }
  
  /**
   * 计算信号清晰度
   */
  calculateSignalClarity(latest, previous) {
    const histChange = Math.abs(latest.histogram - previous.histogram);
    const macdChange = Math.abs(latest.macd - previous.macd);
    
    const clarity = (histChange + macdChange) / 2;
    return Math.min(1, clarity * 10);
  }
  
  /**
   * 计算趋势
   */
  calculateTrend(data) {
    if (data.length < 2) return 'FLAT';
    
    const recent = data.slice(-5);
    const sum = recent.reduce((a, b) => a + b, 0);
    const avg = sum / recent.length;
    
    if (avg > 0.02) return 'STRONG_UP';
    if (avg > 0) return 'UP';
    if (avg < -0.02) return 'STRONG_DOWN';
    if (avg < 0) return 'DOWN';
    return 'FLAT';
  }
  
  /**
   * 风险评估
   */
  assessRisk(latest, previous, macdData) {
    let riskScore = 50; // 基础风险分数
    
    // 1. 波动性风险
    const volatility = this.calculateVolatility(macdData.map(d => d.histogram));
    riskScore += volatility * 20;
    
    // 2. 信号冲突风险
    const signalConflict = this.detectSignalConflict(latest, previous);
    riskScore += signalConflict ? 15 : 0;
    
    // 3. 趋势反转风险
    const reversalRisk = this.detectReversalRisk(macdData);
    riskScore += reversalRisk * 10;
    
    // 4. 数据不足风险
    const dataRisk = macdData.length < 30 ? 10 : 0;
    riskScore += dataRisk;
    
    // 确定风险等级
    let level, description;
    if (riskScore >= 70) {
      level = 'HIGH';
      description = '高风险，建议谨慎操作';
    } else if (riskScore >= 40) {
      level = 'MEDIUM';
      description = '中等风险，建议中等仓位';
    } else {
      level = 'LOW';
      description = '低风险，适合操作';
    }
    
    return {
      level: level,
      score: Math.min(100, Math.max(0, riskScore)),
      description: description,
      factors: [
        `波动性: ${volatility.toFixed(2)}`,
        signalConflict ? '信号冲突' : '信号一致',
        reversalRisk > 0.5 ? '潜在趋势反转' : '趋势稳定'
      ].filter(f => f)
    };
  }
  
  /**
   * 计算波动性
   */
  calculateVolatility(data) {
    if (data.length < 5) return 0.5;
    
    const returns = [];
    for (let i = 1; i < data.length; i++) {
      returns.push(Math.abs(data[i] - data[i-1]));
    }
    
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    return Math.min(1, avgReturn * 10);
  }
  
  /**
   * 检测信号冲突
   */
  detectSignalConflict(latest, previous) {
    const histSignal = this.analyzeHistogram(latest, previous);
    const crossSignal = this.analyzeCrossover(latest, previous);
    
    if (!histSignal || !crossSignal) return false;
    
    return (
      (histSignal.type.includes('BUY') && crossSignal.type.includes('SELL')) ||
      (histSignal.type.includes('SELL') && crossSignal.type.includes('BUY'))
    );
  }
  
  /**
   * 检测趋势反转风险
   */
  detectReversalRisk(macdData) {
    if (macdData.length < 20) return 0;
    
    const recent = macdData.slice(-10);
    const older = macdData.slice(-20, -10);
    
    const recentAvg = recent.reduce((a, b) => a + b.histogram, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b.histogram, 0) / older.length;
    
    // 如果近期趋势与前期趋势相反，存在反转风险
    if (recentAvg * olderAvg < 0) {
      return Math.min(1, Math.abs(recentAvg - olderAvg) * 5);
    }
    
    return 0;
  }
  
  /**
   * 生成交易建议
   */
  generateRecommendations(signal, confidence, riskAssessment) {
    const baseRecommendation = {
      action: 'HOLD',
      confidence: confidence,
      riskLevel: riskAssessment.level,
      details: []
    };
    
    if (signal.type === this.SIGNAL_TYPES.NEUTRAL) {
      baseRecommendation.action = 'HOLD';
      baseRecommendation.details.push('无明显交易信号，建议观望');
      baseRecommendation.details.push('等待更明确的趋势形成');
    }
    else if (signal.type.includes('BUY')) {
      baseRecommendation.action = 'BUY';
      
      // 根据风险等级确定仓位
      let positionSize;
      if (riskAssessment.level === 'LOW') {
        positionSize = '中等仓位 (15-25%)';
        baseRecommendation.details.push('低风险环境，适合中等仓位操作');
      } else if (riskAssessment.level === 'MEDIUM') {
        positionSize = '小仓位 (5-15%)';
        baseRecommendation.details.push('中等风险，建议小仓位试探');
      } else {
        positionSize = '极小仓位 (<5%) 或观望';
        baseRecommendation.details.push('高风险环境，谨慎操作');
      }
      
      baseRecommendation.details.push(`建议仓位: ${positionSize}`);
      
      // 止损建议
      const stopLoss = riskAssessment.level === 'HIGH' ? '3-5%' : '5-8%';
      baseRecommendation.details.push(`止损位: ${stopLoss}`);
      
      // 止盈建议
      const takeProfit = riskAssessment.level === 'HIGH' ? '6-10%' : '10-15%';
      baseRecommendation.details.push(`止盈位: ${takeProfit}`);
      
      // 时间框架
      baseRecommendation.details.push('预期持有时间: 1-4周');
    }
    else if (signal.type.includes('SELL')) {
      baseRecommendation.action = 'SELL';
      
      if (signal.type === this.SIGNAL_TYPES.STRONG_SELL) {
        baseRecommendation.details.push('强烈卖出信号，建议减仓或清仓');
        baseRecommendation.details.push('考虑设置追踪止损保护利润');
      } else {
        baseRecommendation.details.push('卖出信号，建议部分减仓');
        baseRecommendation.details.push('保留核心仓位观察后续发展');
      }
      
      baseRecommendation.details.push('卖出后等待更好买入机会');
    }
    
    // 添加风险管理建议
    if (riskAssessment.level === 'HIGH') {
      baseRecommendation.details.push('⚠️ 高风险警告: 严格设置止损，控制仓位');
    }
    
    // 添加信号说明
    baseRecommendation.details.push(`信号类型: ${signal.description}`);
    
    return baseRecommendation;
  }
  
  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    return this.config;
  }
  
  /**
   * 获取策略信息
   */
  getInfo() {
    return {
      name: this.name,
      description: this.description,
      version: '1.0.0',
      config: this.config,
      signals: Object.values(this.SIGNAL_TYPES),
      crossovers: Object.values(this.CROSSOVER_TYPES)
    };
  }
}

module.exports = MACDStrategy;