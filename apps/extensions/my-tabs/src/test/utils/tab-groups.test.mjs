import test from 'node:test';
import assert from 'node:assert/strict';
import { getRandomTabGroupColor, openBookmarkInGroup } from '../../utils/tab.js';

/**
 * 创建可记录标签页与标签组调用的 Chrome API 测试替身。
 *
 * @param {{createError?: Error, groupError?: Error, groups?: Array<object>}} [options={}] 需要模拟的失败与既有分组。
 * @returns {object} 可供断言调用参数的 Chrome API 替身。
 */
function createChrome({ createError, groupError, groups = [] } = {}) {
  const createdTabs = [];
  const queriedGroups = [];
  const groupedTabs = [];
  const updatedGroups = [];

  return {
    createdTabs,
    queriedGroups,
    groupedTabs,
    updatedGroups,
    tabs: {
      create: async (options) => {
        if (createError) {
          throw createError;
        }

        createdTabs.push(options);
        return { id: createdTabs.length, windowId: 9 };
      },
      group: async (options) => {
        groupedTabs.push(options);

        if (groupError) {
          throw groupError;
        }

        return options.groupId ?? 42;
      },
    },
    tabGroups: {
      query: async (options) => {
        queriedGroups.push(options);
        return groups;
      },
      update: async (groupId, options) => {
        updatedGroups.push({ groupId, options });
      },
    },
  };
}

const socialMedia = { name: 'Social Media' };
const x = { url: 'https://x.com' };

// 验证随机颜色始终来自 Chrome 标签组支持的颜色集合。
test('随机标签组颜色限定在 Chrome 支持范围内', () => {
  assert.equal(getRandomTabGroupColor(() => 0), 'grey');
  assert.equal(getRandomTabGroupColor(() => 0.999), 'orange');
});

// 验证首次打开书签时创建同名标签组。
test('首次打开书签时创建同名标签组', async () => {
  const chrome = createChrome();
  const originalRandom = Math.random;
  Math.random = () => 0.5;

  try {
    const result = await openBookmarkInGroup(chrome, socialMedia, x);

    assert.deepEqual(chrome.createdTabs, [{ url: 'https://x.com', active: true }]);
    assert.deepEqual(chrome.queriedGroups, [{ title: 'Social Media', windowId: 9 }]);
    assert.deepEqual(chrome.groupedTabs, [{ tabIds: [1] }]);
    assert.deepEqual(chrome.updatedGroups, [{
      groupId: 42,
      options: { title: 'Social Media', color: 'green' },
    }]);
    assert.deepEqual(result, { ok: true, groupId: 42 });
  } finally {
    Math.random = originalRandom;
  }
});

// 验证同一窗口已有同名组时将新标签加入该组。
test('已有同名标签组时将新书签加入其中', async () => {
  const chrome = createChrome({ groups: [{ id: 7, title: 'Social Media', windowId: 9 }] });

  const result = await openBookmarkInGroup(chrome, socialMedia, x);

  assert.deepEqual(chrome.groupedTabs, [{ tabIds: [1], groupId: 7 }]);
  assert.deepEqual(chrome.updatedGroups, []);
  assert.deepEqual(result, { ok: true, groupId: 7 });
});

// 验证标签组操作失败时不会关闭已打开的书签。
test('标签组操作失败时保留已打开的书签', async () => {
  const chrome = createChrome({ groupError: new Error('无法加入标签组') });

  const result = await openBookmarkInGroup(chrome, socialMedia, x);

  assert.deepEqual(chrome.createdTabs, [{ url: 'https://x.com', active: true }]);
  assert.equal(result.ok, false);
  assert.equal(result.error.message, '无法加入标签组');
});
