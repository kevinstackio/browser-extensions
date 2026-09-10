// 书签配置按页面区域直接导出，避免调用方依赖聚合对象。
// 首页 Grid 只消费文件夹和普通书签，不包含底部 Dock 的内容。
export const BOOKMARK_GRID = [
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
];

// Dock 收藏区只保存直接可点击的常用书签。
export const DOCK_FAVORITES = [
  { type: 'bookmark', id: 'github', name: 'GitHub', url: 'https://github.com', icon: 'brand/github.svg' },
  { type: 'bookmark', id: 'gmail', name: 'Gmail', url: 'https://mail.google.com', icon: 'brand/gmail.svg' },
];

// DevTools 卡片与其内部工具列表必须保持同一配置，供后续 Popover 直接消费。
export const DOCK_DEVTOOLS = {
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
};
