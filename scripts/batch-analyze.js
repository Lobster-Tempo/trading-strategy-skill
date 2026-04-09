#!/usr/bin/env node

/**
 * 批量交易策略分析脚本
 * 用法: node batch-analyze.js --symbols BTC/USDT,ETH/USDT,SOL/USDT
 */

const TradingStrategySkill = require('../src/TradingStrategySkill');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    symbols: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
    timeframe: process.env.DEFAULT_TIMEFRAME || '1h',
    strategy: process.env.DEFAULT_STRATEGY || 'RSI',
    dataLimit: 100,
    output: 'summary', // json, text, summary, table
    sortBy: 'score', // score, confidence, strength, symbol
    limit: 10,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--symbols' || arg === '-s') {
      options.symbols = args[++i].split(',').map(s => s.trim());
    } else if (arg === '--timeframe' || arg === '-t') {
      options.timeframe = args[++i];
    } else if (arg === '--strategy' || arg === '-st') {
      options.strategy = args[++i];
    } else if (arg === '--limit' || arg === '-l') {
      options.dataLimit = parseInt(args[++i], 10);
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--sort' || arg === '-so') {
      options.sortBy = args[++i];
    } else if (arg === '--top' || arg === '-n') {
      options.limit = parseInt(args[++i], 10);
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

// 打印帮助信息
function printHelp() {
  console.log(`
批量交易策略分析工具

用法:
  node batch-analyze.js [选项]

选项:
  -s, --symbols <list>      交易对列表，用逗号分隔 (默认: BTC/USDT,ETH/USDT,SOL/USDT)
  -t, --timeframe <tf>      时间周期 (默认: 1h)
  -st, --strategy <name>    策略名称 (默认: RSI)
  -l, --limit <number>      每个币种的数据条数 (默认: 100)
  -o, --output <format>     输出格式: json, text, summary, table (默认: summary)
  -so, --sort <field>       排序字段: score, confidence, strength, symbol (默认: score)
  -n, --top <number>        显示前N个结果 (默认: 10)
  -v, --verbose             详细输出
  -h, --help                显示帮助信息

示例:
  node batch-analyze.js --symbols BTC/USDT,ETH/USDT,SOL/USDT
  node batch-analyze.js -s "BTC/USDT, ETH/USDT, BNB/USDT" -t 4h -o table
  node batch-analyze.js --symbols "BTC/USDT,ETH/USDT" --top 5 --sort confidence
  node batch-analyze.js --help

预定义交易对列表:
  --symbols top10    前10大市值币种
  --symbols top20    前20大市值币种
  --symbols defi     主流DeFi币种
  --symbols layer1   主流Layer1币种
  `);
}

// 获取预定义交易对列表
function getPredefinedSymbols(listName) {
  const lists = {
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
  
  return lists[listName] || null;
}

// 格式化输出
function formatOutput(batchReport, format, options) {
  switch (format) {
    case 'json':
      return JSON.stringify(batchReport, null, 2);
    
    case 'text':
      return formatAsText(batchReport, options);
    
    case 'summary':
      return formatSummary(batchReport, options);
    
    case 'table':
      return formatAsTable(batchReport, options);
    
    default:
      return formatSummary(batchReport, options);
  }
}

// 文本格式输出
function formatAsText(batchReport, options) {
  const lines = [];
  const { results, summary, timestamp } = batchReport;
  
  lines.push('='.repeat(80));
  lines.push(`批量交易策略分析报告`);
  lines.push('='.repeat(80));
  lines.push('');
  
  lines.push(`📊 批量分析概要`);
  lines.push(`  分析时间: ${new Date(timestamp).toLocaleString()}`);
  lines.push(`  总交易对: ${batchReport.totalSymbols}个`);
  lines.push(`  成功分析: ${batchReport.successfulAnalyses}个`);
  lines.push(`  失败分析: ${batchReport.failedAnalyses}个`);
  lines.push(`  买入信号: ${summary.buySignals}个`);
  lines.push(`  卖出信号: ${summary.sellSignals}个`);
  lines.push(`  观望信号: ${summary.holdSignals}个`);
  lines.push(`  平均置信度: ${(summary.averageConfidence * 100).toFixed(1)}%`);
  lines.push('');
  
  if (batchReport.errors.length > 0) {
    lines.push(`❌ 分析错误:`);
    batchReport.errors.forEach(error => {
      lines.push(`  • ${error.symbol}: ${error.error}`);
    });
    lines.push('');
  }
  
  lines.push(`🎯 最佳交易机会 (前${Math.min(options.limit, summary.topOpportunities.length)}个):`);
  lines.push('');
  
  summary.topOpportunities.slice(0, options.limit).forEach((opp, index) => {
    lines.push(`${index + 1}. ${opp.symbol}`);
    lines.push(`   操作: ${getSignalEmoji(opp.action)} ${opp.action}`);
    lines.push(`   置信度: ${(opp.confidence * 100).toFixed(1)}%`);
    lines.push(`   信号强度: ${(opp.signalStrength * 100).toFixed(1)}%`);
    lines.push(`   综合评分: ${opp.score.toFixed(3)}`);
    lines.push('');
  });
  
  lines.push(`📋 详细分析结果:`);
  lines.push('');
  
  // 排序结果
  const sortedResults = sortResults(results, options.sortBy);
  
  sortedResults.slice(0, options.limit).forEach((result, index) => {
    lines.push(`${index + 1}. ${result.symbol} (${result.timeframe})`);
    lines.push(`   信号: ${getSignalEmoji(result.signal.type)} ${result.signal.type}`);
    lines.push(`   强度: ${(result.signal.strength * 100).toFixed(1)}%`);
    lines.push(`   置信度: ${(result.confidence * 100).toFixed(1)}%`);
    lines.push(`   风险等级: ${result.riskAssessment?.level || 'MEDIUM'}`);
    lines.push(`   预期收益: ${(result.performancePrediction.expectedReturn * 100).toFixed(1)}%`);
    lines.push(`   关键建议: ${result.summary.keyRecommendation}`);
    lines.push('');
  });
  
  lines.push('='.repeat(80));
  lines.push(`批量分析完成 - ${new Date().toLocaleString()}`);
  lines.push('='.repeat(80));
  
  return lines.join('\n');
}

// 摘要格式输出
function formatSummary(batchReport, options) {
  const lines = [];
  const { summary } = batchReport;
  
  lines.push(`🔍 批量分析概要 (${batchReport.successfulAnalyses}/${batchReport.totalSymbols} 成功)`);
  lines.push(`📊 信号分布: 🟢买入${summary.buySignals}个 🔴卖出${summary.sellSignals}个 🟡观望${summary.holdSignals}个`);
  lines.push(`🎯 平均置信度: ${(summary.averageConfidence * 100).toFixed(1)}%`);
  lines.push('');
  
  lines.push(`🏆 最佳机会 (按${options.sortBy}排序):`);
  
  summary.topOpportunities.slice(0, options.limit).forEach((opp, index) => {
    const rank = index + 1;
    const signalEmoji = getSignalEmoji(opp.action);
    const score = (opp.score * 100).toFixed(1);
    
    lines.push(`${rank}. ${signalEmoji} ${opp.symbol.padEnd(12)} ${opp.action.padEnd(6)} 置信度:${(opp.confidence * 100).toFixed(1).padStart(5)}% 评分:${score.padStart(5)}%`);
  });
  
  return lines.join('\n');
}

// 表格格式输出
function formatAsTable(batchReport, options) {
  const lines = [];
  const { results, summary } = batchReport;
  
  // 表头
  lines.push('='.repeat(120));
  lines.push('批量交易策略分析结果');
  lines.push('='.repeat(120));
  lines.push('');
  
  // 统计信息
  lines.push(`统计: 成功${batchReport.successfulAnalyses}/${batchReport.totalSymbols} | 买入:${summary.buySignals} 卖出:${summary.sellSignals} 观望:${summary.holdSignals} | 平均置信度:${(summary.averageConfidence * 100).toFixed(1)}%`);
  lines.push('');
  
  // 表格标题
  const header = [
    '排名'.padEnd(4),
    '交易对'.padEnd(12),
    '信号'.padEnd(8),
    '价格(USD)'.padEnd(12),
    '强度%'.padEnd(8),
    '置信度%'.padEnd(10),
    '风险等级'.padEnd(10),
    '预期收益%'.padEnd(12),
    '建议'
  ].join(' | ');
  
  lines.push(header);
  lines.push('-'.repeat(120));
  
  // 排序结果
  const sortedResults = sortResults(results, options.sortBy);
  
  // 表格内容
  sortedResults.slice(0, options.limit).forEach((result, index) => {
    const rank = (index + 1).toString().padEnd(4);
    const symbol = result.symbol.padEnd(12);
    const signal = `${getSignalEmoji(result.signal.type)} ${result.signal.type}`.padEnd(8);
    const price = `$${result.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`.padEnd(12);
    const strength = `${(result.signal.strength * 100).toFixed(1)}%`.padEnd(8);
    const confidence = `${(result.confidence * 100).toFixed(1)}%`.padEnd(10);
    const risk = (result.riskAssessment?.level || 'MEDIUM').padEnd(10);
    const expectedReturn = `${(result.performancePrediction.expectedReturn * 100).toFixed(1)}%`.padEnd(12);
    const recommendation = result.summary.keyRecommendation.substring(0, 30) + (result.summary.keyRecommendation.length > 30 ? '...' : '');
    
    const row = [rank, symbol, signal, price, strength, confidence, risk, expectedReturn, recommendation].join(' | ');
    lines.push(row);
  });
  
  lines.push('');
  lines.push('='.repeat(120));
  lines.push(`生成时间: ${new Date().toLocaleString()}`);
  lines.push('='.repeat(120));
  
  return lines.join('\n');
}

// 排序结果
function sortResults(results, sortBy) {
  return [...results].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        const scoreA = a.confidence * a.signal.strength;
        const scoreB = b.confidence * b.signal.strength;
        return scoreB - scoreA;
      
      case 'confidence':
        return b.confidence - a.confidence;
      
      case 'strength':
        return b.signal.strength - a.signal.strength;
      
      case 'symbol':
        return a.symbol.localeCompare(b.symbol);
      
      default:
        const defaultScoreA = a.confidence * a.signal.strength;
        const defaultScoreB = b.confidence * b.signal.strength;
        return defaultScoreB - defaultScoreA;
    }
  });
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
    
    // 检查是否为预定义列表
    if (options.symbols.length === 1) {
      const predefined = getPredefinedSymbols(options.symbols[0]);
      if (predefined) {
        options.symbols = predefined;
      }
    }
    
    if (options.verbose) {
      console.log('🔧 配置选项:', options);
      console.log(`📊 分析 ${options.symbols.length} 个交易对:`, options.symbols.join(', '));
      console.log('🚀 初始化交易策略技能...');
    }
    
    // 创建技能实例
    const skillConfig = {
      defaultSymbol: options.symbols[0],
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
      console.log('📡 开始批量分析...');
    }
    
    // 执行批量分析
    const batchReport = await skill.analyzeBatch(options.symbols, {
      timeframe: options.timeframe,
      strategy: options.strategy,
      dataLimit: options.dataLimit,
      includeMarketData: false,
      includeRiskAssessment: true,
      includeRecommendations: true
    });
    
    // 输出结果
    const output = formatOutput(batchReport, options.output, options);
    console.log(output);
    
    if (options.verbose) {
      console.log('✅ 批量分析完成');
      
      // 显示性能统计
      const stats = skill.getPerformanceStats();
      console.log('\n📊 性能统计:');
      console.log(`  总分析次数: ${stats.totalAnalyses}`);
      console.log(`  平均置信度: ${(stats.averageConfidence * 100).toFixed(1)}%`);
      console.log(`  数据请求次数: ${stats.dataFetcherStats.totalRequests}`);
      console.log(`  缓存命中率: ${stats.dataFetcherStats.cacheHits}/${stats.dataFetcherStats.cacheSize}`);
    }
    
  } catch (error) {
    console.error('❌ 批量分析失败:', error.message);
    
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
  getPredefinedSymbols,
  main
};