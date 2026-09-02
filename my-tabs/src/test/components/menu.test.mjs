import test from 'node:test';
import assert from 'node:assert/strict';
import { createContextMenu, getMenuPosition } from '../../components/menu/index.js';
import { createIcon } from '../../components/icon/index.js';

// 以最小 DOM 实现模拟菜单所需的元素行为。
class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.listeners = new Map();
    this.style = {};
    this.attributes = new Map();
    this.offsetWidth = 200;
    this.offsetHeight = 120;
  }

  append(...children) {
    this.children.push(...children);
    for (const child of children) child.parent = this;
  }

  remove() {
    this.parent.children = this.parent.children.filter((child) => child !== this);
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  click() {
    this.listeners.get('click')();
  }
}

// 创建具备视口尺寸的测试文档。
function createDocument() {
  const body = new FakeElement('body');
  const documentElement = new FakeElement('html');
  documentElement.clientWidth = 1000;
  documentElement.clientHeight = 800;
  return {
    body,
    documentElement,
    createElement: (tagName) => new FakeElement(tagName),
  };
}

// 验证菜单信息架构：新建在首项，设置位于底部。
test('菜单首项是新建且底部固定项是设置', () => {
  const document = createDocument();
  const menu = createContextMenu(document);

  menu.open({ x: 120, y: 160 });

  const card = document.body.children[0];
  assert.equal(card.children[0].children[1].textContent, '新建');
  assert.equal(card.children[1].children[0].children[1].textContent, '设置');
});

// 当前新建功能尚未实现，点击后仅关闭菜单。
test('点击新建只关闭菜单，不创建页面内容', () => {
  const document = createDocument();
  const menu = createContextMenu(document);

  menu.open({ x: 120, y: 160 });
  document.body.children[0].children[0].click();

  assert.equal(document.body.children.length, 0);
});

// 验证靠近右下边缘时菜单会回退到可见区域。
test('菜单定位不会越过视口右下边缘', () => {
  assert.deepEqual(
    getMenuPosition(
      { x: 980, y: 780 },
      { width: 200, height: 120 },
      { width: 1000, height: 800 },
    ),
    { left: 800, top: 680 },
  );
});

// 验证图标地址必须经由扩展资源公共方法生成。
test('图标通过扩展根路径访问 Lucide 静态资源', () => {
  const document = createDocument();
  const originalChrome = globalThis.chrome;
  globalThis.chrome = { runtime: { getURL: (path) => `chrome-extension://mytabs/${path}` } };

  const icon = createIcon(document, 'settings');
  globalThis.chrome = originalChrome;

  assert.equal(icon.attributes.get('src'), 'chrome-extension://mytabs/src/assets/icons/settings.svg');
});
