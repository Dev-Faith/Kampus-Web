// Browser regression check using mocked API responses only; no hosted writes or email.
// Node 22+ and Microsoft Edge on Windows. Start the web app on localhost:3000 first.
const assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), { spawn } = require('node:child_process');
const out = path.join(os.tmpdir(), 'kampus-registration-check'); fs.mkdirSync(out, { recursive: true });
const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9345', '--user-data-dir=' + path.join(out, 'profile-' + Date.now()), 'about:blank'], { windowsHide: true, stdio: 'ignore' });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket, nextId = 1, emailAvailable = false, currentUser = null, sentRole = 'STUDENT', duplicateProfile = false;
const pending = new Map(), writes = [], errors = [], requestId = '31b13368-53de-439b-b4b3-bdefa9d084d0';
const users = {};
function call(method, params = {}) { const id = nextId++; return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error('Timeout: ' + method)); } }, 30000).unref(); }); }
async function evaluate(expression) { const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; }
async function waitFor(expression) { for (let i = 0; i < 160; i++) { if (await evaluate(expression)) return; await delay(150); } throw new Error('Not ready: ' + expression); }
async function mock(p) {
  const route = new URL(p.request.url).pathname.replace(/^\/api\//, ''), body = JSON.parse(p.request.postData || '{}');
  let data = {}, code = 200, message = 'OK';
  if (p.request.method === 'OPTIONS') data = {};
  else if (route === 'auth/registration-status') data = { verificationMethod: "email", emailVerificationAvailable: emailAvailable, expiresIn: 300, resendAfterSeconds: 60, message: emailAvailable ? "Verify your email address to create an account." : "Email verification is temporarily unavailable. Existing users can still sign in with their password." };
  else if (route === 'auth/email/send-otp') { sentRole = body.userType; writes.push({ route, email: body.email, role: sentRole }); data = { requestId, expiresIn: 300, resendAfterSeconds: 60 }; }
  else if (route === 'auth/email/verify-otp') {
    if (body.code !== '123456') { code = 400; message = 'Invalid or expired OTP'; }
    else {
      assert.equal(body.requestId, requestId);
      currentUser = { id: sentRole.toLowerCase(), phone: null, email: body.email, emailVerifiedAt: new Date().toISOString(), phoneVerifiedAt: null, fullName: null, role: sentRole, profileStatus: 'UNCOMPLETED', hasPassword: true, student: sentRole === 'STUDENT' ? {} : null, landlord: sentRole === 'LANDLORD' ? {} : null };
      data = { accessToken: 'ui-fixture', refreshToken: 'ui-fixture', user: currentUser, requiresProfileSetup: true };
    }
  } else if (route === 'auth/login') {
    if (body.password !== 'test-password-123' || !users[body.role]) { code = 401; message = 'Invalid credentials'; }
    else { currentUser = users[body.role]; data = { accessToken: 'ui-fixture', refreshToken: 'ui-fixture', user: currentUser }; }
  } else if (route === 'auth/me') data = currentUser;
  else if (['auth/profile', 'auth/landlord/profile'].includes(route)) {
    if (duplicateProfile) { code = 409; message = 'This phone number is already linked to another account.'; duplicateProfile = false; }
    else {
      const { password, ...profile } = body;
      currentUser = { ...currentUser, fullName: body.fullName, email: body.email, phone: body.phone, hasPassword: !!password || currentUser.hasPassword, profileStatus: 'COMPLETED', [currentUser.role === 'STUDENT' ? 'student' : 'landlord']: { ...profile, isVerified: false, kycStatus: 'PENDING' } };
      users[currentUser.role] = currentUser;
      data = { id: currentUser.id, fullName: body.fullName, profileStatus: 'COMPLETED' }; // Intentionally partial, as in the real API.
      writes.push({ route, fields: Object.keys(body) });
    }
  } else if (route === 'auth/logout') data = {};
  else if (route === 'landlords/profile') data = { ...currentUser?.landlord, fullName: currentUser?.fullName };
  else if (route === 'landlords/stats') data = { totalProperties: 0, availableProperties: 0, bookedProperties: 0, revenue: 0, totalBookings: 0, pendingConfirmations: 0 };
  else if (route === 'amenities' || route === 'landlords/buildings') data = [];
  else data = { items: [], pagination: { page: 1, total: 0, totalPages: 1 }, total: 0 };
  await call('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: code, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }, { name: 'Access-Control-Allow-Origin', value: 'http://localhost:3000' }, { name: 'Access-Control-Allow-Headers', value: '*' }, { name: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,OPTIONS' }], body: Buffer.from(JSON.stringify({ success: code < 400, statusCode: code, message, data })).toString('base64') });
}
async function click(text, scope = '') { await evaluate(`(()=>{const e=[...document.querySelectorAll(${JSON.stringify(scope + ' button')})].find(e=>e.textContent.trim()===${JSON.stringify(text)});if(!e||e.disabled)throw new Error('Button unavailable: '+${JSON.stringify(text)});e.click()})()`); await delay(120); }
async function field(name, value) { await evaluate(`(()=>{const e=document.querySelector('input[name="${name}"]');if(!e)throw new Error('Missing input: ${name}');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`); }
async function go() { await call('Page.navigate', { url: 'http://localhost:3000/' }); await waitFor("document.querySelector('header button') && document.readyState==='complete'"); await delay(500); }
async function size(width, height = 900) { await call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }); await delay(150); }
async function shot(name) { const r = await call('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(out, name + '.png'), Buffer.from(r.data, 'base64')); }
async function open(mode = 'signup') { await click('Join / Sign in'); await waitFor("!!document.querySelector('[role=dialog] input')"); if (mode === 'signup') await click('Create account', '[role=dialog]'); }
async function clear() { await evaluate("localStorage.clear()"); currentUser = null; await go(); }
async function signIn(role, password = 'test-password-123') { await open('signin'); if (role === 'LANDLORD') await click('Landlord', '[role=dialog]'); await field('emailOrPhone', role.toLowerCase() + '@example.test'); await field('password', password); await click('Sign in with password'); }
async function signupFields(role) {
  await field('email', role.toLowerCase() + '@example.test');
  await field('password', 'test-password-123'); await field('confirmPassword', 'test-password-123');
}
async function profile(role) {
  await waitFor("!!document.querySelector('input[name=fullName]')");
  await field('fullName', 'QA ' + role); await field('phone', role === 'STUDENT' ? '0801 234 5678' : '0802 123 4567');
  assert(await evaluate("document.querySelector('input[name=email]').readOnly"), 'Verified email must be locked');
  assert(!await evaluate("!!document.querySelector('input[name=password]')"), 'Do not ask for password again');
  if (role === 'STUDENT') { await field('matricNumber', 'FUTMINNA/QA/001'); await field('department', 'Computer Science'); }
  else { await field('bankName', 'Test bank'); await field('bankAccountNumber', '0000000000'); await field('bankAccountName', 'QA Landlord'); await field('bvn', '00000000000'); }
}
(async () => { try {
  let tab; for (let i = 0; i < 80; i++) { try { tab = await (await fetch('http://127.0.0.1:9345/json/new?about:blank', { method: 'PUT' })).json(); break; } catch { await delay(150); } }
  if (!tab) throw new Error('Browser unavailable');
  socket = new WebSocket(tab.webSocketDebuggerUrl); await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  socket.onmessage = e => { const m = JSON.parse(e.data), p = pending.get(m.id); if (p) { pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } else if (m.method === 'Fetch.requestPaused') mock(m.params).catch(e => errors.push(e.message)); else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); };
  await call('Page.enable'); await call('Runtime.enable'); await call('Fetch.enable', { patterns: [{ urlPattern: 'https://kampus-backend.vercel.app/*' }] });
  await size(320); await go(); await shot('header-320');
  assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Page overflows at 320px');
  await open(); await waitFor("document.querySelector('[role=dialog]')?.textContent.includes('temporarily unavailable')");
  assert(await evaluate("[...document.querySelectorAll('button')].find(e=>e.textContent==='Send verification email').disabled"));
  assert.equal(writes.length, 0); await shot('email-unavailable-320'); console.log('Email unavailable state and 320px layout: PASS');
  emailAvailable = true; await go(); await open();
  await signupFields('STUDENT'); await field('confirmPassword', 'different-password'); await click('Send verification email');
  await waitFor("document.querySelector('[role=alert]')?.textContent.includes('do not match')"); assert.equal(writes.length,0);
  await field('confirmPassword','test-password-123'); await waitFor("![...document.querySelectorAll('button')].find(e=>e.textContent==='Send verification email').disabled"); await click('Send verification email');
  await waitFor("!!document.querySelector('input[name=otp]')");
  assert.equal(writes[0].email, 'student@example.test'); assert.equal(writes[0].role, 'STUDENT');
  assert(await evaluate("![...Object.values(localStorage)].some(v=>v.includes('test-password-123'))"), 'Password must not persist in browser storage');
  assert(await evaluate("[...document.querySelectorAll('[role=dialog] button')].find(e=>e.textContent==='Landlord').matches(':disabled')"));
  await field('otp', '000000'); await click('Verify email and continue'); await waitFor("document.querySelector('[role=alert]')?.textContent.includes('Invalid or expired')");
  await field('otp', '123456'); await click('Verify email and continue'); await profile('STUDENT'); await shot('student-profile-320');
  await field('phone', '123'); await click('Finish registration'); await waitFor("document.querySelector('[role=alert]')?.textContent.includes('valid Nigerian')"); await field('phone', '08012345678'); duplicateProfile = true; await click('Finish registration'); await waitFor("document.querySelector('[role=alert]')?.textContent.includes('already linked')");
  assert.equal(await evaluate("document.querySelector('input[name=fullName]').value"), 'QA STUDENT');
  await click('Finish registration'); await waitFor("!document.querySelector('[role=dialog]')");
  assert(await evaluate("JSON.parse(localStorage.getItem('kampus_user')).student.matricNumber==='FUTMINNA/QA/001'"));
  console.log('Student signup, incorrect code, phone validation, duplicate contact and full session refresh: PASS');
  await clear(); await signIn('STUDENT', 'wrong-password'); await waitFor("document.querySelector('[role=alert]')?.textContent==='Invalid credentials'");
  await field('password', 'test-password-123'); await click('Sign in with password'); await waitFor("!document.querySelector('[role=dialog]')");
  await size(1440); await click('List your lodge'); await waitFor("document.querySelector('[role=dialog]')?.textContent.includes('Student and landlord accounts are separate')");
  assert(!await evaluate("!!document.querySelector('input[name=bankName]')")); console.log('Password sign-in and separate account boundary: PASS');
  await clear(); await click('List your lodge'); await waitFor("document.querySelector('[role=dialog]')?.textContent.includes('Create your Kampus account')");
  assert.equal(await evaluate("[...document.querySelectorAll('[role=dialog] button')].find(e=>e.textContent==='Landlord').getAttribute('aria-pressed')"), 'true');
  await signupFields('LANDLORD'); await waitFor("![...document.querySelectorAll('button')].find(e=>e.textContent==='Send verification email').disabled"); await click('Send verification email'); await waitFor("!!document.querySelector('input[name=otp]')");
  await field('otp', '123456'); await click('Verify email and continue'); await profile('LANDLORD'); await size(360, 760); await shot('landlord-profile-360');
  assert(await evaluate("document.querySelector('[role=dialog]').scrollHeight > document.querySelector('[role=dialog]').clientHeight"), 'Long profile must scroll');
  await click('Finish registration'); await waitFor("location.pathname==='/host/dashboard' && !document.querySelector('[role=dialog]')");
  assert(await evaluate("JSON.parse(localStorage.getItem('kampus_user')).role==='LANDLORD' && !JSON.parse(localStorage.getItem('kampus_user')).landlord.isVerified"));
  console.log('Landlord signup, mobile profile scroll, KYC pending and dashboard navigation: PASS');
  await clear(); currentUser = { ...users.STUDENT, profileStatus: 'UNCOMPLETED' }; users.STUDENT = currentUser; await signIn('STUDENT');
  await waitFor("!!document.querySelector('input[name=matricNumber]')"); assert.equal(await evaluate("document.querySelector('input[name=matricNumber]').value"), 'FUTMINNA/QA/001');
  await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' }); await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' });
  await waitFor("!document.querySelector('[role=dialog]')"); await click('Complete profile'); await waitFor("!!document.querySelector('input[name=fullName]')");
  console.log('Interrupted registration resumes on login and from the profile banner: PASS');
  await clear(); await call('Page.navigate', { url: 'http://localhost:3000/host/dashboard?register=1' });
  await waitFor("!!document.querySelector('[role=dialog] input[name=emailOrPhone]')");
  await click('Create account', '[role=dialog]'); await signupFields('LANDLORD');
  await waitFor("![...document.querySelectorAll('button')].find(e=>e.textContent==='Send verification email').disabled"); await click('Send verification email');
  await waitFor("!!document.querySelector('input[name=otp]')"); await field('otp', '123456'); await click('Verify email and continue');
  await waitFor("!!document.querySelector('input[name=bankName]')");
  assert.equal(currentUser.role, 'LANDLORD'); console.log('Direct Host Hub signup keeps profile setup open: PASS');
  await clear(); await call('Page.navigate', { url: 'http://localhost:3000/bookings' });
  await waitFor("[...document.querySelectorAll('button')].some(e=>e.textContent.includes('Sign In'))");
  await waitFor("document.readyState==='complete'"); await delay(800);
  await evaluate("[...document.querySelectorAll('main button')].find(e=>e.textContent.includes('Sign In')).click()");
  await waitFor("!!document.querySelector('[role=dialog] input[name=emailOrPhone]')");
  await click('Create account', '[role=dialog]'); await signupFields('STUDENT');
  await waitFor("![...document.querySelectorAll('button')].find(e=>e.textContent==='Send verification email').disabled"); await click('Send verification email');
  await waitFor("!!document.querySelector('input[name=otp]')"); await field('otp', '123456'); await click('Verify email and continue');
  await waitFor("!!document.querySelector('input[name=matricNumber]')"); console.log('Direct Bookings signup keeps profile setup open: PASS');
  assert.deepEqual(errors, []); console.log('Screenshots: ' + out);
} finally { if (socket) { await call('Browser.close').catch(() => {}); socket.close(); } else browser.kill(); } })().catch(error => { console.error(error.message); console.error(errors); process.exitCode = 1; });
