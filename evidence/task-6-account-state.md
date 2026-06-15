# Task 6 多账号状态隔离与登录态校验证据日志

日期：2026-06-15

## 范围
- 目标：使用 `perAccountState` 隔离不同小红书账号的游标、已同步 ID、专辑白名单、专辑游标和同步编号。
- 目标：确认登录态保存策略不持久化完整 Cookie，仅保存 `a1Cookie`，运行时从持久 Electron 分区读取完整 Cookie。
- 非目标：不修改登录 UI 交互方式，不新增额外安全机制，不调整 CI/CD。

## 输入与假设
- 输入来源：用户反馈“每次重新进 Obsidian 小红书都显示要重新登录”，以及当前代码中的 `perAccountState`、`a1Cookie`、`XHS_PARTITION`。
- 假设：`a1Cookie` 可作为再次读取 Electron 持久分区 Cookie 的最小可持久凭据；完整 `web_session` 等 Cookie 不写入插件设置。

## TDD 证据
- RED：`npm test -- tests/account-state.test.ts`
  - 结果：失败，缺少 `src/sync/account-state.ts`。
- GREEN：`npm test -- tests/account-state.test.ts tests/sync-state.test.ts tests/plugin-status.test.ts`
  - 结果：通过，3 个测试文件、41 个测试全部通过。
- 补充同步入口场景：`npm test -- tests/sync-state.test.ts tests/account-state.test.ts`
  - 结果：通过，2 个测试文件、31 个测试全部通过。

## 验证证据
- `npm run typecheck`：通过。
- `npm run build`：通过，生成 `main.js`。
- `npm test`：通过，14 个测试文件、108 个测试全部通过。

## 结论
- 新增 `src/sync/account-state.ts`，提供账号状态快照、恢复和切换逻辑。
- 首次识别账号时保留旧版本全局同步状态，避免升级后清空用户已有进度。
- 真实换号时保存旧账号状态，并恢复新账号历史状态；新账号没有历史时使用空状态。
- 同步和刷新专辑都会在 `getCurrentUser()` 后切换账号状态。
- 登录 Modal 仍只保存 `a1Cookie`，完整 Cookie 由 `readXhsCookieHeader()` 从 `persist:xhs-vault-sync` 分区读取，不持久化到插件设置。

## 遗留风险
- 如果 Electron 分区 Cookie 被系统或 Obsidian 清理，仍需要用户重新登录；该行为属于外部会话存储失效，不在本任务内处理。
