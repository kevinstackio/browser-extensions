import { BOOKMARK_GRID, DOCK_DEVTOOLS, DOCK_FAVORITES } from '../../constants/bookmarks.js';
import { getExtensionAsset } from '../../utils/common.js';
import { renderBookmarkDock } from '../bookmarks/bookmark-dock.js';
import { renderBookmarkGrid } from '../bookmarks/bookmark-grid.js';

const ICON_SIZES = [16, 32, 48, 128];

const actionIconPaths = Object.fromEntries(
  ['dark', 'light'].map((theme) => [
    theme,
    Object.fromEntries(
      ICON_SIZES.map((size) => [size, getExtensionAsset(`logo/my-tabs-${theme}-${size}.png`, { relative: true })]),
    ),
  ]),
);

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
    renderBookmarkDock(document, dock, DOCK_FAVORITES, DOCK_DEVTOOLS);
  }
}

/**
 * 根据系统配色偏好更新浏览器工具栏与标签页图标。
 * 深色偏好使用 `light` 图标，浅色偏好使用 `dark` 图标。
 *
 * @param {Window} window 首页所属的浏览器窗口。
 * @param {Document} document 首页文档。
 * @returns {void}
 */
export function installActionIconTheme(window, document) {
  if (typeof window?.matchMedia !== 'function') return;

  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const updateActionIcon = () => {
    const theme = colorScheme.matches ? 'light' : 'dark';
    const favicon = document?.querySelector('link[rel="icon"]');

    if (typeof globalThis.chrome?.action?.setIcon === 'function') {
      globalThis.chrome.action.setIcon({
        path: actionIconPaths[theme],
      });
    }

    if (favicon) {
      favicon.setAttribute('href', getExtensionAsset(`logo/my-tabs-${theme}-16.png`));
    }
  };

  updateActionIcon();

  if (typeof colorScheme.addEventListener === 'function') {
    colorScheme.addEventListener('change', updateActionIcon);
  } else if (typeof colorScheme.addListener === 'function') {
    colorScheme.addListener(updateActionIcon);
  }
}

if (typeof document !== 'undefined') {
  installBookmarks(document);
  installActionIconTheme(globalThis, document);
}
