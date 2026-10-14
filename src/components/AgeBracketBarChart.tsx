import React, { useState, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { StockItem, RulesConfig, CurrencyCode } from '../types';
import { evaluateStockEngine, formatCurrency } from '../utils/calculations';
import { BarChart3, Info, AlertTriangle, CheckCircle2, Clock, Flame, ChevronRight } from 'lucide-react';

export interface AgeBracketBarChartProps {
  items: StockItem[];
  rules: RulesConfig;
  currency: CurrencyCode;
  height?: number;
  className?: string;
  onSelectBracket?: (bracketId: string) => void;
}

export interface AgeBracketData {
  id: '0-30' | '31-90' | '91-180' | '180+';
  label: string;
  subLabel: string;
  statusCategory: 'Healthy' | 'Normal' | 'Slow' | 'Dead';
  minDays: number;
  maxDays: number;
  totalValue: number;
  itemCount: number;
  percentOfTotal: number;
  annualHoldingBurn: number;
  color: string;
  gradientStart: string;
  gradientEnd: string;
  items: Array<{
    itemCode: string;
    itemName: string;
    closingValue: number;
    daysIdle: number;
  }>;
}

export const AgeBracketBarChart: React.FC<AgeBracketBarChartProps> = ({
  items,
  rules,
  currency,
  height = 280,
  className = '',
  onSelectBracket,
}) => {
  // Metric display mode: 'value' | 'count'
  const [metricMode, setMetricMode] = useState<'value' | 'count'>('value');
  const [hoveredBracket, setHoveredBracket] = useState<AgeBracketData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Evaluate stock items with formulas applied
  const evaluatedItems = useMemo(() => {
    return evaluateStockEngine(items, rules);
  }, [items, rules]);

  // Total inventory metrics
  const totalStockValue = useMemo(() => {
    return evaluatedItems.reduce((acc, i) => acc + (i.closingValue || 0), 0);
  }, [evaluatedItems]);

  // Aggregate inventory by the 4 age brackets
  const bracketData: AgeBracketData[] = useMemo(() => {
    const buckets: Record<'0-30' | '31-90' | '91-180' | '180+', AgeBracketData> = {
      '0-30': {
        id: '0-30',
        label: '0–30 Days',
        subLabel: 'Active / Fresh',
        statusCategory: 'Healthy',
        minDays: 0,
        maxDays: 30,
        totalValue: 0,
        itemCount: 0,
        percentOfTotal: 0,
        annualHoldingBurn: 0,
        color: '#10b981', // emerald-500
        gradientStart: '#34d399',
        gradientEnd: '#059669',
        items: [],
      },
      '31-90': {
        id: '31-90',
        label: '31–90 Days',
        subLabel: 'Normal Turnover',
        statusCategory: 'Normal',
        minDays: 31,
        maxDays: 90,
        totalValue: 0,
        itemCount: 0,
        percentOfTotal: 0,
        annualHoldingBurn: 0,
        color: '#64748b', // slate-500 (standard turnover harmonized with industrial palette)
        gradientStart: '#94a3b8',
        gradientEnd: '#475569',
        items: [],
      },
      '91-180': {
        id: '91-180',
        label: '91–180 Days',
        subLabel: 'Slow / At Risk',
        statusCategory: 'Slow',
        minDays: 91,
        maxDays: 180,
        totalValue: 0,
        itemCount: 0,
        percentOfTotal: 0,
        annualHoldingBurn: 0,
        color: '#f59e0b', // amber-500
        gradientStart: '#fbbf24',
        gradientEnd: '#d97706',
        items: [],
      },
      '180+': {
        id: '180+',
        label: '180+ Days',
        subLabel: 'Dead Cash Pile',
        statusCategory: 'Dead',
        minDays: 181,
        maxDays: Infinity,
        totalValue: 0,
        itemCount: 0,
        percentOfTotal: 0,
        annualHoldingBurn: 0,
        color: '#f43f5e', // rose-500
        gradientStart: '#fb7185',
        gradientEnd: '#e11d48',
        items: [],
      },
    };

    evaluatedItems.forEach((item) => {
      const days = item.daysIdle || 0;
      const val = item.closingValue || 0;

      let key: '0-30' | '31-90' | '91-180' | '180+';
      if (days <= 30) {
        key = '0-30';
      } else if (days <= 90) {
        key = '31-90';
      } else if (days <= 180) {
        key = '91-180';
      } else {
        key = '180+';
      }

      buckets[key].totalValue += val;
      buckets[key].itemCount += 1;
      buckets[key].items.push({
        itemCode: item.itemCode,
        itemName: item.itemName,
        closingValue: val,
        daysIdle: days,
      });
    });

    // Sort items inside each bucket by value descending
    Object.values(buckets).forEach((b) => {
      b.items.sort((a, b) => b.closingValue - a.closingValue);
      b.percentOfTotal = totalStockValue > 0 ? (b.totalValue / totalStockValue) * 100 : 0;
      b.annualHoldingBurn = Math.round(b.totalValue * (rules.holdingCostPercent / 100));
    });

    return [buckets['0-30'], buckets['31-90'], buckets['91-180'], buckets['180+']];
  }, [evaluatedItems, totalStockValue, rules.holdingCostPercent]);

  // ---------------- D3 SCALES & LAYOUT CALCULATIONS ----------------
  const chartLayout = useMemo(() => {
    const margin = { top: 28, right: 20, bottom: 42, left: 65 };
    const width = 640; // Internal SVG coordinate width
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // X Scale: Categorical Band Scale for Brackets
    const xScale = d3
      .scaleBand()
      .domain(bracketData.map((d) => d.id))
      .range([margin.left, margin.left + innerWidth])
      .padding(0.32);

    // Y Scale: Linear Scale for Value or Count
    const maxValue = d3.max(bracketData, (d) =>
      metricMode === 'value' ? d.totalValue : d.itemCount
    ) || 100;

    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue * 1.15]) // 15% headroom for top value labels
      .nice()
      .range([margin.top + innerHeight, margin.top]);

    // Horizontal grid ticks (5 steps)
    const yTicks = yScale.ticks(4);

    return {
      width,
      height,
      margin,
      innerWidth,
      innerHeight,
      xScale,
      yScale,
      yTicks,
    };
  }, [bracketData, height, metricMode]);

  // Aggregate healthy vs at-risk stock
  const activeStockValue = (bracketData[0]?.totalValue || 0) + (bracketData[1]?.totalValue || 0);
  const dormantStockValue = (bracketData[2]?.totalValue || 0) + (bracketData[3]?.totalValue || 0);
  const dormantPercent = totalStockValue > 0 ? (dormantStockValue / totalStockValue) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`p-5 rounded-xl glass-card shadow-xs space-y-4 ${className}`}
    >
      {/* Header with Title and Metric Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <span>Inventory Aging Distribution by Bracket</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                D3 Engine
              </span>
            </h3>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Trapped capital stratified into 0–30d, 31–90d, 91–180d, and 180+d stagnant tiers.
          </p>
        </div>

        {/* Metric Selector Toggle (Value vs Count) */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setMetricMode('value')}
            className={`px-3 py-1 rounded-md transition-all ${
              metricMode === 'value'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-bold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            By Trapped Value ({currency})
          </button>
          <button
            onClick={() => setMetricMode('count')}
            className={`px-3 py-1 rounded-md transition-all ${
              metricMode === 'count'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-bold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            By SKU Count
          </button>
        </div>
      </div>

      {/* Responsive D3 SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartLayout.width} ${chartLayout.height}`}
          className="w-full h-auto max-h-[300px] overflow-visible select-none"
          aria-label="Inventory age bracket distribution bar chart"
        >
          <defs>
            {bracketData.map((d) => (
              <linearGradient
                key={`grad-${d.id}`}
                id={`bracket-grad-${d.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={d.gradientStart} stopOpacity={0.95} />
                <stop offset="100%" stopColor={d.gradientEnd} stopOpacity={0.8} />
              </linearGradient>
            ))}
          </defs>

          {/* Background Horizontal Grid Lines & Y-Axis Labels */}
          {chartLayout.yTicks.map((tickVal) => {
            const y = chartLayout.yScale(tickVal);
            return (
              <g key={`tick-${tickVal}`} className="transition-all duration-300">
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
                  x={chartLayout.margin.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="font-mono text-[10px] fill-neutral-400 dark:fill-neutral-500"
                >
                  {metricMode === 'value'
                    ? formatCurrency(tickVal, currency).replace(/\.00$/, '')
                    : `${tickVal} SKUs`}
                </text>
              </g>
            );
          })}

          {/* X-Axis Baseline */}
          <line
            x1={chartLayout.margin.left}
            y1={chartLayout.margin.top + chartLayout.innerHeight}
            x2={chartLayout.width - chartLayout.margin.right}
            y2={chartLayout.margin.top + chartLayout.innerHeight}
            stroke="currentColor"
            className="text-neutral-300 dark:text-neutral-700"
          />

          {/* D3 Bars for each Bracket */}
          {bracketData.map((d) => {
            const x = chartLayout.xScale(d.id) || 0;
            const barW = chartLayout.xScale.bandwidth();
            const currentVal = metricMode === 'value' ? d.totalValue : d.itemCount;
            const y = chartLayout.yScale(currentVal);
            const barH = Math.max(4, chartLayout.margin.top + chartLayout.innerHeight - y);
            const isHovered = hoveredBracket?.id === d.id;

            return (
              <g
                key={d.id}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredBracket(d)}
                onMouseLeave={() => setHoveredBracket(null)}
                onClick={() => onSelectBracket?.(d.id)}
              >
                {/* Bar Glow on Hover */}
                {isHovered && (
                  <rect
                    x={x - 3}
                    y={y - 3}
                    width={barW + 6}
                    height={barH + 6}
                    rx={6}
                    ry={6}
                    fill={d.color}
                    opacity={0.25}
                  />
                )}

                {/* Primary Animated D3 Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx={5}
                  ry={5}
                  fill={`url(#bracket-grad-${d.id})`}
                  className={`transition-all duration-300 ${
                    isHovered ? 'opacity-100 filter drop-shadow-md' : 'opacity-90 hover:opacity-100'
                  }`}
                />

                {/* Value Label above Bar */}
                <text
                  x={x + barW / 2}
                  y={y - 7}
                  textAnchor="middle"
                  className={`font-mono text-[11px] font-bold transition-all ${
                    isHovered
                      ? 'fill-neutral-900 dark:fill-white font-extrabold'
                      : 'fill-neutral-700 dark:fill-neutral-300'
                  }`}
                >
                  {metricMode === 'value'
                    ? formatCurrency(d.totalValue, currency).replace(/\.00$/, '')
                    : `${d.itemCount} SKUs`}
                </text>

                {/* Percentage Pill above Value */}
                <text
                  x={x + barW / 2}
                  y={y - 20}
                  textAnchor="middle"
                  className="font-mono text-[9px] font-semibold fill-neutral-400 dark:fill-neutral-500"
                >
                  {d.percentOfTotal.toFixed(1)}% of total
                </text>

                {/* X-Axis Category Label below Bar */}
                <text
                  x={x + barW / 2}
                  y={chartLayout.margin.top + chartLayout.innerHeight + 16}
                  textAnchor="middle"
                  className={`text-[11px] font-bold transition-colors ${
                    isHovered
                      ? 'fill-amber-500 dark:fill-amber-400'
                      : 'fill-neutral-800 dark:fill-neutral-200'
                  }`}
                >
                  {d.label}
                </text>

                {/* Subtitle (Health / Status) */}
                <text
                  x={x + barW / 2}
                  y={chartLayout.margin.top + chartLayout.innerHeight + 30}
                  textAnchor="middle"
                  className="text-[10px] font-sans fill-neutral-400 dark:fill-neutral-500"
                >
                  {d.subLabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Detailed Inspection Card when hovered */}
        {hoveredBracket && (
          <div className="mt-3 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/80 text-xs space-y-2 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: hoveredBracket.color }}
                />
                <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                  {hoveredBracket.label} ({hoveredBracket.subLabel})
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
                  {hoveredBracket.itemCount} SKUs ({hoveredBracket.percentOfTotal.toFixed(1)}% of stock)
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                  {formatCurrency(hoveredBracket.totalValue, currency)}
                </span>
                <span className="text-[10px] text-neutral-500 block">
                  ~{formatCurrency(hoveredBracket.annualHoldingBurn, currency)}/yr holding burn
                </span>
              </div>
            </div>

            {/* Top items in this bracket */}
            <div className="pt-1">
              <span className="text-[10px] uppercase font-semibold text-neutral-400 block mb-1">
                Largest Items in this Tier:
              </span>
              <div className="flex flex-wrap gap-2">
                {hoveredBracket.items.slice(0, 4).map((it) => (
                  <span
                    key={it.itemCode}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono"
                  >
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[140px]">
                      {it.itemName}
                    </span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-600 dark:text-neutral-400 font-bold">
                      {formatCurrency(it.closingValue, currency)}
                    </span>
                    <span className="text-[10px] text-neutral-400">({it.daysIdle}d)</span>
                  </span>
                ))}
                {hoveredBracket.items.length > 4 && (
                  <span className="text-[11px] text-neutral-400 self-center">
                    +{hoveredBracket.items.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4 Bracket Macro Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {bracketData.map((d) => (
          <div
            key={d.id}
            onMouseEnter={() => setHoveredBracket(d)}
            onMouseLeave={() => setHoveredBracket(null)}
            className={`p-3 rounded-lg border transition-all text-xs cursor-pointer ${
              hoveredBracket?.id === d.id
                ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs'
                : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span>{d.label}</span>
              </span>
              <span className="font-mono text-[10px] text-neutral-500 font-semibold">
                {d.percentOfTotal.toFixed(0)}%
              </span>
            </div>
            <div className="mt-1.5 font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(d.totalValue, currency)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400">
              <span>{d.itemCount} SKUs</span>
              {d.id === '180+' && (
                <span className="text-rose-600 dark:text-rose-400 font-semibold">Critical</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Executive Health Takeaway Bar */}
      <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {dormantPercent > 20 ? (
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
          <span className="text-neutral-700 dark:text-neutral-300">
            <strong>{dormantPercent.toFixed(1)}% of inventory value</strong> ({formatCurrency(dormantStockValue, currency)}) is older than 90 days.
          </span>
        </div>
        <div className="font-mono text-neutral-500 dark:text-neutral-400 text-[11px] shrink-0">
          Target Health: &lt;15% in 91d+ brackets
        </div>
      </div>
    </div>
  );
};

export default AgeBracketBarChart;
