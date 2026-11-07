// Activity progress is independent of XP. The application awards XP after an
// accepted correct answer, using its existing once-per-day award function.
import {restoreActivityTiming} from './activity-timer.js';
const unique = values => [...new Set(values)];
const idsFor = activity => (activity.kind === 'match' ? activity.pairs : activity.questions).map(item => item.id);
export const isReusableMatch = activity => activity.kind === 'match' && activity.matchMode === 'many-to-one';
const rightIdsFor = activity => isReusableMatch(activity) ? activity.groups.map(group => group.id) : idsFor(activity);
const isTimed = activity => activity.id === 'company-match' || activity.timed === true;
const shuffled = values => {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export function makeActivitySession(activity) {
  const ids = idsFor(activity);
  return {
    activity: activity.id, kind: activity.kind, stage: ids.length ? 'playing' : 'complete',
    matched: [], leftOrder: activity.kind === 'match' ? (isReusableMatch(activity) ? shuffled(ids) : [...ids]) : [],
    rightOrder: activity.kind === 'match' ? shuffled(rightIdsFor(activity)) : [],
    selectedLeft: null, selectedRight: null, feedback: null,
    queue: activity.kind === 'quiz' ? [...ids] : [],
    index: 0, selected: null, checked: false, correct: false,
    firstCorrect: 0, attempted: [], hintUsed: [], earned: 0,
    ...(isTimed(activity) ? {timing: {elapsedMs: 0, complete: true}} : {})
  };
}

function recordAttempt(session, id, correct) {
  if (session.attempted.includes(id)) return;
  session.attempted.push(id);
  if (correct && !session.hintUsed.includes(id)) session.firstCorrect++;
}

// Hints affect the unaided first-attempt measure, never XP or completion.
export function recordActivityHint(session, id) {
  const ids = session.kind === 'match' ? session.leftOrder : session.queue;
  if (session.stage !== 'playing' || !ids.includes(id) || session.attempted.includes(id) || session.hintUsed.includes(id)) return false;
  session.hintUsed.push(id);
  return true;
}

export function checkMatch(session, activity, leftId, rightId) {
  const rejected = {accepted: false, correct: false};
  if (activity.kind !== 'match' || session.kind !== 'match' || session.activity !== activity.id || session.stage !== 'playing') return rejected;
  const pair = activity.pairs.find(item => item.id === leftId);
  const reusable = isReusableMatch(activity);
  if (!pair || !rightIdsFor(activity).includes(rightId) || session.matched.includes(leftId) || (!reusable && session.matched.includes(rightId))) return rejected;
  const correct = (reusable ? pair.right.groupId : leftId) === rightId;
  session.selectedLeft = leftId;
  session.selectedRight = rightId;
  session.correct = correct;
  recordAttempt(session, leftId, correct);
  session.feedback = {correct, text: correct ? pair.explanation : `Not quite. ${pair.explanation}`, pairId: leftId};
  if (correct) {
    session.matched.push(leftId);
    if (session.matched.length === activity.pairs.length) session.stage = 'complete';
  }
  return {accepted: true, correct, pairId: leftId};
}

export function checkQuiz(session, activity, selection) {
  const rejected = {accepted: false, correct: false};
  if (activity.kind !== 'quiz' || session.kind !== 'quiz' || session.activity !== activity.id || session.stage !== 'playing' || session.checked) return rejected;
  const question = activity.questions.find(item => item.id === session.queue[session.index]);
  if (!question || !Number.isInteger(selection) || selection < 0 || selection >= question.options.length) return rejected;
  session.selected = selection;
  session.checked = true;
  session.correct = selection === question.answer;
  recordAttempt(session, question.id, session.correct);
  session.feedback = {correct: session.correct, text: question.explanation, questionId: question.id};
  return {accepted: true, correct: session.correct, questionId: question.id};
}

export function nextActivityQuestion(session) {
  if (session.kind !== 'quiz' || session.stage !== 'playing' || !session.checked) return false;
  if (!session.correct) session.queue.push(session.queue[session.index]);
  session.index++;
  session.selected = null;
  session.checked = false;
  session.correct = false;
  session.feedback = null;
  if (session.index === session.queue.length) session.stage = 'complete';
  return true;
}

const freshProgress = () => ({version: 1, sessions: {}, completed: []});
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const validCount = value => Number.isSafeInteger(value) && value >= 0;

function restoreSession(saved, activity) {
  if (!isRecord(saved) || saved.activity !== activity.id || saved.kind !== activity.kind || !['playing', 'complete'].includes(saved.stage)) return null;
  const ids = idsFor(activity), allowed = new Set(ids), rightIds = rightIdsFor(activity), allowedRight = new Set(rightIds);
  const validIds = values => Array.isArray(values) && values.length <= 2000 && values.every(id => allowed.has(id));
  for (const key of ['matched', 'leftOrder', 'queue', 'attempted', 'hintUsed']) if (!validIds(saved[key])) return null;
  if (!Array.isArray(saved.rightOrder) || saved.rightOrder.length > 2000 || saved.rightOrder.some(id => !allowedRight.has(id))) return null;
  for (const key of ['matched', 'attempted', 'hintUsed']) if (unique(saved[key]).length !== saved[key].length) return null;
  if (!validCount(saved.index) || !validCount(saved.firstCorrect) || !validCount(saved.earned)) return null;
  if (saved.firstCorrect > saved.attempted.filter(id => !saved.hintUsed.includes(id)).length) return null;
  if (typeof saved.checked !== 'boolean' || typeof saved.correct !== 'boolean') return null;
  if ((saved.selectedLeft !== null && !allowed.has(saved.selectedLeft)) || (saved.selectedRight !== null && !allowedRight.has(saved.selectedRight))) return null;
  const result = makeActivitySession(activity);
  for (const key of ['stage', 'index', 'firstCorrect', 'earned', 'selectedLeft', 'selectedRight', 'selected', 'checked', 'correct']) result[key] = saved[key];
  for (const key of ['matched', 'leftOrder', 'rightOrder', 'queue', 'attempted', 'hintUsed']) result[key] = [...saved[key]];

  if (activity.kind === 'match') {
    if (saved.queue.length || saved.index !== 0 || saved.checked || saved.selected !== null) return null;
    if (saved.leftOrder.length !== ids.length || unique(saved.leftOrder).length !== ids.length) return null;
    if (saved.rightOrder.length !== rightIds.length || unique(saved.rightOrder).length !== rightIds.length) return null;
    if (saved.matched.some(id => !saved.attempted.includes(id))) return null;
    if (saved.firstCorrect > saved.matched.filter(id => !saved.hintUsed.includes(id)).length) return null;
    if ((saved.stage === 'complete') !== (saved.matched.length === ids.length)) return null;
    if (saved.feedback !== null) {
      if (!isRecord(saved.feedback) || !allowed.has(saved.feedback.pairId) || typeof saved.feedback.correct !== 'boolean') return null;
      const pair = activity.pairs.find(item => item.id === saved.feedback.pairId);
      // UI selections may be cleared after feedback; feedback itself remains.
      if (!saved.attempted.includes(pair.id) || saved.feedback.correct !== saved.matched.includes(pair.id) || saved.correct !== saved.feedback.correct) return null;
      result.feedback = {correct: saved.feedback.correct, text: saved.feedback.correct ? pair.explanation : `Not quite. ${pair.explanation}`, pairId: pair.id};
    }
  } else {
    if (saved.matched.length || saved.leftOrder.length || saved.rightOrder.length || saved.selectedLeft !== null || saved.selectedRight !== null) return null;
    if (saved.queue.length < ids.length || ids.some((id, index) => saved.queue[index] !== id) || saved.index > saved.queue.length) return null;
    if ((saved.stage === 'complete') !== (saved.index === saved.queue.length)) return null;
    if (saved.stage === 'complete' && (saved.checked || saved.correct || saved.selected !== null || saved.feedback !== null || ids.some(id => !saved.attempted.includes(id)))) return null;
    if (saved.stage === 'playing') {
      const question = activity.questions.find(item => item.id === saved.queue[saved.index]);
      if (!question) return null;
      if (saved.selected !== null && (!Number.isInteger(saved.selected) || saved.selected < 0 || saved.selected >= question.options.length)) return null;
      if (saved.checked) {
        if (saved.selected === null || !saved.attempted.includes(question.id) || saved.correct !== (saved.selected === question.answer)) return null;
        if (!isRecord(saved.feedback) || saved.feedback.questionId !== question.id || saved.feedback.correct !== saved.correct) return null;
        result.feedback = {correct: saved.correct, text: question.explanation, questionId: question.id};
      } else if (saved.correct || saved.feedback !== null) return null;
    }
    if (saved.queue.slice(0, saved.index).some(id => !saved.attempted.includes(id))) return null;
  }
  if (isTimed(activity)) {
    const progressed = saved.stage === 'complete' || ['attempted', 'matched', 'hintUsed'].some(key => saved[key].length);
    result.timing = restoreActivityTiming(saved.timing, progressed);
  }
  return result;
}

// The original logo game used three pairs; the next four briefly lived in a
// separate activity. Validate each old session with its original content before
// combining them, so old completion flags cannot finish the expanded game.
function restoreLogoSession(sessions, activity) {
  const current = restoreSession(sessions[activity.id], activity);
  if (current) return current;
  const groups = [
    {id: 'company-match', ids: ['openai', 'google', 'anthropic']},
    {id: 'company-match-more', ids: ['xai', 'microsoft', 'meta', 'perplexity']}
  ];
  const allIds = groups.flatMap(group => group.ids);
  if (activity.kind !== 'match' || activity.pairs.length !== allIds.length || activity.pairs.some(pair => !allIds.includes(pair.id))) return null;
  const previous = groups.flatMap(group => {
    const legacyActivity = {...activity, id: group.id, pairs: activity.pairs.filter(pair => group.ids.includes(pair.id))};
    const session = restoreSession(sessions[group.id], legacyActivity);
    return session ? [session] : [];
  });
  if (!previous.length) return null;
  const result = makeActivitySession(activity);
  for (const key of ['matched', 'attempted', 'hintUsed']) result[key] = previous.flatMap(session => session[key]);
  for (const key of ['leftOrder', 'rightOrder']) {
    const oldOrder = previous.flatMap(session => session[key]);
    result[key] = [...oldOrder, ...result[key].filter(id => !oldOrder.includes(id))];
  }
  result.firstCorrect = previous.reduce((total, session) => total + session.firstCorrect, 0);
  result.earned = previous.reduce((total, session) => total + session.earned, 0);
  if (!validCount(result.earned)) return null;
  result.stage = result.matched.length === activity.pairs.length ? 'complete' : 'playing';
  // Separate legacy rounds cannot establish one complete seven-logo time.
  result.timing = {elapsedMs: 0, complete: false};
  return result;
}

// The model catalog removed one item. Preserve a validated old round only when
// that item was never attempted: the saved score is an aggregate, so its
// first-attempt contribution cannot otherwise be recovered reliably.
function restoreModelSession(saved, activity) {
  const current = restoreSession(saved, activity);
  if (current) return current;
  const modelIds = ['astra', 'sol', 'luna', 'fable', 'opus', 'sonnet', 'haiku', 'gemma', 'gemini-flash', 'llama', 'grok'];
  const groupIds = ['openai', 'anthropic', 'google', 'meta', 'xai'];
  if (!isReusableMatch(activity) || activity.pairs.length !== modelIds.length || activity.pairs.some(pair => !modelIds.includes(pair.id)) ||
      unique(activity.pairs.map(pair => pair.id)).length !== modelIds.length || activity.groups.length !== groupIds.length ||
      activity.groups.some(group => !groupIds.includes(group.id)) || unique(activity.groups.map(group => group.id)).length !== groupIds.length) return null;
  const removedId = 'mistral-large', removedGroup = 'mistral';
  const legacyActivity = {...activity,
    pairs: [...activity.pairs, {id: removedId, right: {groupId: removedGroup}, explanation: ''}],
    groups: [...activity.groups, {id: removedGroup}]
  };
  const previous = restoreSession(saved, legacyActivity);
  if (!previous || previous.attempted.includes(removedId)) return null;
  previous.leftOrder = previous.leftOrder.filter(id => id !== removedId);
  previous.rightOrder = previous.rightOrder.filter(id => id !== removedGroup);
  previous.hintUsed = previous.hintUsed.filter(id => id !== removedId);
  if (previous.selectedLeft === removedId) previous.selectedLeft = null;
  if (previous.selectedRight === removedGroup) previous.selectedRight = null;
  previous.stage = previous.matched.length === activity.pairs.length ? 'complete' : 'playing';
  return restoreSession(previous, activity);
}

export function loadActivityProgress(raw, activities) {
  const result = freshProgress();
  if (!raw) return result;
  let data;
  try { data = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return result; }
  if (!isRecord(data) || data.version !== 1 || !Array.isArray(activities)) return result;
  const byId = new Map(activities.map(activity => [activity.id, activity]));
  if (Array.isArray(data.completed)) result.completed = unique(data.completed.filter(id => byId.has(id) && id !== 'company-match' && !isReusableMatch(byId.get(id))));
  if (isRecord(data.sessions)) {
    for (const [id, activity] of byId) {
      const session = id === 'company-match' ? restoreLogoSession(data.sessions, activity) :
        id === 'model-challenge' ? restoreModelSession(data.sessions[id], activity) : restoreSession(data.sessions[id], activity);
      if (session) {
        Object.defineProperty(result.sessions, id, {value: session, writable: true, enumerable: true, configurable: true});
        if (session.stage === 'complete' && !result.completed.includes(id)) result.completed.push(id);
      }
    }
  }
  return result;
}
