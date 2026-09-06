import { getExtensionAsset } from '../../utils/common.js';

/**
 * 创建一个安全地在新标签页打开目标网站的书签卡片。
 *
 * @param {Document} document 用于创建 DOM 节点的页面文档。
 * @param {{name: string, url: string, icon: string}} bookmark 书签显示与跳转配置。
 * @returns {HTMLAnchorElement} 已组装的书签链接节点。
 */
export function createBookmarkItem(document, bookmark) {
  const item = document.createElement('a');
  const iconContainer = document.createElement('span');
  const icon = document.createElement('img');
  const name = document.createElement('span');

  item.className = 'bookmark-item';
  item.setAttribute('href', bookmark.url);
  item.setAttribute('target', '_blank');
  item.setAttribute('rel', 'noopener noreferrer');
  item.setAttribute('aria-label', `在新标签页打开 ${bookmark.name}`);

  iconContainer.className = 'bookmark-item__icon';
  icon.setAttribute('src', getExtensionAsset(bookmark.icon));
  icon.setAttribute('alt', '');
  icon.setAttribute('aria-hidden', 'true');

  name.className = 'bookmark-item__name';
  name.textContent = bookmark.name;

  iconContainer.append(icon);
  item.append(iconContainer, name);

  return item;
}
