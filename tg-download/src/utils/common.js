(() => {
  // 同一文件会在隔离世界与主世界分别执行；两个世界的全局对象和方法互不共享。
  const extensionRuntime = globalThis.chrome?.runtime;
  const api = globalThis.TgDownload || {};

  /**
   * 获取扩展内静态资源的绝对地址。
   *
   * 隔离世界直接使用扩展 API；主世界使用隔离世界预先写入页面的资源基址。
   *
   * @param {string} path 相对于 `src/assets/` 的资源路径。
   * @returns {string} 可用于页面节点的绝对资源地址。
   */
  const getExtensionAsset = (path) => {
    if (typeof extensionRuntime?.getURL === 'function') {
      return extensionRuntime.getURL(`src/assets/${path}`);
    }

    const assetBase = document.documentElement.dataset.tgDownloadAssetBase;
    return `${assetBase}${path}`;
  };

  // 所有主世界模块均从共享命名空间读取资源方法。
  api.getExtensionAsset = getExtensionAsset;
  globalThis.TgDownload = api;

  if (typeof extensionRuntime?.getURL === 'function') {
    // 隔离世界向主世界提供资源基址，并将系统主题转交给 service worker。
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
})();
