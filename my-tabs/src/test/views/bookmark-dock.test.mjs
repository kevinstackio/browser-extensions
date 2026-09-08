import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DOCK_DEVTOOLS, DOCK_FAVORITES } from '../../constants/bookmarks.js';
import { renderBookmarkDock } from '../../views/bookmarks/bookmark-dock.js';

// 以最小 DOM 实现模拟 Dock View 所需的元素行为。
class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.attributes = new Map();
    this.className = '';
    this.listeners = new Map();
  }

  append(...children) {
    this.children.push(...children);
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  addEventListener(name, listener) {
    this.listeners.set(name, listener);
  }

  focus() {}
}

/**
 * 创建仅包含 Dock View 所需能力的测试文档。
 *
 * @returns {{createElement: (tagName: string) => FakeElement}} 最小 DOM 文档替身。
 */
function createDocument() {
  return {
    createElement: (tagName) => new FakeElement(tagName),
  };
}

// 验证 Dock View 将固定书签委托给 Dock 组件渲染。
test('Dock View 渲染收藏区与 DevTools 聚合入口', () => {
  const document = createDocument();
  const container = document.createElement('aside');

  renderBookmarkDock(document, container, DOCK_FAVORITES, DOCK_DEVTOOLS);

  assert.equal(container.children[0].className, 'bookmark-dock');
  assert.equal(container.children[0].children[0].className, 'bookmark-dock__favorites');
  assert.equal(container.children[0].children[0].children.length, DOCK_FAVORITES.length);
  assert.equal(container.children[0].children[1].className, 'bookmark-dock__divider');
  assert.equal(container.children[0].children[2].className, 'bookmark-dock__tools');
  assert.equal(container.children[0].children[2].children[0].tagName, 'button');
  assert.equal(container.children[0].children[2].children[0].attributes.get('aria-label'), '打开 DevTools 工具列表');
  assert.equal(container.children[0].children[2].children[0].attributes.get('aria-expanded'), 'false');
  assert.equal(container.children[0].children[2].children[1].className, 'bookmark-popover');
  assert.equal(container.children[0].children[2].children[1].children[0].className, 'bookmark-list');
});

// 验证 Dock View 将布局样式与页面入口共同维护。
test('Dock View 使用左右分区和 64 像素分隔线', async () => {
  const styles = await readFile(
    new URL('../../views/bookmarks/bookmark-dock.css', import.meta.url),
    'utf8',
  );

  assert.match(styles, /\.bookmark-dock__divider\s*\{[^}]*width:\s*1px;[^}]*height:\s*64px;[^}]*background:\s*#e4e4e7;/s);
  assert.match(styles, /\.bookmark-dock__favorites\s*\{[^}]*display:\s*flex;[^}]*gap:\s*8px;/s);
  assert.match(styles, /\.bookmark-dock__tools \.bookmark-popover\s*\{[^}]*left:\s*50%;[^}]*transform:\s*translateX\(-50%\);/s);
});
