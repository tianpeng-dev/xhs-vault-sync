# Task 5 专辑同步与白名单证据日志

日期：2026-06-15

## 范围
- 目标：让 `album` 成为合法同步目标，支持专辑列表刷新、白名单选择、专辑内笔记分页同步。
- 非目标：不修改 CI/CD，不调整发布流水线，不处理本任务外的同步策略重构。

## 输入与假设
- 输入来源：用户提供的 Task 5 需求与当前工作树 `codex/rednote-v111-gap`。
- 起始提交：`5d2fb48 feat: 支持帖子和点赞同步目标`。
- 假设：小红书专辑接口路径只需满足现有测试要求的 `board` 语义与参数约束，真实线上路径后续可按抓包结果微调。

## TDD 证据
- RED：`npm test -- tests/api.test.ts tests/sync-state.test.ts tests/settings-tab.test.ts tests/plugin-status.test.ts`
  - 结果：失败，新增 10 个断言因缺少 board API、album 设置迁移、设置页控件与同步实现而失败。
- GREEN：`npm test -- tests/api.test.ts tests/sync-state.test.ts tests/settings-tab.test.ts tests/plugin-status.test.ts`
  - 结果：通过，4 个测试文件、58 个测试全部通过。

## 验证证据
- `npm run typecheck`：通过。
- `npm run build`：通过，生成 `main.js`。
- `npm test`：通过，13 个测试文件、103 个测试全部通过。

## 结论
- `album` 已纳入合法同步目标，默认同步目标仍为 `["bookmark"]`。
- 设置加载会补齐 `lastAlbumSnapshot: []`，并保留合法的 `album` 目标。
- 专辑同步按白名单顺序选择首个未完成专辑，使用专辑维度游标与完成标记，写入 `syncTarget`、`albumId`、`albumTitle`。
- 专辑笔记去重键使用 `album:{albumId}:{noteId}`，避免同一笔记跨专辑互相污染。

## 遗留风险
- `USER_BOARD_URL` 与 `USER_BOARD_NOTE_URL` 使用当前分析路径语义，尚未用真实线上响应验证；若小红书调整接口字段，需要按真实响应扩展解析。
