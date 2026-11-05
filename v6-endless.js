/* Grammar Quest 6.0: reproducible endless practice after the original 20 levels.
   Generation uses grade and level; no save-file changes or repeated fixed final question. */
(function(){
'use strict';
const words={
  subject:['Emma','Noah','Sofia','Liam','Olivia','Daniel','the new student','my older cousin'],
  person:['the teacher','my best friend','our neighbour','the football captain','the librarian'],
  topic:['the science project','the difficult grammar lesson','the newspaper article','the final presentation','the new assignment','the history report','the challenging exercise','the class discussion','the creative writing task'],
  task:['the homework','the report','the presentation','the assignment','the project','the difficult exercise'],
  day:['yesterday','last Friday','last week','two days ago','during the holidays'],
  place:['at the library','at home','in the classroom','at the sports centre'],
  time:['before lunch','after school','in the evening','at the weekend'],
  future:['tomorrow','next Monday','next weekend','later this week'],
  skill:['a new language','the grammar rules','advanced vocabulary','the piano','this difficult subject'],
  action:['studying for the exam','practising English','working on the report','reading the article']
};
function rng(grade,level){
 let seed=(Math.imul(level+1,1664525)^Math.imul(grade+1,1013904223)^0x91e10da5)>>>0;
 return function(){
  seed=(seed+0x6d2b79f5)>>>0;
  let a=Math.imul(seed^(seed>>>15),seed|1);
  a^=a+Math.imul(a^(a>>>7),a|61);
  return ((a^(a>>>14))>>>0)/4294967296;
 };
}
function lesson(grade,level){
 const random=rng(grade,level);
 const pick=key=>{const values=words[key];return values[Math.floor(random()*values.length)];};
 const entries=[
  ['simple_present',0,()=> 'My friend always reviews '+pick('topic')+' '+pick('time')+'.'],
  ['simple_present',0,()=> 'Does '+pick('person')+' usually study '+pick('place')+'?'],
  ['simple_present',0,()=> 'We often discuss '+pick('topic')+' together '+pick('time')+'.'],
  ['present_progressive',0,()=> 'The students are carefully reviewing '+pick('topic')+' right now.'],
  ['present_progressive',0,()=> pick('subject')+' is currently '+pick('action')+' '+pick('place')+'.'],
  ['present_progressive',0,()=> 'Are they still working on '+pick('topic')+'?'],
  ['simple_past',0,()=> pick('subject')+' finished '+pick('task')+' '+pick('day')+'.'],
  ['simple_past',0,()=> 'Did '+pick('person')+' understand '+pick('topic')+' '+pick('day')+'?'],
  ['simple_past',0,()=> 'They did not finish '+pick('task')+' '+pick('day')+'.'],
  ['going_to',0,()=> 'We are going to practise '+pick('skill')+' '+pick('future')+'.'],
  ['going_to',0,()=> pick('subject')+' is going to explain '+pick('topic')+' '+pick('future')+'.'],
  ['going_to',0,()=> 'Are the students going to discuss '+pick('topic')+' '+pick('future')+'?'],
  ['modal_verbs',1,()=> 'You should read '+pick('topic')+' carefully before the test.'],
  ['modal_verbs',1,()=> 'The students must finish '+pick('task')+' before they can leave.'],
  ['modal_verbs',1,()=> 'Could '+pick('person')+' help us understand '+pick('topic')+'?'],
  ['past_progressive',1,()=> 'I was studying '+pick('topic')+' when '+pick('subject')+' arrived.'],
  ['past_progressive',1,()=> 'While we were working, '+pick('person')+' answered the questions.'],
  ['present_perfect',1,()=> pick('subject')+' has already completed '+pick('task')+'.'],
  ['present_perfect',1,()=> 'We have never studied '+pick('topic')+' before.'],
  ['present_perfect',1,()=> 'Have you already discussed '+pick('topic')+' in class?'],
  ['first_conditional',1,()=> 'If you practise regularly, you will understand '+pick('topic')+'.'],
  ['first_conditional',1,()=> 'We will finish '+pick('task')+' if everybody helps.'],
  ['comparisons',1,()=> 'This task is more challenging than '+pick('topic')+'.'],
  ['comparisons',1,()=> 'Why is '+pick('topic')+' more interesting than the others?'],
  ['past_perfect',2,()=> 'By the time '+pick('subject')+' arrived, we had already finished '+pick('task')+'.'],
  ['past_perfect',2,()=> 'They had never discussed '+pick('topic')+' before the lesson started.'],
  ['passive_voice',2,()=> 'The results of '+pick('topic')+' were published '+pick('day')+'.'],
  ['passive_voice',2,()=> 'All the questions about '+pick('topic')+' have been answered.'],
  ['reported_speech',2,()=> pick('subject')+' explained that the students had completed '+pick('task')+'.'],
  ['reported_speech',2,()=> 'The teacher said that '+pick('topic')+' would be discussed later.'],
  ['second_conditional',2,()=> 'If I had more time, I would learn '+pick('skill')+'.'],
  ['second_conditional',2,()=> 'If '+pick('person')+' knew the answer, everybody would understand.'],
  ['relative_clauses',2,()=> 'The student who explained '+pick('topic')+' received an award.'],
  ['relative_clauses',2,()=> 'This is the book that '+pick('subject')+' recommended '+pick('day')+'.'],
  ['third_conditional',3,()=> 'If they had reviewed '+pick('topic')+', they would have passed the exam.'],
  ['third_conditional',3,()=> 'If '+pick('subject')+' had arrived earlier, the group would have started on time.'],
  ['passive_voice',3,()=> 'The report would have been completed if everybody had helped.'],
  ['past_perfect',3,()=> 'Although the lesson had already started, '+pick('subject')+' decided to join the group.'],
  ['reported_speech',3,()=> 'The teacher explained that the students would have succeeded if they had prepared.'],
  ['relative_clauses',3,()=> 'The student whose presentation impressed the teachers won the competition.']
 ];
 const progress=Math.max(0,level-20);
 const gradeOffset=grade===8?0:grade===9?1:2;
 const maxTier=Math.min(3,Math.floor(progress/30)+gradeOffset);
 const minTier=Math.max(gradeOffset===2?1:0,maxTier-2); // Keep advanced material challenging while revisiting important earlier grammar.
 const pool=entries.filter(e=>e[1]>=minTier&&e[1]<=maxTier);
 const slot=(Math.floor(level*7+random()*pool.length))%pool.length;
 const chosen=pool[slot];
 const sentence=chosen[2]();
 const endings=[
  '', ' in our English classroom', ' during the school project',
  ' after the school assembly', ' before the next lesson',
  ' for the class presentation', ' as part of our homework',
  ' during an afternoon study session', ' with the rest of the group',
  ' at the school library', ' in the science club',
  ' during our weekly workshop', ' after an extra practice session',
  ' for the upcoming examination', ' as part of a team activity',
  ' before the final bell', ' during the language course'
 ];
 // More combinations reduce repeats during long runs while keeping grammar intact.
 const ending=endings[Math.floor(random()*endings.length)];
 const expanded=sentence.slice(0,-1)+ending+sentence.slice(-1);
 return [chosen[0],expanded[0].toUpperCase()+expanded.slice(1)];
}
window.GrammarQuestEndless={lesson,firstLevels:20,version:1};
})();