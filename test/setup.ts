/**
 * 测试环境设置
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';

// 测试用的临时目录 - 使用时间戳确保唯一性
export const TEST_TEMP_DIR = path.join(process.cwd(), `test-temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

beforeAll(async () => {
  // 确保测试临时目录存在
  await fs.ensureDir(TEST_TEMP_DIR);
});

afterAll(async () => {
  // 清理测试临时目录
  if (await fs.pathExists(TEST_TEMP_DIR)) {
    await fs.remove(TEST_TEMP_DIR);
  }
});

beforeEach(async () => {
  // 每个测试前清理临时目录
  if (await fs.pathExists(TEST_TEMP_DIR)) {
    try {
      await fs.remove(TEST_TEMP_DIR);
    } catch (error) {
      // 如果删除失败，尝试强制删除
      console.warn('清理测试目录失败，尝试强制删除:', error);
      await fs.emptyDir(TEST_TEMP_DIR);
      await fs.remove(TEST_TEMP_DIR);
    }
  }
  await fs.ensureDir(TEST_TEMP_DIR);
});

afterEach(async () => {
  // 每个测试后清理临时目录
  if (await fs.pathExists(TEST_TEMP_DIR)) {
    try {
      await fs.remove(TEST_TEMP_DIR);
    } catch (error) {
      // 如果删除失败，尝试强制删除
      console.warn('清理测试目录失败，尝试强制删除:', error);
      await fs.emptyDir(TEST_TEMP_DIR);
      await fs.remove(TEST_TEMP_DIR);
    }
  }
});
