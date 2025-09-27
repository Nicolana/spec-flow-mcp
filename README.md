# Spec Flow MCP

🤖 **AI Infra 开发规范治理工具**

> 🌐 **官网**: [https://www.flowspec.online/](https://www.flowspec.online/)

一个基于 MCP (Model Context Protocol) 的智能开发规范管理系统，通过 AI 驱动的规范治理，帮助团队降低返工成本，提高代码一致性，缩短新成员上手时间。

**MCP-Powered Project Memory for AI Agents** - 直接集成到 Cursor、Claude、Cline、CodeX 等 AI 开发工具中，为 AI 代理提供持久的项目记忆，确保一致的编码标准，防止代码偏移，并在大型项目中维护架构完整性。

## 🎯 核心价值

### 🔄 降低返工成本
- 自动化规范检查和提醒
- 预防不一致的代码风格和架构决策
- 减少代码评审中的重复性问题

### 📏 提高代码一致性  
- 统一的开发规范和最佳实践
- 标准化的组件开发模式
- 一致的项目结构和命名约定

### ⚡ 缩短上手时间
- 新成员快速了解项目规范
- 交互式规范查询和学习
- AI 辅助的规范应用指导

## 🚀 功能特性

- 🤖 **MCP 协议集成**: 与 AI 助手无缝对接，提供智能规范查询
- 📝 **规范全生命周期管理**: 创建、编辑、查询、版本控制
- 💾 **本地文件存储**: 在项目根目录自动创建 `spec` 目录，规范与项目同步
- 🔧 **TypeScript 支持**: 类型安全，开发体验优秀
- 📦 **现代 Node.js 技术栈**: 高性能、易维护
- 🔗 **多工具兼容性**: 可与 Cursor、Claude Desktop、Cline、CodeX 等任何 MCP 兼容的 AI 开发环境无缝协作
- 🏢 **企业级项目支持**: 专为百万行代码的企业级代码库设计，支持复杂的微服务架构和分布式团队

## 🌟 为什么选择 SpecFlow AI

### 解决 AI 辅助开发中的核心挑战

1. **🚫 终结遗留项目中的 AI 代码混乱**
   - 终结 AI 代理在复杂项目中生成不一致代码的困扰
   - 提供现有模式、技术债务和架构决策的上下文

2. **📏 在所有 AI 工具中强制执行编码标准**
   - 无论使用 Cursor、Claude 还是 Cline，所有 AI 代理都遵循相同的项目约定
   - 消除不一致的变量命名、文件结构或架构模式

3. **⭐ 完美适配前端开发团队**
   - 专为 React、Vue、Angular 项目优化，确保一致性至关重要
   - 确保组件模式、状态管理方法和样式约定在代码库中保持统一

4. **🏗️ 企业级项目记忆**
   - 自信地处理大型代码库，从小团队扩展到数百名开发人员
   - 在所有项目中保持一致的 AI 辅助开发实践

## 安装

```bash
pnpm install
```

## 开发

```bash
# 开发模式
pnpm dev

# 构建
pnpm build

# 生产运行
pnpm start
```

## 🚀 快速开始

### 通过 npx 直接使用（推荐）
```bash
# 直接运行最新版本
npx spec-flow-mcp@latest

# 或者指定版本
npx spec-flow-mcp@1.0.0
```

### 在 MCP 客户端中配置
在支持 MCP 的 AI 编辑器（如 Cursor）的配置文件中添加：

```json
{
  "mcpServers": {
    "spec-flow-mcp": {
      "command": "npx",
      "args": ["spec-flow-mcp@latest"]
    }
  }
}
```

## 🔧 开发和调试

### 方法一：使用 pnpm 脚本
```bash
# 开发模式（实时重载）
pnpm dev

# 构建后运行
pnpm build && pnpm start
```

### 方法二：本地开发调试
```bash
# 使用 tsx 运行 TypeScript
npx tsx src/index.ts

# 或者构建后运行
pnpm build && node dist/index.js
```

### 方法三：VS Code 调试
1. 打开 VS Code
2. 按 `F5` 或选择"运行和调试"
3. 选择"调试 MCP 服务器"配置

### 方法四：环境变量调试
```bash
# 启用详细日志
LOG_LEVEL=DEBUG pnpm dev

# 指定自定义端口（如果需要）
PORT=3000 LOG_LEVEL=DEBUG pnpm dev
```

## 🛠️ MCP 工具 API

| 工具名称 | 功能描述 | 参数 |
|---------|---------|------|
| `get_development_spec` | 获取指定的开发规范 | `spec_name`, `category?` |
| `list_specs` | 列出所有可用的规范 | 无 |
| `create_development_spec` | 创建新的开发规范 | `spec_name`, `content`, `category?` |
| `edit_development_spec` | 编辑已存在的规范 | `spec_name`, `content`, `category?` |

### 支持的规范分类
- `frontend`: 前端开发规范（默认）
- `backend`: 后端开发规范  
- `mobile`: 移动端开发规范
- `design`: 设计规范

## 📁 文件结构

```
spec-flow-mcp/
├── src/
│   ├── core/           # 核心业务逻辑
│   │   ├── mcpServer.ts    # MCP 服务器实现
│   │   └── specService.ts  # 规范服务逻辑
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   │   ├── fileSystem.ts   # 文件系统操作
│   │   └── logger.ts       # 日志工具
│   └── index.ts        # 应用入口点
├── spec/              # 自动创建的规范存储目录
└── dist/              # 构建输出目录
```

## 💡 使用场景

### 1. AI 助手集成
在 Cursor、VS Code 等支持 MCP 的 AI 编辑器中：
```
用户: "获取表格组件的开发规范"
AI: 调用 get_development_spec("spttable") → 返回详细规范
```

### 2. 团队规范管理
```bash
# 创建新的组件规范
create_development_spec("新组件名", "规范内容")

# 查看所有现有规范
list_specs()

# 更新规范内容
edit_development_spec("组件名", "更新后的内容")
```

### 3. 新成员快速上手
新团队成员可以通过 AI 助手快速查询：
- 项目的编码规范
- 组件开发模式
- 最佳实践指南

## 🔍 工作原理

1. **规范存储**: 所有规范以 Markdown 格式存储在项目的 `spec/` 目录
2. **MCP 协议**: 通过标准 MCP 协议与 AI 助手通信
3. **智能检索**: AI 助手可以根据上下文智能查询相关规范
4. **实时同步**: 规范更新即时生效，团队成员立即可用

该工具让开发规范从静态文档变成了可交互、可查询的知识库，真正实现了 AI 驱动的开发规范治理。

## 📦 发布到 npm

### 发布步骤
```bash
# 1. 确保已构建
pnpm build

# 2. 登录 npm（如果还没有登录）
npm login

# 3. 发布包
npm publish

# 4. 发布带标签的版本（可选）
npm publish --tag latest
```

### 版本管理
```bash
# 升级版本
npm version patch   # 1.0.0 -> 1.0.1
npm version minor   # 1.0.1 -> 1.1.0
npm version major   # 1.1.0 -> 2.0.0

# 发布新版本
npm publish
```

发布后，用户就可以通过 `npx spec-flow-mcp@latest` 直接使用你的工具了！

## 🌐 更多信息

- **官网**: [https://www.flowspec.online/](https://www.flowspec.online/)
- **产品介绍**: 查看完整的 SpecFlow AI 功能介绍和最新动态
- **社区**: 加入我们的社区，与其他开发者分享经验和最佳实践

### 🚀 即将推出

我们正在完善基于 MCP 的集成功能，这将彻底改变你的 AI 开发工具理解项目的方式。关注我们的官网获取最新进展，成为首批体验一致、上下文感知的 AI 编码辅助的用户。

---

**让我们一起终结项目中的 AI 代码混乱！** 🎯
