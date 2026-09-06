/**
 * 将资源相对路径转换为扩展内可访问的完整地址。
 *
 * @param {string} path 位于 `src/assets/` 下的相对资源路径。
 * @returns {string} 浏览器环境中的扩展地址，或测试环境中的相对地址。
 */
export function getExtensionAsset(path) {
  return globalThis.chrome?.runtime?.getURL
    ? globalThis.chrome.runtime.getURL(`src/assets/${path}`)
    : `src/assets/${path}`;
}
