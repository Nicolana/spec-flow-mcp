/**
 * 文件系统工具
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * 获取项目根目录
 */
export function getProjectRoot(): string {
  // 如果在 Cursor 中运行，尝试使用当前工作目录
  const cwd = process.cwd();
  
  // 检查是否在项目根目录（包含 package.json）
  if (fs.existsSync(path.join(cwd, 'package.json'))) {
    return cwd;
  }
  
  // 如果不是，向上查找包含 package.json 的目录
  let currentDir = cwd;
  while (currentDir !== path.dirname(currentDir)) {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  
  // 如果都找不到，使用当前工作目录
  return cwd;
}

/**
 * 获取规范存储目录
 */
export function getSpecsDirectory(): string {
  const projectRoot = getProjectRoot();
  return path.join(projectRoot, 'spec');
}

/**
 * 确保规范目录存在
 */
export async function ensureSpecsDirectory(): Promise<string> {
  const specsDir = getSpecsDirectory();
  await fs.ensureDir(specsDir);
  return specsDir;
}

/**
 * 获取规范文件路径
 */
export function getSpecFilePath(specName: string, category: string = 'frontend'): string {
  const specsDir = getSpecsDirectory();
  return path.join(specsDir, `${specName}_${category}_spec.md`);
}

/**
 * 检查规范文件是否存在
 */
export async function specFileExists(specName: string, category: string = 'frontend'): Promise<boolean> {
  const filePath = getSpecFilePath(specName, category);
  return fs.pathExists(filePath);
}

/**
 * 读取规范文件内容
 */
export async function readSpecFile(specName: string, category: string = 'frontend'): Promise<string> {
  const filePath = getSpecFilePath(specName, category);
  
  if (!await specFileExists(specName, category)) {
    throw new Error(`规范文件不存在: ${specName} (${category})`);
  }
  
  return fs.readFile(filePath, 'utf-8');
}

/**
 * 写入规范文件
 */
export async function writeSpecFile(
  specName: string, 
  content: string, 
  category: string = 'frontend'
): Promise<string> {
  await ensureSpecsDirectory();
  const filePath = getSpecFilePath(specName, category);
  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
}

/**
 * 列出所有规范文件
 */
export async function listSpecFiles(): Promise<Array<{ name: string; category: string; file_path: string }>> {
  const specsDir = getSpecsDirectory();
  
  if (!await fs.pathExists(specsDir)) {
    return [];
  }
  
  const files = await fs.readdir(specsDir);
  const specFiles = files.filter(file => file.endsWith('_spec.md'));
  
  return specFiles.map(file => {
    const match = file.match(/^(.+)_([^_]+)_spec\.md$/);
    if (match) {
      const [, name, category] = match;
      return {
        name,
        category,
        file_path: path.join(specsDir, file)
      };
    }
    return null;
  }).filter(Boolean) as Array<{ name: string; category: string; file_path: string }>;
}
