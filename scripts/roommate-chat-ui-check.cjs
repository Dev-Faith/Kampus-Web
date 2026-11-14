// Run against a local website. All account and conversation requests are mocked.
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  os = require("node:os"),
  path = require("node:path"),
  { spawn } = require("node:child_process");
const origin = process.env.KAMPUS_UI_BASE_URL || "http://localhost:3000";
const out = path.join(os.tmpdir(), "kampus-roommate-chat-check");
fs.mkdirSync(out, { recursive: true });
const browser = spawn(
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--remote-debugging-port=9356",
    "--user-data-dir=" + path.join(out, "profile-" + Date.now()),
    "about:blank",
  ],
  { windowsHide: true, stdio: "ignore" },
);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let socket,
  id = 0,
  failSend = false,
  failLoad = false,
  emptyInbox = false,
  sent = 0;
const pending = new Map(),
  errors = [];
const connections = [
  {
    id: "amara",
    otherName: "Amara Okafor",
    status: "ACCEPTED",
    direction: "RECEIVED",
    message:
      "Hi! I’m also looking around Gidankwano. A calm space, good company, and a short walk to campus would be perfect.",
  },
  {
    id: "david",
    otherName: "David Bello",
    status: "ACCEPTED",
    direction: "SENT",
    message:
      "Hey David, your place sounds like a good fit. Could we compare our plans?",
  },
  {
    id: "zainab",
    otherName: "Zainab Yusuf",
    status: "PENDING",
    direction: "RECEIVED",
    message: "I saw your post. I’d love to hear more about the room.",
  },
  {
    id: "tobi",
    otherName: "Tobi Adeyemi",
    status: "PENDING",
    direction: "SENT",
    message: "Are you still looking for someone to share with?",
  },
  {
    id: "grace",
    otherName: "Grace Eze",
    status: "CLOSED",
    direction: "RECEIVED",
    message: "Let’s talk about Bosso.",
  },
].map((item) => ({
  ...item,
  listingId: "post-" + item.id,
  listingActive: true,
}));
const lines = [
  [
    false,
    "Hey! Happy we connected. Are you leaning more towards Gidankwano or Bosso?",
  ],
  [
    true,
    "Gidankwano for me. I’d love somewhere quiet enough to study, but not too far from everything.",
  ],
  [false, "Same here! My budget is around ₦200,000 a year. What about you?"],
  [true, "That works for me. I’m planning to move in before the new semester."],
  [
    false,
    "Sounds like we’re on the same page. ☺\nShall we put together a shortlist this weekend?",
  ],
].map(([mine, body], index) => ({
  id: "m-" + index,
  mine,
  body,
  createdAt: new Date(Date.now() - (10 - index) * 60000).toISOString(),
}));
const messages = {
  amara: lines,
  david: [],
  zainab: [],
  tobi: [],
  grace: [
    {
      id: "g1",
      mine: false,
      body: "Thanks for the conversation. Good luck with your search!",
      createdAt: new Date().toISOString(),
    },
  ],
};
function call(method, params = {}) {
  const n = ++id;
  return new Promise((resolve, reject) => {
    pending.set(n, { resolve, reject });
    socket.send(JSON.stringify({ id: n, method, params }));
    setTimeout(() => {
      if (pending.delete(n)) reject(Error("Timeout " + method));
    }, 30000).unref();
  });
}
async function ev(expression) {
  const r = await call("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails)
    throw Error(
      r.exceptionDetails.exception?.description || r.exceptionDetails.text,
    );
  return r.result.value;
}
async function until(expression) {
  for (let i = 0; i < 250; i++) {
    if (await ev(expression)) return;
    await delay(100);
  }
  throw Error(
    "Not ready " +
      expression +
      "; page=" +
      (await ev("document.body.innerText.slice(-2000)")),
  );
}
async function click(label) {
  await ev(
    `(()=>{const e=document.querySelector('[aria-label='+${JSON.stringify(JSON.stringify(label))}+']')||[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(label)});if(!e||e.disabled)throw Error('Missing/enabled '+${JSON.stringify(label)});e.click()})()`,
  );
  await delay(160);
}
async function field(selector, value) {
  await ev(
    `(()=>{const e=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`,
  );
}
async function mock(p) {
  const u = new URL(p.request.url),
    route = u.pathname.replace("/api", ""),
    body = JSON.parse(p.request.postData || "{}");
  let data = {},
    status = 200;
  if (p.request.method === "OPTIONS") {
  } else if (route === "/auth/me")
    data = {
      id: "me",
      role: "STUDENT",
      fullName: "Test student",
      email: "ui@example.invalid",
      profileStatus: "COMPLETED",
      hasPassword: true,
      student: { department: "Engineering" },
    };
  else if (route === "/roommates/me") data = null;
  else if (route === "/roommates")
    data = { items: [], pagination: { total: 0, totalPages: 1 } };
  else if (route === "/roommates/connections")
    data = emptyInbox ? [] : connections;
  else if (/^\/roommates\/connections\/[^/]+\/messages$/.test(route)) {
    const key = route.split("/")[3];
    if (p.request.method === "POST") {
      sent++;
      await delay(350);
      if (failSend) status = 503;
      else {
        const message = {
          id: "new-" + sent,
          mine: true,
          body: body.body,
          createdAt: new Date().toISOString(),
        };
        messages[key].push(message);
        data = message;
      }
    } else {
      if (failLoad) status = 503;
      else data = messages[key];
    }
  } else if (
    /^\/roommates\/connections\/[^/]+$/.test(route) &&
    p.request.method === "PUT"
  ) {
    const connection = connections.find(
      (item) => item.id === route.split("/")[3],
    );
    connection.status = body.status;
    data = connection;
  } else if (route === "/auth/registration-status")
    data = { emailVerificationAvailable: true, verificationMethod: "email" };
  else data = [];
  await call("Fetch.fulfillRequest", {
    requestId: p.requestId,
    responseCode: status,
    responseHeaders: [
      { name: "Content-Type", value: "application/json" },
      { name: "Access-Control-Allow-Origin", value: origin },
      { name: "Access-Control-Allow-Headers", value: "*" },
      { name: "Access-Control-Allow-Methods", value: "GET,POST,PUT,OPTIONS" },
    ],
    body: Buffer.from(
      JSON.stringify({
        success: status < 400,
        data,
        message:
          status === 503 ? "Connection interrupted. Please retry." : undefined,
      }),
    ).toString("base64"),
  });
}
async function shot(name) {
  await delay(250);
  assert(
    await ev("document.documentElement.scrollWidth<=innerWidth"),
    name + " page overflow",
  );
  assert(
    await ev(
      "(()=>{const e=document.querySelector('.roommate-inbox');return e.scrollWidth<=e.clientWidth+1})()",
    ),
    name + " inbox overflow",
  );
  const result = await call("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(
    path.join(out, name + ".png"),
    Buffer.from(result.data, "base64"),
  );
}
(async () => {
  try {
    let tab;
    for (let i = 0; i < 80; i++) {
      try {
        tab = await (
          await fetch("http://127.0.0.1:9356/json/new?about:blank", {
            method: "PUT",
          })
        ).json();
        break;
      } catch {
        await delay(150);
      }
    }
    if (!tab) throw Error("Browser unavailable");
    socket = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = reject;
    });
    socket.onmessage = (e) => {
      const m = JSON.parse(e.data),
        p = pending.get(m.id);
      if (p) {
        pending.delete(m.id);
        m.error ? p.reject(Error(m.error.message)) : p.resolve(m.result);
      } else if (m.method === "Fetch.requestPaused")
        void mock(m.params).catch((e) => errors.push(e.message));
      else if (m.method === "Runtime.exceptionThrown")
        errors.push(
          m.params.exceptionDetails.exception?.description ||
            m.params.exceptionDetails.text,
        );
    };
    await call("Page.enable");
    await call("Runtime.enable");
    await call("Fetch.enable", {
      patterns: [{ urlPattern: "https://kampus-backend.vercel.app/*" }],
    });
    await call("Page.addScriptToEvaluateOnNewDocument", {
      source:
        "localStorage.setItem('kampus_access_token','fixture');localStorage.setItem('kampus_refresh_token','fixture');localStorage.setItem('kampus_user',JSON.stringify({id:'me',role:'STUDENT',profileStatus:'COMPLETED',fullName:'Test student',hasPassword:true}));",
    });
    await call("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1050,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await call("Page.navigate", {
      url: origin + "/roommates?connectionId=amara",
    });
    await until("document.querySelectorAll('.roommate-message').length===5");
    await ev(
      "document.querySelector('.roommate-inbox').scrollIntoView({block:'center'})",
    );
    await shot("chat-desktop-light");
    await ev("document.documentElement.classList.add('dark')");
    await shot("chat-desktop-dark");
    await ev("document.documentElement.classList.remove('dark')");
    await field(".roommate-chat-composer textarea", "My draft for Amara");
    await click("Open conversation with David Bello");
    await until("document.body.textContent.includes('No messages yet.')");
    assert.equal(
      await ev(
        "document.querySelector('.roommate-chat-composer textarea').value",
      ),
      "",
      "draft must not leak to another person",
    );
    await click("Talk budget");
    assert.equal(
      await ev(
        "document.querySelector('.roommate-chat-composer textarea').value",
      ),
      "What yearly rent budget works for you?",
    );
    assert.equal(sent, 0, "starter must not send without user action");
    await click("Open conversation with Amara Okafor");
    await until("document.querySelectorAll('.roommate-message').length===5");
    assert.equal(
      await ev(
        "document.querySelector('.roommate-chat-composer textarea').value",
      ),
      "My draft for Amara",
    );
    failSend = true;
    await click("Send message");
    await until(
      "document.querySelector('.roommate-conversation [role=alert]')?.textContent.includes('Connection interrupted')",
    );
    assert.equal(
      await ev(
        "document.querySelector('.roommate-chat-composer textarea').value",
      ),
      "My draft for Amara",
    );
    assert.equal(messages.amara.length, 5);
    failSend = false;
    await click("Send message");
    await until("document.querySelectorAll('.roommate-message').length===6");
    assert.equal(
      await ev(
        "document.querySelector('.roommate-chat-composer textarea').value",
      ),
      "",
    );
    await field(".roommate-chat-composer textarea", "A second message");
    await ev(
      "document.querySelector('.roommate-chat-composer').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));document.querySelector('.roommate-chat-composer').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))",
    );
    await until("document.querySelectorAll('.roommate-message').length===7");
    assert.equal(sent, 3, "double submit must send once");
    await click("Open conversation with Zainab Yusuf");
    await until(
      "document.querySelector('.roommate-chat-request-state')?.textContent.includes('Say hello')",
    );
    assert(
      !(await ev(
        "!!document.querySelector('.roommate-chat-composer textarea')",
      )),
      "pending cannot chat",
    );
    await shot("chat-request-desktop");
    await click("Accept introduction");
    await until("!!document.querySelector('.roommate-chat-composer textarea')");
    await click("Open conversation with Grace Eze");
    await until(
      "document.querySelector('.roommate-chat-readonly')?.textContent.includes('read-only')",
    );
    assert(
      !(await ev(
        "!!document.querySelector('.roommate-chat-composer textarea')",
      )),
      "closed cannot chat",
    );
    await click("Open conversation with Amara Okafor");
    await until("document.querySelectorAll('.roommate-message').length===7");
    await click("Close conversation");
    await until("!!document.querySelector('[role=dialog]')");
    await shot("chat-close-dialog");
    await click("Keep chatting");
    await field(".roommate-inbox-search input", "David");
    assert.equal(
      await ev("document.querySelectorAll('.roommate-inbox-person').length"),
      1,
    );
    await click("Clear conversation search");
    await call("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await ev(
      "document.querySelector('.roommate-inbox').scrollIntoView({block:'start'})",
    );
    await shot("chat-mobile-light");
    assert(
      await ev(
        "(()=>{const r=document.querySelector('.roommate-chat-send').getBoundingClientRect();return r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth})()",
      ),
      "mobile composer must be visible",
    );
    await click("Back to conversations");
    assert.equal(
      await ev(
        "getComputedStyle(document.querySelector('.roommate-inbox-sidebar')).display",
      ),
      "flex",
    );
    await shot("chat-mobile-inbox");
    await click("Open conversation with Amara Okafor");
    await call("Emulation.setDeviceMetricsOverride", {
      width: 320,
      height: 568,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await ev(
      "document.documentElement.classList.add('dark');document.querySelector('.roommate-inbox').scrollIntoView({block:'start'})",
    );
    await shot("chat-small-dark");
    await field(".roommate-chat-composer textarea", "A".repeat(1000));
    await shot("chat-long-draft-small");
    await click("Send message");
    await until("document.querySelectorAll('.roommate-message').length===8");
    await shot("chat-long-message-small");
    await ev("(()=>{const e=document.querySelector('.roommate-message-scroll');e.scrollTop=0;e.dispatchEvent(new Event('scroll'))})()");
    messages.amara.push({ id: 'incoming-update', mine: false, body: 'Let’s shortlist a few rooms tomorrow.', createdAt: new Date().toISOString() });
    await ev("window.dispatchEvent(new Event('focus'))");
    await until("document.querySelectorAll('.roommate-message').length===9");
    assert(await ev("document.querySelector('.roommate-message-scroll').scrollTop<5"), 'incoming messages must not interrupt reading earlier messages');
    assert(await ev("document.querySelector('[aria-label=\"Open conversation with Amara Okafor\"] .roommate-inbox-preview').textContent.includes('shortlist')"), 'latest incoming reply updates preview');
    await click('Latest messages');
    failLoad = true;
    await ev("window.dispatchEvent(new Event('focus'))");
    await until("document.querySelector('.roommate-conversation [role=alert]')?.textContent.includes('Connection interrupted')");
    assert.equal(await ev("document.querySelectorAll('.roommate-message').length"), 9, 'refresh failure keeps existing messages');
    await click("Back to conversations");
    await click("Open conversation with David Bello");
    await until(
      "document.querySelector('.roommate-conversation [role=alert]')?.textContent.includes('Connection interrupted')",
    );
    failLoad = false;
    await click("Retry messages");
    await until("document.body.textContent.includes('No messages yet.')");
    await click("Close conversation");
    await until("!!document.querySelector('[role=dialog]')");
    await ev(
      "[...document.querySelectorAll('[role=dialog] button')].find(e=>e.textContent==='Close conversation').click()",
    );
    await until(
      "!document.querySelector('[role=dialog]')&&document.querySelector('.roommate-chat-readonly')?.textContent.includes('read-only')",
    );
    await click("Back to conversations");
    await click("Open conversation with Tobi Adeyemi");
    await click("Withdraw introduction");
    await until(
      "document.querySelector('.roommate-chat-readonly')?.textContent.includes('read-only')",
    );
    emptyInbox = true;
    await call("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1050,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await call("Page.reload");
    await until(
      "!!document.querySelector('.roommate-chat-welcome') && document.body.textContent.includes('Your people are out there.')",
    );
    await ev(
      "document.querySelector('.roommate-inbox').scrollIntoView({block:'center'})",
    );
    await shot("chat-empty-desktop");
    assert.deepEqual(errors, []);
    console.log(
      "PASS: desktop/mobile/light/dark inbox, deep links, drafts, starters, send recovery, duplicate prevention, acceptance, closure, withdrawal, search, long text and retry.",
    );
    console.log(out);
  } finally {
    if (socket) {
      await call("Browser.close").catch(() => {});
      socket.close();
    } else browser.kill();
  }
})().catch((e) => {
  console.error(e.message);
  console.error(errors);
  process.exitCode = 1;
});
