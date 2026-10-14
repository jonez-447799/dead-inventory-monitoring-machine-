import React, { useState } from 'react';
import { StockItem, RulesConfig, CurrencyCode, UserRole, ClientWorkspace, WhiteLabelProfile } from '../types';
import { formatCurrency, generateOwnerReport } from '../utils/calculations';
import { AgeBracketBarChart } from './AgeBracketBarChart';
import { CashSavingsProjectionChart } from './CashSavingsProjectionChart';
import { ThresholdBreachNotification } from './ThresholdBreachNotification';
import { EmailDraftModal } from './EmailDraftModal';
import { 
  Package, 
  Flame, 
  ArrowRight, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw, 
  Copy, 
  Mail,
  PlayCircle,
  FileDown
} from 'lucide-react';

interface OwnerReportProps {
  items: StockItem[];
  rules: RulesConfig;
  currency: CurrencyCode;
  userRole: UserRole;
  client?: ClientWorkspace | null;
  whiteLabel?: WhiteLabelProfile;
  onUpdateItemMovement: (itemId: string, newDate: string, logMessage: string) => void;
  onResetItems: () => void;
  onPrint: () => void;
  onNavigateToStock: () => void;
}

export const OwnerReport: React.FC<OwnerReportProps> = ({
  items,
  rules,
  currency,
  client,
  whiteLabel,
  onUpdateItemMovement,
  onPrint,
  onNavigateToStock,
}) => {
  const summary = generateOwnerReport(items, rules);

  // Email draft modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Drill state tracking
  const [drillStep, setDrillStep] = useState<'initial' | 'sep' | 'jan'>('initial');
  const [drillExplanation, setDrillExplanation] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Find SS flange 150NB item (id: 'sku-02')
  const ssFlange = items.find((i) => i.id === 'sku-02' || i.itemName.includes('SS flange'));

  const handleDrillSeptember = () => {
    if (!ssFlange) return;
    onUpdateItemMovement(
      ssFlange.id,
      '2026-09-01',
      'The Drill: Changed SS flange 150NB date to 01-Sep-2026 (moved ~30 days before as-of date).'
    );
    setDrillStep('sep');
    setDrillExplanation(
      'September 1 is 30 days before 1 Oct 2026. Status flipped from Dead to Moving. Dead cash dropped by ₹46,250 to ₹1,76,860. The SS flange immediately vacated the Top Dead list.'
    );
  };

  const handleDrillJanuary = () => {
    if (!ssFlange) return;
    onUpdateItemMovement(
      ssFlange.id,
      '2026-01-01',
      'The Drill: Changed SS flange 150NB date to 01-Jan-2026 (idle 273 days).'
    );
    setDrillStep('jan');
    setDrillExplanation(
      'January 1 is 273 days before 1 Oct (greater than 180 days). The flange remains Dead. Days idle increased from 232 to 273, but total dead rupees did not change because it was already classified in the dead pile.'
    );
  };

  const handleDrillReset = () => {
    if (!ssFlange) return;
    onUpdateItemMovement(
      ssFlange.id,
      '2026-02-11',
      'The Drill: Restored SS flange 150NB date back to original baseline (11-Feb-2026).'
    );
    setDrillStep('initial');
    setDrillExplanation('SS flange 150NB restored to 11-Feb-2026 (232 days idle, Dead, ₹46,250). Baseline restored.');
  };

  // WhatsApp message generator
  const top5DeadText = summary.topDeadItems
    .map((item, idx) => `${idx + 1}. ${item.itemName} (${item.daysIdle}d idle): ${formatCurrency(item.closingValue || 0, currency)} [${item.action}]`)
    .join('\n');

  const clientDisplayName = client?.clientName || 'Ambattur Fabrication Works';
  const clientLocationText = client?.location || 'Ambattur Industrial Estate';

  const whatsappMessage = `*FACTORY WORKING CAPITAL AUDIT (As of ${summary.asOfDate})*
${clientDisplayName} · ${clientLocationText}

• *Stock on Books:* ${formatCurrency(summary.totalStockValue, currency)}
• *Dead Cash (180d+ idle):* ${formatCurrency(summary.deadCash, currency)} (${summary.deadCashPercent}%)
• *Slow Cash (90-179d):* ${formatCurrency(summary.slowCash, currency)} (${summary.slowCashPercent}%)
• *Holding Burn / Year (18%):* ~${formatCurrency(summary.annualHoldingBurn, currency)}/year

*Executive Headline:*
Of ${formatCurrency(summary.totalStockValue, currency)} sitting in stock, ${formatCurrency(summary.deadCash, currency)} has not moved in 180 days. That dead pile costs about ${formatCurrency(summary.annualHoldingBurn, currency)} a year just in overdraft interest to hold.

*Top Dead Lines to Liquidate this Week:*
${top5DeadText}

_Verified Working Capital Diagnostic Engine | Project 1_`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Executive Owner Report
            </h1>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              1-Page Deliverable
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-mono">
            {clientDisplayName} <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span> As of <strong className="text-neutral-900 dark:text-neutral-200">{rules.asOfDate}</strong> <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span> Cutoff: {rules.deadThresholdDays}d Idle
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
            title="Generate formatted HTML email draft of audit findings"
          >
            <Mail className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            <span>Email Draft</span>
          </button>
          
          <button
            onClick={onPrint}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-md transition-colors flex items-center gap-1.5"
          >
            <FileDown className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            <span>Export 1-Page PDF</span>
          </button>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 1.5 Notification System: Dead Cutoff Alert Center */}
      <ThresholdBreachNotification
        items={items}
        rules={rules}
        currency={currency}
        onNavigateToStock={onNavigateToStock}
      />

      {/* 2. The 4 Key Numbers on Owner Report */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Stock on books */}
        <div className="p-4 sm:p-5 rounded-xl glass-card glass-card-hover">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="industrial-label text-[11px] text-neutral-600 dark:text-neutral-400">Gross Inventory Asset</span>
            <Package className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl industrial-metric text-neutral-950 dark:text-neutral-50 tracking-tight">
              {formatCurrency(summary.totalStockValue, currency)}
            </span>
          </div>
          <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-mono">
            {summary.totalItemCount} SKUs on books · Raw ledger sum
          </p>
        </div>

        {/* Card 2: Dead cash */}
        <div className="p-4 sm:p-5 rounded-xl glass-card glass-card-rose glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="industrial-label text-[11px] text-rose-800 dark:text-rose-300">
              Dormant Capital ({rules.deadThresholdDays}d+)
            </span>
            <span className="industrial-badge bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20">
              {summary.deadCashPercent}% of total
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl industrial-metric text-rose-600 dark:text-rose-400 tracking-tight">
              {formatCurrency(summary.deadCash, currency)}
            </span>
          </div>
          <p className="mt-2 text-xs text-rose-800/80 dark:text-rose-300/80 leading-relaxed font-mono">
            {summary.deadItemCount} of {summary.totalItemCount} SKUs past cutoff · Trapped capital
          </p>
        </div>

        {/* Card 3: Slow cash */}
        <div className="p-4 sm:p-5 rounded-xl glass-card glass-card-amber glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="industrial-label text-[11px] text-amber-800 dark:text-amber-300">
              Slow-Moving ({rules.slowThresholdDays}–{rules.deadThresholdDays - 1}d)
            </span>
            <span className="industrial-badge bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20">
              {summary.slowCashPercent}% of total
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl industrial-metric text-amber-600 dark:text-amber-400 tracking-tight">
              {formatCurrency(summary.slowCash, currency)}
            </span>
          </div>
          <p className="mt-2 text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed font-mono">
            {summary.slowItemCount} SKUs pending freeze · Do not reorder
          </p>
        </div>

        {/* Card 4: Burn on dead per year */}
        <div className="p-4 sm:p-5 rounded-xl glass-card glass-card-hover">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="industrial-label text-[11px] flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Annual Carrying Bleed
            </span>
            <span className="industrial-badge bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700">
              @{rules.holdingCostPercent}% p.a.
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl industrial-metric text-neutral-950 dark:text-neutral-50 tracking-tight">
              ~{formatCurrency(summary.annualHoldingBurn, currency)}
            </span>
          </div>
          <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-mono">
            Overdraft interest + warehouse bleed / year
          </p>
        </div>
      </div>

      {/* 2.5 D3 Bar Chart: Inventory Distribution by Age Bracket */}
      <AgeBracketBarChart
        items={items}
        rules={rules}
        currency={currency}
        height={270}
        onSelectBracket={() => onNavigateToStock()}
      />

      {/* 2.6 D3 Trend Chart: 12-Month Potential Cash Savings Projection */}
      <CashSavingsProjectionChart
        summary={summary}
        rules={rules}
        currency={currency}
        height={320}
      />

      {/* 3. The Plain-English Headline Sentence */}
      <div className="p-5 sm:p-6 rounded-xl glass-panel border-l-4 border-l-amber-500 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80 text-xs font-mono">
          <span className="text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            Executive Headline
          </span>
          <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
            Managing Director &amp; Board Briefing
          </span>
        </div>
        <blockquote className="mt-4 text-base sm:text-lg font-medium text-neutral-900 dark:text-neutral-100 leading-relaxed">
          "Of <strong className="text-neutral-950 dark:text-white font-mono">{formatCurrency(summary.totalStockValue, currency)}</strong> sitting in inventory,{' '}
          <strong className="text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(summary.deadCash, currency)}</strong> has not moved in {rules.deadThresholdDays} days. 
          Holding that dormant pile costs approximately <strong className="text-amber-600 dark:text-amber-400 font-mono">{formatCurrency(summary.annualHoldingBurn, currency)}</strong> each year in bank overdraft interest and warehouse decay."
        </blockquote>
        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 font-mono">
          <span>Direct diagnostic. No technical jargon.</span>
          <span>Cutoff: ≥{rules.deadThresholdDays} Days Idle</span>
        </div>
      </div>

      {/* 4. Interactive "The Drill" Module */}
      <div className="p-4 sm:p-5 rounded-xl glass-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Interactive Drill: The Flange Movement Test
              </h2>
            </div>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl font-mono">
              Target SKU: <strong className="text-neutral-800 dark:text-neutral-200">SS flange 150NB</strong> (Qty: 25, Rate: ₹1,850, Value: ₹46,250). 
              Currently last moved on <strong className="text-amber-600 dark:text-amber-400">11-Feb-2026</strong> ({ssFlange?.daysIdle} days idle). 
              Test how the formulas instantly react.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDrillSeptember}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                drillStep === 'sep'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 hover:border-emerald-500'
              }`}
            >
              <span>1. Set 01-Sep-2026</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={handleDrillJanuary}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                drillStep === 'jan'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 hover:border-rose-500'
              }`}
            >
              <span>2. Set 01-Jan-2026</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={handleDrillReset}
              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset (11-Feb)</span>
            </button>
          </div>
        </div>

        {/* Live drill results feedback */}
        {drillExplanation && (
          <div className="mt-3 p-3 rounded-lg bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-300/80 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">Formula Reaction: </span>
              {drillExplanation}
            </div>
            <div className="font-mono text-neutral-500 text-[11px] shrink-0">
              Dead Cash: <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(summary.deadCash, currency)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* 5. Five Biggest Dead Items Table */}
      <div className="glass-card rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 tracking-tight">
              <span>Five Largest Dead Inventory SKUs</span>
              <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400 font-mono">
                (Rupee value descending)
              </span>
            </h2>
          </div>
          <button
            onClick={onNavigateToStock}
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-600 flex items-center gap-1 transition-colors"
          >
            <span>View all {summary.totalItemCount} rows in Stock Engine</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100/70 dark:bg-neutral-900/70 text-neutral-600 dark:text-neutral-400 border-b border-neutral-200/80 dark:border-neutral-800/80 font-mono text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">SKU / Item Description</th>
                <th className="py-2.5 px-4 font-semibold">Category</th>
                <th className="py-2.5 px-4 font-semibold text-right">Days Idle</th>
                <th className="py-2.5 px-4 font-semibold text-right">Closing Value</th>
                <th className="py-2.5 px-4 font-semibold text-center">ABC</th>
                <th className="py-2.5 px-4 font-semibold">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/80 dark:divide-neutral-800/80">
              {summary.topDeadItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-neutral-500 font-mono text-xs">
                    No dead items detected above threshold of {rules.deadThresholdDays} days.
                  </td>
                </tr>
              ) : (
                summary.topDeadItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-950 dark:text-neutral-50 flex items-center gap-2">
                        <span className="font-mono text-neutral-400 dark:text-neutral-500">{idx + 1}.</span>
                        <span>{item.itemName}</span>
                      </div>
                      <div className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 ml-4 mt-0.5">
                        {item.itemCode} · Qty {item.qtyOnHand} @ {formatCurrency(item.costRate, currency)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400 font-mono">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <div className="font-bold text-rose-600 dark:text-rose-400">
                        {item.daysIdle}d
                      </div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                        +{Math.max(0, (item.daysIdle || 0) - rules.deadThresholdDays)}d past cutoff
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-neutral-950 dark:text-neutral-50 tabular-nums text-sm">
                      {formatCurrency(item.closingValue || 0, currency)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`industrial-badge ${
                        item.abcClass === 'A'
                          ? 'industrial-badge-rose'
                          : item.abcClass === 'B'
                          ? 'industrial-badge-amber'
                          : 'industrial-badge-slate'
                      }`}>
                        Class {item.abcClass}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`industrial-badge font-semibold ${
                        item.abcClass === 'A' 
                          ? 'industrial-badge-rose' 
                          : 'industrial-badge-amber'
                      }`}>
                        {item.action}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Ageing Breakdown Split & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Ageing Split Visual */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Ageing Distribution by Dormancy Range
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
                Capital velocity analysis across 4 aging tiers
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
              Total: {formatCurrency(summary.totalStockValue, currency)}
            </span>
          </div>

          {/* Visual Bar Split */}
          <div className="mt-5">
            <div className="h-4 w-full rounded overflow-hidden flex bg-neutral-200/50 dark:bg-neutral-800/60 p-0.5 border border-neutral-300/50 dark:border-neutral-700/50">
              <div 
                style={{ width: `${summary.ageingBreakdown.range0_30_pct}%` }} 
                className="bg-emerald-500 h-full transition-all duration-300 rounded-l"
                title={`0-30 Days: ${formatCurrency(summary.ageingBreakdown.range0_30, currency)} (${summary.ageingBreakdown.range0_30_pct}%)`}
              />
              <div 
                style={{ width: `${summary.ageingBreakdown.range31_89_pct}%` }} 
                className="bg-slate-400 dark:bg-slate-500 h-full transition-all duration-300"
                title={`31-89 Days: ${formatCurrency(summary.ageingBreakdown.range31_89, currency)} (${summary.ageingBreakdown.range31_89_pct}%)`}
              />
              <div 
                style={{ width: `${summary.ageingBreakdown.range90_179_pct}%` }} 
                className="bg-amber-500 h-full transition-all duration-300"
                title={`90-179 Days (Slow): ${formatCurrency(summary.ageingBreakdown.range90_179, currency)} (${summary.ageingBreakdown.range90_179_pct}%)`}
              />
              <div 
                style={{ width: `${summary.ageingBreakdown.range180_plus_pct}%` }} 
                className="bg-rose-500 h-full transition-all duration-300 rounded-r"
                title={`180+ Days (Dead): ${formatCurrency(summary.ageingBreakdown.range180_plus, currency)} (${summary.ageingBreakdown.range180_plus_pct}%)`}
              />
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 font-mono">
                <span className="w-2 h-2 rounded-xs bg-emerald-500" />
                <span>0–30 Days</span>
              </div>
              <div className="mt-1 industrial-metric text-neutral-950 dark:text-neutral-50 text-sm">
                {formatCurrency(summary.ageingBreakdown.range0_30, currency)}
              </div>
              <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                {summary.ageingBreakdown.range0_30_pct}% · Active
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 font-mono">
                <span className="w-2 h-2 rounded-xs bg-slate-400 dark:bg-slate-500" />
                <span>31–89 Days</span>
              </div>
              <div className="mt-1 industrial-metric text-neutral-950 dark:text-neutral-50 text-sm">
                {formatCurrency(summary.ageingBreakdown.range31_89, currency)}
              </div>
              <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                {summary.ageingBreakdown.range31_89_pct}% · Standard
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 font-mono">
                <span className="w-2 h-2 rounded-xs bg-amber-500" />
                <span>90–179 Days</span>
              </div>
              <div className="mt-1 industrial-metric text-amber-600 dark:text-amber-400 text-sm">
                {formatCurrency(summary.ageingBreakdown.range90_179, currency)}
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                {summary.ageingBreakdown.range90_179_pct}% · Slow pile
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800 dark:text-rose-300 font-mono">
                <span className="w-2 h-2 rounded-xs bg-rose-500" />
                <span>180+ Days</span>
              </div>
              <div className="mt-1 industrial-metric text-rose-600 dark:text-rose-400 text-sm">
                {formatCurrency(summary.ageingBreakdown.range180_plus, currency)}
              </div>
              <div className="text-[11px] text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                {summary.ageingBreakdown.range180_plus_pct}% · Dead pile
              </div>
            </div>
          </div>
        </div>

        {/* Right: Category Dead Distribution */}
        <div className="glass-card rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Trapped Capital by Category
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
              Distribution of {formatCurrency(summary.deadCash, currency)} dead stock
            </p>

            <div className="mt-4 space-y-3">
              {Object.entries(summary.categoryDeadBreakdown).map(([category, stats]) => (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {category} <span className="text-neutral-500 font-mono">({stats.count})</span>
                    </span>
                    <span className="font-mono font-bold text-neutral-950 dark:text-neutral-50 tabular-nums">
                      {formatCurrency(stats.value, currency)} ({stats.percent}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-200/60 dark:bg-neutral-800 rounded overflow-hidden">
                    <div 
                      style={{ width: `${stats.percent}%` }}
                      className="h-full bg-neutral-900 dark:bg-amber-500 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-200/80 dark:border-neutral-800/80 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono leading-relaxed">
            Raw materials dead = idle unconsumed stock. Finished goods dead = uncollected production backlog.
          </div>
        </div>
      </div>

      {/* 7. Executive Daily Dispatch Preview */}
      <div className="p-4 sm:p-5 rounded-xl glass-card shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neutral-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Executive Briefing Dispatch Preview
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="px-2.5 py-1 text-xs font-medium rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedScript ? 'Copied' : 'Copy Text'}</span>
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-xs"
            >
              <Send className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="mt-3 bg-neutral-950 text-neutral-100 font-mono text-xs p-4 rounded-lg overflow-x-auto whitespace-pre leading-relaxed border border-neutral-800 shadow-inner">
          {whatsappMessage}
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
          <span>Morning Schedule: 08:00 AM IST prior to plant floor shift</span>
          <span>Diagnostic Engine: Project 1 Verified</span>
        </div>
      </div>

      {/* Formatted HTML Email Draft Modal */}
      {isEmailModalOpen && (
        <EmailDraftModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          summary={summary}
          rules={rules}
          currency={currency}
          client={client}
          whiteLabel={whiteLabel}
        />
      )}
    </div>
  );
};
export default OwnerReport;
