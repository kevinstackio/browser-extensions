import test from 'node:test';
import assert from 'node:assert/strict';
import * as bookmarkConfig from '../../constants/bookmarks.js';

const { BOOKMARK_GRID, DOCK_DEVTOOLS, DOCK_FAVORITES } = bookmarkConfig;

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
      {
        type: 'folder',
        id: 'edu',
        name: 'EDU',
        items: [
          { id: 'pmi', name: 'PMI', url: 'https://www.pmi.org/', icon: 'brand/text-pmi.svg' },
          { id: 'jlpt', name: 'JLPT', url: 'https://jlpt-main.neea.cn/', icon: 'brand/text-jlpt.svg' },
          { id: 'ielts', name: 'IELTS', url: 'https://ielts.neea.cn/', icon: 'brand/text-ielts.svg' },
          { id: 'chsi', name: '学信网', url: 'https://www.chsi.com.cn/', icon: 'brand/text-chsi.svg' },
        ],
      },
  ]);
  assert.deepEqual(DOCK_FAVORITES, [
    { type: 'bookmark', id: 'github', name: 'GitHub', url: 'https://github.com', icon: 'brand/github.svg' },
    { type: 'bookmark', id: 'gmail', name: 'Gmail', url: 'https://mail.google.com', icon: 'brand/gmail.svg' },
    { type: 'bookmark', id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com', icon: 'brand/chatgpt.svg' },
  ]);
  assert.deepEqual(bookmarkConfig.DOCK_COMPONENTS, {
    type: 'bookmark-group',
    id: 'components',
    name: 'Components',
    icon: 'icons/components.svg',
    bookmarks: [
      { type: 'bookmark', id: 'element-ui', name: 'Element UI', url: 'https://element.eleme.io', icon: 'tools/element-ui.svg' },
      { type: 'bookmark', id: 'element-plus', name: 'Element Plus', url: 'https://element-plus.org', icon: 'tools/element-plus.svg' },
      { type: 'bookmark', id: 'antd', name: 'Ant Design', url: 'https://ant.design', icon: 'tools/antd.svg' },
      { type: 'bookmark', id: 'lucide', name: 'Lucide', url: 'https://lucide.dev', icon: 'tools/lucide.svg' },
      { type: 'bookmark', id: 'iconfont', name: 'Iconfont', url: 'https://www.iconfont.cn', icon: 'tools/iconfont.svg' },
    ],
  });
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
        icon: 'tools/google-translate.png',
      },
    ],
  });
});
