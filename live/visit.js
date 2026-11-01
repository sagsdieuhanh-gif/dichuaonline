(()=>{'use strict';
const $=id=>document.getElementById(id);
const notice=(s,bad=false)=>{const el=$('notice');el.textContent=s;el.classList.toggle('bad',bad)};
const btn=$('joinBtn'),form=$('joinForm'),joined=$('joined'),joinStatus=$('joinStatus'),joinDesc=$('joinDescription');
let lastState='',pending=false;
async function api(route,body){
 const opt=body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)};
 const r=await fetch('/api/'+route,{...opt,credentials:'same-origin',cache:'no-store'});
 const t=await r.json().catch(()=>({error:'Không đọc được phản hồi máy chủ'}));
 if(!r.ok)throw Error(t.error||'Lỗi HTTP '+r.status);return t;
}
function showState(s){
 const status=s.status||'new';
 $('counter').textContent=(s.seatCount||0)+' / 100 vị trí';
 if(status==='new'){form.classList.remove('hidden');joined.classList.add('hidden');return}
 form.classList.add('hidden');joined.classList.remove('hidden');
 $('sayPrayer').disabled=status!=='approved';
 $('messageBox').classList.toggle('hidden',status!=='approved'||$('messageBox').dataset.open!=='1');
 let title,desc;
 if(status==='pending'){title='⏳ Đang chờ Trụ trì duyệt';desc='Yêu cầu của bạn đã chuyển tới Trụ trì. Vui lòng giữ trang này mở, trạng thái sẽ cập nhật tự động.'}
 else if(status==='approved'){title='🙏 Đã được duyệt vào chánh điện';desc='Bạn đã có một vị trí trong chánh điện. Hãy giữ trang mở để duy trì hiện diện.'}
 else if(status==='left'){title='Bạn đã rời chánh điện';desc='Cảm ơn bạn đã tham gia. Có thể gửi một lời xin vô mới nếu muốn trở lại.'}
 else{title='Chưa được chấp thuận';desc='Nếu Trụ trì chưa duyệt hoặc đã từ chối, bạn có thể liên hệ Trụ trì để tìm hiểu.'}
 joinStatus.textContent=title;joinDesc.textContent=desc;
 if(lastState!==status){if(status==='approved')notice('Nam mô A Di Đà Phật. Chúc bạn thân tâm an lạc.');else if(status==='pending')notice('Đã gửi yêu cầu, không cần đăng ký.')}
 lastState=status;
 if(status==='left'||status==='not-approved'){
  const retry=document.getElementById('retryBtn');
  if(!retry){const b=document.createElement('button');b.id='retryBtn';b.type='button';b.textContent='Xin vào lại';b.onclick=()=>{form.classList.remove('hidden');joined.classList.add('hidden');$('joinComment').value=''};joined.appendChild(b)}
 }
}
async function update(){
 if(document.hidden)return;
 try{
  const [me,hall]=await Promise.all([api('me'),api('hall')]);
  showState(me);
  $('peopleCount').textContent=hall.count+' người';
  const list=$('people');list.replaceChildren();
  if(!hall.people.length){const text=document.createElement('span');text.className='note';text.textContent='Chánh điện đang trống, chờ những người thật xin vào.';list.append(text)}
  else hall.people.forEach(p=>{const pill=document.createElement('span');pill.className='person';pill.textContent=p.name+' · '+(p.group==='internal'?'Nội bộ':'Khách');list.append(pill)});
  if(me.status==='approved')await api('ping',{}).catch(()=>{});
 }catch(e){notice('Mất kết nối máy chủ LIVE: '+e.message,true)}
}
form.addEventListener('submit',async e=>{
 e.preventDefault();if(pending)return;pending=true;btn.disabled=true;
 try{const result=await api('join',{name:$('visitorName').value,comment:$('joinComment').value});showState(result);notice('Đã gửi bình luận tới Trụ trì, chờ duyệt.')}
 catch(e){notice(e.message,true)}
 finally{btn.disabled=false;pending=false}
});
$('sayPrayer').addEventListener('click',()=>{$('messageBox').dataset.open=$('messageBox').dataset.open==='1'?'0':'1';$('messageBox').classList.toggle('hidden',$('messageBox').dataset.open!=='1')});
$('sendPrayer').addEventListener('click',async()=>{
 try{await api('message',{text:$('prayerText').value});$('prayerText').value='';notice('Đã gửi lời niệm Phật vào chánh điện.')}
 catch(e){notice(e.message,true)}
});
$('leaveBtn').addEventListener('click',async()=>{try{showState(await api('leave',{}));notice('Bạn đã rời chánh điện.')}catch(e){notice(e.message,true)}});
setInterval(update,7000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)update()});
update();
})();