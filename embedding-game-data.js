// Reviewed 2026-11-07. These authored examples are deliberately small teaching
// datasets. They are not word2vec vectors, a tokenizer, or output from an LLM.
export const CONTEXT_WORDS = ['naps', 'drinks', 'launches', 'orbits'];
export const TARGET_WORDS = ['cat', 'kitten', 'rocket', 'spaceship'];
export const MINI_CORPUS = [
  {target: 'cat', context: 'naps', sentence: 'The cat naps.'},
  {target: 'cat', context: 'drinks', sentence: 'The cat drinks.'},
  {target: 'kitten', context: 'naps', sentence: 'The kitten naps.'},
  {target: 'kitten', context: 'drinks', sentence: 'The kitten drinks.'},
  {target: 'rocket', context: 'launches', sentence: 'The rocket launches.'},
  {target: 'rocket', context: 'orbits', sentence: 'The rocket orbits.'},
  {target: 'spaceship', context: 'launches', sentence: 'The spaceship launches.'},
  {target: 'spaceship', context: 'orbits', sentence: 'The spaceship orbits.'}
];
export const CHANGED_CORPUS = MINI_CORPUS.map(item =>
  item.target === 'cat' && item.context === 'drinks'
    ? {target: 'cat', context: 'launches', sentence: 'The cat launches.'}
    : item
);

export const EXPECTED_PAIRS = [
  ['cat', 'kitten'],
  ['rocket', 'spaceship']
];

export const NEXT_WORD_EXAMPLES = [
  {prefix: 'the cat sat on the', ending: 'mat', count: 3},
  {prefix: 'the cat sat on the', ending: 'rug', count: 2},
  {prefix: 'the cat sat on the', ending: 'sofa', count: 1},
  {prefix: 'the dog slept on the', ending: 'mat', count: 1},
  {prefix: 'the dog slept on the', ending: 'rug', count: 3},
  {prefix: 'the dog slept on the', ending: 'sofa', count: 1}
];
export const NEXT_WORD_PROMPTS = ['the cat sat on the', 'the dog slept on the'];
export const NEXT_WORD_CHOICES = ['mat', 'rug', 'sofa'];

export function contextVector(target, corpus = MINI_CORPUS) {
  return CONTEXT_WORDS.map(context => corpus.filter(item => item.target === target && item.context === context).length);
}

export function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
  const lengthA = Math.hypot(...a), lengthB = Math.hypot(...b);
  return lengthA && lengthB ? dot / (lengthA * lengthB) : 0;
}

export function pairKey(a, b) { return [a, b].sort().join('|'); }

export function continuationCounts(prefix) {
  const counts = NEXT_WORD_CHOICES.map(ending => ({
    ending,
    count: NEXT_WORD_EXAMPLES.find(item => item.prefix === prefix && item.ending === ending)?.count || 0
  }));
  const total = counts.reduce((sum, item) => sum + item.count, 0);
  return counts.map(item => ({...item, share: total ? item.count / total : 0}));
}
