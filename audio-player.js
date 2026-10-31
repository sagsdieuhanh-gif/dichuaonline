/* An Lạc Đường V1.9 — curated Buddhist recordings through the official YouTube embed.
   No YouTube audio extraction, no hidden video playback, no mantra TTS.
   A visible YouTube player remains on screen while YouTube audio plays. */
(()=>{'use strict';
const $=(s)=>document.querySelector(s);
const panel=$('#musicPanel'),sound=$('#soundButton'),button=$('#musicToggle'),select=$('#musicTrackSelect');
if(!panel||!sound||!button||!select)return;
const status=$('#musicStatus'),title=$('#musicTrackTitle'),credit=$('#musicCredit'),source=$('#musicSource');
const previous=$('#musicPrevious'),next=$('#musicNext'),closeButton=$('#musicClose'),volume=$('#musicVolume'),volumeValue=$('#musicVolumeValue'),upload=$('#musicFile');
const tracks=[
  {id:'E0zsRzn0iLI',name:'Nhạc thiền Phật giáo không lời · Tĩnh tâm',artist:'Tuyển tập nhạc thiền không lời · YouTube',type:'Nhạc thiền'},
  {id:'W_9wRtBngdc',name:'Chú Đại Bi · Kim Linh (tiếng Việt)',artist:'Kim Linh Official · Bản thu nghệ sĩ',type:'Trì chú'},
  {id:'fpsc36eAX-A',name:'Niệm Phật A Di Đà · Nhiều ca sĩ',artist:'POPS MUSIC · Official',type:'Niệm Phật'},
  {id:'Eashk8HtJVo',name:'Chú Dược Sư · Kim Linh',artist:'Kim Linh Official · Bản thu nghệ sĩ',type:'Trì chú'},
  {id:'9qDZGa2MVxo',name:'Bát Nhã Tâm Kinh · Tiếng Việt (1 giờ)',artist:'Nhạc Nhà Phật · YouTube',type:'Tụng kinh'},
  {id:'uDl8Jc3-sjw',name:'Chú Đại Bi · Diệu Âm Tịnh Tuấn',artist:'Diệu Âm Tịnh Tuấn · Bản thu nghệ sĩ',type:'Trì chú'}
];
const style=document.createElement('style');
style.textContent='.music-panel{width:min(398px,calc(100vw - 20px))!important;max-height:calc(100dvh - 96px);overflow-y:auto}.yt-temple-player{margin:12px 0 8px;border:1px solid rgba(224,172,91,.52);border-radius:9px;overflow:hidden;background:#15100e}.yt-temple-player iframe{display:block;width:100%;height:216px;min-height:200px;border:0}.yt-temple-placeholder{display:flex;align-items:center;justify-content:center;text-align:center;padding:18px;color:#e8c9a5;font-size:12px;min-height:200px;line-height:1.6}.yt-temple-help{font-size:10px;line-height:1.6;color:#d7c0a7;margin:10px 0 0}.yt-temple-help strong{color:#f2d3a3}.yt-temple-available{font-size:11px;color:#8ad4a6}.music-panel .music-volume-row{margin-top:8px}.music-panel .music-note{line-height:1.6}@media(max-width:580px){.music-panel{top:66px!important;right:8px!important;max-height:calc(100dvh - 84px)}.yt-temple-player iframe{height:208px}}';
document.head.appendChild(style);
const playerHolder=document.createElement('div');playerHolder.id='youtubeTemplePlayer';playerHolder.className='yt-temple-player';playerHolder.innerHTML='<div class="yt-temple-placeholder">Chọn một bài nhạc và nhấn Phát để nghe bản thu trên YouTube.</div>';
select.insertAdjacentElement('afterend',playerHolder);
const help=document.createElement('div');help.className='yt-temple-help';
help.innerHTML='YouTube cần Internet. <strong>Video phải hiển thị</strong> khi phát; đóng bảng sẽ dừng nhạc. Nếu video bị hạn chế nhúng, chọn “Mở trên YouTube”.';
playerHolder.insertAdjacentElement('afterend',help);
const note=panel.querySelector('.music-note');
if(note)note.textContent='Các bài do tác giả/kênh YouTube phát hành, không được tải hoặc sao chép về website. Một số video có thể chặn nhúng hoặc tự phát trên điện thoại.';
const uploadWrapper=upload?.closest('label');if(uploadWrapper)uploadWrapper.style.display='none';
const localVolume=document.querySelector('.music-volume-row');
let selected=0,iframe=null,yt=null,apiReady=false,apiRequested=false,playing=false,entered=false;
function setStatus(message,warning=false){status.textContent=message;status.classList.toggle('music-warn',warning)}
function updateInfo(){const track=tracks[selected];title.textContent=track.name;credit.textContent=track.artist;source.textContent='Mở bản gốc trên YouTube ↗';source.href='https://www.youtube.com/watch?v='+track.id;source.target='_blank';source.rel='noopener noreferrer';select.value=String(selected)}
const groups={};
tracks.forEach((t,i)=>{if(!groups[t.type]){groups[t.type]=document.createElement('optgroup');groups[t.type].label=t.type;select.appendChild(groups[t.type])}let o=document.createElement('option');o.value=String(i);o.textContent=t.name;groups[t.type].appendChild(o)});
function updateButton(){button.textContent=playing?'❚❚ Tạm dừng':'▶ Phát nhạc';sound.classList.toggle('music-active',playing)}
function isOpen(){return !panel.classList.contains('hidden')}
function open(){panel.classList.remove('hidden');sound.setAttribute('aria-expanded','true')}
function stop(){playing=false;if(yt&&apiReady){try{yt.pauseVideo()}catch(_){}}if(iframe){iframe.remove();iframe=null;yt=null;apiReady=false;playerHolder.innerHTML='<div class="yt-temple-placeholder">Nhạc đã dừng. Nhấn Phát để nghe lại từ đầu.</div>'}updateButton()}
function close(){stop();panel.classList.add('hidden');sound.setAttribute('aria-expanded','false')}
function embedVideo(autoplay=true){
  const video=tracks[selected];if(iframe)iframe.remove();
  playerHolder.replaceChildren();
  iframe=document.createElement('iframe');
  iframe.id='anlacYoutubeFrame';
  iframe.title='Trình phát YouTube: '+video.name;
  iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.setAttribute('allowfullscreen','');
  iframe.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
  const origin=encodeURIComponent(location.origin);
  iframe.src='https://www.youtube-nocookie.com/embed/'+video.id+'?playsinline=1&controls=1&rel=0&enablejsapi=1&autoplay='+(autoplay?'1':'0')+'&origin='+origin;
  playerHolder.appendChild(iframe);
  yt=null;apiReady=false;
  // The video stays visible, preserving YouTube playback controls and credits.
  if(window.YT&&typeof window.YT.Player==='function')attachApi();
  else requestApi();
}
function attachApi(){if(!iframe||yt||!window.YT?.Player)return;try{const current=iframe;yt=new window.YT.Player(current,{events:{
  onReady(e){if(current!==iframe)return;apiReady=true;try{e.target.setVolume(Number(volume.value));if(playing)e.target.playVideo()}catch(_){}},
  onStateChange(e){if(current!==iframe)return;if(e.data===1){playing=true;updateButton();setStatus('Đang phát bản thu trên YouTube')}else if(e.data===2){playing=false;updateButton();setStatus('Đã tạm dừng')}else if(e.data===0){playing=false;updateButton();setStatus('Bài đã kết thúc — chọn bài kế tiếp')}},
  onError(e){if(current!==iframe)return;playing=false;updateButton();setStatus('Video không phát được tại đây (lỗi '+e.data+'). Chọn “Mở trên YouTube” hoặc bài khác.',true)}
 }})}catch(e){setStatus('Trình phát YouTube chưa sẵn sàng. Hãy điều khiển bằng các nút trên video.',true)}}
function requestApi(){if(apiRequested)return;apiRequested=true;const previousCallback=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{if(typeof previousCallback==='function')previousCallback();attachApi()};
const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;script.onerror=()=>setStatus('Không tải được bộ điều khiển YouTube. Dùng nút Phát trong video hoặc mở trên YouTube.',true);document.head.appendChild(script)}
function play(){open();if(!iframe){playing=true;embedVideo(true);updateButton();setStatus('Đang mở YouTube. Nếu không tự phát, hãy chạm nút ▶ trong video.');return}
if(yt&&apiReady){try{yt.playVideo();playing=true;updateButton();setStatus('Đang phát qua YouTube');return}catch(_){}}
 // Video's native play control still works if the API is blocked.
 setStatus('Hãy chạm nút ▶ trong khung YouTube để phát nhạc.',true);playing=false;updateButton()}
function pause(){if(yt&&apiReady){try{yt.pauseVideo();playing=false;updateButton();setStatus('Đã tạm dừng');return}catch(_){}}
 stop();setStatus('Đã dừng. Nhấn Phát để nghe lại từ đầu.');}
function switchTo(n){selected=(n+tracks.length)%tracks.length;const resume=playing;stop();updateInfo();if(resume)play();else setStatus('Đã chọn '+tracks[selected].name+'. Nhấn Phát để nghe.')}
button.addEventListener('click',()=>playing?pause():play());
previous.addEventListener('click',()=>switchTo(selected-1));next.addEventListener('click',()=>switchTo(selected+1));
select.addEventListener('change',()=>{switchTo(Number(select.value));play()});
closeButton.addEventListener('click',close);
sound.addEventListener('click',()=>isOpen()?close():open());
volume.addEventListener('input',()=>{volumeValue.textContent=volume.value+'%';if(yt&&apiReady){try{yt.setVolume(Number(volume.value))}catch(_){}}else if(iframe){setStatus('Có thể chỉnh âm lượng bằng nút loa trong video hoặc trên điện thoại.')}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){pause()}});
window.AnLacMusic={startOnEntry(){if(entered)return;entered=true;open();setStatus('Chọn nhạc thiền hoặc bài tụng niệm. Nhấn Phát để bắt đầu.');},play,pause,open,togglePanel(){isOpen()?close():open()},tracks};
updateInfo();updateButton();setStatus('Chọn bản nhạc YouTube bạn thích rồi nhấn Phát.');
})();