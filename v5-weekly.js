/* Grammar Quest 5.0 – last seven days leaderboard filter */
(function(){
'use strict';
const $w=id=>document.getElementById(id);
const row=$w('leaderDialog')?.querySelector('.modal-rule-tabs');
if(!row)return;
let weekly=false,weeklyRemote=[];
const weekButton=document.createElement('button');weekButton.className='tiny';weekButton.type='button';weekButton.textContent='📅 Last 7 days';weekButton.setAttribute('aria-pressed','false');
row.appendChild(weekButton);
const originalGetRows=getRows;
getRows=function(grade){
 if(!weekly)return originalGetRows(grade);
 const cutoff=Date.now()-7*86400000;
 const source=leaderMode==='online'?weeklyRemote:Object.values(store.records).filter(r=>r.updatedAt&&Date.parse(r.updatedAt)>=cutoff);
 return rankRecords(source).filter(r=>r.grade===grade);
};
async function fetchWeek(){
 if(!remoteReady)return;
 try{
  const cutoff=new Date(Date.now()-7*86400000).toISOString();
  const url=ONLINE_CONFIG.url.replace(/\/$/,'')+'/rest/v1/grammar_scores?select=player_name,grade,score,levels_completed,best_streak,played_at&played_at=gte.'+encodeURIComponent(cutoff)+'&order=score.desc&limit=500';
  const response=await fetch(url,{headers:{'apikey':ONLINE_CONFIG.anonKey}});
  if(!response.ok)throw new Error('HTTP '+response.status);
  weeklyRemote=(await response.json()).map(r=>({...r,name:r.player_name,completed:r.levels_completed}));
  renderLeaderboard();renderFullBoard();
 }catch(error){console.warn('Weekly board error',error);toast('Could not load weekly scores.');}
}
const oldFetchRemote=fetchRemote;
fetchRemote=async function(){await oldFetchRemote();if(weekly&&leaderMode==='online')await fetchWeek();};
weekButton.addEventListener('click',()=>{
 weekly=!weekly;
 weekButton.classList.toggle('active',weekly);
 weekButton.setAttribute('aria-pressed',String(weekly));
 weekButton.textContent=weekly?'📅 This week ✓':'📅 Last 7 days';
 if(weekly&&leaderMode==='online')fetchWeek();else {renderLeaderboard();renderFullBoard();}
});
const oldRenderFull=renderFullBoard;
renderFullBoard=function(){
 oldRenderFull();
 const hint=$w('v5MyRank');
 if(weekly&&hint)hint.textContent+=' · Last 7 days (up to 500 entries)';
};
})();
