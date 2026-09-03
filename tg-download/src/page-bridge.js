(() => {
  const REQUEST_NAMESPACE = 'TG_WEB_SAVE_AS_REQUEST_V1';
  const EVENT_NAMESPACE = 'TG_WEB_SAVE_AS_EVENT_V1';

  function isStreamSource(source) {
    return String(source || '').startsWith('stream/') || /\/stream\//.test(String(source || ''));
  }

  async function blobFromResponse(response, mime, onProgress) {
    const total = Number(response.headers.get('Content-Length')) || 0;

    if (!response.body?.getReader) {
      const blob = await response.blob();
      onProgress(blob.size, total || blob.size);
      return blob.type ? blob : new Blob([blob], { type: mime });
    }

    const reader = response.body.getReader();
    const chunks = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      onProgress(loaded, total);
    }

    return new Blob(chunks, { type: mime });
  }

  async function fetchResource(payload, onProgress = () => {}) {
    const source = String(payload?.src || '');
    if (!source) throw new Error('没有可保存的媒体地址');

    if (payload.kind === 'video' && isStreamSource(source)) {
      return fetchRanges(source, payload.mime, onProgress);
    }

    const response = await fetch(source, { credentials: 'include' });
    if (!response.ok) throw new Error(`读取媒体失败（HTTP ${response.status}）`);
    const mime = response.headers.get('Content-Type') || payload.mime || 'application/octet-stream';
    const blob = await blobFromResponse(response, mime, onProgress);
    return {
      blob
    };
  }

  async function fetchRanges(source, mime = 'video/mp4', onProgress = () => {}) {
    const chunks = [];
    let offset = 0;
    let total = null;

    while (total == null || offset < total) {
      const response = await fetch(source, {
        credentials: 'include',
        headers: { Range: `bytes=${offset}-` }
      });

      if (response.status === 200 && offset === 0) {
        const blob = await blobFromResponse(response, mime, onProgress);
        return { blob };
      }
      if (response.status !== 206) throw new Error(`读取媒体失败（HTTP ${response.status}）`);

      const match = /^bytes\s+(\d+)-(\d+)\/(\d+)$/i.exec(response.headers.get('Content-Range') || '');
      if (!match || Number(match[1]) !== offset) throw new Error('Telegram 视频分片范围无效');

      const chunk = await response.arrayBuffer();
      const end = Number(match[2]);
      total = Number(match[3]);
      if (chunk.byteLength !== end - offset + 1) throw new Error('Telegram 视频分片大小无效');
      chunks.push(chunk);
      offset = end + 1;
      onProgress(offset, total);
    }

    return { blob: new Blob(chunks, { type: mime }) };
  }

  window.addEventListener('message', async event => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.namespace !== REQUEST_NAMESPACE || typeof data.requestId !== 'string') return;

    try {
      const { blob } = await fetchResource(data.payload, (loaded, total) => {
        window.postMessage({
          namespace: EVENT_NAMESPACE,
          requestId: data.requestId,
          event: 'progress',
          loaded,
          total
        }, '*');
      });
      window.postMessage({
        namespace: EVENT_NAMESPACE,
        requestId: data.requestId,
        event: 'resource',
        blob
      }, '*');
    } catch (error) {
      window.postMessage({
        namespace: EVENT_NAMESPACE,
        requestId: data.requestId,
        event: 'error',
        error: error instanceof Error ? error.message : String(error)
      }, '*');
    }
  });
})();
