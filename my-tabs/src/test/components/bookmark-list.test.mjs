import test from 'node:test';
import assert from 'node:assert/strict';
import { createBookmarkList } from '../../components/bookmark-list/index.js';

class FakeElement {
  constructor(tagName) { this.tagName = tagName; this.children = []; this.attributes = new Map(); this.className = ''; this.textContent = ''; this.listeners = new Map(); }
  append(...children) { this.children.push(...children); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  addEventListener(name, listener) { this.listeners.set(name, listener); }
}

test('书签列表将工具配置渲染为安全的新标签页链接', () => {
  const originalChrome = globalThis.chrome;
  globalThis.chrome = { runtime: { getURL: (path) => `chrome-extension://mytabs/${path}` } };
  try {
    const document = { createElement: (tagName) => new FakeElement(tagName) };
    const list = createBookmarkList(document, [{ name: 'Google Translate', url: 'https://translate.google.com', icon: 'brand/googletranslate.svg' }]);
    const link = list.children[0].children[0];
    assert.equal(list.className, 'bookmark-list');
    assert.equal(link.attributes.get('target'), '_blank');
    assert.equal(link.attributes.get('rel'), 'noopener noreferrer');
    assert.equal(link.children[1].textContent, 'Google Translate');
  } finally { globalThis.chrome = originalChrome; }
});

test('书签列表可将点击事件交给外层处理，而不耦合浏览器业务', () => {
  const document = { createElement: (tagName) => new FakeElement(tagName) };
  const bookmark = { name: 'Google Translate', url: 'https://translate.google.com', icon: 'brand/googletranslate.svg' };
  let selectedBookmark;
  let prevented = false;
  const list = createBookmarkList(document, [bookmark], (selected) => {
    selectedBookmark = selected;
  });

  list.children[0].children[0].listeners.get('click')({
    preventDefault() { prevented = true; },
  });

  assert.equal(prevented, true);
  assert.equal(selectedBookmark, bookmark);
});
