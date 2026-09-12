const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

// 验证普通响应不会先创建完整 Blob。
test('200 响应按读取块直接写入文件', async () => {
  const sandbox = { globalThis: null, window: {}, document: { addEventListener() {} }, TgDownload: { createMenu: () => ({}) } };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../views/download/index.js'), 'utf8'), sandbox);
  const writes = [];
  await sandbox.TgDownload.writeResponse({ status: 200, headers: { get: () => '4' }, body: { getReader: () => ({ read: async () => ({ done: true }) }) } }, { write: async value => writes.push(value) }, () => {});
  assert.deepEqual(writes, []);
});

// 验证可解析 Telegram 流媒体的后续 Range 偏移量。
test('206 响应会根据 Content-Range 请求下一段', () => {
  const sandbox = { globalThis: null, window: {}, document: { addEventListener() {} }, TgDownload: { createMenu: () => ({}) } };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../views/download/index.js'), 'utf8'), sandbox);
  const range = sandbox.TgDownload.rangeInfo('bytes 0-9/20');
  assert.equal(range.end, 9);
  assert.equal(range.total, 20);
});

// 验证放大预览层内的图片区域会打开下载菜单。
test('放大预览内的图片会拦截右键', () => {
  const listeners = {};
  const preview = {};
  const media = {
    tagName: 'IMG',
    closest: selector => selector === 'img,video' ? media : selector === '.media-viewer-mover' ? preview : null,
    getBoundingClientRect: () => ({ left: 10, top: 10, right: 210, bottom: 210 }),
  };
  const menu = { busy: () => false, contains: () => false, close() {}, open() { this.opened = true; } };
  const document = {
    addEventListener: (type, listener) => { listeners[type] = listener; },
    elementFromPoint: () => media,
  };
  const sandbox = { globalThis: null, document, TgDownload: { createMenu: () => menu } };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../views/download/index.js'), 'utf8'), sandbox);
  const event = { target: media, clientX: 100, clientY: 100, preventDefault() { this.prevented = true; } };
  listeners.contextmenu(event);
  assert.equal(event.prevented, true);
  assert.equal(menu.opened, true);
});

// 验证消息中的非预览媒体保留 Telegram 原生右键菜单。
test('非放大预览媒体不会拦截右键', () => {
  const listeners = {};
  const media = {
    tagName: 'IMG',
    closest: selector => selector === 'img,video' ? media : null,
    getBoundingClientRect: () => ({ left: 10, top: 10, right: 210, bottom: 210 }),
  };
  const menu = { busy: () => false, contains: () => false, close() {}, open() { this.opened = true; } };
  const document = {
    addEventListener: (type, listener) => { listeners[type] = listener; },
    elementFromPoint: () => media,
  };
  const sandbox = { globalThis: null, document, TgDownload: { createMenu: () => menu } };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../views/download/index.js'), 'utf8'), sandbox);
  const event = { target: media, clientX: 100, clientY: 100, preventDefault() { this.prevented = true; } };
  listeners.contextmenu(event);
  assert.equal(event.prevented, undefined);
  assert.equal(menu.opened, undefined);
});

// 验证下载期间不会创建第二个菜单，避免前一次下载状态串入新菜单。
test('下载中不会再次打开预览菜单', () => {
  const listeners = {};
  const preview = {};
  const media = {
    tagName: 'VIDEO',
    closest: selector => selector === 'img,video' ? media : selector === '.media-viewer-mover' ? preview : null,
    getBoundingClientRect: () => ({ left: 10, top: 10, right: 210, bottom: 210 }),
  };
  const menu = { busy: () => true, contains: () => false, close() {}, open() { this.opened = true; } };
  const document = {
    addEventListener: (type, listener) => { listeners[type] = listener; },
    elementFromPoint: () => media,
  };
  const sandbox = { globalThis: null, document, TgDownload: { createMenu: () => menu } };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../views/download/index.js'), 'utf8'), sandbox);
  const event = { target: media, clientX: 100, clientY: 100, preventDefault() { this.prevented = true; } };
  listeners.contextmenu(event);
  assert.equal(event.prevented, undefined);
  assert.equal(menu.opened, undefined);
});

// 验证下载文件名只依赖媒体类型，避免为识别格式提前请求网络资源。
test('按媒体类型生成统一的下载文件名', () => {
  class FixedDate extends Date {
    constructor() { super('2026-09-10T14:23:45'); }
  }
  const sandbox = { globalThis: null, Date: FixedDate, document: {}, TgDownload: {} };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../views/download/index.js'), 'utf8'), sandbox);
  assert.equal(sandbox.TgDownload.filenameFor('IMG'), 'TG_IMG_20260910_142345.jpg');
  assert.equal(sandbox.TgDownload.filenameFor('VIDEO'), 'TG_VIDEO_20260910_142345.mp4');
});

// 验证用户取消文件选择后不会请求 Telegram 媒体资源。
test('取消保存时不会发起媒体请求', async () => {
  let requests = 0;
  const menu = { close() { this.closed = true; } };
  const sandbox = {
    globalThis: null,
    document: {},
    TgDownload: {},
    fetch: async () => { requests += 1; },
    showSaveFilePicker: async () => { const error = new Error('取消保存'); error.name = 'AbortError'; throw error; },
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../views/download/index.js'), 'utf8'), sandbox);
  await sandbox.TgDownload.save({ tagName: 'IMG', src: 'blob:https://web.telegram.org/test' }, menu);
  assert.equal(requests, 0);
  assert.equal(menu.closed, true);
});

// 验证下载失败会中止文件流、记录错误并恢复重试入口。
test('保存失败后中止文件流并恢复菜单', async () => {
  const writable = { abort: async () => { writable.aborted = true; } };
  const menu = {
    result: text => { menu.resultText = text; },
    ready: () => { menu.readyCalled = true; },
  };
  const sandbox = {
    globalThis: null,
    document: {},
    TgDownload: {},
    console: { error: () => { sandbox.logged = true; } },
    fetch: async () => ({ status: 500, headers: { get: () => null } }),
    setTimeout: callback => callback(),
    showSaveFilePicker: async () => ({ createWritable: async () => writable }),
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../views/download/index.js'), 'utf8'), sandbox);
  await sandbox.TgDownload.save({ tagName: 'VIDEO', src: 'https://web.telegram.org/stream/test' }, menu);
  assert.equal(writable.aborted, true);
  assert.equal(menu.resultText, '下载失败');
  assert.equal(menu.readyCalled, true);
  assert.equal(sandbox.logged, true);
});

// 验证完整响应会流式写入并关闭用户选择的文件。
test('200 完整响应会写入所选文件', async () => {
  const writes = [];
  const writable = { write: async chunk => writes.push([...chunk]), close: async () => { writable.closed = true; } };
  const menu = { loading() {}, result() {}, close() {} };
  const sandbox = {
    globalThis: null,
    document: {},
    TgDownload: {},
    setTimeout: callback => callback(),
    fetch: async () => ({ status: 200, headers: { get: name => name === 'Content-Length' ? '2' : null }, body: { getReader: () => { let read = false; return { read: async () => { if (read) return { done: true }; read = true; return { done: false, value: new Uint8Array([1, 2]) }; } }; } } }),
    showSaveFilePicker: async () => ({ createWritable: async () => writable }),
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../views/download/index.js'), 'utf8'), sandbox);
  await sandbox.TgDownload.save({ tagName: 'IMG', src: 'blob:https://web.telegram.org/test' }, menu);
  assert.deepEqual(writes, [[1, 2]]);
  assert.equal(writable.closed, true);
});

// 验证分段响应会根据已写入字节请求下一段。
test('206 分段响应会续传后续字节', async () => {
  const ranges = [];
  const writable = { write: async () => {}, close: async () => { writable.closed = true; } };
  const menu = { loading() {}, result() {}, close() {} };
  const response = (range, bytes) => ({ status: 206, headers: { get: name => name === 'Content-Range' ? range : null }, body: { getReader: () => { let read = false; return { read: async () => { if (read) return { done: true }; read = true; return { done: false, value: new Uint8Array(bytes) }; } }; } } });
  const responses = [response('bytes 0-1/3', [1, 2]), response('bytes 2-2/3', [3])];
  const sandbox = {
    globalThis: null,
    document: {},
    TgDownload: {},
    setTimeout: callback => callback(),
    fetch: async (_src, options) => { ranges.push(options.headers.Range); return responses.shift(); },
    showSaveFilePicker: async () => ({ createWritable: async () => writable }),
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../views/download/index.js'), 'utf8'), sandbox);
  await sandbox.TgDownload.save({ tagName: 'VIDEO', src: 'https://web.telegram.org/stream/test' }, menu);
  assert.deepEqual(ranges, ['bytes=0-', 'bytes=2-']);
  assert.equal(writable.closed, true);
});

// 验证瞬时完成的下载仍会展示至少 300ms 的加载状态，再开始成功淡出。
test('瞬时下载会保留最短加载状态后淡出', async () => {
  const timers = [];
  const writable = { close: async () => {} };
  const menu = { loading() { menu.loadingCalled = true; }, result: text => { menu.resultText = text; }, dismiss: delay => { menu.dismissDelay = delay; } };
  const sandbox = {
    globalThis: null,
    Date: class extends Date { static now() { return 0; } },
    document: {},
    TgDownload: {},
    fetch: async () => ({ status: 200, headers: { get: () => null }, body: { getReader: () => ({ read: async () => ({ done: true }) }) } }),
    setTimeout: (callback, delay) => { timers.push({ callback, delay }); },
    showSaveFilePicker: async () => ({ createWritable: async () => writable }),
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../views/download/index.js'), 'utf8'), sandbox);
  await sandbox.TgDownload.save({ tagName: 'IMG', src: 'blob:https://web.telegram.org/test' }, menu);
  assert.equal(menu.loadingCalled, true);
  assert.equal(menu.resultText, undefined);
  assert.deepEqual(timers.map(timer => timer.delay), [300]);
  timers[0].callback();
  assert.equal(menu.resultText, '下载成功');
  assert.equal(menu.dismissDelay, 300);
});
