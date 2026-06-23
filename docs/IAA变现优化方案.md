# 开心抓猫猫 — IAA 变现运营优化方案

> IAA（In-App Advertising，纯广告变现）模式运营的优化清单。
> 基于现有代码盘点：`assets/scrpit/adWxDy/`（adMgr / adConfig / wxAd / dyAd / apiMgr）。

---

## 一、现状诊断

> 状态图例：✅ 已完成　🔧 进行中 / 待配置　⬜ 未开始

| 项 | 现状 | 文件位置 | 状态 |
|---|---|---|---|
| 广告总开关 | `isShowAd = true`（已开） | `adConfig.ts:3` | ✅ 已开 |
| 广告位 ID | 5 个 ID **仍全空**，留空时对应广告自动跳过 | `adConfig.ts:7-15` | 🔧 待填新账号真实 ID |
| 小游戏 AppID | 构建配置已切到新账号 `wx87db04b2d6e51de1`（原 `wx58649a9ae87e3f0e`） | `profiles/v2/packages/wechatgame.json` | ✅ 已切（详见 §二.0） |
| 激励视频 | 已铺 8 个点，失败兜底 + 播完预加载已实现 | 见下表 / `adMgr.showVideo` | ✅ 健壮性已做 |
| 插屏广告 | 胜利 / 失败 / 进主界面，已加 30s 频控 + 前 5 关新手保护 | `adMgr.showChaPing` | ✅ 频控已做 |
| Banner | 加载 / 图鉴页 / 过关奖励页 | `initData:33`、`tujiPopTs:24`、`guoguanJiangliPopTs:27` | ✅ 基本 OK |
| 广告数据打点 | 无 | — | ⬜ **看不到 ECPM / 漏斗**，无法优化 |

### 现有激励视频（showVideo）8 个调用点

| 场景 | 文件 | 作用 |
|---|---|---|
| 复活 | `scene/game/fuhuoPopTs.ts:66` | 失败后看广告续命 |
| 加道具 | `scene/game/addDaojuPopTs.ts:33` | 看广告得道具 |
| 对局内 ×2 | `scene/game/gameScene.ts:1184 / 1196` | 局内奖励 |
| 胜利翻倍 | `scene/game/shengliPopTs.ts:62` | 看广告翻倍奖励 |
| 抽奖 | `scene/main/choujiangViewTs.ts:55` | 看广告抽奖 |
| 换肤 | `scene/main/huanfuItemTs.ts:70` | 看广告解锁皮肤 |
| 领奖 | `scene/main/huoquJiangliPopTs.ts:97` | 看广告领奖励 |

---

## 二、必须做的（上线前）

### 0. 小游戏 AppID / 广告位归属（🔧 进行中）
- **AppID 已切换**：构建配置 `profiles/v2/packages/wechatgame.json` 的 `builder.options.wechatgame.appid` 已由 `wx58649a9ae87e3f0e` 改为新账号 `wx87db04b2d6e51de1`。
  - `taskOptionsMap` 内为历史构建快照，保留未改，不影响新构建。
  - ⚠️ 若编辑器开着，改后需重启编辑器或在「构建发布」面板确认显示新值，否则退出时可能被内存旧值覆盖回去。
  - ⚠️ 已构建的 `build/wechatgame/`（game.json / project.config.json）仍是旧 AppID，**需重新构建**才会更新。
- **广告位 ID 需在新账号重建**：换了小游戏账号意味着原广告位 ID 在新账号下无效。
  - 广告位 ID 与 AppID 绑定，需在新账号的微信广告后台重新创建 banner / 插屏 / 激励视频广告位。
  - `wxAd.ts` 内**未写死任何 AppID**（仅一条 `mmocgame.qpic.cn/wechatgame/...` 图片 CDN 链接，与 AppID 无关），广告位 ID 全部来自 `adConfig`，只需改 `adConfig.ts` 一处。

### 1. 开广告 + 填广告位 ID（开关 ✅ / 填 ID 🔧）
- ✅ `adConfig.ts`：`isShowAd = true` 已开。留空的广告位会**自动跳过**（不报错、不展示；激励视频留空时直接发奖、不阻塞玩法）。
- 🔧 仍需填入 5 个广告位 ID（wxBannerId / wxChaPingId / wxVideoId / dyChaPingId / dyVideoId）—— 见 §二.0，需新账号后台创建后回填。
- **建议改为服务端远程配置**，而非硬编码（P1）：支持灰度发布、紧急关停（kill switch）、分人群投放。

### 2. 修 `showVideo` 失败兜底 ✅（已完成 @ commit 974307c）
- 改造已落地（`adMgr.showVideo`）：
  - 区分「用户中途退出」（不给奖励 + 提示）与「广告拉取失败」（给提示 / 视场景补偿）。
  - **预加载**：每次播完立即 `preloadVideo()` 预拉下一条，提升填充率（`wxAd` / `dyAd` 均新增 `preloadVideo`）。
  - 顺带修复微信 `onClose` 监听器重复叠加 bug（改具名回调 + `offClose`）。

### 3. 插屏加频控 ✅（已完成 @ commit 974307c）
- `adMgr.showChaPing` 已加：
  - **30s 频控守卫**（`chaPingCdMs = 30000`），满足微信 / 抖音 ≥30s 间隔要求。
  - **新手保护**：普通模式前 5 关不弹插屏（`chaPingFreeLevels = 5`），保次留。
  - 调用点（胜利 / 失败 / 进主界面）无需改动。

---

## 三、提升收入（核心：激励视频渗透率）

> 激励视频通常占小游戏 IAA 收入 **70%+**。

在现有 8 个点基础上，建议新增「自然给奖」入口：

- 💰 每日福利翻倍（`onDayfl` 看广告 ×2）
- 🎁 看广告免费领道具（每日限 3~5 次，养成看广告习惯）
- 🪙 金币不足时「看广告补 200 币」
- ⏰ 限时双倍金币 buff（看广告解锁 N 分钟）
- ❤️ 二次复活 / 多看一次广告续命
- 📅 签到 / 连续登录翻倍

**关注指标**：广告渗透率（看过广告用户占比）、人均观看次数（IMPU）。

---

## 四、留存优化（IAA 下：留存 = 收入）

- **新手保护**：前 3~5 关不插任何插屏，保次留
- **第 2 关「难度飙升」(240 球) 是劝退点**：
  - 早期难度曲线需压平（详见 `docs/关卡配置表.md`）
  - 否则用户没看几个广告就流失
- 插屏只在「关卡结束」等自然断点出现，并配合频控

---

## 五、数据闭环

- 加广告打点 hook：`show / fill / complete / reward` + 触发场景来源
- 上报平台或自有后台，监控：
  - ECPM、人均广告次数、各广告位收入贡献
  - 次留 / 7 留、广告渗透率
- 基于数据做 A/B（广告位位置、奖励倍数、频控阈值）

---

## 六、实施优先级（技术侧）

| 优先级 | 任务 | 收益 | 状态 |
|---|---|---|---|
| P0 | `showVideo` 健壮性改造（失败兜底 + 预加载） | 直接提升有效曝光 | ✅ 已完成 (974307c) |
| P0 | 插屏频控守卫（30s + 前 5 关新手保护） | 合规 + 保留存 | ✅ 已完成 (974307c) |
| P0 | 切换小游戏 AppID 至新账号 | 归属正确 | ✅ 构建配置已切，待重新构建 |
| P0 | 新账号后台创建广告位并回填 5 个 ID | 真正能拉到广告 | 🔧 待配置 |
| P1 | 广告打点 hook（埋点骨架） | 数据可观测 | ⬜ 未开始 |
| P1 | 广告开关 / ID 远程配置化 | 安全上线、可灰度 | ⬜ 未开始 |
| P2 | 新增激励视频入口（每日翻倍 / 看广告领道具等） | 提升渗透率与 IMPU | ⬜ 未开始 |
| P2 | 早期关卡难度曲线优化 | 保次留 | ⬜ 未开始 |

---

## 七、进度记录

- **2026-06-23**
  - P0 三件套上线（commit `974307c`）：开广告总开关、激励视频失败兜底 + 预加载、插屏 30s 频控 + 前 5 关新手保护；修微信 `onClose` 监听器叠加 bug。
  - 切换小游戏 AppID：`wx58649a9ae87e3f0e` → `wx87db04b2d6e51de1`（`profiles/v2/packages/wechatgame.json`）。
  - 核查 `wxAd.ts`：无写死 AppID。
  - **待办**：① 新账号微信广告后台创建广告位，回填 `adConfig.ts` 的 5 个 ID；② 用新 AppID 重新构建 `wechatgame`。
