const dialog=document.querySelector('#everyday-dialog');
const steps=[
  {title:'Turn a rough thought into a message',short:'Make a message',verb:'Build a draft'},
  {title:'Ask a useful follow-up',short:'Ask a follow-up',verb:'Try a follow-up'},
  {title:'Pull out the important notes',short:'Summarize notes',verb:'Make a summary'},
  {title:'Check before you use an answer',short:'Check an answer',verb:'Check the answer'}
];
const sources={
  prompt:{label:'OpenAI · Prompting best practices',url:'https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices-for-chatgpt',supports:'Clear instructions, relevant context, tone, and refining a response.'},
  followup:{label:'OpenAI · What is ChatGPT?',url:'https://help.openai.com/en/articles/12677804-what-is-chatgpt-faq',supports:'Follow-up questions within a conversation.'},
  summary:{label:'OpenAI · What is ChatGPT?',url:'https://help.openai.com/en/articles/12677804-what-is-chatgpt-faq',supports:'Using an assistant to summarize material you provide.'},
  checking:{label:'OpenAI · Does ChatGPT tell the truth?',url:'https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth',supports:'Checking important claims against reliable sources.'}
};
let game=null,onComplete=()=>0,returnFocus=null;

export function everydayPathHome(completed=false){
  return `<section class="everyday-path-home" aria-labelledby="everyday-home-title"><div class="everyday-home-head"><div><div class="eyebrow">Unit 1 · ${completed?'Practiced':'Start here'}</div><h2 id="everyday-home-title">Try AI in everyday life.</h2><p>Do something useful first. Learn the name for it after.</p></div><span class="everyday-home-status">${completed?'✓ Played':'4 quick moves'}</span></div><ol class="everyday-step-list">${steps.map((step,i)=>`<li><span>${i+1}</span>${step.short}</li>`).join('')}</ol><button class="primary" data-everyday-start>${completed?'Play again':'Start Unit 1'} <span aria-hidden="true">→</span></button><p class="everyday-home-note">Practice scenes are written for this game. No live AI or account needed.</p></section>`;
}

const newGame=()=>({step:0,phase:'play',selected:[],choice:null,error:'',earned:0});
const source=key=>{const item=sources[key];return `<p class="everyday-source"><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.label} ↗</a><span>${item.supports}</span></p>`;};
function focusTitle(){dialog.querySelector('#everyday-title')?.focus({preventScroll:true});dialog.scrollTop=0;}
function close(){dialog.close();game=null;const target=returnFocus?.isConnected?returnFocus:document.querySelector('[data-everyday-start]');target?.focus({preventScroll:true});returnFocus=null;}
function option(label,value){return `<button type="button" class="everyday-option ${game.selected.includes(value)||game.choice===value?'selected':''}" data-everyday-pick="${value}" aria-pressed="${game.selected.includes(value)||game.choice===value}">${label}</button>`;}
function task(){
  if(game.step===0)return `<p class="everyday-prompt">Your rough note</p><blockquote class="everyday-note">“Running 10 late. Café. Battery low. Blue jacket.”</blockquote><p>Pick the <strong>two details</strong> your friend needs in a short message.</p><div class="everyday-options" role="group" aria-label="Details to keep">${option('10 minutes late','late')}${option('Meet at the café','cafe')}${option('Battery is low','battery')}${option('Blue jacket','jacket')}</div>`;
  if(game.step===1)return `<p class="everyday-prompt">Your goal</p><blockquote class="everyday-note">Find a dinner idea I can make in 20 minutes without an oven.</blockquote><div class="everyday-sample"><span>Simulated assistant reply</span><p>“Try a sheet-pan vegetable dinner.”</p></div><p>Which follow-up gives the assistant what it missed?</p><div class="everyday-options" role="group" aria-label="Choose a follow-up">${option('“What can I make in 20 minutes without an oven?”','specific')}${option('“Make it better.”','vague')}${option('“Why did you answer?”','why')}</div>`;
  if(game.step===2)return `<p class="everyday-prompt">Notes from a planning chat</p><div class="everyday-note-list"><p>Sam will reserve the room by Friday.</p><p>The next call is Tuesday at 4 p.m.</p><p>Someone shared a cat video.</p><p>Bring the slides to the next call.</p></div><p>Pick the <strong>two actions</strong> for a short to-do summary.</p><div class="everyday-options" role="group" aria-label="Actions to include">${option('Sam: reserve the room','room')}${option('Next call: Tuesday at 4','call')}${option('Share the cat video','cat')}${option('Bring the slides','slides')}</div>`;
  return `<p class="everyday-prompt">Original note · fictional example</p><blockquote class="everyday-note">“The community center closes at <strong>6 p.m.</strong> on Friday.”</blockquote><div class="everyday-sample"><span>Simulated assistant answer</span><p>“The community center closes at <strong>8 p.m.</strong> on Friday.”</p></div><p>Which detail needs correcting before you rely on the answer?</p><div class="everyday-options" role="group" aria-label="Choose the wrong detail">${option('8 p.m.','time')}${option('Friday','day')}${option('Community center','place')}</div>`;
}
function reveal(){
  const content=[
    {result:'“I’m running about 10 minutes late. Can we meet at the café? Sorry!”',label:'Authored message draft',term:'Prompt',explain:'You gave an assistant a goal and the details to include. That instruction is a prompt. Review and edit the draft before sending it.',key:'prompt'},
    {result:'“Try bean and avocado wraps: fill tortillas with canned beans, avocado, and greens. No oven needed.”',label:'Authored follow-up reply',term:'Follow-up',explain:'A follow-up adds missing context to the same conversation. Here, the time limit and no-oven constraint make the request more specific. You would still judge whether the idea works for you.',key:'followup'},
    {result:'To do: Sam reserves the room by Friday; bring the slides to the next call.',label:'Authored short summary',term:'Summarization',explain:'A summary keeps the points that matter for your purpose. Compare it with the original notes: this to-do list leaves out the next call time, which you may also need.',key:'summary'},
    {result:'“The community center closes at 6 p.m. on Friday.”',label:'Corrected answer from the original note',term:'Verification',explain:'The simulated answer said 8 p.m., but the original note says 6 p.m. Check important details against a source you can inspect; an answer can sound confident and still be wrong.',key:'checking'}
  ][game.step];
  return `<div class="everyday-result"><span>${content.label}</span><p>${content.result}</p></div><div class="everyday-reveal"><span>Now name the move</span><h2>${content.term}</h2><p>${content.explain}</p>${source(content.key)}</div>`;
}
function finish(){return `<div class="everyday-finish"><div class="everyday-finish-mark" aria-hidden="true">✓</div><h1 id="everyday-title" tabindex="-1">Four everyday moves, done.</h1><p>You built a message, asked a better follow-up, pulled actions from notes, and checked a wrong detail.</p><p class="everyday-xp">${game.earned?`+${game.earned} XP earned today`:'You can replay these scenes anytime.'}</p><div class="everyday-finish-terms"><span>Prompt</span><span>Follow-up</span><span>Summary</span><span>Check</span></div><p>These were authored examples. No live assistant made the drafts, and nothing was sent.</p></div>`;}
function render(){
  if(!game)return;
  const done=game.phase==='done',revealed=game.phase==='reveal',step=done?4:game.step;
  dialog.innerHTML=`<div class="lesson-top everyday-top"><button class="close" data-everyday-close aria-label="Close everyday path">×</button><div class="meter" role="progressbar" aria-label="Unit 1 progress" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${step}"><span style="width:${step*25}%"></span></div><span class="step-label">${step}/4</span></div><div class="lesson-body everyday-body">${done?finish():`<div class="eyebrow">Unit 1 · Move ${game.step+1} of 4</div><h1 id="everyday-title" tabindex="-1">${steps[game.step].title}</h1>${revealed?reveal():task()}${game.error?`<div class="everyday-error" role="status" tabindex="-1">${game.error}</div>`:''}`}</div><div class="lesson-footer everyday-footer"><button class="secondary" data-everyday-close>${done?'Close':'Exit'}</button>${done?'<button class="primary" data-everyday-replay>Play again</button>':revealed?`<button class="primary" data-everyday-next>${game.step===3?'Finish Unit 1':'Continue'} →</button>`:`<button class="primary" data-everyday-check ${game.selected.length||game.choice?'':'disabled'}>${steps[game.step].verb} →</button>`}</div>`;
  dialog.querySelectorAll('[data-everyday-close]').forEach(button=>button.addEventListener('click',close));
  dialog.querySelectorAll('[data-everyday-pick]').forEach(button=>button.addEventListener('click',()=>{
    const value=button.dataset.everydayPick;
    if(game.step===0||game.step===2){game.selected=game.selected.includes(value)?game.selected.filter(item=>item!==value):game.selected.length<2?[...game.selected,value]:[game.selected[1],value];}
    else game.choice=value;
    game.error='';render();dialog.querySelector(`[data-everyday-pick="${value}"]`)?.focus({preventScroll:true});
  }));
  dialog.querySelector('[data-everyday-check]')?.addEventListener('click',()=>{
    const correct=game.step===0?game.selected.length===2&&['late','cafe'].every(item=>game.selected.includes(item)):game.step===1?game.choice==='specific':game.step===2?game.selected.length===2&&['room','slides'].every(item=>game.selected.includes(item)):game.choice==='time';
    if(!correct){game.error=game.step===0?'Keep the two details your friend needs to meet you.':game.step===1?'Add the time limit and the no-oven constraint.':game.step===2?'Look for actions someone needs to do, not just meeting information.':'Compare the time in the answer with the original note.';render();dialog.querySelector('.everyday-error')?.focus({preventScroll:true});return;}
    game.phase='reveal';render();focusTitle();
  });
  dialog.querySelector('[data-everyday-next]')?.addEventListener('click',()=>{
    if(game.step===3){game.earned=onComplete();game.phase='done';}
    else{game.step++;game.phase='play';game.selected=[];game.choice=null;game.error='';}
    render();focusTitle();
  });
  dialog.querySelector('[data-everyday-replay]')?.addEventListener('click',()=>{game=newGame();render();focusTitle();});
}
dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
export function startEverydayPath(options={}){if(dialog.open)return;onComplete=options.onComplete||(()=>0);returnFocus=document.activeElement;game=newGame();render();dialog.showModal();focusTitle();}
