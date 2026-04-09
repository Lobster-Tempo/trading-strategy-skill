---
name: smart-trading-signals
title: 智能交易信号
description: 基于RSI和MACD双指标的交易信号分析Skill，提供智能买卖信号和风险管理建议
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
  - okx-cex-market
  - okx-cex-trade
---

# 智能交易信号

## 🎯 技能概述

智能交易信号是一个基于RSI和MACD双指标的交易信号分析Skill。当用户需要交易信号分析、风险管理建议或批量机会扫描时，可以使用此技能。

### 触发词
- '交易信号'
- '智能分析'
- 'RSI MACD'
- '批量扫描'
- '风险评估'
- '交易建议'

### 功能特点
- **双指标验证**: RSI + MACD交叉验证，提高信号准确性
- **智能风险评分**: 基于市场波动性和信号一致性的动态风险评估
- **批量机会扫描**: 同时分析多个交易对，找出最佳交易机会
- **个性化配置**: 支持自定义策略参数和风险偏好

## 🚀 安装方式

### 一键安装
```bash
npx @okx_ai/okx-trade-cli@latest skill add smart-trading-signals
```

### 手动安装
1. 确保已安装OKX Trade CLI
2. 运行安装命令：
```bash
okx skill install smart-trading-signals
```

## 📖 使用方法

### 基本命令
```bash
# 分析单个交易对
okx skill smart-trading-signals analyze --symbol BTC/USDT

# 批量分析多个交易对
okx skill smart-trading-signals batch --symbols BTC/USDT,ETH/USDT,SOL/USDT

# 获取详细风险评估
okx skill smart-trading-signals risk --symbol BTC/USDT
```

### 参数说明
- `--symbol`: 交易对符号 (默认: BTC/USDT)
- `--symbols`: 交易对列表，逗号分隔
- `--timeframe`: 时间周期 (默认: 1h, 可选: 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w)
- `--strategy`: 分析策略 (默认: ALL, 可选: RSI, MACD, ALL)
- `--risk-tolerance`: 风险容忍度 (默认: medium, 可选: low, medium, high)

## 📊 输出示例

### 单个分析输出
```json
{
  "success": true,
  "symbol": "BTC/USDT",
  "signal": "BUY",
  "confidence": 82,
  "riskLevel": "LOW",
  "recommendation": "双指标确认买入信号，建议中等仓位",
  "details": {
    "RSI": "超卖区域 (28.5)",
    "MACD": "金叉确认",
    "riskFactors": ["低波动性", "趋势明确"]
  }
}
```

### 批量分析输出
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "summary": {
    "totalAnalyzed": 10,
    "buySignals": 3,
    "sellSignals": 1,
    "holdSignals": 6,
    "topOpportunities": [
      {"symbol": "SOL/USDT", "action": "STRONG_BUY", "confidence": 85},
      {"symbol": "ETH/USDT", "action": "BUY", "confidence": 78}
    ]
  }
}
```

## 🔧 技术实现

### 依赖技能
- **okx-cex-market**: 获取实时市场数据
- **okx-cex-trade**: 执行交易操作（可选）

### 算法原理
1. **数据获取**: 通过okx-cex-market获取实时价格和K线数据
2. **指标计算**: 计算RSI和MACD技术指标
3. **信号生成**: 基于双指标交叉验证生成交易信号
4. **风险评估**: 分析市场波动性和信号一致性
5. **建议输出**: 提供仓位管理和风险管理建议

### 策略详情
- **RSI策略**: 14日周期，超卖(<30)买入，超买(>70)卖出
- **MACD策略**: 快线12，慢线26，信号线9，金叉买入，死叉卖出
- **综合信号**: 双指标一致时增强信号，冲突时降低置信度

## ⚠️ 风险提示

### 交易风险
- 本技能提供的信号仅供参考，不构成投资建议
- 加密货币交易存在高风险，可能损失全部本金
- 请根据自身风险承受能力谨慎决策

### 使用限制
- 需要有效的OKX API密钥
- 依赖网络连接和OKX服务可用性
- 历史表现不代表未来收益

## 📞 支持与反馈

### 问题报告
如遇到问题或需要技术支持，请通过以下方式联系：
- GitHub Issues: https://github.com/Lobster-Tempo/trading-strategy-skill/issues
- 邮箱: yu230650@github.com

### 功能建议
欢迎提出功能改进建议或新策略需求。

## 📝 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- RSI和MACD双策略分析
- 智能风险评分系统
- 批量机会扫描功能
- OKX技能市场集成

## 🔒 安全与隐私

### API密钥安全
- 本技能不存储用户API密钥
- 所有API调用通过OKX官方SDK进行
- 建议使用只读权限的API密钥

### 数据隐私
- 不收集用户交易数据
- 所有分析在本地进行
- 不向第三方共享任何信息

## 📄 许可证
MIT License

## ⚠️ 免责声明
本技能提供的交易信号仅供参考，不构成投资建议。加密货币交易存在高风险，请谨慎决策。作者不对任何投资损失负责。

---

**技能ID**: `smart-trading-signals`  
**版本**: 1.0.0  
**最后更新**: 2024-01-15  
**状态**: ✅ 生产就绪  
**开发者**: 菊中菊  
**依赖**: okx-cex-market, okx-cex-trade