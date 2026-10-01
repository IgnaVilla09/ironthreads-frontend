const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function workerFixture({ missingAsset = false } = {}) {
  const handlers = new Map();
  const stored = new Map();
  let online = true;
  const cache = {
    put: async (request, response) => stored.set(String(request), response.clone()),
    match: async (request, options) => {
      const key = typeof request === 'string' ? request : new URL(request.url).pathname + new URL(request.url).search;
      if (stored.has(key)) return stored.get(key).clone();
      if (options?.ignoreSearch) return stored.get(key.split('?')[0])?.clone();
      return undefined;
    },
  };
  const caches = { open: async () => cache, keys: async () => [] };
  const fetch = async (request) => {
    if (!online) throw new Error('Sin conexión');
    const url = typeof request === 'string' ? request : new URL(request.url).pathname;
    if (url === '/offline') return new Response('<script src="/_next/static/chunks/offline.js"></script><link href="/_next/static/css/offline.css">', { headers: { 'Content-Type': 'text/html' } });
    if (url === '/_next/static/chunks/offline.js') return missingAsset ? new Response('', { status: 404 }) : new Response('app code');
    if (url === '/_next/static/css/offline.css') return new Response('body { color: black; }');
    throw new Error(`Unexpected request: ${url}`);
  };
  const self = { location: { origin: 'http://localhost:3000' }, addEventListener: (name, handler) => handlers.set(name, handler) };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'public/sw.js'), 'utf8'), { self, caches, fetch, Response, URL });
  return { handlers, stored, goOffline: () => { online = false; } };
}

async function prepare(fixture) {
  let operation;
  let reply;
  fixture.handlers.get('message')({
    data: { type: 'PREPARE_OFFLINE' },
    ports: [{ postMessage: (value) => { reply = value; } }],
    waitUntil: (promise) => { operation = promise; },
  });
  await operation;
  return reply;
}

test('recargar sin conexión devuelve el shell y sus recursos preparados', async () => {
  const fixture = workerFixture();
  assert.equal((await prepare(fixture)).ready, true);
  fixture.goOffline();
  let response;
  fixture.handlers.get('fetch')({
    request: { url: 'http://localhost:3000/dashboard', method: 'GET', mode: 'navigate' },
    respondWith: (promise) => { response = promise; },
  });
  assert.match(await (await response).text(), /offline\.js/);
  fixture.handlers.get('fetch')({
    request: { url: 'http://localhost:3000/_next/static/chunks/offline.js?v=1', method: 'GET', mode: 'cors' },
    respondWith: (promise) => { response = promise; },
  });
  assert.equal(await (await response).text(), 'app code');
});

test('no declara listo el modo offline si falta un recurso', async () => {
  const fixture = workerFixture({ missingAsset: true });
  assert.equal((await prepare(fixture)).ready, false);
  assert.equal(fixture.stored.has('/offline'), false);
});
