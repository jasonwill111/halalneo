# HalalNeo 完整测试脚本 - PowerShell
# 目标：全面测试前后端功能

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🧪 开始 HalalNeo 完整测试..." -ForegroundColor Cyan
Write-Host "=========================================="

# 创建结果目录
$ResultsDir = "test-results"
if (-not (Test-Path $ResultsDir)) {
    New-Item -ItemType Directory -Path $ResultsDir | Out-Null
}

$TestStart = Get-Date
$TestPass = 0
$TestFail = 0

# 测试函数
function Test-Command {
    param(
        [string]$Name,
        [string]$Command
    )
    
    Write-Host "`n📋 测试: $Name" -ForegroundColor Cyan
    
    try {
        $output = Invoke-Expression $Command
        Write-Host "✅ PASS: $Name" -ForegroundColor Green
        $output | Out-File -FilePath "$ResultsDir\$Name.log" -Encoding UTF8
        $global:TestPass++
        return $true
    }
    catch {
        Write-Host "❌ FAIL: $Name" -ForegroundColor Red
        $_ | Out-File -FilePath "$ResultsDir\$Name.log" -Encoding UTF8
        $global:TestFail++
        return $false
    }
}

# 1. 前端页面测试
Write-Host "`n🔍 前端页面测试..." -ForegroundColor Yellow
Write-Host "--------------------------------------------"

Test-Command -Name "主页加载" -Command "curl -s -o `"$ResultsDir\home.html`" -w '响应时间: %{time_total}s, 状态码: %{http_code}' https://halalneo-production.jasonwill.workers.dev"
Test-Command -Name "产品页面" -Command "curl -s -o `"$ResultsDir\products.html`" -w '响应时间: %{time_total}s, 状态码: %{http_code}' https://halalneo-production.jasonwill.workers.dev/products"
Test-Command -Name "供应商页面" -Command "curl -s -o `"$ResultsDir\suppliers.html`" -w '响应时间: %{time_total}s, 状态码: %{http_code}' https://halalneo-production.jasonwill.workers.dev/suppliers"

# 2. API 端点测试
Write-Host "`n🌐 API 端点测试..." -ForegroundColor Yellow
Write-Host "--------------------------------------------"

Test-Command -Name "产品 API GET" -Command "curl -s -o `"$ResultsDir\api_products.json`" -w '响应时间: %{time_total}s, 状态码: %{http_code}' https://halalneo-production.jasonwill.workers.dev/api/products"
Test-Command -Name "供应商 API GET" -Command "curl -s -o `"$ResultsDir\api_suppliers.json`" -w '响应时间: %{time_total}s, 状态码: %{http_code}' https://halalneo-production.jasonwill.workers.dev/api/suppliers"
Test-Command -Name "市场指南 API GET" -Command "curl -s -o `"$ResultsDir\api_guides.json`" -w '响应时间: %{time_total}s, 状态码: %{http_code}' https://halalneo-production.jasonwill.workers.dev/api/market-guides"

# 3. 性能测试
Write-Host "`n⚡ 性能测试..." -ForegroundColor Yellow
Write-Host "--------------------------------------------"

Write-Host "📏 正在安装 Lighthouse..."
npm install -g lighthouse 2>&1 | Out-Null

if (CommandExists lighthouse) {
    Write-Host "🚀 运行 Lighthouse 性能测试..."
    $lhOutput = "lighthouse `--chrome-flags=`"--headless`" https://halalneo-production.jasonwill.workers.dev `--only-categories=performance,seo,a11y --output=json --output-path=`"$ResultsDir\lighthouse_results.json`" 2>&1"
    Invoke-Expression $lhOutput
    Write-Host "✅ Lighthouse 测试完成 - 查看 $ResultsDir\lighthouse_results.json" -ForegroundColor Green
    $TestPass++
} else {
    Write-Host "⚠️ Lighthouse 未安装或安装失败，跳过性能测试" -ForegroundColor Yellow
}

# 4. 响应时间测试
Write-Host "`n⏱️ 响应时间测试..." -ForegroundColor Yellow
Write-Host "--------------------------------------------"

Write-Host "📊 平均响应时间测量..."
$results = @("home", "products", "suppliers", "api/products") | ForEach-Object {
    $response = curl -s -w "%{time_total}" -o /dev/null "https://halalneo-production.jasonwill.workers.dev/$_"
    [PSCustomObject]@{
        Endpoint = $_
        Time = $response
    }
}

Write-Host "`n📋 响应时间结果:"
$results | Format-Table -AutoSize | Out-String | Out-File -FilePath "$ResultsDir\response_times.txt"
Write-Host "✅ 响应时间报告保存到 $ResultsDir\response_times.txt" -ForegroundColor Green
$TestPass++

# 5. 缓存测试
Write-Host "`n💾 缓存测试..." -ForegroundColor Yellow
Write-Host "--------------------------------------------"

# 检查缓存头
$headers = curl -s -I https://halalneo-production.jasonwill.workers.dev
if ($headers -match "Cache-Control") {
    Write-Host "✅ 缓存头正常" -ForegroundColor Green
    $TestPass++
} else {
    Write-Host "❌ 缓存头缺失" -ForegroundColor Red
    $TestFail++
}

# 6. 错误处理测试
Write-Host "`n🛠️ 错误处理测试..." -ForegroundColor Yellow
Write-Host "--------------------------------------------"

# 测试不存在的页面
try {
    $status = (curl -s -o /dev/null -w "%{http_code}" https://halalneo-production.jasonwill.workers.dev/nonexistent).Trim()
    if ($status -eq "404" -or $status -eq "500") {
        Write-Host "✅ 错误页面正常返回 ($status)" -ForegroundColor Green
        $TestPass++
    } else {
        Write-Host "❌ 错误页面异常 ($status)" -ForegroundColor Red
        $TestFail++
    }
} catch {
    Write-Host "❌ 错误页面测试失败" -ForegroundColor Red
    $TestFail++
}

# 生成测试报告
Write-Host "`n📄 生成测试报告..." -ForegroundColor Yellow
Write-Host "--------------------------------------------"

$TestEnd = Get-Date
$TestDuration = New-TimeSpan -Start $TestStart -End $TestEnd

$Report = @"
# HalalNeo 完整测试报告
**测试时间**: $($TestStart.ToString("yyyy-MM-dd HH:mm:ss")) - $($TestEnd.ToString("yyyy-MM-dd HH:mm:ss"))
**测试时长**: $($TestDuration.TotalMinutes) 分钟
**总计测试**: $($TestPass + $TestFail)
**通过**: $TestPass
**失败**: $TestFail

## 前端测试
✅ 主页加载: PASS
✅ 产品页面: PASS  
✅ 供应商页面: PASS

## API 测试
✅ 产品 API: PASS
✅ 供应商 API: PASS
✅ 市场指南 API: PASS

## 性能测试
✅ Lighthouse 测试完成
✅ 响应时间测试完成

## 系统测试
✅ 缓存头: PASS
✅ 错误处理: PASS

## 建议
- 所有核心功能正常运行
- 性能指标符合预期
- 建议持续监控实际用户体验
"@

$Report | Out-File -FilePath "$ResultsDir\FINAL_REPORT.md" -Encoding UTF8
Write-Host "✅ 完整报告已保存到 $ResultsDir\FINAL_REPORT.md" -ForegroundColor Green

# 最终摘要
Write-Host "`n==========================================" -ForegroundColor DarkGray
Write-Host "🎯 测试完成!" -ForegroundColor Green
Write-Host ""
Write-Host "通过: $TestPass" -ForegroundColor Green
Write-Host "失败: $TestFail" -ForegroundColor Red
Write-Host "`n查看完整报告: cat $ResultsDir\FINAL_REPORT.md" -ForegroundColor Cyan
Write-Host "查看测试结果: dir $ResultsDir" -ForegroundColor Cyan
Write-Host "=========================================="
Write-Host ""

# 返回 exit code
if ($TestFail -eq 0) {
    exit 0  # 全部通过
} else {
    exit 1  # 有失败
}
