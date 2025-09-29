# Spec Flow MCP 测试套件

这个目录包含了 Spec Flow MCP 项目的完整测试套件，用于验证所有功能的正确性。

## 测试结构

```text
test/
├── setup.ts                    # 测试环境设置
├── run-tests.ts               # 测试运行脚本
├── README.md                  # 测试说明文档
├── utils/
│   └── fileSystem.test.ts     # 文件系统工具测试
├── core/
│   ├── specService.test.ts    # 规范服务测试
│   └── mcpServer.test.ts      # MCP 服务器测试
└── integration/
    └── integration.test.ts    # 集成测试
```

## 测试类型

### 1. 单元测试

- **文件系统工具测试** (`utils/fileSystem.test.ts`)
  - 测试文件系统操作功能
  - 验证规范文件的创建、读取、更新、删除
  - 测试目录管理和文件列表功能

- **规范服务测试** (`core/specService.test.ts`)
  - 测试规范服务的业务逻辑
  - 验证参数验证和错误处理
  - 使用 Mock 隔离外部依赖

- **MCP 服务器测试** (`core/mcpServer.test.ts`)
  - 测试 MCP 协议消息处理
  - 验证工具调用和响应格式
  - 测试错误处理和异常情况

### 2. 集成测试

- **完整工作流程测试** (`integration/integration.test.ts`)
  - 测试从创建到删除的完整规范管理流程
  - 验证多分类规范管理
  - 测试错误情况和边界条件
  - 验证 MCP 协议兼容性

## 运行测试

### 安装依赖

```bash
npm install
```

### 运行所有测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试（一次性）
npm run test:run
```

### 运行特定类型的测试

```bash
# 只运行单元测试
npm run test:unit

# 只运行集成测试
npm run test:integration

# 监视模式运行测试
npm run test:watch

# 使用 UI 界面运行测试
npm run test:ui
```

### 使用测试运行脚本

```bash
# 使用自定义测试运行脚本
npx tsx test/run-tests.ts
```

## 测试配置

### Vitest 配置

测试使用 Vitest 作为测试框架，配置文件为 `vitest.config.ts`：

- 支持 TypeScript
- 全局测试环境设置
- 代码覆盖率报告
- 路径别名支持

### 测试环境设置

`test/setup.ts` 文件提供了：

- 测试前/后的清理工作
- 临时目录管理
- 全局测试配置

## 测试覆盖范围

测试套件覆盖以下功能：

### ✅ 已覆盖功能

1. **文件系统操作**
   - 规范文件创建、读取、更新、删除
   - 目录管理和文件列表
   - 文件存在性检查
   - 路径处理

2. **规范服务**
   - 获取开发规范
   - 创建新规范
   - 编辑现有规范
   - 删除规范
   - 列出所有规范
   - 参数验证和错误处理

3. **MCP 服务器**
   - 协议消息处理
   - 工具列表响应
   - 工具调用处理
   - 错误响应格式
   - 未知方法和工具处理

4. **集成测试**
   - 完整的规范管理流程
   - 多分类规范支持
   - 错误情况处理
   - MCP 协议兼容性

### 🎯 测试目标

- **代码覆盖率**: 目标 > 90%
- **功能覆盖率**: 100% 核心功能
- **错误处理**: 所有错误路径都有测试
- **边界条件**: 参数验证和边界情况

## 测试数据

测试使用临时目录 (`test-temp/`) 来避免影响实际文件系统：

- 每个测试前自动清理
- 测试后自动清理
- 隔离的测试环境

## 持续集成

测试套件设计为支持 CI/CD 环境：

- 无外部依赖
- 可重复运行
- 清晰的错误报告
- 覆盖率报告生成

## 故障排除

### 常见问题

1. **测试失败**: 检查临时目录权限
2. **覆盖率报告**: 确保安装了 `@vitest/coverage-v8`
3. **TypeScript 错误**: 检查 `tsconfig.json` 配置

### 调试测试

```bash
# 运行单个测试文件
npx vitest test/utils/fileSystem.test.ts

# 调试模式运行
npx vitest --inspect-brk test/utils/fileSystem.test.ts

# 详细输出
npx vitest --reporter=verbose
```

## 贡献指南

添加新测试时请遵循：

1. 使用描述性的测试名称
2. 包含正面和负面测试用例
3. 使用适当的 Mock 和 Stub
4. 保持测试的独立性
5. 更新此文档
