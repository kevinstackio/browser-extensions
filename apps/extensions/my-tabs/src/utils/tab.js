// 定义 Chrome 标签组 API 支持的全部颜色，用于首次创建分组时随机分配。
const TAB_GROUP_COLORS = [
  'grey',
  'blue',
  'red',
  'yellow',
  'green',
  'pink',
  'purple',
  'cyan',
  'orange',
];

/**
 * 从 Chrome 支持的标签组颜色中随机选择一个。
 *
 * @param {() => number} [random=Math.random] 返回大于等于零且小于一的随机数函数。
 * @returns {string} 可用于 Chrome 标签组的颜色名称。
 */
export function getRandomTabGroupColor(random = Math.random) {
  return TAB_GROUP_COLORS[Math.floor(random() * TAB_GROUP_COLORS.length)];
}

/**
 * 打开一个书签，并将新标签加入当前窗口同名的 Chrome 标签组。
 *
 * 若同名标签组不存在，会先创建分组并设置初始颜色；分组失败时不关闭已打开的标签。
 *
 * @param {typeof chrome} chrome Chrome 扩展标签页与标签组 API。
 * @param {{name: string}} folder 用作标签组名称的书签文件夹。
 * @param {{url: string}} bookmark 要打开的单个书签。
 * @returns {Promise<{ok: true, groupId: number} | {ok: false, error: Error}>} 打开与入组结果。
 */
export async function openBookmarkInGroup(chrome, folder, bookmark) {
  let tab;

  try {
    // 先打开当前选择的书签，再依据新标签所属窗口查找同名分组。
    tab = await chrome.tabs.create({ url: bookmark.url, active: true });
    const groups = await chrome.tabGroups.query({
      title: folder.name,
      windowId: tab.windowId,
    });
    const existingGroup = groups.find((group) => (
      group.title === folder.name && group.windowId === tab.windowId
    ));
    const groupId = await chrome.tabs.group({
      tabIds: [tab.id],
      ...(existingGroup ? { groupId: existingGroup.id } : {}),
    });

    if (!existingGroup) {
      // 仅在首次创建分组时设置标题和颜色，避免覆盖用户后续的自定义设置。
      await chrome.tabGroups.update(groupId, {
        title: folder.name,
        color: getRandomTabGroupColor(),
      });
    }

    return { ok: true, groupId };
  } catch (error) {
    // 创建后的标签不回滚，避免因分组失败丢失用户刚打开的网站。
    return { ok: false, error };
  }
}
