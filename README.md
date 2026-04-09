# 🎯 交易策略技能 (Trading Strategy Skill)

一个专业的AI交易策略分析技能，为加密货币交易提供基于技术指标的智能分析和交易建议。支持RSI、MACD、移动平均线等多种策略，集成OKX市场数据。

## ✨ 功能特点

### 🚀 核心功能
- **多策略分析**: 支持RSI、MACD、移动平均线等多种技术指标策略
- **实时市场数据**: 集成OKX API获取实时价格和K线数据
- **智能信号生成**: 基于策略逻辑自动生成买卖信号
- **风险管理**: 内置风险评估和仓位管理建议
- **绩效预测**: 基于历史数据的收益和成功率预测

### 🔥 高级功能
- **批量分析**: 同时分析多个交易对，找出最佳机会
- **数据质量评估**: 自动评估数据可靠性
- **历史记录**: 保存分析历史，支持回溯和统计
- **可配置策略**: 灵活调整策略参数以适应不同市场

## 📦 快速开始

### 安装
```bash
# 克隆仓库
git clone https://github.com/your-username/trading-strategy-skill.git
cd trading-strategy-skill

# 安装依赖
npm install

# 配置环境变量
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

## 📊 支持的策略

### RSI策略 (相对强弱指数)
- **原理**: 通过比较近期涨幅和跌幅来判断超买超卖
- **参数**: 
  - `rsiPeriod`: RSI计算周期 (默认: 14)
  - `overbought`: 超买阈值 (默认: 70)
  - `oversold`: 超卖阈值 (默认: 30)

### MACD策略 (即将支持)
- **原理**: 通过快慢移动平均线的交叉判断趋势
- **参数**: 
  - `fastPeriod`: 快线周期 (默认: 12)
  - `slowPeriod`: 慢线周期 (默认: 26)
  - `signalPeriod`: 信号线周期 (默认: 9)

### 移动平均线策略 (即将支持)
- **原理**: 通过不同周期移动平均线的交叉判断买卖点
- **参数**: 
  - `shortPeriod`: 短期均线周期 (默认: 10)
  - `longPeriod`: 长期均线周期 (默认: 30)

## 🎯 使用示例

### 示例1: 分析BTC/USDT
```bash
node scripts/analyze.js --symbol BTC/USDT --timeframe 4h --strategy RSI --output text
```

**输出示例:**
```
📊 交易策略分析报告
============================================================

📊 基本信息
  交易对: BTC/USDT
  时间周期: 4h
  策略: RSI
  当前价格: $42,500.50
  分析时间: 2024-01-15 10:30:00

📈 交易信号
  信号类型: 🟢 BUY
  信号强度: 82.0%
  趋势方向: BULLISH
  交叉类型: OVERSOLD_CROSS
  RSI值: 28.5
  分析置信度: 85.0%

⚠️ 风险评估
  风险等级: MEDIUM
  风险分数: 45.0%
  风险因素:
    • 市场波动性: 8.2%
    • 信号强度: 82%
    • 分析置信度: 85%
    • RSI区域: OVERSOLD

💡 交易建议
  操作: BUY
  建议仓位: MEDIUM仓位 (建议15.0%资金)
  入场价格: $42,500.50
  止损位: 5% (建议设置在当前价格below 5%的位置)
  止盈位: 10% (建议设置在当前价格above 10%的位置)

📋 操作步骤:
  1. 在42500.50附近买入
  2. 设置止损位: 价格下跌5%
  3. 设置止盈位: 价格上涨10%
  4. 使用15.0%的资金
  5. 按照监控建议定期检查

🎯 绩效预测
  预期收益: 8.0%
  成功概率: 72.0%
  风险调整后收益: 5.8%
  时间框架: 1-4周

📝 关键建议
  强烈建议买入，设置合理止损

============================================================
分析完成 - 2024-01-15 10:30:00
============================================================
```

### 示例2: 批量分析前10大币种
```bash
node scripts/batch-analyze.js --symbols top10 --timeframe 1d --output table
```

**输出示例:**
```
============================================================
批量交易策略分析结果
============================================================

统计: 成功10/10 | 买入:3 卖出:2 观望:5 | 平均置信度:76.5%

排名 | 交易对       | 信号    | 价格(USD)   | 强度%   | 置信度% | 风险等级 | 预期收益% | 建议
------------------------------------------------------------------------------------------------------------------------
1    | BTC/USDT    | 🟢 BUY  | $42,500.50 | 82.0%   | 85.0%   | MEDIUM   | 8.0%      | 强烈建议买入，设置合理止损
2    | ETH/USDT    | 🔴 SELL | $2,850.25  | 75.0%   | 78.0%   | HIGH     | 6.5%      | 建议卖出部分仓位，严格止损
3    | SOL/USDT    | 🟢 BUY  | $152.80    | 68.0%   | 72.0%   | MEDIUM   | 7.2%      | 建议买入，关注关键阻力位
4    | BNB/USDT    | 🟡 HOLD | $315.40    | 45.0%   | 65.0%   | LOW      | 0.0%      | 建议观望，市场方向不明确
5    | XRP/USDT    | 🟡 HOLD | $0.62      | 30.0%   | 60.0%   | LOW      | 0.0%      | 建议观望，等待更好机会

============================================================
生成时间: 2024-01-15 10:35:00
============================================================
```

## 🔧 配置说明

### 环境变量配置 (.env)
```bash
# OKX API 配置
OKX_API_KEY=your_api_key_here
OKX_SECRET_KEY=your_secret_key_here
OKX_PASSPHRASE=your_passphrase_here

# 技能配置
DEFAULT_SYMBOL=BTC/USDT
DEFAULT_TIMEFRAME=1h
DEFAULT_STRATEGY=RSI

# RSI策略参数
RSI_PERIOD=14
RSI_OVERBOUGHT=70
RSI_OVERSOLD=30

# 风险管理
MAX_POSITION_SIZE=0.3
STOP_LOSS_DEFAULT=0.05
TAKE_PROFIT_DEFAULT=0.1
RISK_REWARD_RATIO=2
```

### 技能配置
```javascript
const skill = new TradingStrategySkill({
  // 基础配置
  defaultSymbol: 'BTC/USDT',
  defaultTimeframe: '1h',
  defaultStrategy: 'RSI',
  cacheEnabled: true,
  logLevel: 'info',
  
  // API配置
  apiConfig: {
    apiKey: process.env.OKX_API_KEY,
    secretKey: process.env.OKX_SECRET_KEY,
    passphrase: process.env.OKX_PASSPHRASE
  },
  
  // 策略配置
  strategies: {
    RSI: {
      rsiPeriod: 14,
      overbought: 70,
      oversold: 30
    }
  },
  
  // 风险管理配置
  riskManagement: {
    maxPositionSize: 0.3,
    stopLossDefault: 0.05,
    takeProfitDefault: 0.1,
    riskRewardRatio: 2
  }
});
```

## 📁 项目结构

```
trading-strategy-skill/
├── src/
│   ├── TradingStrategySkill.js     # 技能主类
│   ├── strategies/
│   │   ├── RSIStrategy.js         # RSI策略实现
│   │   ├── MACDStrategy.js        # MACD策略（即将支持）
│   │   └── BaseStrategy.js        # 策略基类
│   ├── data/
│   │   ├── MarketDataFetcher.js   # 市场数据获取
│   │   └── DataCache.js           # 数据缓存
│   ├── risk/
│   │   ├── RiskAssessor.js        # 风险评估
│   │   └── PositionManager.js     # 仓位管理
│   └── utils/
│       ├── indicators.js          # 技术指标计算
│       └── formatters.js          # 数据格式化
├── scripts/
│   ├── analyze.js                 # 分析脚本
│   ├── batch-analyze.js           # 批量分析脚本
│   └── backtest.js                # 回测脚本
├── config/
│   ├── default.json               # 默认配置
│   └── strategies.json            # 策略配置
├── test/
├── docs/
├── package.json
├── SKILL.md                       # 技能定义文件
├── README.md                      # 项目说明
└── .env.example                   # 环境变量示例
```

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 生成测试覆盖率报告
npm run test:coverage
```

## 🔄 开发指南

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

## 📈 性能优化

### 缓存策略
- 价格数据缓存: 30秒
- K线数据缓存: 1分钟
- 分析结果缓存: 5分钟（可配置）

### 请求优化
- 批量请求合并
- 请求失败重试机制
- 请求频率限制
- 连接池管理

### 内存管理
- 历史记录自动清理
- 缓存大小限制
- 内存泄漏检测

## 🔒 安全考虑

### API密钥安全
- 环境变量存储
- 不记录到日志
- 不提交到版本控制
- 定期轮换密钥

### 数据安全
- HTTPS加密传输
- 数据完整性验证
- 防篡改机制
- 访问控制

### 风险控制
- 最大仓位限制
- 止损建议
- 风险评估
- 免责声明

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

## ⚠️ 免责声明

**重要提示**: 交易有风险，投资需谨慎。本技能提供的分析仅供参考，不构成任何投资建议。用户应自行承担交易决策的风险和责任。

### 风险提示
1. **市场风险**: 加密货币市场波动性极高，价格可能在短时间内大幅波动
2. **策略风险**: 任何交易策略都有失败的可能，历史表现不代表未来结果
3. **技术风险**: 系统故障、网络延迟等技术问题可能导致损失
4. **操作风险**: 人为操作错误可能导致意外损失

### 使用建议
1. **模拟测试**: 在实际交易前进行充分的模拟测试
2. **风险分散**: 不要将所有资金投入单一策略或币种
3. **资金管理**: 严格遵守仓位管理建议，设置止损
4. **持续学习**: 不断学习和改进交易策略
5. **专业咨询**: 建议在实际交易前咨询专业财务顾问

---

**最后更新**: 2024年1月15日  
**版本**: v1.0.0  
**作者**: Your Name  
**联系方式**: your.email@example.com