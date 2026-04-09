#!/usr/bin/env node

/**
 * 交易策略分析脚本
 * 用法: node analyze.js --symbol BTC/USDT --timeframe 1h --strategy RSI
 */

const TradingStrategySkill = require('../src/TradingStrategySkill');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    symbol: process.env.DEFAULT_SYMBOL || 'BTC/USDT',
    timeframe: process.env.DEFAULT_TIMEFRAME || '1h',
    strategy: process.env.DEFAULT_STRATEGY || 'RSI',
    dataLimit: 100,
    verbose: false,
    output: 'json' // json, text, summary
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--symbol' || arg === '-s') {
      options.symbol = args[++i];
    } else if (arg === '--timeframe' || arg === '-t') {
      options.timeframe = args[++i];
    } else if (arg === '--strategy' || arg === '-st') {
      options.strategy = args[++i];
    } else if (arg === '--limit' || arg === '-l') {
      options.dataLimit = parseInt(args[++i], 10);
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--version') {
      console.log('交易策略分析技能 v1.0.0');
      process.exit(0);
    }
  }

  return options;
}

// 打印帮助信息
function printHelp() {
  console.log(`
交易策略分析工具

用法:
  node analyze.js [选项]

选项:
  -s, --symbol <symbol>     交易对 (默认: BTC/USDT)
  -t, --timeframe <tf>      时间周期 (默认: 1h)
  -st, --strategy <name>    策略名称 (默认: RSI)
  -l, --limit <number>      数据条数 (默认: 100)
  -o, --output <format>     输出格式: json, text, summary (默认: json)
  -v, --verbose             详细输出
  -h, --help                显示帮助信息
      --version             显示版本信息

示例:
  node analyze.js --symbol BTC/USDT --timeframe 4h --strategy RSI
  node analyze.js -s ETH/USDT -t 1d -st RSI -o summary
  node analyze.js --help

支持的时间周期:
  1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w

支持的策略:
  RSI (相对强弱指数)
  // MACD (即将支持)
  // MA (移动平均线，即将支持)
  // BollingerBands (布林带，即将支持)
  `);
}

// 格式化输出
function formatOutput(result, format) {
  switch (format) {
    case 'json':
      return JSON.stringify(result, null, 2);
    
    case 'text':
      return formatAsText(result);
    
    case 'summary':
      return formatSummary(result);
    
    default:
      return JSON.stringify(result, null, 2);
  }
}

// 文本格式输出
function formatAsText(result) {
  const lines = [];
  
  lines.push('='.repeat(60));
  lines.push(`交易策略分析报告`);
  lines.push('='.repeat(60));
  lines.push('');
  
  lines.push(`📊 基本信息`);
  lines.push(`  交易对: ${result.symbol}`);
  lines.push(`  时间周期: ${result.timeframe}`);
  lines.push(`  策略: ${result.strategy}`);
  lines.push(`  当前价格: $${result.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  lines.push(`  分析时间: ${new Date(result.timestamp).toLocaleString()}`);
  lines.push('');
  
  lines.push(`📈 交易信号`);
  lines.push(`  信号类型: ${getSignalEmoji(result.signal.type)} ${result.signal.type}`);
  lines.push(`  信号强度: ${(result.signal.strength * 100).toFixed(1)}%`);
  lines.push(`  趋势方向: ${result.signal.trend}`);
  if (result.signal.crossover) {
    lines.push(`  交叉类型: ${result.signal.crossover}`);
  }
  lines.push(`  RSI值: ${result.signal.rsiValue?.toFixed(2) || 'N/A'}`);
  lines.push(`  分析置信度: ${(result.confidence * 100).toFixed(1)}%`);
  lines.push('');
  
  lines.push(`⚠️ 风险评估`);
  lines.push(`  风险等级: ${result.riskAssessment?.level || 'MEDIUM'}`);
  lines.push(`  风险分数: ${(result.riskAssessment?.score * 100).toFixed(1)}%`);
  if (result.riskAssessment?.factors) {
    lines.push(`  风险因素:`);
    result.riskAssessment.factors.forEach(factor => {
      lines.push(`    • ${factor}`);
    });
  }
  lines.push('');
  
  if (result.recommendations) {
    lines.push(`💡 交易建议`);
    lines.push(`  操作: ${result.recommendations.action}`);
    lines.push(`  建议仓位: ${result.recommendations.positionSize.description}`);
    lines.push(`  入场价格: $${result.recommendations.entry.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    lines.push(`  止损位: ${result.recommendations.stopLoss.level} (${result.recommendations.stopLoss.rationale})`);
    lines.push(`  止盈位: ${result.recommendations.takeProfit.level} (${result.recommendations.takeProfit.rationale})`);
    lines.push('');
    
    lines.push(`📋 操作步骤:`);
    result.recommendations.steps.forEach((step, index) => {
      lines.push(`  ${step}`);
    });
    lines.push('');
  }
  
  lines.push(`🎯 绩效预测`);
  lines.push(`  预期收益: ${(result.performancePrediction.expectedReturn * 100).toFixed(1)}%`);
  lines.push(`  成功概率: ${(result.performancePrediction.successProbability * 100).toFixed(1)}%`);
  lines.push(`  风险调整后收益: ${(result.performancePrediction.riskAdjustedReturn * 100).toFixed(1)}%`);
  lines.push(`  时间框架: ${result.performancePrediction.timeframe}`);
  lines.push('');
  
  lines.push(`📝 关键建议`);
  lines.push(`  ${result.summary.keyRecommendation}`);
  lines.push('');
  
  lines.push('='.repeat(60));
  lines.push(`分析完成 - ${new Date().toLocaleString()}`);
  lines.push('='.repeat(60));
  
  return lines.join('\n');
}

// 摘要格式输出
function formatSummary(result) {
  const lines = [];
  
  lines.push(`🔍 ${result.symbol} ${result.timeframe} ${result.strategy}分析`);
  lines.push(`📊 价格: $${result.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  lines.push(`📈 信号: ${getSignalEmoji(result.signal.type)} ${result.signal.type} (强度: ${(result.signal.strength * 100).toFixed(1)}%)`);
  lines.push(`🎯 置信度: ${(result.confidence * 100).toFixed(1)}%`);
  lines.push(`⚠️ 风险: ${result.riskAssessment?.level || 'MEDIUM'}`);
  lines.push(`💰 预期收益: ${(result.performancePrediction.expectedReturn * 100).toFixed(1)}%`);
  lines.push(`💡 建议: ${result.summary.keyRecommendation}`);
  
  return lines.join('\n');
}

// 获取信号表情
function getSignalEmoji(signalType) {
  switch (signalType) {
    case 'BUY': return '🟢';
    case 'SELL': return '🔴';
    case 'HOLD': return '🟡';
    default: return '⚪';
  }
}

// 主函数
async function main() {
  try {
    const options = parseArgs();
    
    if (options.verbose) {
      console.log('🔧 配置选项:', options);
      console.log('🚀 初始化交易策略技能...');
    }
    
    // 创建技能实例
    const skillConfig = {
      defaultSymbol: options.symbol,
      defaultTimeframe: options.timeframe,
      defaultStrategy: options.strategy,
      logLevel: options.verbose ? 'debug' : 'info',
      
      // API配置
      apiConfig: {
        apiKey: process.env.OKX_API_KEY,
        secretKey: process.env.OKX_SECRET_KEY,
        passphrase: process.env.OKX_PASSPHRASE
      },
      
      // RSI策略配置
      strategies: {
        RSI: {
          rsiPeriod: parseInt(process.env.RSI_PERIOD, 10) || 14,
          overbought: parseInt(process.env.RSI_OVERBOUGHT, 10) || 70,
          oversold: parseInt(process.env.RSI_OVERSOLD, 10) || 30
        }
      }
    };
    
    const skill = new TradingStrategySkill(skillConfig);
    
    if (options.verbose) {
      console.log('✅ 技能初始化完成');
      console.log('📡 获取市场数据...');
    }
    
    // 执行分析
    const analysisOptions = {
      symbol: options.symbol,
      timeframe: options.timeframe,
      strategy: options.strategy,
      dataLimit: options.dataLimit,
      includeMarketData: true,
      includeRiskAssessment: true,
      includeRecommendations: true
    };
    
    const result = await skill.analyze(analysisOptions);
    
    // 输出结果
    const output = formatOutput(result, options.output);
    console.log(output);
    
    if (options.verbose) {
      console.log('✅ 分析完成');
      
      // 显示性能统计
      const stats = skill.getPerformanceStats();
      console.log('\n📊 性能统计:');
      console.log(`  总分析次数: ${stats.totalAnalyses}`);
      console.log(`  平均置信度: ${(stats.averageConfidence * 100).toFixed(1)}%`);
      console.log(`  数据请求次数: ${stats.dataFetcherStats.totalRequests}`);
    }
    
  } catch (error) {
    console.error('❌ 分析失败:', error.message);
    
    if (process.env.DEBUG_MODE === 'true') {
      console.error('错误详情:', error.stack);
    }
    
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  formatOutput,
  main
};