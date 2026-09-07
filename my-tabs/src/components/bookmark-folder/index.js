import { createBookmarkItem } from '../bookmark-item/index.js';

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

  element.className = 'bookmark-folder';
  element.setAttribute('aria-label', folder.name);
  preview.className = 'bookmark-folder__preview';
  preview.append(...folder.items.map((bookmark) => {
    const item = createBookmarkItem(document, bookmark);

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
  name.className = 'bookmark-folder__name';
  name.textContent = folder.name;
  element.append(preview, name);

  return element;
}
