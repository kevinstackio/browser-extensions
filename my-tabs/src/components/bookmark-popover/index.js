/**
 * 创建由外部触发器控制的书签浮层。
 *
 * @param {Document} document 用于创建节点的页面文档。
 * @param {HTMLElement} trigger 打开浮层的触发器。
 * @param {HTMLElement} content 浮层内容节点。
 * @returns {{element: HTMLElement, open: () => void, close: () => void}} 浮层与控制方法。
 */
export function createBookmarkPopover(document, trigger, content) {
  const element = document.createElement('section');
  let closeTimer;

  // 容器负责浮层外观、定位和后续箭头；传入内容只处理列表本身的渲染。
  element.className = 'bookmark-popover';
  element.setAttribute('tabindex', '-1');
  element.setAttribute('hidden', 'true');
  element.append(content);

  function open() {
    element.removeAttribute('hidden');
    trigger.setAttribute('aria-expanded', 'true');
  }

  function close(restoreFocus = true) {
    clearTimeout(closeTimer);
    element.setAttribute('hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus();
  }

  element.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    event.preventDefault();
    close();
  });

  function cancelClose() {
    clearTimeout(closeTimer);
  }

  function scheduleClose() {
    cancelClose();
    closeTimer = setTimeout(() => close(false), 160);
  }

  // 鼠标与键盘都可打开，延迟关闭让指针能跨越入口与浮层间的间距。
  trigger.addEventListener('mouseenter', open);
  trigger.addEventListener('mouseleave', scheduleClose);
  trigger.addEventListener('focus', open);
  trigger.addEventListener('click', open);
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  element.addEventListener('mouseenter', cancelClose);
  element.addEventListener('mouseleave', scheduleClose);

  return { element, open, close };
}
