import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { BOOKMARK_GRID, DOCK_FAVORITES } from '../../constants/bookmarks.js';
import { installBookmarks } from '../../views/home/index.js';

// 以最小 DOM 实现模拟首页书签挂载所需的元素行为。
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

  addEventListener() {}
}

/**
 * 创建带有首页书签挂载点的测试文档。
 *
 * @returns {{createElement: Function, querySelector: Function, container: FakeElement}} 首页最小 DOM 文档替身。
 */
function createDocument() {
  const bookmarks = new FakeElement('section');
  const dock = new FakeElement('aside');
  return {
    createElement: (tagName) => new FakeElement(tagName),
    querySelector: (selector) => ({
      '[data-bookmarks]': bookmarks,
      '[data-bookmark-dock]': dock,
    })[selector] || null,
    bookmarks,
    dock,
  };
}

// 验证首页分别挂载主书签网格与固定 Dock。
test('首页挂载主书签网格与固定 Dock', () => {
  const document = createDocument();

  installBookmarks(document);

  assert.equal(document.bookmarks.children.length, BOOKMARK_GRID.length);
  assert.equal(document.dock.children[0].className, 'bookmark-dock');
  assert.equal(document.dock.children[0].children[0].children.length, DOCK_FAVORITES.length);
});

// 验证首页私有样式只负责页面容器的内边距和最小高度。
test('首页使用独立页面容器样式', async () => {
  const styles = await readFile(
    new URL('../../views/home/index.css', import.meta.url),
    'utf8',
  );

  assert.match(styles, /\.bookmarks-page\s*\{[^}]*display:\s*block;[^}]*min-height:\s*100vh;[^}]*box-sizing:\s*border-box;[^}]*padding:\s*24px;/s);
});
