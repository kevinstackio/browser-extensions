import { createBookmarkCard } from '../bookmark-card/index.js';
import { getExtensionAsset } from '../../utils/common.js';

/**
 * 创建以紧凑图标预览呈现的书签文件夹。
 *
 * @param {Document} document 用于创建 DOM 节点的页面文档。
 * @param {{name: string, items: Array<object>}} folder 文件夹名称及其书签配置。
 * @param {(folder: object, bookmark: object) => Promise<void>} onOpenBookmark 单项书签的打开与入组处理函数。
 * @returns {HTMLElement} 包含预览网格和名称的文件夹节点。
 */
export function createBookmarkFolder(document, folder, onOpenBookmark) {
  const element = document.createElement('section');
  const preview = document.createElement('div');
  const name = document.createElement('span');
  const blurButton = folder.blur === true ? document.createElement('button') : null;
  let isBlurred = folder.blur === true;

  element.className = 'bookmark-folder';
  element.setAttribute('aria-label', folder.name);
  preview.className = 'bookmark-folder__preview';
  preview.append(...folder.items.map((bookmark) => {
    const item = createBookmarkCard(document, bookmark);

    item.addEventListener('click', (event) => {
      // 保留链接语义，但由扩展创建标签以便将其加入对应分组。
      event.preventDefault();
      onOpenBookmark(folder, bookmark);
    });

    return item;
  }));
  preview.append(...Array.from({ length: Math.max(0, 4 - folder.items.length) }, () => {
    const placeholder = document.createElement('span');

    // 空占位只维持四格布局，不参与交互或辅助技术阅读。
    placeholder.className = 'bookmark-folder__placeholder';
    placeholder.setAttribute('aria-hidden', 'true');

    return placeholder;
  }));
  if (blurButton) {
    const blurIcon = document.createElement('img');

    blurButton.className = 'bookmark-folder__blur';
    blurButton.setAttribute('type', 'button');
    blurButton.setAttribute('aria-label', `点击显示 ${folder.name} 书签`);
    blurIcon.setAttribute('src', getExtensionAsset('icons/brush-cleaning.svg'));
    blurIcon.setAttribute('alt', '');
    blurIcon.setAttribute('aria-hidden', 'true');
    blurButton.append(blurIcon);
    blurButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation?.();
      isBlurred = false;
      element.className = 'bookmark-folder';
      blurButton.className = 'bookmark-folder__blur bookmark-folder__blur--hidden';
      blurButton.setAttribute('aria-hidden', 'true');
    });
    preview.append(blurButton);
  }
  if (isBlurred) element.className = 'bookmark-folder bookmark-folder--blurred';
  name.className = 'bookmark-folder__name';
  name.textContent = folder.name;
  element.append(preview, name);

  return element;
}
