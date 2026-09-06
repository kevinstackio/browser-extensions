import { createBookmarkItem } from '../bookmark-item/index.js';

export function createBookmarkFolder(document, folder) {
  const element = document.createElement('section');
  const preview = document.createElement('div');
  const name = document.createElement('span');

  element.className = 'bookmark-folder';
  element.setAttribute('aria-label', folder.name);
  preview.className = 'bookmark-folder__preview';
  preview.append(...folder.items.map((bookmark) => createBookmarkItem(document, bookmark)));
  name.className = 'bookmark-folder__name';
  name.textContent = folder.name;
  element.append(preview, name);

  return element;
}
