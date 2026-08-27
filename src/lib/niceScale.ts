/** Rounds a step size up to a "nice" 1/2/5 * 10^n value (the standard d3-style nice-tick algorithm). */
function niceNumber(value: number): number {
  if (value === 0) return 0;
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);
  let niceFraction: number;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;
  return niceFraction * Math.pow(10, exponent);
}

/** Computes clean axis ticks (0, step, 2*step, ...) covering [0, maxValue]. */
export function niceTicks(maxValue: number, targetCount = 5): number[] {
  if (maxValue <= 0) return [0];
  const roughStep = maxValue / Math.max(1, targetCount - 1);
  const step = niceNumber(roughStep);
  const niceMax = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let t = 0; t <= niceMax + step / 2; t += step) {
    ticks.push(Math.round(t));
  }
  return ticks;
}
