import assert from 'node:assert/strict';
import {createHybrid} from './temple-hybrid.mjs';
const viewers=new Map(),events=[],logs=[];
function broadcast(x,only){events.push({event:x,only})}
function seat(id,name,opts){if(viewers.has(id))return {v:viewers.get(id),isNew:false};
 if(viewers.size>=100)return {v:null,isNew:false};
 const v={id,name,...opts};viewers.set(id,v);broadcast({t:'join',v});return {v,isNew:true};}
const hybrid=createHybrid({viewers,seat,broadcast,log:x=>logs.push(x)});
assert.equal(hybrid.dbEnabled,false);
assert.equal(hybrid.gateChat('user-1','Hoa','Nam mô A Di Đà Phật',''),false);
assert.equal(hybrid.pending.size,1,'First meaningful Buddhist greeting must enter review queue');
assert.equal(viewers.size,0,'Unapproved chat MUST NOT seat a viewer');
assert.equal(hybrid.gateChat('user-1','Hoa','xin vào chùa',''),false);
assert.equal(hybrid.pending.size,1,'Follow-up comments may update an existing request but cannot create duplicates');
assert.equal(hybrid.gateChat('user-empty','Im lặng','    ',''),false);
assert.equal(hybrid.pending.size,1,'Whitespace alone is not a comment');
assert.equal(hybrid.gateChat('user-unrelated','Thanh','Hôm nay trời đẹp quá',''),false);
assert.equal(hybrid.pending.size,2,'Any nonempty comment must enter queue');
assert.equal(hybrid.gateChat('user-unrelated','Thanh','❤️',''),false);
assert.equal(hybrid.pending.size,2,'Emoji-only comment must be accepted without duplicate');
assert.equal(hybrid.gateChat('sim_guest','Mẫu','xin vào chùa',''),false);
assert.equal(hybrid.pending.size,2,'No fake user can register');
assert.equal(hybrid.giftForGuest('user-2','An','Hoa sen',1,30,''),true);
assert.equal(viewers.size,0,'Gift without approval MUST NOT generate attendance');
assert.ok(events.some(x=>x.event.t==='gift'&&x.event.name==='An'));
hybrid.localDecide('user-1',true,'internal');
assert.equal(viewers.size,1);
assert.equal(viewers.get('user-1').group,'internal');
assert.equal(hybrid.gateChat('user-1','Hoa','Nam mô A Di Đà Phật',''),true);
assert.equal(hybrid.giftForGuest('user-1','Hoa','Hoa hồng',1,1,''),false);
hybrid.gateChat('user-3','Hương','xin vô','');
hybrid.localDecide('user-3',false);
assert.equal(viewers.size,1);
assert.equal(hybrid.approved.has('user-3'),false);
// Colleagues and TikTok guests require no account, only a real comment + admin review.
hybrid.gateChat('user-5','Mai','xin vo','');hybrid.localDecide('user-5',true,'tiktok');
assert.equal(viewers.get('user-5').group,'tiktok');
assert.equal(viewers.get('user-5').coins,undefined); // gift must not credit the wallet
const externalGift=events.filter(x=>x.event.t==='gift'&&x.event.name==='An')[0]?.event;
assert.ok(externalGift && !Object.hasOwn(externalGift,'coins') && !Object.hasOwn(externalGift,'total'));
hybrid.gateChat('user-4','Thảo','xin vào chùa','');
for(let i=0;i<98;i++)seat('internal:'+i,'Nhân viên '+i,{});
assert.equal(viewers.size,100);
hybrid.localDecide('user-4',true);
assert.equal(viewers.size,100,'Full room must not evict existing real attendees');
assert.equal(hybrid.approved.has('user-4'),false);
console.log('PASS: no-signup xin vô/xin vào, internal/TikTok labels, admin approval/denial, no gift coins, no simulation, 100-capacity no eviction');
