import test from 'node:test';
import assert from 'node:assert/strict';
import { DOCK_FAVORITES } from '../../constants/bookmarks.js';
import { renderBookmarkDock } from '../../views/bookmarks/bookmark-dock.js';

// 以最小 DOM 实现模拟 Dock View 所需的元素行为。
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
test('Dock View 渲染固定书签', () => {
  const document = createDocument();
  const container = document.createElement('aside');

  renderBookmarkDock(document, container, DOCK_FAVORITES);

  assert.equal(container.children[0].className, 'bookmark-dock');
  assert.equal(container.children[0].children[0].children.length, 2);
});
