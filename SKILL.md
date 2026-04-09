---
name: trading-strategy
title: 智能交易信号
description: "基于OKX CLI的多策略交易信号分析技能，集成RSI和MACD技术指标，提供智能买卖信号和风险管理建议。"
---

# 智能交易信号

基于OKX CLI的多策略交易信号分析技能，集成RSI和MACD技术指标，提供智能买卖信号和风险管理建议。

## 🎯 核心优势

### 差异化功能（区别于 okx-cex-market）
- **多策略组合分析**：RSI + MACD双指标验证，提高信号准确性
- **智能风险评分**：基于波动率和市场状况的动态风险评估
- **批量机会扫描**：同时分析多个币种，自动筛选最佳交易机会
- **个性化参数配置**：支持用户自定义策略参数和风险偏好
- **交易信号历史**：记录和分析历史信号表现，持续优化策略

### 技术特点
- **完全集成OKX CLI**：使用官方`okx market`命令获取实时数据
- **轻量级设计**：无需外部API密钥，直接使用平台环境
- **实时计算**：基于最新市场数据的即时信号生成
- **可扩展架构**：易于添加新策略和技术指标

## 📋 使用场景

### 触发条件
当用户需要技术分析信号时触发：
- "分析BTC的技术指标"
- "ETH的买卖信号是什么？"
- "扫描当前最佳交易机会"
- "检查SOL的风险等级"
- "批量分析前10大币种"
- "生成交易策略报告"

### 输出格式
```json
{
  "symbol": "BTC/USDT",
  "timeframe": "1h",
  "strategies": {
    "RSI": {
      "value": 65.2,
      "signal": "NEUTRAL",
      "strength": 0.45
    },
    "MACD": {
      "histogram": 12.5,
      "signal": "BULLISH",
      "crossover": "POSITIVE"
    }
  },
  "composite_signal": "BUY",
  "confidence": 0.72,
  "risk_score": 35,
  "recommendation": "中等仓位买入，设置4%止损",
  "opportunity_rank": 8.5
}
```

## 🚀 快速开始

### 安装（OKX CLI集成）
```bash
# 技能已集成到OKX CLI环境
# 无需额外安装，直接使用以下命令：

# 分析单个币种
okx skill trading-strategy analyze --symbol BTC/USDT --timeframe 1h

# 批量分析
okx skill trading-strategy batch --symbols BTC/USDT,ETH/USDT,SOL/USDT

# 自定义策略参数
okx skill trading-strategy analyze --symbol BTC/USDT --strategy RSI --params "period=14,overbought=70,oversold=30"
```

### 数据获取（使用OKX CLI命令）
```bash
# 获取实时价格数据
okx market ticker --symbol BTC/USDT

# 获取K线数据
okx market candles --symbol BTC/USDT --timeframe 1h --limit 100

# 获取技术指标
okx market indicator --symbol BTC/USDT --indicator RSI --period 14
```

## 📊 支持的策略

### RSI策略（相对强弱指数）
- **原理**：通过比较近期涨幅和跌幅判断超买超卖
- **OKX CLI集成**：使用`okx market indicator`获取RSI数据
- **信号逻辑**：
  - RSI < 30：超卖区域，买入信号
  - RSI > 70：超买区域，卖出信号
  - 30 ≤ RSI ≤ 70：中性区域，观望
- **可配置参数**：
  - `period`：计算周期（默认14）
  - `overbought`：超买阈值（默认70）
  - `oversold`：超卖阈值（默认30）

### MACD策略（移动平均收敛发散）
- **原理**：通过快慢移动平均线的交叉判断趋势
- **OKX CLI集成**：使用`okx market indicator`获取MACD数据
- **信号逻辑**：
  - MACD线 > 信号线：金叉，买入信号
  - MACD线 < 信号线：死叉，卖出信号
  - 柱状图转正：动能增强
  - 柱状图转负：动能减弱
- **可配置参数**：
  - `fast_period`：快线周期（默认12）
  - `slow_period`：慢线周期（默认26）
  - `signal_period`：信号线周期（默认9）

### 多策略组合分析
- **加权评分系统**：RSI和MACD信号加权计算综合评分
- **冲突解决**：当策略信号冲突时，基于置信度选择主导信号
- **风险调整**：根据市场波动性调整信号强度

## 🔧 命令参考

### 主要命令

#### `analyze` - 分析单个交易对
```bash
okx skill trading-strategy analyze [选项]

选项：
  --symbol <pair>       交易对（如 BTC/USDT）
  --timeframe <tf>      时间周期（1m,5m,15m,30m,1h,4h,1d,1w）
  --strategy <name>     策略名称（RSI, MACD, ALL）
  --params <string>     策略参数（JSON格式或键值对）
  --output <format>     输出格式（json, text, table）
```

**示例：**
```bash
# 分析BTC/USDT的RSI指标
okx skill trading-strategy analyze --symbol BTC/USDT --strategy RSI

# 使用自定义参数
okx skill trading-strategy analyze --symbol ETH/USDT --strategy MACD --params "fast_period=12,slow_period=26,signal_period=9"

# 获取JSON格式输出
okx skill trading-strategy analyze --symbol SOL/USDT --output json
```

#### `batch` - 批量分析多个交易对
```bash
okx skill trading-strategy batch [选项]

选项：
  --symbols <list>      交易对列表（逗号分隔）
  --timeframe <tf>      时间周期
  --strategy <name>     策略名称
  --top <number>        显示前N个最佳机会
  --min-confidence <n>  最小置信度阈值（0-1）
```

**示例：**
```bash
# 批量分析前5大币种
okx skill trading-strategy batch --symbols BTC/USDT,ETH/USDT,BNB/USDT,SOL/USDT,XRP/USDT

# 筛选高置信度机会
okx skill trading-strategy batch --symbols "BTC/USDT,ETH/USDT" --min-confidence 0.7

# 显示前3个最佳机会
okx skill trading-strategy batch --symbols "top10" --top 3
```

#### `history` - 查看信号历史
```bash
okx skill trading-strategy history [选项]

选项：
  --symbol <pair>       交易对
  --strategy <name>     策略名称
  --days <number>       历史天数
  --signal <type>       信号类型（BUY, SELL, HOLD）
```

#### `backtest` - 策略回测
```bash
okx skill trading-strategy backtest [选项]

选项：
  --symbol <pair>       交易对
  --strategy <name>     策略名称
  --start <date>        开始日期（YYYY-MM-DD）
  --end <date>          结束日期
  --initial <amount>    初始资金
```

## 📈 输出示例

### 文本格式输出
```
📊 智能交易信号分析报告
========================================

🔍 基本信息
   交易对: BTC/USDT
   时间周期: 1h
   分析时间: 2024-01-15 10:30:00
   当前价格: $42,500.50

📈 策略分析
   RSI指标: 65.2 (NEUTRAL) - 强度: 45%
   MACD指标: 柱状图 +12.5 (BULLISH) - 金叉确认
   综合信号: 🟢 BUY
   置信度: 72%

⚠️ 风险评估
   风险分数: 35/100 (LOW)
   波动率: 8.2%
   市场情绪: BULLISH
   建议仓位: 中等仓位（15-20%）

💡 交易建议
   操作: 在$42,500附近买入
   止损: $40,375 (下跌5%)
   止盈: $46,750 (上涨10%)
   风险回报比: 2:1

🎯 机会评分: 8.5/10
========================================
```

### JSON格式输出
```json
{
  "analysis": {
    "symbol": "BTC/USDT",
    "timeframe": "1h",
    "timestamp": "2024-01-15T10:30:00Z",
    "current_price": 42500.50,
    "strategies": {
      "RSI": {
        "value": 65.2,
        "signal": "NEUTRAL",
        "strength": 0.45,
        "parameters": {
          "period": 14,
          "overbought": 70,
          "oversold": 30
        }
      },
      "MACD": {
        "macd_line": 125.8,
        "signal_line": 113.3,
        "histogram": 12.5,
        "signal": "BULLISH",
        "crossover": "POSITIVE",
        "parameters": {
          "fast_period": 12,
          "slow_period": 26,
          "signal_period": 9
        }
      }
    },
    "composite_analysis": {
      "signal": "BUY",
      "confidence": 0.72,
      "weighted_score": 8.5,
      "primary_strategy": "MACD",
      "confirmation": "RSI_NEUTRAL_MACD_BULLISH"
    },
    "risk_assessment": {
      "score": 35,
      "level": "LOW",
      "factors": {
        "volatility": 8.2,
        "liquidity": "HIGH",
        "trend_strength": 7.8,
        "market_sentiment": "BULLISH"
      },
      "mitigation": [
        "使用中等仓位（15-20%资金）",
        "设置5%止损位",
        "分批建仓降低风险"
      ]
    },
    "recommendations": {
      "action": "BUY",
      "entry_range": [42400, 42600],
      "stop_loss": 40375,
      "take_profit": 46750,
      "position_size": "MEDIUM",
      "risk_reward_ratio": 2.0,
      "time_horizon": "1-4周"
    },
    "metadata": {
      "opportunity_rank": 8.5,
      "data_source": "OKX CLI market commands",
      "calculation_time_ms": 245,
      "cache_status": "HIT"
    }
  }
}
```

## 🔒 风险管理

### 风险评分系统
1. **波动率风险**：基于价格波动性计算（0-40分）
2. **流动性风险**：基于交易量评估（0-30分）
3. **趋势风险**：基于趋势强度判断（0-20分）
4. **市场风险**：基于整体市场状况（0-10分）

### 风险等级
- **LOW (0-40)**：低风险，适合较大仓位
- **MEDIUM (41-70)**：中等风险，建议中等仓位
- **HIGH (71-100)**：高风险，建议小仓位或观望

### 仓位管理建议
- **低风险**：20-30%仓位
- **中等风险**：10-20%仓位
- **高风险**：5-10%仓位或观望

## 🛠️ 技术实现

### 数据流架构
```
用户请求 → OKX CLI命令 → 市场数据 → 策略计算 → 信号生成 → 结果返回
```

### OKX CLI集成点
1. **价格数据**：`okx market ticker`
2. **K线数据**：`okx market candles`
3. **技术指标**：`okx market indicator`
4. **市场状态**：`okx market status`

### 计算流程
```python
# 伪代码示例
def analyze_symbol(symbol, timeframe, strategy):
    # 1. 通过OKX CLI获取数据
    price_data = execute_okx_command(f"market ticker --symbol {symbol}")
    candle_data = execute_okx_command(f"market candles --symbol {symbol} --timeframe {timeframe}")
    
    # 2. 计算技术指标
    if strategy == "RSI":
        rsi_value = calculate_rsi(candle_data)
        signal = generate_rsi_signal(rsi_value)
    elif strategy == "MACD":
        macd_data = calculate_macd(candle_data)
        signal = generate_macd_signal(macd_data)
    
    # 3. 风险评估
    risk_score = assess_risk(price_data, candle_data)
    
    # 4. 生成建议
    recommendation = generate_recommendation(signal, risk_score)
    
    return {
        "signal": signal,
        "risk_score": risk_score,
        "recommendation": recommendation
    }
```

## 📝 测试验证

### 单元测试
```bash
# 测试RSI策略
okx skill trading-strategy test --strategy RSI

# 测试MACD策略
okx skill trading-strategy test --strategy MACD

# 测试批量分析
okx skill trading-strategy test --type batch
```

### 回测验证
```bash
# 回测过去30天表现
okx skill trading-strategy backtest --symbol BTC/USDT --days 30 --strategy RSI

# 多策略回测比较
okx skill trading-strategy backtest --symbol ETH/USDT --strategy ALL --start 2024-01-01 --end 2024-01-31
```

## 🔄 更新计划

### v1.1.0（计划中）
- [ ] 添加布林带策略
- [ ] 支持移动平均线交叉策略
- [ ] 添加自定义指标组合功能
- [ ] 优化批量分析性能

### v1.2.0（规划中）
- [ ] 添加机器学习信号预测
- [ ] 支持多时间框架分析
- [ ] 添加社交情绪分析集成
- [ ] 优化风险模型

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个技能：

1. **报告问题**：在GitHub Issues中描述遇到的问题
2. **建议功能**：提出新的策略或改进建议
3. **提交代码**：遵循现有的代码风格和测试规范
4. **更新文档**：确保文档与代码变更同步

## 📄 许可证

本项目采用MIT许可证 - 查看[LICENSE](LICENSE)文件了解详情

## 🙏 致谢

- OKX提供的CLI工具和市场数据
- 所有贡献者和用户
- 开源社区的技术支持

## 📞 支持

如有问题或建议，请：
1. 查看技能文档和使用指南
2. 提交GitHub Issue
3. 联系技能开发者

---

**免责声明**: 交易有风险，投资需谨慎。本技能提供的分析仅供参考，不构成任何投资建议。用户应自行承担交易决策的风险和责任。过去表现不代表未来结果，请在真实交易前进行充分的测试和验证。