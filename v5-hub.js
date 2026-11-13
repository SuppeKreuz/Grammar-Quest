/* Grammar Quest 5.0 – map, coins, cosmetics, badges and leaderboard.
   Extra progress stays in a NEW storage key; existing grade records stay intact. */
(function(){
'use strict';
const $h=id=>document.getElementById(id);
const EXTRA_KEY='grammar-quest-v5-extras';
const COINS_PER_LEVEL=12;
const REWARDS={6:30,13:50,20:80};
const SHOP=[
 {id:'wave',kind:'avatar',name:'Ocean Buddy',art:'🌊',cost:40,description:'A little sea spirit.'},
 {id:'owl',kind:'avatar',name:'Grammar Owl',art:'🦉',cost:60,description:'The wise word watcher.'},
 {id:'fox',kind:'avatar',name:'Clever Fox',art:'🦊',cost:80,description:'Fast thinking, sharp grammar.'},
 {id:'rocket',kind:'avatar',name:'Space Rocket',art:'🚀',cost:100,description:'Ready for liftoff.'},
 {id:'wizard',kind:'avatar',name:'Word Wizard',art:'🧙',cost:140,description:'A legendary word master.'},
 {id:'explorer',kind:'title',name:'Explorer',art:'🧭',cost:35,description:'An adventurer title.'},
 {id:'star',kind:'title',name:'Rising Star',art:'⭐',cost:75,description:'A shining player title.'},
 {id:'champion',kind:'title',name:'Grammar Champion',art:'🏆',cost:160,description:'For a true grammar hero.'},
 {id:'galaxy',kind:'title',name:'Galaxy Brain',art:'🌌',cost:190,description:'An out-of-this-world title.'}
];
const BADGES=[
 {id:'start',name:'First Steps',art:'👣',description:'Complete your first challenge.'},
 {id:'streak',name:'On Fire',art:'🔥',description:'Reach a streak of five correct answers.'},
 {id:'easy',name:'Easy Explorer',art:'🌱',description:'Complete the Easy path in any grade.'},
 {id:'medium',name:'Pathfinder',art:'⚡',description:'Complete the Medium path in any grade.'},
 {id:'hard',name:'Grammar Master',art:'👑',description:'Complete the Hard path in any grade.'},
 {id:'perfect',name:'Perfect Run',art:'💎',description:'Finish a grade with all five lives.'},
 {id:'endless30',name:'Endless Explorer',art:'🌊',description:'Complete 30 levels in one run.'},
 {id:'triple',name:'Triple Crown',art:'🏅',description:'Finish grades 8, 9 and 10.'}
];
let db={players:{}};
try{
 const saved=JSON.parse(localStorage.getItem(EXTRA_KEY)||'null');
 if(saved&&typeof saved==='object'&&saved.players&&typeof saved.players==='object')db=saved;
}catch(e){console.warn('V5 rewards storage unavailable',e);}
function save(){
 try{localStorage.setItem(EXTRA_KEY,JSON.stringify(db));}catch(e){console.warn('Could not save V5 rewards',e);}
}
function currentKey(){return String(store.name||'').toLocaleLowerCase('en-US').trim();}
function wallet(){
 const key=currentKey();if(!key)return null;
 if(!db.players[key]||typeof db.players[key]!=='object')db.players[key]={coins:0,credited:{},owned:[],badges:[],equipped:{avatar:'',title:''}};
 const p=db.players[key];
 if(!Number.isFinite(p.coins)||p.coins<0)p.coins=0;
 if(!p.credited||typeof p.credited!=='object')p.credited={};
 if(!Array.isArray(p.owned))p.owned=[];
 if(!Array.isArray(p.badges))p.badges=[];
 if(!p.equipped||typeof p.equipped!=='object')p.equipped={avatar:'',title:''};
 return p;
}
function completed(st){return Math.max(0,(Number(st.level)||0)+(st.solved?1:0));}
function gradeState(grade){return store.profiles?.[currentKey()]?.[grade]||null;}
function syncRewards(announce){
 const p=wallet();if(!p)return;
 let newCoins=0;
 for(const grade of [8,9,10]){
  const st=gradeState(grade);if(!st||st.assisted)continue;
  const progress=completed(st);
  let credited=Math.max(0,Math.floor(Number(p.credited[grade])||0));
  if(progress>credited){newCoins+=(progress-credited)*COINS_PER_LEVEL;for(const [milestone,reward] of Object.entries(REWARDS))if(+milestone>credited&&+milestone<=progress)newCoins+=reward;}
  p.credited[grade]=Math.max(credited,progress);
 }
 p.coins+=newCoins;
 const records=[8,9,10].map(gradeState).filter(s=>s&&!s.assisted);
 const counts=records.map(completed);
 const conditions={
  start:counts.some(n=>n>=1),
  streak:records.some(s=>(Number(s.bestStreak)||0)>=5),
  easy:counts.some(n=>n>=6),
  medium:counts.some(n=>n>=13),
  hard:counts.some(n=>n>=20),
  perfect:records.some(s=>completed(s)>=20&&s.lives===5),
  endless30:records.some(st=>completed(st)>=30),
  triple:[8,9,10].every(g=>{const st=gradeState(g);return st&&!st.assisted&&completed(st)>=20;})
 };
 const newBadges=[];
 for(const badge of BADGES){
  if(conditions[badge.id]&&!p.badges.includes(badge.id)){p.badges.push(badge.id);newBadges.push(badge.name);}
 }
 save();
 if(announce&&newCoins>0)toast('+'+newCoins+' coins earned! 🪙');
 if(announce&&newBadges.length)window.setTimeout(()=>toast('Badge unlocked: '+newBadges.join(', ')),450);
}
function coinsText(){return (wallet()?.coins||0).toLocaleString('en-US');}
function createDialog(id,title,sub){
 const dialog=document.createElement('dialog');dialog.id=id;dialog.className='v5-dialog';
 const inner=document.createElement('div');inner.className='v5-dialog-inner';
 const head=document.createElement('div');head.className='v5-dialog-head';
 const copy=document.createElement('div');const h=document.createElement('h2');h.textContent=title;
 const p=document.createElement('p');p.textContent=sub;copy.append(h,p);
 const close=document.createElement('button');close.type='button';close.className='v5-dialog-close';close.setAttribute('aria-label','Close');close.textContent='×';close.addEventListener('click',()=>dialog.close());
 head.append(copy,close);inner.appendChild(head);
 const content=document.createElement('div');content.id=id+'Body';inner.appendChild(content);dialog.appendChild(inner);
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 document.body.appendChild(dialog);return dialog;
}
function openDialog(d){
 if(!store.name){toast('Choose your player name first.');return;}
 syncRewards(false);if(!d.open)d.showModal();
}
const mapDialog=createDialog('v5MapDialog','Your adventure map','20 classic levels plus endless grammar challenges');
const shopDialog=null; // Old cosmetics remain in storage but the shop is removed.
const badgeDialog=createDialog('v5BadgeDialog','Achievements & badges','Your personal collection of grammar milestones.');
const toolbar=document.createElement('div');toolbar.className='v5-toolbar';toolbar.id='v5Toolbar';
function barButton(label,action){
 const b=document.createElement('button');b.type='button';b.className='v5-toolbar-button';b.textContent=label;b.addEventListener('click',action);toolbar.appendChild(b);return b;
}
barButton('🗺️ Level map',()=>{drawMap();openDialog(mapDialog);});
// Shop removed from toolbar in version 7.
barButton('🏅 Badges',()=>{drawBadges();openDialog(badgeDialog);});
const modeSelect=document.createElement('select');
modeSelect.className='v5-toolbar-button';modeSelect.setAttribute('aria-label','Challenge mode');
for(const [value,text] of [['mixed','🎲 Mixed modes'],['order','🧩 Word order'],['choice','✅ Multiple choice'],['gap','✏️ Fill the gap']]){
 const option=document.createElement('option');option.value=value;option.textContent=text;modeSelect.appendChild(option);
}
modeSelect.value=window.GrammarQuestModes?.get()||'mixed';
modeSelect.addEventListener('change',()=>{window.GrammarQuestModes?.set(modeSelect.value);toast('Challenge mode changed. Your progress is safe.');});
toolbar.appendChild(modeSelect);
const walletButton=document.createElement('span'); // Hidden compatibility placeholder.
const intro=$h('playView')?.querySelector('.play-intro');
if(intro)intro.after(toolbar);
const preview=document.createElement('section');preview.className='v5-map-preview';preview.id='v5MapPreview';
if(toolbar)toolbar.after(preview);
const onSetup=$h('setupPage2');
if(onSetup){
 const mapLink=document.createElement('button');mapLink.type='button';mapLink.className='btn light';mapLink.textContent='🗺️ Preview level map';
 mapLink.addEventListener('click',()=>{
  if(!draftName||!draftGrade){toast('Choose player and grade first.');return;}
  const oldName=store.name,oldGrade=store.grade;
  // Do not mutate the active player: preview uses a standalone informational panel.
  const note=$h('setupStageNote');note.textContent='Grade '+draftGrade+': 6 Easy → 7 Medium → 7 Hard → ∞ Endless Challenge. Your personal best is safe across new runs.';
  note.scrollIntoView({behavior:'smooth',block:'nearest'});
 });
 onSetup.querySelector('.setup-actions')?.before(mapLink);
}
function drawPreview(){
 if(!store.name)return;
 const st=game(),n=completed(st);
 preview.replaceChildren();
 const top=document.createElement('div');top.className='v5-preview-top';
 const h=document.createElement('strong');h.textContent=n>=20?'🗺️ Grade '+store.grade+' · ∞ Endless Level '+(st.level+1).toLocaleString('en-US'):'🗺️ Grade '+store.grade+' · '+n+' / 20 classic levels';
 const button=document.createElement('button');button.type='button';button.className='v5-toolbar-button';button.textContent='View full map →';button.addEventListener('click',()=>{drawMap();openDialog(mapDialog);});
 top.append(h,button);preview.appendChild(top);
 const track=document.createElement('div');track.className='v5-mini-track';
 const start=n>=20?Math.max(20,st.level-7):0,end=n>=20?st.level+3:20;
 for(let i=start;i<end;i++){
  const dot=document.createElement('span');dot.className='v5-mini-dot'+(i<n?' done':i===n?' current':'');dot.title='Level '+(i+1);track.appendChild(dot);
 }
 preview.appendChild(track);
}
function drawMap(){
 const body=$h('v5MapDialogBody');body.replaceChildren();
 if(!store.name)return;
 const st=game(),progress=completed(st);
 const stats=document.createElement('div');stats.className='v5-map-stats';
 for(const value of ['🎓 Grade '+store.grade,'✅ '+(progress>=20?`${progress.toLocaleString('en-US')} challenges (∞ Endless)`:`${progress} / 20 classic levels`),'🏆 '+personalBestScore().toLocaleString('en-US')+' XP best']){
  const chip=document.createElement('span');chip.className='v5-chip';chip.textContent=value;stats.appendChild(chip);
 }
 body.appendChild(stats);
 const detail=document.createElement('div');detail.className='v5-map-detail';detail.setAttribute('role','status');
 const stages=STAGE_BOUNDS;
 for(const stage of stages){
  const h=document.createElement('h3');h.className='v5-stage-title';h.textContent=stage.icon+' '+stage.name+' · Levels '+(stage.start+1)+'–'+(stage.end+1);
  const grid=document.createElement('div');grid.className='v5-path-grid';
  for(let i=stage.start;i<=stage.end;i++){
   const complete=i<progress,available=i===progress&&progress<20,locked=i>progress||st.lives===0;
   const btn=document.createElement('button');btn.type='button';btn.className='v5-map-level'+(complete?' completed':available?' current':' locked');
   const num=document.createElement('span');num.className='num';num.textContent=complete?'✓':locked?'🔒':String(i+1);
   const cap=document.createElement('span');cap.className='caption';cap.textContent=COURSES[store.grade][i][0].replace(/_/g,' ');
   btn.append(num,cap);
   btn.setAttribute('aria-label','Level '+(i+1)+' '+(complete?'completed':locked?'locked':'available')+' - '+cap.textContent);
   btn.addEventListener('click',()=>{
    detail.replaceChildren();
    const text=document.createElement('span');
    text.textContent='Level '+(i+1)+' · '+cap.textContent+' · '+(complete?'Completed ✓':locked?'Locked 🔒':'Ready to play!');
    detail.appendChild(text);
    if(available&&!locked){
     const go=document.createElement('button');go.type='button';go.className='v5-toolbar-button';go.style.marginLeft='10px';go.textContent='Play this level →';
     go.addEventListener('click',()=>{
      if(st.solved)advanceLevel();
      mapDialog.close();$h('gameCard').scrollIntoView({behavior:'smooth',block:'center'});
     });detail.appendChild(go);
    }
   });
   grid.appendChild(btn);
  }
  body.append(h,grid);
 }
 if(progress>=20){
  const heading=document.createElement('h3');heading.className='v5-stage-title';heading.textContent='∞ Endless Challenge · Every level counts';
  const grid=document.createElement('div');grid.className='v5-path-grid';
  const start=Math.max(20,st.level-5),end=st.level+7;
  for(let i=start;i<end;i++){
   const complete=i<progress,available=i===progress&&st.lives>0,locked=i>progress||st.lives<=0;
   const btn=document.createElement('button');btn.type='button';btn.className='v5-map-level'+(complete?' completed':available?' current':' locked');
   const num=document.createElement('span');num.className='num';num.textContent=complete?'✓':locked?'🔒':String(i+1);
   const cap=document.createElement('span');cap.className='caption';cap.textContent=window.GrammarQuestEndless.lesson(store.grade,i)[0].replace(/_/g,' ');
   btn.append(num,cap);btn.setAttribute('aria-label','Endless level '+(i+1)+' '+(complete?'completed':locked?'locked':'available'));
   btn.addEventListener('click',()=>{
    detail.replaceChildren();const span=document.createElement('span');span.textContent='Level '+(i+1)+' · '+cap.textContent+' · '+(complete?'Completed':locked?'Locked':'Ready to play!');
    detail.appendChild(span);
    if(available){
     const go=document.createElement('button');go.type='button';go.className='v5-toolbar-button';go.style.marginLeft='9px';go.textContent='Play →';
     go.addEventListener('click',()=>{if(st.solved)advanceLevel();mapDialog.close();$h('gameCard').scrollIntoView({behavior:'smooth',block:'center'});});
     detail.appendChild(go);
    }
   });grid.appendChild(btn);
  }
  body.append(heading,grid);
 }
 detail.textContent='Tap a node to see its topic. Complete challenges in order to unlock the next level.';
 body.appendChild(detail);
}
function drawShop(){
 const body=$h('v5ShopDialogBody');body.replaceChildren();
 const p=wallet();if(!p)return;
 const top=document.createElement('div');top.className='v5-section-intro';
 const heading=document.createElement('strong');heading.className='v5-top-note';heading.textContent='🪙 Your balance: '+coinsText()+' coins';
 const hint=document.createElement('small');hint.textContent='12 coins per new level + stage rewards · Saved in this browser';
 top.append(heading,hint);body.appendChild(top);
 const grid=document.createElement('div');grid.className='v5-shop-grid';grid.style.marginTop='18px';
 for(const item of SHOP){
  const card=document.createElement('article');card.className='v5-shop-card';
  const art=document.createElement('span');art.className='art';art.textContent=item.art;
  const name=document.createElement('strong');name.textContent=item.name;
  const desc=document.createElement('small');desc.textContent=item.description;
  const buy=document.createElement('button');buy.type='button';
  const owned=p.owned.includes(item.id),equipped=p.equipped[item.kind]===item.id;
  buy.textContent=equipped?'✓ Equipped':owned?'Equip':item.cost+' coins';
  buy.disabled=equipped||(!owned&&p.coins<item.cost);
  buy.addEventListener('click',()=>{
   if(!p.owned.includes(item.id)){
    if(p.coins<item.cost)return;
    p.coins-=item.cost;p.owned.push(item.id);
   }
   p.equipped[item.kind]=item.id;
   syncRewards(true);save();refreshHud();drawShop();drawBadges();sound('success');
  });
  card.append(art,name,desc,buy);grid.appendChild(card);
 }
 body.appendChild(grid);
}
function drawBadges(){
 const body=$h('v5BadgeDialogBody');body.replaceChildren();
 const p=wallet();if(!p)return;
 const text=document.createElement('p');text.className='v5-ranking-context';text.textContent='Unlocked '+p.badges.length+' of '+BADGES.length+' badges · Badges stay saved on this tablet; no account required.';
 const grid=document.createElement('div');grid.className='v5-badges-grid';
 for(const badge of BADGES){
  const unlocked=p.badges.includes(badge.id);
  const card=document.createElement('article');card.className='v5-badge-card '+(unlocked?'unlocked':'locked');
  const art=document.createElement('span');art.className='art';art.textContent=unlocked?badge.art:'🔒';
  const name=document.createElement('strong');name.textContent=badge.name;
  const desc=document.createElement('small');desc.textContent=badge.description;
  card.append(art,name,desc);grid.appendChild(card);
 }
 body.append(text,grid);
}
function refreshHud(){
 const p=wallet();if(!p)return;
 // No coin counter on the interface.
 const avatar=$h('avatar');if(avatar&&store.name)avatar.textContent=store.name.charAt(0).toUpperCase();
 const oldTitle=$h('v5PlayerTitle');if(oldTitle)oldTitle.remove();
 drawPreview();
 if(mapDialog.open)drawMap();
}
const baseCorrect=correct;
correct=function(auto){
 const st=game(),before=st.solved,p=wallet(),oldCoins=p?.coins||0,oldBadges=p?.badges.length||0;
 baseCorrect(auto);
 if(!before&&st.solved&&!auto&&!st.assisted){
  syncRewards(false);refreshHud();
  if((p?.badges.length||0)>oldBadges)window.setTimeout(()=>toast('New achievement unlocked! 🏅'),600);
 }
};
const baseRenderAll=renderAll;
renderAll=function(){
 baseRenderAll();
 if(store.name){syncRewards(false);refreshHud();}
};
function mountLeaderboard(){
 const dialog=$h('leaderDialog');if(!dialog)return;
 const content=$h('fullLeaderboard');
 const podium=document.createElement('div');podium.id='v5LeaderPodium';podium.className='v5-leader-podium';content.before(podium);
 const myRank=document.createElement('p');myRank.id='v5MyRank';myRank.className='v5-ranking-context';podium.after(myRank);
 const header=dialog.querySelector('.modal-rule-tabs');
 const local=document.createElement('button');local.type='button';local.className='tiny';local.id='v5LocalBoard';local.textContent='📱 Local';
 const online=document.createElement('button');online.type='button';online.className='tiny';online.id='v5OnlineBoard';online.textContent='🌍 Online';online.hidden=!remoteReady;
 local.addEventListener('click',()=>setLeaderMode('local'));
 online.addEventListener('click',()=>setLeaderMode('online'));
 header?.append(local,online);
 const heading=$h('leaderHeading');if(heading)heading.textContent='Leaderboard 2.0 🏆';
}
function refreshPodium(){
 const pod=$h('v5LeaderPodium'),you=$h('v5MyRank');if(!pod||!you)return;
 pod.replaceChildren();
 const rows=getRows(boardGrade);
 for(const i of [1,0,2]){
  const r=rows[i];if(!r)continue;
  const box=document.createElement('div');box.className='v5-podium-item'+(i===0?' first':'');
  const medal=document.createElement('span');medal.className='medal';medal.textContent=['🥇','🥈','🥉'][i];
  const name=document.createElement('strong');name.textContent=r.name;
  const score=document.createElement('span');score.className='points';score.textContent=r.score.toLocaleString('en-US')+' XP';
  box.append(medal,name,score);pod.appendChild(box);
 }
 if(!rows.length){const p=document.createElement('span');p.textContent='Play a level to enter the hall of fame!';pod.appendChild(p);}
 const rank=rows.findIndex(r=>r.name.toLocaleLowerCase('en-US')===currentKey());
 you.textContent='Grade '+boardGrade+' · '+(leaderMode==='online'?'shared online scores':'scores saved on this device')+' · '+(rank>=0?'Your position: #'+(rank+1)+' out of '+rows.length:'Your player has no score on this board yet.');
 const local=$h('v5LocalBoard'),online=$h('v5OnlineBoard');
 if(local)local.classList.toggle('active',leaderMode==='local');
 if(online)online.classList.toggle('active',leaderMode==='online');
}
mountLeaderboard();
const oldFullBoard=renderFullBoard;
renderFullBoard=function(){oldFullBoard();refreshPodium();};
if(store.name){syncRewards(false);renderAll();}
})();
