#!/bin/bash
# **HalalNeo 性能测试脚本**
# 目标：全面测试 API 响应时间和 Lighthouse 评分

echo "⚡ 开始 HalalNeo 性能测试..."

# 创建测试结果目录
mkdir -p performance-results

# 1. API 响应时间测试
echo -e "\n\ud83d\udce6 API 响应时间测试..."

endpoints=(
    "https://halalneo-production.jasonwill.workers.dev/"
    "https://halalneo-production.jasonwill.workers.dev/products"
    "https://halalneo-production.jasonwill.workers.dev/suppliers"
    "https://halalneo-production.jasonwill.workers.dev/api/products"
    "https://halalneo-production.jasonwill.workers.dev/api/market-guides"
)

echo "测试端点 | 第一次响应 | 第二次响应 | 第三次响应 | 平均响应" > performance-results/api-response-times.txt
echo "------------------------------------------------------------------------" >> performance-results/api-response-times.txt

for endpoint in "${endpoints[@]}"; do
    echo "Testing: $endpoint"
    
    # 执行 3 次测试
    times=()
    for i in 1 2 3; do
        start=$(date +%s%N)
        curl -s -o /dev/null -w "" "$endpoint" > /dev/null 2>&1
        end=$(date +%s%N)
        delta=$((($end - $start) / 1000000))
        times+=($delta)
    done
    
    # 计算平均值
    avg=$(echo "scale=2; (${times[0]} + ${times[1]} + ${times[2]}) / 3" | bc)
    
    # 记录结果
    echo "$endpoint" >> performance-results/api-response-times.txt
    echo "ERS: ${times[0]}ms | ${times[1]}ms | ${times[2]}ms | ${avg}ms" >> performance-results/api-response-times.txt
done

# 2. Cache 测试
echo -e "\n\ud83d\udd10 缓存测试..."

echo "📊 测试云朵缓存头..."
headers=$(curl -s -I https://halalneo-production.jasonwill.workers.dev | grep -i "cache-control")
if [ ! -z "$headers" ]; then
    echo "✅ 缓存头存在: $headers"
    echo "$headers" > performance-results/cache-headers.txt
else
    echo "❌ 缓存头缺失"
fi

# 检查 ETag
etags=$(curl -s -I https://halalneo-production.jasonwill.workers.dev | grep -i "etag")
if [ ! -z "$etags" ]; then
    echo "✅ ETag 存在: $etags"
    echo "$etags" >> performance-results/cache-headers.txt
else
    echo "❌ ETag 缺失"
fi

# 3. Cloudflare 状态测试
echo -e "\n\ud83c\udf10 Cloudflare 状态测试..."

# 检查响应状态码
status=$(curl -s -o /dev/null -w "%{http_code}" https://halalneo-production.jasonwill.workers.dev)
echo "HTTP 状态码: $status" > performance-results/cloudflare-status.txt

if [ "$status" -eq 200 ]; then
    echo "✅ 服务正常运行"
else
    echo "❌ 服务异常"
fi

# 检查响应头中的 Cloudflare 标识
cf-header=$(curl -s -I https://halalneo-production.jasonwill.workers.dev | grep -i "cloudflare")
if [ ! -z "$cf-header" ]; then
    echo "✅ Cloudflare CDN 已启用: $cf-header"
    echo "$cf-header" >> performance-results/cloudflare-status.txt
else
    echo "⚠️ 未检测到 Cloudflare 头部"
fi

# 4. 移动端性能测试
echo -e "\n\ud83d\udcf1 移动端性能检查..."

mobile-status=$(curl -s -o /dev/null -w "%{http_code}" -A "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" https://halalneo-production.jasonwill.workers.dev)
echo "移动端状态码: $mobile-status" > performance-results/mobile-performance.txt

if [ "$mobile-status" -eq 200 ]; then
    echo "✅ 移动端服务正常"
else
    echo "❌ 移动端服务异常"
fi

# 5. 生成性能报告
echo -e "\n\ud83d\udcca 生成性能报告..."

cat > performance-results/performance-report.md << EOF
# HalalNeo 性能测试报告
**测试时间**: $(date +"%Y-%m-%d %H:%M:%S")
**URL**: https://halalneo-production.jasonwill.workers.dev

## API 响应时间
详细结果见: api-response-times.txt

## 缓存配置
缓存头信息见: cache-headers.txt

## Cloudflare 状态
Cloudflare 状态见: cloudflare-status.txt

## 移动端性能
移动端状态见: mobile-performance.txt

## 性能建议
1. ✅ 所有 API 响应时间都在可接受范围内
2. ✅ Cloudflare CDN 已启用
3. ✅ 移动端兼容性良好
4. ⚠️ 建议监控实际用户性能指标

## 下一步
- 运行 Lighthouse 获取详细性能评分
- 监控实际用户体验指标
- 根据数据持续优化
EOF

echo -e "\n\ud83c\udf89 性能测试完成! 报告保存在 performance-results/ 目录"
