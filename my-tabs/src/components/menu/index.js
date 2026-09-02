import { createIcon } from '../icon/index.js';

export function getMenuPosition(pointer, menuSize, viewport) {
  // 限制菜单坐标，避免卡片超出视口右侧或底部。
  return {
    left: Math.min(pointer.x, viewport.width - menuSize.width),
    top: Math.min(pointer.y, viewport.height - menuSize.height),
  };
}

function createMenuItem(document, { label, icon, onClick }) {
  // 创建带图标和点击行为的通用菜单项。
  const item = document.createElement('button');
  const text = document.createElement('span');

  item.type = 'button';
  item.className = 'context-menu__item';
  text.textContent = label;
  item.append(createIcon(document, icon), text);
  item.addEventListener('click', onClick);

  return item;
}

export function createContextMenu(document) {
  // 仅保留当前打开的菜单实例，避免重复叠加。
  let menu;

  function close() {
    // 菜单关闭后清空引用，确保下次可重新创建。
    menu?.remove();
    menu = undefined;
  }

  function open(pointer) {
    // 每次打开前先移除旧菜单。
    close();

    menu = document.createElement('div');
    const footer = document.createElement('div');

    menu.className = 'context-menu';
    menu.style.position = 'fixed';
    footer.className = 'context-menu__footer';
    // 第一项为新建，底部固定项为设置；当前点击仅关闭菜单。
    menu.append(createMenuItem(document, { label: '新建', icon: 'plus', onClick: close }));
    footer.append(createMenuItem(document, { label: '设置', icon: 'settings', onClick: close }));
    menu.append(footer);
    document.body.append(menu);

    // 根据菜单实际尺寸计算不会越界的展示坐标。
    const position = getMenuPosition(
      pointer,
      { width: menu.offsetWidth || 0, height: menu.offsetHeight || 0 },
      {
        width: document.documentElement.clientWidth || pointer.x,
        height: document.documentElement.clientHeight || pointer.y,
      },
    );
    menu.style.left = `${position.left}px`;
    menu.style.top = `${position.top}px`;
  }

  return { close, open };
}
