#!/bin/bash

# 交易策略技能安装脚本

set -e

echo "🚀 开始安装交易策略技能..."

# 检查Node.js版本
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装Node.js (>=16.0.0)"
    echo "   访问: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
if [[ $(echo "$NODE_VERSION < 16.0.0" | bc) -eq 1 ]]; then
    echo "❌ Node.js版本过低，请升级到16.0.0或更高版本"
    exit 1
fi

# 创建安装目录
INSTALL_DIR="${1:-$HOME/.trading-strategy-skill}"
mkdir -p "$INSTALL_DIR"

echo "📦 复制文件到 $INSTALL_DIR..."
cp -r . "$INSTALL_DIR/"
cd "$INSTALL_DIR"

echo "🔧 安装依赖..."
npm install --production

# 创建环境配置
if [ ! -f ".env" ]; then
    echo "⚙️ 创建环境配置..."
    cp .env.example .env
    echo ""
    echo "✅ 安装完成！"
    echo ""
    echo "📋 下一步："
    echo "1. 编辑 $INSTALL_DIR/.env 文件配置OKX API密钥"
    echo "2. 运行测试: node scripts/analyze.js --symbol BTC/USDT"
    echo ""
else
    echo "✅ 安装完成！"
    echo ""
    echo "📋 使用方法："
    echo "  cd $INSTALL_DIR"
    echo "  node scripts/analyze.js --symbol BTC/USDT"
    echo ""
fi

# 创建快捷命令
if [ -d "$HOME/.local/bin" ]; then
    cat > "$HOME/.local/bin/trading-strategy" << 'EOF'
#!/bin/bash
cd "$HOME/.trading-strategy-skill"
node scripts/analyze.js "$@"
EOF
    chmod +x "$HOME/.local/bin/trading-strategy"
    echo "🎯 已创建快捷命令: trading-strategy"
    echo "   使用: trading-strategy --symbol BTC/USDT"
fi