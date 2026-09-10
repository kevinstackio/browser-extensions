(() => {
  // 隔离世界可调用扩展 API，将静态资源基址写入页面供主世界下载脚本读取。
  document.documentElement.dataset.tgDownloadAssetBase = chrome.runtime.getURL('src/assets/');
})();
