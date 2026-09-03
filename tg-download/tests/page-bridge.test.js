const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

test('页面桥接以当前登录态读取 Telegram 媒体并回传 Blob', async () => {
  const listeners = {};
  const posted = [];
  const pageWindow = {
    addEventListener: (type, listener) => { listeners[type] = listener; },
    postMessage: message => posted.push(message)
  };
  const sandbox = {
    Blob,
    console,
    fetch: async (_url, options) => {
      assert.equal(options.credentials, 'include');
      return {
        ok: true,
        headers: { get: name => name === 'Content-Type' ? 'image/jpeg' : name === 'Content-Length' ? '5' : null },
        blob: async () => new Blob(['photo'], { type: 'image/jpeg' })
      };
    },
    globalThis: null,
    window: pageWindow
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(
    fs.readFileSync(path.join(root, 'src', 'page-bridge.js'), 'utf8'),
    sandbox,
    { filename: 'src/page-bridge.js' }
  );

  await listeners.message({
    source: pageWindow,
    data: {
      namespace: 'TG_WEB_SAVE_AS_REQUEST_V1',
      requestId: 'request-1',
      payload: { kind: 'image', src: 'https://web.telegram.org/file.jpg', filename: 'TG_IMG.jpg' }
    }
  });

  assert.equal(posted.length, 2);
  assert.equal(posted[0].event, 'progress');
  assert.equal(posted[0].loaded, 5);
  assert.equal(posted[0].total, 5);
  assert.equal(posted[1].namespace, 'TG_WEB_SAVE_AS_EVENT_V1');
  assert.equal(posted[1].event, 'resource');
  assert.equal(await posted[1].blob.text(), 'photo');
});
