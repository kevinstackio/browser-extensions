import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { BOOKMARK_GRID } from '../../constants/bookmarks.js';
import { renderBookmarkGrid } from '../../views/bookmarks/bookmark-grid.js';

// 以最小 DOM 实现模拟 Grid View 所需的元素行为。
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

function createDocument() {
  return { createElement: (tagName) => new FakeElement(tagName) };
}

// 验证独立 Grid View 以文件夹顺序渲染首页书签。
test('独立 Grid View 渲染首页书签文件夹', () => {
  const document = createDocument();
  const container = document.createElement('section');

  renderBookmarkGrid(document, container, BOOKMARK_GRID);

  assert.equal(container.className, 'bookmarks');
  assert.equal(container.children.length, BOOKMARK_GRID.length);
  assert.equal(container.children[0].className, 'bookmark-folder');
  assert.equal(container.children[0].children[0].children.length, 4);
  assert.equal(container.children[2].children[1].textContent, 'PM');
});

// 验证 Grid 视图独立维护自适应换行布局。
test('独立 Grid View 使用文件夹自动换行布局', async () => {
  const styles = await readFile(
    new URL('../../views/bookmarks/bookmark-grid.css', import.meta.url),
    'utf8',
  );

  assert.match(styles, /\.bookmarks\s*\{[^}]*display:\s*flex;[^}]*box-sizing:\s*border-box;[^}]*flex-wrap:\s*wrap;[^}]*align-items:\s*flex-start;[^}]*gap:\s*24px;/s);
  assert.doesNotMatch(styles, /grid-template-columns|grid-auto-rows|grid-auto-flow/);
});
