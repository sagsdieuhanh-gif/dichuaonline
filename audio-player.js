/* AN LAC DUONG ORIGINAL MUSIC PLAYER V1.3
   Original composed temple ambient generated with Web Audio; no third-party music
   recordings in the three default tracks. License: project owner may distribute.
*/
(()=>{'use strict';
const $=s=>document.querySelector(s);
const panel=$('#musicPanel'),button=$('#musicToggle'),select=$('#musicTrackSelect');
if(!panel||!button||!select)return;
const status=$('#musicStatus'),title=$('#musicTrackTitle'),credit=$('#musicCredit'),source=$('#musicSource');
const fileInput=$('#musicFile'),volume=$('#musicVolume'),volValue=$('#musicVolumeValue'),sound=$('#soundButton');
const remote=[
  {name:'Tụng Tam Quy · Buddham Saranam',by:'Bản thu của Hariharan · CC0',file:'https://upload.wikimedia.org/wikipedia/commons/8/8d/Buddham_Saranam_Gacchami_-_Male_Voice%2C_with_Female_Chorus.oga',url:'https://commons.wikimedia.org/wiki/File:Buddham_Saranam_Gacchami_-_Male_Voice,_with_Female_Chorus.oga'},
  {name:'Tiếng tụng kinh tại chùa Linh Ẩn',by:'LouiseBrown1981 · CC BY-SA 3.0',file:'https://upload.wikimedia.org/wikipedia/commons/e/e1/Chanting_at_Lingyin_Temple%2C_Hangzhou.ogg',url:'https://commons.wikimedia.org/wiki/File:Chanting_at_Lingyin_Temple,_Hangzhou.ogg'},
  {name:'Spiritual Ambient · Nhạc thiền thu âm',by:'MusicLFiles · CC BY 4.0',file:'https://upload.wikimedia.org/wikipedia/commons/e/e8/Spiritual_Ambient_by_MusicLFiles.ogg',url:'https://commons.wikimedia.org/wiki/File:Spiritual_Ambient_by_MusicLFiles.ogg'}
];
const tracks=[
  {name:'Chuông Sớm An Nhiên · Sáng tác riêng',by:'An Lạc Đường · nhạc thiền nguyên bản',kind:'original',tempo:58,root:48,style:0},
  {name:'Sen Nở Trong Tâm · Sáng tác riêng',by:'An Lạc Đường · nhạc thiền nguyên bản',kind:'original',tempo:54,root:45,style:1},
  {name:'Hương Trầm Tĩnh Lặng · Sáng tác riêng',by:'An Lạc Đường · nhạc thiền nguyên bản',kind:'original',tempo:62,root:50,style:2},
  ...remote.map(t=>({...t,kind:'recording'}))
];
let selected=0,enabled=false,player=new Audio(),localURL=null,engine=null,vol=.46;
let playbackSerial=0;
player.preload='none';player.volume=vol;
const AudioClass=window.AudioContext||window.webkitAudioContext;
const pieces=[
  {melody:[0,2,4,7,4,2,0,-3,0,2,5,7,9,7,5,4,2,0,-3,0,2,4,5,2,0,-3,-5,-3,0,2,0,null],harm:[0,5,-3,2],bells:[0,16],wood:[6,14,22,30]},
  {melody:[0,null,2,null,5,4,null,2,0,null,-3,null,0,2,4,null,7,null,5,null,4,2,null,0,-3,null,-5,null,-3,0,null,null],harm:[0,-3,-5,2],bells:[0,12,24],wood:[8,24]},
  {melody:[0,2,4,2,0,-3,0,null,5,4,2,0,2,4,7,null,9,7,5,4,2,0,-3,null,0,2,5,4,2,0,-3,null],harm:[0,2,5,-3],bells:[0,16],wood:[4,12,20,28]}
];
const midi=n=>440*Math.pow(2,(n-69)/12), clamps=(n,a,b)=>Math.max(a,Math.min(b,n));
function newEngine(){if(!AudioClass)throw Error('Thiết bị không hỗ trợ Web Audio');
 const ac=new AudioClass(),master=ac.createGain();master.gain.value=vol*.54;
 const limiter=ac.createDynamicsCompressor();limiter.threshold.value=-17;limiter.knee.value=19;limiter.ratio.value=3;limiter.attack.value=.005;limiter.release.value=.24;
 master.connect(limiter);limiter.connect(ac.destination);
 const wet=ac.createGain();wet.gain.value=.32;wet.connect(master);
 const convolver=ac.createConvolver();const len=Math.floor(ac.sampleRate*2.25),buffer=ac.createBuffer(2,len,ac.sampleRate);
 for(let ch=0;ch<2;ch++){const d=buffer.getChannelData(ch);let seed=ch?291:193;
 for(let i=0;i<len;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const n=(seed>>>0)/2147483648-1;d[i]=n*Math.exp(-i/(ac.sampleRate*.64))*(.58+.42*Math.sin(i*.000043+ch));}}
 convolver.buffer=buffer;convolver.connect(wet);
 const dry=ac.createGain();dry.gain.value=.92;dry.connect(master);
 let nodes=[],timer=null,step=0,start=ac.currentTime+.12,playing=true;
 function route(g,w=.36){g.connect(dry);const s=ac.createGain();s.gain.value=w;g.connect(s);s.connect(convolver)}
 function voice(n,when,duration,type='flute',strength=.65){
 if(n==null||!playing)return;const f=midi(n),out=ac.createGain(),v=clamps(strength,0,.9);
 let attack=.07,release=.55,peak=.075;
 if(type==='flute'){attack=.26;release=.62;peak=.085}
 if(type==='pluck'){attack=.008;release=1.05;peak=.095}
 if(type==='pad'){attack=1.5;release=2.3;peak=.033}
 if(type==='bell'){attack=.006;release=5.0;peak=.095}
 if(type==='wood'){attack=.003;release=.12;peak=.13}
 const finish=when+duration+release;
 out.gain.setValueAtTime(.0001,when);out.gain.linearRampToValueAtTime(peak*v,when+attack);
 if(type==='bell'||type==='pluck'||type==='wood'){out.gain.exponentialRampToValueAtTime(.0001,finish)}
 else {out.gain.setValueAtTime(peak*v,when+Math.max(attack,duration*.6));out.gain.exponentialRampToValueAtTime(.0001,finish)}
 route(out,type==='bell'?.77:type==='pad'?.50:.25);
 const harmonics=type==='bell'?[ [1,1],[2.01,.36],[3.93,.13],[5.12,.075] ]:type==='pluck'?[[1,1],[2,.36],[3,.16],[4,.07]]:type==='flute'?[[1,1],[2,.08],[3,.03]]:type==='wood'?[[1,1],[1.83,.24],[3.9,.10]]:[[1,1],[2,.19],[.5,.11]];
 const sources=[];
 for(const [mult,amp] of harmonics){const osc=ac.createOscillator();osc.type=(type==='pluck'&&mult===1)?'triangle':'sine';
 osc.frequency.setValueAtTime(f*mult,when);if(type==='bell')osc.frequency.exponentialRampToValueAtTime(f*mult*.996,when+3);
 if(type==='flute'&&mult===1){osc.frequency.setValueAtTime(f*.998,when);osc.frequency.linearRampToValueAtTime(f*1.002,when+duration*.5)}
 const g=ac.createGain();g.gain.value=amp*(type==='wood'?.62:1);osc.connect(g);g.connect(out);osc.start(when);osc.stop(finish+.03);sources.push(osc)}
 out.disconnect;nodes.push({out,finish});
 }
 function tick(){
 if(!playing)return;const song=pieces[tracks[selected].style]||pieces[0],beat=60/tracks[selected].tempo;
 const horizon=ac.currentTime+2.1;
 while(start+step*beat<horizon){const i=step%32,t=start+step*beat,part=tracks[selected].style;
 const note=song.melody[i],base=tracks[selected].root,register=part===1?12:24;
 if(note!==null&&note!==undefined){voice(base+register+note,t,beat*.93,part===1?'pluck':'flute',part===2?.76:.69);if(part===2&&i%4===0)voice(base+12+note,t+.18,beat*.69,'pluck',.34)}
 if(i%8===0){voice(base-12+song.harm[(step/8|0)%4],t,beat*7.75,'pad',.65);voice(base+song.harm[(step/8|0)%4],t+.08,beat*7.3,'pad',.27)}
 if(song.bells.includes(i))voice(base+12+(i%24===0?0:7),t,2.1,'bell',part===1?.48:.32);
 if(song.wood.includes(i))voice(55,t,.11,'wood',part===2?.32:.19);
 step++;
 }
 const now=ac.currentTime;nodes=nodes.filter(n=>n.finish>now);
 }
 timer=setInterval(tick,350);tick();
 return {ac,master,get active(){return playing},setVolume(v){master.gain.setTargetAtTime(v*.54,ac.currentTime,.08)},stop(){if(!playing)return;playing=false;clearInterval(timer);master.gain.setTargetAtTime(0,ac.currentTime,.05);setTimeout(()=>{ac.close().catch(()=>{})},180);}}
}
function info(){const t=tracks[selected];title.textContent=t.name;credit.textContent=t.by;
 if(t.kind==='original'){source.textContent='Nhạc nguyên bản · Không cần Internet';source.removeAttribute('href');}
 else{source.textContent='Nguồn và giấy phép ↗';source.href=t.url}select.value=String(selected)}
for(let i=0;i<tracks.length;i++){const o=document.createElement('option');o.value=String(i);o.textContent=tracks[i].name;select.append(o)}
function state(msg,warning=false){button.textContent=enabled?'❚❚ Tạm dừng':'▶ Phát nhạc';sound?.classList.toggle('music-active',enabled);
 if(msg){status.textContent=msg;status.classList.toggle('music-warn',warning)}}
function dispose(){playbackSerial++;player.pause();player.removeAttribute('src');player.load();if(engine){engine.stop();engine=null}}
async function play(){const serial=++playbackSerial;enabled=true;const t=localURL?null:tracks[selected];
 if(!localURL&&t.kind==='original'){player.pause();try{if(!engine)engine=newEngine();await engine.ac.resume();if(serial!==playbackSerial)return;state('Đang phát giai điệu thiền nguyên bản, tiếng chuông và tiếng mõ.');}catch(e){enabled=false;state('Không thể phát âm thanh. Hãy thử nhấn Phát lại.',true)}return}
 if(engine){engine.stop();engine=null}
 if(!player.src||(!localURL&&!player.src.includes(encodeURIComponent(t.file.split('/').pop()).slice(0,10))))player.src=localURL||t.file;
 player.loop=true;player.volume=vol;
 try{await player.play();if(serial===playbackSerial)state(localURL?'Đang phát nhạc từ máy của bạn.':'Đang phát bản thu âm tụng niệm.')}
 catch(e){enabled=false;state('Chưa phát được bản thu. Vui lòng chọn nhạc thiền nguyên bản hoặc nhấn Phát lại.',true)}
}
function pause(){enabled=false;dispose();state('Đã tạm dừng')}
function choose(i){enabled=false;dispose();if(localURL){URL.revokeObjectURL(localURL);localURL=null}selected=clamps(i,0,tracks.length-1);info();play()}
function open(){panel.classList.remove('hidden');sound?.setAttribute('aria-expanded','true')}
function close(){panel.classList.add('hidden');sound?.setAttribute('aria-expanded','false')}
button.addEventListener('click',()=>enabled?pause():play());
$('#musicClose')?.addEventListener('click',close);
$('#musicPrevious')?.addEventListener('click',()=>choose((selected+tracks.length-1)%tracks.length));
$('#musicNext')?.addEventListener('click',()=>choose((selected+1)%tracks.length));
select.addEventListener('change',()=>choose(Number(select.value)));
volume.addEventListener('input',()=>{vol=Number(volume.value)/100;volValue.textContent=volume.value+'%';player.volume=vol;if(engine)engine.setVolume(vol)});
fileInput?.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith('audio/')){state('Vui lòng chọn file âm thanh MP3/M4A/OGG.',true);return}dispose();if(localURL)URL.revokeObjectURL(localURL);localURL=URL.createObjectURL(f);title.textContent=f.name;credit.textContent='Nhạc riêng từ thiết bị, không tải lên';source.removeAttribute('href');source.textContent='Không có dữ liệu được gửi đi';select.value='';play()});
player.addEventListener('ended',()=>{if(enabled&&!player.loop)choose((selected+1)%tracks.length)});
player.addEventListener('error',()=>{if(enabled&&(!tracks[selected]||tracks[selected].kind==='recording')){enabled=false;state('Không tải được bản thu bên ngoài. Chọn một trong ba bài nhạc nguyên bản ở đầu danh sách.',true)}});
window.AnLacMusic={
 startOnEntry(){if(!enabled)play()},pause,open,
 togglePanel(){panel.classList.contains('hidden')?open():close()},
 play
};
info();state('Chọn Phát hoặc Vào chùa để nghe nhạc thiền nguyên bản.');
})();