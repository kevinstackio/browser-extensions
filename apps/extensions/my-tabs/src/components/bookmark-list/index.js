import { getExtensionAsset } from '../../utils/common.js';

/**
 * 将书签配置渲染为可复用的工具链接列表。
 *
 * @param {Document} document 用于创建节点的页面文档。
 * @param {Array<{name: string, url: string, icon: string}>} bookmarks 要展示的书签。
 * @param {(bookmark: object) => void} [onSelect] 可选的点击回调，由外层处理业务动作。
 * @returns {HTMLElement} 书签列表节点。
 */
export function createBookmarkList(document, bookmarks, onSelect) {
  const list = document.createElement('ul');

  list.className = 'bookmark-list';
  list.append(...bookmarks.map((bookmark) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    const icon = document.createElement('img');
    const name = document.createElement('span');

    link.className = 'bookmark-list__item';
    link.setAttribute('href', bookmark.url);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    icon.setAttribute('src', getExtensionAsset(bookmark.icon));
    icon.setAttribute('alt', '');
    icon.setAttribute('aria-hidden', 'true');
    name.textContent = bookmark.name;
    if (onSelect) {
      // 组件仅上报所选书签，标签页、分组等业务动作始终交给调用方。
      link.addEventListener('click', (event) => {
        event.preventDefault();
        return onSelect(bookmark);
      });
    }
    link.append(icon, name);
    item.append(link);
    return item;
  }));

  return list;
}
