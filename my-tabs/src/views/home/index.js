import { BOOKMARKS } from '../../constants/bookmarks.js';
import { renderBookmarkDock, renderBookmarks } from '../bookmarks/index.js';

/**
 * 在首页存在挂载点时初始化主书签网格与底部固定 Dock。
 *
 * @param {Document} document 要查询和更新的首页文档。
 * @returns {void}
 */
export function installBookmarks(document) {
  const bookmarks = document.querySelector('[data-bookmarks]');
  const dock = document.querySelector('[data-bookmark-dock]');

  if (bookmarks) {
    renderBookmarks(document, bookmarks, BOOKMARKS.grid);
  }

  if (dock) {
    renderBookmarkDock(document, dock, BOOKMARKS.dock);
  }
}

if (typeof document !== 'undefined') {
  installBookmarks(document);
}
