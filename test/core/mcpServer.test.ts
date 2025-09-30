/**
 * MCP 服务器测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleMCPMessage } from '../../src/core/mcpServer.js';
import { TEST_TEMP_DIR } from '../setup.js';

// Mock 规范服务
vi.mock('../../src/core/specService.js', () => ({
  getdevelopmentSpec: vi.fn(),
  createDevelopmentSpec: vi.fn(),
  editDevelopmentSpec: vi.fn(),
  deleteDevelopmentSpec: vi.fn(),
  listAvailableSpecs: vi.fn()
}));

import {
  getdevelopmentSpec,
  createDevelopmentSpec,
  editDevelopmentSpec,
  deleteDevelopmentSpec,
  listAvailableSpecs
} from '../../src/core/specService.js';

describe('MCP 服务器', () => {
  const testProjectRoot = TEST_TEMP_DIR;
  const testSpecName = 'test-spec';
  const testContent = '# 测试规范\n\n这是一个测试规范文件。';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleMCPMessage', () => {
    describe('initialize 方法', () => {
      it('应该返回正确的初始化响应', async () => {
        const message = {
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {}
        };

        const response = await handleMCPMessage(message);

        expect(response).toEqual({
          jsonrpc: '2.0',
          id: 1,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'spec-flow-mcp',
              version: '1.0.0'
            }
          }
        });
      });
    });

    describe('tools/list 方法', () => {
      it('应该返回工具列表', async () => {
        const message = {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list',
          params: {}
        };

        const response = await handleMCPMessage(message);

        expect(response.jsonrpc).toBe('2.0');
        expect(response.id).toBe(1);
        expect(response.result).toBeDefined();
        expect(response.result.tools).toBeDefined();
        expect(Array.isArray(response.result.tools)).toBe(true);
        expect(response.result.tools.length).toBeGreaterThan(0);

        // 验证工具定义
        const toolNames = response.result.tools.map((tool: any) => tool.name);
        expect(toolNames).toContain('get_development_spec');
        expect(toolNames).toContain('list_specs');
        expect(toolNames).toContain('create_development_spec');
        expect(toolNames).toContain('edit_development_spec');
        expect(toolNames).toContain('delete_development_spec');
      });
    });

    describe('tools/call 方法', () => {
      describe('get_development_spec 工具', () => {
        it('应该成功获取规范', async () => {
          const mockSpecResponse = {
            spec_name: testSpecName,
            content: testContent,
            file_path: '/test/path/spec.md'
          };

          vi.mocked(getdevelopmentSpec).mockResolvedValue(mockSpecResponse);

          const message = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'get_development_spec',
              arguments: {
                spec_name: testSpecName,
                projectRoot: testProjectRoot
              }
            }
          };

          const response = await handleMCPMessage(message);

          expect(response.jsonrpc).toBe('2.0');
          expect(response.id).toBe(1);
          expect(response.result).toBeDefined();
          expect(response.result.content).toBeDefined();
          expect(response.result.content[0].type).toBe('text');
          expect(response.result.content[0].text).toContain(testSpecName);
          expect(response.result.content[0].text).toContain(testContent);

          expect(getdevelopmentSpec).toHaveBeenCalledWith({
            spec_name: testSpecName,
            projectRoot: testProjectRoot
          });
        });

        it('应该在获取规范失败时返回错误信息', async () => {
          vi.mocked(getdevelopmentSpec).mockRejectedValue(new Error('规范文件不存在'));

          const message = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'get_development_spec',
              arguments: {
                spec_name: testSpecName,
                projectRoot: testProjectRoot
              }
            }
          };

          const response = await handleMCPMessage(message);

          expect(response.jsonrpc).toBe('2.0');
          expect(response.id).toBe(1);
          expect(response.result).toBeDefined();
          expect(response.result.content[0].text).toContain('❌');
          expect(response.result.content[0].text).toContain('规范文件不存在');
        });
      });

      describe('list_specs 工具', () => {
        it('应该成功列出规范', async () => {
          const mockListResponse = {
            total: 2,
            specs: [
              { name: 'spec1', file_path: '/path/spec1.md' },
              { name: 'spec2', file_path: '/path/spec2.md' }
            ]
          };

          vi.mocked(listAvailableSpecs).mockResolvedValue(mockListResponse);

          const message = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'list_specs',
              arguments: {
                projectRoot: testProjectRoot
              }
            }
          };

          const response = await handleMCPMessage(message);

          expect(response.jsonrpc).toBe('2.0');
          expect(response.id).toBe(1);
          expect(response.result).toBeDefined();
          expect(response.result.content[0].text).toContain('可用的开发规范列表');
          expect(response.result.content[0].text).toContain('总计: 2 个规范');
          expect(response.result.content[0].text).toContain('- spec1');
          expect(response.result.content[0].text).toContain('- spec2');

          expect(listAvailableSpecs).toHaveBeenCalledWith({
            projectRoot: testProjectRoot
          });
        });
      });

      describe('create_development_spec 工具', () => {
        it('应该成功创建规范', async () => {
          const mockCreateResponse = {
            success: true,
            message: `成功创建规范: ${testSpecName}`,
            spec_name: testSpecName
          };

          vi.mocked(createDevelopmentSpec).mockResolvedValue(mockCreateResponse);

          const message = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'create_development_spec',
              arguments: {
                spec_name: testSpecName,
                content: testContent,
                projectRoot: testProjectRoot
              }
            }
          };

          const response = await handleMCPMessage(message);

          expect(response.jsonrpc).toBe('2.0');
          expect(response.id).toBe(1);
          expect(response.result).toBeDefined();
          expect(response.result.content[0].text).toContain('✅');
          expect(response.result.content[0].text).toContain('成功创建规范');

          expect(createDevelopmentSpec).toHaveBeenCalledWith({
            spec_name: testSpecName,
            content: testContent,
            projectRoot: testProjectRoot
          });
        });

        it('应该在创建失败时返回错误信息', async () => {
          const mockCreateResponse = {
            success: false,
            message: `规范 "${testSpecName}" 已存在`,
            spec_name: testSpecName
          };

          vi.mocked(createDevelopmentSpec).mockResolvedValue(mockCreateResponse);

          const message = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'create_development_spec',
              arguments: {
                spec_name: testSpecName,
                content: testContent,
                projectRoot: testProjectRoot
              }
            }
          };

          const response = await handleMCPMessage(message);

          expect(response.jsonrpc).toBe('2.0');
          expect(response.id).toBe(1);
          expect(response.result).toBeDefined();
          expect(response.result.content[0].text).toContain('❌');
          expect(response.result.content[0].text).toContain('已存在');
        });
      });

      describe('edit_development_spec 工具', () => {
        it('应该成功编辑规范', async () => {
          const mockEditResponse = {
            success: true,
            message: `成功编辑规范: ${testSpecName}`,
            spec_name: testSpecName
          };

          vi.mocked(editDevelopmentSpec).mockResolvedValue(mockEditResponse);

          const message = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'edit_development_spec',
              arguments: {
                spec_name: testSpecName,
                content: testContent,
                projectRoot: testProjectRoot
              }
            }
          };

          const response = await handleMCPMessage(message);

          expect(response.jsonrpc).toBe('2.0');
          expect(response.id).toBe(1);
          expect(response.result).toBeDefined();
          expect(response.result.content[0].text).toContain('✅');
          expect(response.result.content[0].text).toContain('成功编辑规范');

          expect(editDevelopmentSpec).toHaveBeenCalledWith({
            spec_name: testSpecName,
            content: testContent,
            projectRoot: testProjectRoot
          });
        });

        it('应该在编辑失败时返回错误信息', async () => {
          const mockEditResponse = {
            success: false,
            message: `规范 "${testSpecName}" 不存在`,
            spec_name: testSpecName
          };

          vi.mocked(editDevelopmentSpec).mockResolvedValue(mockEditResponse);

          const message = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'edit_development_spec',
              arguments: {
                spec_name: testSpecName,
                content: testContent,
                projectRoot: testProjectRoot
              }
            }
          };

          const response = await handleMCPMessage(message);

          expect(response.jsonrpc).toBe('2.0');
          expect(response.id).toBe(1);
          expect(response.result).toBeDefined();
          expect(response.result.content[0].text).toContain('❌');
          expect(response.result.content[0].text).toContain('不存在');
        });
      });

      describe('delete_development_spec 工具', () => {
        it('应该成功删除规范', async () => {
          const mockDeleteResponse = {
            success: true,
            message: `成功删除规范: ${testSpecName}`,
            spec_name: testSpecName
          };

          vi.mocked(deleteDevelopmentSpec).mockResolvedValue(mockDeleteResponse);

          const message = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'delete_development_spec',
              arguments: {
                spec_name: testSpecName,
                projectRoot: testProjectRoot
              }
            }
          };

          const response = await handleMCPMessage(message);

          expect(response.jsonrpc).toBe('2.0');
          expect(response.id).toBe(1);
          expect(response.result).toBeDefined();
          expect(response.result.content[0].text).toContain('✅');
          expect(response.result.content[0].text).toContain('成功删除规范');

          expect(deleteDevelopmentSpec).toHaveBeenCalledWith({
            spec_name: testSpecName,
            projectRoot: testProjectRoot
          });
        });

        it('应该在删除失败时返回错误信息', async () => {
          const mockDeleteResponse = {
            success: false,
            message: `规范 "${testSpecName}" 不存在`,
            spec_name: testSpecName
          };

          vi.mocked(deleteDevelopmentSpec).mockResolvedValue(mockDeleteResponse);

          const message = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'delete_development_spec',
              arguments: {
                spec_name: testSpecName,
                projectRoot: testProjectRoot
              }
            }
          };

          const response = await handleMCPMessage(message);

          expect(response.jsonrpc).toBe('2.0');
          expect(response.id).toBe(1);
          expect(response.result).toBeDefined();
          expect(response.result.content[0].text).toContain('❌');
          expect(response.result.content[0].text).toContain('不存在');
        });
      });

      it('应该在调用未知工具时返回错误', async () => {
        const message = {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'unknown_tool',
            arguments: {}
          }
        };

        const response = await handleMCPMessage(message);

        expect(response.jsonrpc).toBe('2.0');
        expect(response.id).toBe(1);
        expect(response.error).toBeDefined();
        expect(response.error?.code).toBe(-32601);
        expect(response.error?.message).toContain('Unknown tool');
      });
    });

    it('应该在调用未知方法时返回错误', async () => {
      const message = {
        jsonrpc: '2.0',
        id: 1,
        method: 'unknown_method',
        params: {}
      };

      const response = await handleMCPMessage(message);

      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(-32601);
      expect(response.error?.message).toContain('Unknown method');
    });

    it('应该在处理过程中发生错误时返回内部错误', async () => {
      // Mock 一个会抛出错误的服务调用
      vi.mocked(getdevelopmentSpec).mockRejectedValue(new Error('Unexpected error'));

      const message = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'get_development_spec',
          arguments: {
            spec_name: testSpecName,
            projectRoot: testProjectRoot
          }
        }
      };

      const response = await handleMCPMessage(message);

      expect(response.jsonrpc).toBe('2.0');
      expect(response.id).toBe(1);
      expect(response.result).toBeDefined();
      expect(response.result.content[0].text).toContain('❌');
      expect(response.result.content[0].text).toContain('Unexpected error');
    });
  });
});
