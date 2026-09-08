import { BOOKMARK_GRID, DOCK_FAVORITES } from '../../constants/bookmarks.js';
import { renderBookmarkDock } from '../bookmarks/bookmark-dock.js';
import { renderBookmarkGrid } from '../bookmarks/bookmark-grid.js';

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
    // Grid 负责内部书签渲染，Home 只组合数据源和挂载点。
    renderBookmarkGrid(document, bookmarks, BOOKMARK_GRID);
  }

  if (dock) {
    renderBookmarkDock(document, dock, DOCK_FAVORITES);
  }
}

if (typeof document !== 'undefined') {
  installBookmarks(document);
}
