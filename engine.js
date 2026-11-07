export const freshState=()=>({version:1,xp:0,days:{},awards:[],completed:[],missed:[],seen:[],sessions:{},practiceCount:0});
export function dayKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function streak(days,now=new Date()){let cursor=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12),count=0;if(!days[dayKey(cursor)])cursor.setDate(cursor.getDate()-1);while(days[dayKey(cursor)]){count++;cursor.setDate(cursor.getDate()-1);}return count;}
export function makeSession(lesson,questionIds,review=false){return {lesson,review,stage:review?'question':'intro',intro:0,queue:[...questionIds],original:[...questionIds],index:0,selected:null,checked:false,correct:false,attempted:[],firstCorrect:0,earned:0,finished:false};}
export function award(state,key,points,today=dayKey()){const id=`${today}:${key}`;if(state.awards.includes(id))return 0;state.awards.push(id);state.xp+=points;state.days[today]=(state.days[today]||0)+points;return points;}
export function submitAnswer(state,session,question,selection,today=dayKey()){
  if(session.stage!=='question'||session.checked||!Number.isInteger(selection)||selection<0||selection>=question.options.length)return false;
  if(session.queue[session.index]!==question.id)return false;
  session.selected=selection;session.checked=true;session.correct=selection===question.answer;
  const first=!session.attempted.includes(question.id);
  if(first){session.attempted.push(question.id);if(session.correct)session.firstCorrect++;}
  if(!state.seen.includes(question.term))state.seen.push(question.term);
  if(session.correct){session.earned+=award(state,question.id,10,today);if(session.review)state.missed=state.missed.filter(id=>id!==question.id);}
  else if(!state.missed.includes(question.id))state.missed.push(question.id);
  return true;
}
export function nextQuestion(state,session,today=dayKey()){
  if(!session.checked)return false;
  if(!session.correct)session.queue.push(session.queue[session.index]);
  session.index++;session.selected=null;session.checked=false;session.correct=false;
  if(session.index>=session.queue.length){session.stage='complete';if(!session.finished){if(!session.review&&!state.completed.includes(session.lesson)){state.completed.push(session.lesson);session.earned+=award(state,`lesson-${session.lesson}`,10,today);}session.finished=true;}}
  return true;
}
export function loadState(raw,content){
  const state=freshState();if(!raw)return state;let data;try{data=JSON.parse(raw);}catch{return state;}if(data?.version!==1)return state;
  const qs=new Set(content.lessons.flatMap(l=>l.questions.map(q=>q.id))),ls=new Set(content.lessons.map(l=>l.id)),ts=new Set(content.terms.map(t=>t.id));
  for(const key of ['xp','practiceCount'])if(Number.isSafeInteger(data[key])&&data[key]>=0)state[key]=data[key];
  for(const [key,allowed] of [['completed',ls],['missed',qs],['seen',ts]])if(Array.isArray(data[key]))state[key]=[...new Set(data[key].filter(v=>allowed.has(v)))];
  if(Array.isArray(data.awards))state.awards=[...new Set(data.awards.filter(v=>typeof v==='string'&&v.length<150))];
  if(data.days&&typeof data.days==='object')for(const [key,value] of Object.entries(data.days))if(/^\d{4}-\d{2}-\d{2}$/.test(key)&&Number.isSafeInteger(value)&&value>0)state.days[key]=value;
  if(data.sessions&&typeof data.sessions==='object')for(const [key,s] of Object.entries(data.sessions)){
    if(!ls.has(key)&&key!=='review')continue;
    if(!s||typeof s!=='object'||!['intro','question','complete'].includes(s.stage)||(!ls.has(s.lesson)&&s.lesson!=='review'))continue;
    if(['queue','original','attempted'].some(k=>!Array.isArray(s[k])||s[k].length>2000||s[k].some(id=>!qs.has(id))))continue;
    if(!s.original.length||!Number.isInteger(s.index)||s.index<0||s.index>s.queue.length||!Number.isInteger(s.intro)||s.intro<0||s.intro>3)continue;
    if(s.stage==='question'&&s.index>=s.queue.length)continue;
    if(![null,0,1,2].includes(s.selected)||typeof s.checked!=='boolean'||typeof s.review!=='boolean'||typeof s.correct!=='boolean')continue;
    if(!Number.isSafeInteger(s.firstCorrect)||s.firstCorrect<0||s.firstCorrect>s.original.length||!Number.isSafeInteger(s.earned)||s.earned<0)continue;
    if(key!==s.lesson||s.review!==(key==='review'))continue;
    const lesson=content.lessons.find(l=>l.id===s.lesson);
    if(s.stage==='intro'&&(s.review||!lesson||s.intro>=lesson.terms.length))continue;
    if(!s.review&&s.queue.some(id=>!lesson.questions.some(q=>q.id===id)))continue;
    if(s.checked&&(s.stage!=='question'||s.selected===null))continue;
    state.sessions[key]=s;
  }return state;
}
