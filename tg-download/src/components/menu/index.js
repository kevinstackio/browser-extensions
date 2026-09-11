/**
 * 初始化 Telegram 下载菜单模块，并向共享命名空间暴露菜单构建与定位方法。
 *
 * @returns {void}
 */
(() => {
  // 共享命名空间供后续内容脚本按加载顺序调用。
  const api = globalThis.TgDownload ||= {};

  /**
   * 计算不超出当前视口边界的右键菜单坐标。
   *
   * @param {{x: number, y: number}} pointer 用户右键的视口坐标。
   * @param {{width: number, height: number}} size 菜单的实际尺寸。
   * @param {{width: number, height: number}} viewport 当前可用视口尺寸。
   * @returns {{left: number, top: number}} 限制后的菜单左上角坐标。
   */
  api.menuPosition = (pointer, size, viewport) => ({
    left: Math.max(0, Math.min(pointer.x, viewport.width - size.width)),
    top: Math.max(0, Math.min(pointer.y, viewport.height - size.height)),
  });

  /**
   * 创建并维护唯一的下载右键菜单实例。
   *
   * @param {Document} document 用于创建与挂载菜单节点的页面文档。
   * @param {() => void} onSave 用户点击下载按钮后的下载处理函数。
   * @returns {{close: () => void, dismiss: (duration: number) => void, open: (pointer: object) => void, loading: () => void, result: (text: string) => void, ready: () => void, contains: (target: EventTarget) => boolean, busy: () => boolean}} 菜单状态与操作控制器。
   */
  api.createMenu = (document, onSave) => {
    let card;
    let button;
    let icon;
    let label;
    // 同步按钮文字与状态属性，图标由 CSS 根据状态属性显示。
    const setState = (text, state) => {
      button.dataset.state = state;
      label.textContent = text;
    };
    /**
     * 移除当前菜单节点并释放对应的状态引用。
     *
     * @returns {void}
     */
    const close = () => { card?.remove(); card = undefined; button = undefined; };
    /**
     * 以淡出动画关闭当前菜单。
     *
     * @param {number} duration 淡出动画时长，单位为毫秒。
     * @returns {void}
     */
    const dismiss = (duration) => {
      if (!card) return;
      card.classList.add('tg-download-menu--leaving');
      globalThis.setTimeout(close, duration);
    };
    /**
     * 在指针坐标处创建菜单，并在必要时将其限制于视口内。
     *
     * @param {{x: number, y: number}} pointer 用户右键的视口坐标。
     * @returns {void}
     */
    const open = (pointer) => {
      // 每次打开前移除旧菜单，防止重复叠加。
      close();
      card = document.createElement('div');
      button = document.createElement('button');
      card.className = 'tg-download-menu';
      button.className = 'tg-download-menu__item';
      button.type = 'button';
      icon = document.createElement('span');
      label = document.createElement('span');
      icon.className = 'tg-download-menu__icon';
      icon.setAttribute('aria-hidden', 'true');
      label.className = 'tg-download-menu__label';
      button.append(icon, label);
      setState('下载资源', 'download');
      button.addEventListener('click', onSave);
      card.append(button);
      document.body.append(card);
      // 读取实际尺寸后计算不会越出视口的坐标。
      const position = api.menuPosition(pointer, { width: card.offsetWidth || 184, height: card.offsetHeight || 40 }, { width: globalThis.innerWidth || pointer.x, height: globalThis.innerHeight || pointer.y });
      card.style.left = `${position.left}px`;
      card.style.top = `${position.top}px`;
    };
    /**
     * 将菜单切换为下载中状态，防止重复触发保存操作。
     *
     * @returns {void}
     */
    const loading = () => { if (button) { button.disabled = true; setState('正在下载', 'loading'); } };
    /**
     * 更新菜单项的可见结果文字，并恢复可点击状态。
     *
     * @param {string} text 要展示给用户的结果文本。
     * @returns {void}
     */
    const result = (text) => { if (button) { button.disabled = false; setState(text, 'download'); } };
    // 恢复初始下载文案，供失败后的用户再次尝试。
    const ready = () => { if (button) { button.disabled = false; setState('下载资源', 'download'); } };
    /**
     * 判断事件目标是否位于当前菜单内部。
     *
     * @param {EventTarget | null} target 待判断的事件目标。
     * @returns {boolean} 目标是否属于当前菜单。
     */
    const contains = target => Boolean(card?.contains?.(target));
    /**
     * 判断当前菜单是否正处于下载中的禁用状态。
     *
     * @returns {boolean} 是否正在下载。
     */
    const busy = () => Boolean(button?.disabled);
    return { close, dismiss, open, loading, result, ready, contains, busy };
  };
})();
