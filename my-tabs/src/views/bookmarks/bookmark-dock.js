import { createBookmarkDock } from '../../components/bookmark-dock/index.js';

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
