import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOOKMARK_GRID,
  DOCK_DEVTOOLS,
  DOCK_FAVORITES,
} from '../../constants/bookmarks.js';

// 验证书签配置按 Grid、Dock 收藏和 DevTools 聚合入口分别导出。
test('书签配置按使用场景提供具名数据源', () => {
  assert.deepEqual(BOOKMARK_GRID, [
      {
        type: 'folder',
        id: 'social-media',
        name: 'Social Media',
        items: [
          { id: 'x', name: 'X', url: 'https://x.com', icon: 'brand/x.svg' },
          { id: 'bilibili', name: 'Bilibili', url: 'https://www.bilibili.com', icon: 'brand/bilibili.svg' },
          { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com', icon: 'brand/youtube.svg' },
        ],
      },
      {
        type: 'folder',
        id: 'devops',
        name: 'DevOps',
        items: [
          { id: 'namecheap', name: 'Namecheap', url: 'https://www.namecheap.com', icon: 'brand/namecheap.svg' },
          { id: 'vercel', name: 'Vercel', url: 'https://vercel.com', icon: 'brand/vercel.svg' },
        ],
      },
      {
        type: 'folder',
        id: 'pm',
        name: 'PM',
        items: [
          { id: 'linear', name: 'Linear', url: 'https://linear.app', icon: 'brand/linear.svg' },
          { id: 'notion', name: 'Notion', url: 'https://www.notion.so', icon: 'brand/notion.svg' },
        ],
      },
  ]);
  assert.deepEqual(DOCK_FAVORITES, [
    { type: 'bookmark', id: 'github', name: 'GitHub', url: 'https://github.com', icon: 'brand/github.svg' },
    { type: 'bookmark', id: 'gmail', name: 'Gmail', url: 'https://mail.google.com', icon: 'brand/gmail.svg' },
  ]);
  assert.deepEqual(DOCK_DEVTOOLS, {
    type: 'bookmark-group',
    id: 'devtools',
    name: 'DevTools',
    icon: 'icons/devtools.svg',
    bookmarks: [
      {
        type: 'bookmark',
        id: 'google-translate',
        name: 'Google Translate',
        url: 'https://translate.google.com/?hl=zh-cn&sl=en&tl=zh-CN&op=translate',
        icon: 'brand/googletranslate.svg',
      },
    ],
  });
});
