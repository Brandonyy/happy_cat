# MCP 工具选型调研

> 调研日期：2026-06-18
> 目的：为萌兵出击（Cocos Creator 3.8.2）选择合适的 MCP（Model Context Protocol）扩展，以支持 AI 辅助开发工作流。

---

## 候选项目概览

| 项目 | 作者 | 协议 | CC 版本要求 | 工具数量 | 综合评价 |
|------|------|------|------------|---------|---------|
| [mcp-bridge](https://github.com/firekula/mcp-bridge) | firekula | AGPL-3.0 | 2.4.x | 31 | 版本不兼容 |
| [cocos-creator-mcp](https://github.com/harady/cocos-creator-mcp) | harady | MIT | 3.8+ | 64 | **首推** |
| [funplay-cocos-mcp](https://github.com/FunplayAI/funplay-cocos-mcp) | FunplayAI | MIT | 3.8+ | 101/37 | 备选 |
| [cocos-mcp-server](https://github.com/DaxianLee/cocos-mcp-server) | DaxianLee | 非商用 | 3.8.6+ | 50 | 许可证+版本双重不兼容 |

---

## 逐项分析

### 1. firekula/mcp-bridge — 排除

- 针对 Cocos Creator **2.4.x** 设计，API 与 3.x 完全不兼容
- 许可证为 AGPL-3.0，商业项目使用存在传染性风险
- 结论：**直接排除**

---

### 2. DaxianLee/cocos-mcp-server — 排除

**功能层面**（最完整）：
- 50 个核心工具，覆盖场景、节点、组件、预制体、资源管理等 99% 编辑器操作
- Vue 3 面板，category_action 操作码统一，token 消耗低
- 已在 Cocos Store 上架（v1.5.0），有商业化背书

**排除原因（双重问题）**：
1. **版本不兼容**：要求 CC 3.8.6+，本项目为 3.8.2，无法直接使用
2. **许可证不可商用**：明确"禁止任何商用、转售"，萌兵出击作为商业项目不能使用

---

### 3. harady/cocos-creator-mcp — **首选推荐**

**基本信息**：
- 仓库：https://github.com/harady/cocos-creator-mcp
- 当前版本：v2.0.0（经历 v1.x → v2.x 重大重构）
- 许可证：**MIT**（商业使用无限制）

**核心优势**：
- 支持 CC **3.8+**，与本项目 3.8.2 完全匹配
- v2.0.0 将工具从 166 个精简为 64 个，采用统一的 `category_action` 命名规范
- **357+ 回归测试**，稳定性有保障
- 支持中文/英文/日文三语言工具描述，AI 理解更准确
- 预制体工作流完备（进入编辑模式、实例化、应用更改、解除链接），与本项目 38 个 UI 层预制体重度使用场景高度匹配

**工具分类**：
| 类别 | 代表工具 | 与本项目的关联 |
|------|---------|--------------|
| 场景管理 | scene_management, scene_hierarchy | 主场景 + 动态加载 UI 层 |
| 节点操作 | node_query, node_lifecycle, node_transform | 38 个 UI prefab 调试 |
| 组件操作 | component_manage, set_component_property | TS 组件挂载与属性调整 |
| 预制体 | prefab_lifecycle, prefab_instance, prefab_edit | 核心使用场景 |
| 资源管理 | asset_query, asset_operations | 978 张图、163 个 prefab 管理 |
| 调试 | debug_console, debug_logs | 游戏运行时日志分析 |
| 项目控制 | project_manage | 构建/运行 |

---

### 4. FunplayAI/funplay-cocos-mcp — 备选

**基本信息**：
- 仓库：https://github.com/FunplayAI/funplay-cocos-mcp
- 当前版本：v0.4.0（较新，活跃开发中）
- 许可证：**MIT**（商业使用无限制）

**特点**：
- Full 模式 101 个工具 / Core 模式 37 个工具，按需切换
- 提供 `execute_javascript` 工具，可直接在编辑器内执行任意 JS 代码，灵活性极高
- 配置引导完善，一键式安装

**弱点**：
- v0.4.0 版本相对年轻，测试覆盖不及 harady
- `execute_javascript` 的高灵活性也意味着更高风险（无类型约束）

---

## 最终建议

**首选：harady/cocos-creator-mcp**

理由：
1. MIT 协议，商业项目零风险
2. CC 3.8.2 完全兼容
3. 测试覆盖最完整（357+），生产环境稳定可用
4. 预制体工作流与本项目高度匹配
5. 已发布稳定 v2.0.0，接口设计成熟

**后续可叠加：funplay-cocos-mcp**

如需要 `execute_javascript` 的高灵活调试能力（例如运行时注入逻辑、批量修改配置表数据等），可在 harady 基础上额外安装 funplay 的 Core 模式扩展。

---

## 安装方式（harady/cocos-creator-mcp）

```bash
# 1. 克隆到项目扩展目录
cd D:\cocos\danke\extensions
git clone https://github.com/harady/cocos-creator-mcp.git

# 2. 安装依赖
cd cocos-creator-mcp
npm install

# 3. 重启 Cocos Creator 或在扩展管理器中刷新
```

**WorkBuddy MCP 配置**（加入 `~/.workbuddy/mcp.json`）：

```json
{
  "mcpServers": {
    "cocos-creator": {
      "type": "http",
      "url": "http://127.0.0.1:3000/mcp"
    }
  }
}
```

启动扩展后默认监听 `http://localhost:3000/mcp`，在 WorkBuddy 连接器管理中信任该服务即可。
