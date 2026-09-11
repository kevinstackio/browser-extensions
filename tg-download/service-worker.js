const iconSizes = [16, 32, 48, 128];
const actionIconPaths = Object.fromEntries(
  ['dark', 'light'].map(theme => [
    theme,
    Object.fromEntries(
      iconSizes.map(size => [size, `/src/assets/logo/tg-download-${theme === 'dark' ? '' : `${theme}-`}${size}.png`]),
    ),
  ]),
);

// 内容脚本读取页面所在环境的系统主题，服务工作线程负责调用工具栏 API。
chrome.runtime.onMessage.addListener(message => {
  if (message?.type !== 'tg-download-theme') return;

  chrome.action.setIcon({ path: actionIconPaths[message.theme === 'light' ? 'light' : 'dark'] });
});
