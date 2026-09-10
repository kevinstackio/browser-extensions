import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

const iconSizes = [16, 32, 48, 128];
const darkIcons = Object.fromEntries(
  iconSizes.map((size) => [size, `src/assets/icons/my-tabs-dark-${size}.png`]),
);

// 验证扩展配置将首页设置为浏览器新标签页，并申请标签组权限。
test('Manifest 覆盖新标签页并声明标签组权限', async () => {
  const manifest = JSON.parse(
    await readFile(new URL('../../manifest.json', import.meta.url)),
  );

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.name, 'My Tabs');
  assert.equal(manifest.version, '1.0.0');
  assert.equal(manifest.description, '我的标签页，保存和组织我喜爱的网站。');
  assert.equal(manifest.chrome_url_overrides.newtab, 'src/views/home/index.html');
  assert.deepEqual(manifest.icons, darkIcons);
  assert.deepEqual(manifest.action.default_icon, darkIcons);
  assert.deepEqual(manifest.permissions, ['tabGroups']);
});

// 验证首页声明书签入口、标签页图标回退资源与挂载节点。
test('首页加载书签入口', async () => {
  const home = await readFile(new URL('../views/home/index.html', import.meta.url), 'utf8');

  assert.match(home, /reset\.css/);
  assert.match(home, /styles\/index\.css/);
  assert.match(home, /bookmark-card\/index\.css/);
  assert.match(home, /bookmark-folder\/index\.css/);
  assert.match(home, /bookmarks\/bookmark-dock\.css/);
  assert.match(home, /bookmarks\/bookmark-grid\.css/);
  assert.match(home, /<main/);
  assert.match(home, /data-bookmarks/);
  assert.match(home, /data-bookmark-dock/);
  assert.match(home, /<script type="module" src="index\.js"><\/script>/);
  assert.match(home, /<link rel="icon" href="..\/..\/assets\/icons\/my-tabs-dark-16\.png">/);
});

// 验证深浅色图标均以完整的 PNG 尺寸集交付，避免主题资源缺失。
test('深浅色图标提供完整且尺寸正确的 PNG 资源', async () => {
  for (const theme of ['dark', 'light']) {
    for (const size of iconSizes) {
      const icon = new URL(`../assets/icons/my-tabs-${theme}-${size}.png`, import.meta.url);
      const [metadata, content] = await Promise.all([stat(icon), readFile(icon)]);

      assert.equal(metadata.size > 0, true);
      assert.equal(content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), true);
      assert.equal(content.readUInt32BE(16), size);
      assert.equal(content.readUInt32BE(20), size);
    }
  }
});

// 验证未收录于 Simple Icons 的开发工具图标保持书签品牌 SVG 结构。
test('开发工具书签图标遵循 Simple Icons 风格', async () => {
  const icon = await readFile(new URL('../assets/brand/devtools.svg', import.meta.url), 'utf8');

  assert.match(icon, /<svg role="img" viewBox="0 0 24 24"/);
  assert.match(icon, /<title>DevTools<\/title>/);
  assert.match(icon, /<path fill="#000000" transform="scale\(0\.0234375\)" d="M85\.333333 224/);
  assert.equal((icon.match(/<path /g) ?? []).length, 1);
  assert.doesNotMatch(icon, /<\?xml|<!DOCTYPE|class=|p-id=|width=|height=|stroke=|opacity|<line|<rect|<image/);
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
