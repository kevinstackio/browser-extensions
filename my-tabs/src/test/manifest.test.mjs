import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// 验证扩展配置将首页设置为浏览器新标签页，且不申请额外权限。
test('Manifest 覆盖新标签页且不申请权限', async () => {
  const manifest = JSON.parse(
    await readFile(new URL('../../manifest.json', import.meta.url)),
  );

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.name, 'My Tabs');
  assert.equal(manifest.version, '1.0.0');
  assert.equal(manifest.description, '我的标签页，保存和组织我喜爱的网站。');
  assert.equal(manifest.chrome_url_overrides.newtab, 'src/views/home/index.html');
  assert.equal('permissions' in manifest, false);
});

// 验证首页入口和 Lucide 静态图标均位于约定路径。
test('首页和 Lucide 图标资源存在', async () => {
  const home = await readFile(new URL('../views/home/index.html', import.meta.url), 'utf8');
  const settings = await readFile(new URL('../assets/icons/settings.svg', import.meta.url), 'utf8');
  const plus = await readFile(new URL('../assets/icons/plus.svg', import.meta.url), 'utf8');

  assert.doesNotMatch(home, /<main|<h1|Hello/);
  assert.match(home, /reset\.css/);
  assert.match(home, /index\.js/);
  assert.match(settings, /<svg/);
  assert.match(plus, /<svg/);
});

// 验证根目录规范持续约束结构、资源与测试迁移。
test('根目录约定包含结构、SVG 和测试迁移规范', async () => {
  const instructions = await readFile(new URL('../../../AGENTS.md', import.meta.url), 'utf8');

  assert.match(instructions, /## 目录结构/);
  assert.match(instructions, /my-tabs\/\s*├─ src\//);
  assert.match(instructions, /## SVG 资源规范/);
  assert.match(instructions, /## 自动化测试规范/);
  assert.match(instructions, /Lucide Icons/);
  assert.match(instructions, /UTF-8/);
  assert.match(instructions, /getExtensionAsset/);
});
