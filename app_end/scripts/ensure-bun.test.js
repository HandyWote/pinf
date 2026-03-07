const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const scriptPath = path.join(__dirname, 'ensure-bun.js');

test('allows installation when bun is the package manager', () => {
  const result = spawnSync(process.execPath, [scriptPath], {
    env: {
      ...process.env,
      npm_config_user_agent: 'bun/1.2.0',
    },
    encoding: 'utf8',
  });

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
});

test('blocks installation when npm is the package manager', () => {
  const result = spawnSync(process.execPath, [scriptPath], {
    env: {
      ...process.env,
      npm_config_user_agent: 'npm/10.0.0',
    },
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /bun install/);
});

