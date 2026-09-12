import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const sizes = [16, 32, 48, 128];

// 验证 TG Download 在扩展管理页和工具栏使用带下载标识的品牌图标。
test('TG Download 清单声明下载标识 PNG 图标', async () => {
  const manifest = JSON.parse(
    await readFile(new URL('../../manifest.json', import.meta.url)),
  );
  const icons = Object.fromEntries(
    sizes.map((size) => [size, `src/assets/logo/tg-download-${size}.png`]),
  );

  assert.deepEqual(manifest.icons, icons);
  assert.deepEqual(manifest.action.default_icon, icons);
  assert.deepEqual(manifest.background, { service_worker: 'service-worker.js' });
});

// 验证每个清单图标均为对应尺寸的 PNG 文件。
test('TG Download 品牌 PNG 图标尺寸正确', async () => {
  for (const size of sizes) {
    const icon = await readFile(
    new URL(`../assets/logo/tg-download-${size}.png`, import.meta.url),
    );

    assert.equal(icon.readUInt32BE(16), size);
    assert.equal(icon.readUInt32BE(20), size);
  }
});

// 验证主题同步与主世界下载逻辑使用各自明确的执行环境。
test('TG Download 分离主题同步与主世界下载脚本', async () => {
  const manifest = JSON.parse(
    await readFile(new URL('../../manifest.json', import.meta.url)),
  );

  assert.deepEqual(manifest.content_scripts, [
    {
      matches: ['https://web.telegram.org/*'],
      js: ['src/utils/common.js'],
      run_at: 'document_start',
    },
    {
      matches: ['https://web.telegram.org/*'],
      css: ['src/styles/menu.css'],
      js: ['src/components/menu/index.js', 'src/views/download/index.js'],
      run_at: 'document_idle',
      world: 'MAIN',
    },
  ]);
  assert.equal(manifest.web_accessible_resources, undefined);
});
