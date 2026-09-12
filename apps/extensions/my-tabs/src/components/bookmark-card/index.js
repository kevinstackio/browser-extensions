import { getExtensionAsset } from '../../utils/common.js';

/**
 * 创建一个安全地在新标签页打开目标网站的通用书签卡片。
 *
 * @param {Document} document 用于创建 DOM 节点的页面文档。
 * @param {{name: string, url: string, icon: string}} bookmark 书签显示与跳转配置。
 * @returns {HTMLAnchorElement} 已组装的书签链接节点。
 */
export function createBookmarkCard(document, bookmark) {
  const card = document.createElement('a');
  const iconContainer = document.createElement('span');
  const icon = document.createElement('img');
  const name = document.createElement('span');

  // 卡片只保留原生链接语义；需要标签组等页面业务时由调用方接管点击事件。
  card.className = 'bookmark-card';
  card.setAttribute('href', bookmark.url);
  card.setAttribute('target', '_blank');
  card.setAttribute('rel', 'noopener noreferrer');
  card.setAttribute('aria-label', `在新标签页打开 ${bookmark.name}`);

  iconContainer.className = 'bookmark-card__icon';
  icon.setAttribute('src', getExtensionAsset(bookmark.icon));
  icon.setAttribute('alt', '');
  icon.setAttribute('aria-hidden', 'true');

  name.className = 'bookmark-card__name';
  name.textContent = bookmark.name;

  iconContainer.append(icon);
  card.append(iconContainer, name);

  return card;
}
