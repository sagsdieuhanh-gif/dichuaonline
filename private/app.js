import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
const $=id=>document.getElementById(id), vis=(id,on)=>$(id).classList.toggle('hidden',!on);
const note=(id,msg,bad=false)=>{const e=$(id);e.textContent=msg;e.classList.toggle('bad',bad)};
const cfg=window.TEMPLE_CONFIG||{};
const good=/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cfg.supabaseUrl||'') && /^(sb_publishable_|eyJ)/.test(cfg.publishableKey||'');
if(!good){vis('configWarning',true);}else{
const db=createClient(cfg.supabaseUrl,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
let session=null,member=null,online=false,people=[],rituals=[],activeTimers=[],channel=null;
const canvas=$('scene'),g=canvas.getContext('2d');
const image={};for(const kind of ['man','woman']){image[kind]=new Image();image[kind].src='../assets/c_'+kind+'.png';image[kind].onload=draw;}
function seatPosition(n){const k=n-1,row=Math.floor(k/10),c=k%10,t=row/9;return {x:540+(c<5?-1:1)*(95+(c%5)*68+row*8),y:1175+row*65,s:.20+t*.30}}
function draw(){
 g.clearRect(0,0,1080,1920);
 for(const p of people){const seat=seatPosition(p.seat_no),pic=image[p.avatar]||image.man;if(!pic?.naturalWidth)continue;
 const w=pic.naturalWidth*seat.s,h=pic.naturalHeight*seat.s;
 g.drawImage(pic,seat.x-w/2,seat.y-h,w,h);
 const label=p.display_name||'Phật tử';
 g.font='600 '+Math.max(14,Math.round(16+seat.s*12))+'px system-ui';const tw=g.measureText(label).width+16;
 g.fillStyle=p.user_id===session?.user.id?'#8d3d27de':'#1b0d07db';
 g.beginPath();g.roundRect(seat.x-tw/2,seat.y-h-30,tw,25,10);g.fill();
 g.fillStyle='#fbe4ba';g.textAlign='center';g.textBaseline='middle';g.fillText(label,seat.x,seat.y-h-18);
 }
 $('count').textContent=people.length+' / 100 người';
}
async function query(table,columns,filter){let q=db.from(table).select(columns);if(filter)q=filter(q);const {data,error}=await q;if(error)throw error;return data||[]}
async function updateRoom(){
 const now=new Date().toISOString();
 const pres=await query('temple_room_presence','user_id,seat_no',q=>q.gt('lease_until',now));
 const guests=await query('temple_tiktok_requests','tiktok_id,display_name,status,seat_no',q=>q.eq('status','approved'));
 const all=await query('temple_members','user_id,display_name,avatar,active',q=>q.eq('active',true));
 const lookup=new Map(all.map(m=>[m.user_id,m]));
 people=pres.filter(x=>lookup.has(x.user_id)).map(x=>({...lookup.get(x.user_id),...x}));
 people.push(...guests.map(g=>({user_id:'tiktok:'+g.tiktok_id,display_name:g.display_name+' · TikTok',avatar:'man',seat_no:g.seat_no})));
 draw();
 if(online&&!people.some(p=>p.user_id===session?.user.id)){online=false;vis('join',true);vis('leave',false);note('joinMsg','Phiên đã hết hạn hoặc bị thu hồi. Vào lại nếu được phép.',true);}
}
async function wallet(){
 const rows=await query('temple_wallets','balance',q=>q.eq('user_id',session.user.id));
 $('balance').textContent=Number(rows[0]?.balance||0).toLocaleString('vi-VN');
 const log=await query('temple_coin_ledger','kind,delta,balance_after,created_at,ritual_code',q=>q.eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(20));
 const e=$('ledger');e.replaceChildren();
 if(!log.length){e.textContent='Chưa có giao dịch.';return;}
 for(const r of log){const item=document.createElement('div');item.textContent=new Date(r.created_at).toLocaleString('vi-VN')+' · '+(r.delta>0?'+':'')+r.delta+' coin · còn '+r.balance_after+(r.ritual_code?' · '+r.ritual_code:'');e.appendChild(item);}
}
async function refreshRituals(){
 rituals=await query('temple_rituals','code,label,coin_cost,enabled',q=>q.order('label'));
 const e=$('ritualButtons');e.replaceChildren();
 for(const r of rituals.filter(x=>x.enabled)){const b=document.createElement('button');b.textContent=r.label+' · '+r.coin_cost+' coin';b.disabled=!online;b.onclick=()=>spend(r);e.appendChild(b);}
 if(!e.children.length)e.textContent='Chưa có nghi lễ sử dụng coin được Trụ trì bật.';
 if(member?.role==='abbot'){
 const select=$('ritualCode'),selected=select.value;select.replaceChildren();
 for(const r of rituals)select.add(new Option(r.label,r.code));
 select.value=selected||rituals[0]?.code||'';displayPrice();
 }
}
function displayPrice(){const r=rituals.find(x=>x.code===$('ritualCode').value);if(r){$('ritualCost').value=r.coin_cost??'';$('ritualEnabled').value=String(r.enabled)}}
async function rpc(name,args){const {data,error}=await db.rpc(name,args||{});if(error)throw error;return data}
async function spend(r){
 if(!online)return note('ritualMsg','Cần vào chánh điện trước.',true);
 if(!confirm('Thực hiện '+r.label+' và sử dụng '+r.coin_cost+' coin?'))return;
 try{const balance=await rpc('temple_spend',{p_code:r.code,p_request:crypto.randomUUID()});note('ritualMsg','Đã '+r.label.toLowerCase()+', số dư '+balance+' coin.');await wallet();}
 catch(e){note('ritualMsg',e.message,true)}
}
async function join(){
 try{const seat=await rpc('temple_join');online=true;vis('join',false);vis('leave',true);note('joinMsg','Đang tham gia vị trí '+seat+'. Mỗi tài khoản một nhân vật.');
 await updateRoom();await refreshRituals();}
 catch(e){note('joinMsg',e.message,true)}
}
async function leave(){try{await rpc('temple_leave');online=false;vis('join',true);vis('leave',false);note('joinMsg','Đã rời chánh điện.');await updateRoom();await refreshRituals()}catch(e){note('joinMsg',e.message,true)}}
async function adminMembers(){
 if(member?.role!=='abbot')return;
 const all=await query('temple_members','user_id,display_name,avatar,role,active',q=>q.order('created_at'));
 const list=$('membershipRows'),pick=$('coinUser');list.replaceChildren();pick.replaceChildren();
 for(const m of all){const row=document.createElement('div');row.className='item';
 const label=document.createElement('span');label.textContent=m.display_name+' · '+(m.role==='abbot'?'Trụ trì':m.active?'Được duyệt':'Chờ duyệt');row.appendChild(label);
 if(m.role!=='abbot'){const b=document.createElement('button');b.textContent=m.active?'Khóa':'Duyệt';b.onclick=async()=>{const name=prompt('Pháp danh/tên hiển thị',m.display_name);if(name===null)return;try{await rpc('temple_admin_member',{p_user:m.user_id,p_name:name,p_avatar:m.avatar,p_active:!m.active});await adminMembers();await updateRoom()}catch(e){alert(e.message)}};row.appendChild(b)}
 if(m.active)pick.add(new Option(m.display_name,m.user_id));list.appendChild(row);}
}
async function adminTikTok(){
 if(member?.role!=='abbot')return;
 const guests=await query('temple_tiktok_requests','tiktok_id,display_name,last_comment,status,seat_no,updated_at',q=>q.order('updated_at',{ascending:false}).limit(100));
 const list=$('tiktokRows');list.replaceChildren();
 if(!guests.length){list.textContent='Chưa có yêu cầu. Người xem TikTok bình luận: xin vào chùa.';return;}
 for(const g of guests){const row=document.createElement('div');row.className='item';
 const label=document.createElement('span');label.textContent=g.display_name+' (@'+g.tiktok_id+') · '+(g.status==='approved'?'Vị trí '+g.seat_no:g.status==='pending'?'Chờ duyệt':'Đã từ chối')+' · '+g.last_comment;row.appendChild(label);
 const allow=g.status!=='approved',b=document.createElement('button');b.textContent=allow?'Duyệt':'Thu hồi';
 b.onclick=async()=>{if(!confirm((allow?'Cho vào: ':'Thu hồi chỗ: ')+g.display_name+'?'))return;
 try{await rpc('temple_admin_tiktok_decide',{p_tiktok_id:g.tiktok_id,p_allow:allow});note('approvalMsg','Đã cập nhật phê duyệt.');await Promise.all([adminTikTok(),updateRoom()])}catch(e){note('approvalMsg',e.message,true)}};row.appendChild(b);list.appendChild(row);}
}
function stop(){for(const t of activeTimers)clearInterval(t);activeTimers=[];if(channel)db.removeChannel(channel);channel=null;session=null;member=null;online=false;people=[];draw();}
async function boot(){
 stop();const {data:{session:s}}=await db.auth.getSession();session=s;
 if(!s){vis('login',true);vis('pending',false);vis('app',false);vis('logout',false);return;}
 const membership=await query('temple_members','user_id,display_name,avatar,role,active',q=>q.eq('user_id',s.user.id));
 member=membership[0]||null;vis('logout',true);vis('login',false);
 if(!member?.active){vis('pending',true);vis('app',false);return;}
 vis('pending',false);vis('app',true);vis('admin',member.role==='abbot');
 $('userBadge').textContent=member.role==='abbot'?'✿ TRỤ TRÌ':member.display_name;
 $('welcome').textContent='Kính chào '+member.display_name+'. Mời vào chánh điện.';
 await Promise.all([updateRoom(),wallet(),refreshRituals()]);
 if(member.role==='abbot')await Promise.all([adminMembers(),adminTikTok()]);
 activeTimers.push(setInterval(()=>{updateRoom().catch(console.error);if(member?.role==='abbot')adminTikTok().catch(console.error)},12000));
 activeTimers.push(setInterval(async()=>{if(online){try{const ok=await rpc('temple_renew');if(!ok){online=false;vis('join',true);vis('leave',false)}}catch(e){note('joinMsg',e.message,true)}}},20000));
 channel=db.channel('temple-attendance').on('postgres_changes',{event:'*',schema:'public',table:'temple_room_presence'},()=>updateRoom().catch(console.error)).subscribe();
}
$('loginForm').onsubmit=async e=>{e.preventDefault();const {error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error)note('loginMsg',error.message,true);else boot().catch(e=>note('loginMsg',e.message,true))};
$('logout').onclick=async()=>{if(online)await leave().catch(()=>{});await db.auth.signOut();stop();boot().catch(console.error)};
$('reload').onclick=()=>boot().catch(e=>alert(e.message));
$('join').onclick=join;$('leave').onclick=leave;$('ritualCode').onchange=displayPrice;
$('grant').onclick=async()=>{
 const target=$('coinUser').value,n=Number($('coinAmount').value);
 if(!target||!Number.isInteger(n)||n<1||n>100000)return note('grantMsg','Coin phải từ 1 đến 100000.',true);
 if(!confirm('Trụ trì xác nhận cộng '+n+' coin?'))return;
 $('grant').disabled=true;
 try{const balance=await rpc('temple_admin_grant',{p_user:target,p_coins:n,p_note:$('coinNote').value,p_request:crypto.randomUUID()});note('grantMsg','Đã cộng '+n+' coin. Số dư mới '+balance);await wallet()}
 catch(e){note('grantMsg',e.message,true)}finally{$('grant').disabled=false;}
};
$('saveRitual').onclick=async()=>{
 const raw=$('ritualCost').value,price=raw===''?null:Number(raw);
 if(price!==null&&(!Number.isInteger(price)||price<0||price>100000))return note('priceMsg','Giá coin không hợp lệ',true);
 try{await rpc('temple_admin_ritual',{p_code:$('ritualCode').value,p_price:price,p_enabled:$('ritualEnabled').value==='true'});note('priceMsg','Đã lưu mức coin.');await refreshRituals()}
 catch(e){note('priceMsg',e.message,true)}
};
db.auth.onAuthStateChange(event=>{if(event==='SIGNED_OUT'){stop();vis('login',true);vis('pending',false);vis('app',false)}});
window.addEventListener('pagehide',()=>{if(online)db.rpc('temple_leave').catch(()=>{})});
boot().catch(e=>{vis('login',true);note('loginMsg','Không khởi tạo được: '+e.message,true)});
}
