/**
 * 集成测试
 * 测试整个 MCP 服务器的完整工作流程
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { handleMCPMessage } from '../../src/core/mcpServer.js';
import { TEST_TEMP_DIR } from '../setup.js';
import fs from 'fs-extra';
import path from 'path';

describe('MCP 服务器集成测试', () => {
  const testProjectRoot = TEST_TEMP_DIR;
  const testSpecName = 'integration-test-spec';
  const testCategory = 'frontend';
  const testContent = `# 集成测试规范

## 概述
这是一个用于集成测试的开发规范。

## 规则
1. 所有组件必须遵循此规范
2. 代码必须经过测试
3. 文档必须保持最新

## 示例
\`\`\`typescript
// 示例代码
const component = new MyComponent();
\`\`\`
`;

  beforeEach(async () => {
    // 确保测试目录存在并清理
    await fs.ensureDir(testProjectRoot);
    const specsDir = path.join(testProjectRoot, '.spec');
    if (await fs.pathExists(specsDir)) {
      try {
        await fs.remove(specsDir);
      } catch (error) {
        console.warn('清理测试目录失败，尝试强制删除:', error);
        await fs.emptyDir(specsDir);
        await fs.remove(specsDir);
      }
    }
  });

  afterEach(async () => {
    // 清理测试文件
    const specsDir = path.join(testProjectRoot, '.spec');
    if (await fs.pathExists(specsDir)) {
      try {
        await fs.remove(specsDir);
      } catch (error) {
        // 如果删除失败，尝试强制删除
        console.warn('清理集成测试目录失败，尝试强制删除:', error);
        await fs.emptyDir(specsDir);
        await fs.remove(specsDir);
      }
    }
  });

  describe('完整的规范管理流程', () => {
    it('应该能够创建、获取、编辑和删除规范', async () => {
      const uniqueSpecName = `${testSpecName}-${Date.now()}`;
      // 1. 初始化 MCP 服务器
      const initMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {}
      };

      const initResponse = await handleMCPMessage(initMessage);
      expect(initResponse.jsonrpc).toBe('2.0');
      expect(initResponse.result?.serverInfo?.name).toBe('spec-flow-mcp');

      // 2. 列出初始规范（应该为空）
      const listMessage = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'list_specs',
          arguments: {
            projectRoot: testProjectRoot
          }
        }
      };

      const listResponse = await handleMCPMessage(listMessage);
      expect(listResponse.result?.content[0].text).toContain('总计: 0 个规范');

      // 3. 创建新规范
      const createMessage = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'create_development_spec',
          arguments: {
            spec_name: uniqueSpecName,
            content: testContent,
            category: testCategory,
            projectRoot: testProjectRoot
          }
        }
      };

      const createResponse = await handleMCPMessage(createMessage);
      expect(createResponse.result?.content[0].text).toContain('✅');
      expect(createResponse.result?.content[0].text).toContain('成功创建规范');

      // 4. 验证规范已创建（通过列表）
      const listAfterCreateResponse = await handleMCPMessage(listMessage);
      expect(listAfterCreateResponse.result?.content[0].text).toContain('总计: 1 个规范');
      expect(listAfterCreateResponse.result?.content[0].text).toContain(`${uniqueSpecName} (${testCategory})`);

      // 5. 获取规范内容
      const getMessage = {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'get_development_spec',
          arguments: {
            spec_name: uniqueSpecName,
            category: testCategory,
            projectRoot: testProjectRoot
          }
        }
      };

      const getResponse = await handleMCPMessage(getMessage);
        expect(getResponse.result?.content[0].text).toContain(uniqueSpecName);
      expect(getResponse.result?.content[0].text).toContain('集成测试规范');
      expect(getResponse.result?.content[0].text).toContain('示例代码');

      // 6. 编辑规范
      const updatedContent = testContent + '\n\n## 更新\n\n这是更新后的内容。';
      const editMessage = {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'edit_development_spec',
          arguments: {
            spec_name: uniqueSpecName,
            content: updatedContent,
            category: testCategory,
            projectRoot: testProjectRoot
          }
        }
      };

      const editResponse = await handleMCPMessage(editMessage);
      expect(editResponse.result?.content[0].text).toContain('✅');
      expect(editResponse.result?.content[0].text).toContain('成功编辑规范');

      // 7. 验证规范已更新
      const getUpdatedResponse = await handleMCPMessage(getMessage);
      expect(getUpdatedResponse.result?.content[0].text).toContain('更新后的内容');

      // 8. 删除规范
      const deleteMessage = {
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: {
          name: 'delete_development_spec',
          arguments: {
            spec_name: uniqueSpecName,
            category: testCategory,
            projectRoot: testProjectRoot
          }
        }
      };

      const deleteResponse = await handleMCPMessage(deleteMessage);
      expect(deleteResponse.result?.content[0].text).toContain('✅');
      expect(deleteResponse.result?.content[0].text).toContain('成功删除规范');

      // 9. 验证规范已删除
      const listAfterDeleteResponse = await handleMCPMessage(listMessage);
      expect(listAfterDeleteResponse.result?.content[0].text).toContain('总计: 0 个规范');
    });

    it('应该能够处理多个分类的规范', async () => {
      const timestamp = Date.now();
      const specs = [
        { name: `frontend-spec-${timestamp}`, category: 'frontend', content: '# 前端规范\n\n前端开发规范。' },
        { name: `backend-spec-${timestamp}`, category: 'backend', content: '# 后端规范\n\n后端开发规范。' },
        { name: `mobile-spec-${timestamp}`, category: 'mobile', content: '# 移动端规范\n\n移动端开发规范。' },
        { name: `design-spec-${timestamp}`, category: 'design', content: '# 设计规范\n\n设计开发规范。' }
      ];

      // 创建多个规范
      for (const spec of specs) {
        const createMessage = {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'create_development_spec',
            arguments: {
              spec_name: spec.name,
              content: spec.content,
              category: spec.category,
              projectRoot: testProjectRoot
            }
          }
        };

        const response = await handleMCPMessage(createMessage);
        expect(response.result?.content[0].text).toContain('✅');
      }

      // 列出所有规范
      const listMessage = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'list_specs',
          arguments: {
            projectRoot: testProjectRoot
          }
        }
      };

      const listResponse = await handleMCPMessage(listMessage);
      expect(listResponse.result?.content[0].text).toContain('总计: 4 个规范');

      // 验证每个分类的规范都存在
      for (const spec of specs) {
        expect(listResponse.result?.content[0].text).toContain(`${spec.name} (${spec.category})`);
      }

      // 获取每个规范的内容
      for (const spec of specs) {
        const getMessage = {
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'get_development_spec',
            arguments: {
              spec_name: spec.name,
              category: spec.category,
              projectRoot: testProjectRoot
            }
          }
        };

        const getResponse = await handleMCPMessage(getMessage);
        expect(getResponse.result?.content[0].text).toContain(spec.name);
        expect(getResponse.result?.content[0].text).toContain(spec.content);
      }
    });

    it('应该能够处理错误情况', async () => {
      const uniqueSpecName = `${testSpecName}-error-${Date.now()}`;
      // 1. 尝试获取不存在的规范
      const getNonExistentMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'get_development_spec',
          arguments: {
            spec_name: 'non-existent-spec',
            category: testCategory,
            projectRoot: testProjectRoot
          }
        }
      };

      const getNonExistentResponse = await handleMCPMessage(getNonExistentMessage);
      expect(getNonExistentResponse.result?.content[0].text).toContain('❌');

      // 2. 尝试编辑不存在的规范
      const editNonExistentMessage = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'edit_development_spec',
          arguments: {
            spec_name: 'non-existent-spec',
            content: 'new content',
            category: testCategory,
            projectRoot: testProjectRoot
          }
        }
      };

      const editNonExistentResponse = await handleMCPMessage(editNonExistentMessage);
      expect(editNonExistentResponse.result?.content[0].text).toContain('❌');
      expect(editNonExistentResponse.result?.content[0].text).toContain('不存在');

      // 3. 尝试删除不存在的规范
      const deleteNonExistentMessage = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'delete_development_spec',
          arguments: {
            spec_name: 'non-existent-spec',
            category: testCategory,
            projectRoot: testProjectRoot
          }
        }
      };

      const deleteNonExistentResponse = await handleMCPMessage(deleteNonExistentMessage);
      expect(deleteNonExistentResponse.result?.content[0].text).toContain('❌');
      expect(deleteNonExistentResponse.result?.content[0].text).toContain('不存在');

      // 4. 创建规范后尝试再次创建同名规范
      const createMessage = {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'create_development_spec',
          arguments: {
            spec_name: uniqueSpecName,
            content: testContent,
            category: testCategory,
            projectRoot: testProjectRoot
          }
        }
      };

      // 第一次创建应该成功
      const firstCreateResponse = await handleMCPMessage(createMessage);
      expect(firstCreateResponse.result?.content[0].text).toContain('✅');

      // 第二次创建应该失败
      const secondCreateResponse = await handleMCPMessage(createMessage);
      expect(secondCreateResponse.result?.content[0].text).toContain('❌');
      expect(secondCreateResponse.result?.content[0].text).toContain('已存在');
    });

    it('应该能够处理无效参数', async () => {
      const uniqueSpecName = `${testSpecName}-invalid-${Date.now()}`;
      // 1. 空规范名称
      const emptyNameMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'create_development_spec',
          arguments: {
            spec_name: '',
            content: testContent,
            projectRoot: testProjectRoot
          }
        }
      };

      const emptyNameResponse = await handleMCPMessage(emptyNameMessage);
      expect(emptyNameResponse.result?.content[0].text).toContain('❌');

      // 2. 空内容
      const emptyContentMessage = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'create_development_spec',
          arguments: {
            spec_name: uniqueSpecName,
            content: '',
            projectRoot: testProjectRoot
          }
        }
      };

      const emptyContentResponse = await handleMCPMessage(emptyContentMessage);
      expect(emptyContentResponse.result?.content[0].text).toContain('❌');

      // 3. 空项目根目录
      const emptyProjectRootMessage = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'create_development_spec',
          arguments: {
            spec_name: uniqueSpecName,
            content: testContent,
            projectRoot: ''
          }
        }
      };

      const emptyProjectRootResponse = await handleMCPMessage(emptyProjectRootMessage);
      expect(emptyProjectRootResponse.result?.content[0].text).toContain('❌');
    });
  });

  describe('MCP 协议兼容性', () => {
    it('应该正确响应工具列表请求', async () => {
      const toolsListMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      };

      const response = await handleMCPMessage(toolsListMessage);
      
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result).toBeDefined();
      expect(response.result.tools).toBeDefined();
      expect(Array.isArray(response.result.tools)).toBe(true);

      // 验证每个工具都有正确的结构
      for (const tool of response.result.tools) {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(tool.inputSchema).toHaveProperty('type', 'object');
        expect(tool.inputSchema).toHaveProperty('properties');
        expect(tool.inputSchema).toHaveProperty('required');
      }
    });

    it('应该正确处理未知方法', async () => {
      const unknownMethodMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'unknown/method',
        params: {}
      };

      const response = await handleMCPMessage(unknownMethodMessage);
      
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32601);
      expect(response.error?.message).toContain('Unknown method');
    });

    it('应该正确处理未知工具', async () => {
      const unknownToolMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'unknown_tool',
          arguments: {}
        }
      };

      const response = await handleMCPMessage(unknownToolMessage);
      
      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32601);
      expect(response.error?.message).toContain('Unknown tool');
    });
  });
});
