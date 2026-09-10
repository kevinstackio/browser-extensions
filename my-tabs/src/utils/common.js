/**
 * 将资源相对路径转换为扩展内可访问的完整地址。
 *
 * @param {string} path 位于 `src/assets/` 下的相对资源路径。
 * @param {{relative?: boolean}} options 是否返回以扩展根目录为基准的资源路径。
 * @returns {string} 浏览器环境中的扩展地址、扩展根路径或测试环境中的资源路径。
 */
export function getExtensionAsset(path, { relative = false } = {}) {
  const assetPath = `src/assets/${path}`;

  if (relative) return `/${assetPath}`;

  return globalThis.chrome?.runtime?.getURL
    ? globalThis.chrome.runtime.getURL(assetPath)
    : assetPath;
}
