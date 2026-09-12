import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// 验证首页以固定的 24 像素内边距作为书签布局起点。
test('首页使用固定内边距', async () => {
  const styles = await readFile(new URL('../views/home/index.css', import.meta.url), 'utf8');

  assert.match(styles, /\.bookmarks-page\s*\{[^}]*box-sizing:\s*border-box;[^}]*padding:\s*24px;/s);
  assert.doesNotMatch(styles, /@media/);
});
