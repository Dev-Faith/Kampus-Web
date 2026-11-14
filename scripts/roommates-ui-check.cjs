// Browser regression using fixture accounts and mocked APIs only.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawn}=require('node:child_process');
const origin=process.env.KAMPUS_UI_BASE_URL||'http://localhost:3100';
const out=path.join(os.tmpdir(),'kampus-roommate-check');fs.mkdirSync(out,{recursive:true});
const browser=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=9351','--user-data-dir='+path.join(out,'profile-'+Date.now()),'about:blank'],{windowsHide:true,stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));let socket,id=0;
const pending=new Map(),errors=[],writes=[];
const sample={id:'other-post',studentId:'other-student',name:'QA Student',university:'FUTMINNA',campus:'FUTMINNA',area:'gidankwano',housingIntent:'SEARCH_TOGETHER',annualShare:120000,budgetMax:10000,bio:'Looking near Gidankwano.',department:'Engineering',level:'200',sleepSchedule:'',cleanliness:'',cookingHabits:''};
let failSave=false;
let mine={...sample,id:'my-post',studentId:'mine',name:'Me',isActive:false,annualShare:null,budgetMax:15000};
const requests=[{id:'incoming',listingId:'my-post',direction:'RECEIVED',status:'PENDING',otherName:'Interested student',message:'Could we discuss sharing?',listingActive:true}];
const messages=[];
function call(method,params={}){const n=++id;return new Promise((resolve,reject)=>{pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));setTimeout(()=>{if(pending.delete(n))reject(Error('Timeout '+method));},30000).unref();});}
async function ev(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function until(expr){for(let i=0;i<400;i++){if(await ev(expr))return;await delay(150)}throw Error('Not ready '+expr+'; page='+await ev('document.body?.innerText?.slice(0,1600)'));}
async function click(text,scope=''){await until("[...document.querySelectorAll("+JSON.stringify(scope+' button')+")].some(e=>e.textContent.trim()==="+JSON.stringify(text)+"&&!e.disabled)");await ev(`(()=>{const el=[...document.querySelectorAll(${JSON.stringify(scope+' button')})].find(e=>e.textContent.trim()===${JSON.stringify(text)});if(!el||el.disabled)throw Error('Unavailable '+${JSON.stringify(text)});el.click()})()`);await delay(150);}
async function field(label,value,scope=''){await ev(`(()=>{const label=[...document.querySelectorAll(${JSON.stringify(scope+' label')})].find(e=>e.textContent.includes(${JSON.stringify(label)}));const e=label?.querySelector('input,textarea,select');if(!e)throw Error('Missing field');const proto=e.tagName==='SELECT'?HTMLSelectElement.prototype:e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);}
async function shot(name){await delay(200);assert(await ev('document.documentElement.scrollWidth<=innerWidth'),'Page overflow: '+name);if(await ev("!!document.querySelector('[role=dialog]')")){assert(await ev("(()=>{const d=document.querySelector('[role=dialog]'),r=d.getBoundingClientRect(),f=d.querySelector('footer').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1&&f.bottom<=innerHeight+1&&d.scrollWidth<=d.clientWidth+1})()"),'Dialog or actions clipped: '+name);}const image=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(image.data,'base64'));}
async function mock(p){const u=new URL(p.request.url),route=u.pathname.replace('/api',''),body=JSON.parse(p.request.postData||'{}');let data={},status=200;
 if(p.request.method==='OPTIONS'){}
 else if(route==='/auth/me')data={id:'me',role:'STUDENT',fullName:'Me',phone:'+2348010000000',email:'ui@example.invalid',profileStatus:'COMPLETED',hasPassword:true,student:{department:'Engineering'}};
 else if(route==='/roommates'&&p.request.method==='GET')data={items:[sample,{...sample,id:'legacy',name:'Monthly student',annualShare:null,budgetMax:15000}],pagination:{total:2,totalPages:1}};
 else if(route==='/roommates/me'){
   if(p.request.method==='PUT'){if(failSave)status=503;else {writes.push(body);mine={...mine,...body,isActive:true};}}
   if(p.request.method==='DELETE')mine.isActive=false;
   data=mine;
 }else if(route==='/roommates/connections')data=requests;
 else if(route.endsWith('/connect')){requests.push({id:'sent',listingId:'other-post',direction:'SENT',otherName:sample.name,status:'PENDING',message:body.message,listingActive:true});data={id:'sent',status:'PENDING'};}
 else if(route==='/roommates/connections/incoming'&&p.request.method==='PUT'){requests[0].status=body.status;data=requests[0];}
 else if(route==='/roommates/connections/incoming/messages'){if(p.request.method==='POST')messages.push({id:'m'+messages.length,body:body.body,mine:true,createdAt:new Date().toISOString()});data=p.request.method==='POST'?messages.at(-1):messages;}
 else if(route==='/auth/registration-status')data={emailVerificationAvailable:false,verificationMethod:'email'};
 else data={items:[],pagination:{total:0,totalPages:1}};
 await call('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:origin},{name:'Access-Control-Allow-Headers',value:'*'},{name:'Access-Control-Allow-Methods',value:'GET,PUT,POST,DELETE,OPTIONS'}],body:Buffer.from(JSON.stringify({success:status<400,statusCode:status,data,message:status===503?'Your post could not be saved. Please retry.':undefined})).toString('base64')});
}
(async()=>{try{
 let tab;for(let i=0;i<80;i++){try{tab=await(await fetch('http://127.0.0.1:9351/json/new?about:blank',{method:'PUT'})).json();break}catch{await delay(150)}}
 if(!tab)throw Error('Browser unavailable');
 socket=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j});
 socket.onmessage=e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result)}else if(m.method==='Fetch.requestPaused')void mock(m.params).catch(e=>errors.push(e.message));else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text)};
 await call('Page.enable');await call('Runtime.enable');await call('Fetch.enable',{patterns:[{urlPattern:'https://kampus-backend.vercel.app/*'}]});
 await call('Page.addScriptToEvaluateOnNewDocument',{source:"localStorage.setItem('kampus_access_token','test-fixture');localStorage.setItem('kampus_refresh_token','test-fixture');localStorage.setItem('kampus_user',JSON.stringify({id:'me',role:'STUDENT',profileStatus:'COMPLETED',hasPassword:true,fullName:'Me',student:{department:'Engineering'}}));"});
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await call('Page.navigate',{url:origin+'/roommates'});
 await until("!!document.body");
 await until("document.body.textContent.includes('Your post is paused')&&document.body.textContent.includes('Monthly student')");
 assert(await ev("document.documentElement.scrollWidth<=innerWidth"),'Mobile overflow');
 assert(await ev("document.body.textContent.includes('/ year')&&document.body.textContent.includes('/ month')"),'Budget periods are explicit');
 await click('Edit my post');await until("!!document.querySelector('[role=dialog] input[type=radio]')");
 await shot('post-plan-mobile');
 await ev("document.querySelector('[role=dialog] input[value=HAS_ROOM]').click()");await click('Continue','[role=dialog]');
 await until("!!document.querySelector('[role=dialog] select')");await click('Continue','[role=dialog]');assert(!writes.length,'Invalid budget must not publish');
 await field('Where is the room?','bosso_front','[role=dialog]');await field('Roommate’s yearly rent share','160000','[role=dialog]');await shot('post-budget-mobile');
 await click('Back','[role=dialog]');assert(await ev("document.querySelector('[role=dialog] [value=HAS_ROOM]').checked"));await click('Continue','[role=dialog]');assert.equal(await ev("document.querySelector('[role=dialog] select').value"),'bosso_front');
 await click('Continue','[role=dialog]');await field('What should a roommate know?','I like a tidy home.','[role=dialog]');await shot('post-about-mobile');
 failSave=true;await click('Publish again','[role=dialog]');await until("document.querySelector('[role=dialog]')?.textContent.includes('Your post could not be saved')");assert.equal(await ev("document.querySelector('[role=dialog] textarea').value"),'I like a tidy home.');failSave=false;await click('Publish again','[role=dialog]');
 await until("!document.querySelector('[role=dialog]')&&document.body.textContent.includes('Your post is visible')");
 assert.equal(writes[0].annualShare,160000);assert.equal(writes[0].area,'bosso_front');assert(!('budgetMax' in writes[0]));
 await click('Introduce myself');await field('Your private introduction','Can we talk about the room?','[role=dialog]');await shot('introduction-mobile');await click('Send introduction','[role=dialog]');
 await until("document.body.textContent.includes('View your introduction in My requests.')");
 // Sending an introduction opens My requests automatically.
await until("document.body.textContent.includes('Could we discuss sharing?')");
 await click('Accept introduction');await until("document.body.textContent.includes('Accepted')");
 await click('View conversation');await until("document.body.textContent.includes('No messages yet.')");
 await field('Message','Let’s compare our move-in plans.');await click('Send message');
 await until("document.body.textContent.includes('You')&&document.body.textContent.includes('Let’s compare our move-in plans.')");
 const screenshot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,'requests-mobile.png'),Buffer.from(screenshot.data,'base64'));
 await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await click('Browse posts');await until("document.body.textContent.includes('Monthly student')");
 assert(await ev("document.documentElement.scrollWidth<=innerWidth"));
 const desktop=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,'browse-desktop.png'),Buffer.from(desktop.data,'base64'));
 await click('Edit my post');await until("!!document.querySelector('[role=dialog] input[type=radio]')");await shot('post-plan-desktop');
 await click('Continue','[role=dialog]');await shot('post-budget-desktop');await click('Continue','[role=dialog]');await shot('post-about-desktop');
 await ev("document.documentElement.classList.add('dark')");await shot('post-about-desktop-dark');
 await call('Emulation.setDeviceMetricsOverride',{width:320,height:568,deviceScaleFactor:1,mobile:true});await shot('post-small-mobile-dark');
 await ev("document.querySelector('[aria-label=\"Close form\"]').click()");await until("!document.querySelector('[role=dialog]')");
 await ev("document.documentElement.classList.remove('dark')");await click('Introduce myself');await until("!!document.querySelector('[role=dialog] textarea')");await shot('introduction-small-mobile');
 assert.deepEqual(errors,[]);console.log('Three-step forms, validation, back-navigation, failed-save recovery, small-screen/light/dark layouts, pause state, explicit periods, edit/republish, introduction, acceptance and private conversation: PASS');
 console.log(out);
}finally{if(socket){await call('Browser.close').catch(()=>{});socket.close()}else browser.kill()}})().catch(e=>{console.error(e.message);console.error(errors);process.exitCode=1});
