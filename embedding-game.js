import {PAPER_ANALOGY} from './embedding-game-data.js?v=20261115-prediction';

const dialog = document.querySelector('#embedding-dialog');
const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const paperUrl = 'https://arxiv.org/pdf/1607.06520';
let choice = null, callbacks = {}, returnFocus = null;

function render() {
  const answered = choice !== null;
  dialog.innerHTML = `<div class="wm-top"><button class="wm-close" type="button" data-wm-close aria-label="Close word game">×</button><span class="wm-count">One question · Historical word model</span></div>
    <div class="wm-body"><div class="wm-kicker">Word embeddings</div><h1 id="embedding-title" tabindex="-1">What did the model predict?</h1>
    <p class="wm-context">In a published 2016 test, researchers used vector arithmetic with a word embedding trained on Google News text. Guess the word it returned for this analogy.</p>
    <div class="wm-paper-grid" aria-label="Man is to ${esc(PAPER_ANALOGY.prompt)} as woman is to what?"><div><span>man is to</span><strong>${esc(PAPER_ANALOGY.prompt)}</strong></div><div><span>woman is to</span><strong>${answered ? esc(choice) : '?'}</strong></div></div>
    <div class="wm-analogy-choices" role="group" aria-label="Choose the word the historical model returned">${PAPER_ANALOGY.choices.map(word => `<button type="button" data-wm-choice="${esc(word)}" class="${choice === word ? 'is-picked' : ''}" ${answered ? 'disabled' : ''}>${esc(word)}</button>`).join('')}</div>
    ${answered ? `<div class="wm-paper-comparison" role="status" tabindex="-1"><div><span>Your guess</span><strong>${esc(choice)}</strong></div><div><span>Published model output</span><strong>${esc(PAPER_ANALOGY.output)}</strong></div></div><div class="wm-paper-explain"><strong>${choice === PAPER_ANALOGY.output ? 'You matched the model’s output.' : 'Your guess differed from the model’s output.'}</strong><p>The output reflects a gender stereotype in that historical embedding, not anyone’s ability or role. Matching it is not a measure of good judgment.</p></div>` : '<p class="wm-paper-prompt">Make your guess to reveal the published output.</p>'}
    <div class="wm-evidence"><span>Learn from the source</span><div class="wm-sources"><a href="${paperUrl}" target="_blank" rel="noopener noreferrer">Bolukbasi et al. (2016) · Debiasing Word Embeddings <span aria-hidden="true">↗</span><span class="visually-hidden"> (opens in a new tab)</span></a></div></div>
    <p class="wm-boundary">This game replays a published example. It does not run the historical model or a current chatbot.</p></div>
    <div class="wm-footer"><p>${answered ? 'One example can reveal a pattern worth questioning.' : 'There is no score for matching a biased output.'}</p>${answered ? '<button class="primary" type="button" data-wm-replay>Play again</button><button class="wm-secondary" type="button" data-wm-close>Back to Fluent</button>' : ''}</div>`;
  dialog.querySelectorAll('[data-wm-close]').forEach(button => button.addEventListener('click', close));
  dialog.querySelectorAll('[data-wm-choice]').forEach(button => button.addEventListener('click', () => {
    if (choice !== null) return;
    choice = button.dataset.wmChoice;
    callbacks.onComplete?.();
    render();
    dialog.querySelector('.wm-paper-comparison')?.focus({preventScroll:true});
  }));
  dialog.querySelector('[data-wm-replay]')?.addEventListener('click', () => {choice = null; render(); focusTitle();});
}

function focusTitle() {dialog.querySelector('#embedding-title')?.focus({preventScroll:true}); dialog.querySelector('.wm-body')?.scrollTo(0, 0);}
function close() {
  if (!dialog.open) return;
  dialog.close(); callbacks.onClose?.();
  const target = returnFocus?.isConnected ? returnFocus : document.querySelector('[data-word-map]');
  target?.focus({preventScroll:true}); returnFocus = null;
}
dialog.addEventListener('cancel', event => {event.preventDefault(); close();});

export function startWordMapGame(options = {}) {
  if (dialog.open) return;
  callbacks = options; choice = null; returnFocus = document.activeElement;
  render(); dialog.showModal(); focusTitle();
}

export function wordMapTeaser(compact = false) {
  return `<section class="word-map-teaser ${compact ? 'is-compact' : ''}" aria-labelledby="word-map-teaser-title${compact ? '-compact' : ''}"><div class="wm-teaser-copy"><div class="wm-kicker">A one-question challenge</div><h2 id="word-map-teaser-title${compact ? '-compact' : ''}">What did the model predict?</h2><p>Guess a historical word model’s output, then see what its answer reveals about bias.</p><button class="small-start" type="button" data-word-map>Play the prediction game <span aria-hidden="true">→</span></button></div><div class="wm-teaser-art" aria-hidden="true"><span>man</span><i></i><span>programmer</span><i></i><span>?</span></div></section>`;
}
