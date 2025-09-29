#!/usr/bin/env tsx

/**
 * 测试运行脚本
 * 用于运行所有测试并生成报告
 */

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

async function runTests() {
  console.log('🧪 开始运行 Spec Flow MCP 测试套件...\n');

  try {
    // 清理之前的测试结果
    const coverageDir = path.join(process.cwd(), 'coverage');
    if (await fs.pathExists(coverageDir)) {
      await fs.remove(coverageDir);
    }

    // 运行测试
    console.log('📋 运行单元测试和集成测试...');
    execSync('npx vitest run --coverage', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('\n✅ 所有测试通过！');
    console.log('\n📊 测试报告已生成：');
    console.log('   - 控制台输出：测试结果摘要');
    console.log('   - coverage/index.html：详细覆盖率报告');
    console.log('   - coverage/coverage-final.json：JSON 格式覆盖率数据');

  } catch (error) {
    console.error('\n❌ 测试失败：', error);
    process.exit(1);
  }
}

// 运行测试
runTests().catch((error) => {
  console.error('测试运行器错误：', error);
  process.exit(1);
});
