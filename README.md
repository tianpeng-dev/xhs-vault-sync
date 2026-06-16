# XHS Vault Sync

XHS Vault Sync 是一个开源的 Obsidian 桌面端插件，用于把小红书/RedNote 的收藏、笔记、点赞和专辑内容同步到本地 Obsidian 库中。

[English README](README.en)

## 功能

- 在 Obsidian 内通过持久化 webview 登录小红书。
- 同步收藏、我的笔记、点赞和指定专辑。
- 支持专辑列表刷新和专辑白名单。
- 支持增量同步、分页游标和多账号同步状态隔离。
- 同步文章按同步顺序编号，文件名前缀和 frontmatter 都会写入编号。
- 生成 Markdown 笔记和 YAML frontmatter。
- 可选下载图片到本地。
- 可选下载视频到本地，下载失败时保留远程链接并继续生成笔记。
- 图文内容会尽量采集正文和图片。
- 评论仅保存“问一问”的回答，不保存头像和普通评论。
- 状态面板展示账号、目标、进度、保存/跳过数量、最近错误和最近日志。
- 可选 AI 分类，使用 OpenAI 兼容接口把分类写入 `category`。
- 无授权码、无设备绑定、无外部授权服务。

## 使用要求

- 仅支持 Obsidian 桌面端。
- 需要能在 Obsidian webview 中正常打开并登录小红书。
- 小红书接口不是公开 API，页面结构或接口字段变化可能导致同步失败。

## 安装

1. 运行构建：

```bash
npm install
npm run build
```

2. 将以下文件复制到 Obsidian 插件目录：

```text
main.js
manifest.json
styles.css
```

目标目录示例：

```text
<你的 Vault>/.obsidian/plugins/xhs-vault-sync/
```

3. 在 Obsidian 设置中启用 `XHS Vault Sync`。

## 基本使用

1. 打开插件设置页，点击“登录小红书”。
2. 在弹出的登录窗口中完成小红书登录。
3. 点击 `I am logged in` 保存登录态。
4. 选择同步目标：收藏、我的笔记、点赞或专辑。
5. 如果选择专辑，先点击“刷新专辑列表”，再勾选需要同步的专辑。
6. 点击“立即同步”。
7. 通过状态栏或“查看状态”查看进度和错误信息。

## 同步结果

默认保存到 `RedNote` 目录。每篇笔记会包含：

- 标题、作者、原文链接。
- 同步编号和同步时间。
- 同步目标，例如收藏、点赞、专辑。
- 专辑 ID 和专辑名称。
- 正文、图片、视频链接或本地媒体引用。
- “问一问”回答。
- 可选 AI 分类结果。

示例 frontmatter：

```yaml
source: "xiaohongshu"
resourceId: "note-id"
title: "示例笔记"
author: "作者"
url: "https://www.xiaohongshu.com/explore/note-id"
category: "AI 工具"
syncTarget: "album"
albumId: "album-id"
albumTitle: "收藏夹"
syncIndex: 12
syncedAt: "2026-06-15T08:00:00.000Z"
tags:
  - "xhs"
```

## 设置说明

- `保存目录`：Markdown 和媒体文件保存的位置。
- `单次同步数量`：控制每次最多保存多少篇，建议保持较小数值。
- `同步目标`：收藏、我的笔记、点赞或专辑。
- `下载图片`：开启后图片会保存到本地。
- `下载视频`：开启后视频会保存到本地。
- `专辑白名单`：仅同步勾选的专辑。
- `AI 分类`：默认关闭。开启后需要填写 API Key、Base URL、模型和分类列表。

## 隐私与安全

- 插件不会发送授权码、设备 ID 或分析数据到第三方服务。
- 完整登录 Cookie 尽量保留在 Obsidian/Electron 的本地持久会话中。
- 插件设置中会保存 `a1Cookie`，用于重新读取本地会话。
- AI 分类需要用户自行填写 OpenAI 兼容接口 API Key。该 Key 只保存在本地 Obsidian 插件配置中，建议使用专用低权限 Key，不要把 `.obsidian` 配置同步到不可信位置。

## 局限与风险

- 小红书接口和页面结构可能变化，导致列表、正文、图片、视频或评论采集失败。
- 如果 Obsidian 或系统清理了 Electron 持久会话，可能需要重新登录。
- 视频和图片下载受小红书防盗链、限流和网络环境影响。
- AI 分类依赖用户配置的接口和模型，插件不保证第三方服务可用性。

## 开发

```bash
npm install
npm run typecheck
npm test
npm run build
```

## 本地验证

当前主要验证命令：

```bash
npm run typecheck
npm test
npm run build
```

## License

MIT
