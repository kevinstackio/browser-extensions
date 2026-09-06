import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// 验证全局样式集中定义书签页面复用的尺寸与视觉变量。
test('全局样式提供书签页统一设计变量', async () => {
  const styles = await readFile(new URL('../styles/index.css', import.meta.url), 'utf8');

  assert.match(styles, /:root\s*\{[\s\S]*--page-padding:\s*24px;/);
  assert.match(styles, /:root\s*\{[\s\S]*--bookmark-grid-gap:\s*24px;/);
  assert.match(styles, /:root\s*\{[\s\S]*--bookmark-icon-size:\s*64px;/);
  assert.match(styles, /:root\s*\{[\s\S]*--bookmark-folder-size:\s*200px;/);
  assert.match(styles, /:root\s*\{[\s\S]*--bookmark-folder-grid-height:\s*232px;/);
  assert.match(styles, /:root\s*\{[\s\S]*--bookmark-folder-padding:\s*16px;/);
  assert.match(styles, /:root\s*\{[\s\S]*--bookmark-folder-item-gap:\s*16px;/);
  assert.match(styles, /:root\s*\{[\s\S]*--dock-padding:\s*8px;/);
  assert.match(styles, /:root\s*\{[\s\S]*--dock-gap:\s*8px;/);
  assert.match(styles, /:root\s*\{[\s\S]*--container-border:\s*1px solid var\(--border-color\);/);
  assert.match(styles, /:root\s*\{[\s\S]*--container-radius:\s*16px;/);
  assert.doesNotMatch(styles, /--dock-icon-size/);
});

// 验证普通书签、文件夹与 Dock 共享同一种边框规范。
test('书签容器使用统一边框', async () => {
  const [itemStyles, folderStyles, dockStyles] = await Promise.all([
    readFile(new URL('../components/bookmark-item/index.css', import.meta.url), 'utf8'),
    readFile(new URL('../components/bookmark-folder/index.css', import.meta.url), 'utf8'),
    readFile(new URL('../components/bookmark-dock/index.css', import.meta.url), 'utf8'),
  ]);

  assert.match(itemStyles, /\.bookmark-item__icon\s*\{[^}]*border:\s*var\(--container-border\);[^}]*border-radius:\s*var\(--container-radius\);/s);
  assert.match(folderStyles, /\.bookmark-folder__preview\s*\{[^}]*border:\s*var\(--container-border\);[^}]*border-radius:\s*var\(--container-radius\);/s);
  assert.match(dockStyles, /\.bookmark-dock\s*\{[^}]*border:\s*var\(--container-border\);[^}]*border-radius:\s*var\(--container-radius\);/s);
});
