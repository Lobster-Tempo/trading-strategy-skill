#!/bin/bash

echo "🔧 Installing Smart Trading Signals Skill..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# 检查OKX CLI
if ! command -v okx &> /dev/null; then
    echo "⚠️  OKX CLI is not installed. Installing..."
    npm install -g @okx/cli
fi

# 创建技能目录
SKILL_DIR="$HOME/.okx/skills/smart-trading-signals"
mkdir -p "$SKILL_DIR"

# 复制技能文件
cp smart-trading-signals.js "$SKILL_DIR/"
chmod +x "$SKILL_DIR/smart-trading-signals.js"

# 创建包装脚本
cat > "$SKILL_DIR/okx-skill-wrapper" << 'EOF'
#!/bin/bash
# OKX技能包装器
node "$(dirname "$0")/smart-trading-signals.js" "$@"
EOF

chmod +x "$SKILL_DIR/okx-skill-wrapper"

# 创建符号链接（如果OKX CLI支持技能目录）
if [ -d "$HOME/.okx/bin" ]; then
    ln -sf "$SKILL_DIR/okx-skill-wrapper" "$HOME/.okx/bin/okx-smart-trading-signals"
fi

echo "✅ Installation complete!"
echo ""
echo "📋 Usage:"
echo "  okx-smart-trading-signals analyze --symbol=BTC/USDT"
echo "  okx-smart-trading-signals batch --symbols=BTC/USDT,ETH/USDT"
echo ""
echo "⚠️  Security reminder:"
echo "  - Store API keys in environment variables"
echo "  - Use read-only API keys when possible"
echo "  - Never commit API keys to version control"
echo ""
echo "🔒 API Credential Security:"
echo "  Method 1 (Recommended): Environment variables"
echo "    export OKX_API_KEY='your_key'"
echo "    export OKX_API_SECRET='your_secret'"
echo "    export OKX_PASSPHRASE='your_passphrase'"
echo ""
echo "  Method 2: OKX CLI config"
echo "    okx config set api_key=your_key"
echo "    okx config set api_secret=your_secret"
echo "    okx config set passphrase=your_passphrase"
echo ""
echo "  Method 3: Command line (temporary)"
echo "    okx --api-key=xxx --api-secret=xxx --passphrase=xxx market ticker"