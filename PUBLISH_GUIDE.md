# 🚀 交易策略技能发布指南

本指南将帮助你将交易策略技能发布到OKX技能市场和其他平台。

## 📋 发布前准备

### 1. 代码质量检查
```bash
# 运行代码检查
npm run lint

# 运行所有测试
npm test

# 检查测试覆盖率
npm run test:coverage

# 确保覆盖率 > 80%
```

### 2. 文档更新
- [ ] 更新 `README.md` 中的版本号
- [ ] 更新 `SKILL.md` 中的功能描述
- [ ] 更新 `CHANGELOG.md`（如有）
- [ ] 检查所有示例代码是否有效

### 3. 环境配置
```bash
# 创建生产环境配置
cp .env.example .env.production

# 更新生产环境配置
# - 使用生产环境API密钥
# - 调整缓存策略
# - 设置合适的日志级别
```

## 🎯 发布到OKX技能市场

### 1. 准备发布包
```bash
# 清理项目
npm run clean

# 构建发布包
npm run build

# 创建压缩包
tar -czf smart-trading-signals-skill-v1.0.0.tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.env \
  --exclude=*.log \
  .
```

### 2. 创建技能清单文件
创建 `skill-manifest.json`:
```json
{
  "name": "smart-trading-signals",
  "version": "1.0.0",
  "description": "AI交易策略分析技能，提供基于技术指标的智能交易信号和风险管理建议",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": "https://github.com/your-username/smart-trading-signals-skill",
  "keywords": ["trading", "strategy", "crypto", "analysis", "ai", "okx"],
  "main": "src/TradingStrategySkill.js",
  "dependencies": {
    "axios": "^1.6.0",
    "technicalindicators": "^3.1.0"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "skillConfig": {
    "requiresApiKey": true,
    "supportedStrategies": ["RSI"],
    "supportedTimeframes": ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"],
    "minDataPoints": 20,
    "cacheEnabled": true
  }
}
```

### 3. 准备演示材料
- **演示视频**: 展示技能的基本功能
- **截图**: 展示分析结果和界面
- **使用示例**: 提供完整的代码示例
- **测试报告**: 提供性能测试结果

### 4. 提交到OKX技能市场
1. 访问 [OKX开发者门户](https://web3.okx.com/onchain-os/dev-portal)
2. 导航到技能市场部分
3. 点击"发布新技能"
4. 填写技能信息:
   - 技能名称: `smart-trading-signals`
   - 显示名称: `交易策略分析`
   - 描述: 提供完整的描述
   - 版本: `1.0.0`
   - 分类: `交易分析` / `AI工具`
   - 标签: `trading`, `strategy`, `analysis`, `crypto`
5. 上传技能包和演示材料
6. 设置价格（免费/付费）
7. 提交审核

### 5. 审核注意事项
- **代码安全**: 确保没有安全漏洞
- **API使用**: 合理使用OKX API，遵守速率限制
- **错误处理**: 完善的错误处理和用户提示
- **性能**: 响应时间应在合理范围内
- **文档**: 完整的使用文档和API参考

## 📦 发布到其他平台

### 1. GitHub发布
```bash
# 创建GitHub Release
git tag v1.0.0
git push origin v1.0.0

# 在GitHub创建Release
# - 上传压缩包
# - 添加发布说明
# - 添加更新日志
```

### 2. npm发布
```json
// 更新package.json
{
  "name": "@your-username/smart-trading-signals-skill",
  "version": "1.0.0",
  "publishConfig": {
    "access": "public"
  }
}
```

```bash
# 发布到npm
npm login
npm publish
```

### 3. OpenClaw技能目录
```bash
# 创建OpenClaw技能配置
mkdir -p .openclaw
cat > .openclaw/skill.json << EOF
{
  "name": "smart-trading-signals",
  "version": "1.0.0",
  "description": "交易策略分析技能",
  "install": "npm install @your-username/smart-trading-signals-skill",
  "entry": "src/TradingStrategySkill.js",
  "config": {
    "requiresApiKey": true,
    "defaultSymbol": "BTC/USDT",
    "defaultTimeframe": "1h"
  }
}
EOF
```

## 🔧 安装脚本

### 一键安装脚本
创建 `install.sh`:
```bash
#!/bin/bash

# 交易策略技能安装脚本

set -e

echo "🚀 开始安装交易策略技能..."

# 检查Node.js版本
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装Node.js (>=16.0.0)"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
if [[ $(echo "$NODE_VERSION < 16.0.0" | bc) -eq 1 ]]; then
    echo "❌ Node.js版本过低，请升级到16.0.0或更高版本"
    exit 1
fi

# 创建安装目录
INSTALL_DIR="$HOME/.smart-trading-signals-skill"
mkdir -p "$INSTALL_DIR"

# 下载技能包
echo "📦 下载技能包..."
curl -L "https://github.com/your-username/smart-trading-signals-skill/releases/download/v1.0.0/smart-trading-signals-skill-v1.0.0.tar.gz" \
  -o "$INSTALL_DIR/skill.tar.gz"

# 解压
echo "📂 解压文件..."
tar -xzf "$INSTALL_DIR/skill.tar.gz" -C "$INSTALL_DIR"
rm "$INSTALL_DIR/skill.tar.gz"

# 安装依赖
echo "🔧 安装依赖..."
cd "$INSTALL_DIR"
npm install --production

# 创建环境配置
if [ ! -f "$INSTALL_DIR/.env" ]; then
    echo "⚙️ 创建环境配置..."
    cp .env.example .env
    echo "请编辑 $INSTALL_DIR/.env 文件配置OKX API密钥"
fi

# 创建启动脚本
cat > "$INSTALL_DIR/start.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
node scripts/analyze.js "$@"
EOF

chmod +x "$INSTALL_DIR/start.sh"

# 创建符号链接
if [ -d "$HOME/.local/bin" ]; then
    ln -sf "$INSTALL_DIR/start.sh" "$HOME/.local/bin/smart-trading-signals"
    echo "✅ 已创建命令别名: smart-trading-signals"
fi

echo "🎉 安装完成！"
echo ""
echo "使用方法:"
echo "  cd $INSTALL_DIR"
echo "  node scripts/analyze.js --symbol BTC/USDT"
echo ""
echo "或使用命令别名:"
echo "  smart-trading-signals --symbol BTC/USDT"
echo ""
echo "请先配置OKX API密钥:"
echo "  nano $INSTALL_DIR/.env"
```

### Windows安装脚本
创建 `install.ps1`:
```powershell
# 交易策略技能安装脚本 (Windows)

Write-Host "🚀 开始安装交易策略技能..." -ForegroundColor Green

# 检查Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 请先安装Node.js (>=16.0.0)" -ForegroundColor Red
    exit 1
}

$nodeVersion = (node -v).Substring(1)
if ([version]$nodeVersion -lt [version]"16.0.0") {
    Write-Host "❌ Node.js版本过低，请升级到16.0.0或更高版本" -ForegroundColor Red
    exit 1
}

# 创建安装目录
$installDir = "$env:USERPROFILE\.smart-trading-signals-skill"
New-Item -ItemType Directory -Force -Path $installDir | Out-Null

# 下载技能包
Write-Host "📦 下载技能包..." -ForegroundColor Yellow
$url = "https://github.com/your-username/smart-trading-signals-skill/releases/download/v1.0.0/smart-trading-signals-skill-v1.0.0.zip"
$output = "$installDir\skill.zip"
Invoke-WebRequest -Uri $url -OutFile $output

# 解压
Write-Host "📂 解压文件..." -ForegroundColor Yellow
Expand-Archive -Path $output -DestinationPath $installDir -Force
Remove-Item $output

# 安装依赖
Write-Host "🔧 安装依赖..." -ForegroundColor Yellow
Set-Location $installDir
npm install --production

# 创建环境配置
if (-not (Test-Path "$installDir\.env")) {
    Write-Host "⚙️ 创建环境配置..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "请编辑 $installDir\.env 文件配置OKX API密钥" -ForegroundColor Cyan
}

# 创建启动脚本
$startScript = @"
@echo off
cd /d "$installDir"
node scripts\analyze.js %*
"@

Set-Content -Path "$installDir\smart-trading-signals.bat" -Value $startScript

# 添加到PATH
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$installDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$installDir", "User")
    Write-Host "✅ 已添加到PATH环境变量" -ForegroundColor Green
}

Write-Host "🎉 安装完成！" -ForegroundColor Green
Write-Host ""
Write-Host "使用方法:" -ForegroundColor Cyan
Write-Host "  cd $installDir"
Write-Host "  node scripts\analyze.js --symbol BTC/USDT"
Write-Host ""
Write-Host "或使用命令别名:" -ForegroundColor Cyan
Write-Host "  smart-trading-signals --symbol BTC/USDT"
Write-Host ""
Write-Host "请先配置OKX API密钥:" -ForegroundColor Cyan
Write-Host "  编辑 $installDir\.env 文件"
```

## 📊 版本管理

### 版本号规范
使用语义化版本控制 (SemVer):
- `MAJOR`: 不兼容的API修改
- `MINOR`: 向下兼容的功能性新增
- `PATCH`: 向下兼容的问题修正

### 更新日志模板
创建 `CHANGELOG.md`:
```markdown
# 更新日志

## [1.0.0] - 2024-01-15
### 新增
- RSI策略分析功能
- OKX市场数据集成
- 风险管理模块
- 批量分析功能
- 命令行工具

### 修复
- 数据获取稳定性问题
- 缓存机制优化
- 错误处理改进

### 变更
- 更新API接口
- 优化性能表现
- 改进文档
```

## 🛡️ 安全考虑

### 代码审计
- [ ] 检查依赖包的安全性
- [ ] 审计API密钥处理逻辑
- [ ] 验证数据加密传输
- [ ] 检查日志中的敏感信息

### 用户数据保护
- [ ] 不存储用户交易数据
- [ ] 不记录API密钥到日志
- [ ] 使用环境变量配置敏感信息
- [ ] 提供数据清理功能

### 合规性
- [ ] 添加适当的免责声明
- [ ] 遵守平台使用条款
- [ ] 提供风险提示
- [ ] 符合数据保护法规

## 📈 监控和维护

### 性能监控
```javascript
// 添加性能监控
const performance = {
  startTime: Date.now(),
  endTime: null,
  memoryUsage: process.memoryUsage(),
  
  track: function() {
    this.endTime = Date.now();
    return {
      duration: this.endTime - this.startTime,
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }
};
```

### 错误报告
```javascript
// 错误报告系统
class ErrorReporter {
  constructor(skillId, version) {
    this.skillId = skillId;
    this.version = version;
  }
  
  report(error, context) {
    const report = {
      skillId: this.skillId,
      version: this.version,
      error: {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      },
      context,
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage()
      }
    };
    
    // 发送到错误收集服务
    this.sendToService(report);
  }
}
```

### 使用统计
```javascript
// 使用统计
class UsageStats {
  constructor() {
    this.stats = {
      totalAnalyses: 0,
      successfulAnalyses: 0,
      failedAnalyses: 0,
      averageResponseTime: 0,
      popularSymbols: new Map(),
      strategyUsage: new Map()
    };
  }
  
  recordAnalysis(result) {
    this.stats.totalAnalyses++;
    
    if (result.success) {
      this.stats.successfulAnalyses++;
    } else {
      this.stats.failedAnalyses++;
    }
    
    // 记录热门交易对
    const symbolCount = this.stats.popularSymbols.get(result.symbol) || 0;
    this.stats.popularSymbols.set(result.symbol, symbolCount + 1);
    
    // 记录策略使用
    const strategyCount = this.stats.strategyUsage.get(result.strategy) || 0;
    this.stats.strategyUsage.set(result.strategy, strategyCount + 1);
  }
}
```

## 🎯 发布检查清单

### 代码质量
- [ ] 所有测试通过
- [ ] 代码覆盖率 > 80%
- [ ] 代码风格检查通过
- [ ] 没有安全漏洞

### 文档
- [ ] README.md 完整且准确
- [ ] SKILL.md 符合平台要求
- [ ] API文档完整
- [ ] 示例代码有效

### 功能
- [ ] 核心功能正常工作
- [ ] 错误处理完善
- [ ] 性能符合要求
- [ ] 兼容性测试通过

### 发布材料
- [ ] 技能包准备就绪
- [ ] 演示材料准备就绪
- [ ] 安装脚本测试通过
- [ ] 版本号正确

### 合规性
- [ ] 免责声明完整
- [ ] 风险提示明确
- [ ] 符合平台政策
- [ ] 用户数据保护

## 🔄 更新和维护

### 定期更新
1. **每周**: 检查依赖包更新
2. **每月**: 性能优化和bug修复
3. **每季度**: 功能更新和策略优化
4. **每年**: 重大版本更新

### 用户支持
- **问题跟踪**: 使用GitHub Issues
- **文档更新**: 根据用户反馈更新文档
- **社区支持**: 建立用户社区
- **定期沟通**: 发布更新通知

### 反馈收集
```javascript
// 反馈收集系统
class FeedbackCollector {
  constructor() {
    this.feedback = [];
  }
  
  collect(userFeedback, context) {
    const feedbackEntry = {
      ...userFeedback,
      context,
      timestamp: new Date().toISOString(),
      version: process.env.SKILL_VERSION
    };
    
    this.feedback.push(feedbackEntry);
    
    // 定期分析反馈
    if (this.feedback.length % 100 === 0) {
      this.analyzeFeedback();
    }
  }
  
  analyzeFeedback() {
    // 分析用户反馈，找出常见问题和改进点
    const analysis = {
      commonIssues: this.findCommonIssues(),
      featureRequests: this.findFeatureRequests(),
      satisfactionScore: this.calculateSatisfaction(),
      improvementAreas: this.identifyImprovements()
    };
    
    return analysis;
  }
}
```

---

**发布成功！** 🎉

记得在发布后：
1. 监控技能使用情况
2. 收集用户反馈
3. 及时修复问题
4. 定期更新维护

祝你的交易策略技能大获成功！ 🚀