import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOKMARKS } from '../../constants/bookmarks.js';
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

  assert.equal(document.bookmarks.children.length, BOOKMARKS.grid.length);
  assert.equal(document.dock.children[0].className, 'bookmark-dock');
});
