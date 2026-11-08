// Browser regression using fixture accounts and mocked APIs only.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawn}=require('node:child_process');
const out=path.join(os.tmpdir(),'kampus-roommate-check');fs.mkdirSync(out,{recursive:true});
const browser=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=9351','--user-data-dir='+path.join(out,'profile-'+Date.now()),'about:blank'],{windowsHide:true,stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));let socket,id=0;
const pending=new Map(),errors=[],writes=[];
const sample={id:'other-post',studentId:'other-student',name:'QA Student',university:'FUTMINNA',campus:'FUTMINNA',area:'gidankwano',housingIntent:'SEARCH_TOGETHER',annualShare:120000,budgetMax:10000,bio:'Looking near Gidankwano.',department:'Engineering',level:'200',sleepSchedule:'',cleanliness:'',cookingHabits:''};
let mine={...sample,id:'my-post',studentId:'mine',name:'Me',isActive:false,annualShare:null,budgetMax:15000};
const requests=[{id:'incoming',listingId:'my-post',direction:'RECEIVED',status:'PENDING',otherName:'Interested student',message:'Could we discuss sharing?',listingActive:true}];
const messages=[];
function call(method,params={}){const n=++id;return new Promise((resolve,reject)=>{pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));setTimeout(()=>{if(pending.delete(n))reject(Error('Timeout '+method));},30000).unref();});}
async function ev(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function until(expr){for(let i=0;i<150;i++){if(await ev(expr))return;await delay(150)}throw Error('Not ready '+expr+'; page='+await ev('document.body?.innerText?.slice(0,1600)'));}
async function click(text,scope=''){await ev(`(()=>{const el=[...document.querySelectorAll(${JSON.stringify(scope+' button')})].find(e=>e.textContent.trim()===${JSON.stringify(text)});if(!el||el.disabled)throw Error('Unavailable '+${JSON.stringify(text)});el.click()})()`);await delay(150);}
async function field(label,value,scope=''){await ev(`(()=>{const label=[...document.querySelectorAll(${JSON.stringify(scope+' label')})].find(e=>e.textContent.includes(${JSON.stringify(label)}));const e=label?.querySelector('input,textarea,select');if(!e)throw Error('Missing field');const proto=e.tagName==='SELECT'?HTMLSelectElement.prototype:e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);}
async function mock(p){const u=new URL(p.request.url),route=u.pathname.replace('/api',''),body=JSON.parse(p.request.postData||'{}');let data={},status=200;
 if(p.request.method==='OPTIONS'){}
 else if(route==='/auth/me')data={id:'me',role:'STUDENT',fullName:'Me',phone:'+2348010000000',email:'ui@example.invalid',profileStatus:'COMPLETED',hasPassword:true,student:{department:'Engineering'}};
 else if(route==='/roommates'&&p.request.method==='GET')data={items:[sample,{...sample,id:'legacy',name:'Monthly student',annualShare:null,budgetMax:15000}],pagination:{total:2,totalPages:1}};
 else if(route==='/roommates/me'){
   if(p.request.method==='PUT'){writes.push(body);mine={...mine,...body,isActive:true};}
   if(p.request.method==='DELETE')mine.isActive=false;
   data=mine;
 }else if(route==='/roommates/connections')data=requests;
 else if(route.endsWith('/connect')){requests.push({id:'sent',listingId:'other-post',direction:'SENT',otherName:sample.name,status:'PENDING',message:body.message,listingActive:true});data={id:'sent',status:'PENDING'};}
 else if(route==='/roommates/connections/incoming'&&p.request.method==='PUT'){requests[0].status=body.status;data=requests[0];}
 else if(route==='/roommates/connections/incoming/messages'){if(p.request.method==='POST')messages.push({id:'m'+messages.length,body:body.body,mine:true,createdAt:new Date().toISOString()});data=p.request.method==='POST'?messages.at(-1):messages;}
 else if(route==='/auth/registration-status')data={emailVerificationAvailable:false,verificationMethod:'email'};
 else data={items:[],pagination:{total:0,totalPages:1}};
 await call('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:'http://localhost:3000'},{name:'Access-Control-Allow-Headers',value:'*'},{name:'Access-Control-Allow-Methods',value:'GET,PUT,POST,DELETE,OPTIONS'}],body:Buffer.from(JSON.stringify({success:true,statusCode:status,data})).toString('base64')});
}
(async()=>{try{
 let tab;for(let i=0;i<80;i++){try{tab=await(await fetch('http://127.0.0.1:9351/json/new?about:blank',{method:'PUT'})).json();break}catch{await delay(150)}}
 if(!tab)throw Error('Browser unavailable');
 socket=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j});
 socket.onmessage=e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result)}else if(m.method==='Fetch.requestPaused')void mock(m.params).catch(e=>errors.push(e.message));else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text)};
 await call('Page.enable');await call('Runtime.enable');await call('Fetch.enable',{patterns:[{urlPattern:'https://kampus-backend.vercel.app/*'}]});
 await call('Page.addScriptToEvaluateOnNewDocument',{source:"localStorage.setItem('kampus_access_token','test-fixture');localStorage.setItem('kampus_refresh_token','test-fixture');localStorage.setItem('kampus_user',JSON.stringify({id:'me',role:'STUDENT',profileStatus:'COMPLETED',hasPassword:true,fullName:'Me',student:{department:'Engineering'}}));"});
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await call('Page.navigate',{url:'http://localhost:3000/roommates'});
 await until("!!document.body");
 await until("document.body.textContent.includes('Your post is paused')&&document.body.textContent.includes('Monthly student')");
 assert(await ev("document.documentElement.scrollWidth<=innerWidth"),'Mobile overflow');
 assert(await ev("document.body.textContent.includes('/ year')&&document.body.textContent.includes('/ month')"),'Budget periods are explicit');
 await click('Edit my post');await until("!!document.querySelector('[role=dialog] select')");
 await field('What’s your situation?','HAS_ROOM','[role=dialog]');await field('Where is the room?','bosso_front','[role=dialog]');
 await field('Roommate’s yearly rent share','160000','[role=dialog]');await click('Publish again','[role=dialog]');
 await until("!document.querySelector('[role=dialog]')&&document.body.textContent.includes('Your post is visible')");
 assert.equal(writes[0].annualShare,160000);assert.equal(writes[0].area,'bosso_front');assert(!('budgetMax' in writes[0]));
 await click('Introduce myself');await field('Private introduction','Can we talk about the room?','[role=dialog]');await click('Send introduction','[role=dialog]');
 await until("document.body.textContent.includes('View your introduction in My requests.')");
 await click('My requests · New');await until("document.body.textContent.includes('Could we discuss sharing?')");
 await click('Accept introduction');await until("document.body.textContent.includes('Accepted')");
 await click('View conversation');await until("document.body.textContent.includes('No messages yet.')");
 await field('Message','Let’s compare our move-in plans.');await click('Send message');
 await until("document.body.textContent.includes('You')&&document.body.textContent.includes('Let’s compare our move-in plans.')");
 const screenshot=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,'requests-mobile.png'),Buffer.from(screenshot.data,'base64'));
 await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await click('Browse posts');await until("document.body.textContent.includes('Monthly student')");
 assert(await ev("document.documentElement.scrollWidth<=innerWidth"));
 const desktop=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,'browse-desktop.png'),Buffer.from(desktop.data,'base64'));
 assert.deepEqual(errors,[]);console.log('Mobile/desktop, pause state, explicit periods, edit/republish, introduction, acceptance and private conversation: PASS');
 console.log(out);
}finally{if(socket){await call('Browser.close').catch(()=>{});socket.close()}else browser.kill()}})().catch(e=>{console.error(e.message);console.error(errors);process.exitCode=1});
