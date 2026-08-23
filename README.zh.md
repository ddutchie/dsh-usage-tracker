# dsh-usage-tracker

[English](README.md) | 中文

为 [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) 及任意
Cordis 宿主提供的**持久化 LLM 用量与成本追踪**、聚合统计与用量面板。

它是 [`dsh-context-ring`](https://github.com/ddutchie/dsh-context-ring) 的“历史持久化”
补充：上下文环回答*“当前上下文里有什么”*，而用量追踪器回答*“我们随时间、按模型花了多少”*。

## 功能

- **采集**：从会话事件流中采集每一轮的用量（输入 / 输出 / 推理 / 缓存 token），并统一
  各家 provider 的差异化字段格式。
- **成本解析**（三级回退）：provider 上报 → 基于定价表估算（带 `costEstimated` 标记）
  → 无成本。
- **聚合**：汇总总量、与上一周期的差值、按天序列、按模型花费，以及按任意维度分组的
  汇总——全部为纯函数，无需数据库。
- **渲染**：自包含的 `<UsagePanel>`（通过 CSS 变量适配 DSH 或宿主主题，不依赖
  Tailwind），并附带一个 DSH 设置区插件。

## 入口

| 导入路径 | 内容 |
|---|---|
| `dsh-usage-tracker` | Cordis 插件（`apply` / `usageTrackerPlugin`）+ `UsageTrackerService` + 全部核心导出 |
| `dsh-usage-tracker/query` | 纯聚合函数（`queryUsageOverview`、`queryRecent`、`sumTotals`） |
| `dsh-usage-tracker/pricing` | 成本估算器 + 缓存 token 归一化 |
| `dsh-usage-tracker/react` | 可导入的 React 组件（`UsagePanel`） |
| `dsh-usage-tracker/client` | DSH Web 端插件产物（注册“用量”设置区） |
| `dsh-usage-tracker/types` | 仅类型 |

## 采集（宿主插件）

```ts
import { usageTrackerPlugin } from "dsh-usage-tracker";

// 内存模式（可通过 ctx.usageTracker.query() 查询）：
usageTrackerPlugin(ctx);

// 或提供你自己的持久化 sink、实时定价目录与静态维度：
usageTrackerPlugin(ctx, {
  sink: { record: (entry) => db.insertUsage(entry) },
  pricing: (model) => myCatalog.rate(model),
  meta: { workspaceId, source: "chat" },   // 原样持久化到每条记录
});
```

每一轮结束会触发 `ctx.emit("usage/recorded", session, entry)`，并交给 sink 记录。

## 聚合 + 渲染（任意 React 宿主）

```tsx
import { queryUsageOverview, queryRecent } from "dsh-usage-tracker/query";
import { UsagePanel } from "dsh-usage-tracker/react";

const overview = queryUsageOverview(rows, { from, to, groupBy: "source" });
<UsagePanel overview={overview} recent={queryRecent(rows, {}, 12)} />;
```

宿主负责存储；本包负责折叠采集、成本计算、聚合与面板。**账户余额**特意不包含在内——
它与账户强相关，应由宿主自行提供。

## 许可证

MIT
