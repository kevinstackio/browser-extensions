import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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

// 验证集合视图保留配置顺序，并渲染独立的 Linear 书签。
test('书签集合渲染社交媒体文件夹与独立书签', () => {
  const document = createDocument();
  const container = document.createElement('section');

  renderBookmarks(document, container, BOOKMARKS);

  assert.equal(container.className, 'bookmarks');
  assert.equal(container.children.length, BOOKMARKS.length);
  assert.equal(container.children[0].className, 'bookmark-folder');
  assert.equal(container.children[0].children[0].children.length, 3);
  assert.equal(container.children[0].children[0].children[0].attributes.get('href'), 'https://x.com');
  assert.equal(container.children[1].attributes.get('href'), 'https://linear.app');
  assert.equal(container.children.at(-1).attributes.get('href'), 'https://vercel.com');
});

// 验证页面从左上角开始，以行优先的网格排布书签。
test('书签集合从左上角按从左到右顺序排列', async () => {
  const styles = await readFile(
    new URL('../../views/bookmarks/bookmarks.css', import.meta.url),
    'utf8',
  );

  assert.match(styles, /\.bookmarks-page\s*\{[^}]*display:\s*block;/s);
  assert.match(styles, /\.bookmarks\s*\{[^}]*grid-template-columns:\s*repeat\(auto-fill,\s*88px\);[^}]*grid-auto-rows:\s*104px;[^}]*grid-auto-flow:\s*row;[^}]*justify-content:\s*start;/s);
});
