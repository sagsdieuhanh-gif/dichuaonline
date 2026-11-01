/* Shared moderated chat room for approved web and TikTok participants.
   Ephemeral RAM only; never logs private payment data or converts gifts to coins.
   The LIVE host is the single authority. Public API returns no user IDs. */
export function createTempleChat({isApproved,broadcast,limit=80,clock=()=>Date.now()}){
 if(typeof isApproved!=='function'||typeof broadcast!=='function')throw Error('missing chat dependencies');
 const messages=[], muted=new Set(),recent=new Map();
 let seq=0,revision=0;
 const sanitize=t=>String(t??'').replace(/[\u0000-\u001f\u007f-\u009f<>]/g,'').trim().slice(0,160);
 const publicMessage=m=>({seq:m.seq,name:m.name,text:m.text,group:m.group,source:m.source,at:m.at});
 function list(){return {messages:messages.map(publicMessage),revision,capacity:limit}}
 function forAdmin(){return {messages:messages.map(x=>({...publicMessage(x),userId:x.userId})),revision,muted:[...muted]}}
 function post({id,name,group='tiktok',source='web',text}){
  id=String(id||'');if(!id||!isApproved(id))return {ok:false,reason:'not-approved'};
  if(muted.has(id))return {ok:false,reason:'muted'};
  const safe=sanitize(text);if(!safe)return {ok:false,reason:'empty'};
  const now=clock(),cooldown=source==='tiktok'?1600:3500;
  if(now-(recent.get(id)??-Infinity)<cooldown)return {ok:false,reason:'rate-limit'};
  recent.set(id,now);
  const m={seq:++seq,userId:id,name:sanitize(name).slice(0,35)||'Phật tử',text:safe,group:group==='internal'?'internal':'tiktok',source:source==='tiktok'?'tiktok':'web',at:new Date(now).toISOString()};
  messages.push(m);if(messages.length>limit)messages.shift();
  revision++;
  broadcast({t:'chat',id,name:m.name,text:m.text}); // retain the existing on-screen speech bubble
  broadcast({t:'room_chat',message:{...publicMessage(m),userId:m.userId},revision},'control');
  return {ok:true,message:publicMessage(m)};
 }
 function remove(messageSeq){
  const i=messages.findIndex(m=>m.seq===Number(messageSeq));
  if(i<0)return false;
  messages.splice(i,1);revision++;broadcast({t:'chat_removed',seq:Number(messageSeq),revision},'control');return true;
 }
 function mute(userId,value=true){
  const id=String(userId||'');if(!id)return false;
  if(value)muted.add(id);else muted.delete(id);
  revision++;broadcast({t:'chat_mute',id,muted:value,revision},'control');return true;
 }
 function clear(){messages.splice(0,messages.length);revision++;broadcast({t:'chat_cleared',revision},'control')}
 return {post,list,forAdmin,remove,mute,clear,isMuted:id=>muted.has(id)};
}
