#!/usr/bin/env node

const userAgent = process.env.npm_config_user_agent ?? '';

if (userAgent.startsWith('bun/')) {
  process.exit(0);
}

console.error(
  'app_end 仅允许使用 bun 安装依赖。请删除 node_modules 后执行: bun install'
);
process.exit(1);
