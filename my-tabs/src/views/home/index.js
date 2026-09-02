import { createContextMenu } from '../../components/menu/index.js';

export function installContextMenu(document) {
  const menu = createContextMenu(document);

  document.addEventListener('contextmenu', (event) => {
    if (event.target !== document.body && event.target !== document.documentElement) {
      return;
    }

    event.preventDefault();
    menu.open({ x: event.clientX, y: event.clientY });
  });
}

if (typeof document !== 'undefined') {
  installContextMenu(document);
}
