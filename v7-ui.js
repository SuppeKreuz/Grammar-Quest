/* Grammar Quest 7.0 – Ocean Arcade Light app shell.
   Keeps the original grammar engine and all existing modes. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const play=$('playView'),setup=$('setupView');
if(!play||!setup)return;
const hero=$('playView').querySelector('.play-intro'),toolbar=$('v5Toolbar');
if(!hero||!toolbar)return;
const symbol=document.querySelector('.brand-symbol');
if(symbol)symbol.textContent='GQ';
const hud=document.createElement('section');
hud.id='v7Hud';hud.className='v7-hud';hud.setAttribute('aria-label','Current run and personal best');
const createStat=(id,label,extra)=>{
 const section=document.createElement('article');section.className='v7-hud-item'+(extra?' '+extra:'');
 const head=document.createElement('span');head.className='v7-hud-label';head.textContent=label;
 const value=document.createElement('strong');value.id=id;value.className='v7-hud-value';value.textContent='—';
 section.append(head,value);return section;
};
hud.append(
 createStat('v7LevelHud','CURRENT LEVEL'),
 createStat('v7RunHud','RUN SCORE'),
 createStat('v7BestHud','PERSONAL BEST','v7-hud-best'),
 createStat('v7LivesHud','YOUR LIVES','v7-hud-hearts')
);
hero.after(hud);
const mapButton=[...toolbar.querySelectorAll('button')].find(b=>b.textContent.includes('Level map'));
if(mapButton)mapButton.hidden=true; // map is accessible in the bottom tab bar.
const modeSelect=toolbar.querySelector('select');
if(modeSelect){modeSelect.id='v7ModeSelect';modeSelect.setAttribute('aria-label','Choose grammar challenge mode');}
const bottom=document.createElement('nav');bottom.id='v7BottomNav';bottom.setAttribute('aria-label','Grammar Quest app navigation');
const icons={
 home:'<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9M9 21v-7h6v7"/></svg>',
 levels:'<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6.5 9 3l6 3.5L21 3v14.5l-6 3.5-6-3.5L3 21z"/><path d="M9 3v14.5m6-11v14.5"/></svg>',
 ranking:'<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5c0 5-3 8-5 8s-5-3-5-8z"/><path d="M7 6H4v2c0 3 2 5 4 5m9-7h3v2c0 3-2 5-4 5"/></svg>'
};
function navItem(key,label,callback){
 const button=document.createElement('button');button.type='button';button.dataset.v7Tab=key;
 button.setAttribute('aria-label',label);
 button.innerHTML='<span class="v7-nav-icon">'+icons[key]+'</span><span>'+label+'</span>';
 button.addEventListener('click',()=>{
  bottom.querySelectorAll('button').forEach(x=>{x.classList.toggle('active',x===button);if(x===button)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current');});
  callback();
 });
 return button;
}
bottom.append(
 navItem('home','Home',()=>{const d=$('leaderDialog');if(d?.open)d.close();const m=$('v5MapDialog');if(m?.open)m.close();$('gameCard')?.scrollIntoView({behavior:'smooth',block:'start'});}),
 navItem('levels','Levels',()=>{if(mapButton)mapButton.click();else toast('Level map is not available.');}),
 navItem('ranking','Ranking',()=>{if(typeof openBoard==='function')openBoard();})
);
document.body.appendChild(bottom);
bottom.querySelector('[data-v7-tab="home"]').classList.add('active');
bottom.querySelector('[data-v7-tab="home"]').setAttribute('aria-current','page');
function liveHud(){
 const visible=store.name&&!play.hidden;
 if(!visible)return;
 const st=game(),xp=(n)=>Number(n||0).toLocaleString('en-US');
 $('v7LevelHud').textContent=(st.level+1).toLocaleString('en-US');
 $('v7RunHud').textContent=xp(st.score)+' XP';
 $('v7BestHud').textContent=xp(Math.max(st.score,typeof personalBestScore==='function'?personalBestScore():st.score))+' XP';
 $('v7LivesHud').textContent='♥'.repeat(Math.max(0,Math.min(5,st.lives)))+'♡'.repeat(Math.max(0,5-st.lives));
}
function syncPage(){
 const active=!play.hidden;
 document.body.classList.toggle('v7-playing',active);
 if(active)liveHud();
}
const baseRenderAll=renderAll;
renderAll=function(){baseRenderAll();liveHud();syncPage();};
const watch=new MutationObserver(syncPage);
watch.observe(play,{attributes:true,attributeFilter:['hidden']});
watch.observe(setup,{attributes:true,attributeFilter:['hidden']});
$('leaderDialog')?.addEventListener('close',()=>{bottom.querySelector('[data-v7-tab="home"]')?.click();});
$('v5MapDialog')?.addEventListener('close',()=>{bottom.querySelector('[data-v7-tab="home"]')?.classList.add('active');bottom.querySelector('[data-v7-tab="levels"]')?.classList.remove('active');});
syncPage();
if('serviceWorker' in navigator&&location.protocol==='https:'){
 navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(err=>console.warn('App shell unavailable:',err));
}
})();
