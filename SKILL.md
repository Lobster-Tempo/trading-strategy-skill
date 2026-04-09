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

本技能提供基于OKX CLI的多策略交易信号分析，通过RSI和MACD双指标验证，生成智能买卖信号和风险管理建议。

### 核心功能

1. **多策略分析**: RSI + MACD双指标组合验证
2. **智能风险评分**: 基于波动率和市场状况的动态风险评估
3. **批量机会扫描**: 自动筛选最佳交易机会
4. **个性化配置**: 支持用户自定义参数
5. **历史信号分析**: 记录和分析信号表现

### 与现有技能的区别

| 功能 | 本技能 | okx-cex-market |
|------|--------|----------------|
| 策略组合 | RSI + MACD双指标 | 单一市场数据 |
| 风险评估 | 智能风险评分系统 | 无风险评估 |
| 批量分析 | 支持多交易对批量扫描 | 单交易对分析 |
| 信号验证 | 多策略交叉验证 | 无信号验证 |
| 个性化 | 可配置参数 | 固定参数 |

## 安装要求

### 系统要求
- Node.js >= 16.0.0
- OKX CLI 已安装并配置
- 网络连接

### 依赖安装
```bash
npm install smart-trading-signals-skill
```

### OKX CLI配置
确保OKX CLI已正确配置：
```bash
okx config set api_key=your_api_key
okx config set api_secret=your_api_secret
okx config set passphrase=your_passphrase
```

## 使用方法

### 基本命令

```bash
# 分析单个交易对
okx skill smart-trading-signals analyze --symbol BTC/USDT --timeframe 1h

# 批量分析多个交易对
okx skill smart-trading-signals batch --symbols BTC/USDT,ETH/USDT,SOL/USDT

# 获取历史信号
okx skill smart-trading-signals history --symbol BTC/USDT --days 7

# 策略回测
okx skill smart-trading-signals backtest --symbol BTC/USDT --strategy RSI --start 2024-01-01 --end 2024-01-31
```

### 参数说明

#### analyze命令参数
- `--symbol`: 交易对符号 (默认: BTC/USDT)
- `--timeframe`: 时间周期 (默认: 1h, 可选: 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w)
- `--strategy`: 分析策略 (默认: ALL, 可选: RSI, MACD, ALL)
- `--data-limit`: 数据点数 (默认: 100)
- `--risk-tolerance`: 风险容忍度 (默认: medium, 可选: low, medium, high)

#### batch命令参数
- `--symbols`: 交易对列表，逗号分隔
- `--timeframe`: 时间周期
- `--max-results`: 最大结果显示数 (默认: 10)

#### history命令参数
- `--symbol`: 交易对符号
- `--days`: 历史天数 (默认: 7)
- `--strategy`: 策略名称

#### backtest命令参数
- `--symbol`: 交易对符号
- `--strategy`: 策略名称
- `--start`: 开始日期 (YYYY-MM-DD)
- `--end`: 结束日期 (YYYY-MM-DD)
- `--initial-capital`: 初始资金 (默认: 10000)

## 输出示例

### 单个分析输出
```json
{
  "success": true,
  "symbol": "BTC/USDT",
  "timeframe": "1h",
  "timestamp": "2024-01-15T10:30:00Z",
  "currentPrice": 42500.50,
  "marketCondition": {
    "trend": "BULLISH",
    "volatility": "3.2%",
    "priceChange": "2.5%",
    "volumeTrend": "INCREASING"
  },
  "strategies": {
    "RSI": {
      "success": true,
      "signal": {
        "type": "BUY",
        "strength": 0.75,
        "description": "RSI超卖反弹，买入信号"
      },
      "confidence": 0.82,
      "riskAssessment": {
        "level": "MEDIUM",
        "score": 45,
        "factors": ["波动性适中", "趋势明确"]
      }
    },
    "MACD": {
      "success": true,
      "signal": {
        "type": "BUY",
        "strength": 0.68,
        "description": "MACD金叉，买入信号"
      },
      "confidence": 0.78,
      "riskAssessment": {
        "level": "LOW",
        "score": 35,
        "factors": ["趋势一致", "信号清晰"]
      }
    }
  },
  "compositeSignal": {
    "type": "BUY",
    "confidence": 0.80,
    "description": "RSI和MACD双指标确认买入信号",
    "source": "RSI+MACD"
  },
  "riskAssessment": {
    "level": "LOW",
    "score": 40,
    "description": "低风险，适合操作",
    "factors": ["双指标一致", "波动性低", "趋势明确"]
  },
  "recommendations": {
    "action": "BUY",
    "confidence": 0.80,
    "riskLevel": "LOW",
    "positionSize": "中等仓位 (15-25%)",
    "stopLoss": "5%",
    "takeProfit": "10%",
    "timeHorizon": "1-4周",
    "details": [
      "双指标确认买入信号",
      "低风险环境，适合中等仓位操作",
      "建议止损位: 5%",
      "建议止盈位: 10% (风险回报比 2:1)",
      "预期持有时间: 1-4周"
    ]
  },
  "summary": {
    "action": "BUY",
    "confidence": "80.0%",
    "riskLevel": "LOW",
    "expectedReturn": "5-15%",
    "keyRecommendation": "双指标确认买入信号"
  }
}
```

### 批量分析输出
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "totalSymbols": 10,
  "analyzedSymbols": 10,
  "successfulAnalyses": 10,
  "failedAnalyses": 0,
  "summary": {
    "buySignals": 3,
    "sellSignals": 1,
    "holdSignals": 6,
    "averageConfidence": 72.5,
    "topOpportunities": [
      {
        "symbol": "SOL/USDT",
        "action": "STRONG_BUY",
        "confidence": 85,
        "signalStrength": 0.85,
        "riskScore": 30,
        "score": 8.5
      },
      {
        "symbol": "ETH/USDT",
        "action": "BUY",
        "confidence": 78,
        "signalStrength": 0.78,
        "riskScore": 35,
        "score": 7.8
      }
    ]
  },
  "results": [...],
  "metadata": {
    "analysisTime": 1250,
    "batchSize": 10
  }
}
```

## 技术实现

### 架构设计
```
┌─────────────────┐
│   OKX CLI      │
│   (数据源)     │
└────────┬────────┘
         │
┌────────▼────────┐
│  技能适配层     │
│  (命令解析)     │
└────────┬────────┘
         │
┌────────▼────────┐
│  策略引擎       │
│  (RSI+MACD)     │
└────────┬────────┘
         │
┌────────▼────────┐
│  风险评估       │
│  (智能评分)     │
└────────┬────────┘
         │
┌────────▼────────┐
│  信号生成       │
│  (综合决策)     │
└─────────────────┘
```

### 策略算法

#### RSI策略
- **计算周期**: 14日
- **超买阈值**: 70
- **超卖阈值**: 30
- **信号类型**: 超买卖出、超卖买入、背离信号

#### MACD策略
- **快线周期**: 12
- **慢线周期**: 26
- **信号线周期**: 9
- **信号类型**: 金叉买入、死叉卖出、零轴交叉

#### 综合信号生成
1. 各策略独立分析
2. 信号强度加权
3. 风险因素调整
4. 生成最终建议

### 风险评估模型
1. **市场波动性分析**
2. **趋势一致性评估**
3. **信号冲突检测**
4. **历史表现参考**
5. **综合风险评分**

## 配置选项

### 技能配置
```javascript
{
  "defaultSymbol": "BTC/USDT",
  "defaultTimeframe": "1h",
  "defaultStrategy": "ALL",
  "cacheEnabled": true,
  "cacheTTL": 30000,
  "logLevel": "info",
  "maxBatchSize": 10,
  "riskTolerance": "medium"
}
```

### 策略配置
```javascript
{
  "strategies": {
    "RSI": {
      "period": 14,
      "overbought": 70,
      "oversold": 30,
      "useDivergence": true
    },
    "MACD": {
      "fastPeriod": 12,
      "slowPeriod": 26,
      "signalPeriod": 9,
      "threshold": 0.001,
      "useHistogram": true,
      "useZeroCross": true
    }
  }
}
```

## 错误处理

### 常见错误
```json
{
  "success": false,
  "error": "获取市场数据失败: 网络连接超时",
  "timestamp": "2024-01-15T10:30:00Z",
  "signal": {
    "type": "NEUTRAL",
    "confidence": 0,
    "description": "分析失败"
  },
  "recommendations": {
    "action": "HOLD",
    "reason": "技术分析暂时不可用"
  }
}
```

### 错误代码
- `ERR_NETWORK`: 网络连接错误
- `ERR_DATA`: 数据获取失败
- `ERR_CALCULATION`: 计算错误
- `ERR_CONFIG`: 配置错误
- `ERR_AUTH`: 认证错误

## 性能指标

### 响应时间
- 单个分析: < 2秒
- 批量分析(10个): < 5秒
- 历史查询: < 1秒

### 资源使用
- 内存占用: < 50MB
- CPU使用: < 10%
- 网络请求: 1-3次/分析

## 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- RSI策略实现
- MACD策略实现
- 智能风险评分系统
- 批量分析功能
- OKX CLI集成

## 支持与反馈

### 问题报告
- GitHub Issues: https://github.com/Lobster-Tempo/trading-strategy-skill/issues
- 邮箱: yu230650@github.com

### 功能请求
欢迎提交功能请求和改进建议。

## 许可证
MIT License

## 免责声明
本技能提供的交易信号仅供参考，不构成投资建议。加密货币交易存在高风险，请谨慎决策。作者不对任何投资损失负责。

---

**技能ID**: `smart-trading-signals`  
**最后更新**: 2024-01-15  
**兼容性**: OKX CLI v1.0.0+