import { createIcon } from '../icon/index.js';

export function getMenuPosition(pointer, menuSize, viewport) {
  return {
    left: Math.min(pointer.x, viewport.width - menuSize.width),
    top: Math.min(pointer.y, viewport.height - menuSize.height),
  };
}

function createMenuItem(document, { label, icon, onClick }) {
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
  let menu;

  function close() {
    menu?.remove();
    menu = undefined;
  }

  function open(pointer) {
    close();

    menu = document.createElement('div');
    const footer = document.createElement('div');

    menu.className = 'context-menu';
    menu.style.position = 'fixed';
    footer.className = 'context-menu__footer';
    menu.append(createMenuItem(document, { label: '新建', icon: 'plus', onClick: close }));
    footer.append(createMenuItem(document, { label: '设置', icon: 'settings', onClick: close }));
    menu.append(footer);
    document.body.append(menu);

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
