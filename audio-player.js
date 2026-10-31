/* An Lạc Đường V1.5 — Nhạc gốc trong kho GitHub và trì chú có ghi nguồn */
(()=>{'use strict';
const $=s=>document.querySelector(s);
const panel=$('#musicPanel'),button=$('#musicToggle'),select=$('#musicTrackSelect');
if(!panel||!button||!select)return;
const status=$('#musicStatus'),title=$('#musicTrackTitle'),credit=$('#musicCredit'),source=$('#musicSource'),sound=$('#soundButton'),volume=$('#musicVolume'),volText=$('#musicVolumeValue');
const audio=new Audio();audio.preload='metadata';audio.volume=.46;
const tracks=[
 {name:'Chuông Sớm An Nhiên',kind:'local',detail:'Nhạc thiền nguyên bản • Phát ngay',src:'music/chuong-som-an-nhien.wav'},
 {name:'Sen Nở Trong Tâm',kind:'local',detail:'Nhạc thiền nguyên bản • Phát ngay',src:'music/sen-no-trong-tam.wav'},
 {name:'Hương Trầm Tĩnh Lặng',kind:'local',detail:'Nhạc thiền nguyên bản • Phát ngay',src:'music/huong-tram-tinh-lang.wav'},
 {name:'Chú Đại Bi · trích đoạn (giọng máy)',kind:'speech',detail:'6 câu mở đầu, đọc bằng giọng máy tiếng Việt; KHÔNG phải bản tụng đầy đủ',words:'Nam mô hắc ra đát na đa ra dạ da. Nam mô a rị da. Bà lô yết đế thước bát ra da. Bồ đề tát đỏa bà da. Ma ha tát đỏa bà da. Ma ha ca lô ni ca da.',repeat:1},
 {name:'Niệm Nam mô A Di Đà Phật · 108 câu',kind:'speech',detail:'Giọng máy tiếng Việt đọc 108 câu; tùy giọng cài trên máy',words:'Nam mô A Di Đà Phật.',repeat:108},
 {name:'Trì chú Om Mani Padme Hum · bản thu',kind:'online',detail:'Bản thu tại Định Giác Tự • Saimmx • CC0 • Cần mạng',src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/20260602%20145912%20Dingjue%20Om%20mani%20padme%20hum.ogg',source:'https://commons.wikimedia.org/wiki/File:20260602_145912_Dingjue_Om_mani_padme_hum.ogg'},
 {name:'Trì chú Đà-la-ni · bản thu',kind:'online',detail:'Usnisa Sitatapatra, KHÔNG PHẢI Chú Đại Bi • CC BY 3.0 • Cần mạng',src:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Usnidha%20Sitatapatra%20dharani%2C%20Siddham%20chant%20and%20Buddhist%20Sanskrit%20mantra%20chant%202%20short%20version%201075%201110.ogg',source:'https://commons.wikimedia.org/wiki/File:Usnidha_Sitatapatra_dharani,_Siddham_chant_and_Buddhist_Sanskrit_mantra_chant_2_short_version_1075_1110.ogg'}
];
let idx=0,playing=false,external=null,speechGeneration=0;
tracks.forEach((t,i)=>{const opt=document.createElement('option');opt.value=String(i);opt.textContent=t.name;select.append(opt)});
function info(){const t=tracks[idx];title.textContent=external?'Nhạc của bạn':t.name;credit.textContent=external?'Tệp trên thiết bị, không gửi lên máy chủ':t.detail;
 select.value=external?'':String(idx);if(t.source&&!external){source.href=t.source;source.target='_blank';source.rel='noopener noreferrer';source.textContent='Bản gốc & giấy phép ↗'}else{source.removeAttribute('href');source.textContent=t.kind==='speech'?'Trích đoạn giọng máy':'Nhạc gốc của An Lạc Đường'}
 button.textContent=playing?'❚❚ Tạm dừng':'▶ Phát nhạc';sound?.classList.toggle('music-active',playing);
}
function message(s,warn=false){status.textContent=s;status.classList.toggle('music-warn',warn)}
function open(){panel.classList.remove('hidden');sound?.setAttribute('aria-expanded','true')}
function close(){panel.classList.add('hidden');sound?.setAttribute('aria-expanded','false')}
function stopSpeech(){++speechGeneration;try{window.speechSynthesis?.cancel()}catch(e){}}
function pause(){playing=false;audio.pause();stopSpeech();info();message('Đã tạm dừng')}
function speakTrack(){if(!('speechSynthesis' in window)){playing=false;message('Máy không có giọng đọc. Hãy chọn nhạc thiền.',true);info();return}
 const gen=++speechGeneration,t=tracks[idx],count=t.repeat||1;let n=0;
 const say=()=>{if(!playing||gen!==speechGeneration)return;if(n>=count){playing=false;message('Đã hoàn thành');info();return}
 const u=new SpeechSynthesisUtterance(t.words);u.lang='vi-VN';u.rate=.78;u.volume=Number(volume.value)/100;
 u.onend=()=>{n++;message(count>1?'Đã niệm '+n+' / '+count+' lần':'Đã đọc xong trích đoạn Chú Đại Bi');if(gen===speechGeneration)say()};
 u.onerror=()=>{if(gen!==speechGeneration)return;playing=false;info();message('Giọng đọc bị gián đoạn. Có thể chọn bản nhạc thiền khác.',true)};
 try{speechSynthesis.speak(u)}catch(e){playing=false;message('Không đọc được bài này trên thiết bị.',true);info()}
 };
 try{speechSynthesis.cancel();say();message(t.repeat>1?'Đang niệm Phật bằng giọng đọc máy':'Đang đọc trích đoạn bằng giọng máy');info()}catch(e){playing=false;info()}
}
async function play(){if(playing)return;playing=true;info();if(tracks[idx].kind==='speech'&&!external){audio.pause();speakTrack();return}
 stopSpeech();const track=tracks[idx],src=external||track.src;try{if(audio.getAttribute('data-track')!==src){audio.src=src;audio.setAttribute('data-track',src);audio.load()}
 await audio.play();message(track.kind==='online'?'Đang phát bản thu trì chú trực tuyến':'Đang phát nhạc thiền')}
 catch(e){playing=false;info();open();message('Không phát được. Hãy nhấn Phát lại; nếu dùng iPhone hãy bật âm lượng và bỏ chế độ im lặng.',true)}info()}
function choose(index){if(index<0||index>=tracks.length)return;pause();if(external){URL.revokeObjectURL(external);external=null}idx=index;audio.removeAttribute('data-track');audio.removeAttribute('src');audio.load();info();play()}
function next(d){choose((idx+d+tracks.length)%tracks.length)}
button.addEventListener('click',()=>playing?pause():play());$('#musicPrevious').addEventListener('click',()=>next(-1));$('#musicNext').addEventListener('click',()=>next(1));$('#musicClose').addEventListener('click',close);
select.addEventListener('change',()=>choose(Number(select.value)));
volume.addEventListener('input',()=>{audio.volume=Number(volume.value)/100;volText.textContent=volume.value+'%'});
$('#musicFile').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith('audio/')){message('Vui lòng chọn MP3, M4A hoặc OGG',true);return}
 pause();if(external)URL.revokeObjectURL(external);external=URL.createObjectURL(f);audio.removeAttribute('data-track');info();play()});
audio.addEventListener('ended',()=>{if(playing)next(1)});audio.addEventListener('error',()=>{if(playing){playing=false;info();message('Tệp nhạc không tải được. Hãy chọn bài khác.',true);open()}});
window.AnLacMusic={startOnEntry(){if(!playing)play()},play,pause,open,togglePanel(){panel.classList.contains('hidden')?open():close()},tracks};
info();message('Có 3 bài nhạc thiền phát ngay và 4 lựa chọn tụng niệm / trì chú.');
})();