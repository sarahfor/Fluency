// Persist only accumulated active time, never a clock origin. This lets a
// round resume after closing or reloading without counting the time away.
// timing.complete means timing covers the entire round; session.stage records
// whether the learner has actually completed the matching activity.
const validElapsed = value => Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;
const hasProgress = session => session.stage === 'complete' || ['attempted', 'matched', 'hintUsed'].some(key => session[key]?.length);

export function restoreActivityTiming(saved, progressed = false) {
  if (saved === undefined) return {elapsedMs: 0, complete: !progressed};
  if (saved !== null && typeof saved === 'object' && !Array.isArray(saved) && validElapsed(saved.elapsedMs) && typeof saved.complete === 'boolean') {
    return {elapsedMs: saved.elapsedMs, complete: saved.complete};
  }
  // A broken timer must not discard a learner's matches or imply a full time.
  return {elapsedMs: 0, complete: false};
}

export function createActivityTimer(session, now = () => performance.now()) {
  session.timing = restoreActivityTiming(session.timing, hasProgress(session));
  const timing = session.timing;
  let startedAt = null;
  const clock = () => {
    const value = now();
    return validElapsed(value) ? value : null;
  };
  const totalAt = current => Math.min(Number.MAX_SAFE_INTEGER, timing.elapsedMs + (startedAt === null || current === null ? 0 : Math.max(0, current - startedAt)));
  const checkpoint = () => {
    const current = clock();
    timing.elapsedMs = totalAt(current);
    if (startedAt !== null && current !== null) startedAt = Math.max(startedAt, current);
    return timing.elapsedMs;
  };
  return {
    start() {
      if (session.stage !== 'playing' || startedAt !== null) return false;
      startedAt = clock();
      return startedAt !== null;
    },
    pause() {
      checkpoint();
      startedAt = null;
      return timing.elapsedMs;
    },
    checkpoint,
    elapsedMs() { return totalAt(clock()); }
  };
}

export function formatActivityTime(ms) {
  const seconds = Math.floor((validElapsed(ms) ? ms : 0) / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainder = String(seconds % 60).padStart(2, '0');
  if (minutes < 60) return `${minutes}:${remainder}`;
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}:${remainder}`;
}
