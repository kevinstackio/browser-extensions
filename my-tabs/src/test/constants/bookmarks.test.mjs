import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOKMARKS } from '../../constants/bookmarks.js';

// 验证品牌书签配置集中维护全部展示信息。
test('品牌书签配置包含六个完整入口', () => {
  assert.deepEqual(BOOKMARKS, [
    {
      id: 'github',
      name: 'GitHub',
      url: 'https://github.com',
      icon: 'brand/github.svg',
    },
    {
      id: 'gmail',
      name: 'Gmail',
      url: 'https://mail.google.com',
      icon: 'brand/gmail.svg',
    },
    {
      id: 'namecheap',
      name: 'Namecheap',
      url: 'https://www.namecheap.com',
      icon: 'brand/namecheap.svg',
    },
    {
      id: 'notion',
      name: 'Notion',
      url: 'https://www.notion.so',
      icon: 'brand/notion.svg',
    },
    {
      id: 'vercel',
      name: 'Vercel',
      url: 'https://vercel.com',
      icon: 'brand/vercel.svg',
    },
    {
      id: 'x',
      name: 'X',
      url: 'https://x.com',
      icon: 'brand/x.svg',
    },
  ]);
});
