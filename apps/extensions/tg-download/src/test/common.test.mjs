import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const commonScript = await readFile(
  new URL('../utils/common.js', import.meta.url),
  'utf8',
);
const serviceWorkerScript = await readFile(
  new URL('../../service-worker.js', import.meta.url),
  'utf8',
).catch(error => {
  if (error.code === 'ENOENT') return '';
  throw error;
});

// 模拟隔离世界，验证 common.js 向 service worker 发送主题状态。
function runCommonInIsolatedWorld({ matches }) {
  const messageCalls = [];
  const listeners = [];
  const document = { documentElement: { dataset: {} } };
  const colorScheme = {
    matches,
    addEventListener(type, listener) {
      if (type === 'change') listeners.push(listener);
    },
  };
  const context = {
    document,
    matchMedia: () => colorScheme,
    chrome: {
      runtime: {
        getURL: path => `chrome-extension://test/${path}`,
        sendMessage: message => messageCalls.push(JSON.parse(JSON.stringify(message))),
      },
    },
  };

  vm.runInNewContext(commonScript, context);

  return { colorScheme, document, listeners, messageCalls };
}

function runServiceWorker() {
  const actionCalls = [];
  let messageListener;
  const context = {
    chrome: {
      action: { setIcon: options => actionCalls.push(JSON.parse(JSON.stringify(options))) },
      runtime: {
        onMessage: {
          addListener(listener) {
            messageListener = listener;
          },
        },
      },
    },
  };

  vm.runInNewContext(serviceWorkerScript, context);

  return { actionCalls, messageListener };
}

test('系统深色主题通知扩展使用白线图标', () => {
  const { messageCalls } = runCommonInIsolatedWorld({ matches: true });

  assert.deepEqual(messageCalls, [{ type: 'tg-download-theme', theme: 'light' }]);
});

test('系统主题变为浅色时通知扩展恢复黑线图标', () => {
  const { colorScheme, listeners, messageCalls } = runCommonInIsolatedWorld({ matches: true });
  colorScheme.matches = false;
  listeners[0]?.({ matches: false });

  assert.deepEqual(messageCalls.at(-1), { type: 'tg-download-theme', theme: 'dark' });
});

// 验证页面环境即使可访问扩展 API，也会初始化菜单所需的资源方法。
test('扩展服务工作线程将白线主题应用到工具栏图标', () => {
  const { actionCalls, messageListener } = runServiceWorker();
  messageListener?.({ type: 'tg-download-theme', theme: 'light' });

  assert.deepEqual(actionCalls, [{
    path: {
      16: '/src/assets/logo/tg-download-light-16.png',
      32: '/src/assets/logo/tg-download-light-32.png',
      48: '/src/assets/logo/tg-download-light-48.png',
      128: '/src/assets/logo/tg-download-light-128.png',
    },
  }]);
});
