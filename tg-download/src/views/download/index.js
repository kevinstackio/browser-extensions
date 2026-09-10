/**
 * 初始化 Telegram 媒体预览页的右键下载交互，并向共享命名空间暴露可测试的下载方法。
 *
 * @returns {void}
 */
(() => {
  // 与菜单组件共享的私有扩展命名空间。
  const api = globalThis.TgDownload ||= {};
  // Telegram Web 预览容器的兼容选择器。
  const viewer = '#MediaViewer,.MediaViewer,.media-viewer,[class*="media-viewer"],[class*="MediaViewer"],[role="dialog"]';
  /**
   * 根据右键位置定位 Telegram 预览器中的实际图片或视频节点。
   *
   * @param {EventTarget | null} target 触发右键事件的原始节点。
   * @param {number} x 指针相对于视口的横坐标。
   * @param {number} y 指针相对于视口的纵坐标。
   * @returns {HTMLImageElement | HTMLVideoElement | undefined} 命中坐标的媒体节点。
   */
  const mediaAt = (target, x, y) => {
    const owner = target?.closest?.(viewer);
    const direct = target?.closest?.('img,video');
    const pointed = document.elementFromPoint?.(x, y)?.closest?.('img,video');
    const candidates = [direct, pointed, ...owner?.querySelectorAll?.('img,video') || []].filter(Boolean);

    return candidates.find(media => {
      const rect = media.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    });
  };
  /**
   * 解析部分内容响应的字节结束位置与媒体总大小。
   *
   * @param {string | null} value HTTP `Content-Range` 响应头。
   * @returns {{end: number, total: number} | null} 已解析的范围信息，格式不合法时返回空值。
   */
  api.rangeInfo = (value) => { const match = /^bytes\s+\d+-(\d+)\/(\d+)$/i.exec(value || ''); return match ? { end: Number(match[1]), total: Number(match[2]) } : null; };
  /**
   * 将网络响应流分块写入用户选择的文件，并报告累计写入字节数。
   *
   * @param {Response} response 待读取的 HTTP 响应。
   * @param {FileSystemWritableFileStream} writable 用户授权的目标文件流。
   * @param {(loaded: number, total: number) => void} onProgress 每个数据块写入后的进度回调。
   * @param {number} [start=0] 当前续传已写入的字节数。
   * @param {number} [total=0] 媒体总字节数。
   * @returns {Promise<number>} 写入结束后的累计字节数。
   */
  api.writeResponse = async (response, writable, onProgress, start = 0, total = Number(response.headers.get('Content-Length')) || 0) => {
    const reader = response.body?.getReader?.();
    if (!reader) return start;
    let loaded = start;
    for (;;) { const { done, value } = await reader.read(); if (done) break; await writable.write(value); loaded += value.byteLength; onProgress(loaded, total); }
    return loaded;
  };
  /**
   * 根据媒体类型和当前时间生成可排序的 Telegram 下载文件名。
   *
   * @param {string} kind 媒体元素的标签名。
   * @returns {string} 带有推荐扩展名的文件名。
   */
  const filenameFor = (kind) => {
    const now = new Date();
    /**
     * 将数值补齐为两位字符串，用于组成固定宽度的时间戳。
     *
     * @param {number} value 待补齐的数值。
     * @returns {string} 两位长度的字符串。
     */
    const pad = value => String(value).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return kind === 'VIDEO' ? `TG_VIDEO_${stamp}.mp4` : `TG_IMG_${stamp}.jpg`;
  };
  // 暴露文件名规则，供自动化测试覆盖统一命名行为。
  api.filenameFor = filenameFor;
  /**
   * 通过文件保存选择器下载图片或视频，并兼容完整与分段媒体响应。
   *
   * @param {HTMLImageElement | HTMLVideoElement} media 用户选中的 Telegram 媒体节点。
   * @param {{loading: () => void, close: () => void, dismiss: (duration: number) => void, ready: () => void, result: (text: string) => void}} menu 当前右键菜单控制器。
   * @returns {Promise<void>}
   */
  async function save(media, menu) {
    const src = media.currentSrc || media.src;
    if (!src || !globalThis.showSaveFilePicker) return;
    let writable;
    let loadingStartedAt = 0;
    try {
      const handle = await globalThis.showSaveFilePicker({
        // 优先在用户桌面打开保存窗口，用户仍可手动选择其他位置。
        startIn: 'desktop',
        suggestedName: filenameFor(media.tagName),
      });
      writable = await handle.createWritable(); loadingStartedAt = Date.now(); menu.loading();
      let offset = 0; let total = 0;
      // 206 按 Content-Range 继续请求下一段；200 则一次写完。
      for (;;) {
        const response = await fetch(src, { credentials: 'include', headers: { Range: `bytes=${offset}-` } });
        if (response.status !== 200 && response.status !== 206) throw new Error(`HTTP ${response.status}`);
        const range = api.rangeInfo(response.headers.get('Content-Range'));
        total = range?.total || Number(response.headers.get('Content-Length')) || total;
        // 写入期间保持按钮禁用；不向界面展示下载百分比。
        offset = await api.writeResponse(response, writable, () => {}, offset, total);
        if (response.status === 200 || !range || offset >= range.total) break;
      }
      await writable.close();
      // 即使资源很小，也保留最短加载时间让用户看到旋转状态。
      const remaining = Math.max(0, 300 - (Date.now() - loadingStartedAt));
      globalThis.setTimeout(() => {
        menu.result('下载成功');
        // 成功状态以 300ms 淡出，避免菜单瞬间消失。
        if (menu.dismiss) menu.dismiss(300); else menu.close();
      }, remaining);
    } catch (error) {
      // 用户取消系统文件选择器时不产生网络请求或失败提示。
      if (error?.name === 'AbortError') { menu.close(); return; }
      await writable?.abort?.();
      // 详细失败原因仅保留在控制台，避免菜单文字过长。
      console.error('TG Download 下载失败：', error);
      menu.result('下载失败');
      globalThis.setTimeout(() => menu.ready(), 1000);
    }
  }
  // 暴露保存流程，供自动化测试覆盖取消与失败收尾。
  api.save = save;
  // 仅在真实页面环境安装交互；测试环境只调用导出函数。
  if (globalThis.document?.addEventListener) {
    let active;
    const menu = api.createMenu(document, () => active && save(active, menu));
    // 仅拦截放大预览层中的实际图片或视频，其他位置保留 Telegram 原生菜单。
    document.addEventListener('contextmenu', event => {
      // 下载尚未结束时保持当前禁用菜单，防止状态写入后续打开的菜单。
      if (menu.busy()) return;
      const media = mediaAt(event.target, event.clientX, event.clientY);
      if (!media || !media.closest?.('.media-viewer-mover')) return;
      event.preventDefault();
      active = media;
      menu.open({ x: event.clientX, y: event.clientY });
    }, true);
    document.addEventListener('pointerdown', event => { if (!menu.busy() && !menu.contains(event.target)) menu.close(); });
    globalThis.addEventListener?.('keydown', event => { if (event.key === 'Escape' && !menu.busy()) menu.close(); }, true);
  }
})();
