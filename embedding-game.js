import {PAPER_ANALOGIES} from './embedding-game-data.js?v=20261115-ten-rounds';

const dialog = document.querySelector('#embedding-dialog');
const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const paperUrl = 'https://arxiv.org/pdf/1607.06520';
let round = 0, choice = null, choices = [], callbacks = {}, returnFocus = null, finished = false;

function header() {
  const progress = round === PAPER_ANALOGIES.length ? round : round + Number(choice !== null);
  return `<div class="wm-top"><button class="wm-close" type="button" data-wm-close aria-label="Close prediction game">×</button><div class="wm-meter" role="progressbar" aria-label="Prediction game progress" aria-valuemin="0" aria-valuemax="${PAPER_ANALOGIES.length}" aria-valuenow="${progress}"><span style="width:${progress / PAPER_ANALOGIES.length * 100}%"></span></div><span class="wm-count">${round === PAPER_ANALOGIES.length ? '10 / 10' : `${round + 1} / ${PAPER_ANALOGIES.length}`}</span></div>`;
}

function sourceLink(item) {
  return `<div class="wm-evidence"><span>Published example · ${esc(item.sourcePart)}</span><div class="wm-sources"><a href="${paperUrl}${item.page ? `#page=${item.page}` : ''}" target="_blank" rel="noopener noreferrer">Bolukbasi et al. (2016) · Debiasing Word Embeddings <span aria-hidden="true">↗</span><span class="visually-hidden"> (opens in a new tab)</span></a></div></div>`;
}

function questionView() {
  const item = PAPER_ANALOGIES[round], answered = choice !== null;
  const tier = round < 4 ? 'Warm-up' : round < 7 ? 'Patterns' : 'Challenge';
  const context = round === 0 ? 'A 2016 study examined a word model trained on Google News text. Guess the word in this published analogy, then compare it with your choice.' : 'Which word appeared in the paper’s model-generated pairing?';
  const reveal = answered ? `<div class="wm-paper-comparison" role="status" tabindex="-1"><div><span>Your guess</span><strong>${esc(choice)}</strong></div><div><span>Published pairing</span><strong>${esc(item.output)}</strong></div></div><div class="wm-paper-explain"><strong>${choice === item.output ? 'You matched the published pairing.' : 'Your guess differed from the published pairing.'}</strong><p>${esc(item.note)}</p>${item.kind === 'stereotype' ? '<p>This is a model association, not a fact about people.</p>' : ''}</div>` : '<p class="wm-paper-prompt">Choose the word you think appeared in the paper’s model example.</p>';
  return `<div class="wm-body"><div class="wm-kicker">${tier} · Round ${round + 1} of ${PAPER_ANALOGIES.length}</div><h1 id="embedding-title" tabindex="-1">What did the model predict?</h1><p class="wm-context">${context}</p><div class="wm-paper-grid" aria-label="${esc(item.left)} is to ${esc(item.given)} as ${esc(item.right)} is to what?"><div><span>${esc(item.left)} is to</span><strong>${esc(item.given)}</strong></div><div><span>${esc(item.right)} is to</span><strong>${answered ? esc(choice) : '?'}</strong></div></div><div class="wm-analogy-choices ${item.choices.length > 3 ? 'is-many' : ''}" role="group" aria-label="Choose the published pairing">${item.choices.map(word => `<button type="button" data-wm-choice="${esc(word)}" class="${choice === word ? 'is-picked' : ''}" ${answered ? 'disabled' : ''}>${esc(word)}</button>`).join('')}</div>${reveal}${sourceLink(item)}<p class="wm-boundary">Published historical examples; choices and difficulty order are written for this game. No model runs here.</p></div><div class="wm-footer"><p>${answered ? 'Matching a stereotype is not a measure of good judgment.' : 'Guess the model’s association, not what ought to be true.'}</p>${answered ? `<button class="primary" type="button" data-wm-next>${round === PAPER_ANALOGIES.length - 1 ? 'See the pattern →' : 'Next match →'}</button>` : ''}</div>`;
}

function finishView() {
  const matched = choices.reduce((sum, answer, index) => sum + Number(answer === PAPER_ANALOGIES[index].output), 0);
  return `<div class="wm-body wm-finish"><div class="wm-kicker">10 of 10 · Complete</div><div class="wm-finish-mark" aria-hidden="true">✓</div><h1 id="embedding-title" tabindex="-1">You saw the pattern.</h1><p>Your guesses matched ${matched} of 10 published pairings. Matching the model was never the goal: several of its associations reflected stereotypes.</p><div class="wm-finish-steps"><span>First: gendered words</span><span>Then: social stereotypes</span></div><p class="wm-boundary">This historical result does not describe everyone, every word embedding, or today’s chatbots.</p>${sourceLink({sourcePart:'Full paper'})}</div><div class="wm-footer"><button class="wm-secondary" type="button" data-wm-replay>Play again</button><button class="primary" type="button" data-wm-close>Back to Fluent</button></div>`;
}

function render() {
  dialog.innerHTML = header() + (round === PAPER_ANALOGIES.length ? finishView() : questionView());
  dialog.querySelectorAll('[data-wm-close]').forEach(button => button.addEventListener('click', close));
  dialog.querySelectorAll('[data-wm-choice]').forEach(button => button.addEventListener('click', () => {
    if (choice !== null) return;
    choice = button.dataset.wmChoice;
    choices[round] = choice;
    if (round === PAPER_ANALOGIES.length - 1 && !finished) {finished = true; callbacks.onComplete?.();}
    render(); dialog.querySelector('.wm-paper-comparison')?.focus({preventScroll:true});
  }));
  dialog.querySelector('[data-wm-next]')?.addEventListener('click', () => {round++; choice = null; render(); focusTitle();});
  dialog.querySelector('[data-wm-replay]')?.addEventListener('click', () => {reset(); render(); focusTitle();});
}

function reset() {round = 0; choice = null; choices = []; finished = false;}
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
  callbacks = options; reset(); returnFocus = document.activeElement;
  render(); dialog.showModal(); focusTitle();
}

export function wordMapTeaser(compact = false) {
  return `<section class="word-map-teaser ${compact ? 'is-compact' : ''}" aria-labelledby="word-map-teaser-title${compact ? '-compact' : ''}"><div class="wm-teaser-copy"><div class="wm-kicker">10 matching rounds</div><h2 id="word-map-teaser-title${compact ? '-compact' : ''}">What did the model predict?</h2><p>Start with familiar word pairs. Then see how a historical model linked jobs and activities to gender.</p><button class="small-start" type="button" data-word-map>Play the prediction game <span aria-hidden="true">→</span></button></div><div class="wm-teaser-art" aria-hidden="true"><span>words</span><i></i><span>pairs</span><i></i><span>patterns</span></div></section>`;
}
