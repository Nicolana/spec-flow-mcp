#!/usr/bin/env node

/**
 * Spec Flow MCP 服务器入口点
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { handleMCPMessage } from './core/mcpServer.js';
import { logger } from './utils/logger.js';
import { ensureSpecsDirectory } from './utils/fileSystem.js';

/**
 * 创建并启动 MCP 服务器
 */
async function main() {
  try {
    logger.info('启动 Spec Flow MCP 服务器...');
    
    // 确保规范目录存在
    const specsDir = await ensureSpecsDirectory();
    logger.info(`规范存储目录: ${specsDir}`);
    
    // 创建 MCP 服务器
    const server = new Server(
      {
        name: 'spec-flow-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    // 处理工具列表请求
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
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
                }
              },
              required: ['spec_name']
            }
          },
          {
            name: 'list_specs',
            description: '列出所有可用的开发规范',
            inputSchema: {
              type: 'object',
              properties: {}
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
                }
              },
              required: ['spec_name', 'content']
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
                }
              },
              required: ['spec_name', 'content']
            }
          }
        ]
      };
    });
    
    // 处理工具调用请求
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      logger.debug(`工具调用: ${name} - ${JSON.stringify(args)}`);
      
      // 构造 MCP 消息
      const mcpMessage = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name,
          arguments: args || {}
        },
        id: 1
      };
      
      // 处理消息并返回结果
      const response = await handleMCPMessage(mcpMessage);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      return response.result;
    });
    
    // 启动服务器
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    logger.info('Spec Flow MCP 服务器已启动，等待连接...');
    
  } catch (error) {
    logger.error('服务器启动失败', error as Error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的 Promise 拒绝', reason as Error);
  process.exit(1);
});

// 启动应用
main().catch((error) => {
  logger.error('应用启动失败', error);
  process.exit(1);
});
