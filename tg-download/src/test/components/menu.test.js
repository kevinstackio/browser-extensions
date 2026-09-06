const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

/**
 * 创建菜单测试所需的最小 DOM 节点实现。
 *
 * @param {string} tagName 节点标签名。
 * @returns {object} 具备菜单代码所需方法和状态的节点替身。
 */
function node(tagName) {
  return { tagName, children: [], style: {}, append(...items) { this.children.push(...items); }, addEventListener(type, listener) { (this.listeners ||= {})[type] = listener; }, remove() { this.removed = true; } };
}

// 验证右下角打开菜单时会回退到可视区域。
test('菜单坐标会限制在视口内', () => {
  const sandbox = { globalThis: null };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../components/menu/index.js'), 'utf8'), sandbox);
  const position = sandbox.TgDownload.menuPosition({ x: 980, y: 780 }, { width: 200, height: 120 }, { width: 1000, height: 800 });
  assert.equal(position.left, 800);
  assert.equal(position.top, 680);
});

// 验证下载状态会禁用菜单项。
test('菜单显示下载状态并禁止重复点击', () => {
  const body = node('body');
  const document = { body, createElement: node };
  const sandbox = { globalThis: null };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../components/menu/index.js'), 'utf8'), sandbox);
  const menu = sandbox.TgDownload.createMenu(document, () => {});
  menu.open({ x: 10, y: 10 });
  menu.loading();
  assert.equal(body.children[0].children[0].disabled, true);
});
