// 首页书签配置按主网格与底部 Dock 分区维护，避免同一书签重复定义。
export const BOOKMARKS = {
  grid: [
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
  ],
  dock: [
    { type: 'bookmark', id: 'github', name: 'GitHub', url: 'https://github.com', icon: 'brand/github.svg' },
    { type: 'bookmark', id: 'gmail', name: 'Gmail', url: 'https://mail.google.com', icon: 'brand/gmail.svg' },
  ],
};
