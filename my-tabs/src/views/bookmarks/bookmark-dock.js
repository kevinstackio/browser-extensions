import { createBookmarkCard } from '../../components/bookmark-card/index.js';
import { createBookmarkList } from '../../components/bookmark-list/index.js';
import { createBookmarkPopover } from '../../components/bookmark-popover/index.js';
import { getExtensionAsset } from '../../utils/common.js';

/**
 * 将固定书签列表渲染为页面底部的 Dock。
 *
 * @param {Document} document 用于创建 Dock 节点的页面文档。
 * @param {HTMLElement} container 接收底部 Dock 的容器节点。
 * @param {Array<object>} favorites 要固定展示的普通书签列表。
 * @param {{name: string, icon: string}} devtools DevTools 聚合书签配置。
 * @returns {void}
 */
export function renderBookmarkDock(document, container, favorites, devtools) {
  const dock = document.createElement('nav');
  const favoritesArea = document.createElement('div');
  const divider = document.createElement('span');
  const toolsArea = document.createElement('div');
  const toolButton = document.createElement('button');
  const iconContainer = document.createElement('span');
  const icon = document.createElement('img');
  const toolList = createBookmarkList(document, devtools.bookmarks);
  const popover = createBookmarkPopover(document, toolButton, toolList);

  dock.className = 'bookmark-dock';
  dock.setAttribute('aria-label', '固定书签');
  favoritesArea.className = 'bookmark-dock__favorites';
  favoritesArea.append(...favorites.map((bookmark) => createBookmarkCard(document, bookmark)));
  divider.className = 'bookmark-dock__divider';
  divider.setAttribute('aria-hidden', 'true');
  toolsArea.className = 'bookmark-dock__tools';
  // 仅提供可聚焦的聚合入口；Popover 与工具列表交互由 KEV-86 接入。
  toolButton.className = 'bookmark-card bookmark-dock__tool';
  toolButton.setAttribute('type', 'button');
  toolButton.setAttribute('aria-label', `打开 ${devtools.name} 工具列表`);
  toolButton.setAttribute('aria-expanded', 'false');
  iconContainer.className = 'bookmark-card__icon';
  icon.setAttribute('src', getExtensionAsset(devtools.icon));
  icon.setAttribute('alt', '');
  icon.setAttribute('aria-hidden', 'true');
  iconContainer.append(icon);
  toolButton.append(iconContainer);
  // 聚合入口与浮层同属工具区，供 View 负责定位而不泄漏到通用组件。
  toolsArea.append(toolButton, popover.element);
  dock.append(favoritesArea, divider, toolsArea);
  container.append(dock);
}
