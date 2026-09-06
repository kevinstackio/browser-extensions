import { BOOKMARKS } from '../../constants/bookmarks.js';
import { renderBookmarks } from '../bookmarks/index.js';

/**
 * 在首页存在书签挂载点时初始化全部快捷入口。
 *
 * @param {Document} document 要查询和更新的首页文档。
 * @returns {void}
 */
export function installBookmarks(document) {
  const container = document.querySelector('[data-bookmarks]');

  if (container) {
    renderBookmarks(document, container, BOOKMARKS);
  }
}

if (typeof document !== 'undefined') {
  installBookmarks(document);
}
