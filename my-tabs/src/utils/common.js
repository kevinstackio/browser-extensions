export function getExtensionAsset(path) {
  // 浏览器环境生成扩展根路径；测试环境返回可断言的相对地址。
  return globalThis.chrome?.runtime?.getURL
    ? globalThis.chrome.runtime.getURL(`src/assets/${path}`)
    : `src/assets/${path}`;
}
