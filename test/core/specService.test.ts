/**
 * 规范服务测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getdevelopmentSpec,
  createDevelopmentSpec,
  editDevelopmentSpec,
  deleteDevelopmentSpec,
  listAvailableSpecs
} from '../../src/core/specService.js';
import { TEST_TEMP_DIR } from '../setup.js';

// Mock 文件系统工具
vi.mock('../../src/utils/fileSystem.js', () => ({
  readSpecFile: vi.fn(),
  writeSpecFile: vi.fn(),
  deleteSpecFile: vi.fn(),
  specFileExists: vi.fn(),
  listSpecFiles: vi.fn(),
  getSpecFilePath: vi.fn()
}));

import {
  readSpecFile,
  writeSpecFile,
  deleteSpecFile,
  specFileExists,
  listSpecFiles,
  getSpecFilePath
} from '../../src/utils/fileSystem.js';

describe('规范服务', () => {
  const testProjectRoot = TEST_TEMP_DIR;
  const testSpecName = 'test-spec';
  const testContent = '# 测试规范\n\n这是一个测试规范文件。';
  const testFilePath = '/test/path/spec.md';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getdevelopmentSpec', () => {
    it('应该成功获取规范', async () => {
      // Mock 文件系统调用
      vi.mocked(readSpecFile).mockResolvedValue(testContent);
      vi.mocked(getSpecFilePath).mockReturnValue(testFilePath);

      const result = await getdevelopmentSpec({
        spec_name: testSpecName,
        projectRoot: testProjectRoot
      });

      expect(result).toEqual({
        spec_name: testSpecName,
        content: testContent,
        file_path: testFilePath
      });

      expect(readSpecFile).toHaveBeenCalledWith(testSpecName, testProjectRoot);
      expect(getSpecFilePath).toHaveBeenCalledWith(testSpecName, testProjectRoot);
    });

    it('应该在规范名称为空时抛出错误', async () => {
      await expect(
        getdevelopmentSpec({
          spec_name: '',
          projectRoot: testProjectRoot
        })
      ).rejects.toThrow('规范名称不能为空');
    });

    it('应该在项目根目录为空时抛出错误', async () => {
      await expect(
        getdevelopmentSpec({
          spec_name: testSpecName,
          projectRoot: ''
        })
      ).rejects.toThrow('项目根目录不能为空');
    });

    it('应该在文件不存在时抛出错误', async () => {
      vi.mocked(readSpecFile).mockRejectedValue(new Error('规范文件不存在'));

      await expect(
        getdevelopmentSpec({
          spec_name: testSpecName,
          projectRoot: testProjectRoot
        })
      ).rejects.toThrow('规范文件不存在');
    });
  });

  describe('createDevelopmentSpec', () => {
    it('应该成功创建新规范', async () => {
      vi.mocked(specFileExists).mockResolvedValue(false);
      vi.mocked(writeSpecFile).mockResolvedValue(testFilePath);

      const result = await createDevelopmentSpec({
        spec_name: testSpecName,
        content: testContent,
        projectRoot: testProjectRoot
      });

      expect(result).toEqual({
        success: true,
        message: `成功创建规范: ${testSpecName}`,
        spec_name: testSpecName
      });

      expect(specFileExists).toHaveBeenCalledWith(testSpecName, testProjectRoot);
      expect(writeSpecFile).toHaveBeenCalledWith(testSpecName, testContent, testProjectRoot);
    });

    it('应该拒绝覆盖已存在的规范', async () => {
      vi.mocked(specFileExists).mockResolvedValue(true);

      const result = await createDevelopmentSpec({
        spec_name: testSpecName,
        content: testContent,
        projectRoot: testProjectRoot
      });

      expect(result).toEqual({
        success: false,
        message: `规范 "${testSpecName}" 已存在，创建功能不允许覆盖现有规范。如需修改，请使用编辑功能。`,
        spec_name: testSpecName
      });

      expect(writeSpecFile).not.toHaveBeenCalled();
    });

    it('应该在规范名称为空时抛出错误', async () => {
      await expect(
        createDevelopmentSpec({
          spec_name: '',
          content: testContent,
          projectRoot: testProjectRoot
        })
      ).rejects.toThrow('规范名称不能为空');
    });

    it('应该在规范内容为空时抛出错误', async () => {
      await expect(
        createDevelopmentSpec({
          spec_name: testSpecName,
          content: '',
          projectRoot: testProjectRoot
        })
      ).rejects.toThrow('规范内容不能为空');
    });

    it('应该在项目根目录为空时抛出错误', async () => {
      await expect(
        createDevelopmentSpec({
          spec_name: testSpecName,
          content: testContent,
          projectRoot: ''
        })
      ).rejects.toThrow('项目根目录不能为空');
    });
  });

  describe('editDevelopmentSpec', () => {
    it('应该成功编辑已存在的规范', async () => {
      const newContent = '# 更新后的规范\n\n这是更新后的内容。';
      vi.mocked(specFileExists).mockResolvedValue(true);
      vi.mocked(writeSpecFile).mockResolvedValue(testFilePath);

      const result = await editDevelopmentSpec({
        spec_name: testSpecName,
        content: newContent,
        projectRoot: testProjectRoot
      });

      expect(result).toEqual({
        success: true,
        message: `成功编辑规范: ${testSpecName}`,
        spec_name: testSpecName
      });

      expect(specFileExists).toHaveBeenCalledWith(testSpecName, testProjectRoot);
      expect(writeSpecFile).toHaveBeenCalledWith(testSpecName, newContent, testProjectRoot);
    });

    it('应该拒绝编辑不存在的规范', async () => {
      vi.mocked(specFileExists).mockResolvedValue(false);

      const result = await editDevelopmentSpec({
        spec_name: testSpecName,
        content: testContent,
        projectRoot: testProjectRoot
      });

      expect(result).toEqual({
        success: false,
        message: `规范 "${testSpecName}" 不存在，编辑功能只能修改现有规范。如需创建新规范，请使用创建功能。`,
        spec_name: testSpecName
      });

      expect(writeSpecFile).not.toHaveBeenCalled();
    });

    it('应该在规范名称为空时抛出错误', async () => {
      await expect(
        editDevelopmentSpec({
          spec_name: '',
          content: testContent,
          projectRoot: testProjectRoot
        })
      ).rejects.toThrow('规范名称不能为空');
    });

    it('应该在规范内容为空时抛出错误', async () => {
      await expect(
        editDevelopmentSpec({
          spec_name: testSpecName,
          content: '',
          projectRoot: testProjectRoot
        })
      ).rejects.toThrow('规范内容不能为空');
    });

    it('应该在项目根目录为空时抛出错误', async () => {
      await expect(
        editDevelopmentSpec({
          spec_name: testSpecName,
          content: testContent,
          projectRoot: ''
        })
      ).rejects.toThrow('项目根目录不能为空');
    });
  });

  describe('deleteDevelopmentSpec', () => {
    it('应该成功删除已存在的规范', async () => {
      vi.mocked(specFileExists).mockResolvedValue(true);
      vi.mocked(deleteSpecFile).mockResolvedValue();

      const result = await deleteDevelopmentSpec({
        spec_name: testSpecName,
        projectRoot: testProjectRoot
      });

      expect(result).toEqual({
        success: true,
        message: `成功删除规范: ${testSpecName}`,
        spec_name: testSpecName
      });

      expect(specFileExists).toHaveBeenCalledWith(testSpecName, testProjectRoot);
      expect(deleteSpecFile).toHaveBeenCalledWith(testSpecName, testProjectRoot);
    });

    it('应该拒绝删除不存在的规范', async () => {
      vi.mocked(specFileExists).mockResolvedValue(false);

      const result = await deleteDevelopmentSpec({
        spec_name: testSpecName,
        projectRoot: testProjectRoot
      });

      expect(result).toEqual({
        success: false,
        message: `规范 "${testSpecName}" 不存在，无法删除。`,
        spec_name: testSpecName
      });

      expect(deleteSpecFile).not.toHaveBeenCalled();
    });

    it('应该在规范名称为空时抛出错误', async () => {
      await expect(
        deleteDevelopmentSpec({
          spec_name: '',
          projectRoot: testProjectRoot
        })
      ).rejects.toThrow('规范名称不能为空');
    });

    it('应该在项目根目录为空时抛出错误', async () => {
      await expect(
        deleteDevelopmentSpec({
          spec_name: testSpecName,
          projectRoot: ''
        })
      ).rejects.toThrow('项目根目录不能为空');
    });
  });

  describe('listAvailableSpecs', () => {
    it('应该成功列出所有规范', async () => {
      const mockSpecs = [
        { name: 'spec1', file_path: '/path/spec1.md' },
        { name: 'spec2', file_path: '/path/spec2.md' },
        { name: 'spec3', file_path: '/path/spec3.md' }
      ];

      vi.mocked(listSpecFiles).mockResolvedValue(mockSpecs);

      const result = await listAvailableSpecs({
        projectRoot: testProjectRoot
      });

      expect(result).toEqual({
        total: 3,
        specs: mockSpecs
      });

      expect(listSpecFiles).toHaveBeenCalledWith(testProjectRoot);
    });

    it('应该返回空列表', async () => {
      vi.mocked(listSpecFiles).mockResolvedValue([]);

      const result = await listAvailableSpecs({
        projectRoot: testProjectRoot
      });

      expect(result).toEqual({
        total: 0,
        specs: []
      });
    });

    it('应该在项目根目录为空时抛出错误', async () => {
      await expect(
        listAvailableSpecs({
          projectRoot: ''
        })
      ).rejects.toThrow('项目根目录不能为空');
    });
  });
});
