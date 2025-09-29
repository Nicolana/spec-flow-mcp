# MCP Tools 开发流程规范

## 概述

本规范描述了在 MCP (Model Context Protocol) 服务器中开发 Tools 的标准流程，基于 spec-flow-mcp 项目的实际实现。

## 架构设计

### 分层架构
```
index.ts (入口层)
  ↓
mcpServer.ts (协议层)
  ↓
specService.ts (业务层)
  ↓
fileSystem.ts (工具层)
```

## Tool 开发流程

### 1. 定义 Tool Schema

在 `mcpServer.ts` 的 `MCP_TOOLS` 数组中定义 Tool：

```typescript
{
  name: 'tool_name',
  description: 'Tool 功能描述',
  inputSchema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: '参数描述'
      },
      param2: {
        type: 'string',
        enum: ['option1', 'option2'],
        default: 'option1',
        description: '可选参数描述'
      }
    },
    required: ['param1']
  }
}
```

**规范要点：**
- Tool 名称使用 snake_case 命名
- description 必须简洁明确地描述功能
- 必须定义完整的 inputSchema，包含所有参数的类型和描述
- required 数组必须包含所有必需参数
- 可选参数应设置合理的默认值

### 2. 创建业务接口类型

在 `types/index.ts` 中定义请求和响应类型：

```typescript
// 请求类型
export interface ToolRequest {
  param1: string;
  param2?: 'option1' | 'option2';
}

// 响应类型
export interface ToolResponse {
  result: any;
  success: boolean;
  message?: string;
}
```

**规范要点：**
- 请求类型命名为 `{ToolName}Request`
- 响应类型命名为 `{ToolName}Response`
- 可选参数使用 `?` 标记
- 枚举类型必须明确定义所有可能值

### 3. 实现业务逻辑

在 `specService.ts` 中实现核心业务逻辑：

```typescript
export async function toolFunction(request: ToolRequest): Promise<ToolResponse> {
  const { param1, param2 = 'option1' } = request;
  
  logger.info(`执行工具: ${param1} (${param2})`);
  
  try {
    // 参数验证
    if (!param1 || param1.trim() === '') {
      throw new Error('参数1不能为空');
    }
    
    // 业务逻辑实现
    const result = await performBusinessLogic(param1, param2);
    
    // 返回结果
    return {
      result,
      success: true,
      message: '操作成功'
    };
  } catch (error) {
    logger.error(`工具执行失败: ${param1}`, error as Error);
    throw error;
  }
}
```

**规范要点：**
- 函数名使用 camelCase，与 Tool 名称对应
- 必须进行参数验证，提供清晰的错误信息
- 使用 logger 记录关键操作和错误
- 统一的错误处理模式
- 必须返回规范的响应格式

### 4. 注册 Tool 调用处理

在 `mcpServer.ts` 的 `handleToolCall` 函数中添加 case：

```typescript
case 'tool_name':
  const toolResult = await toolFunction({
    param1: toolArgs.param1 || '',
    param2: toolArgs.param2 || 'option1'
  });
  
  return {
    jsonrpc: '2.0',
    id: requestId,
    result: {
      content: [
        {
          type: 'text',
          text: formatToolResponse(toolResult)
        }
      ]
    }
  };
```

**规范要点：**
- case 名称必须与 Tool Schema 中的 name 完全一致
- 必须提供参数默认值，确保兼容性
- 统一的响应格式，使用 content 数组
- 错误处理在上层 try-catch 中统一处理

### 5. 在入口文件中声明

在 `index.ts` 的 tools 数组中添加 Tool 定义：

```typescript
{
  name: 'tool_name',
  description: 'Tool 功能描述',
  inputSchema: {
    // 与 mcpServer.ts 中定义保持一致
  }
}
```

**规范要点：**
- 必须与 mcpServer.ts 中的定义完全一致
- 避免重复定义，考虑抽取为共享配置

## 错误处理规范

### 1. 业务层错误处理

```typescript
// 参数验证错误
if (!param || param.trim() === '') {
  throw new Error('参数不能为空');
}

// 业务逻辑错误
if (!await resourceExists(param)) {
  throw new Error(`资源不存在: ${param}`);
}
```

### 2. 协议层错误处理

```typescript
try {
  const result = await businessFunction(args);
  return successResponse(result);
} catch (error) {
  logger.error(`工具调用失败: ${toolName}`, error as Error);
  
  return {
    jsonrpc: '2.0',
    id: requestId,
    result: {
      content: [
        {
          type: 'text',
          text: `❌ 操作失败：${(error as Error).message}\n\n💡 解决方案：\n1. 检查参数是否正确\n2. 确认资源是否存在`
        }
      ]
    }
  };
}
```

## 响应格式规范

### 1. 成功响应

```typescript
{
  jsonrpc: '2.0',
  id: requestId,
  result: {
    content: [
      {
        type: 'text',
        text: `✅ 操作成功: ${operationName}\n\n📋 详细信息：\n- 结果: ${result}\n- 状态: 完成`
      }
    ]
  }
}
```

### 2. 失败响应

```typescript
{
  jsonrpc: '2.0',
  id: requestId,
  result: {
    content: [
      {
        type: 'text',
        text: `❌ 操作失败：${errorMessage}\n\n💡 解决方案：\n1. 具体解决步骤\n2. 备选方案`
      }
    ]
  }
}
```

**规范要点：**
- 使用 emoji 提升用户体验
- 成功使用 ✅，失败使用 ❌
- 提供详细的状态信息和操作指导
- 失败时必须提供解决方案建议

## 文件系统工具规范

### 1. 路径处理

```typescript
// 使用统一的路径获取函数
const filePath = getSpecFilePath(name, category, projectRoot);

// 确保目录存在
await ensureSpecsDirectory(projectRoot);
```

### 2. 文件操作

```typescript
// 检查文件存在性
if (!await specFileExists(name, category, projectRoot)) {
  throw new Error(`文件不存在: ${name}`);
}

// 安全的文件读写
const content = await readSpecFile(name, category, projectRoot);
await writeSpecFile(name, content, category, projectRoot);
```

## 日志记录规范

### 1. 日志级别使用

```typescript
// 关键操作记录
logger.info(`开始执行: ${operationName} - 参数: ${JSON.stringify(params)}`);

// 调试信息
logger.debug(`处理步骤: ${stepName} - 状态: ${status}`);

// 错误记录
logger.error(`操作失败: ${operationName}`, error as Error);
```

### 2. 日志内容规范

- info: 记录关键业务操作的开始和结果
- debug: 记录详细的处理步骤和状态变化
- error: 记录所有异常情况，包含错误对象

## 测试和验证

### 1. 参数验证测试

- 测试必需参数缺失情况
- 测试参数类型错误情况
- 测试参数值边界情况

### 2. 业务逻辑测试

- 测试正常流程
- 测试异常情况处理
- 测试错误响应格式

### 3. 集成测试

- 测试完整的 MCP 协议交互
- 验证响应格式符合规范
- 测试多工具协同工作

## 性能优化建议

1. **异步操作优化**：合理使用 async/await，避免不必要的阻塞
2. **参数验证前置**：在业务逻辑执行前完成所有验证
3. **错误信息缓存**：对于重复的错误信息，考虑使用模板
4. **文件系统操作优化**：批量操作时考虑并发处理

## 版本管理

1. **向后兼容性**：新版本必须兼容旧版本的调用方式
2. **参数扩展**：新增参数应设置合理默认值
3. **废弃功能处理**：标记废弃功能并提供迁移指导

## 实际项目示例

基于 spec-flow-mcp 项目的四个核心工具：

### 1. get_development_spec
- **功能**: 获取指定开发规范内容
- **参数**: spec_name, category, projectRoot
- **特点**: 支持分类查找，返回完整规范内容

### 2. list_specs  
- **功能**: 列出所有可用开发规范
- **参数**: projectRoot
- **特点**: 返回规范列表和统计信息

### 3. create_development_spec
- **功能**: 创建新的开发规范
- **参数**: spec_name, content, category, projectRoot
- **特点**: 不允许覆盖已存在规范，确保数据安全

### 4. edit_development_spec
- **功能**: 编辑已存在的开发规范
- **参数**: spec_name, content, category, projectRoot
- **特点**: 只能修改现有规范，防止误操作

---

本规范基于 spec-flow-mcp v1.0.0 制定，随项目演进持续更新。