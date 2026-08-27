/** Rounds a value to a "nice" 1/2/5 * 10^n step (the standard d3-style nice-tick algorithm). */
function niceNumber(value: number, round: boolean): number {
  if (value === 0) return 0;
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * Math.pow(10, exponent);
}

/**
 * Computes clean axis ticks covering [minValue, maxValue] — handles a domain
 * that dips below zero (e.g. a balance that can deplete), not just [0, max].
 */
export function niceTicks(minValue: number, maxValue: number, targetCount = 5): number[] {
  let min = minValue;
  let max = maxValue;
  if (min === max) {
    // Flat data (e.g. everything still at placeholder 0) — widen slightly so
    // there's still a usable scale instead of a divide-by-zero.
    min -= 1;
    max += 1;
  }

  const roughStep = niceNumber(max - min, false) / (targetCount - 1);
  const step = niceNumber(roughStep, true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;

  const ticks: number[] = [];
  for (let t = niceMin; t <= niceMax + step / 2; t += step) {
    // Round away float drift (e.g. 0.30000000000000004) before it reaches display code.
    ticks.push(Math.round(t * 1e6) / 1e6);
  }
  return ticks;
}
