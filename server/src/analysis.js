const VALID_VALUES = new Set([0,1,2,3,4,5,6,7,8,9]);

export function validateResults(results) {
  if (!Array.isArray(results)) throw new TypeError("results must be an array");
  return results.map((item, index) => {
    const value = Number(item.value);
    if (!Number.isInteger(value) || !VALID_VALUES.has(value)) {
      throw new TypeError(`results[${index}].value must be an integer from 0 to 9`);
    }
    const observedAt = item.observedAt ? new Date(item.observedAt) : null;
    if (observedAt && Number.isNaN(observedAt.getTime())) {
      throw new TypeError(`results[${index}].observedAt is invalid`);
    }
    return { ...item, value, observedAt };
  }).sort((a,b) => {
    const ta = a.observedAt?.getTime() ?? 0;
    const tb = b.observedAt?.getTime() ?? 0;
    return ta - tb;
  });
}

export function analyzeResults(input, windowSize = 100) {
  const results = validateResults(input);
  const size = Math.max(1, Math.min(10000, Number(windowSize) || 100));
  const window = results.slice(-size);
  const counts = Array.from({length:10},(_,value)=>({value,count:0,proportion:0}));
  for (const row of window) counts[row.value].count++;
  for (const row of counts) row.proportion = window.length ? row.count/window.length : 0;

  const transitions = Array.from({length:10},()=>Array(10).fill(0));
  for (let i=1;i<window.length;i++) transitions[window[i-1].value][window[i].value]++;

  const lastValue = window.at(-1)?.value ?? null;
  let currentStreak = 0;
  if (lastValue !== null) {
    for (let i=window.length-1;i>=0 && window[i].value===lastValue;i--) currentStreak++;
  }
  const ranking = [...counts].sort((a,b)=>b.count-a.count || a.value-b.value);

  return {
    sampleSize: window.length,
    requestedWindow: size,
    counts,
    historicalFrequencyRanking: ranking,
    transitions,
    latestObservedValue: lastValue,
    latestValueStreak: currentStreak,
    baselinePerNumber: 0.1,
    interpretation: "Descriptive historical statistics only; not a reliable prediction of a random next outcome.",
    disclaimer: "Past outcomes do not guarantee or determine future outcomes."
  };
}
