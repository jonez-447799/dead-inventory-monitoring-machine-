import React, { useState, useMemo } from 'react';
import { StockItem, RulesConfig, CurrencyCode } from '../types';
import { evaluateStockEngine, formatCurrency } from '../utils/calculations';
import { 
  AlertTriangle, 
  Flame, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Bell, 
  Send, 
  ArrowRight, 
  ShieldAlert, 
  X,
  Filter,
  Sparkles
} from 'lucide-react';

export interface ThresholdBreachNotificationProps {
  items: StockItem[];
  rules: RulesConfig;
  currency: CurrencyCode;
  onNavigateToStock: () => void;
}

export interface BreachedItemDetail {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  daysIdle: number;
  daysOverCutoff: number;
  breachDate: string;
  closingValue: number;
  dailyBurn: number;
  statusType: 'critical' | 'recent' | 'imminent';
  daysUntilCutoff?: number;
  abcClass: string;
  action: string;
}

export const ThresholdBreachNotification: React.FC<ThresholdBreachNotificationProps> = ({
  items,
  rules,
  currency,
  onNavigateToStock,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'imminent'>('all');
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Evaluate items with rules
  const evaluatedItems = useMemo(() => {
    return evaluateStockEngine(items, rules);
  }, [items, rules]);

  // Helper to calculate exact calendar date when an item breached the cutoff
  const calculateBreachDate = (lastMovementStr: string, thresholdDays: number): string => {
    try {
      const parts = lastMovementStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        d.setDate(d.getDate() + thresholdDays);
        return d.toISOString().split('T')[0];
      }
    } catch {
      // fallback
    }
    return 'Unknown';
  };

  // Analyze breached items and imminent items
  const { breachedList, imminentList, totalBreachedValue, totalDailyBleed, recentBreachesCount } = useMemo(() => {
    const breached: BreachedItemDetail[] = [];
    const imminent: BreachedItemDetail[] = [];
    let breachedVal = 0;
    let dailyBleed = 0;
    let recentCount = 0;

    const annualRate = (rules.holdingCostPercent || 18) / 100;
    const dailyRate = annualRate / 365;

    evaluatedItems.forEach((item) => {
      const days = item.daysIdle || 0;
      const val = item.closingValue || 0;
      const daysOver = days - rules.deadThresholdDays;
      const breachDate = calculateBreachDate(item.lastMovement, rules.deadThresholdDays);
      const itemDailyBurn = Math.round(val * dailyRate);

      if (days >= rules.deadThresholdDays) {
        // Item has crossed the Dead threshold
        const isRecent = daysOver <= 60; // crossed within 60 days
        if (isRecent) recentCount++;
        breachedVal += val;
        dailyBleed += itemDailyBurn;

        breached.push({
          id: item.id,
          itemCode: item.itemCode,
          itemName: item.itemName,
          category: item.category,
          daysIdle: days,
          daysOverCutoff: daysOver,
          breachDate,
          closingValue: val,
          dailyBurn: itemDailyBurn,
          statusType: isRecent ? 'recent' : 'critical',
          abcClass: item.abcClass || 'C',
          action: item.action || 'Liquidate immediately',
        });
      } else if (days >= rules.deadThresholdDays - 30) {
        // Imminent breach: will cross Dead threshold in <30 days
        const daysUntil = rules.deadThresholdDays - days;
        imminent.push({
          id: item.id,
          itemCode: item.itemCode,
          itemName: item.itemName,
          category: item.category,
          daysIdle: days,
          daysOverCutoff: 0,
          breachDate,
          closingValue: val,
          dailyBurn: itemDailyBurn,
          statusType: 'imminent',
          daysUntilCutoff: daysUntil,
          abcClass: item.abcClass || 'C',
          action: 'Freeze reorders. Expedite issue.',
        });
      }
    });

    // Sort breached by closing value descending
    breached.sort((a, b) => b.closingValue - a.closingValue);
    imminent.sort((a, b) => b.closingValue - a.closingValue);

    return {
      breachedList: breached,
      imminentList: imminent,
      totalBreachedValue: breachedVal,
      totalDailyBleed: dailyBleed,
      recentBreachesCount: recentCount,
    };
  }, [evaluatedItems, rules.deadThresholdDays, rules.holdingCostPercent]);

  // If dismissed or no items crossed/imminent, show minimal pill or nothing
  if (isDismissed) {
    return (
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs">
        <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-semibold">
            Threshold Alert Snoozed: {breachedList.length} items currently past {rules.deadThresholdDays}d cutoff ({formatCurrency(totalBreachedValue, currency)})
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-rose-700 dark:text-rose-400 font-bold hover:underline"
        >
          Re-open Alert Drawer
        </button>
      </div>
    );
  }

  // Filter items based on active tab
  const displayItems = useMemo(() => {
    if (activeTab === 'recent') {
      return breachedList.filter((i) => i.statusType === 'recent');
    }
    if (activeTab === 'imminent') {
      return imminentList;
    }
    return breachedList;
  }, [activeTab, breachedList, imminentList]);

  return (
    <div className="rounded-xl glass-card overflow-hidden transition-all shadow-xs">
      {/* 1. Header Bar: Quiet Professional Exception Indicator */}
      <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0 border border-rose-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Dead Stock Cutoff Exceptions
              </h2>

              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                Cutoff: &ge;{rules.deadThresholdDays}d Idle
              </span>
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
              <span className="text-xs font-mono font-semibold text-rose-600 dark:text-rose-400">
                {breachedList.length} SKUs ({formatCurrency(totalBreachedValue, currency)})
              </span>
            </div>

            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {breachedList.length} items have exceeded the {rules.deadThresholdDays}-day cutoff. Burning{' '}
              <strong className="text-rose-600 dark:text-rose-400 font-mono font-semibold">
                ~{formatCurrency(totalDailyBleed, currency)}/day
              </strong>{' '}
              in estimated finance holding interest.
            </p>
          </div>
        </div>

        {/* Action Buttons: Expand/Collapse & Dismiss */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <span>{isExpanded ? 'Hide Details' : 'View Exception SKUs'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Snooze Alert"
            aria-label="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Expandable Notification Center Drawer */}
      {isExpanded && (
        <div className="p-3.5 sm:p-4 space-y-3 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-xs">
          {/* Sub-Tabs: All Breached vs Recent Crossings vs Imminent Warnings */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'all'
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span>All Breached</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-white">
                  {breachedList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('recent')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'recent'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span>Recently Crossed (&le;60d)</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-white">
                  {recentBreachesCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('imminent')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'imminent'
                    ? 'bg-slate-700 dark:bg-slate-600 text-white font-bold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span>Imminent Breach (&lt;30d to cutoff)</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-white">
                  {imminentList.length}
                </span>
              </button>
            </div>

            <button
              onClick={onNavigateToStock}
              className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>Inspect all in Stock Engine</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* List of Breached / Imminent Items */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {displayItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-500 font-mono">
                No items matching this alert category.
              </div>
            ) : (
              displayItems.map((item) => {
                const isImminent = item.statusType === 'imminent';
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/40 hover:border-rose-400 dark:hover:border-rose-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {/* Visual Badge Indicator */}
                      <span
                        className={`industrial-badge shrink-0 flex items-center gap-1 mt-0.5 ${
                          isImminent
                            ? 'industrial-badge-slate'
                            : item.statusType === 'recent'
                            ? 'industrial-badge-amber'
                            : 'industrial-badge-rose'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        {isImminent ? (
                          <span>Crossing in {item.daysUntilCutoff}d</span>
                        ) : (
                          <span>+{item.daysOverCutoff}d Past Cutoff</span>
                        )}
                      </span>

                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 flex-wrap">
                          <span className="truncate">{item.itemName}</span>
                          <span className="font-mono text-[10px] text-neutral-400">({item.itemCode})</span>
                          <span className={`industrial-badge ${
                            item.abcClass === 'A'
                              ? 'industrial-badge-rose'
                              : item.abcClass === 'B'
                              ? 'industrial-badge-amber'
                              : 'industrial-badge-slate'
                          }`}>
                            Class {item.abcClass}
                          </span>
                        </div>

                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono">
                          <span>Age: {item.daysIdle} days idle</span>
                          <span>·</span>
                          <span>
                            {isImminent ? 'Projected Breach' : 'Breached On'}: {item.breachDate}
                          </span>
                          <span>·</span>
                          <span className="text-neutral-600 dark:text-neutral-300 font-sans italic">
                            Action: {item.action}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Values & Action Links */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                      <div className="text-left sm:text-right font-mono">
                        <div className="text-sm font-bold text-rose-700 dark:text-rose-400">
                          {formatCurrency(item.closingValue, currency)}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          ~{formatCurrency(item.dailyBurn, currency)}/day burn
                        </div>
                      </div>

                      {/* WhatsApp Liquidation Quick Pitch Link */}
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Attention: Item ${item.itemName} (${item.itemCode}) has crossed the factory ${rules.deadThresholdDays}-day cutoff with ${item.daysIdle} idle days (${formatCurrency(item.closingValue, currency)} locked). Recommended action: ${item.action}. Please review for liquidation.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800 transition-colors shrink-0"
                        title="Send WhatsApp Alert to Store Keeper / Vendor"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThresholdBreachNotification;
