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
