// 首页书签与文件夹的唯一配置来源，视图与组件仅消费该数据。
export const BOOKMARKS = [
  {
    type: 'folder',
    id: 'social-media',
    name: 'Social Media',
    items: [
      {
        id: 'x',
        name: 'X',
        url: 'https://x.com',
        icon: 'brand/x.svg',
      },
      {
        id: 'bilibili',
        name: 'Bilibili',
        url: 'https://www.bilibili.com',
        icon: 'brand/bilibili.svg',
      },
      {
        id: 'youtube',
        name: 'YouTube',
        url: 'https://www.youtube.com',
        icon: 'brand/youtube.svg',
      },
    ],
  },
  {
    type: 'bookmark',
    id: 'linear',
    name: 'Linear',
    url: 'https://linear.app',
    icon: 'brand/linear.svg',
  },
  {
    type: 'bookmark',
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com',
    icon: 'brand/github.svg',
  },
  {
    type: 'bookmark',
    id: 'gmail',
    name: 'Gmail',
    url: 'https://mail.google.com',
    icon: 'brand/gmail.svg',
  },
  {
    type: 'bookmark',
    id: 'namecheap',
    name: 'Namecheap',
    url: 'https://www.namecheap.com',
    icon: 'brand/namecheap.svg',
  },
  {
    type: 'bookmark',
    id: 'notion',
    name: 'Notion',
    url: 'https://www.notion.so',
    icon: 'brand/notion.svg',
  },
  {
    type: 'bookmark',
    id: 'vercel',
    name: 'Vercel',
    url: 'https://vercel.com',
    icon: 'brand/vercel.svg',
  },
];
