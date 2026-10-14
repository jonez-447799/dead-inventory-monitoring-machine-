import React, { useState, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { RulesConfig, CurrencyCode, OwnerReportSummary } from '../types';
import { formatCurrency } from '../utils/calculations';
import { 
  TrendingUp, 
  Flame, 
  ShieldCheck, 
  Sparkles, 
  Sliders, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';

export interface CashSavingsProjectionChartProps {
  summary: OwnerReportSummary;
  rules: RulesConfig;
  currency: CurrencyCode;
  height?: number;
  className?: string;
}

export interface MonthlyProjectionPoint {
  month: number;
  monthName: string;
  capitalRecovered: number;
  cumulativeInterestSaved: number;
  totalCashBenefit: number;
  cumulativeInactionBleed: number;
  remainingDeadStock: number;
}

export const CashSavingsProjectionChart: React.FC<CashSavingsProjectionChartProps> = ({
  summary,
  rules,
  currency,
  height = 320,
  className = '',
}) => {
  // Configurable liquidation target pace (25%, 50%, 75%, 100%)
  const defaultTarget = rules.targetCashReleasePercent || 50;
  const [liquidationPace, setLiquidationPace] = useState<number>(defaultTarget);
  // Configurable annual holding rate (defaults to rules.holdingCostPercent, e.g. 18%)
  const [customHoldingRate, setCustomHoldingRate] = useState<number>(rules.holdingCostPercent || 18);
  // Hovered month index (1 to 12) for interactive tooltip
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Month names starting from current As-Of date
  const monthLabels = useMemo(() => {
    const asOf = new Date(rules.asOfDate || '2026-10-01');
    const labels: string[] = [];
    for (let i = 1; i <= 12; i++) {
      const d = new Date(asOf.getFullYear(), asOf.getMonth() + i, 1);
      labels.push(d.toLocaleString('en-US', { month: 'short' }) + ' ' + String(d.getFullYear()).slice(-2));
    }
    return labels;
  }, [rules.asOfDate]);

  // Compute 12-Month Mathematical Projection Series
  const projectionData: MonthlyProjectionPoint[] = useMemo(() => {
    const deadStockVal = summary.deadCash || 0;
    const annualRate = (customHoldingRate || 18) / 100;
    const monthlyRate = annualRate / 12;
    const targetFraction = (liquidationPace || 50) / 100;
    const targetLiquidatedCapital = deadStockVal * targetFraction;

    const data: MonthlyProjectionPoint[] = [];
    let runningInterestSaved = 0;

    for (let m = 1; m <= 12; m++) {
      // Fraction of target cleared by month m (steady 12-month pacing)
      const progress = m / 12;
      const capitalRecovered = Math.round(targetLiquidatedCapital * progress);
      const remainingDeadStock = Math.max(0, deadStockVal - capitalRecovered);

      // In month m, the capital recovered so far stops paying bank interest
      const monthlyInterestAvoided = capitalRecovered * monthlyRate;
      runningInterestSaved += monthlyInterestAvoided;

      // Cumulative Inaction Bleed (Cost of doing nothing on entire dead pile)
      const cumulativeInactionBleed = Math.round(deadStockVal * monthlyRate * m);

      data.push({
        month: m,
        monthName: monthLabels[m - 1] || `M${m}`,
        capitalRecovered,
        cumulativeInterestSaved: Math.round(runningInterestSaved),
        totalCashBenefit: Math.round(capitalRecovered + runningInterestSaved),
        cumulativeInactionBleed,
        remainingDeadStock,
      });
    }

    return data;
  }, [summary.deadCash, customHoldingRate, liquidationPace, monthLabels]);

  // Final 12-Month Totals
  const finalMonth = projectionData[projectionData.length - 1] || {
    totalCashBenefit: 0,
    capitalRecovered: 0,
    cumulativeInterestSaved: 0,
    cumulativeInactionBleed: 0,
    remainingDeadStock: 0,
  };

  // ---------------- D3 SCALES & PATH GENERATORS ----------------
  const chartLayout = useMemo(() => {
    const margin = { top: 32, right: 30, bottom: 44, left: 75 };
    const width = 680;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // X Scale: 1 to 12
    const xScale = d3
      .scaleLinear()
      .domain([1, 12])
      .range([margin.left, margin.left + innerWidth]);

    // Max Y Value across Total Benefit and Inaction Bleed
    const maxY = Math.max(
      d3.max(projectionData, (d) => d.totalCashBenefit) || 1000,
      d3.max(projectionData, (d) => d.cumulativeInactionBleed) || 1000
    );

    const yScale = d3
      .scaleLinear()
      .domain([0, maxY * 1.15]) // 15% headroom
      .nice()
      .range([margin.top + innerHeight, margin.top]);

    // D3 Line Generator for Total Cash Benefit (Emerald/Cyan)
    const lineTotal = d3
      .line<MonthlyProjectionPoint>()
      .x((d) => xScale(d.month))
      .y((d) => yScale(d.totalCashBenefit))
      .curve(d3.curveMonotoneX);

    // D3 Area Generator for Total Cash Benefit
    const areaTotal = d3
      .area<MonthlyProjectionPoint>()
      .x((d) => xScale(d.month))
      .y0(margin.top + innerHeight)
      .y1((d) => yScale(d.totalCashBenefit))
      .curve(d3.curveMonotoneX);

    // D3 Line Generator for Bank Interest Saved (Amber)
    const lineInterest = d3
      .line<MonthlyProjectionPoint>()
      .x((d) => xScale(d.month))
      .y((d) => yScale(d.cumulativeInterestSaved))
      .curve(d3.curveMonotoneX);

    // D3 Line Generator for Inaction Cost (Rose)
    const lineInaction = d3
      .line<MonthlyProjectionPoint>()
      .x((d) => xScale(d.month))
      .y((d) => yScale(d.cumulativeInactionBleed))
      .curve(d3.curveMonotoneX);

    const yTicks = yScale.ticks(5);

    return {
      width,
      height,
      margin,
      innerWidth,
      innerHeight,
      xScale,
      yScale,
      lineTotal,
      areaTotal,
      lineInterest,
      lineInaction,
      yTicks,
    };
  }, [projectionData, height]);

  // Selected point for inspection (defaults to Month 12 when not hovering)
  const activePoint = hoveredMonth
    ? projectionData.find((p) => p.month === hoveredMonth) || finalMonth
    : finalMonth;

  return (
    <div
      ref={containerRef}
      className={`p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4 ${className}`}
    >
      {/* Header & Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>12-Month Cash Recovery &amp; Interest Savings Projection</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                D3 Model
              </span>
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Simulates capital unlocked plus avoided bank overdraft holding burn over the next 12 calendar months.
          </p>
        </div>

        {/* Simulation Controls: Target Pace & Bank Rate */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Liquidation Pace Selector */}
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg text-xs font-semibold">
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 px-1.5">Pace:</span>
            {[25, 50, 75, 100].map((pace) => (
              <button
                key={pace}
                onClick={() => setLiquidationPace(pace)}
                className={`px-2.5 py-1 rounded-md transition-all font-mono ${
                  liquidationPace === pace
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {pace}%
              </button>
            ))}
          </div>

          {/* Bank OD Holding Rate Dropdown */}
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg text-xs">
            <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Bank OD:</span>
            <select
              aria-label="Bank OD Holding Cost Rate"
              value={customHoldingRate}
              onChange={(e) => setCustomHoldingRate(parseFloat(e.target.value))}
              className="bg-transparent font-mono font-bold text-neutral-900 dark:text-neutral-100 focus:outline-none cursor-pointer text-xs"
            >
              <option value="12">12.0% p.a.</option>
              <option value="15">15.0% p.a.</option>
              <option value="18">18.0% p.a. (Std)</option>
              <option value="21">21.0% p.a.</option>
              <option value="24">24.0% p.a.</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3 Top Macro KPI Projection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Total 12-Month Net Cash Benefit */}
        <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <span>Projected 12M Cash Boost</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            +{formatCurrency(finalMonth.totalCashBenefit, currency)}
          </div>
          <div className="text-[11px] text-emerald-900/70 dark:text-emerald-300/80 mt-1">
            {formatCurrency(finalMonth.capitalRecovered, currency)} principal + {formatCurrency(finalMonth.cumulativeInterestSaved, currency)} OD interest
          </div>
        </div>

        {/* Card 2: Cumulative Bank OD Interest Saved */}
        <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 text-xs font-semibold">
            <span>Bank Interest Avoided</span>
            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300">
            +{formatCurrency(finalMonth.cumulativeInterestSaved, currency)}
          </div>
          <div className="text-[11px] text-amber-900/70 dark:text-amber-300/80 mt-1">
            Permanent bank finance charge relief over 12 months
          </div>
        </div>

        {/* Card 3: Inaction Cost (What staying idle burns) */}
        <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 shadow-xs">
          <div className="flex items-center justify-between text-rose-800 dark:text-rose-300 text-xs font-semibold">
            <span>Cost of Inaction (12M Bleed)</span>
            <Flame className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-1 font-mono text-xl sm:text-2xl font-bold text-rose-700 dark:text-rose-300">
            -{formatCurrency(finalMonth.cumulativeInactionBleed, currency)}
          </div>
          <div className="text-[11px] text-rose-900/70 dark:text-rose-300/80 mt-1">
            Bank interest burned if dead stock is left untouched
          </div>
        </div>
      </div>

      {/* D3 Multi-Series Trend Chart Viewport */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartLayout.width} ${chartLayout.height}`}
          className="w-full h-auto max-h-[340px] overflow-visible select-none"
          aria-label="12-month projected cash savings and bank interest reduction chart"
        >
          <defs>
            {/* Emerald Gradient for Total Benefit Area */}
            <linearGradient id="cashBenefitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>

            {/* Line Gradients */}
            <linearGradient id="emeraldStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines & Ticks */}
          {chartLayout.yTicks.map((tickVal) => {
            const y = chartLayout.yScale(tickVal);
            return (
              <g key={`ytick-${tickVal}`}>
                <line
                  x1={chartLayout.margin.left}
                  y1={y}
                  x2={chartLayout.width - chartLayout.margin.right}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  className="text-neutral-200 dark:text-neutral-800"
                />
                <text
                  x={chartLayout.margin.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="font-mono text-[10px] fill-neutral-400 dark:fill-neutral-500"
                >
                  {formatCurrency(tickVal, currency).replace(/\.00$/, '')}
                </text>
              </g>
            );
          })}

          {/* Area Fill for Total Cash Benefit */}
          <path
            d={chartLayout.areaTotal(projectionData) || ''}
            fill="url(#cashBenefitGrad)"
            className="transition-all duration-300"
          />

          {/* Curve 1: Total Net Cash Benefit (Emerald/Cyan, bold 3px) */}
          <path
            d={chartLayout.lineTotal(projectionData) || ''}
            fill="none"
            stroke="url(#emeraldStroke)"
            strokeWidth={3}
            strokeLinecap="round"
            className="transition-all duration-300 drop-shadow-sm"
          />

          {/* Curve 2: Bank Interest Avoided (Amber, 2px) */}
          <path
            d={chartLayout.lineInterest(projectionData) || ''}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Curve 3: Inaction Interest Bleed (Rose dashed, 2px) */}
          <path
            d={chartLayout.lineInaction(projectionData) || ''}
            fill="none"
            stroke="#f43f5e"
            strokeWidth={2}
            strokeDasharray="4 4"
            className="transition-all duration-300 opacity-75"
          />

          {/* X-Axis Month Markers & Interactive Column Targets */}
          {projectionData.map((d) => {
            const x = chartLayout.xScale(d.month);
            const isHovered = hoveredMonth === d.month;
            const yTotal = chartLayout.yScale(d.totalCashBenefit);
            const yInaction = chartLayout.yScale(d.cumulativeInactionBleed);

            return (
              <g
                key={`col-${d.month}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredMonth(d.month)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Transparent hit area for hover */}
                <rect
                  x={x - chartLayout.innerWidth / 24}
                  y={chartLayout.margin.top}
                  width={chartLayout.innerWidth / 12}
                  height={chartLayout.innerHeight}
                  fill="transparent"
                />

                {/* Vertical hover indicator line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={chartLayout.margin.top}
                    x2={x}
                    y2={chartLayout.margin.top + chartLayout.innerHeight}
                    stroke="currentColor"
                    strokeDasharray="2 2"
                    className="text-amber-500 dark:text-amber-400"
                    strokeWidth={1.5}
                  />
                )}

                {/* Point on Total Benefit Line */}
                <circle
                  cx={x}
                  cy={yTotal}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#06b6d4"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  className="transition-all duration-200"
                />

                {/* Point on Inaction Line */}
                <circle
                  cx={x}
                  cy={yInaction}
                  r={isHovered ? 4.5 : 2.5}
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth={1}
                  className="transition-all duration-200"
                />

                {/* Month Label below X-axis */}
                <text
                  x={x}
                  y={chartLayout.margin.top + chartLayout.innerHeight + 18}
                  textAnchor="middle"
                  className={`font-mono text-[10px] transition-colors ${
                    isHovered
                      ? 'fill-amber-500 dark:fill-amber-400 font-bold'
                      : 'fill-neutral-500 dark:fill-neutral-400'
                  }`}
                >
                  M{d.month}
                </text>

                {/* Short Calendar Month text (every 2 months or on hover) */}
                <text
                  x={x}
                  y={chartLayout.margin.top + chartLayout.innerHeight + 31}
                  textAnchor="middle"
                  className={`text-[9px] font-sans ${
                    isHovered ? 'fill-neutral-900 dark:fill-white font-bold' : 'fill-neutral-400 dark:fill-neutral-500'
                  }`}
                >
                  {d.monthName.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-5 pt-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 inline-block shadow-xs" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Total Cash Boost (Capital Freed + Interest Avoided)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-1.5 rounded-sm bg-amber-500 inline-block" />
            <span className="text-neutral-600 dark:text-neutral-400">
              Bank OD Interest Avoided
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-0 border-t-2 border-dashed border-rose-500 inline-block" />
            <span className="text-neutral-600 dark:text-neutral-400">
              Cost of Inaction (Status Quo Bleed)
            </span>
          </div>
        </div>

        {/* Interactive Month Inspection Pill / Tooltip Card */}
        <div className="mt-3 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                Month {activePoint.month}: {activePoint.monthName}
              </span>
              <span className="text-neutral-500 text-[11px]">
                {hoveredMonth ? '(Hovering inspection)' : '(12-Month Horizon Target)'}
              </span>
            </div>

            <div className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              +{formatCurrency(activePoint.totalCashBenefit, currency)} Net Cash Advantage
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
            <div>
              <span className="text-[10px] text-neutral-500 block">Principal Unlocked:</span>
              <strong className="text-neutral-900 dark:text-neutral-100">
                {formatCurrency(activePoint.capitalRecovered, currency)}
              </strong>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 block">Bank Interest Saved:</span>
              <strong className="text-amber-600 dark:text-amber-400">
                {formatCurrency(activePoint.cumulativeInterestSaved, currency)}
              </strong>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 block">Remaining Dead Pile:</span>
              <strong className="text-neutral-700 dark:text-neutral-300">
                {formatCurrency(activePoint.remainingDeadStock, currency)}
              </strong>
            </div>

            <div>
              <span className="text-[10px] text-rose-500 block">Bleed if Unchanged:</span>
              <strong className="text-rose-600 dark:text-rose-400">
                -{formatCurrency(activePoint.cumulativeInactionBleed, currency)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Owner Guidance Note */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <strong>Owner Action Rule:</strong> Liquidating {liquidationPace}% of dead stock unlocks{' '}
          <strong className="text-neutral-900 dark:text-neutral-100 font-mono">
            {formatCurrency(finalMonth.capitalRecovered, currency)}
          </strong>{' '}
          directly back into your working capital while wiping out{' '}
          <strong className="text-amber-600 dark:text-amber-400 font-mono">
            {formatCurrency(finalMonth.cumulativeInterestSaved, currency)}
          </strong>{' '}
          in finance interest paid to the bank every year.
        </div>
      </div>
    </div>
  );
};

export default CashSavingsProjectionChart;
