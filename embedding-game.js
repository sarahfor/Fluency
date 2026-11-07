import {
  CONTEXT_WORDS, TARGET_WORDS, MINI_CORPUS, CHANGED_CORPUS, EXPECTED_PAIRS,
  NEXT_WORD_EXAMPLES, NEXT_WORD_PROMPTS, NEXT_WORD_CHOICES,
  contextVector, cosineSimilarity, pairKey, continuationCounts
} from './embedding-game-data.js?v=20261107-shift';

const dialog = document.querySelector('#embedding-dialog');
const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const sources = {
  embeddings: {label:'Google · Embedding space and static embeddings',url:'https://developers.google.com/machine-learning/crash-course/embeddings/embedding-space'},
  paper: {label:'Bolukbasi et al. · 2016 study',url:'https://arxiv.org/pdf/1607.06520'},
  tokens: {label:'Google · Tokens and language models',url:'https://developers.google.com/machine-learning/crash-course/llm'},
  tokenizer: {label:'OpenAI · Tokenizer explainer',url:'https://platform.openai.com/tokenizer'}
};
let stage = 'map', trained = false, shifted = false, selectedWord = null, comparison = null;
let foundPairs = new Set(), paperRevealed = false, promptIndex = 0, prediction = null;
let earned = 0, finished = false, callbacks = {};

function sourceLinks(items) {
  return `<div class="wm-evidence"><span>Learn from the source</span><div class="wm-sources">${items.map(item => `<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.label)} <span aria-hidden="true">↗</span><span class="visually-hidden"> (opens in a new tab)</span></a>`).join('')}</div></div>`;
}

function header() {
  const progress = stage === 'map' ? 0 : stage === 'paper' ? 1 : stage === 'predict' ? 2 + promptIndex : 4;
  return `<div class="wm-top"><button class="wm-close" type="button" data-wm-close aria-label="Close word game">×</button><div class="wm-meter" role="progressbar" aria-label="Word game progress" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${progress}"><span style="width:${progress * 25}%"></span></div><span class="wm-count">${stage === 'complete' ? '4 / 4' : `${progress + 1} of 4`}</span></div>`;
}

function corpus() {
  const examples = shifted ? CHANGED_CORPUS : MINI_CORPUS;
  return `<details class="wm-corpus" ${trained ? '' : 'open'}><summary>Our tiny training text <span>${shifted ? '1 sentence changed' : '8 invented sentences'}</span></summary><ul>${examples.map(item => `<li>${esc(item.sentence)}</li>`).join('')}</ul></details>`;
}

function wordCard(word) {
  const vector = contextVector(word, shifted ? CHANGED_CORPUS : MINI_CORPUS);
  const found = !shifted && EXPECTED_PAIRS.some(pair => foundPairs.has(pairKey(...pair)) && pair.includes(word));
  return `<button class="wm-word ${selectedWord === word ? 'is-selected' : ''} ${found ? 'is-found' : ''}" type="button" data-wm-word="${esc(word)}" aria-pressed="${selectedWord === word}" ${shifted ? 'disabled' : ''}><strong>${esc(word)}</strong><span class="wm-vector" aria-label="Context count vector: ${CONTEXT_WORDS.map((context, index) => `${context} ${vector[index]}`).join(', ')}">${CONTEXT_WORDS.map((context, index) => `<span class="${vector[index] ? 'has-count' : ''}"><small>${esc(context)}</small><b>${vector[index]}</b></span>`).join('')}</span></button>`;
}

function mapView() {
  const allFound = foundPairs.size === EXPECTED_PAIRS.length;
  const vectorCards = trained ? `
    <div class="wm-lesson-note"><strong>What we built</strong><p>We counted which action follows each word. Each four-number row is a <em>toy context vector</em>. Real word2vec learns dense embeddings from much more text; these counts are a stepping stone, not its output.</p></div>
    <h2 class="wm-action-title" id="wm-words-heading" tabindex="-1">${shifted ? 'One sentence changed the vectors.' : 'Tap two words to compare them.'}</h2>
    <div class="wm-word-grid">${TARGET_WORDS.map(wordCard).join('')}</div>
    <div class="wm-discoveries" aria-label="${shifted ? 'Original connections' : 'Connections found'}">${EXPECTED_PAIRS.map(pair => `<span class="${!shifted && foundPairs.has(pairKey(...pair)) ? 'is-found' : ''}">${shifted ? 'Before: ' : foundPairs.has(pairKey(...pair)) ? '✓ ' : '○ '}${pair.map(esc).join(' + ')}</span>`).join('')}</div>
    ${shifted ? `<div class="wm-shift" role="status" tabindex="-1"><strong>We replaced “The cat drinks.” with “The cat launches.”</strong><p>Now cat + kitten score ${cosineSimilarity(contextVector('cat', CHANGED_CORPUS), contextVector('kitten', CHANGED_CORPUS)).toFixed(2)}, down from 1.00. In this very small toy set, one strange sentence can move a vector a lot.</p></div>` : comparison ? `<div class="wm-comparison ${comparison.related ? 'is-related' : ''}" role="status" tabindex="-1"><strong>${esc(comparison.left)} + ${esc(comparison.right)} <span>Similarity: ${comparison.similarity.toFixed(2)}</span></strong><p>${comparison.related ? 'Their context-count vectors match in this tiny collection. You found a connection.' : 'These two words do not share an action here. Try another pair.'}</p></div>` : ''}` : '';
  const footer = !trained
    ? '<p>First, make a vector from the examples.</p><button class="primary" type="button" data-wm-train>Build the vectors →</button>'
    : shifted
      ? '<p>The text shaped the result.</p><button class="primary" type="button" data-wm-paper>See the research →</button>'
      : allFound
        ? '<p>Both connections found.</p><button class="primary" type="button" data-wm-shift>Change one sentence →</button>'
        : `<p>${foundPairs.size} of 2 connections found</p>`;
  return `<div class="wm-body"><div class="wm-kicker">Experiment 1 · Word relationships</div><h1 id="embedding-title" tabindex="-1">Build a tiny word map.</h1><p class="wm-context">A model can learn word relationships from patterns in text. Start with this tiny collection, then compare the words that appear in similar contexts.</p>${corpus()}${vectorCards}${sourceLinks([sources.embeddings])}</div><div class="wm-footer">${footer}</div>`;
}

function paperView() {
  return `<div class="wm-body"><div class="wm-kicker">From toy vectors to published research</div><h1 id="embedding-title" tabindex="-1">What else can a word map learn?</h1><p class="wm-context">In a 2016 study, researchers examined a particular static word2vec embedding trained on Google News text. They found a stereotyped association.</p><div class="wm-paper-grid"><div><span>man</span><strong>computer programmer</strong></div><div><span>woman</span><strong id="wm-paper-result" tabindex="-1">${paperRevealed ? 'homemaker' : '?'}</strong></div></div>${paperRevealed ? `<div class="wm-paper-explain" role="status"><strong>That was the studied embedding’s association.</strong><p>It reflects a gender stereotype encoded in that representation. It does not describe people’s abilities, and the paper did not test today’s chatbots.</p></div>` : '<p class="wm-paper-prompt">Tap below to reveal the association reported in the paper.</p>'}${sourceLinks([sources.paper])}</div><div class="wm-footer"><p>${paperRevealed ? 'A learned association needs scrutiny.' : 'A real study, not our toy corpus.'}</p><button class="primary" type="button" data-wm-paper-next>${paperRevealed ? 'Try next-word prediction →' : 'Reveal the finding →'}</button></div>`;
}

function tokenChips(prefix) {
  return `<div class="wm-token-line" aria-label="Prompt: ${esc(prefix)}">${prefix.split(' ').map(word => `<span>${esc(word)}</span>`).join('')}<span class="wm-token-blank">?</span></div>`;
}

function countsView(prefix) {
  const counts = continuationCounts(prefix);
  const maximum = Math.max(...counts.map(item => item.count));
  const top = counts.find(item => item.count === maximum);
  return `<div class="wm-counts" role="status" tabindex="-1"><strong>Your pick: ${esc(prediction)}. ${esc(top.ending)} appears most often in this tiny collection.</strong><p>These are counts from the examples below, not probabilities from an AI model. Other endings are possible.</p><div class="wm-bars">${counts.map(item => `<div class="wm-bar-row ${item.ending === prediction ? 'is-picked' : ''}"><span>${esc(item.ending)}</span><div class="wm-bar-track"><i style="width:${Math.round(item.share * 100)}%"></i></div><strong>${item.count} / ${counts.reduce((sum, entry) => sum + entry.count, 0)}</strong></div>`).join('')}</div></div>`;
}

function predictView() {
  const prefix = NEXT_WORD_PROMPTS[promptIndex];
  const examples = NEXT_WORD_EXAMPLES.filter(item => item.prefix === prefix);
  return `<div class="wm-body"><div class="wm-kicker">Experiment 2 · Next-word prediction · ${promptIndex + 1} of 2</div><h1 id="embedding-title" tabindex="-1">What comes next?</h1><p class="wm-context">In this word-level game, each box stands for one word. Which ending do you think appears most often after this exact sequence in our invented examples?</p>${tokenChips(prefix)}<div class="wm-pick-grid" role="group" aria-label="Choose the next word">${NEXT_WORD_CHOICES.map(word => `<button type="button" data-wm-predict="${esc(word)}" class="${prediction === word ? 'is-picked' : ''}" ${prediction ? 'disabled' : ''}>${esc(word)}</button>`).join('')}</div>${prediction ? countsView(prefix) : '<p class="wm-predict-prompt">Make a guess, then see the counts.</p>'}<details class="wm-corpus wm-corpus-next" ${prediction ? 'open' : ''}><summary>See the tiny text collection <span>${examples.reduce((sum, item) => sum + item.count, 0)} examples</span></summary><ul>${examples.map(item => `<li><strong>${item.count}×</strong> ${esc(prefix)} <b>${esc(item.ending)}</b></li>`).join('')}</ul></details><div class="wm-token-note"><strong>Where does a tokenizer fit?</strong><p>A tokenizer turns text into pieces before prediction. We used whole words for this game. A real tokenizer can use subword pieces too, such as <span class="wm-split">un</span><span class="wm-split">watch</span><span class="wm-split">ed</span> for “unwatched.” The language model, not the tokenizer, predicts a continuation.</p></div>${sourceLinks([sources.tokens, sources.tokenizer])}</div><div class="wm-footer"><p>${prediction ? 'Change the context to compare.' : 'Any guess is welcome.'}</p>${prediction ? `<button class="primary" type="button" data-wm-predict-next>${promptIndex === 0 ? 'Change context →' : 'Finish the lab →'}</button>` : ''}</div>`;
}

function completeView() {
  return `<div class="wm-body wm-finish"><div class="wm-kicker">The Word Map · Complete</div><div class="wm-finish-mark" aria-hidden="true">✓</div><h1 id="embedding-title" tabindex="-1">You found the pattern.</h1><p>You built toy context vectors, inspected a real word-embedding finding, and watched a next-word count change with the context.</p><div class="wm-finish-steps"><span>✓ Build the vectors</span><span>✓ Predict twice</span></div><div class="wm-result"><strong>+${earned}</strong><span>XP earned today</span></div><p class="wm-boundary">This activity does not run word2vec or a language model. It is practice, not a test of AI fluency.</p><div class="wm-reading"><h2>Explore the ideas</h2>${sourceLinks([sources.embeddings, sources.paper, sources.tokens])}</div></div><div class="wm-footer"><button class="wm-secondary" type="button" data-wm-replay>Play again</button><button class="primary" type="button" data-wm-close>Back to Fluent</button></div>`;
}

function render() {
  dialog.innerHTML = header() + (stage === 'map' ? mapView() : stage === 'paper' ? paperView() : stage === 'predict' ? predictView() : completeView());
  dialog.querySelectorAll('[data-wm-close]').forEach(button => button.addEventListener('click', close));
  dialog.querySelector('[data-wm-train]')?.addEventListener('click', () => { trained = true; render(); focusTitle(); });
  dialog.querySelectorAll('[data-wm-word]').forEach(button => button.addEventListener('click', () => chooseWord(button.dataset.wmWord)));
  dialog.querySelector('[data-wm-shift]')?.addEventListener('click', () => { shifted = true; comparison = null; renderKeepPosition('.wm-shift'); });
  dialog.querySelector('[data-wm-paper]')?.addEventListener('click', () => { stage = 'paper'; render(); focusTitle(); });
  dialog.querySelector('[data-wm-paper-next]')?.addEventListener('click', () => {
    if (!paperRevealed) { paperRevealed = true; renderKeepPosition('#wm-paper-result'); }
    else { stage = 'predict'; render(); focusTitle(); }
  });
  dialog.querySelectorAll('[data-wm-predict]').forEach(button => button.addEventListener('click', () => {
    if (prediction) return;
    prediction = button.dataset.wmPredict;
    renderKeepPosition('.wm-counts');
  }));
  dialog.querySelector('[data-wm-predict-next]')?.addEventListener('click', () => {
    if (promptIndex === 0) { promptIndex = 1; prediction = null; render(); focusTitle(); }
    else { stage = 'complete'; if (!finished) { finished = true; earned = callbacks.onComplete?.() || 0; } render(); focusTitle(); }
  });
  dialog.querySelector('[data-wm-replay]')?.addEventListener('click', () => { reset(); render(); focusTitle(); });
}

function renderKeepPosition(selector) {
  const top = dialog.querySelector('.wm-body')?.scrollTop || 0;
  render();
  const body = dialog.querySelector('.wm-body');
  if (body) body.scrollTop = top;
  dialog.querySelector(selector)?.focus({preventScroll:true});
}
function focusTitle() {
  dialog.querySelector('#embedding-title')?.focus({preventScroll:true});
  dialog.querySelector('.wm-body')?.scrollTo(0, 0);
}
function chooseWord(word) {
  if (!trained || shifted || !TARGET_WORDS.includes(word)) return;
  if (!selectedWord) { selectedWord = word; comparison = null; renderKeepPosition(`[data-wm-word="${word}"]`); return; }
  if (selectedWord === word) { selectedWord = null; renderKeepPosition(`[data-wm-word="${word}"]`); return; }
  const related = EXPECTED_PAIRS.some(pair => pairKey(...pair) === pairKey(selectedWord, word));
  comparison = {left: selectedWord, right: word, similarity: cosineSimilarity(contextVector(selectedWord), contextVector(word)), related};
  if (related) foundPairs.add(pairKey(selectedWord, word));
  selectedWord = null;
  renderKeepPosition('.wm-comparison');
}
function reset() {
  stage = 'map'; trained = false; shifted = false; selectedWord = null; comparison = null;
  foundPairs = new Set(); paperRevealed = false; promptIndex = 0; prediction = null;
  earned = 0; finished = false;
}
function close() { if (!dialog.open) return; dialog.close(); callbacks.onClose?.(); }
dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });

export function startWordMapGame(options = {}) {
  callbacks = options; reset(); render(); dialog.showModal(); focusTitle();
}

export function wordMapTeaser(compact = false) {
  return `<section class="word-map-teaser ${compact ? 'is-compact' : ''}" aria-labelledby="word-map-teaser-title${compact ? '-compact' : ''}"><div class="wm-teaser-copy"><div class="wm-kicker">New · Two hands-on games</div><h2 id="word-map-teaser-title${compact ? '-compact' : ''}">The Word Map</h2><p>Build a tiny word vector. Then guess what comes next when the context changes.</p><button class="small-start" type="button" data-word-map>Play the Word Map <span aria-hidden="true">→</span></button></div><div class="wm-teaser-art" aria-hidden="true"><span>words</span><i></i><span>vectors</span><i></i><span>next?</span></div></section>`;
}
