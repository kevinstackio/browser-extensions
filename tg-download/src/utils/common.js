(() => {
  // 同一脚本在隔离世界与主世界各执行一次，按可用 API 分别承担桥接职责。
  const extensionRuntime = globalThis.chrome?.runtime;

  if (typeof extensionRuntime?.getURL === 'function') {
    // 隔离世界可访问扩展 API：提供资源基址，并将系统主题转交给 service worker。
    const getExtensionAsset = path => extensionRuntime.getURL(`src/assets/${path}`);
    const colorScheme = globalThis.matchMedia?.('(prefers-color-scheme: dark)');

    document.documentElement.dataset.tgDownloadAssetBase = getExtensionAsset('');

    if (!colorScheme || typeof extensionRuntime.sendMessage !== 'function') return;

    const sendTheme = () => {
      extensionRuntime.sendMessage({
        type: 'tg-download-theme',
        theme: colorScheme.matches ? 'light' : 'dark',
      });
    };

    sendTheme();
    colorScheme.addEventListener?.('change', sendTheme);
    return;
  }

  // 主世界不能调用扩展 API，只消费隔离世界写入的资源基址。
  const api = globalThis.TgDownload ||= {};
  const assetBase = document.documentElement.dataset.tgDownloadAssetBase;
  api.getExtensionAsset = path => `${assetBase}${path}`;
})();
