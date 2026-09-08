import { createBookmarkFolder } from '../../components/bookmark-folder/index.js';
import { createBookmarkDock } from '../../components/bookmark-dock/index.js';
import { createBookmarkCard } from '../../components/bookmark-card/index.js';
import { openBookmarkInGroup } from '../../utils/tab.js';

/**
 * 将书签配置按顺序渲染到页面中的快捷入口容器。
 *
 * @param {Document} document 用于创建书签与文件夹节点的页面文档。
 * @param {HTMLElement} container 接收书签网格内容的容器节点。
 * @param {Array<object>} bookmarks 书签或书签文件夹的配置列表。
 * @returns {void}
 */
export function renderBookmarks(document, container, bookmarks) {
  container.className = 'bookmarks';
  container.append(...bookmarks.map((item) => (
    item.type === 'folder'
      ? createBookmarkFolder(
        document,
        item,
        // 文件夹内每个书签独立打开，并以文件夹名称定位 Chrome 标签组。
        (folder, bookmark) => openBookmarkInGroup(chrome, folder, bookmark),
      )
      : createBookmarkCard(document, item)
  )));
}

/**
 * 将固定书签列表渲染为页面底部的 Dock。
 *
 * @param {Document} document 用于创建 Dock 节点的页面文档。
 * @param {HTMLElement} container 接收底部 Dock 的容器节点。
 * @param {Array<object>} bookmarks 要固定展示的普通书签列表。
 * @returns {void}
 */
export function renderBookmarkDock(document, container, bookmarks) {
  container.append(createBookmarkDock(document, bookmarks));
}
