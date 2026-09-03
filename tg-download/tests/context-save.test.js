const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function createNode(tagName) {
  return {
    tagName: tagName.toUpperCase(),
    children: [],
    style: {},
    dataset: {},
    isConnected: true,
    append(...children) { this.children.push(...children); },
    appendChild(child) { this.children.push(child); child.parentElement = this; },
    addEventListener(type, listener) { (this.listeners ||= {})[type] = listener; },
    setAttribute(name, value) { this[name] = value; },
    remove() { this.removed = true; }
  };
}

function loadContent({ previewOpen, includeImage = true, includeVideo = false, roundVideo = false, showSaveFilePicker = undefined }) {
  const listeners = {};
  const windowListeners = {};
  const posted = [];
  const timers = [];
  const body = createNode('body');
  const image = {
    tagName: 'IMG',
    isConnected: true,
    className: '',
    currentSrc: 'https://web.telegram.org/file.jpg',
    src: 'https://web.telegram.org/file.jpg',
    getBoundingClientRect: () => ({ left: 100, top: 100, width: 500, height: 500, right: 600, bottom: 600 }),
    closest: selector => previewOpen && selector.includes('.media-viewer') ? {} : null,
    getAttribute: () => ''
  };
  const video = {
    ...image,
    tagName: 'VIDEO',
    currentSrc: 'https://web.telegram.org/file.mp4',
    src: 'https://web.telegram.org/file.mp4',
    closest: selector => roundVideo && selector.includes('.media-round') ? {} : null,
    getAttribute: name => name === 'type' ? 'video/mp4' : ''
  };
  const document = {
    body,
    documentElement: createNode('html'),
    querySelectorAll: () => [includeImage ? image : null, includeVideo ? video : null].filter(Boolean),
    createElement: createNode,
    addEventListener: (type, listener, options) => {
      listeners[type] = listener;
      listeners[`${type}Capture`] = options === true;
    }
  };
  const window = {
    addEventListener: (type, listener, options) => {
      windowListeners[type] = listener;
      windowListeners[`${type}Capture`] = options === true;
    },
    postMessage: message => posted.push(message),
    setTimeout: callback => {
      timers.push(callback);
      return timers.length;
    },
    showSaveFilePicker
  };
  const sandbox = {
    chrome: { runtime: { getURL: path => `chrome-extension://test/${path}` } },
    console,
    crypto: { randomUUID: () => 'request-1' },
    document,
    window,
    globalThis: null,
    getComputedStyle: () => ({ display: 'block', visibility: 'visible', opacity: '1' }),
    innerWidth: 800,
    innerHeight: 800
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(
    fs.readFileSync(path.join(root, 'src', 'content.js'), 'utf8'),
    sandbox,
    { filename: 'src/content.js' }
  );
  return { body, listeners, posted, window, windowListeners, timers };
}

test('单个可见视频右键时显示另存为菜单', () => {
  const { body, listeners } = loadContent({ previewOpen: false, includeImage: false, includeVideo: true });
  const event = { target: body, clientX: 250, clientY: 300, preventDefault() { this.prevented = true; } };

  assert.equal(typeof listeners.contextmenu, 'function');
  assert.equal(listeners.contextmenuCapture, true);
  listeners.contextmenu(event);
  assert.equal(event.prevented, true);
  assert.equal(body.children.length, 1);
  assert.ok(body.children[0].children[0].children[1]);
  assert.equal(body.children[0].children[0].children[1].textContent, '另存为');
});

test('按 Esc 时关闭另存为菜单', () => {
  const { body, listeners, windowListeners } = loadContent({ previewOpen: true });
  const menuEvent = { target: body, clientX: 250, clientY: 300, preventDefault() {} };

  listeners.contextmenu(menuEvent);
  assert.ok(body.children[0]);
  assert.equal(typeof windowListeners.keydown, 'function');
  assert.equal(windowListeners.keydownCapture, true);
  windowListeners.keydown({ key: 'Escape' });

  assert.equal(body.children[0].removed, true);
});

test('鼠标悬停另存为菜单项时改变背景色', () => {
  const { body, listeners } = loadContent({ previewOpen: true });
  const event = { target: body, clientX: 250, clientY: 300, preventDefault() {} };

  listeners.contextmenu(event);
  const save = body.children[0].children[0];
  assert.equal(typeof save.listeners.mouseenter, 'function');
  save.listeners.mouseenter();
  assert.equal(save.style.background, '#f0f0f0');
  save.listeners.mouseleave();
  assert.equal(save.style.background, 'transparent');
});

test('另存为菜单项显示下载图标', () => {
  const { body, listeners } = loadContent({ previewOpen: true });
  const event = { target: body, clientX: 250, clientY: 300, preventDefault() {} };

  listeners.contextmenu(event);
  const save = body.children[0].children[0];

  assert.ok(save.children[0]);
  assert.equal(save.children[0].tagName, 'IMG');
  assert.equal(save.children[0].src, 'chrome-extension://test/icons/download.svg');
  assert.equal(save.children[1].textContent, '另存为');
});

test('读取媒体时显示百分比进度条', async () => {
  const { body, listeners, posted, window, windowListeners } = loadContent({
    previewOpen: true,
    showSaveFilePicker: () => Promise.resolve({})
  });
  const event = { target: body, clientX: 250, clientY: 300, preventDefault() {} };

  listeners.contextmenu(event);
  const save = body.children[0].children[0];
  save.listeners.click();
  await Promise.resolve();
  await windowListeners.message({
    source: window,
    data: {
      namespace: 'TG_WEB_SAVE_AS_EVENT_V1',
      requestId: posted[0].requestId,
      event: 'progress',
      loaded: 45,
      total: 100
    }
  });

  assert.equal(save.children[1].textContent, '下载中 45%');
  assert.ok(save.children[2]?.children[0]);
  assert.equal(save.children[2].children[0].style.width, '45%');
});

test('多个非预览媒体时保留浏览器原有右键菜单', () => {
  const { body, listeners } = loadContent({ previewOpen: false, includeVideo: true });
  const event = { target: body, clientX: 250, clientY: 300, preventDefault() { this.prevented = true; } };

  assert.equal(typeof listeners.contextmenu, 'function');
  listeners.contextmenu(event);
  assert.equal(body.children.length, 0);
  assert.equal(event.prevented, undefined);
});

test('点击图片另存为菜单时打开原生保存窗口', () => {
  const pickerCalls = [];
  const { body, listeners } = loadContent({
    previewOpen: true,
    showSaveFilePicker: options => {
      pickerCalls.push(options);
      return Promise.resolve({});
    }
  });
  const event = { target: body, clientX: 250, clientY: 300, preventDefault() {} };
  assert.equal(typeof listeners.contextmenu, 'function');
  listeners.contextmenu(event);
  assert.ok(body.children[0]?.children[0]);
  body.children[0].children[0].listeners.click();

  assert.equal(pickerCalls.length, 1);
  assert.equal(pickerCalls[0].types[0].accept['image/jpeg'][0], '.jpg');
});

test('选定保存位置后请求页面读取当前 Telegram 媒体', async () => {
  const { body, listeners, posted } = loadContent({
    previewOpen: true,
    showSaveFilePicker: () => Promise.resolve({})
  });
  const event = { target: body, clientX: 250, clientY: 300, preventDefault() {} };
  assert.equal(typeof listeners.contextmenu, 'function');
  listeners.contextmenu(event);
  assert.ok(body.children[0]?.children[0]);
  body.children[0].children[0].listeners.click();
  await Promise.resolve();

  assert.equal(posted.length, 1);
  assert.equal(posted[0].namespace, 'TG_WEB_SAVE_AS_REQUEST_V1');
  assert.equal(posted[0].payload.src, 'https://web.telegram.org/file.jpg');
});

test('页面桥接返回 Blob 后提示保存成功并自动关闭菜单', async () => {
  let written = null;
  let closed = false;
  const { body, listeners, posted, window, windowListeners, timers } = loadContent({
    previewOpen: true,
    showSaveFilePicker: () => Promise.resolve({
      createWritable: async () => ({
        write: async blob => { written = await blob.text(); },
        close: async () => { closed = true; }
      })
    })
  });
  const event = { target: body, clientX: 250, clientY: 300, preventDefault() {} };
  assert.equal(typeof listeners.contextmenu, 'function');
  listeners.contextmenu(event);
  assert.ok(body.children[0]?.children[0]);
  const save = body.children[0].children[0];
  save.listeners.click();
  await Promise.resolve();
  await windowListeners.message({
    source: window,
    data: {
      namespace: 'TG_WEB_SAVE_AS_EVENT_V1',
      requestId: posted[0].requestId,
      event: 'resource',
      blob: new Blob(['saved'])
    }
  });
  assert.equal(written, 'saved');
  assert.equal(closed, true);
  assert.equal(save.children[1].textContent, '保存成功');
  assert.equal(timers.length, 1);
  timers[0]();
  assert.equal(body.children[0].style.opacity, '0');
  assert.equal(timers.length, 2);
  timers[1]();
  assert.equal(body.children[0].removed, true);
});

test('预览同时含有封面图和圆形视频时菜单保存视频', () => {
  const pickerCalls = [];
  const { body, listeners } = loadContent({
    previewOpen: true,
    includeVideo: true,
    roundVideo: true,
    showSaveFilePicker: options => {
      pickerCalls.push(options);
      return Promise.resolve({});
    }
  });
  const event = { target: body, clientX: 250, clientY: 300, preventDefault() {} };
  assert.equal(typeof listeners.contextmenu, 'function');
  listeners.contextmenu(event);
  assert.ok(body.children[0]?.children[0]);
  body.children[0].children[0].listeners.click();

  assert.equal(pickerCalls[0].types[0].accept['video/mp4'][0], '.mp4');
});
