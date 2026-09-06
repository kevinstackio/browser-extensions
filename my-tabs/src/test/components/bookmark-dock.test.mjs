import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createBookmarkDock } from '../../components/bookmark-dock/index.js';

// 以最小 DOM 实现模拟底部 Dock 所需的元素行为。
class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.attributes = new Map();
    this.className = '';
  }

  append(...children) {
    this.children.push(...children);
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }
}

/**
 * 创建仅包含 Dock 渲染所需能力的测试文档。
 *
 * @returns {{createElement: (tagName: string) => FakeElement}} 最小 DOM 文档替身。
 */
function createDocument() {
  return { createElement: (tagName) => new FakeElement(tagName) };
}

// 验证 Dock 以单行图标栏渲染固定书签。
test('底部 Dock 渲染固定书签', () => {
  const dock = createBookmarkDock(createDocument(), [
    { id: 'github', name: 'GitHub', url: 'https://github.com', icon: 'brand/github.svg' },
  ]);

  assert.equal(dock.tagName, 'nav');
  assert.equal(dock.className, 'bookmark-dock');
  assert.equal(dock.attributes.get('aria-label'), '固定书签');
  assert.equal(dock.children[0].className, 'bookmark-dock__items');
  assert.equal(dock.children[0].children[0].attributes.get('href'), 'https://github.com');
  assert.equal(dock.children[0].children[0].attributes.get('target'), '_blank');
});

// 验证 Dock 固定在底部，并始终保持单行展示。
test('底部 Dock 使用固定单行布局', async () => {
  const styles = await readFile(
    new URL('../../components/bookmark-dock/bookmark-dock.css', import.meta.url),
    'utf8',
  );

  assert.match(styles, /\.bookmark-dock\s*\{[^}]*position:\s*fixed;[^}]*bottom:\s*24px;[^}]*left:\s*50%;[^}]*transform:\s*translateX\(-50%\);/s);
  assert.match(styles, /\.bookmark-dock__items\s*\{[^}]*display:\s*flex;[^}]*flex-wrap:\s*nowrap;/s);
});
