import { createBookmarkFolder } from '../../components/bookmark-folder/index.js';
import { createBookmarkItem } from '../../components/bookmark-item/index.js';

export function renderBookmarks(document, container, bookmarks) {
  // 将书签配置按既定顺序渲染为快捷入口。
  container.className = 'bookmarks';
  container.append(...bookmarks.map((item) => (
    item.type === 'folder'
      ? createBookmarkFolder(document, item)
      : createBookmarkItem(document, item)
  )));
}
