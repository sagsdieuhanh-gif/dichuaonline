/* Two audiences, one temple. No demo users. Never treat TikTok gifts as wallet coins. */
export function createHybrid({viewers,seat,broadcast,log}){
 const pending=new Map(),approved=new Set(),seen=new Map();
 const url=(process.env.TEMPLE_DB_URL||'').replace(/\/$/,'');
 const key=process.env.TEMPLE_DB_SECRET||'';
 const dbEnabled=Boolean(url&&key);
 const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
 async function request(path,options={}){
   if(!dbEnabled)return null;
   const response=await fetch(url+'/rest/v1/'+path,{...options,headers:{...headers,...options.headers},signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw Error('temple DB HTTP '+response.status+': '+(await response.text()).slice(0,180));
   const txt=await response.text();return txt?JSON.parse(txt):null;
 }
 const record=(id,name,avatar='')=>{
   const guest={id:String(id).slice(0,96),name:String(name||id).slice(0,60),avatar:String(avatar||'').slice(0,500),lastAt:Date.now()};
   seen.set(guest.id,guest);return guest;
 };
 function remove(id){if(viewers.has(id)){viewers.delete(id);broadcast({t:'leave',id});}}
 function gateChat(id,name,comment,avatar){
   if(!id||String(id).startsWith('sim_'))return false;
   const guest=record(id,name,avatar);
   if(approved.has(guest.id))return true;
   // Both colleagues and TikTok guests use the same comment-only invitation.
   // Accent-insensitive: "xin vô", "xin vào", "xin vào chùa", "xin vo", etc.
   const words=String(comment||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z\s]/g,' ').replace(/\s+/g,' ').trim();
   if(/\bxin\s+(?:vo|vao)(?:\s+(?:chua|chanh\s+dien))?\b/u.test(words)){
     const entry={...guest,comment:String(comment).slice(0,240)};
     if(!pending.has(guest.id))broadcast({t:'guest_request',guest:entry},'control');
     pending.set(guest.id,entry);log('TikTok xin vào chùa: '+entry.name);
     if(dbEnabled)(async()=>{
       const path='temple_tiktok_requests?tiktok_id=eq.'+encodeURIComponent(guest.id);
       const existing=await request(path+'&select=tiktok_id');
       const data={display_name:entry.name,last_comment:entry.comment,avatar_url:entry.avatar,updated_at:new Date().toISOString()};
       if(existing?.length)await request(path,{method:'PATCH',body:JSON.stringify(data)});
       else await request('temple_tiktok_requests',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({...data,tiktok_id:guest.id,status:'pending'})});
     })().catch(e=>log('Không lưu được yêu cầu TikTok: '+e.message));
   }
   return false;
 }
 function giftForGuest(id,name,giftName,count,diamonds,avatar){
   if(!id||String(id).startsWith('sim_'))return true;
   const guest=record(id,name,avatar);
   if(approved.has(guest.id))return false;
   const points=Math.max(1,(Number(diamonds)||1)*(Number(count)||1));
   broadcast({t:'gift',id,name:String(name).slice(0,40),giftName,count,giftValue:points,liveTotal:points,tier:points>=99?3:points>=10?2:1,prayer:'Cảm ơn đã ủng hộ buổi LIVE'});
   return true;
 }
 function localDecide(id,allow,group='tiktok'){
   if(dbEnabled){log('Cần duyệt TikTok trong trang quản trị nội bộ đã đăng nhập.');return;}
   const g=pending.get(id);if(!g)return;
   if(allow){
     if(viewers.size>=100){log('Đã đủ 100 vị trí.');return;}
     approved.add(id);const admission=seat(id,g.name,{avatar:g.avatar}); if(admission.v){admission.v.group=group==='internal'?'internal':'tiktok'; broadcast({t:'admission_group',id,group:admission.v.group},'control');}
   } else {approved.delete(id);remove(id);}
   pending.delete(id);broadcast({t:'guest_decision',id,allowed:allow},'control');
   log((allow?'Trụ trì đã duyệt: ':'Trụ trì đã từ chối: ')+g.name);
 }
 async function sync(){
   if(!dbEnabled)return;
   try{
     const [online,members,guests]=await Promise.all([
       request('temple_room_presence?select=user_id,seat_no&lease_until=gt.'+encodeURIComponent(new Date().toISOString())),
       request('temple_members?select=user_id,display_name,avatar&active=eq.true'),
       request('temple_tiktok_requests?select=tiktok_id,display_name,status,seat_no&status=eq.approved')
     ]);
     const names=new Map((members||[]).map(m=>[m.user_id,m])),expected=new Set();
     for(const p of online||[]){const m=names.get(p.user_id);if(!m)continue;
       const id='internal:'+p.user_id;expected.add(id);
       if(!viewers.has(id))seat(id,m.display_name,{skin:m.avatar==='woman'?'woman':'man'});
     }
     for(const id of viewers.keys())if(id.startsWith('internal:')&&!expected.has(id))remove(id);
     approved.clear();for(const g of guests||[])approved.add(g.tiktok_id);
     for(const [id,g] of seen)if(approved.has(id)&&Date.now()-g.lastAt<300000&&!viewers.has(id))seat(id,g.name,{avatar:g.avatar});
     for(const id of viewers.keys())if(!id.startsWith('internal:')&&!approved.has(id))remove(id);
   }catch(e){log('Lỗi đồng bộ phòng nội bộ: '+e.message);}
 }
 if(dbEnabled){setInterval(sync,6500);setTimeout(sync,1200);}
 return {pending,approved,dbEnabled,gateChat,giftForGuest,localDecide};
}
