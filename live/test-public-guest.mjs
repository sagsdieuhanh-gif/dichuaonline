import assert from 'node:assert/strict';
import {createGuestGateway} from './public-guest.mjs';
import {createHybrid} from './temple-hybrid.mjs';
import {createTempleChat} from './temple-chat.mjs';
const viewers=new Map(),events=[];
function broadcast(event,only){events.push({event,only})}
function seat(id,name,opts={}){if(viewers.has(id))return {v:viewers.get(id),isNew:false};if(viewers.size>=100)return {v:null,isNew:false};
 const v={id,name,...opts};viewers.set(id,v);broadcast({t:'join',v});return {v,isNew:true};}
const hybrid=createHybrid({viewers,seat,broadcast,log:()=>{}});
const chat=createTempleChat({isApproved:id=>viewers.has(id)&&hybrid.approved.has(id),broadcast});
const gw=createGuestGateway({hybrid,viewers,chat,broadcast,port:0});
await gw.start();
const url='http://127.0.0.1:'+gw.server.address().port;
async function request(path,method='GET',payload,cookie,origin=url){
 const r=await fetch(url+path,{method,headers:{...(payload?{'content-type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...(method==='POST'?{Origin:origin}:{})},...(payload?{body:JSON.stringify(payload)}:{})});
 const data=path==='/visit'||path==='/'||path==='/visit.js'?await r.text():await r.json();
 return {status:r.status,data,cookie:r.headers.get('set-cookie')};
}
try{
 let first=await request('/api/me');
 assert.equal(first.status,200);assert.equal(first.data.status,'new');
 const cookie=first.cookie.split(';')[0];assert.match(cookie,/^temple_guest=[a-f0-9]{48}$/);
 const beforeHallSessions=gw.sessions.size;let rosterBefore=await request('/api/hall');assert.equal(rosterBefore.status,200);assert.equal(rosterBefore.cookie,null,'Public roster must not reset visitor identity');assert.equal(gw.sessions.size,beforeHallSessions);
 let page=await request('/');assert.equal(page.status,200);assert.match(page.data,/Không cần đăng ký/i);
 let script=await request('/visit.js');assert.equal(script.status,200);assert.match(script.data,/api\('/);
 let admin=await request('/live/control.html');assert.equal(admin.status,404);
 let otherChat=await request('/api/chat','GET',null,cookie);assert.equal(otherChat.status,403,'Not approved cannot read the chat');
 let denied=await request('/api/join','POST',{name:'An',comment:'xin vô'},cookie,'https://attacker.example');assert.equal(denied.status,403);
 let bad=await request('/api/join','POST',{name:'An',comment:'   '},cookie);assert.equal(bad.status,400);
 let sent=await request('/api/join','POST',{name:'Nhân viên An',comment:'Nam mô A Di Đà Phật'},cookie);
 assert.equal(sent.status,200);assert.equal(sent.data.status,'pending');assert.equal(viewers.size,0);
 assert.equal(hybrid.pending.size,1);const id=[...hybrid.pending.keys()][0];assert.ok(id.startsWith('web:'));assert.equal(hybrid.pending.get(id).comment,'Nam mô A Di Đà Phật');
 let before=await request('/api/me','GET',null,cookie);assert.equal(before.data.status,'pending');
 hybrid.localDecide(id,true,'internal');
 let approved=await request('/api/me','GET',null,cookie);assert.equal(approved.data.status,'approved');assert.equal(approved.data.group,'internal');
 assert.equal(viewers.get(id).group,'internal');assert.equal(viewers.size,1);
 let allowedChat=await request('/api/chat','GET',null,cookie);assert.equal(allowedChat.status,200);
 assert.equal(allowedChat.data.messages.length,0);
 
 let hall=await request('/api/hall');assert.equal(hall.data.count,1);assert.equal(hall.data.people[0].name,'Nhân viên An');
 let prayer=await request('/api/message','POST',{text:'Nam mô A Di Đà Phật'},cookie);assert.equal(prayer.status,200);assert.ok(events.some(x=>x.event.t==='chat'&&x.event.id===id));
 let messages=await request('/api/chat','GET',null,cookie);assert.equal(messages.status,200);assert.equal(messages.data.messages.length,1);
 assert.equal(messages.data.messages[0].text,'Nam mô A Di Đà Phật');assert.ok(!Object.hasOwn(messages.data.messages[0],'userId'));
 chat.mute(id,true);
 let block=await request('/api/message','POST',{text:'Trụ trì đang tắt chat'},cookie);assert.equal(block.status,403);
 let mutedRead=await request('/api/chat','GET',null,cookie);assert.equal(mutedRead.status,200);assert.equal(mutedRead.data.muted,true);
 chat.mute(id,false);assert.equal(chat.remove(messages.data.messages[0].seq),true);
 assert.equal((await request('/api/chat','GET',null,cookie)).data.messages.length,0);
 
 let outsider=await request('/api/me');const anotherCookie=outsider.cookie.split(';')[0];
 let banned=await request('/api/message','POST',{text:'fake'},anotherCookie);assert.equal(banned.status,403);
 let leave=await request('/api/leave','POST',{},cookie);assert.equal(leave.status,200);assert.equal(viewers.size,0);
 assert.equal(hybrid.approved.size,0);
 let stranger=await request('/api/me');let strangerCookie=stranger.cookie.split(';')[0];
 let arbitrary=await request('/api/join','POST',{name:'Mai',comment:'Chúc cả nhà bình an ❤️'},strangerCookie);
 assert.equal(arbitrary.status,200);assert.equal(arbitrary.data.status,'pending');assert.equal(viewers.size,0);
 console.log('PASS: web visitor no-signup join, isolated public server, admin approval, comment, status, no-control access, exit');
}finally{await new Promise(resolve=>gw.server.close(resolve))}
