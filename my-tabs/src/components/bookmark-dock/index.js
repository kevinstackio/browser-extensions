import { createBookmarkItem } from '../bookmark-item/index.js';

/**
 * 创建固定在页面底部的单行常用书签 Dock。
 *
 * @param {Document} document 用于创建 DOM 节点的页面文档。
 * @param {Array<object>} bookmarks 要固定展示的普通书签列表。
 * @returns {HTMLElement} 包含单行书签的导航节点。
 */
export function createBookmarkDock(document, bookmarks) {
  const dock = document.createElement('nav');
  const items = document.createElement('div');

  dock.className = 'bookmark-dock';
  dock.setAttribute('aria-label', '固定书签');
  items.className = 'bookmark-dock__items';
  items.append(...bookmarks.map((bookmark) => createBookmarkItem(document, bookmark)));
  dock.append(items);

  return dock;
}
