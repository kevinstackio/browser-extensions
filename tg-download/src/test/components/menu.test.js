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
  return { tagName, children: [], style: {}, classList: { add(...names) { this.names ||= []; this.names.push(...names); } }, append(...items) { this.children.push(...items); }, addEventListener(type, listener) { (this.listeners ||= {})[type] = listener; }, setAttribute() {}, remove() { this.removed = true; } };
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
  const sandbox = { globalThis: null, document: { documentElement: { dataset: { tgDownloadAssetBase: 'chrome-extension://test/src/assets/' } } } };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../utils/common.js'), 'utf8'), sandbox);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../components/menu/index.js'), 'utf8'), sandbox);
  const menu = sandbox.TgDownload.createMenu(document, () => {});
  menu.open({ x: 10, y: 10 });
  assert.equal(body.children[0].children[0].children[1].textContent, '下载资源');
  menu.loading();
  assert.equal(body.children[0].children[0].disabled, true);
  assert.equal(body.children[0].children[0].children[1].textContent, '正在下载');
  menu.result('下载失败');
  assert.equal(body.children[0].children[0].children[1].textContent, '下载失败');
  menu.ready();
  assert.equal(body.children[0].children[0].children[1].textContent, '下载资源');
});

// 验证成功状态以淡出动画关闭菜单。
test('菜单可在 300ms 淡出后关闭', () => {
  const body = node('body');
  const document = { body, createElement: node };
  const delays = [];
  const sandbox = {
    globalThis: null,
    document: { documentElement: { dataset: { tgDownloadAssetBase: 'chrome-extension://test/src/assets/' } } },
    setTimeout: (callback, delay) => { delays.push(delay); callback(); },
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../utils/common.js'), 'utf8'), sandbox);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../components/menu/index.js'), 'utf8'), sandbox);
  const menu = sandbox.TgDownload.createMenu(document, () => {});
  menu.open({ x: 10, y: 10 });
  const card = body.children[0];
  menu.dismiss(300);
  assert.deepEqual(card.classList.names, ['tg-download-menu--leaving']);
  assert.deepEqual(delays, [300]);
  assert.equal(card.removed, true);
});
