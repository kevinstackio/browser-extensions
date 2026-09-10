(() => {
  // 主世界不能调用扩展 API，统一使用隔离世界写入页面的资源基址。
  const api = globalThis.TgDownload ||= {};
  const assetBase = document.documentElement.dataset.tgDownloadAssetBase;
  api.getExtensionAsset = path => `${assetBase}${path}`;
})();
