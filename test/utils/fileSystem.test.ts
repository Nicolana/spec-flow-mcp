/**
 * 文件系统工具测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import {
  getProjectRoot,
  getSpecsDirectory,
  ensureSpecsDirectory,
  getSpecFilePath,
  specFileExists,
  readSpecFile,
  writeSpecFile,
  deleteSpecFile,
  listSpecFiles
} from '../../src/utils/fileSystem.js';
import { TEST_TEMP_DIR } from '../setup.js';

describe('文件系统工具', () => {
  const testProjectRoot = TEST_TEMP_DIR;
  const testSpecName = 'test-spec';
  const testContent = '# 测试规范\n\n这是一个测试规范文件。';

  beforeEach(async () => {
    // 确保测试目录存在
    await fs.ensureDir(testProjectRoot);
  });

  describe('getProjectRoot', () => {
    it('应该返回包含 package.json 的目录', () => {
      const projectRoot = getProjectRoot();
      expect(projectRoot).toBeDefined();
      expect(typeof projectRoot).toBe('string');
    });
  });

  describe('getSpecsDirectory', () => {
    it('应该返回正确的规范目录路径', () => {
      const specsDir = getSpecsDirectory(testProjectRoot);
      expect(specsDir).toBe(path.join(testProjectRoot, '.spec'));
    });

    it('应该在没有提供项目根目录时使用默认值', () => {
      const specsDir = getSpecsDirectory();
      expect(specsDir).toContain('.spec');
    });
  });

  describe('ensureSpecsDirectory', () => {
    it('应该创建规范目录', async () => {
      const specsDir = await ensureSpecsDirectory(testProjectRoot);
      expect(await fs.pathExists(specsDir)).toBe(true);
      expect(specsDir).toBe(path.join(testProjectRoot, '.spec'));
    });

    it('应该返回已存在的目录路径', async () => {
      // 先创建目录
      const specsDir = path.join(testProjectRoot, '.spec');
      await fs.ensureDir(specsDir);
      
      // 再次调用应该返回相同路径
      const result = await ensureSpecsDirectory(testProjectRoot);
      expect(result).toBe(specsDir);
    });
  });

  describe('getSpecFilePath', () => {
    it('应该返回正确的规范文件路径', () => {
      const filePath = getSpecFilePath(testSpecName, testProjectRoot);
      const expectedPath = path.join(testProjectRoot, '.spec', `${testSpecName}_spec.md`);
      expect(filePath).toBe(expectedPath);
    });
  });

  describe('specFileExists', () => {
    it('应该正确检测文件是否存在', async () => {
      // 文件不存在
      expect(await specFileExists(testSpecName, testProjectRoot)).toBe(false);
      
      // 创建文件
      await writeSpecFile(testSpecName, testContent, testProjectRoot);
      
      // 文件存在
      expect(await specFileExists(testSpecName, testProjectRoot)).toBe(true);
    });
  });

  describe('writeSpecFile', () => {
    it('应该创建规范文件', async () => {
      const filePath = await writeSpecFile(testSpecName, testContent, testProjectRoot);
      
      expect(await fs.pathExists(filePath)).toBe(true);
      expect(filePath).toBe(getSpecFilePath(testSpecName, testProjectRoot));
      
      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe(testContent);
    });

    it('应该自动创建规范目录', async () => {
      const specsDir = path.join(testProjectRoot, '.spec');
      expect(await fs.pathExists(specsDir)).toBe(false);
      
      await writeSpecFile(testSpecName, testContent, testProjectRoot);
      
      expect(await fs.pathExists(specsDir)).toBe(true);
    });
  });

  describe('readSpecFile', () => {
    it('应该读取规范文件内容', async () => {
      // 先创建文件
      await writeSpecFile(testSpecName, testContent, testProjectRoot);
      
      const content = await readSpecFile(testSpecName, testProjectRoot);
      expect(content).toBe(testContent);
    });

    it('应该在文件不存在时抛出错误', async () => {
      await expect(
        readSpecFile('non-existent-spec', testProjectRoot)
      ).rejects.toThrow('规范文件不存在');
    });
  });

  describe('deleteSpecFile', () => {
    it('应该删除规范文件', async () => {
      // 先创建文件
      await writeSpecFile(testSpecName, testContent, testProjectRoot);
      expect(await specFileExists(testSpecName, testProjectRoot)).toBe(true);
      
      // 删除文件
      await deleteSpecFile(testSpecName, testProjectRoot);
      
      expect(await specFileExists(testSpecName, testProjectRoot)).toBe(false);
    });

    it('应该在文件不存在时抛出错误', async () => {
      await expect(
        deleteSpecFile('non-existent-spec', testProjectRoot)
      ).rejects.toThrow('规范文件不存在');
    });
  });

  describe('listSpecFiles', () => {
    it('应该返回空列表当目录不存在时', async () => {
      const specs = await listSpecFiles(testProjectRoot);
      expect(specs).toEqual([]);
    });

    it('应该列出所有规范文件', async () => {
      // 创建多个规范文件
      await writeSpecFile('spec1', 'content1', testProjectRoot);
      await writeSpecFile('spec2', 'content2', testProjectRoot);
      await writeSpecFile('spec3', 'content3', testProjectRoot);
      
      // 创建非规范文件（应该被忽略）
      const specsDir = path.join(testProjectRoot, '.spec');
      await fs.writeFile(path.join(specsDir, 'other-file.txt'), 'content');
      
      const specs = await listSpecFiles(testProjectRoot);
      
      expect(specs).toHaveLength(3);
      expect(specs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'spec1' }),
          expect.objectContaining({ name: 'spec2' }),
          expect.objectContaining({ name: 'spec3' })
        ])
      );
      
      // 验证每个规范都有正确的文件路径
      specs.forEach(spec => {
        expect(spec.file_path).toContain(`${spec.name}_spec.md`);
      });
    });

    it('应该忽略不符合命名规则的文件', async () => {
      const specsDir = path.join(testProjectRoot, '.spec');
      await fs.ensureDir(specsDir);
      
      // 创建不符合命名规则的文件
      await fs.writeFile(path.join(specsDir, 'invalid_spec.md'), 'content');
      await fs.writeFile(path.join(specsDir, 'spec_without_suffix.md'), 'content');
      await fs.writeFile(path.join(specsDir, 'other_file.txt'), 'content');
      
      const specs = await listSpecFiles(testProjectRoot);
      expect(specs).toEqual([]);
    });
  });
});
