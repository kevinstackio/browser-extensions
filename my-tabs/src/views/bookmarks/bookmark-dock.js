import { createBookmarkCard } from '../../components/bookmark-card/index.js';
import { createBookmarkList } from '../../components/bookmark-list/index.js';
import { createPopover } from '../../components/popover/index.js';
import { getExtensionAsset } from '../../utils/common.js';
import { openBookmarkInGroup } from '../../utils/tab.js';

/**
 * 将固定书签列表渲染为页面底部的 Dock。
 *
 * @param {Document} document 用于创建 Dock 节点的页面文档。
 * @param {HTMLElement} container 接收底部 Dock 的容器节点。
 * @param {Array<object>} favorites 要固定展示的普通书签列表。
 * @param {{name: string, icon: string, bookmarks: Array<object>}} components Components 聚合书签配置。
 * @param {{name: string, icon: string, bookmarks: Array<object>}} [devtools] DevTools 聚合书签配置。
 * @returns {void}
 */
export function renderBookmarkDock(document, container, favorites, components, devtools) {
  const dock = document.createElement('nav');
  const favoritesArea = document.createElement('div');
  const divider = document.createElement('span');
  const toolsArea = document.createElement('div');
  const groups = devtools ? [components, devtools] : [components];

  dock.className = 'bookmark-dock';
  dock.setAttribute('aria-label', '固定书签');
  favoritesArea.className = 'bookmark-dock__favorites';
  favoritesArea.append(...favorites.map((bookmark) => createBookmarkCard(document, bookmark)));
  divider.className = 'bookmark-dock__divider';
  divider.setAttribute('aria-hidden', 'true');
  toolsArea.className = 'bookmark-dock__tools';
  toolsArea.append(...groups.map((group) => createBookmarkToolGroup(document, group)));
  dock.append(favoritesArea, divider, toolsArea);
  container.append(dock);
}

/**
 * 创建 Dock 内可展开的书签分组入口，并负责把所选书签加入对应标签组。
 *
 * @param {Document} document 用于创建 Dock 元素的页面文档。
 * @param {{name: string, icon: string, bookmarks: Array<object>}} group 分组书签配置。
 * @returns {HTMLElement} 分组入口与其 Popover 容器。
 */
function createBookmarkToolGroup(document, group) {
  const element = document.createElement('div');
  const toolButton = document.createElement('button');
  const iconContainer = document.createElement('span');
  const icon = document.createElement('img');
  const toolList = createBookmarkList(
    document,
    group.bookmarks,
    (bookmark) => openBookmarkInGroup(chrome, group, bookmark),
  );
  const popover = createPopover(document, toolButton, toolList);

  element.className = 'bookmark-dock__group';
  toolButton.className = 'bookmark-card bookmark-dock__tool';
  toolButton.setAttribute('type', 'button');
  toolButton.setAttribute('aria-label', `打开 ${group.name} 工具列表`);
  toolButton.setAttribute('aria-expanded', 'false');
  iconContainer.className = 'bookmark-card__icon';
  icon.setAttribute('src', getExtensionAsset(group.icon));
  icon.setAttribute('alt', '');
  icon.setAttribute('aria-hidden', 'true');
  iconContainer.append(icon);
  toolButton.append(iconContainer);
  element.append(toolButton, popover.element);

  return element;
}
