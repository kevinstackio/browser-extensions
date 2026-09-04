import { getExtensionAsset } from '../../utils/common.js';

export function createBookmarkItem(document, bookmark) {
  // 创建在新标签页安全打开的书签入口。
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
