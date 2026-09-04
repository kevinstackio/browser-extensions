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

// 验证首页加载书签入口所需资源与挂载节点。
test('首页加载书签入口', async () => {
  const home = await readFile(new URL('../views/home/index.html', import.meta.url), 'utf8');

  assert.match(home, /reset\.css/);
  assert.match(home, /bookmark-item\.css/);
  assert.match(home, /bookmarks\.css/);
  assert.match(home, /<main/);
  assert.match(home, /data-bookmarks/);
  assert.match(home, /<script type="module" src="index\.js"><\/script>/);
});

// 验证根目录规范持续约束项目、资源与测试结构。
test('根目录约定包含项目、资源与测试规范', async () => {
  const instructions = await readFile(new URL('../../../AGENTS.md', import.meta.url), 'utf8');

  assert.match(instructions, /## 项目结构/);
  assert.match(instructions, /├─ my-tabs\//);
  assert.match(instructions, /## 静态资源规范/);
  assert.match(instructions, /已有同类 Issue/);
  assert.match(instructions, /Browser Extensions/);
  assert.match(instructions, /## 自动化测试规范/);
  assert.match(instructions, /UTF-8/);
  assert.match(instructions, /getExtensionAsset/);
});
