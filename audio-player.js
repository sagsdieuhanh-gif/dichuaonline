/* An Lac Duong V1.2 | recorded, openly licensed Buddhist music */
(()=>{'use strict';
const tracks=[
{name:'Nhạc thiền không lời · Spiritual Ambient',by:'MusicLFiles · CC BY 4.0',url:'https://commons.wikimedia.org/wiki/File:Spiritual_Ambient_by_MusicLFiles.ogg',file:'https://upload.wikimedia.org/wikipedia/commons/e/e8/Spiritual_Ambient_by_MusicLFiles.ogg'},
{name:'Tụng Tam Quy · Buddham Saranam',by:'Hariharan · CC0',url:'https://commons.wikimedia.org/wiki/File:Buddham_Saranam_Gacchami_-_Male_Voice,_with_Female_Chorus.oga',file:'https://upload.wikimedia.org/wikipedia/commons/8/8d/Buddham_Saranam_Gacchami_-_Male_Voice%2C_with_Female_Chorus.oga'},
{name:'Tiếng tụng kinh tại chùa Linh Ẩn',by:'LouiseBrown1981 · CC BY-SA 3.0',url:'https://commons.wikimedia.org/wiki/File:Chanting_at_Lingyin_Temple,_Hangzhou.ogg',file:'https://upload.wikimedia.org/wikipedia/commons/e/e1/Chanting_at_Lingyin_Temple%2C_Hangzhou.ogg'}];
const $=s=>document.querySelector(s);
const player=new Audio();player.preload='none';player.volume=.46;
const panel=$('#musicPanel'),button=$('#musicToggle'),select=$('#musicTrackSelect'),status=$('#musicStatus'),source=$('#musicSource'),file=$('#musicFile'),title=$('#musicTrackTitle'),credit=$('#musicCredit');
if(!panel||!button)return;
let index=0,enabled=false,local=null,fallBackFor=-1;
for(let i=0;i<tracks.length;i++){const o=document.createElement('option');o.value=String(i);o.textContent=tracks[i].name;select.append(o)}
function originalOrMp3(src){if(player.canPlayType('audio/ogg; codecs="vorbis"'))return src;const name=src.split('/commons/')[1];return 'https://upload.wikimedia.org/wikipedia/commons/transcoded/'+name+'/'+name.split('/').pop()+'.mp3'}
function setSource(){player.src=local||originalOrMp3(tracks[index].file);player.load()}
function open(){panel.classList.remove('hidden');$('#soundButton').setAttribute('aria-expanded','true')}
function close(){panel.classList.add('hidden');$('#soundButton').setAttribute('aria-expanded','false')}
function state(msg='',warn=false){button.textContent=player.paused?'▶ Phát nhạc':'❚❚ Tạm dừng';if(msg)status.textContent=msg;status.classList.toggle('music-warn',warn);$('#soundButton').classList.toggle('music-active',!player.paused)}
function info(){const t=tracks[index];if(!local){title.textContent=t.name;credit.textContent=t.by;source.href=t.url;source.textContent='Nguồn và giấy phép ↗';select.value=String(index)}}
async function play(){enabled=true;if(!player.src)setSource();try{await player.play();state('Đang phát bản thu âm thực tế')}catch(e){state('Không phát được. Thử nhấn Phát lại hoặc chọn bài khác; cần Internet và bật âm lượng.',true);open()}state()}
function pause(){enabled=false;player.pause();state('Đã tạm dừng')}
function pick(i,auto){if(local){URL.revokeObjectURL(local);local=null}index=(i+tracks.length)%tracks.length;fallBackFor=-1;player.pause();setSource();info();state();if(auto)play()}
function advance(step){pick(index+step,enabled)}
window.AnLacMusic={startOnEntry(){if(!player.src){info();setSource();play()}},pause,open,togglePanel(){panel.classList.contains('hidden')?open():close()},play};
button.addEventListener('click',()=>player.paused?play():pause());
$('#musicClose').addEventListener('click',close);
$('#musicPrevious').addEventListener('click',()=>advance(-1));
$('#musicNext').addEventListener('click',()=>advance(1));
select.addEventListener('change',()=>pick(Number(select.value),true));
$('#musicVolume').addEventListener('input',e=>{player.volume=Number(e.target.value)/100;$('#musicVolumeValue').textContent=e.target.value+'%'});
file.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith('audio/')){state('Chọn tệp MP3/M4A/OGG',true);return}if(local)URL.revokeObjectURL(local);local=URL.createObjectURL(f);player.pause();player.src=local;title.textContent='Nhạc trong thiết bị · '+f.name;credit.textContent='Chỉ mở ở thiết bị của bạn';source.removeAttribute('href');source.textContent='Không tải lên máy chủ';select.value='';play()});
player.addEventListener('ended',()=>{if(enabled)advance(1)});
player.addEventListener('playing',()=>state('Đang phát nhạc thu âm'));
player.addEventListener('waiting',()=>state('Đang tải nhạc…'));
player.addEventListener('pause',()=>state());
player.addEventListener('error',()=>{if(!local && fallBackFor!==index && player.src!==tracks[index].file){fallBackFor=index;player.src=tracks[index].file;player.load();if(enabled)player.play().catch(()=>{});return}state('Lỗi tải bài nhạc; chọn bài khác hoặc nhạc từ máy.',true);open()});
info();state('Nhấn Vào chùa để nghe nhạc · chọn bài tại đây');
})();