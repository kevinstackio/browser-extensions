import { createContextMenu } from '../../components/menu/index.js';

export function installContextMenu(document) {
  // 首页只维护一个右键菜单实例。
  const menu = createContextMenu(document);

  document.addEventListener('contextmenu', (event) => {
    // 仅在页面空白区域拦截原生右键菜单。
    if (event.target !== document.body && event.target !== document.documentElement) {
      return;
    }

    // 使用鼠标当前位置打开自定义菜单。
    event.preventDefault();
    menu.open({ x: event.clientX, y: event.clientY });
  });
}

if (typeof document !== 'undefined') {
  // 在浏览器环境自动安装；测试环境可单独调用导出的函数。
  installContextMenu(document);
}
