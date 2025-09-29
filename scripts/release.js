#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      stdio: 'inherit', 
      cwd: projectRoot,
      ...options 
    });
  } catch (error) {
    log(`❌ 命令执行失败: ${command}`, 'red');
    log(`错误信息: ${error.message}`, 'red');
    process.exit(1);
  }
}

function getCurrentVersion() {
  const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
  return packageJson.version;
}

function getNextVersion(type) {
  const currentVersion = getCurrentVersion();
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'prerelease':
      if (currentVersion.includes('-')) {
        const [baseVersion, prerelease] = currentVersion.split('-');
        const [prereleaseType, prereleaseNumber] = prerelease.split('.');
        return `${baseVersion}-${prereleaseType}.${parseInt(prereleaseNumber) + 1}`;
      }
      return `${currentVersion}-beta.1`;
    default:
      return currentVersion;
  }
}

function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { 
      cwd: projectRoot,
      encoding: 'utf8' 
    });
    
    if (status.trim()) {
      log('⚠️  检测到未提交的更改:', 'yellow');
      log(status, 'yellow');
      return false;
    }
    return true;
  } catch (error) {
    log('❌ Git 状态检查失败', 'red');
    return false;
  }
}

function checkBranch() {
  try {
    const branch = execSync('git branch --show-current', { 
      cwd: projectRoot,
      encoding: 'utf8' 
    }).trim();
    
    if (branch !== 'main' && branch !== 'master') {
      log(`⚠️  当前分支: ${branch}`, 'yellow');
      log('建议在 main 或 master 分支进行发布', 'yellow');
    }
    return branch;
  } catch (error) {
    log('❌ 分支检查失败', 'red');
    return 'unknown';
  }
}

function runTests() {
  log('🧪 运行测试...', 'blue');
  exec('npm run test:run');
  log('✅ 测试通过', 'green');
}

function runLint() {
  log('🔍 运行代码检查...', 'blue');
  exec('npm run lint');
  log('✅ 代码检查通过', 'green');
}

function build() {
  log('🔨 构建项目...', 'blue');
  exec('npm run build');
  log('✅ 构建完成', 'green');
}

function updateVersion(type) {
  const currentVersion = getCurrentVersion();
  const nextVersion = getNextVersion(type);
  
  log(`📦 更新版本: ${currentVersion} → ${nextVersion}`, 'cyan');
  exec(`npm version ${type} --no-git-tag-version`);
  log('✅ 版本更新完成', 'green');
  
  return nextVersion;
}

function publish(tag = 'latest') {
  log(`🚀 发布到 npm (tag: ${tag})...`, 'blue');
  
  if (tag === 'latest') {
    exec('npm publish');
  } else {
    exec(`npm publish --tag ${tag}`);
  }
  
  log('✅ 发布成功', 'green');
}

function pushToGit(version) {
  log('📤 推送到 Git...', 'blue');
  exec(`git add .`);
  exec(`git commit -m "chore: release v${version}"`);
  exec(`git tag v${version}`);
  exec(`git push origin HEAD`);
  exec(`git push origin v${version}`);
  log('✅ Git 推送完成', 'green');
}

function showHelp() {
  log(`
${colors.bold}📦 Spec Flow MCP 发布工具${colors.reset}

${colors.cyan}使用方法:${colors.reset}
  npm run release [选项]

${colors.cyan}选项:${colors.reset}
  patch     发布补丁版本 (1.0.0 → 1.0.1)
  minor     发布次要版本 (1.0.0 → 1.1.0)
  major     发布主要版本 (1.0.0 → 2.0.0)
  beta      发布 beta 版本 (1.0.0 → 1.0.1-beta.1)
  alpha     发布 alpha 版本 (1.0.0 → 1.0.1-alpha.1)
  --help    显示帮助信息

${colors.cyan}示例:${colors.reset}
  npm run release patch
  npm run release minor
  npm run release beta

${colors.yellow}注意:${colors.reset}
  - 发布前会自动运行测试和代码检查
  - 会自动创建 Git 标签并推送
  - 确保在 main/master 分支进行发布
  `, 'white');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    showHelp();
    return;
  }
  
  const releaseType = args[0];
  const validTypes = ['patch', 'minor', 'major', 'beta', 'alpha'];
  
  if (!validTypes.includes(releaseType)) {
    log(`❌ 无效的发布类型: ${releaseType}`, 'red');
    log(`支持的类型: ${validTypes.join(', ')}`, 'yellow');
    process.exit(1);
  }
  
  log(`${colors.bold}🚀 开始发布流程...${colors.reset}`, 'magenta');
  
  // 检查 Git 状态
  if (!checkGitStatus()) {
    log('❌ 请先提交所有更改', 'red');
    process.exit(1);
  }
  
  // 检查分支
  const branch = checkBranch();
  
  // 运行测试
  runTests();
  
  // 运行代码检查
  runLint();
  
  // 构建项目
  build();
  
  // 更新版本
  const newVersion = updateVersion(releaseType);
  
  // 发布到 npm
  const tag = releaseType === 'beta' ? 'beta' : releaseType === 'alpha' ? 'alpha' : 'latest';
  publish(tag);
  
  // 推送到 Git
  pushToGit(newVersion);
  
  log(`${colors.bold}🎉 发布完成!${colors.reset}`, 'green');
  log(`版本: ${newVersion}`, 'cyan');
  log(`分支: ${branch}`, 'cyan');
  log(`Tag: ${tag}`, 'cyan');
  log(`\n📦 包地址: https://www.npmjs.com/package/spec-flow-mcp`, 'blue');
}

main().catch(error => {
  log(`❌ 发布失败: ${error.message}`, 'red');
  process.exit(1);
});
