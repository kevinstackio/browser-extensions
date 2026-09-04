import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOKMARKS } from '../../constants/bookmarks.js';
import { renderBookmarks } from '../../views/bookmarks/index.js';

// 以最小 DOM 实现模拟书签集合所需的元素行为。
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
  return {
    createElement: (tagName) => new FakeElement(tagName),
  };
}

// 验证集合视图会按配置顺序渲染全部书签。
test('书签集合渲染全部品牌入口', () => {
  const document = createDocument();
  const container = document.createElement('section');

  renderBookmarks(document, container, BOOKMARKS);

  assert.equal(container.className, 'bookmarks');
  assert.equal(container.children.length, BOOKMARKS.length);
  assert.equal(container.children[0].attributes.get('href'), 'https://github.com');
  assert.equal(container.children.at(-1).attributes.get('href'), 'https://x.com');
});
