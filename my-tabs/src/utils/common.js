export function getExtensionAsset(path) {
  return globalThis.chrome?.runtime?.getURL
    ? globalThis.chrome.runtime.getURL(`src/assets/${path}`)
    : `src/assets/${path}`;
}
