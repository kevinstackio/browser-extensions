import { BOOKMARK_GRID, DOCK_FAVORITES } from '../../constants/bookmarks.js';
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
    // Grid 与 Dock 分别消费具名数据源，避免页面依赖书签配置内部结构。
    renderBookmarks(document, bookmarks, BOOKMARK_GRID);
  }

  if (dock) {
    renderBookmarkDock(document, dock, DOCK_FAVORITES);
  }
}

if (typeof document !== 'undefined') {
  installBookmarks(document);
}
