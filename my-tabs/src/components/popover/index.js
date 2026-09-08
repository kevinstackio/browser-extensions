/**
 * 创建由外部触发器控制的通用浮层。
 *
 * @param {Document} document 用于创建节点的页面文档。
 * @param {HTMLElement} trigger 打开浮层的触发器。
 * @param {HTMLElement} content 浮层内容节点。
 * @param {{placement?: 'top' | 'bottom' | 'left' | 'right', showArrow?: boolean}} options 浮层展示配置。
 * @returns {{element: HTMLElement, open: () => void, close: (restoreFocus?: boolean) => void}} 浮层与控制方法。
 */
export function createPopover(document, trigger, content, options = {}) {
  const { placement = 'top', showArrow = true } = options;
  const element = document.createElement('section');
  let closeTimer;

  element.className = 'popover';
  element.setAttribute('data-placement', placement);
  element.setAttribute('data-arrow', String(showArrow));
  element.setAttribute('tabindex', '-1');
  element.setAttribute('hidden', 'true');
  element.append(content);

  function cancelClose() {
    clearTimeout(closeTimer);
  }

  function open() {
    // 再次进入触发器时必须取消旧计时器，避免浮层在悬停期间被误关。
    cancelClose();
    element.removeAttribute('hidden');
    trigger.setAttribute('aria-expanded', 'true');
  }

  function close(restoreFocus = true) {
    cancelClose();
    element.setAttribute('hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus();
  }

  function scheduleClose() {
    cancelClose();
    closeTimer = setTimeout(() => close(false), 160);
  }

  element.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    event.preventDefault();
    close();
  });

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
