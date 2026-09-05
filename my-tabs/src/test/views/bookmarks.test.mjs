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

// 验证集合视图将文件夹置于左侧，并保留其中每个书签的链接行为。
test('书签集合渲染社交媒体文件夹与右侧单书签', () => {
  const document = createDocument();
  const container = document.createElement('section');

  renderBookmarks(document, container, BOOKMARKS);

  assert.equal(container.className, 'bookmarks');
  assert.equal(container.children.length, BOOKMARKS.length);
  assert.equal(container.children[0].className, 'bookmark-folder');
  assert.equal(container.children[0].children.length, 4);
  assert.equal(container.children[0].children[0].attributes.get('href'), 'https://x.com');
  assert.equal(container.children[0].children.at(-1).attributes.get('href'), 'https://linear.app');
  assert.equal(container.children[1].attributes.get('href'), 'https://github.com');
  assert.equal(container.children.at(-1).attributes.get('href'), 'https://vercel.com');
});
