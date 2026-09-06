import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createBookmarkFolder } from '../../components/bookmark-folder/index.js';

// 以最小 DOM 实现模拟书签文件夹所需的元素行为。
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

  addEventListener(name, listener) {
    this.listeners.set(name, listener);
  }
}

/**
 * 创建仅包含书签文件夹所需能力的测试文档。
 *
 * @returns {{createElement: (tagName: string) => FakeElement}} 最小 DOM 文档替身。
 */
function createDocument() {
  return {
    createElement: (tagName) => new FakeElement(tagName),
  };
}

// 验证文件夹中的单个书签打开后加入所属标签组。
test('书签文件夹点击单个图标后加入标签组', async () => {
  const socialMedia = {
    name: 'Social Media',
    items: [
      {
        id: 'x',
        name: 'X',
        url: 'https://x.com',
        icon: 'brand/x.svg',
      },
    ],
  };
  const openedBookmarks = [];
  const folder = createBookmarkFolder(
    createDocument(),
    socialMedia,
    async (targetFolder, bookmark) => openedBookmarks.push({ targetFolder, bookmark }),
  );

  assert.equal(folder.className, 'bookmark-folder');
  assert.equal(folder.tagName, 'section');
  assert.equal(folder.attributes.get('aria-label'), 'Social Media');
  assert.equal(folder.listeners.size, 0);
  assert.equal(folder.children.length, 2);
  assert.equal(folder.children[0].className, 'bookmark-folder__preview');
  assert.equal(folder.children[0].children[0].tagName, 'a');
  assert.equal(folder.children[0].children[0].attributes.get('href'), 'https://x.com');
  assert.equal(folder.children[1].className, 'bookmark-folder__name');
  assert.equal(folder.children[1].textContent, 'Social Media');
  const event = { prevented: false, preventDefault() { this.prevented = true; } };

  await folder.children[0].children[0].listeners.get('click')(event);

  assert.equal(event.prevented, true);
  assert.deepEqual(openedBookmarks, [{
    targetFolder: socialMedia,
    bookmark: socialMedia.items[0],
  }]);
});

// 验证文件夹占用四个网格位，并将内容收纳为紧凑图标预览。
test('书签文件夹以紧凑图标预览占用四个网格位', async () => {
  const styles = await readFile(
    new URL('../../components/bookmark-folder/bookmark-folder.css', import.meta.url),
    'utf8',
  );

  assert.match(styles, /\.bookmark-folder\s*\{[^}]*grid-column:\s*span 2;[^}]*grid-row:\s*span 2;[^}]*width:\s*200px;/s);
  assert.match(styles, /\.bookmark-folder__preview\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*72px\);[^}]*align-content:\s*space-between;[^}]*justify-content:\s*space-between;/s);
  assert.match(styles, /\.bookmark-folder \.bookmark-item\s*\{[^}]*width:\s*72px;/s);
  assert.match(styles, /\.bookmark-folder \.bookmark-item__name\s*\{[^}]*display:\s*none;/s);
});
