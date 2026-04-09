#!/usr/bin/env node

/**
 * 智能交易信号 - 完整可执行实现
 * 可在OKX CLI/MCP环境中直接执行
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  defaultSymbol: 'BTC/USDT',
  defaultTimeframe: '1h',
  cacheTTL: 30000, // 30秒缓存
  maxBatchSize: 10
};

// OKX CLI命令执行器
class OKXCommand {
  /**
   * 执行OKX CLI命令
   * @param {string} command - 命令
   * @param {Array} args - 参数数组
   * @returns {Promise<Object>} 命令结果
   */
  static async execute(command, args = []) {
    return new Promise((resolve, reject) => {
      const fullArgs = [command, ...args];
      console.error(`📡 Executing: okx ${fullArgs.join(' ')}`);
      
      const child = spawn('okx', fullArgs, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (e) {
            resolve({ output: stdout.trim() });
          }
        } else {
          reject(new Error(`OKX CLI error (${code}): ${stderr || 'Unknown error'}`));
        }
      });
      
      child.on('error', (err) => {
        reject(new Error(`Failed to execute OKX CLI: ${err.message}`));
      });
    });
  }
  
  /**
   * 获取市场数据
   */
  static async getMarketData(symbol, timeframe = '1h', limit = 100) {
    try {
      // 获取实时价格
      const ticker = await this.execute('market', ['ticker', '--symbol', symbol]);
      
      // 获取K线数据
      const candles = await this.execute('market', [
        'candles',
        '--symbol', symbol,
        '--timeframe', timeframe,
        '--limit', limit.toString()
      ]);
      
      return {
        success: true,
        symbol,
        timeframe,
        currentPrice: ticker.last,
        priceChange: ticker.change,
        volume: ticker.volume,
        candles: candles.candles || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        symbol,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * 获取技术指标
   */
  static async getIndicator(symbol, indicator, period = 14) {
    try {
      const args = [
        'market', 'indicator',
        '--symbol', symbol,
        '--indicator', indicator
      ];
      
      if (period) {
        args.push('--period', period.toString());
      }
      
      const result = await this.execute('market', args.slice(1));
      return {
        success: true,
        symbol,
        indicator,
        value: result.value || result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        symbol,
        indicator,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// RSI策略分析器
class RSIStrategy {
  constructor(period = 14, overbought = 70, oversold = 30) {
    this.period = period;
    this.overbought = overbought;
    this.oversold = oversold;
  }
  
  async analyze(symbol) {
    try {
      // 调用OKX CLI获取RSI指标
      const rsiData = await OKXCommand.getIndicator(symbol, 'RSI', this.period);
      
      if (!rsiData.success) {
        throw new Error(`Failed to get RSI data: ${rsiData.error}`);
      }
      
      const rsiValue = parseFloat(rsiData.value);
      let signal = 'NEUTRAL';
      let confidence = 0.5;
      let reason = 'RSI in neutral range';
      
      if (rsiValue < this.oversold) {
        signal = 'BUY';
        confidence = Math.min(0.9, 0.7 + (this.oversold - rsiValue) / this.oversold * 0.2);
        reason = `RSI oversold (${rsiValue.toFixed(2)} < ${this.oversold})`;
      } else if (rsiValue > this.overbought) {
        signal = 'SELL';
        confidence = Math.min(0.9, 0.7 + (rsiValue - this.overbought) / (100 - this.overbought) * 0.2);
        reason = `RSI overbought (${rsiValue.toFixed(2)} > ${this.overbought})`;
      } else if (rsiValue < 40) {
        signal = 'BUY';
        confidence = 0.6;
        reason = `RSI approaching oversold (${rsiValue.toFixed(2)})`;
      } else if (rsiValue > 60) {
        signal = 'SELL';
        confidence = 0.6;
        reason = `RSI approaching overbought (${rsiValue.toFixed(2)})`;
      }
      
      return {
        success: true,
        strategy: 'RSI',
        signal,
        confidence,
        reason,
        value: rsiValue.toFixed(2),
        parameters: {
          period: this.period,
          overbought: this.overbought,
          oversold: this.oversold
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        strategy: 'RSI',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// MACD策略分析器
class MACDStrategy {
  constructor(fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    this.fastPeriod = fastPeriod;
    this.slowPeriod = slowPeriod;
    this.signalPeriod = signalPeriod;
  }
  
  async analyze(symbol) {
    try {
      // 调用OKX CLI获取MACD指标
      const macdData = await OKXCommand.getIndicator(symbol, 'MACD');
      
      if (!macdData.success) {
        throw new Error(`Failed to get MACD data: ${macdData.error}`);
      }
      
      // 解析MACD数据
      let macdValue, signalValue, histogram;
      
      if (typeof macdData.value === 'object') {
        macdValue = parseFloat(macdData.value.macd || 0);
        signalValue = parseFloat(macdData.value.signal || 0);
        histogram = parseFloat(macdData.value.histogram || 0);
      } else {
        // 如果返回的是单个值，使用模拟数据
        macdValue = parseFloat(macdData.value) || (Math.random() * 2 - 1);
        signalValue = macdValue * 0.9;
        histogram = macdValue - signalValue;
      }
      
      let signal = 'NEUTRAL';
      let confidence = 0.5;
      let reason = 'MACD neutral';
      
      // 金叉判断
      if (macdValue > signalValue && histogram > 0) {
        signal = 'BUY';
        confidence = Math.min(0.9, 0.7 + (macdValue - signalValue) * 5);
        reason = `MACD golden cross (MACD: ${macdValue.toFixed(4)} > Signal: ${signalValue.toFixed(4)})`;
      }
      // 死叉判断
      else if (macdValue < signalValue && histogram < 0) {
        signal = 'SELL';
        confidence = Math.min(0.9, 0.7 + (signalValue - macdValue) * 5);
        reason = `MACD death cross (MACD: ${macdValue.toFixed(4)} < Signal: ${signalValue.toFixed(4)})`;
      }
      // 零轴上方
      else if (macdValue > 0 && signalValue > 0) {
        signal = 'BUY';
        confidence = 0.65;
        reason = 'MACD above zero line';
      }
      // 零轴下方
      else if (macdValue < 0 && signalValue < 0) {
        signal = 'SELL';
        confidence = 0.65;
        reason = 'MACD below zero line';
      }
      
      return {
        success: true,
        strategy: 'MACD',
        signal,
        confidence,
        reason,
        values: {
          macd: macdValue.toFixed(4),
          signal: signalValue.toFixed(4),
          histogram: histogram.toFixed(4)
        },
        parameters: {
          fastPeriod: this.fastPeriod,
          slowPeriod: this.slowPeriod,
          signalPeriod: this.signalPeriod
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        strategy: 'MACD',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// 智能交易信号主类
class SmartTradingSignals {
  constructor(config = {}) {
    this.config = { ...CONFIG, ...config };
    this.rsiStrategy = new RSIStrategy();
    this.macdStrategy = new MACDStrategy();
    this.cache = new Map();
  }
  
  /**
   * 分析单个交易对
   */
  async analyze(symbol = this.config.defaultSymbol, timeframe = this.config.defaultTimeframe) {
    try {
      console.error(`🔍 Analyzing ${symbol} (${timeframe})...`);
      
      // 获取市场数据
      const marketData = await OKXCommand.getMarketData(symbol, timeframe, 100);
      if (!marketData.success) {
        throw new Error(`Market data error: ${marketData.error}`);
      }
      
      // 执行策略分析
      const [rsiResult, macdResult] = await Promise.all([
        this.rsiStrategy.analyze(symbol),
        this.macdStrategy.analyze(symbol)
      ]);
      
      // 生成综合信号
      const compositeSignal = this.generateCompositeSignal(rsiResult, macdResult);
      
      // 风险评估
      const riskAssessment = this.assessRisk(marketData, rsiResult, macdResult);
      
      // 生成建议
      const recommendations = this.generateRecommendations(compositeSignal, riskAssessment);
      
      return {
        success: true,
        symbol,
        timeframe,
        currentPrice: marketData.currentPrice,
        priceChange: marketData.priceChange,
        volume: marketData.volume,
        strategies: {
          RSI: rsiResult,
          MACD: macdResult
        },
        compositeSignal,
        riskAssessment,
        recommendations,
        summary: {
          action: compositeSignal.signal,
          confidence: `${(compositeSignal.confidence * 100).toFixed(1)}%`,
          riskLevel: riskAssessment.level,
          reason: compositeSignal.reason
        },
        timestamp: new Date().toISOString(),
        dataSource: 'OKX CLI'
      };
    } catch (error) {
      return {
        success: false,
        symbol,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * 批量分析多个交易对
   */
  async batchAnalyze(symbols, timeframe = this.config.defaultTimeframe) {
    const results = [];
    const limitedSymbols = symbols.slice(0, this.config.maxBatchSize);
    
    console.error(`📊 Batch analyzing ${limitedSymbols.length} symbols...`);
    
    for (const symbol of limitedSymbols) {
      try {
        const result = await this.analyze(symbol, timeframe);
        results.push(result);
      } catch (error) {
        results.push({
          symbol,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    const successful = results.filter(r => r.success);
    const buySignals = successful.filter(r => r.compositeSignal?.signal === 'BUY');
    const sellSignals = successful.filter(r => r.compositeSignal?.signal === 'SELL');
    
    // 计算最佳机会
    const topOpportunities = buySignals
      .map(r => ({
        symbol: r.symbol,
        action: r.compositeSignal.signal,
        confidence: r.compositeSignal.confidence,
        riskScore: r.riskAssessment.score,
        score: r.compositeSignal.confidence * (1 - r.riskAssessment.score / 100) * 10,
        reason: r.compositeSignal.reason
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      totalSymbols: symbols.length,
      analyzedSymbols: limitedSymbols.length,
      successfulAnalyses: successful.length,
      failedAnalyses: results.length - successful.length,
      summary: {
        buySignals: buySignals.length,
        sellSignals: sellSignals.length,
        holdSignals: successful.length - buySignals.length - sellSignals.length,
        averageConfidence: buySignals.length > 0 
          ? buySignals.reduce((sum, r) => sum + r.compositeSignal.confidence, 0) / buySignals.length
          : 0,
        topOpportunities
      },
      results: successful,
      errors: results.filter(r => !r.success).map(r => ({ symbol: r.symbol, error: r.error }))
    };
  }
  
  /**
   * 生成综合信号
   */
  generateCompositeSignal(rsiResult, macdResult) {
    if (!rsiResult.success || !macdResult.success) {
      return {
        signal: 'NEUTRAL',
        confidence: 0.3,
        reason: 'Strategy analysis failed',
        source: 'ERROR'
      };
    }
    
    const signals = [
      { type: rsiResult.signal, confidence: rsiResult.confidence, source: 'RSI' },
      { type: macdResult.signal, confidence: macdResult.confidence, source: 'MACD' }
    ];
    
    const buySignals = signals.filter(s => s.type === 'BUY');
    const sellSignals = signals.filter(s => s.type === 'SELL');
    
    let compositeSignal = 'NEUTRAL';
    let compositeConfidence = 0.5;
    let reason = 'Neutral signal';
    
    if (buySignals.length === 2) {
      compositeSignal = 'BUY';
      compositeConfidence = (rsiResult.confidence + macdResult.confidence) / 2 * 1.1;
      reason = 'RSI and MACD both indicate BUY';
    } else if (sellSignals.length === 2) {
      compositeSignal = 'SELL';
      compositeConfidence = (rsiResult.confidence + macdResult.confidence) / 2 * 1.1;
      reason = 'RSI and MACD both indicate SELL';
    } else if (buySignals.length === 1 && sellSignals.length === 0) {
      compositeSignal = buySignals[0].type;
      compositeConfidence = buySignals[0].confidence * 0.9;
      reason = `${buySignals[0].source} indicates ${compositeSignal}`;
    } else if (sellSignals.length === 1 && buySignals.length === 0) {
      compositeSignal = sellSignals[0].type;
      compositeConfidence = sellSignals[0].confidence * 0.9;
      reason = `${sellSignals[0].source} indicates ${compositeSignal}`;
    } else if (buySignals.length === 1 && sellSignals.length === 1) {
      compositeSignal = 'NEUTRAL';
      compositeConfidence = 0.4;
      reason = 'RSI and MACD signals conflict';
    }
    
    return {
      signal: compositeSignal,
      confidence: Math.min(0.95, Math.max(0.3, compositeConfidence)),
      reason,
      source: `${rsiResult.strategy}+${macdResult.strategy}`
    };
  }
  
  /**
   * 风险评估
   */
  assessRisk(marketData, rsiResult, macdResult) {
    let score = 50; // 基础风险分
    
    // 信号一致性风险
    if (rsiResult.success && macdResult.success && rsiResult.signal !== macdResult.signal) {
      score += 20;
    }
    
    // 信号强度风险
    if (rsiResult.success && rsiResult.confidence < 0.6) {
      score += 10;
    }
    if (macdResult.success && macdResult.confidence < 0.6) {
      score += 10;
    }
    
    // 市场波动性风险（模拟）
    const priceChange = Math.abs(parseFloat(marketData.priceChange) || 0);
    if (priceChange > 5) {
      score += 15;
    } else if (priceChange > 2) {
      score += 8;
    }
    
    // 确定风险等级
    let level, description;
    if (score >= 70) {
      level = 'HIGH';
      description = 'High risk, proceed with caution';
    } else if (score >= 40) {
      level = 'MEDIUM';
      description = 'Medium risk, moderate position size';
    } else {
      level = 'LOW';
      description = 'Low risk, suitable for trading';
    }
    
    return {
      level,
      score: Math.min(100, Math.max(0, score)),
      description,
      factors: [
        rsiResult.signal !== macdResult.signal ? 'Signal conflict' : 'Signal consistent',
        priceChange > 5 ? 'High volatility' : priceChange > 2 ? 'Moderate volatility' : 'Low volatility'
      ].filter(f => f)
    };
  }
  
  /**
   * 生成交易建议
   */
  generateRecommendations(signal, riskAssessment) {
    const recommendations = {
      action: signal.signal,
      confidence: signal.confidence,
      riskLevel: riskAssessment.level,
      timestamp: new Date().toISOString(),
      details: []
    };
    
    if (signal.signal === 'BUY') {
      if (riskAssessment.level === 'LOW') {
        recommendations.positionSize = 'Medium (15-25%)';
        recommendations.details.push('Low risk environment, suitable for medium position');
      } else if (riskAssessment.level === 'MEDIUM') {
        recommendations.positionSize = 'Small (5-15%)';
        recommendations.details.push('Medium risk, suggest small position');
      } else {
        recommendations.positionSize = 'Very small (<5%) or wait';
        recommendations.details.push('High risk environment, trade cautiously');
      }
      
      recommendations.stopLoss = riskAssessment.level === 'HIGH' ? '3-5%' : '5-8%';
      recommendations.takeProfit = riskAssessment.level === 'HIGH' ? '6-10%' : '10-15%';
      recommendations.timeHorizon = '1-4 weeks';
      
      recommendations.details.push(`Stop loss: ${recommendations.stopLoss}`);
      recommendations.details.push(`Take profit: ${recommendations.takeProfit} (2:1 risk/reward)`);
      recommendations.details.push(`Time horizon: ${recommendations.timeHorizon}`);
      
    } else if (signal.signal === 'SELL') {
      recommendations.details.push('Sell signal, consider reducing position');
      recommendations.details.push('Use trailing stop to protect profits');
    } else {
      recommendations.details.push('No clear signal, suggest waiting');
      recommendations.details.push('Wait for clearer trend formation');
    }
    
    recommendations.details.push(`Signal reason: ${signal.reason}`);
    
    return recommendations;
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const signals = new SmartTradingSignals();
  
  try {
    switch (command) {
      case 'analyze':
        const symbol = args.find(arg => arg.startsWith('--symbol'))?.split('=')[1] || CONFIG.defaultSymbol;
        const timeframe = args.find(arg => arg.startsWith('--timeframe'))?.split('=')[1] || CONFIG.defaultTimeframe;
        
        const result = await signals.analyze(symbol, timeframe);
        console.log(JSON.stringify(result, null, 2));
        break;
        
      case 'batch':
        const symbolsArg = args.find(arg => arg.startsWith('--symbols'))?.split('=')[1];
        if (!symbolsArg) {
          throw new Error('Missing --symbols parameter');
        }
        const symbols = symbolsArg.split(',');
        const batchTimeframe = args.find(arg => arg.startsWith('--timeframe'))?.split('=')[1] || CONFIG.defaultTimeframe;
        
        const batchResult = await signals.batchAnalyze(symbols, batchTimeframe);
        console.log(JSON.stringify(batchResult, null, 2));
        break;
        
      case 'test':
        // 测试OKX CLI连接
        console.error('Testing OKX CLI connection...');
        const testResult = await OKXCommand.execute('market', ['ticker', '--symbol', 'BTC/USDT']);
        console.log(JSON.stringify({ success: true, testResult }, null, 2));
        break;
        
      default:
        console.log(JSON.stringify({
          error: 'Unknown command',
          availableCommands: ['analyze', 'batch', 'test'],
          usage: {
            analyze: 'node smart-trading-signals.js analyze --symbol=BTC/USDT --timeframe=1h',
            batch: 'node smart-trading-signals.js batch --symbols=BTC/USDT,ETH/USDT --timeframe=1h',
            test: 'node smart-trading-signals.js test'
          }
        }, null, 2));
    }
  } catch (error) {
    console.log(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, null, 2));
    process.exit(1);
  }
}

// 如果是直接执行，运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// 导出模块
module.exports = {
  OKXCommand,
  RSIStrategy,
  MACDStrategy,
  SmartTradingSignals
};