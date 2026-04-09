---
name: smart-trading-signals
title: 智能交易信号
description: 基于OKX CLI的多策略交易信号分析，集成RSI和MACD技术指标，提供智能买卖信号和风险管理建议
version: 1.0.0
author: 菊中菊
category: trading-analysis
tags:
  - trading
  - strategy
  - analysis
  - crypto
  - signals
  - risk-management
requires:
  - okx-cli
---

# 智能交易信号

## 功能概述

本技能通过调用OKX CLI命令获取市场数据，执行RSI和MACD双策略分析，生成智能交易信号和风险管理建议。

### 🎯 核心差异化功能

| 功能 | 本技能 | okx-cex-market |
|------|--------|----------------|
| **策略组合** | RSI + MACD双指标交叉验证 | 单一市场数据展示 |
| **智能风险评分** | 动态风险评估系统 | 无风险评估 |
| **批量机会扫描** | 多交易对批量分析 | 单交易对分析 |
| **信号验证** | 多策略一致性验证 | 无信号验证 |
| **个性化配置** | 可调整策略参数 | 固定参数 |

### ✅ 已完成的功能

1. **✅ RSI策略** - 完整实现，支持超买超卖、背离检测
2. **✅ MACD策略** - 完整实现，支持金叉死叉、零轴交叉
3. **✅ 智能风险评分** - 基于波动率和市场状况
4. **✅ 批量分析** - 多交易对同时扫描
5. **✅ OKX CLI集成** - 调用OKX命令获取数据

## OKX CLI集成实现

### 数据获取方式
```bash
# 获取实时价格
okx market ticker --symbol BTC/USDT

# 获取K线数据
okx market candles --symbol BTC/USDT --timeframe 1h --limit 100

# 获取技术指标
okx market indicator --symbol BTC/USDT --indicator RSI --period 14
```

### 技能命令格式
```bash
# 基本分析
okx skill smart-trading-signals analyze --symbol BTC/USDT

# 批量分析
okx skill smart-trading-signals batch --symbols BTC/USDT,ETH/USDT

# 历史记录
okx skill smart-trading-signals history --symbol BTC/USDT --days 7

# 策略回测
okx skill smart-trading-signals backtest --symbol BTC/USDT --start 2024-01-01 --end 2024-01-31
```

## 技术架构

### 数据流设计
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   OKX CLI   │───▶│   技能层    │───▶│  策略引擎   │
│  (数据源)   │    │ (命令解析)  │    │ (RSI+MACD)  │
└─────────────┘    └─────────────┘    └─────────────┘
                                               │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  用户界面   │◀───│  信号生成   │◀───│ 风险评估   │
│  (结果展示) │    │ (综合决策)  │    │ (智能评分) │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 策略实现详情

#### 📊 RSI策略 (已完成)
- **计算**: 调用 `okx market indicator --indicator RSI`
- **信号**: 超卖(<30)买入、超买(>70)卖出
- **验证**: 背离检测、趋势确认
- **参数**: 可配置周期(14)、阈值

#### 📈 MACD策略 (已完成)
- **计算**: 调用OKX CLI计算MACD指标
- **信号**: 金叉买入、死叉卖出、零轴交叉
- **参数**: 快线(12)、慢线(26)、信号线(9)
- **分析**: 柱状图变化、趋势强度

#### 🎯 综合信号生成
1. **独立分析**: RSI和MACD分别计算信号
2. **强度加权**: 根据置信度加权计算
3. **风险调整**: 考虑市场波动性和趋势
4. **最终决策**: 生成买入/卖出/持有建议

## 完整代码示例

### RSI策略实现
```javascript
// 调用OKX CLI获取RSI数据
const rsiData = await execOKXCommand(
  'market indicator', 
  '--symbol=BTC/USDT --indicator=RSI --period=14'
);

// RSI信号分析
if (rsiData.value < 30) {
  signal = { type: 'BUY', strength: 0.8, reason: 'RSI超卖' };
} else if (rsiData.value > 70) {
  signal = { type: 'SELL', strength: 0.8, reason: 'RSI超买' };
}
```

### MACD策略实现
```javascript
// 调用OKX CLI获取MACD数据
const macdData = await execOKXCommand(
  'market indicator',
  '--symbol=BTC/USDT --indicator=MACD'
);

// MACD信号分析
if (macdData.macd > macdData.signal && macdData.histogram > 0) {
  signal = { type: 'BUY', strength: 0.75, reason: 'MACD金叉' };
} else if (macdData.macd < macdData.signal && macdData.histogram < 0) {
  signal = { type: 'SELL', strength: 0.75, reason: 'MACD死叉' };
}
```

### 智能风险评分
```javascript
// 风险评估算法
function assessRisk(marketData, signals) {
  const factors = [];
  let score = 50; // 基础分
  
  // 1. 市场波动性
  const volatility = calculateVolatility(marketData);
  if (volatility > 10) {
    score += 20;
    factors.push('高波动性');
  }
  
  // 2. 信号一致性
  const consistency = checkSignalConsistency(signals);
  if (!consistency) {
    score += 15;
    factors.push('信号冲突');
  }
  
  // 3. 趋势强度
  const trendStrength = analyzeTrend(marketData);
  score -= trendStrength * 10;
  
  return { score, factors, level: score > 70 ? 'HIGH' : score > 40 ? 'MEDIUM' : 'LOW' };
}
```

## 输出格式

### 分析结果
```json
{
  "success": true,
  "symbol": "BTC/USDT",
  "timestamp": "2024-01-15T10:30:00Z",
  "dataSource": "OKX CLI",
  "strategies": {
    "RSI": {
      "value": 28.5,
      "signal": "BUY",
      "confidence": 0.85,
      "reason": "RSI超卖区域"
    },
    "MACD": {
      "macd": 15.2,
      "signal": 12.8,
      "histogram": 2.4,
      "signal": "BUY",
      "confidence": 0.78,
      "reason": "MACD金叉确认"
    }
  },
  "compositeSignal": {
    "action": "BUY",
    "confidence": 0.82,
    "reason": "RSI和MACD双指标确认买入信号"
  },
  "riskAssessment": {
    "level": "LOW",
    "score": 35,
    "factors": ["低波动性", "趋势明确", "信号一致"]
  },
  "recommendations": {
    "positionSize": "15-25%",
    "stopLoss": "5%",
    "takeProfit": "10%",
    "timeframe": "1-2周"
  }
}
```

### 批量分析结果
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "totalAnalyzed": 10,
  "topOpportunities": [
    {
      "symbol": "SOL/USDT",
      "action": "STRONG_BUY",
      "confidence": 88,
      "riskScore": 30,
      "reason": "双指标强烈买入信号"
    },
    {
      "symbol": "ETH/USDT",
      "action": "BUY",
      "confidence": 75,
      "riskScore": 40,
      "reason": "RSI超卖反弹"
    }
  ],
  "summary": {
    "buySignals": 4,
    "sellSignals": 1,
    "holdSignals": 5,
    "averageConfidence": 72.5
  }
}
```

## 安装与配置

### 1. 安装OKX CLI
```bash
# 安装OKX CLI
npm install -g @okx/cli

# 配置API密钥
okx config set api_key=your_key
okx config set api_secret=your_secret
okx config set passphrase=your_passphrase
```

### 2. 安装本技能
```bash
# 通过npm安装
npm install -g smart-trading-signals-skill

# 或从GitHub安装
git clone https://github.com/Lobster-Tempo/trading-strategy-skill.git
cd trading-strategy-skill
npm install
```

### 3. 验证安装
```bash
# 测试OKX CLI连接
okx market ticker --symbol BTC/USDT

# 测试技能功能
okx skill smart-trading-signals analyze --symbol BTC/USDT --test
```

## 使用示例

### 场景1：单交易对分析
```bash
# 分析BTC/USDT
okx skill smart-trading-signals analyze \
  --symbol BTC/USDT \
  --timeframe 1h \
  --strategy ALL \
  --risk-tolerance medium

# 输出：买入信号，置信度82%，低风险
```

### 场景2：批量机会扫描
```bash
# 扫描前10大币种
okx skill smart-trading-signals batch \
  --symbols BTC/USDT,ETH/USDT,BNB/USDT,SOL/USDT,XRP/USDT,ADA/USDT,AVAX/USDT,DOGE/USDT,DOT/USDT,TRX/USDT \
  --timeframe 4h \
  --max-results 5

# 输出：TOP 5交易机会列表
```

### 场景3：风险管理
```bash
# 获取详细风险评估
okx skill smart-trading-signals analyze \
  --symbol BTC/USDT \
  --risk-detail full \
  --include-scenarios

# 输出：完整风险报告，包含压力测试场景
```

## 性能与限制

### ✅ 优势
- **实时性**: 基于OKX实时数据
- **准确性**: 双指标交叉验证
- **灵活性**: 可配置参数
- **扩展性**: 支持添加新策略

### ⚠️ 限制
- 依赖OKX CLI网络连接
- 需要有效的API密钥
- 历史数据受OKX限制
- 不保证投资收益

## 更新计划

### v1.1.0 (规划中)
- 添加移动平均线策略
- 支持自定义指标组合
- 增强回测功能
- 添加预警通知

### v1.2.0 (规划中)
- 集成更多数据源
- 机器学习信号优化
- 社区策略共享
- 移动端适配

## 技术支持

### 问题反馈
- GitHub Issues: https://github.com/Lobster-Tempo/trading-strategy-skill/issues
- 邮箱: yu230650@github.com

### 文档资源
- 完整API文档: [待补充]
- 使用教程: [待补充]
- 视频演示: [待补充]

## 许可证
MIT License

## 免责声明
本技能提供的交易信号仅供参考，不构成投资建议。加密货币交易存在高风险，请谨慎决策。作者不对任何投资损失负责。

---

**技能ID**: `smart-trading-signals`  
**最后更新**: 2024-01-15  
**兼容性**: OKX CLI v1.0.0+  
**状态**: ✅ 生产就绪