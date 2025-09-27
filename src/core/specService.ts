/**
 * 规范服务核心逻辑
 */

import { 
  SpecRequest, 
  CreateSpecRequest, 
  EditSpecRequest, 
  SpecResponse, 
  SpecOperationResponse, 
  ListSpecsResponse 
} from '../types/index.js';
import { 
  readSpecFile, 
  writeSpecFile, 
  specFileExists, 
  listSpecFiles,
  getSpecFilePath 
} from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';

/**
 * 获取开发规范
 */
export async function getdevelopmentSpec(request: SpecRequest): Promise<SpecResponse> {
  const { spec_name, category = 'frontend' } = request;
  
  logger.info(`获取规范: ${spec_name} (${category})`);
  
  try {
    if (!spec_name || spec_name.trim() === '') {
      throw new Error('规范名称不能为空');
    }
    
    const content = await readSpecFile(spec_name, category);
    const filePath = getSpecFilePath(spec_name, category);
    
    return {
      spec_name,
      content,
      category,
      file_path: filePath
    };
  } catch (error) {
    logger.error(`获取规范失败: ${spec_name}`, error as Error);
    throw error;
  }
}

/**
 * 创建开发规范
 */
export async function createDevelopmentSpec(request: CreateSpecRequest): Promise<SpecOperationResponse> {
  const { spec_name, content, category = 'frontend' } = request;
  
  logger.info(`创建规范: ${spec_name} (${category})`);
  
  try {
    if (!spec_name || spec_name.trim() === '') {
      throw new Error('规范名称不能为空');
    }
    
    if (!content || content.trim() === '') {
      throw new Error('规范内容不能为空');
    }
    
    // 检查规范是否已存在
    if (await specFileExists(spec_name, category)) {
      return {
        success: false,
        message: `规范 "${spec_name}" 已存在，创建功能不允许覆盖现有规范。如需修改，请使用编辑功能。`,
        spec_name,
        category
      };
    }
    
    // 创建规范文件
    await writeSpecFile(spec_name, content, category);
    
    logger.info(`成功创建规范: ${spec_name} (${category})`);
    
    return {
      success: true,
      message: `成功创建规范: ${spec_name}`,
      spec_name,
      category
    };
  } catch (error) {
    logger.error(`创建规范失败: ${spec_name}`, error as Error);
    throw error;
  }
}

/**
 * 编辑开发规范
 */
export async function editDevelopmentSpec(request: EditSpecRequest): Promise<SpecOperationResponse> {
  const { spec_name, content, category = 'frontend' } = request;
  
  logger.info(`编辑规范: ${spec_name} (${category})`);
  
  try {
    if (!spec_name || spec_name.trim() === '') {
      throw new Error('规范名称不能为空');
    }
    
    if (!content || content.trim() === '') {
      throw new Error('规范内容不能为空');
    }
    
    // 检查规范是否存在
    if (!await specFileExists(spec_name, category)) {
      return {
        success: false,
        message: `规范 "${spec_name}" 不存在，编辑功能只能修改现有规范。如需创建新规范，请使用创建功能。`,
        spec_name,
        category
      };
    }
    
    // 更新规范文件
    await writeSpecFile(spec_name, content, category);
    
    logger.info(`成功编辑规范: ${spec_name} (${category})`);
    
    return {
      success: true,
      message: `成功编辑规范: ${spec_name}`,
      spec_name,
      category
    };
  } catch (error) {
    logger.error(`编辑规范失败: ${spec_name}`, error as Error);
    throw error;
  }
}

/**
 * 列出所有可用的开发规范
 */
export async function listAvailableSpecs(): Promise<ListSpecsResponse> {
  logger.info('获取规范列表');
  
  try {
    const specs = await listSpecFiles();
    
    return {
      total: specs.length,
      specs
    };
  } catch (error) {
    logger.error('获取规范列表失败', error as Error);
    throw error;
  }
}
