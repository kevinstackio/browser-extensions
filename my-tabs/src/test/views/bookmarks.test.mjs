import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { BOOKMARKS } from '../../constants/bookmarks.js';
import { renderBookmarkDock, renderBookmarks } from '../../views/bookmarks/index.js';

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

  addEventListener() {}
}

/**
 * 创建仅包含书签集合渲染所需能力的测试文档。
 *
 * @returns {{createElement: (tagName: string) => FakeElement}} 最小 DOM 文档替身。
 */
function createDocument() {
  return {
    createElement: (tagName) => new FakeElement(tagName),
  };
}

// 验证集合视图按配置顺序渲染社交媒体、DevOps 与 PM 文件夹。
test('书签集合渲染三个分类文件夹', () => {
  const document = createDocument();
  const container = document.createElement('section');

  renderBookmarks(document, container, BOOKMARKS.grid);

  assert.equal(container.className, 'bookmarks');
  assert.equal(container.children.length, BOOKMARKS.grid.length);
  assert.equal(container.children[0].className, 'bookmark-folder');
  assert.equal(container.children[0].children[0].children.length, 4);
  assert.equal(container.children[0].children[0].children[0].attributes.get('href'), 'https://x.com');
  assert.equal(container.children[1].children[1].textContent, 'DevOps');
  assert.equal(container.children[1].children[0].children[0].attributes.get('href'), 'https://www.namecheap.com');
  assert.equal(container.children[2].children[1].textContent, 'PM');
  assert.equal(container.children[2].children[0].children[0].attributes.get('href'), 'https://linear.app');
});

// 验证书签视图将固定书签委托给 Dock 组件渲染。
test('书签集合渲染固定 Dock', () => {
  const document = createDocument();
  const container = document.createElement('aside');

  renderBookmarkDock(document, container, BOOKMARKS.dock);

  assert.equal(container.children[0].className, 'bookmark-dock');
  assert.equal(container.children[0].children[0].children.length, 2);
});

// 验证页面以分类文件夹为单位从左上角自动换行排列。
test('书签集合从左上角按文件夹自动换行排列', async () => {
  const styles = await readFile(
    new URL('../../views/bookmarks/index.css', import.meta.url),
    'utf8',
  );

  assert.match(styles, /\.bookmarks-page\s*\{[^}]*display:\s*block;/s);
  assert.match(styles, /\.bookmarks-page\s*\{[^}]*padding:\s*24px;/s);
  assert.match(styles, /\.bookmarks\s*\{[^}]*display:\s*flex;[^}]*box-sizing:\s*border-box;[^}]*flex-wrap:\s*wrap;[^}]*align-items:\s*flex-start;[^}]*gap:\s*24px;/s);
  assert.doesNotMatch(styles, /grid-template-columns|grid-auto-rows|grid-auto-flow/);
});
