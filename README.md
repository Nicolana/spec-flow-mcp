# Spec Flow MCP

开发规范 MCP 服务 - Node.js 版本

## 功能特性

- 🚀 基于 MCP (Model Context Protocol) 协议
- 📝 支持开发规范的创建、编辑、查询和列表功能
- 💾 本地文件存储，在项目根目录创建 `spec` 目录
- 🔧 TypeScript 支持
- 📦 现代 Node.js 技术栈

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

## MCP 工具

- `get_development_spec`: 获取开发规范
- `list_specs`: 列出所有可用的开发规范
- `create_development_spec`: 创建新的开发规范
- `edit_development_spec`: 编辑已存在的开发规范

## 使用

该服务会在运行时自动在项目根目录创建 `spec` 目录来存储规范文件。
