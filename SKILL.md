---
name: trading-strategy
description: "AI交易策略分析技能，提供基于技术指标的智能交易信号和风险管理建议。支持RSI、MACD、移动平均线等多种策略，集成OKX市场数据，为加密货币交易提供专业分析。"
---

# 交易策略技能 (Trading Strategy Skill)

专业的AI交易策略分析技能，为加密货币交易提供基于技术指标的智能分析和交易建议。

## 🎯 功能特点

### 核心功能
- **多策略分析**: 支持RSI、MACD、移动平均线等多种技术指标策略
- **实时市场数据**: 集成OKX API获取实时价格和K线数据
- **智能信号生成**: 基于策略逻辑自动生成买卖信号
- **风险管理**: 内置风险评估和仓位管理建议
- **绩效预测**: 基于历史数据的收益和成功率预测

### 高级功能
- **批量分析**: 同时分析多个交易对，找出最佳机会
- **数据质量评估**: 自动评估数据可靠性
- **历史记录**: 保存分析历史，支持回溯和统计
- **可配置策略**: 灵活调整策略参数以适应不同市场

## 📋 使用场景

### 触发条件
当用户询问以下类型问题时触发：
- "分析BTC的RSI指标"
- "ETH现在是否超买？"
- "给我SOL的交易信号"
- "检查BNB的技术分析"
- "批量分析前10大币种"
- "生成交易策略报告"
- "风险评估和仓位建议"

### 不适用场景
- 基本面分析（财务报表、新闻事件等）
- 情绪分析（社交媒体情绪、市场情绪）
- 高频交易策略（毫秒级交易）
- 非法或高风险交易建议

## 🚀 快速开始

### 安装
```bash
# 克隆仓库
git clone https://github.com/your-username/trading-strategy-skill.git

# 安装依赖
cd trading-strategy-skill
npm install

# 配置环境变量（可选）
cp .env.example .env
# 编辑.env文件，添加OKX API密钥
```

### 基本使用
```javascript
const TradingStrategySkill = require('./src/TradingStrategySkill');

// 创建技能实例
const skill = new TradingStrategySkill({
  defaultSymbol: 'BTC/USDT',
  defaultTimeframe: '1h',
  defaultStrategy: 'RSI'
});

// 分析单个交易对
const result = await skill.analyze({
  symbol: 'BTC/USDT',
  timeframe: '4h',
  strategy: 'RSI'
});

console.log(JSON.stringify(result, null, 2));
```

### 命令行使用
```bash
# 分析单个币种
node scripts/analyze.js --symbol BTC/USDT --timeframe 1h --strategy RSI

# 批量分析
node scripts/batch-analyze.js --symbols BTC/USDT,ETH/USDT,SOL/USDT

# 生成报告
node scripts/generate-report.js --symbol BTC/USDT --days 7
```

## 📊 策略配置

### RSI策略配置
```javascript
{
  strategy: 'RSI',
  strategyParams: {
    rsiPeriod: 14,      // RSI计算周期
    overbought: 70,     // 超买阈值
    oversold: 30,       // 超卖阈值
    riskLevel: 'medium' // 风险等级
  }
}
```

### MACD策略配置（即将支持）
```javascript
{
  strategy: 'MACD',
  strategyParams: {
    fastPeriod: 12,     // 快线周期
    slowPeriod: 26,     // 慢线周期
    signalPeriod: 9,    // 信号线周期
    threshold: 0.001    // 信号阈值
  }
}
```

## 🔧 API参考

### 主要方法

#### `analyze(options)`
分析单个交易对

**参数:**
```javascript
{
  symbol: 'BTC/USDT',           // 交易对
  timeframe: '1h',              // 时间周期
  strategy: 'RSI',              // 策略名称
  dataLimit: 100,               // 数据条数
  includeMarketData: true,      // 包含市场数据
  includeRiskAssessment: true,  // 包含风险评估
  includeRecommendations: true, // 包含交易建议
  strategyParams: {}            // 策略参数
}
```

**返回:**
```javascript
{
  symbol: 'BTC/USDT',
  timeframe: '1h',
  strategy: 'RSI',
  signal: {
    type: 'BUY',                // BUY/SELL/HOLD
    strength: 0.75,             // 信号强度 0-1
    trend: 'BULLISH',           // 趋势方向
    crossover: 'OVERSOLD_CROSS' // 交叉类型
  },
  confidence: 0.82,             // 分析置信度
  riskAssessment: { ... },      // 风险评估
  recommendations: { ... },     // 交易建议
  performancePrediction: { ... }, // 绩效预测
  summary: { ... }              // 报告摘要
}
```

#### `analyzeBatch(symbols, options)`
批量分析多个交易对

**参数:**
- `symbols`: 交易对数组，如 `['BTC/USDT', 'ETH/USDT', 'SOL/USDT']`
- `options`: 同`analyze`方法的选项

**返回:** 批量分析报告

#### `getAnalysisHistory(filters)`
获取分析历史

**参数:**
```javascript
{
  symbol: 'BTC/USDT',   // 过滤币种
  strategy: 'RSI',      // 过滤策略
  signal: 'BUY',        // 过滤信号
  startDate: '2024-01-01', // 开始日期
  endDate: '2024-01-31',   // 结束日期
  limit: 50             // 限制条数
}
```

#### `getPerformanceStats()`
获取性能统计

#### `reset()`
重置技能状态

#### `updateConfig(newConfig)`
更新配置

### 事件系统
```javascript
// 监听分析完成事件
skill.on('analysisComplete', (result) => {
  console.log('分析完成:', result.symbol, result.signal.type);
});

// 监听错误事件
skill.on('error', (error) => {
  console.error('分析错误:', error.message);
});
```

## 📈 输出示例

### 完整分析报告
```json
{
  "symbol": "BTC/USDT",
  "timeframe": "4h",
  "strategy": "RSI",
  "timestamp": "2024-01-15T10:30:00Z",
  "currentPrice": 42500.50,
  "signal": {
    "type": "BUY",
    "strength": 0.82,
    "trend": "BULLISH",
    "crossover": "OVERSOLD_CROSS",
    "rsiValue": 28.5
  },
  "confidence": 0.85,
  "marketCondition": {
    "isOverbought": false,
    "isOversold": true,
    "zone": "OVERSOLD",
    "volatility": 8.2,
    "momentum": 2.5
  },
  "riskAssessment": {
    "level": "MEDIUM",
    "score": 0.45,
    "factors": [
      "市场波动性: 8.2%",
      "信号强度: 82%",
      "分析置信度: 85%",
      "RSI区域: OVERSOLD"
    ],
    "mitigationStrategies": [
      "使用中等仓位（10-20%资金）",
      "设置合理止损（4-6%）",
      "关注关键支撑阻力位"
    ]
  },
  "recommendations": {
    "action": "BUY",
    "confidence": 0.85,
    "entry": {
      "price": 42500.50,
      "type": "MARKET",
      "rationale": "当前市场价格"
    },
    "positionSize": {
      "size": "MEDIUM",
      "percentage": 0.15,
      "description": "MEDIUM仓位 (建议15.0%资金)"
    },
    "stopLoss": {
      "level": "5%",
      "percentage": 5,
      "rationale": "建议设置在当前价格below 5%的位置"
    },
    "takeProfit": {
      "level": "10%",
      "percentage": 10,
      "riskRewardRatio": 2,
      "rationale": "建议设置在当前价格above 10%的位置 (风险回报比: 2:1)"
    },
    "steps": [
      "1. 在42500.50附近买入",
      "2. 设置止损位: 价格下跌5%",
      "3. 设置止盈位: 价格上涨10%",
      "4. 使用15.0%的资金",
      "5. 按照监控建议定期检查"
    ]
  },
  "performancePrediction": {
    "expectedReturn": 0.08,
    "successProbability": 0.72,
    "riskAdjustedReturn": 0.0576,
    "timeframe": "1-4周",
    "rationale": "基于历史回测和当前市场状况的预测"
  },
  "summary": {
    "symbol": "BTC/USDT",
    "action": "BUY",
    "confidence": "85.0%",
    "riskLevel": "MEDIUM",
    "expectedReturn": "8.0%",
    "keyRecommendation": "强烈建议买入，设置合理止损",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 批量分析报告
```json
{
  "timestamp": "2024-01-15T10:35:00Z",
  "totalSymbols": 5,
  "successfulAnalyses": 5,
  "failedAnalyses": 0,
  "summary": {
    "buySignals": 2,
    "sellSignals": 1,
    "holdSignals": 2,
    "averageConfidence": 0.76,
    "topOpportunities": [
      {
        "symbol": "BTC/USDT",
        "action": "BUY",
        "confidence": 0.85,
        "signalStrength": 0.82,
        "score": 0.697
      },
      {
        "symbol": "ETH/USDT",
        "action": "SELL",
        "confidence": 0.78,
        "signalStrength": 0.75,
        "score": 0.585
      }
    ]
  }
}
```

## 🔒 风险管理

### 内置风险控制
1. **仓位管理**: 根据风险等级自动计算建议仓位
2. **止损建议**: 基于波动率和信号强度计算止损位
3. **风险等级**: 高/中/低三级风险评估
4. **数据质量检查**: 自动评估数据可靠性

### 使用建议
1. **模拟测试**: 在实际交易前进行充分的模拟测试
2. **风险分散**: 不要将所有资金投入单一策略或币种
3. **持续监控**: 定期检查策略绩效和市场变化
4. **资金管理**: 严格遵守仓位管理建议

### 免责声明
- 本技能提供的分析仅供参考，不构成投资建议
- 加密货币交易具有高风险，可能损失全部投资
- 用户应自行承担交易决策的责任
- 建议在实际交易前咨询专业财务顾问

## 🛠️ 开发指南

### 项目结构
```
trading-strategy-skill/
├── src/
│   ├── TradingStrategySkill.js     # 技能主类
│   ├── strategies/                 # 策略实现
│   │   ├── RSIStrategy.js         # RSI策略
│   │   ├── MACDStrategy.js        # MACD策略（即将支持）
│   │   └── BaseStrategy.js        # 策略基类
│   ├── data/                      # 数据模块
│   │   ├── MarketDataFetcher.js   # 市场数据获取
│   │   └── DataCache.js           # 数据缓存
│   ├── risk/                      # 风险管理
│   │   ├── RiskAssessor.js        # 风险评估
│   │   └── PositionManager.js     # 仓位管理
│   └── utils/                     # 工具函数
│       ├── indicators.js          # 技术指标计算
│       └── formatters.js          # 数据格式化
├── scripts/                       # 脚本文件
│   ├── analyze.js                 # 分析脚本
│   ├── batch-analyze.js           # 批量分析脚本
│   └── backtest.js                # 回测脚本
├── config/                        # 配置文件
│   ├── default.json               # 默认配置
│   └── strategies.json            # 策略配置
├── test/                          # 测试文件
│   ├── unit/                      # 单元测试
│   └── integration/               # 集成测试
├── docs/                          # 文档
├── package.json                   # 项目配置
├── SKILL.md                       # 技能定义（本文件）
└── README.md                      # 项目说明
```

### 添加新策略
1. 在`src/strategies/`目录创建新策略类
2. 继承`BaseStrategy`基类（如需要）
3. 实现`analyze`方法和必要的辅助方法
4. 在`TradingStrategySkill.js`中注册新策略
5. 添加相应的测试用例

### 扩展数据源
1. 创建新的数据获取器类
2. 实现`getCandles`、`getCurrentPrice`等方法
3. 在配置中指定使用哪个数据源
4. 添加数据源特定的错误处理

## 📝 测试

### 运行测试
```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行性能测试
npm run test:performance
```

### 测试覆盖率
```bash
# 生成测试覆盖率报告
npm run test:coverage
```

## 🔄 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 支持RSI策略分析
- 集成OKX市场数据
- 完整的风险管理和交易建议
- 批量分析功能

### 计划功能
- [ ] MACD策略支持
- [ ] 移动平均线策略
- [ ] 布林带策略
- [ ] 多策略组合分析
- [ ] 回测框架
- [ ] 实时信号推送
- [ ] 更多交易所支持

## 🤝 贡献指南

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 开发规范
- 遵循JavaScript Standard Style
- 编写完整的单元测试
- 更新相关文档
- 添加有意义的提交信息

## 📄 许可证

本项目采用MIT许可证 - 查看[LICENSE](LICENSE)文件了解详情

## 🙏 致谢

- OKX提供的市场数据API
- 所有贡献者和用户
- 开源社区的支持

## 📞 支持

如有问题或建议，请：
1. 查看[常见问题解答](docs/FAQ.md)
2. 提交[Issue](https://github.com/your-username/trading-strategy-skill/issues)
3. 加入[Discord社区](https://discord.gg/your-community)

---

**免责声明**: 交易有风险，投资需谨慎。本技能提供的分析仅供参考，不构成任何投资建议。用户应自行承担交易决策的风险和责任。