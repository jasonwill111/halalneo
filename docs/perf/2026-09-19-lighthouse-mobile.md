# 移动端性能实测留档（2026-09-19，部署后）

工具：本地 Lighthouse 12（`--form-factor=mobile`，Slow-4G + 4x CPU 节流，等同 PSI lab 模拟），目标 `https://halalneo.com/`，版本 1390a8d5。PSI REST API 当日免费配额耗尽（429），故用本地等价 lab；正式 PSI/CrUX 待配额重置后复核。

## 结果（两次运行）

| 指标 | Run 1 | Run 2 | 规则目标（§7.3） |
|---|---|---|---|
| Performance score | 0.53 | 0.51 | — |
| FCP | 2.8s | 2.9s | — |
| LCP | 4.7s | 4.9s | ≤2.5s ❌ |
| TBT（INP 代理） | 960ms | 1020ms | ≤200ms（INP）❌ |
| CLS | 0 | 0 | ≤0.1 ✅ |
| Speed Index | 5.2s | 5.1s | — |
| Total Byte Weight | — | 610KiB | — |

## 诊断（lab 归因）

1. **TTFB ≈ 1070ms**：SSR 首页 + D1 多子请求。`s-maxage=1800` 已被响应头下发，但 Cloudflare 边缘默认不缓存 HTML——需在 dashboard 加 Cache Rule（`/` 与内容页，Edge TTL）才能把重复访问 TTFB 压到 <100ms。→ 用户侧（或 API token）。
2. **gtag.js（GA4）174kB / 345ms 脚本启动 + 61kB 未用 JS**：已按 SPA 最佳实践延迟入队（commit 1694397），lab 中仍是最大第三方。可选：GA4 改用 `deprecate` 轻量事件或 Consent-Mode 延迟。
3. **主线程 1.7s 脚本执行 + 1.2s Style/Layout**：hydration 主 chunk `GU3-IKh1.js` 696ms。首页已减 to 7 fetch；进一步可代码分割首屏外组件（收益中等）。
4. 图片合规：hero 40-42kB WebP、CLS=0、无未优化图告警。
5. 本机 headless 触发 CF challenge-platform 脚本（401ms），真实用户无此开销 → lab 值偏悲观。

## 结论

结构性红线（CLS、图片、字体、blur、JS 体积 610KiB）达标；LCP/TBT 在 lab 模拟下不达标，首要瓶颈是 HTML 边缘缓存未开（用户侧配置一项即可显著改善）。待办已同步 `docs/compliance-checklist.md` §7.3 与文末清单。
