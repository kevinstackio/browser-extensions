import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createBookmarkItem } from '../../components/bookmark-item/index.js';

// 以最小 DOM 实现模拟书签卡片所需的元素行为。
class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.attributes = new Map();
    this.className = '';
    this.textContent = '';
  }

  append(...children) {
    this.children.push(...children);
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }
}

/**
 * 创建仅包含书签组件所需能力的测试文档。
 *
 * @returns {{createElement: (tagName: string) => FakeElement}} 最小 DOM 文档替身。
 */
function createDocument() {
  return {
    createElement: (tagName) => new FakeElement(tagName),
  };
}

// 验证书签卡片使用扩展资源地址并安全地在新标签页打开链接。
test('书签卡片展示品牌图标与名称', () => {
  const originalChrome = globalThis.chrome;
  globalThis.chrome = {
    runtime: {
      getURL: (path) => `chrome-extension://mytabs/${path}`,
    },
  };

  try {
    const item = createBookmarkItem(createDocument(), {
      id: 'github',
      name: 'GitHub',
      url: 'https://github.com',
      icon: 'brand/github.svg',
    });

    assert.equal(item.tagName, 'a');
    assert.equal(item.className, 'bookmark-item');
    assert.equal(item.attributes.get('href'), 'https://github.com');
    assert.equal(item.attributes.get('target'), '_blank');
    assert.equal(item.attributes.get('rel'), 'noopener noreferrer');
    assert.equal(item.attributes.get('aria-label'), '在新标签页打开 GitHub');
    assert.equal(item.children[0].className, 'bookmark-item__icon');
    assert.equal(
      item.children[0].children[0].attributes.get('src'),
      'chrome-extension://mytabs/src/assets/brand/github.svg',
    );
    assert.equal(item.children[0].children[0].attributes.get('alt'), '');
    assert.equal(item.children[1].textContent, 'GitHub');
  } finally {
    globalThis.chrome = originalChrome;
  }
});

// 验证书签名称使用较高字重以提高辨识度。
test('书签名称使用加粗字重', async () => {
  const styles = await readFile(
    new URL('../../components/bookmark-item/index.css', import.meta.url),
    'utf8',
  );

  assert.match(styles, /\.bookmark-item__name\s*\{[^}]*font-weight:\s*600/s);
});

// 验证普通书签图标固定为 64 像素方形，SVG 保持居中的 32 像素尺寸。
test('书签图标使用固定尺寸与独立圆角', async () => {
  const styles = await readFile(
    new URL('../../components/bookmark-item/index.css', import.meta.url),
    'utf8',
  );

  assert.match(styles, /\.bookmark-item__icon\s*\{[^}]*box-sizing:\s*border-box;[^}]*width:\s*64px;[^}]*height:\s*64px;[^}]*border-radius:\s*16px;/s);
  assert.match(styles, /\.bookmark-item__icon img\s*\{[^}]*box-sizing:\s*border-box;[^}]*width:\s*32px;[^}]*height:\s*32px;/s);
});
