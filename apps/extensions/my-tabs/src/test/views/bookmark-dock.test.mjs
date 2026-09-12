import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DOCK_COMPONENTS, DOCK_DEVTOOLS, DOCK_FAVORITES } from '../../constants/bookmarks.js';
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
test('Dock 将 Components 聚合入口置于 DevTools 左侧', () => {
  const document = createDocument();
  const container = document.createElement('aside');

  renderBookmarkDock(document, container, DOCK_FAVORITES, DOCK_COMPONENTS, DOCK_DEVTOOLS);

  assert.equal(container.children[0].className, 'bookmark-dock');
  assert.equal(container.children[0].children[0].className, 'bookmark-dock__favorites');
  assert.equal(container.children[0].children[0].children.length, DOCK_FAVORITES.length);
  assert.equal(container.children[0].children[1].className, 'bookmark-dock__divider');
  assert.equal(container.children[0].children[2].className, 'bookmark-dock__tools');
  assert.equal(container.children[0].children[2].children.length, 2);
  assert.equal(container.children[0].children[2].children[0].children[0].tagName, 'button');
  assert.equal(container.children[0].children[2].children[0].children[0].attributes.get('aria-label'), '打开 Components 工具列表');
  assert.equal(container.children[0].children[2].children[1].children[0].attributes.get('aria-label'), '打开 DevTools 工具列表');
});

test('Dock 中选择 DevTools 工具后复用标签组工具并随机设置首个组颜色', async () => {
  const originalChrome = globalThis.chrome;
  const calls = { created: null, grouped: null, updated: null };
  globalThis.chrome = {
    runtime: { getURL: (path) => `chrome-extension://mytabs/${path}` },
    tabs: {
      create: async (options) => {
        calls.created = options;
        return { id: 1, windowId: 2 };
      },
      group: async (options) => {
        calls.grouped = options;
        return 3;
      },
    },
    tabGroups: {
      query: async () => [],
      update: async (groupId, options) => { calls.updated = { groupId, options }; },
    },
  };
  try {
    const document = createDocument();
    const container = document.createElement('aside');
    renderBookmarkDock(document, container, DOCK_FAVORITES, DOCK_COMPONENTS, DOCK_DEVTOOLS);
    const toolLink = container.children[0].children[2].children[1].children[1].children[0].children[0].children[0];
    let prevented = false;

    await toolLink.listeners.get('click')({ preventDefault() { prevented = true; } });

    assert.equal(prevented, true);
    assert.deepEqual(calls.created, { url: DOCK_DEVTOOLS.bookmarks[0].url, active: true });
    assert.deepEqual(calls.grouped, { tabIds: [1] });
    assert.equal(calls.updated.groupId, 3);
    assert.equal(calls.updated.options.title, 'DevTools');
  } finally {
    globalThis.chrome = originalChrome;
  }
});

// 验证 Dock View 将布局样式与页面入口共同维护。
test('Dock View 使用收藏分隔线，并让工具分组无分割线并列', async () => {
  const styles = await readFile(
    new URL('../../views/bookmarks/bookmark-dock.css', import.meta.url),
    'utf8',
  );

  assert.match(styles, /\.bookmark-dock__divider\s*\{[^}]*width:\s*1px;[^}]*height:\s*64px;[^}]*background:\s*#e4e4e7;/s);
  assert.match(styles, /\.bookmark-dock__favorites\s*\{[^}]*display:\s*flex;[^}]*gap:\s*8px;/s);
  assert.match(styles, /\.bookmark-dock__tools\s*\{[^}]*display:\s*flex;[^}]*gap:\s*8px;/s);
  assert.match(styles, /\.bookmark-dock__group\s*\{[^}]*position:\s*relative;/s);
  assert.match(styles, /\.bookmark-dock__group \.popover\s*\{[^}]*left:\s*50%;[^}]*transform:\s*translateX\(-50%\);/s);
  assert.match(styles, /\.bookmark-dock__group \.popover\s*\{[^}]*min-width:\s*160px;/s);
  assert.doesNotMatch(styles, /\.bookmark-dock__tools\s*\{[^}]*border(?:-left|-right)?:/s);
  assert.match(styles, /\.bookmark-dock__tool\[aria-expanded='true'\] \.bookmark-card__icon\s*\{[^}]*transform:\s*none;/s);
});
