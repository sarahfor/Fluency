const dialog=document.querySelector('#voice-game-dialog');

const tools={
  dictation:{name:'Dictation',cue:'Speak into a message or document',explanation:'Dictation turns your speech into editable text where you are writing. Read it before you send it.',source:'Wispr Flow explains dictation',url:'https://docs.wisprflow.ai/articles/2772472373-what-is-flow'},
  transcription:{name:'Transcription',cue:'Turn a recording into written words',explanation:'Transcription turns recorded speech into text. You can then check the words and turn them into notes.',source:'OpenAI explains transcription',url:'https://developers.openai.com/api/docs/guides/transcription'},
  conversation:{name:'Voice conversation',cue:'Talk with an assistant',explanation:'A voice conversation lets you ask aloud, hear an answer, and ask follow-up questions.',source:'Google explains Gemini Live',url:'https://support.google.com/gemini/answer/15274899'}
};

const rounds=[
  {situation:'Your hands are full. You want to speak a message and have the words appear in the message box.',answer:'dictation',order:['conversation','dictation','transcription']},
  {situation:'You have a recording of a class or meeting. You want written words you can review and turn into notes.',answer:'transcription',order:['transcription','conversation','dictation']},
  {situation:'You want to ask an AI a question aloud, hear its answer, and ask a follow-up.',answer:'conversation',order:['dictation','transcription','conversation']}
];

let game=null,onComplete=()=>0,returnFocus=null;

export function voiceGameTeaser(){
  return `<section class="voice-game-teaser" aria-labelledby="voice-teaser-title"><div><div class="eyebrow">Everyday AI · A quick game</div><h2 id="voice-teaser-title">Speak, then what?</h2><p>Pick a voice tool for three familiar tasks. Catch one mistake before you send.</p><button class="small-start" data-voice-game>Play the voice game <span aria-hidden="true">→</span></button></div><div class="voice-teaser-art" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div></section>`;
}

function newGame(){return {round:0,stage:'choose',choice:null,solved:false,replacement:null,repairError:false,earned:0};}

function focusTitle(){dialog.querySelector('#voice-game-title')?.focus({preventScroll:true});dialog.querySelector('.voice-game-body').scrollTop=0;}

function closeGame(){
  dialog.close();game=null;
  const target=returnFocus?.isConnected?returnFocus:document.querySelector('[data-voice-game]');
  target?.focus({preventScroll:true});returnFocus=null;
}

function choiceScreen(){
  const round=rounds[game.round],chosen=game.choice,correct=game.solved;
  return `<div class="eyebrow">Voice tools · ${game.round+1} of 3</div><h1 id="voice-game-title" tabindex="-1">Where should your voice go?</h1><div class="voice-situation"><span>Imagine this</span><p>${round.situation}</p></div><div class="voice-choices" role="group" aria-labelledby="voice-game-title">${round.order.map(id=>`<button class="voice-choice ${chosen===id?(correct?'right':'wrong'):''}" data-voice-choice="${id}" aria-pressed="${chosen===id}" ${correct?'disabled':''}><strong>${tools[id].name}</strong><span>${tools[id].cue}</span></button>`).join('')}</div>${chosen?`<div class="voice-feedback ${correct?'right':'retry'}" role="status" tabindex="-1"><strong>${correct?'That fits.':'Try another tool.'}</strong><p>${correct?tools[chosen].explanation:`${tools[chosen].name} is for: ${tools[chosen].cue.toLowerCase()}.`}</p>${correct?`<a href="${tools[chosen].url}" target="_blank" rel="noopener noreferrer">${tools[chosen].source} ↗</a>`:''}</div>`:''}`;
}

function repairScreen(){
  const selected=game.replacement;
  return `<div class="eyebrow">One last move · Check before sending</div><h1 id="voice-game-title" tabindex="-1">Did it hear the name right?</h1><p class="voice-instruction">A dictation app put your words into a message. One name came through incorrectly.</p><div class="voice-recording"><div class="voice-recording-head"><span class="voice-mic" aria-hidden="true">◖))</span><strong>Simulated recording</strong><span>0:04</span></div><p><span>What you said</span>“Can you send the photos to <strong>Maya</strong> tonight?”</p></div><div class="voice-draft"><span>Message draft</span><p>Can you send the photos to <strong class="voice-error-word">${selected||'Mara'}</strong> tonight?</p></div><fieldset class="voice-replacements"><legend>Replace the name</legend><div>${['Maya','Maria','Mara'].map(name=>`<button type="button" class="voice-replacement ${selected===name?'selected':''}" data-voice-replacement="${name}" aria-pressed="${selected===name}">${name}</button>`).join('')}</div></fieldset>${game.repairError?'<div class="voice-feedback retry" role="status" tabindex="-1"><strong>Check the recording cue.</strong><p>The person’s name is Maya. Fix it before you send.</p></div>':''}<p class="voice-simulation-note">Practice only. No message is actually sent.</p>`;
}

function resultScreen(){
  return `<div class="voice-finish"><div class="voice-finish-mark" aria-hidden="true">✓</div><div class="eyebrow">Voice game complete</div><h1 id="voice-game-title" tabindex="-1">You caught it before sending.</h1><p>You chose a voice tool for three jobs and corrected a name in a dictated message.</p><p class="voice-xp">${game.earned?`+${game.earned} XP for today`:'You can replay whenever you like.'}</p><div class="voice-takeaway"><h2>Keep the three jobs straight</h2><ul><li><strong>Dictation:</strong> speech becomes text you can edit.</li><li><strong>Transcription:</strong> a recording becomes written words.</li><li><strong>Voice conversation:</strong> you speak with an assistant and hear a response.</li></ul></div><details class="voice-sources"><summary>Real examples and sources</summary><p><a href="https://docs.wisprflow.ai/articles/2772472373-what-is-flow" target="_blank" rel="noopener noreferrer">Wispr Flow</a> is a dictation app. <a href="https://developers.openai.com/api/docs/guides/transcription" target="_blank" rel="noopener noreferrer">OpenAI’s transcription guide</a> explains speech-to-text workflows. <a href="https://support.google.com/gemini/answer/15274899" target="_blank" rel="noopener noreferrer">Gemini Live</a> is a voice conversation experience. These are product examples, not endorsements. The scenes and recording above are authored simulations.</p></details></div>`;
}

function render(){
  if(!game)return;
  const done=game.stage==='done',repair=game.stage==='repair',step=done?4:repair?3:game.round;
  dialog.innerHTML=`<div class="lesson-top voice-game-top"><button class="close" data-voice-close aria-label="Close voice game">×</button><div class="meter" role="progressbar" aria-label="Voice game progress" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${step}"><span style="width:${step*25}%"></span></div><span class="step-label">${step}/4</span></div><div class="lesson-body voice-game-body"><div class="voice-mobile-top"><button class="close" data-voice-close aria-label="Close voice game">×</button><span>Voice game · ${step}/4</span></div>${done?resultScreen():repair?repairScreen():choiceScreen()}</div><div class="lesson-footer voice-game-footer"><p class="footer-note">${done?'A little practice goes a long way.':repair?'Check the name before you send.':game.solved?'Connection made.':'Choose the tool that fits.'}</p>${done?'<button class="primary" data-voice-replay>Play again</button><button class="secondary" data-voice-close>Close</button>':repair?`<button class="secondary voice-mobile-exit" data-voice-close>Exit</button><button class="primary" data-voice-send ${game.replacement?'':'disabled'}>Send message →</button>`:`<button class="secondary voice-mobile-exit" data-voice-close>Exit</button><button class="primary" data-voice-next ${game.solved?'':'disabled'}>${game.round===2?'Check the message':'Continue'} →</button>`}</div>`;
  dialog.querySelectorAll('[data-voice-close]').forEach(button=>button.addEventListener('click',closeGame));
  dialog.querySelectorAll('[data-voice-choice]').forEach(button=>button.addEventListener('click',()=>{
    if(game.solved)return;
    game.choice=button.dataset.voiceChoice;game.solved=game.choice===rounds[game.round].answer;
    render();dialog.querySelector('.voice-feedback')?.focus({preventScroll:true});
  }));
  dialog.querySelector('[data-voice-next]')?.addEventListener('click',()=>{
    if(!game.solved)return;
    game.round++;game.choice=null;game.solved=false;if(game.round===rounds.length)game.stage='repair';
    render();focusTitle();
  });
  dialog.querySelectorAll('[data-voice-replacement]').forEach(button=>button.addEventListener('click',()=>{
    game.replacement=button.dataset.voiceReplacement;game.repairError=false;render();
    dialog.querySelector(`[data-voice-replacement="${game.replacement}"]`)?.focus({preventScroll:true});
  }));
  dialog.querySelector('[data-voice-send]')?.addEventListener('click',()=>{
    if(game.replacement!=='Maya'){
      game.repairError=true;render();dialog.querySelector('.voice-feedback')?.focus({preventScroll:true});return;
    }
    game.earned=onComplete();game.stage='done';render();focusTitle();
  });
  dialog.querySelector('[data-voice-replay]')?.addEventListener('click',()=>{game=newGame();render();focusTitle();});
}

dialog.addEventListener('cancel',event=>{event.preventDefault();closeGame();});

export function startVoiceGame(options={}){
  if(dialog.open)return;
  onComplete=options.onComplete||(()=>0);returnFocus=document.activeElement;game=newGame();render();dialog.showModal();focusTitle();
}
