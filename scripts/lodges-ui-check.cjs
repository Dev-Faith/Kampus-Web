// Reproduce responsive listing visibility using fixture APIs; no account or database writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const origin = process.env.KAMPUS_UI_BASE_URL || 'http://localhost:3000';
const out = path.join(os.tmpdir(), 'kampus-lodges-check');
fs.mkdirSync(out, { recursive: true });
const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=9355',
  '--user-data-dir=' + path.join(out, 'profile-' + Date.now()), 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket, sequence = 0;
const pending = new Map(), errors = [];
const listings = ['Single Room', 'Self contained'].map((title, index) => ({
  id: 'unit-' + index, title, status: index ? 'BOOKED' : 'AVAILABLE',
  category: index ? 'self_contained' : 'single_room_shared', university: 'FUTMINNA',
  campusArea: 'gidankwano', rent: index ? 450000 : 340000, city: 'Minna',
  address: 'Test street', description: 'Test accommodation', images: [], amenities: [],
  landlord: { fullName: 'Test host', isVerified: false, rating: 0, reviewCount: 0 },
}));
function call(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
    setTimeout(() => { if (pending.delete(id)) reject(Error('Timeout: ' + method)); }, 30000).unref();
  });
}
async function evaluate(expression) {
  const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}
async function until(expression) {
  for (let i = 0; i < 200; i++) { if (await evaluate(expression)) return; await delay(100); }
  throw Error('Not ready: ' + expression);
}
async function mock({ requestId, request }) {
  const url = new URL(request.url);
  let data = {};
  if (url.pathname === '/api/lodges') {
    const search = url.searchParams.get('search')?.toLowerCase();
    const items = search ? listings.filter(l => l.title.toLowerCase().includes(search)) : listings;
    data = { items, pagination: { page: 1, pageSize: 12, total: items.length } };
  } else if (url.pathname === '/api/amenities') data = [];
  else if (url.pathname === '/api/auth/registration-status') data = { verificationMethod: 'email' };
  await call('Fetch.fulfillRequest', { requestId, responseCode: 200, responseHeaders: [
    { name: 'Content-Type', value: 'application/json' },
    { name: 'Access-Control-Allow-Origin', value: origin },
    { name: 'Access-Control-Allow-Headers', value: '*' },
    { name: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
  ], body: Buffer.from(JSON.stringify({ success: true, data })).toString('base64') });
}
async function assertCards(label, count = 2) {
  await until(`document.querySelectorAll('.explore-property-card').length >= ${count}`);
  // Wait past the entrance and shared-layout animation: the original bug hides cards afterwards.
  await delay(1800);
  const cards = await evaluate(`Array.from(document.querySelectorAll('.explore-property-card')).filter(e => e.getClientRects().length && e.getBoundingClientRect().width > 0).map(e => ({title:e.querySelector('h3').textContent,opacity:Number(getComputedStyle(e).opacity),visibility:getComputedStyle(e).visibility}))`);
  const screenshot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(path.join(out, label + '.png'), Buffer.from(screenshot.data, 'base64'));
  assert.equal(cards.length, count, label + ': expected visible card containers');
  assert(cards.every(c => c.opacity > 0.99 && c.visibility === 'visible'), label + ': cards disappeared: ' + JSON.stringify(cards));
}
async function clickView(title) { await evaluate(`document.querySelector('button[title=${JSON.stringify(title)}]').click()`); }
async function search(value) {
  await evaluate(`(()=>{const input=document.querySelector('input[aria-label="Search lodges by name, area, or campus"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(value)});input.dispatchEvent(new Event('input',{bubbles:true}));})()`);
}
(async () => {
  try {
    let tab;
    for (let i = 0; i < 80; i++) { try { tab = await (await fetch('http://127.0.0.1:9355/json/new?about:blank', { method: 'PUT' })).json(); break; } catch { await delay(150); } }
    if (!tab) throw Error('Browser unavailable');
    socket = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    socket.onmessage = event => {
      const m = JSON.parse(event.data), p = pending.get(m.id);
      if (p) { pending.delete(m.id); m.error ? p.reject(Error(m.error.message)) : p.resolve(m.result); }
      else if (m.method === 'Fetch.requestPaused') void mock(m.params).catch(e => errors.push(e.message));
      else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    };
    await call('Page.enable'); await call('Runtime.enable');
    await call('Fetch.enable', { patterns: [{ urlPattern: 'https://kampus-backend.vercel.app/*' }] });
    await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
    await call('Page.navigate', { url: origin + '/explore' });
    await assertCards('desktop-grid');
    await clickView('Split Feed & Map View'); await assertCards('desktop-split');
    await clickView('Full Grid View'); await assertCards('desktop-grid-return');
    await search('Single');
    await until("document.querySelector('.explore-summary')?.textContent.includes('1 listings')");
    await assertCards('desktop-filter', 1);
    await search(''); await until("document.querySelector('.explore-summary')?.textContent.includes('2 listings')");
    await assertCards('desktop-filter-reset');
    await evaluate("[...document.querySelectorAll('.explore-viewports .explore-property-card button')].find(e=>e.textContent.includes('View Lodge')).click()");
    await until("!!document.querySelector('[role=dialog]')");
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await until("!document.querySelector('[role=dialog]')"); await assertCards('desktop-dialog-closed');
    await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await assertCards('mobile-grid');
    await call('Page.reload'); await assertCards('mobile-reload');
    await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
    await assertCards('desktop-after-resize');
    assert.deepEqual(errors, []);
    console.log('PASS: listing visibility survives animations, view switches, filtering, quick view, reload and responsive resizing.');
    console.log(out);
  } finally {
    if (socket) { await call('Browser.close').catch(() => {}); socket.close(); } else browser.kill();
  }
})().catch(e => { console.error(e.message); console.error(errors); process.exitCode = 1; });
