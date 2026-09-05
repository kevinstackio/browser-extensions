import test from 'node:test';
import assert from 'node:assert/strict';
import { createBookmarkFolder } from '../../components/bookmark-folder/index.js';

// 以最小 DOM 实现模拟书签文件夹所需的元素行为。
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
}

function createDocument() {
  return {
    createElement: (tagName) => new FakeElement(tagName),
  };
}

// 验证文件夹会保留其内部书签原有的链接属性。
test('书签文件夹渲染分组内的可点击书签', () => {
  const folder = createBookmarkFolder(createDocument(), {
    name: '社交媒体',
    items: [
      {
        id: 'x',
        name: 'X',
        url: 'https://x.com',
        icon: 'brand/x.svg',
      },
    ],
  });

  assert.equal(folder.className, 'bookmark-folder');
  assert.equal(folder.attributes.get('aria-label'), '社交媒体');
  assert.equal(folder.children.length, 1);
  assert.equal(folder.children[0].attributes.get('href'), 'https://x.com');
  assert.equal(folder.children[0].attributes.get('target'), '_blank');
});
