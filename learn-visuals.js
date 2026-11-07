const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const brands={
 chatgpt:{name:'ChatGPT',image:'chatgpt-icon.png'},
 gemini:{name:'Gemini',image:'gemini-icon.png'},
 claude:{name:'Claude',image:'claude-wordmark.svg',wordmark:true},
 openai:{name:'OpenAI',image:'openai-wordmark.png',wordmark:true}
};
const brand=id=>{const b=brands[id];return `<span class="lv-brand"><img src="assets/brands/${b.image}" alt="${b.wordmark?b.name:''}" class="${b.wordmark?'wordmark':''}" width="${b.wordmark?110:32}" height="32">${b.wordmark?'':`<span>${b.name}</span>`}</span>`;};
const appExamples=()=>`<div class="lv-brand-examples"><span class="lv-mini-label">App examples</span><div class="lv-brands">${['chatgpt','gemini','claude'].map(brand).join('')}</div></div>`;
const node=(label,title,text,tone='',extra='')=>({label,title,text,tone,extra});
const flow=nodes=>`<ol class="lv-flow">${nodes.map((n,i)=>`<li class="lv-node lv-reveal ${n.tone}" style="--i:${i}"><span class="lv-node-label">${esc(n.label)}</span>${n.extra}<strong>${esc(n.title)}</strong>${n.text?`<p>${esc(n.text)}</p>`:''}</li>`).join('')}</ol>`;
const bubble=(role,text,i)=>`<div class="lv-bubble ${role==='You'?'user':'assistant'} lv-reveal" style="--i:${i}"><span class="lv-bubble-label">${esc(role)}</span><p>${esc(text)}</p></div>`;
const chat=(body)=>`<div class="lv-chat"><div class="lv-chat-header"><span class="lv-mini-label">Illustrative chat</span><span aria-hidden="true">•••</span></div>${body}</div>`;

export const learningScenes={
 ai:{title:'From an image to a prediction',caption:'Image classifiers predict categories for images. A prediction can be wrong.',html:()=>flow([
  node('Input','Example photo','A photo of a dog','lavender'),node('Trained classifier','Use learned patterns','Process the image','dark'),node('Predicted label','Dog','A category for the photo','mint')])},
 genai:{title:'From a request to new content',caption:'In this scenario, the generated poem would be the output.',html:()=>flow([
  node('Request','Write a poem','About a rainy afternoon','lavender'),node('Model','Generate text','Uses learned patterns','dark'),node('New content','“Rain taps the glass…”','A draft you can revise','mint')])+appExamples()},
 model:{title:'Company, model, app',caption:'OpenAI develops GPT models and provides ChatGPT. An app can offer more than one model.',html:()=>`<div class="lv-relationship">${flow([
  node('Organization','','Develops models and products','',brand('openai')),node('Model family','GPT','The trained systems','dark'),node('App','','The product you interact with','',brand('chatgpt'))])}</div><p class="lv-footer-note">These are three different kinds of name.</p>`},
 prompt:{title:'Your request is the prompt',caption:'Your instruction tells the model what you want it to do.',html:()=>chat(
  bubble('You','Suggest three rainy-day activities using things at home.',0)+`<div class="lv-tags lv-reveal" style="--i:1"><span>Task: suggest activities</span><span>Number: three</span></div>`)+appExamples()},
 context:{title:'Add the details that matter',caption:'These details can help with this request. Using context does not itself update the model’s learned parameters.',html:()=>chat(
  bubble('You','Suggest three rainy-day activities.',0)+`<div class="lv-tags lv-reveal" style="--i:1"><span>At home</span><span>One child</span><span>One hour</span></div>`+`<div class="lv-context-summary lv-reveal" style="--i:2"><span class="lv-mini-label">Available context</span><p>The request + the relevant details you supplied</p></div>`)},
 output:{title:'The response is the output',caption:'The returned suggestions would be the output. This example response was written for the lesson.',html:()=>chat(
  bubble('You','Suggest three rainy-day activities at home.',0)+bubble('AI response','1. Make a blanket fort\n2. Draw a shared comic\n3. Have a paper-plane contest',1))+appExamples()},
 llm:{title:'Language in, language out',caption:'An LLM generates a draft from learned language patterns and the information in your request.',html:()=>flow([
  node('Rough notes','A birthday speech','Kind • funny • loves hiking','lavender'),node('Language model','Process + generate','Works with language','dark'),node('Draft','“Happy birthday…”','A speech for you to review','mint')])},
 token:{title:'Text becomes smaller pieces',caption:'Illustrative token boundaries. Actual pieces depend on the tokenizer; a token is not always a whole word.',html:()=>`<div class="lv-token-demo"><p class="lv-mini-label">Example text</p><p class="lv-original lv-reveal" style="--i:0">A playful afternoon.</p><div class="lv-token-divider lv-reveal" style="--i:1" aria-hidden="true">↓</div><div class="lv-tokens" aria-label="Illustrative token pieces"><span class="lv-token lv-reveal" style="--i:2">A</span><span class="lv-token lv-reveal" style="--i:3"> play</span><span class="lv-token lv-reveal" style="--i:4">ful</span><span class="lv-token lv-reveal" style="--i:5"> afternoon</span><span class="lv-token lv-reveal" style="--i:6">.</span></div><p class="lv-footer-note">One word can span more than one piece.</p></div>`},
 'context-window':{title:'A limited working space',caption:'The model can consider a limited amount at once. More capacity does not guarantee that every detail is used correctly.',html:()=>`<div class="lv-context-frame"><span class="lv-mini-label">Information available for a response</span><div class="lv-context-item lv-reveal" style="--i:0"><span>01</span><strong>Instructions</strong></div><div class="lv-context-item lv-reveal" style="--i:1"><span>02</span><strong>Available chat history</strong></div><div class="lv-context-item lv-reveal" style="--i:2"><span>03</span><strong>Travel-guide content supplied to the model</strong></div><div class="lv-context-item lv-reveal" style="--i:3"><span>04</span><strong>Generated response</strong></div><div class="lv-capacity lv-reveal" style="--i:4">Finite token capacity · simplified illustration</div></div>`},
 hallucination:{title:'Plausible words can be wrong',caption:'A made-up title is presented as a real book. Confident wording does not establish truth. Fiction requested as fiction is different.',html:()=>flow([
  node('Asked for a real book','“Read Moonlight Atlas of Teacups.”','An invented recommendation','lavender'),node('Check','The title was invented','Verify the claim','dark'),node('Diagnosis','Hallucination','A fabricated claim','amber')])},
 bias:{title:'Look across the pattern',caption:'In these fictional stories, prompts did not specify gender, but one gender repeatedly gets the lead role. This is a pattern to investigate, not a test of a real model.',html:()=>`<div class="lv-roles">${['Mountain trip','Space mission','Ocean voyage'].map((title,i)=>`<div class="lv-story lv-reveal" style="--i:${i}"><span class="lv-mini-label">${title}</span><div class="lv-role"><span>Leader</span><strong>Man</strong></div><div class="lv-role"><span>Helper</span><strong>Woman</strong></div></div>`).join('')}</div><p class="lv-pattern lv-reveal" style="--i:3">Same role assignment, repeated across stories.</p>`},
 grounding:{title:'Connect the answer to a source',caption:'Compare the answer with the source and check the source itself. Grounding does not guarantee correctness.',html:()=>flow([
  node('Source','Museum visitor guide','Relevant, checkable information','lavender'),node('Model','Use the supplied guide','Connect source and response','dark'),node('Answer','A source-based summary','Check it against the guide','mint')])},
 automation:{title:'A rule can run automatically',caption:'A fixed timer rule can switch a lamp on without an AI model.',html:()=>flow([
  node('Trigger','7:00 p.m.','The scheduled time arrives','lavender'),node('Rule','IF time = 7 p.m.','THEN switch the lamp on','dark'),node('Action','Lamp on','The defined step runs','mint')])},
 augmentation:{title:'AI helps. You shape the result.',caption:'In the AI Fluency framework, this collaboration is augmentation. You contribute preferences, judgment, and edits.',html:()=>flow([
  node('You','Set preferences','A quiet, walkable holiday','lavender'),node('AI','Suggest an itinerary','A starting point','dark'),node('You','Review + revise','Choose what works for you','mint')])},
 agent:{title:'A goal, tools, and permissions',caption:'An agent can choose steps and use tools toward a goal. In this example, the travel app would need to enforce approval before booking.',html:()=>flow([
  node('Your goal','Compare train routes','No booking authorized','lavender'),node('Agent + tool','Search available routes','Choose a search and use a tool','dark'),node('Result','Route comparison','You choose the next step','mint')])+`<p class="lv-permission lv-reveal" style="--i:3"><strong>Example app rule</strong> Approval required before booking.</p>`}
};

export function renderLearningVisual(id){
 const scene=learningScenes[id];if(!scene)return '';
 return `<figure class="learning-visual" aria-labelledby="lv-title-${id}" aria-describedby="lv-caption-${id}"><div class="lv-toolbar"><span class="lv-label">Learning illustration</span><button class="lv-replay" type="button" data-replay-visual aria-label="Replay visual for ${esc(scene.title)}">Replay <span aria-hidden="true">↻</span></button><span class="lv-reduced-label">Static view</span></div><h2 class="lv-title" id="lv-title-${id}">${esc(scene.title)}</h2><div class="lv-stage">${scene.html()}</div><figcaption class="lv-caption" id="lv-caption-${id}">${esc(scene.caption)}<span class="lv-illustration-note">Example created for this lesson · no model was run.</span></figcaption>${scene.source?`<a class="lv-source" href="${esc(scene.source.url)}" target="_blank" rel="noopener noreferrer">${esc(scene.source.label)} ↗</a>`:''}</figure>`;
}

export function bindLearningVisual(root){
 root.querySelectorAll('[data-replay-visual]').forEach(button=>button.addEventListener('click',()=>{
  const stage=button.closest('.learning-visual').querySelector('.lv-stage');
  stage.replaceWith(stage.cloneNode(true));
 }));
}
