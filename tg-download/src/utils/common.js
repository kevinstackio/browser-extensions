(() => {
  // common.js 仅运行在隔离世界，负责将系统主题同步给扩展工具栏。
  const extensionRuntime = globalThis.chrome?.runtime;
  if (typeof extensionRuntime?.sendMessage !== 'function') return;

  const colorScheme = globalThis.matchMedia?.('(prefers-color-scheme: dark)');
  if (!colorScheme) return;

  const sendTheme = () => {
    extensionRuntime.sendMessage({
      type: 'tg-download-theme',
      theme: colorScheme.matches ? 'light' : 'dark',
    });
  };

  sendTheme();
  colorScheme.addEventListener?.('change', sendTheme);
})();
