import { BOOKMARKS } from '../../constants/bookmarks.js';
import { renderBookmarks } from '../bookmarks/index.js';

export function installBookmarks(document) {
  // 首页只在书签挂载节点存在时渲染快捷入口。
  const container = document.querySelector('[data-bookmarks]');

  if (container) {
    renderBookmarks(document, container, BOOKMARKS);
  }
}

if (typeof document !== 'undefined') {
  installBookmarks(document);
}
