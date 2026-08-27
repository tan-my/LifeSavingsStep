"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { YearPlan } from "@/lib/calculations";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";
import { niceTicks } from "@/lib/niceScale";

interface TimelineChartProps {
  years: YearPlan[];
  onSelectYear: (year: number) => void;
}

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 220;
const PADDING = { top: 12, right: 16, bottom: 24, left: 72 };
const INNER_WIDTH = VIEW_WIDTH - PADDING.left - PADDING.right;
const INNER_HEIGHT = VIEW_HEIGHT - PADDING.top - PADDING.bottom;

export default function TimelineChart({ years, onSelectYear }: TimelineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const clipIdBase = useId();
  const aboveZeroClipId = `${clipIdBase}-above`;
  const belowZeroClipId = `${clipIdBase}-below`;

  const n = years.length;
  // Domain always includes 0 — that's the solvent/depleted baseline, so it
  // should always be visible even if balance never dips negative.
  const minValue = useMemo(() => Math.min(0, ...years.map((y) => y.balance)), [years]);
  const maxValue = useMemo(() => Math.max(0, ...years.map((y) => y.balance)), [years]);
  const ticks = useMemo(() => niceTicks(minValue, maxValue), [minValue, maxValue]);
  const yLo = ticks[0] ?? 0;
  const yHi = ticks[ticks.length - 1] ?? 1;
  const ySpan = yHi - yLo || 1;

  const xAt = (i: number) =>
    n <= 1 ? PADDING.left : PADDING.left + (i / (n - 1)) * INNER_WIDTH;
  const yAt = (value: number) =>
    PADDING.top + INNER_HEIGHT - ((value - yLo) / ySpan) * INNER_HEIGHT;
  const zeroY = yAt(0);

  const linePath = years
    .map((y, i) => `${i === 0 ? "M" : "L"}${xAt(i)},${yAt(y.balance)}`)
    .join(" ");
  const areaPath = `${linePath} L${xAt(n - 1)},${zeroY} L${xAt(0)},${zeroY} Z`;

  // Sparse x-axis labels: first, last, and every ~10 years in between so 75
  // points don't collide into an unreadable smear.
  const labelStep = Math.max(1, Math.round(n / 8));
  const xLabelIndices = new Set<number>();
  for (let i = 0; i < n; i += labelStep) xLabelIndices.add(i);
  xLabelIndices.add(n - 1);

  function nearestIndexFromClientX(clientX: number, clientY: number): number | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const local = pt.matrixTransform(ctm.inverse());
    const ratio = (local.x - PADDING.left) / INNER_WIDTH;
    const index = Math.round(ratio * (n - 1));
    return Math.min(n - 1, Math.max(0, index));
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const index = nearestIndexFromClientX(e.clientX, e.clientY);
    if (index !== null) setHoverIndex(index);
  }

  function handleClick() {
    if (hoverIndex !== null) onSelectYear(years[hoverIndex].year);
  }

  function handleKeyDown(e: React.KeyboardEvent<SVGSVGElement>) {
    if (hoverIndex === null) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") setHoverIndex(0);
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setHoverIndex(Math.min(n - 1, hoverIndex + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setHoverIndex(Math.max(0, hoverIndex - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectYear(years[hoverIndex].year);
    }
  }

  const hovered = hoverIndex !== null ? years[hoverIndex] : null;
  const hoveredIsNegative = hovered !== null && hovered.balance < 0;
  const hoveredColor = hoveredIsNegative ? "var(--color-danger)" : "var(--color-success)";

  // Clamp the tooltip so it never renders past the chart's edges, and flip
  // below the point when there isn't room above it.
  const tooltipWidth = 168;
  const tooltipX = hovered
    ? Math.min(xAt(hoverIndex!) + 12, VIEW_WIDTH - tooltipWidth - 4)
    : 0;
  const pointY = hovered ? yAt(hovered.balance) : 0;
  const tooltipBelow = pointY < PADDING.top + 44;

  return (
    <div className="relative rounded-lg border border-border bg-card p-3 shadow-sm">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="w-full cursor-pointer touch-none"
        role="img"
        aria-label="Projected savings balance, this year through age 100. Use arrow keys to move between years, Enter to view a year's breakdown."
        tabIndex={0}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverIndex(null)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <defs>
          <clipPath id={aboveZeroClipId}>
            <rect
              x={PADDING.left}
              y={PADDING.top}
              width={INNER_WIDTH}
              height={Math.max(0, zeroY - PADDING.top)}
            />
          </clipPath>
          <clipPath id={belowZeroClipId}>
            <rect
              x={PADDING.left}
              y={zeroY}
              width={INNER_WIDTH}
              height={Math.max(0, VIEW_HEIGHT - PADDING.bottom - zeroY)}
            />
          </clipPath>
        </defs>

        {/* Gridlines + y-axis labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PADDING.left}
              x2={VIEW_WIDTH - PADDING.right}
              y1={yAt(t)}
              y2={yAt(t)}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
            <text
              x={PADDING.left - 10}
              y={yAt(t)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[11px]"
            >
              {formatCurrencyCompact(t)}
            </text>
          </g>
        ))}

        {/* x-axis year labels */}
        {years.map((y, i) =>
          xLabelIndices.has(i) ? (
            <text
              key={y.year}
              x={xAt(i)}
              y={VIEW_HEIGHT - PADDING.bottom + 16}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px]"
            >
              {y.year}
            </text>
          ) : null,
        )}

        {/* Zero baseline — the solvent/depleted line the whole chart is read against */}
        <line
          x1={PADDING.left}
          x2={VIEW_WIDTH - PADDING.right}
          y1={zeroY}
          y2={zeroY}
          stroke="var(--color-muted-foreground)"
          strokeWidth={1.25}
        />

        {/* Area wash + line, split at zero: success above, danger below */}
        <path
          d={areaPath}
          fill="var(--color-success)"
          fillOpacity={0.12}
          stroke="none"
          clipPath={`url(#${aboveZeroClipId})`}
        />
        <path
          d={areaPath}
          fill="var(--color-danger)"
          fillOpacity={0.12}
          stroke="none"
          clipPath={`url(#${belowZeroClipId})`}
        />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-success)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          clipPath={`url(#${aboveZeroClipId})`}
        />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-danger)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          clipPath={`url(#${belowZeroClipId})`}
        />

        {/* Crosshair + hovered point */}
        {hovered && hoverIndex !== null && (
          <g>
            <line
              x1={xAt(hoverIndex)}
              x2={xAt(hoverIndex)}
              y1={PADDING.top}
              y2={VIEW_HEIGHT - PADDING.bottom}
              stroke="var(--color-muted-foreground)"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
            <circle
              cx={xAt(hoverIndex)}
              cy={pointY}
              r={5}
              fill={hoveredColor}
              stroke="var(--color-card)"
              strokeWidth={2}
            />
          </g>
        )}
      </svg>

      {/* Tooltip (HTML, positioned over the SVG by percentage) */}
      {hovered && hoverIndex !== null && (
        <div
          className="pointer-events-none absolute rounded-lg border border-border bg-card px-3 py-2 shadow-lg"
          style={{
            left: `${(tooltipX / VIEW_WIDTH) * 100}%`,
            top: `${(pointY / VIEW_HEIGHT) * 100}%`,
            width: tooltipWidth,
            transform: tooltipBelow ? "translateY(10%)" : "translateY(-110%)",
          }}
        >
          <p className="text-xs text-muted-foreground">
            {hovered.year} · age {hovered.age}
          </p>
          <p className="text-base font-semibold" style={{ color: hoveredColor }}>
            {formatCurrency(hovered.balance)}
          </p>
          <p className="text-xs text-muted-foreground">
            Money needed: {formatCurrency(hovered.totalForYear)}
          </p>
        </div>
      )}
    </div>
  );
}
