(() => {
  // 与菜单组件共享的私有扩展命名空间。
  const api = globalThis.TgDownload ||= {};
  // Telegram Web 预览容器的兼容选择器。
  const viewer = '#MediaViewer,.MediaViewer,.media-viewer,[class*="media-viewer"],[class*="MediaViewer"],[role="dialog"]';
  // 根据右键坐标定位预览媒体，兼容 Telegram 覆盖在视频上的控制层。
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
  // 解析 206 响应的字节范围和媒体总大小。
  api.rangeInfo = (value) => { const match = /^bytes\s+\d+-(\d+)\/(\d+)$/i.exec(value || ''); return match ? { end: Number(match[1]), total: Number(match[2]) } : null; };
  // 将响应流逐块写入用户选择的文件，避免完整媒体占用内存。
  api.writeResponse = async (response, writable, onProgress, start = 0, total = Number(response.headers.get('Content-Length')) || 0) => {
    const reader = response.body?.getReader?.();
    if (!reader) return start;
    let loaded = start;
    for (;;) { const { done, value } = await reader.read(); if (done) break; await writable.write(value); loaded += value.byteLength; onProgress(loaded, total); }
    return loaded;
  };
  // 生成按保存时间排序的 Telegram 媒体文件名。
  const filenameFor = (kind) => {
    const now = new Date();
    const pad = value => String(value).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return kind === 'VIDEO' ? `TG_VIDEO_${stamp}.mp4` : `TG_IMG_${stamp}.jpg`;
  };
  // 根据 200 或 206 响应统一保存 Telegram 媒体。
  async function save(media, menu) {
    const src = media.currentSrc || media.src;
    if (!src || !globalThis.showSaveFilePicker) return;
    let writable;
    try {
      const handle = await globalThis.showSaveFilePicker({ suggestedName: filenameFor(media.tagName) });
      writable = await handle.createWritable(); menu.loading();
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
      // 文件写入完成后立即关闭菜单，避免保留下载中的禁用光标。
      menu.close();
    } catch (error) {
      // 用户取消系统文件选择器时不产生网络请求或失败提示。
      if (error?.name === 'AbortError') { menu.close(); return; }
      await writable?.abort?.(); menu.result('保存失败');
    }
  }
  // 仅在真实页面环境安装交互；测试环境只调用导出函数。
  if (globalThis.document?.addEventListener) {
    let active;
    const menu = api.createMenu(document, () => active && save(active, menu));
    // 仅拦截预览媒体区域的右键，其他 Telegram 区域保留原生菜单。
    document.addEventListener('contextmenu', event => { const media = mediaAt(event.target, event.clientX, event.clientY); if (!media || !media.closest?.(viewer)) return; event.preventDefault(); active = media; menu.open({ x: event.clientX, y: event.clientY }); }, true);
    document.addEventListener('pointerdown', event => { if (!menu.busy() && !menu.contains(event.target)) menu.close(); });
    globalThis.addEventListener?.('keydown', event => { if (event.key === 'Escape' && !menu.busy()) menu.close(); }, true);
  }
})();
