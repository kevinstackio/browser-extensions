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
}

function createDocument() {
  const container = new FakeElement('section');
  return {
    createElement: (tagName) => new FakeElement(tagName),
    querySelector: (selector) => (selector === '[data-bookmarks]' ? container : null),
    container,
  };
}

// 验证首页将书签集合挂载到指定容器。
test('首页挂载全部品牌书签', () => {
  const document = createDocument();

  installBookmarks(document);

  assert.equal(document.container.children.length, BOOKMARKS.length);
});
