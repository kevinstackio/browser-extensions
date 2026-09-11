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
  assert.equal(folder.children[0].children.length, 4);
  assert.equal(folder.children[0].children[0].tagName, 'a');
  assert.equal(folder.children[0].children[0].className, 'bookmark-card');
  assert.equal(folder.children[0].children[0].attributes.get('href'), 'https://x.com');
  assert.equal(folder.children[0].children[1].className, 'bookmark-folder__placeholder');
  assert.equal(folder.children[0].children[1].attributes.get('aria-hidden'), 'true');
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

// 验证配置为 blur 的文件夹默认显示遮罩，点击遮罩后才能操作内部书签。
test('带 blur 配置的文件夹点击后解除模糊层', () => {
  const edu = {
    name: 'EDU',
    blur: true,
    items: [
      {
        id: 'pmi',
        name: 'PMI',
        url: 'https://www.pmi.org/',
        icon: 'brand/text-pmi.svg',
      },
    ],
  };
  const folder = createBookmarkFolder(createDocument(), edu, () => {});
  const preview = folder.children[0];
  const blurButton = preview.children.at(-1);

  assert.match(folder.className, /bookmark-folder--blurred/);
  assert.equal(blurButton.className, 'bookmark-folder__blur');
  assert.equal(blurButton.attributes.get('aria-label'), '点击显示 EDU 书签');
  assert.equal(blurButton.children.length, 1);
  assert.equal(blurButton.children[0].tagName, 'img');
  assert.equal(blurButton.children[0].attributes.get('src'), 'src/assets/icons/brush-cleaning.svg');
  assert.equal(blurButton.children[0].attributes.get('aria-hidden'), 'true');

  blurButton.listeners.get('click')({
    prevented: false,
    preventDefault() { this.prevented = true; },
  });

  assert.equal(folder.className, 'bookmark-folder');
  assert.equal(blurButton.className, 'bookmark-folder__blur bookmark-folder__blur--hidden');
});

// 验证文件夹由固定内边距和内部书签间距自然撑开。
test('书签文件夹不设宽高并使用固定的内部间距', async () => {
  const styles = await readFile(
    new URL('../../components/bookmark-folder/index.css', import.meta.url),
    'utf8',
  );

  assert.match(styles, /\.bookmark-folder\s*\{[^}]*box-sizing:\s*border-box;[^}]*display:\s*grid;[^}]*justify-self:\s*start;/s);
  assert.doesNotMatch(styles, /\.bookmark-folder\s*\{[^}]*grid-(column|row):/s);
  assert.doesNotMatch(styles, /\.bookmark-folder\s*\{[^}]*\b(width|height):/s);
  assert.match(styles, /\.bookmark-folder__preview\s*\{[^}]*box-sizing:\s*border-box;[^}]*grid-template-columns:\s*repeat\(2,\s*64px\);[^}]*gap:\s*16px;[^}]*padding:\s*16px;[^}]*border-radius:\s*16px;/s);
  assert.doesNotMatch(styles, /\.bookmark-folder__blur:hover,\s*\.bookmark-folder__blur:focus-visible\s*\{/s);
  assert.match(styles, /\.bookmark-folder__blur:hover img,\s*\.bookmark-folder__blur:focus-visible img\s*\{[^}]*transform:\s*translateY\(-2px\) scale\(1\.08\);/s);
  assert.match(styles, /\.bookmark-folder \.bookmark-card\s*\{[^}]*box-sizing:\s*border-box;[^}]*width:\s*64px;[^}]*height:\s*64px;/s);
  assert.match(styles, /\.bookmark-folder__placeholder\s*\{[^}]*box-sizing:\s*border-box;[^}]*width:\s*64px;[^}]*height:\s*64px;/s);
  assert.match(styles, /\.bookmark-folder \.bookmark-card__name\s*\{[^}]*display:\s*none;/s);
});
