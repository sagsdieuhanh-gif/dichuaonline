/* Guest web entrance for the LIVE-hosted Chanh Dien, no visitor signup.
   Separate listener from the admin/overlay server. Publish ONLY this port through an HTTPS tunnel.
   Presence is ephemeral by design; the live host remains the authoritative moderator. */
import http from 'node:http';
import {randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const MAX_BODY=2048;
const LIMIT_PENDING=300;
const cleanName=s=>String(s||'').trim().replace(/\s+/g,' ').replace(/[<>\u0000-\u001f]/g,'').slice(0,30);
const hasComment=s=>String(s??'').trim().length>0;
function cookies(header){return Object.fromEntries(String(header||'').split(';').map(k=>k.trim().split('=')).filter(a=>a.length===2));}
function json(res,status,data,extra={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra});res.end(JSON.stringify(data));}
function getBody(req){return new Promise((resolve,reject)=>{let body='';req.on('data',part=>{body+=part;if(body.length>MAX_BODY){reject(Error('too-large'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(body||'{}'))}catch{reject(Error('invalid-json'))}});req.on('error',reject);});}

export function createGuestGateway({hybrid,viewers,broadcast,log=()=>{},port=3001,host='127.0.0.1'}){
 if(!hybrid||!viewers||!broadcast)throw Error('Missing shared LIVE state');
 const sessions=new Map();
 const allowedPath=new Set(['/','/visit','/api/me','/api/join','/api/ping','/api/message','/api/leave','/api/hall','/visit.js','/assets/hall.jpg','/assets/c_man.png','/assets/c_woman.png']);
 const sweep=setInterval(()=>{
  const now=Date.now();
  for(const [token,s] of sessions){
   if(hybrid.approved.has(s.id)&&s.lastPing&&now-s.lastPing>100000){
    hybrid.approved.delete(s.id);
    if(viewers.delete(s.id))broadcast({t:'leave',id:s.id});
    s.left=true;
   }
   if(now-s.lastSeen>6*3600000&&!viewers.has(s.id))sessions.delete(token);
  }
 },15000);sweep.unref?.();
 const server=http.createServer(async(req,res)=>{
  const pathname=new URL(req.url||'/', 'http://local').pathname;
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'");
  if(!allowedPath.has(pathname)){json(res,404,{error:'not-found'});return}
  if(!['GET','POST'].includes(req.method)){json(res,405,{error:'method'});return}
  if(req.method==='POST'){
   // Same-origin checks prevent random websites from submitting requests with visitors' cookies.
   const origin=req.headers.origin;
   const hostHeader=req.headers.host;
   let validOrigin=false;try{validOrigin=!!origin&&!!hostHeader&&new URL(origin).host===hostHeader}catch{}
   if(!validOrigin){
    json(res,403,{error:'origin-mismatch'});return;
   }
   if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||'')){json(res,415,{error:'json-required'});return}
  }
  if(pathname==='/visit.js'){
   if(req.method!=='GET'){json(res,405,{error:'method'});return}
   const code=await readFile(path.join(HERE,'visit.js'));res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store'});res.end(code);return;
  }
  if(pathname==='/'||pathname==='/visit'){
   if(req.method!=='GET'){json(res,405,{error:'method'});return}
   const html=await readFile(path.join(HERE,'visit.html'));
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html);return;
  }
  if(pathname.startsWith('/assets/')){
   if(req.method!=='GET'){json(res,405,{error:'method'});return}
   const ext=path.extname(pathname);const body=await readFile(path.join(HERE,'..',pathname.slice(1))).catch(()=>null);
   if(!body){json(res,404,{error:'missing-image'});return}
   res.writeHead(200,{'Content-Type':ext==='.jpg'?'image/jpeg':'image/png','Cache-Control':'public,max-age=3600'});res.end(body);return;
  }
  // Hall roster is public and read-only; it must NOT create/overwrite the visitor cookie.
  // The page can request /api/me and /api/hall concurrently on first load.

  let token=cookies(req.headers.cookie).temple_guest;
  let session=token&&/^[a-f0-9]{48}$/.test(token)?sessions.get(token):null;
  if(!session){
   token=randomBytes(24).toString('hex');
   session={id:'web:'+token,name:'',lastSeen:Date.now(),lastPing:0,lastJoin:0,left:false};
   sessions.set(token,session);
   // HttpOnly opaque identity; a browser session is NOT proof of employment.
   const secure=req.socket.encrypted||req.headers['x-forwarded-proto']==='https';
   res.setHeader('Set-Cookie',`temple_guest=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=43200${secure?'; Secure':''}`);
  }
  session.lastSeen=Date.now();
  const id=session.id;
  function state(){
   const seated=viewers.has(id)&&hybrid.approved.has(id);
   return {name:session.name,status:seated?'approved':hybrid.pending.has(id)?'pending':session.lastJoin?(session.left?'left':'not-approved'):'new',seatCount:viewers.size,capacity:100,group:viewers.get(id)?.group||null};
  }
  if(pathname==='/api/me'){if(hybrid.approved.has(id)&&viewers.has(id))session.lastPing=Date.now();json(res,200,state());return}
  if(pathname==='/api/hall'){
   const people=[...viewers.values()].slice(0,100).map(v=>({name:v.name,group:v.group==='internal'?'internal':'tiktok',skin:v.skin==='woman'?'woman':'man'}));
   json(res,200,{people,count:people.length,capacity:100});return;
  }
  if(req.method!=='POST'){json(res,405,{error:'method'});return}
  let data;try{data=await getBody(req)}catch{json(res,400,{error:'invalid-body'});return}
  if(pathname==='/api/join'){
   const name=cleanName(data.name);
   if(name.length<2||!hasComment(data.comment)){json(res,400,{error:'Nhập tên và một bình luận có nội dung bất kỳ'});return}
   if(session.lastJoin && Date.now()-session.lastJoin<10000){json(res,429,{error:'Xin chờ trước khi gửi lại'});return}
   if(hybrid.pending.size>=LIMIT_PENDING&&!hybrid.pending.has(id)){json(res,429,{error:'Hàng chờ hiện đã đầy'});return}
   session.lastJoin=Date.now();session.lastPing=Date.now();session.left=false;session.name=name;
   hybrid.gateChat(id,name,String(data.comment).trim().slice(0,240),'');
   json(res,200,state());return;
  }
  if(pathname==='/api/ping'){
   if(hybrid.approved.has(id)&&viewers.has(id)){session.lastPing=Date.now();viewers.get(id).lastAt=Date.now()}
   json(res,200,state());return;
  }
  if(pathname==='/api/message'){
   const message=String(data.text||'').trim().replace(/[<>\u0000-\u001f]/g,'').slice(0,110);
   if(!viewers.has(id)||!hybrid.approved.has(id)){json(res,403,{error:'Chưa được duyệt'});return}
   if(message.length<2){json(res,400,{error:'Nội dung quá ngắn'});return}
   if(session.lastMessage&&Date.now()-session.lastMessage<4000){json(res,429,{error:'Gửi quá nhanh'});return}
   session.lastMessage=Date.now();session.lastPing=Date.now();
   broadcast({t:'chat',id,name:session.name,text:message});
   json(res,200,{sent:true});return;
  }
  if(pathname==='/api/leave'){
   hybrid.approved.delete(id);hybrid.pending.delete(id);session.left=true;
   if(viewers.delete(id))broadcast({t:'leave',id});
   json(res,200,state());return;
  }
  json(res,404,{error:'not-found'});
 });
 server.on('close',()=>clearInterval(sweep));
 return {server,sessions,start(){return new Promise(resolve=>server.listen(port,host,()=>{log('Cổng tham gia web: http://'+host+':'+port+' (chỉ công khai cổng này qua HTTPS tunnel)');resolve(server)}))}};
}
