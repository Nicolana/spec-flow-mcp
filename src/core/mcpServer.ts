/**
 * MCP 服务器核心实现
 */

import { MCPMessage, MCPResponse } from '../types/index.js';
import { 
  getdevelopmentSpec, 
  createDevelopmentSpec, 
  editDevelopmentSpec, 
  listAvailableSpecs 
} from './specService.js';
import { logger } from '../utils/logger.js';

/**
 * MCP 工具定义
 */
const MCP_TOOLS = [
  {
    name: 'get_development_spec',
    description: '获取开发规范',
    inputSchema: {
      type: 'object',
      properties: {
        spec_name: {
          type: 'string',
          description: '规范名称，如：spttable, sptdrawer'
        },
        category: {
          type: 'string',
          enum: ['frontend', 'backend', 'mobile', 'design'],
          default: 'frontend',
          description: '规范分类'
        },
        projectRoot: {
          type: 'string',
          description: '项目根目录路径，规范将存储在 {projectRoot}/.spec 目录下'
        }
      },
      required: ['spec_name', 'projectRoot']
    }
  },
  {
    name: 'list_specs',
    description: '列出所有可用的开发规范',
    inputSchema: {
      type: 'object',
      properties: {
        projectRoot: {
          type: 'string',
          description: '项目根目录路径，规范将存储在 {projectRoot}/.spec 目录下'
        }
      },
      required: ['projectRoot']
    }
  },
  {
    name: 'create_development_spec',
    description: '创建新的开发规范，不允许覆盖已存在的规范',
    inputSchema: {
      type: 'object',
      properties: {
        spec_name: {
          type: 'string',
          description: '规范名称，如：newcomponent, newpattern'
        },
        content: {
          type: 'string',
          description: '规范的完整内容（Markdown格式）'
        },
        category: {
          type: 'string',
          enum: ['frontend', 'backend', 'mobile', 'design'],
          default: 'frontend',
          description: '规范分类'
        },
        projectRoot: {
          type: 'string',
          description: '项目根目录路径，规范将存储在 {projectRoot}/.spec 目录下'
        }
      },
      required: ['spec_name', 'content', 'projectRoot']
    }
  },
  {
    name: 'edit_development_spec',
    description: '编辑已存在的开发规范，只能修改现有规范的内容',
    inputSchema: {
      type: 'object',
      properties: {
        spec_name: {
          type: 'string',
          description: '规范名称，必须是已存在的规范'
        },
        content: {
          type: 'string',
          description: '规范的新内容（Markdown格式）'
        },
        category: {
          type: 'string',
          enum: ['frontend', 'backend', 'mobile', 'design'],
          default: 'frontend',
          description: '规范分类'
        },
        projectRoot: {
          type: 'string',
          description: '项目根目录路径，规范将存储在 {projectRoot}/.spec 目录下'
        }
      },
      required: ['spec_name', 'content', 'projectRoot']
    }
  }
];

/**
 * 处理 MCP 协议消息
 */
export async function handleMCPMessage(message: MCPMessage): Promise<MCPResponse> {
  const { method, params, id } = message;
  
  try {
    logger.debug(`处理 MCP 消息: ${method}`);
    
    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
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
        };
      
      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: MCP_TOOLS
          }
        };
      
      case 'tools/call':
        return await handleToolCall(params?.name, params?.arguments, id);
      
      default:
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Unknown method: ${method}`
          }
        };
    }
  } catch (error) {
    logger.error('MCP 消息处理错误', error as Error);
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message: `Internal error: ${(error as Error).message}`
      }
    };
  }
}

/**
 * 处理工具调用
 */
async function handleToolCall(
  toolName: string, 
  toolArgs: Record<string, any> = {}, 
  requestId?: string | number
): Promise<MCPResponse> {
  try {
    switch (toolName) {
      case 'get_development_spec':
        const specResult = await getdevelopmentSpec({
          spec_name: toolArgs.spec_name || '',
          category: toolArgs.category || 'frontend',
          projectRoot: toolArgs.projectRoot || ''
        });
        
        return {
          jsonrpc: '2.0',
          id: requestId,
          result: {
            content: [
              {
                type: 'text',
                text: `# ${specResult.spec_name} 开发规范\n\n分类: ${specResult.category}\n\n${specResult.content}`
              }
            ]
          }
        };
      
      case 'list_specs':
        const listResult = await listAvailableSpecs({
          projectRoot: toolArgs.projectRoot || ''
        });
        const specsList = listResult.specs
          .map(spec => `- ${spec.name} (${spec.category})`)
          .join('\n');
        
        return {
          jsonrpc: '2.0',
          id: requestId,
          result: {
            content: [
              {
                type: 'text',
                text: `# 可用的开发规范列表\n\n总计: ${listResult.total} 个规范\n\n${specsList}\n\n使用 get_development_spec 工具获取具体规范内容。`
              }
            ]
          }
        };
      
      case 'create_development_spec':
        const createResult = await createDevelopmentSpec({
          spec_name: toolArgs.spec_name || '',
          content: toolArgs.content || '',
          category: toolArgs.category || 'frontend',
          projectRoot: toolArgs.projectRoot || ''
        });
        
        if (createResult.success) {
          return {
            jsonrpc: '2.0',
            id: requestId,
            result: {
              content: [
                {
                  type: 'text',
                  text: `✅ 成功创建规范: ${createResult.spec_name}\n\n📋 规范信息：\n- 名称: ${createResult.spec_name}\n- 分类: ${createResult.category}\n- 操作: 新建\n- 状态: 已保存\n\n💡 提示：使用 get_development_spec 工具可以查看新创建的规范内容。`
                }
              ]
            }
          };
        } else {
          return {
            jsonrpc: '2.0',
            id: requestId,
            result: {
              content: [
                {
                  type: 'text',
                  text: `❌ ${createResult.message}\n\n💡 解决方案：\n1. 检查规范名称是否已存在（创建功能不允许覆盖）\n2. 确认内容格式是否正确\n3. 如需修改已存在的规范，请使用 edit_development_spec 工具`
                }
              ]
            }
          };
        }
      
      case 'edit_development_spec':
        const editResult = await editDevelopmentSpec({
          spec_name: toolArgs.spec_name || '',
          content: toolArgs.content || '',
          category: toolArgs.category || 'frontend',
          projectRoot: toolArgs.projectRoot || ''
        });
        
        if (editResult.success) {
          return {
            jsonrpc: '2.0',
            id: requestId,
            result: {
              content: [
                {
                  type: 'text',
                  text: `✅ 成功编辑规范: ${editResult.spec_name}\n\n📋 规范信息：\n- 名称: ${editResult.spec_name}\n- 分类: ${editResult.category}\n- 操作: 编辑\n- 状态: 已更新\n\n💡 提示：使用 get_development_spec 工具可以查看更新后的规范内容。`
                }
              ]
            }
          };
        } else {
          return {
            jsonrpc: '2.0',
            id: requestId,
            result: {
              content: [
                {
                  type: 'text',
                  text: `❌ ${editResult.message}\n\n💡 解决方案：\n1. 检查规范名称是否存在（编辑功能只能修改现有规范）\n2. 确认内容格式是否正确\n3. 如需创建新规范，请使用 create_development_spec 工具`
                }
              ]
            }
          };
        }
      
      default:
        return {
          jsonrpc: '2.0',
          id: requestId,
          error: {
            code: -32601,
            message: `Unknown tool: ${toolName}`
          }
        };
    }
  } catch (error) {
    logger.error(`工具调用失败: ${toolName}`, error as Error);
    
    const errorMessage = (error as Error).message;
    const isNotFoundError = errorMessage.includes('不存在') || errorMessage.includes('not found');
    
    return {
      jsonrpc: '2.0',
      id: requestId,
      result: {
        content: [
          {
            type: 'text',
            text: `❌ ${toolName === 'get_development_spec' ? '获取' : 
                       toolName === 'create_development_spec' ? '创建' : 
                       toolName === 'edit_development_spec' ? '编辑' : ''}开发规范失败：${errorMessage}\n\n💡 解决方案：\n${
              isNotFoundError ? 
                '1. 检查规范名称是否正确\n2. 确认规范文件是否存在\n3. 验证分类参数是否正确' :
                '1. 检查规范名称和内容是否有效\n2. 确认服务是否正常运行\n3. 验证参数格式是否正确'
            }`
          }
        ]
      }
    };
  }
}
