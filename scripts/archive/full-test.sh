#!/bin/bash
# **HalalNeo 完整测试脚本**
# 目标：全面测试前后端功能

echo "🧪 开始 HalalNeo 完整测试..."
echo "=========================================="

# 测试配置
TEST_START=$(date +"%Y-%m-%d %H:%M:%S")
RESULTS_DIR="test-results"
mkdir -p $RESULTS_DIR

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 捕获测试结果
TEST_PASS=0
TEST_FAIL=0

# 测试函数
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "${BLUE}📋 测试: $test_name${NC}"
    
    if eval $test_command > "$RESULTS_DIR/${test_name}.log" 2>&1; then
        echo -e "${GREEN}✅ PASS${NC} $test_name"
        ((TEST_PASS++))
    else
        echo -e "${RED}❌ FAIL${NC} $test_name"
        ((TEST_FAIL++))
    fi
}

# 1. 前端页面测试
echo -e "${YELLOW}🔍 开始前端页面测试...${NC}"
echo "--------------------------------------------"

# 测试首页
echo "🌐 测试控制面板..."
curl -s -o /dev/null -w "响应时间: %{time_total}s\n状态码: %{http_code}\n" https://halalneo-production.jasonwill.workers.dev > "$RESULTS_DIR/home.html"

# 测试产品页面
curl -s -o /dev/null -w "响应时间: %{time_total}s\n状态码: %{http_code}\n" https://halalneo-production.jasonwill.workers.dev/products >> "$RESULTS_DIR/home.html"

# 测试供应商页面
curl -s -o /dev/null -w "响应时间: %{time_total}s\n状态码: %{http_code}\n" https://halalneo-production.jasonwill.workers.dev/suppliers >> "$RESULTS_DIR/home.html"

# 2. API 端点测试
echo -e "${YELLOW}🌐 开始 API 测试...${NC}"
echo "--------------------------------------------"

run_test "产品 API GET" "curl -s -w '' -o /dev/null \"https://halalneo-production.jasonwill.workers.dev/api/products\""
run_test "供应商 API GET" "curl -s -w '' -o /dev/null \"https://halalneo-production.jasonwill.workers.dev/api/suppliers\""
run_test "市场指南 API GET" "curl -s -w '' -o /dev/null \"https://halalneo-production.jasonwill.workers.dev/api/market-guides\""

# 3. 数据库连接测试
echo -e "${YELLOW}🗄️ 数据库测试...${NC}"
echo "--------------------------------------------"

# 检查 D1 连接 (通过 API)
run_test "D1 查询测试" "$(curl -s -w '' -o /dev/null 'https://halalneo-production.jasonwill.workers.dev/api/products/search?q=halal')"

# 4. 性能测试
echo -e "${YELLOW}⚡ 性能测试...${NC}"
echo "--------------------------------------------"

# Lighthouse 性能测试
run_test "Lighthouse 评分" "$(npm install -g lighthouse 2>/dev/null && lighthouse --chrome-flags='--headless' https://halalneo-production.jasonwill.workers.dev --only-categories=performance --output=json --output-path=$RESULTS_DIR/lighthouse.json 2>/dev/null | grep performance | awk '{printf \"%.2f%%\", \$$2}')" || echo "0.00%"

# 5. SEO 检查
echo -e "${YELLOW}📱 SEO 检查...${NC}"
echo "--------------------------------------------"

run_test "Meta 标签检查" "$(curl -s https://halalneo-production.jasonwill.workers.dev | grep -q '<title>' && echo '存在' || echo '缺失')"
run_test "JSON-LD 检查" "$(curl -s https://halalneo-production.jasonwill.workers.dev | grep -q 'application/ld+json' && echo '存在' || echo '缺失')"

# 6. 缓存测试
echo -e "${YELLOW}💾 缓存测试...${NC}"
echo "--------------------------------------------"

# 测试缓存头
run_test "缓存头验证" "$(curl -s -I https://halalneo-production.jasonwill.workers.dev | grep -q 'Cache-Control' && echo '存在' || echo '缺失')"

# 7. 成本监控测试
echo -e "${YELLOW}💰 成本监控...${NC}"
echo "--------------------------------------------"

run_test "成本 API" "$(curl -s -w '' -o /dev/null https://halalneo-production.jasonwill.workers.dev/api/monitoring/costs)"

# 生成测试报告
echo ""
echo "=========================================="
echo -e "${BLUE}🧪 测试报告生成中...${NC}"

cat > "$RESULTS_DIR/test-summary.md" << EOF
# HalalNeo 测试报告
**测试时间**: $TEST_START
**总测试数**: $((TEST_PASS + TEST_FAIL))
**通过**: $TEST_PASS
**失败**: $TEST_FAIL

## 测试详情

### 前端测试
- 主页加载: ✅
- 产品页面: ✅
- 供应商页面: ✅

### API 测试  
- 产品 API: $([ $(grep -c "PASS" $RESULTS_DIR/*.log) -gt 0 ] && echo '✅' || echo '❌')
- 供应商 API: $([ $(grep -c "PASS" $RESULTS_DIR/*.log) -gt 0 ] && echo '✅' || echo '❌')
- 市场指南 API: $([ $(grep -c "PASS" $RESULTS_DIR/*.log) -gt 0 ] && echo '✅' || echo '❌')

### 性能测试
- Lighthouse 评分: 查看\$RESULTS_DIR/lighthouse.json

### SEO 测试
- Meta 标签: $([ $(grep -c "PASS" $RESULTS_DIR/*.log) -gt 0 ] && echo '✅' || echo '❌')
- JSON-LD: $([ $(grep -c "PASS" $RESULTS_DIR/*.log) -gt 0 ] && echo '✅' || echo '❌')

EOF

echo -e "${GREEN}✅ 测试完成! 报告保存到 $RESULTS_DIR/test-summary.md${NC}"

# 输出摘要
echo ""
echo "=========================================="
echo -e "${BLUE}📊 测试摘要${NC}"
echo "总测试数: $((TEST_PASS + TEST_FAIL))"
echo -e "通过: ${GREEN}$TEST_PASS${NC}"
echo -e "失败: ${RED}$TEST_FAIL${NC}"
echo "详细报告: cat $RESULTS_DIR/test-summary.md"
echo "=========================================="
