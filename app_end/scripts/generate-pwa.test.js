const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { main } = require('./generate-pwa');

function makeTempProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'generate-pwa-'));
  const distDir = path.join(root, 'dist');
  const iconPath = path.join(root, 'withbackground.png');
  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(iconPath, 'fake-png-content');
  return { root, distDir, iconPath };
}

function writeHtml(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    '<!doctype html><html><head><meta charset="utf-8" /><link rel="icon" href="/favicon.ico" /></head><body><div id="root"></div></body></html>'
  );
}

test('main writes manifest icons that exist in dist output', () => {
  const { distDir, iconPath } = makeTempProject();
  writeHtml(path.join(distDir, 'index.html'));

  main({ distDir, sourceIconPath: iconPath });

  const manifestPath = path.join(distDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.ok(Array.isArray(manifest.icons));
  assert.equal(manifest.icons.length, 2);

  manifest.icons.forEach((icon) => {
    const outputPath = path.join(distDir, icon.src.replace(/^\//, ''));
    assert.ok(fs.existsSync(outputPath), `missing icon file: ${outputPath}`);
  });
});

test('main injects manifest and service worker into nested html routes', () => {
  const { distDir, iconPath } = makeTempProject();
  const rootHtml = path.join(distDir, 'index.html');
  const nestedHtml = path.join(distDir, 'appointments', 'index.html');
  writeHtml(rootHtml);
  writeHtml(nestedHtml);

  main({ distDir, sourceIconPath: iconPath });

  const rootContent = fs.readFileSync(rootHtml, 'utf8');
  const nestedContent = fs.readFileSync(nestedHtml, 'utf8');

  assert.match(rootContent, /rel="manifest" href="\/manifest\.json"/);
  assert.match(rootContent, /navigator\.serviceWorker\.register\("\/service-worker\.js"\)/);
  assert.match(nestedContent, /rel="manifest" href="\/manifest\.json"/);
  assert.match(nestedContent, /navigator\.serviceWorker\.register\("\/service-worker\.js"\)/);
});
