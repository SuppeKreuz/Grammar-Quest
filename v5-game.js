/* Grammar Quest 5.0 - practice modes and German explanations */
(function(){
'use strict';
const e=(id)=>document.getElementById(id);
const card=e('gameCard');
if(!card)return;
const label=document.createElement('div');label.className='v5-mode-label';label.id='v5ModeLabel';e('levelTitle').before(label);
const alt=document.createElement('section');alt.id='v5AltShell';alt.className='v5-alt-shell';alt.hidden=true;e('gameCard').querySelector('.game-controls').before(alt);
const guide=document.createElement('section');guide.id='v5Explanation';guide.className='v5-help';guide.hidden=true;e('feedback').after(guide);
const toggle=document.createElement('div');toggle.className='v5-help-actions';const helpButton=document.createElement('button');helpButton.type='button';helpButton.textContent='💡 Erklärung anzeigen';toggle.append(helpButton);e('feedback').after(toggle);
let activeKey='',activeMode='order',selected=-1,options=[],gapAt=1,gapWord='',helpOpen=false;
let modePreference='mixed';
try{const v=localStorage.getItem('grammar-quest-v5-mode');if(['mixed','order','choice','gap'].includes(v))modePreference=v;}catch(e){/* optional */}
const variantSet={
 am:['is','are','was'],is:['are','am','was'],are:['is','was','were'],was:['were','is','are'],were:['was','are','is'],
 has:['have','had','having'],have:['has','had','having'],had:['has','have','has been'],
 do:['does','did','doing'],does:['do','did','doing'],did:['does','do','done'],
 will:['would','can','should'],would:['will','should','could'],can:['could','must','may'],
 should:['would','can','must'],must:['can','should','might'],could:['can','would','might'],
 been:['be','being','was'],be:['is','are','been'],going:['go','goes','gone'],
 play:['plays','played','playing'],plays:['play','playing','played'],
 watched:['watch','watches','watching'],visited:['visit','visiting','visits']
};
function randomize(arr){const out=arr.slice();for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=out[i];out[i]=out[j];out[j]=t;}return out;}
function cleanWord(word){return word.replace(/[.,!?;:]+$/,'');}
function modeForLevel(){return modePreference==='mixed'?['order','choice','gap'][game().level%3]:modePreference;}
window.GrammarQuestModes={
 get:()=>modePreference,
 set:function(mode){
  if(!['mixed','order','choice','gap'].includes(mode))return;
  modePreference=mode;activeKey='';selected=-1;helpOpen=false;if(store.name){const st=game();st.mistakes=0;st.lastWrong=null;st.mistakeMode=mode;}resetTiles();
  try{localStorage.setItem('grammar-quest-v5-mode',mode);}catch(e){/* optional */}
  if(store.name)renderGame();
 }
};
function buildChoice(sentence){
 const words=sentence.split(' '),results=[sentence];
 for(let i=0;i<110&&results.length<4;i++){
  const arr=words.slice(),a=Math.floor(Math.random()*arr.length),b=(a+1+Math.floor(Math.random()*Math.max(1,arr.length-1)))%arr.length;
  const t=arr[a];arr[a]=arr[b];arr[b]=t;
  const v=arr.join(' ');if(!results.includes(v))results.push(v);
 }
 return randomize(results);
}
function buildGap(sentence){
 const words=sentence.split(' ');
 const auxiliaries=new Set(['am','is','are','was','were','have','has','had','will','would','do','does','did','can','could','should','must','may','might','been','be','going']);
 let idx=words.findIndex(w=>auxiliaries.has(cleanWord(w).toLowerCase()));
 if(idx<0)idx=words.findIndex((w,i)=>i>0&&(/ing$|ed$|es$|s$/i.test(cleanWord(w))));
 if(idx<0)idx=Math.min(1,words.length-1);
 const word=cleanWord(words[idx]),low=word.toLowerCase();
 const pool=(variantSet[low]||[]).slice();
 if(pool.length<3&&/ing$/i.test(word))pool.push(word.slice(0,-3),word+'s',word+'ed');
 if(pool.length<3&&/ed$/i.test(word))pool.push(word.slice(0,-2),word+'s',word+'ing');
 if(pool.length<3&&/s$/i.test(word))pool.push(word.slice(0,-1),word+'ing',word+'ed');
 if(pool.length<3)pool.push(word+'s',word+'ed',word+'ing','was','will','does');
 const opts=[word,...pool.filter(w=>w.toLowerCase()!==low)].filter((w,i,a)=>a.indexOf(w)===i).slice(0,4);
 return {idx,word,options:randomize(opts),prompt:words.map((w,i)=>i===idx?'_______'+w.slice(word.length):w).join(' ')};
}
function key(){return playerKey()+':'+store.grade+':'+game().level+':'+String(game().runId||'legacy');}
function refreshChallenge(){
 const now=key();if(now===activeKey)return;
 activeKey=now;activeMode=modeForLevel();selected=-1;helpOpen=false;
 const sentence=lesson()[1];
 if(activeMode==='choice')options=buildChoice(sentence);
 if(activeMode==='gap'){const g=buildGap(sentence);options=g.options;gapAt=g.idx;gapWord=g.word;}
}
function selectOption(i){
 if(game().solved||game().lives<=0)return;
 selected=i;feedback=null;renderGame();sound('tap');
}
function drawGuide(){
 guide.replaceChildren();const topic=TOPICS[lesson()[0]]||{};
 const heading=document.createElement('strong');heading.textContent='Warum ist das so?';
 const p=document.createElement('p');p.textContent=topic.tip||'Achte auf die Reihenfolge von Subjekt, Verb und Ergänzungen.';
 const st=game();
 if(Number(st.mistakes)>=3&&st.lastWrong){
  const focus=document.createElement('p');focus.className='v7-focused-help';
  if(st.lastWrong.mode==='order')focus.textContent='Hier liegt der Fehler: '+st.lastWrong.chosen+'. An dieser Stelle gehört '+st.lastWrong.expected+'. Achte auf die Satzstellung und versuche es erneut.';
  else if(st.lastWrong.mode==='gap')focus.textContent='Du hast „'+st.lastWrong.chosen+'“ ausgewählt. Hier ist „'+st.lastWrong.expected+'“ richtig. Überprüfe die Verbform oder Zeitform.';
  else focus.textContent='Diese Antwort passt nicht zur englischen Satzstellung. Richtig wäre: '+st.lastWrong.expected+'. Vergleiche Subjekt, Hilfsverb und Hauptverb.';
  guide.append(heading,focus,p);
 }else guide.append(heading,p);
 const code=document.createElement('code');code.textContent=topic.example||lesson()[1];
 guide.append(code);
 guide.hidden=!helpOpen;
 helpButton.textContent=helpOpen?'💡 Erklärung ausblenden':'💡 Erklärung anzeigen';
}
function drawMode(){
 if(!store.name)return;
 refreshChallenge();const st=game(),mode=activeMode;
 card.classList.toggle('v5-mode-alt',mode!=='order');
 label.textContent='✦ MODE: '+(mode==='order'?'WORD ORDER':mode==='choice'?'MULTIPLE CHOICE':'FILL THE GAP');
 alt.hidden=mode==='order';
 if(mode!=='order'){
  alt.replaceChildren();
  const prompt=document.createElement('p');
  prompt.textContent=mode==='choice'?'Choose the sentence with the correct English word order.':'Choose the missing word to complete the sentence.';
  alt.appendChild(prompt);
  if(mode==='gap'){const sentence=document.createElement('div');sentence.className='v5-prompt';const words=lesson()[1].split(' ');sentence.textContent=words.map((w,i)=>i===gapAt?'_______'+w.slice(gapWord.length):w).join(' ');alt.appendChild(sentence);}
  const grid=document.createElement('div');grid.className='v5-options';
  options.forEach((opt,i)=>{
   const btn=document.createElement('button');btn.type='button';btn.className='v5-option';
   btn.textContent=String.fromCharCode(65+i)+'.  '+opt;
   btn.setAttribute('aria-pressed',String(selected===i));
   btn.disabled=st.solved||st.lives<=0;
   btn.addEventListener('click',()=>selectOption(i));grid.appendChild(btn);
  });
  alt.appendChild(grid);
  e('checkButton').disabled=!st.solved&&st.lives>0&&selected<0;
  e('resetButton').disabled=st.solved||st.lives<=0||selected<0;
 }else{
  e('checkButton').disabled=false;
 }
 drawGuide();
}
helpButton.addEventListener('click',()=>{helpOpen=!helpOpen;drawGuide();sound('tap');});
const oldRenderGame=renderGame;
renderGame=function(){oldRenderGame();drawMode();};
const oldTryCheck=tryCheck;
tryCheck=function(){
 if(!store.name)return oldTryCheck();
 const st=game();
 if(e('playView').hidden||modeForLevel()==='order'||st.solved||st.lives<=0){
  const previous=st.lives;oldTryCheck();
  if(st.lives<previous){helpOpen=(Number(st.mistakes)||0)>=3;drawGuide();}
  if(st.solved&&st.lives===previous){helpOpen=false;drawGuide();}
  return;
 }
 refreshChallenge();
 if(selected<0){notice('info','Choose an answer first.');sound('error');return;}
 const chosen=options[selected],right=activeMode==='choice'?lesson()[1]:gapWord;
 if(chosen===right){helpOpen=false;correct();return;}
 selected=-1;recordWrongAttempt(activeMode,chosen,right);helpOpen=(Number(st.mistakes)||0)>=3;drawGuide();
};
e('checkButton').addEventListener('click',event=>{
 if(e('playView').hidden)return;
 event.preventDefault();event.stopImmediatePropagation();tryCheck();
},true);
e('resetButton').addEventListener('click',event=>{
 if(e('playView').hidden||modeForLevel()==='order')return;
 event.preventDefault();event.stopImmediatePropagation();selected=-1;feedback=null;renderGame();sound('tap');
},true);
e('undoButton').addEventListener('click',event=>{
 if(e('playView').hidden||modeForLevel()==='order')return;
 event.preventDefault();event.stopImmediatePropagation();selected=-1;feedback=null;renderGame();sound('tap');
},true);
})();
