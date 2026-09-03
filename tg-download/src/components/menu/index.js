(() => {
  // 共享命名空间供后续内容脚本按加载顺序调用。
  const api = globalThis.TgDownload ||= {};

  // 将菜单限制在可视区域内，避免贴边打开时溢出。
  api.menuPosition = (pointer, size, viewport) => ({
    left: Math.max(0, Math.min(pointer.x, viewport.width - size.width)),
    top: Math.max(0, Math.min(pointer.y, viewport.height - size.height)),
  });

  // 创建并维护唯一的“另存为”右键菜单实例。
  api.createMenu = (document, onSave) => {
    let card;
    let button;
    // 关闭菜单时同时清空旧节点引用。
    const close = () => { card?.remove(); card = undefined; button = undefined; };
    const open = (pointer) => {
      // 每次打开前移除旧菜单，防止重复叠加。
      close();
      card = document.createElement('div');
      button = document.createElement('button');
      card.className = 'tg-download-menu';
      button.className = 'tg-download-menu__item';
      button.type = 'button';
      button.textContent = '另存为';
      button.addEventListener('click', onSave);
      card.append(button);
      document.body.append(card);
      // 读取实际尺寸后计算不会越出视口的坐标。
      const position = api.menuPosition(pointer, { width: card.offsetWidth || 184, height: card.offsetHeight || 40 }, { width: globalThis.innerWidth || pointer.x, height: globalThis.innerHeight || pointer.y });
      card.style.left = `${position.left}px`;
      card.style.top = `${position.top}px`;
    };
    // 下载期间禁用菜单项，避免重复请求同一媒体。
    const loading = () => { if (button) { button.disabled = true; button.textContent = '下载中…'; } };
    // 下载结束前只保留禁用状态，不展示实时进度百分比。
    const result = (text) => { if (button) { button.disabled = false; button.textContent = text; } };
    return { close, open, loading, result, contains: target => Boolean(card?.contains?.(target)), busy: () => Boolean(button?.disabled) };
  };
})();
