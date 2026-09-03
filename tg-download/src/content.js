(() => {
  const REQUEST_NAMESPACE = 'TG_WEB_SAVE_AS_REQUEST_V1';
  const DOWNLOAD_ICON = chrome.runtime.getURL('icons/download.svg');
  const VIEWER_SELECTOR = [
    '#MediaViewer',
    '.MediaViewer',
    '.media-viewer-whole',
    '.media-viewer',
    '[class*="media-viewer"]',
    '[class*="MediaViewer"]',
    '.media-round',
    '.video-round-canvas',
    '[role="dialog"]'
  ].join(',');

  let menu = null;
  let menuState = null;
  const pendingSaves = new Map();

  function isVisible(element) {
    if (!element || !element.isConnected) return false;

    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width >= 80 && rect.height >= 80 && rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth;
  }

  function currentPreviewMedia() {
    const visible = [...document.querySelectorAll('img, video')]
      .filter(isVisible);
    const inViewer = visible.filter(element => element.closest(VIEWER_SELECTOR));
    const candidates = inViewer.length ? inViewer : visible.length === 1 ? visible : [];

    return candidates.sort((a, b) => {
      const byKind = Number(b.tagName === 'VIDEO') - Number(a.tagName === 'VIDEO');
      if (byKind) return byKind;
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      return bRect.width * bRect.height - aRect.width * aRect.height;
    })[0] || null;
  }

  function removeMenu() {
    menu?.remove();
    menu = null;
    menuState = null;
  }

  function showMenu(event, media) {
    removeMenu();
    menu = document.createElement('div');
    menu.setAttribute('role', 'menu');
    menu.style.position = 'fixed';
    menu.style.left = `${event.clientX}px`;
    menu.style.top = `${event.clientY}px`;
    menu.style.zIndex = '2147483647';
    menu.style.padding = '4px';
    menu.style.background = '#fff';
    menu.style.borderRadius = '8px';
    menu.style.boxShadow = '0 4px 16px rgba(0,0,0,.22)';
    menu.style.transition = 'opacity .2s ease, transform .2s ease';

    const save = document.createElement('button');
    save.type = 'button';
    save.style.border = '0';
    save.style.background = 'transparent';
    save.style.padding = '8px 12px';
    save.style.minWidth = '184px';
    save.style.cursor = 'pointer';
    save.style.display = 'inline-flex';
    save.style.alignItems = 'center';
    save.style.gap = '7px';
    save.style.position = 'relative';
    save.style.overflow = 'hidden';
    save.style.transition = 'background .16s ease, opacity .2s ease';
    save.addEventListener('mouseenter', () => {
      save.style.background = '#f0f0f0';
    });
    save.addEventListener('mouseleave', () => {
      save.style.background = 'transparent';
    });

    const icon = document.createElement('img');
    icon.src = DOWNLOAD_ICON;
    icon.alt = '';
    icon.width = 16;
    icon.height = 16;

    const label = document.createElement('span');
    label.textContent = '另存为';

    const progressTrack = document.createElement('span');
    progressTrack.style.position = 'absolute';
    progressTrack.style.left = '0';
    progressTrack.style.right = '0';
    progressTrack.style.bottom = '0';
    progressTrack.style.height = '3px';
    progressTrack.style.opacity = '0';
    progressTrack.style.background = '#d9eaff';
    progressTrack.style.transition = 'opacity .18s ease';

    const progressFill = document.createElement('span');
    progressFill.style.display = 'block';
    progressFill.style.width = '0%';
    progressFill.style.height = '100%';
    progressFill.style.background = '#2481cc';
    progressFill.style.transition = 'width .18s ease';
    progressTrack.append(progressFill);

    save.append(icon, label, progressTrack);
    save.addEventListener('click', () => {
      beginSave(media);
    });
    menu.append(save);
    document.body.appendChild(menu);
    menuState = { save, label, progressTrack, progressFill, requestId: null };
  }

  function updateProgress(requestId, loaded, total) {
    if (menuState?.requestId !== requestId) return;

    const percent = total > 0
      ? Math.min(100, Math.floor(loaded / total * 100))
      : 0;
    menuState.label.textContent = total > 0 ? `下载中 ${percent}%` : '下载中…';
    menuState.progressTrack.style.opacity = '1';
    menuState.progressFill.style.width = `${percent}%`;
  }

  function showSuccess(requestId) {
    if (menuState?.requestId !== requestId) return;
    menuState.label.textContent = '保存成功';
    menuState.progressTrack.style.opacity = '1';
    menuState.progressFill.style.width = '100%';
    menuState.save.disabled = true;
    window.setTimeout(() => {
      if (menuState?.requestId !== requestId || !menu) return;
      menu.style.opacity = '0';
      menu.style.transform = 'translateY(-4px)';
      window.setTimeout(removeMenu, 200);
    }, 1100);
  }

  function showError(requestId, message) {
    if (menuState?.requestId !== requestId) return;
    menuState.label.textContent = message || '保存失败';
    menuState.save.disabled = false;
  }

  function pickerTypes(kind) {
    return kind === 'video'
      ? [{ description: '视频', accept: { 'video/mp4': ['.mp4'], 'video/webm': ['.webm'] } }]
      : [{ description: '图片', accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] } }];
  }

  function filenameFor(kind) {
    const now = new Date();
    const pad = value => String(value).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return kind === 'video' ? `TG_VIDEO_${stamp}.mp4` : `TG_IMG_${stamp}.jpg`;
  }

  function beginSave(media) {
    if (typeof window.showSaveFilePicker !== 'function') return;

    const kind = media.tagName === 'VIDEO' ? 'video' : 'image';
    const src = media.currentSrc || media.src;
    if (!src) return;

    window.showSaveFilePicker({
      suggestedName: filenameFor(kind),
      types: pickerTypes(kind)
    }).then(handle => {
      const requestId = crypto.randomUUID();
      pendingSaves.set(requestId, handle);
      if (menuState) {
        menuState.requestId = requestId;
        menuState.label.textContent = '准备下载…';
        menuState.progressTrack.style.opacity = '1';
        menuState.save.disabled = true;
      }
      window.postMessage({
        namespace: REQUEST_NAMESPACE,
        requestId,
        payload: {
          kind,
          src,
          filename: filenameFor(kind),
          mime: media.getAttribute('type') || ''
        }
      }, '*');
    }).catch(() => removeMenu());
  }

  document.addEventListener('contextmenu', event => {
    const media = currentPreviewMedia();
    if (!media) return;
    event.preventDefault();
    showMenu(event, media);
  }, true);

  document.addEventListener('pointerdown', event => {
    if (menu && !menu.contains?.(event.target)) removeMenu();
  });

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') removeMenu();
  }, true);

  window.addEventListener('message', async event => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.namespace !== 'TG_WEB_SAVE_AS_EVENT_V1') return;

    const handle = pendingSaves.get(data.requestId);
    if (!handle) return;

    if (data.event === 'progress') {
      updateProgress(data.requestId, Number(data.loaded) || 0, Number(data.total) || 0);
      return;
    }

    if (data.event === 'error') {
      pendingSaves.delete(data.requestId);
      showError(data.requestId, data.error);
      return;
    }

    if (data.event !== 'resource' || !data.blob) return;
    pendingSaves.delete(data.requestId);

    try {
      const writable = await handle.createWritable();
      await writable.write(data.blob);
      await writable.close();
      showSuccess(data.requestId);
    } catch {
      showError(data.requestId, '保存失败');
    }
  });
})();
