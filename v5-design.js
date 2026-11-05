/* Grammar Quest 5.0 - automatic readable palettes.
   Keep raw user choices saved, correct unsafe contrast only while rendering. */
(function(){
'use strict';
const $d=(id)=>document.getElementById(id);
function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);}
function luminance(hex){
 const a=rgb(hex).map(v=>v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4));
 return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];
}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}
function blend(a,b,amount){const aa=rgb(a),bb=rgb(b);return '#'+aa.map((v,i)=>Math.round((v*(1-amount)+bb[i]*amount)*255).toString(16).padStart(2,'0')).join('');}
let lastAdjusted=false;
const baseApplyTheme=applyTheme;
applyTheme=function(){
 baseApplyTheme();
 const root=document.documentElement;
 const custom=store.designMode==='custom';
 if(!custom){
  lastAdjusted=false;document.body.classList.remove('v5-high-contrast');
  root.style.setProperty('--v5-on-accent','#ffffff');
  return;
 }
 const raw=store.custom||{};
 const bg=colorValid(raw.bg)?raw.bg:'#edf7ff';
 let surface=colorValid(raw.surface)?raw.surface:'#ffffff';
 let ink=colorValid(raw.ink)?raw.ink:'#18304c';
 let accent=colorValid(raw.accent)?raw.accent:'#3199e9';
 let changed=false;
 if(contrast(surface,bg)<1.30){
  const target=luminance(bg)<0.20?'#ffffff':'#111827';
  for(let amount=0.14;amount<=0.86&&contrast(surface,bg)<1.30;amount+=0.06)surface=blend(bg,target,amount);
  changed=true;
 }
 if(contrast(ink,surface)<4.5){
  ink=['#f8fbff','#152338','#ffffff','#000000'].find(candidate=>contrast(candidate,surface)>=4.5)||'#000000';
  changed=true;
 }
 if(contrast(accent,surface)<3){
  const candidates=luminance(surface)<0.21?['#95dfff','#b8ecff','#ffffff','#112642']:['#2265bd','#174987','#112642','#f4fcff'];
  accent=candidates.find(candidate=>contrast(candidate,surface)>=3)||'#ffffff';
  changed=true;
 }
 const readableMuted=blend(ink,bg,0.15);
 const line=blend(surface,ink,0.18);
 const onAccent=contrast('#ffffff',accent)>=contrast('#122033',accent)?'#ffffff':'#122033';
 const vars={'--white':surface,'--surface':surface,'--ink':ink,'--primary-text':ink,'--soft':readableMuted,'--muted-text':readableMuted,'--accent':accent,'--green':accent,'--line':line,'--surface-line':line,'--v5-on-accent':onAccent,'--v5-ink':ink,'--v5-panel':surface,'--v5-accent':accent};
 for(const [key,value] of Object.entries(vars))root.style.setProperty(key,value);
 root.style.setProperty('--accent-deep',accent);
 root.style.setProperty('--greenDark',accent);
 root.style.setProperty('--accent-pale',blend(bg,accent,0.17));
 root.style.setProperty('--greenPale',blend(bg,accent,0.17));
 document.body.classList.toggle('v5-high-contrast',changed||luminance(bg)<0.22);
 lastAdjusted=changed;
 const hint=$d('v5ContrastHint');
 if(hint)hint.textContent=changed?'Contrast protection is active: dark-on-dark, light-on-light and invisible button colors are adjusted automatically. Your original colors remain saved.':'Contrast protection is active. Your selected colors are readable.';
};
const baseSettings=renderSettings;
renderSettings=function(){
 baseSettings();
 const hint=$d('v5ContrastHint');
 if(hint)hint.textContent=lastAdjusted?'Contrast protection is active: unreadable color combinations are automatically corrected. Your choices remain saved.':'Contrast protection is active. Your theme can always be reset.';
};
const section=$d('customPanel');
if(section){
 const help=document.createElement('p');help.id='v5ContrastHint';help.className='v5-contrast-hint';help.setAttribute('role','status');section.appendChild(help);
}
const settings=$d('settingsDialog');
if(settings){
 const control=document.createElement('button');control.type='button';control.className='v5-reset-emergency';control.textContent='↺ Restore Ocean Splash';
 control.addEventListener('click',function(){store.designMode='presets';store.preset='ocean';persist();applyTheme();renderSettings();toast('Ocean Splash restored.');});
 settings.querySelector('.settings-footnote').before(control);
}
applyTheme();renderSettings();
})();
