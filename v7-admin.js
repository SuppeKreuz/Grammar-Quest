/* Grammar Quest 7.0 – password-protected nickname moderation UI.
   All deletion and blocking is performed by the verified Supabase Edge Function. */
(function(){
'use strict';
const tools=document.getElementById('adminTools');
if(!tools)return;
const section=document.createElement('section');
section.id='v7Moderation';
section.className='v7-moderation';
section.innerHTML='<h3>🛡 Nickname moderation</h3><p>Only you can remove offensive nicknames and block them from being reused. Deleted online scores cannot be restored.</p><label for="v7ModerationName">Nickname</label><div class="v7-mod-actions"><input id="v7ModerationName" class="text-input" maxlength="20" placeholder="Search by nickname" autocomplete="off"><button id="v7ModerationRefresh" type="button" class="btn light">Refresh list</button></div><p id="v7ModerationStatus" role="status"></p><div id="v7ModerationPlayers" class="v7-moderation-list"></div><h4>Blocked names</h4><div id="v7ModerationBlocked" class="v7-moderation-list"></div>';
tools.appendChild(section);
const $=id=>document.getElementById(id);
const status=$('v7ModerationStatus'),playersEl=$('v7ModerationPlayers'),blockedEl=$('v7ModerationBlocked'),field=$('v7ModerationName');
let current={players:[],blocked:[]},busy=false;
function say(message){status.textContent=message;}
async function request(action,extra={}){
 if(!adminUnlocked||!adminOnlinePassphrase||!remoteReady)throw new Error('Unlock the private Admin console first.');
 const response=await fetch(ONLINE_CONFIG.url.replace(/\/$/,'')+'/functions/v1/grammar-admin-score',{
  method:'POST',headers:{apikey:ONLINE_CONFIG.anonKey,'Content-Type':'application/json'},
  body:JSON.stringify({action,passphrase:adminOnlinePassphrase,...extra})
 });
 if(!response.ok)throw new Error(response.status===401?'Admin login expired or incorrect.':'Moderation server returned HTTP '+response.status);
 return response.json();
}
function actionButton(label,handler,kind='light'){
 const button=document.createElement('button');button.type='button';button.className='btn '+kind;
 button.textContent=label;button.addEventListener('click',handler);return button;
}
async function execute(action,person,block){
 if(busy)return;
 const message=action==='moderation-unblock'?'Allow this nickname again?':block?
  'Remove ALL online results for "'+person+'" and permanently block this nickname?':
  'Delete ALL online results for "'+person+'"? This cannot be undone.';
 if(!confirm(message))return;
 busy=true;say('Saving moderation change…');
 try{
  const result=await request(action,{target_name:person,block});
  say(result.message+(typeof result.deleted==='number'?' '+result.deleted+' online entries removed.':''));
  await load();
  if(typeof fetchRemote==='function')await fetchRemote();
 }catch(err){console.warn('Moderator action:',err);say(err.message||'Moderation failed.');}
 finally{busy=false;}
}
function draw(){
 const query=field.value.trim().toLocaleLowerCase('en-US');
 playersEl.replaceChildren();
 const rows=(current.players||[]).filter(p=>String(p.player_name).toLocaleLowerCase('en-US').includes(query));
 if(!rows.length){const text=document.createElement('p');text.textContent='No matching online rankings.';playersEl.appendChild(text);}
 for(const player of rows){
  const row=document.createElement('div');row.className='v7-mod-row';
  const name=document.createElement('strong');name.textContent=player.player_name;
  const detail=document.createElement('span');detail.textContent='Grade '+player.grade+' · '+Number(player.score).toLocaleString('en-US')+' XP';
  const controls=document.createElement('div');controls.className='v7-mod-row-actions';
  controls.append(actionButton('Delete scores',()=>execute('moderation-delete',player.player_name,false)));
  controls.append(actionButton('Delete + block',()=>execute('moderation-delete',player.player_name,true),'purple'));
  row.append(name,detail,controls);playersEl.appendChild(row);
 }
 blockedEl.replaceChildren();
 const blocked=(current.blocked||[]).filter(p=>String(p.display_name).toLocaleLowerCase('en-US').includes(query));
 if(!blocked.length){const text=document.createElement('p');text.textContent='No blocked nicknames.';blockedEl.appendChild(text);}
 for(const blockedName of blocked){
  const row=document.createElement('div');row.className='v7-mod-row';
  const name=document.createElement('strong');name.textContent=blockedName.display_name;
  row.append(name,actionButton('Unblock',()=>execute('moderation-unblock',blockedName.display_name)));
  blockedEl.appendChild(row);
 }
}
async function load(){
 if(!adminUnlocked){say('Admin access is locked.');return;}
 say('Loading online names…');
 try{current=await request('moderation-list');draw();say('Admin moderation ready.');}
 catch(err){console.warn('Moderation list:',err);say(err.message||'Could not load names.');}
}
$('v7ModerationRefresh').addEventListener('click',load);
field.addEventListener('input',draw);
const ban=actionButton('Block this nickname',()=>{const person=field.value.trim();if(person)execute('moderation-delete',person,true);});
ban.id='v7ModerationBlockCustom';ban.classList.add('v7-mod-ban');section.insertBefore(ban,status);
const open=document.createElement('button');open.type='button';open.className='btn light full';open.id='v7OpenModeration';open.textContent='🛡 Moderate online nicknames';
tools.insertBefore(open,section);
section.hidden=true;
open.addEventListener('click',()=>{section.hidden=!section.hidden;if(!section.hidden)load();});
})();
