import { createBookmarkItem } from '../bookmark-item/index.js';

export function createBookmarkFolder(document, folder) {
  // 文件夹只承载书签分组，不改变内部书签的链接交互。
  const element = document.createElement('section');

  element.className = 'bookmark-folder';
  element.setAttribute('aria-label', folder.name);
  element.append(...folder.items.map((bookmark) => createBookmarkItem(document, bookmark)));

  return element;
}
