import React, { useState } from 'react';
import { RulesConfig, UserRole } from '../types';
import { Sliders, RotateCcw, AlertCircle, Info, Sparkles, Building2, Factory, Warehouse, CheckCircle2 } from 'lucide-react';

interface RulesSheetProps {
  rules: RulesConfig;
  onUpdateRules: (newRules: RulesConfig) => void;
  onResetRules: () => void;
  userRole: UserRole;
}

export const RulesSheet: React.FC<RulesSheetProps> = ({
  rules,
  onUpdateRules,
  onResetRules,
  userRole,
}) => {
  const [activeRefreshNotice, setActiveRefreshNotice] = useState<string | null>(null);

  const handleChange = (field: keyof RulesConfig, val: any) => {
    setActiveRefreshNotice(field);
    setTimeout(() => setActiveRefreshNotice(null), 3000);
    onUpdateRules({
      ...rules,
      [field]: field === 'asOfDate' ? val : Number(val) || 0,
    });
  };

  const applyPreset = (preset: Partial<RulesConfig>) => {
    setActiveRefreshNotice('preset');
    setTimeout(() => setActiveRefreshNotice(null), 3000);
    onUpdateRules({
      ...rules,
      ...preset,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Concept */}
      <div className="p-4 rounded-xl glass-card glass-card-amber flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-neutral-950 dark:text-neutral-50 flex items-center gap-2 tracking-tight">
            <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Rules Sheet: The Six Yellow Driving Cells</span>
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed font-mono">
            These six yellow parameters govern every formula in the engine. Modify any parameter to instantly recalculate the Owner Report, Stock Engine, and Annual Carrying Burn.
          </p>
        </div>

        <button
          onClick={onResetRules}
          className="px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white/80 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors flex items-center gap-1.5 self-start md:self-auto shrink-0 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      {/* Subtle Calculation Refresh Feedback Banner */}
      {activeRefreshNotice && (
        <div className="p-3 rounded-xl glass-card glass-card-emerald text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold font-mono">
              {activeRefreshNotice === 'asOfDate'
                ? `As-of Date set to ${rules.asOfDate}. Elapsed days idle, dead classifications, and bank burn recalculated across all tabs.`
                : activeRefreshNotice === 'preset'
                ? 'Industry preset applied. All six driving cells and calculations synchronized.'
                : `Rule parameter updated (${activeRefreshNotice}). All inventory formulas recalculated.`}
            </span>
          </div>
          <span className="industrial-badge bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30">
            Calculations Live ✓
          </span>
        </div>
      )}

      {/* 2. Industry Presets */}
      <div className="p-4 rounded-xl glass-card shadow-xs">
        <span className="industrial-label text-neutral-600 dark:text-neutral-400 text-[11px]">
          Quick Industry Presets
        </span>
        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() =>
              applyPreset({
                deadThresholdDays: 180,
                slowThresholdDays: 90,
                holdingCostPercent: 18,
                classACutoff: 80,
                classBCutoff: 95,
              })
            }
            className="p-3 text-left rounded-xl glass-card glass-card-hover border border-amber-400/50 dark:border-amber-700/50 bg-amber-500/5 dark:bg-amber-500/10 hover:border-amber-500 transition-all shadow-xs"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-950 dark:text-neutral-50">
              <Factory className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Ambattur Fabrication</span>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
              180d Dead · 90d Slow · 18% p.a.
            </div>
          </button>

          <button
            onClick={() =>
              applyPreset({
                deadThresholdDays: 60,
                slowThresholdDays: 30,
                holdingCostPercent: 24,
                classACutoff: 75,
                classBCutoff: 90,
              })
            }
            className="p-3 text-left rounded-xl glass-card glass-card-hover border border-neutral-200/80 dark:border-neutral-800/80 hover:border-amber-500/50 transition-all shadow-xs"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-950 dark:text-neutral-50">
              <Building2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>Food / Perishables</span>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
              60d Dead · 30d Slow · 24% p.a.
            </div>
          </button>

          <button
            onClick={() =>
              applyPreset({
                deadThresholdDays: 365,
                slowThresholdDays: 180,
                holdingCostPercent: 14,
                classACutoff: 85,
                classBCutoff: 95,
              })
            }
            className="p-3 text-left rounded-xl glass-card glass-card-hover border border-neutral-200/80 dark:border-neutral-800/80 hover:border-amber-500/50 transition-all shadow-xs"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-950 dark:text-neutral-50">
              <Warehouse className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Steel Yard / Heavy Stock</span>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
              365d Dead · 180d Slow · 14% p.a.
            </div>
          </button>

          <button
            onClick={() =>
              applyPreset({
                deadThresholdDays: 120,
                slowThresholdDays: 60,
                holdingCostPercent: 22,
                classACutoff: 80,
                classBCutoff: 95,
              })
            }
            className="p-3 text-left rounded-xl glass-card glass-card-hover border border-neutral-200/80 dark:border-neutral-800/80 hover:border-amber-500/50 transition-all shadow-xs"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-950 dark:text-neutral-50">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Electronics &amp; Hardware</span>
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-mono">
              120d Dead · 60d Slow · 22% p.a.
            </div>
          </button>
        </div>
      </div>

      {/* 3. The 6 Yellow Cells Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cell 1: As-of Date */}
        <div className="p-5 rounded-xl glass-card glass-card-amber shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="industrial-label text-amber-900 dark:text-amber-200">
                Cell 1: As-of Date
              </span>
              <span className="industrial-badge industrial-badge-amber">
                Driving Cell
              </span>
            </div>
            <div className="mt-3">
              <input
                type="date"
                value={rules.asOfDate}
                onChange={(e) => handleChange('asOfDate', e.target.value)}
                className="w-full text-sm font-mono font-bold p-2.5 rounded-lg bg-white/90 dark:bg-neutral-900/90 border border-amber-300/80 dark:border-amber-700/80 text-neutral-950 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {/* Subtle live indicator for As-of Date */}
            <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
              <span className="text-neutral-500 dark:text-neutral-400">Anchor audit date</span>
              {activeRefreshNotice === 'asOfDate' ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in duration-150">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Calculations Refreshed ✓</span>
                </span>
              ) : (
                <span className="text-emerald-600/70 dark:text-emerald-400/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Calculations live</span>
                </span>
              )}
            </div>
            <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              This is <strong>“today”</strong> for the audit. On a real job, put the day you received the file from the owner. Days idle is this date minus the last movement date.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-neutral-500 font-mono">
            Default: 2026-10-01 (1 Oct 2026)
          </div>
        </div>

        {/* Cell 2: Dead if idle at least */}
        <div className="p-5 rounded-xl glass-card glass-card-amber shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="industrial-label text-amber-900 dark:text-amber-200">
                Cell 2: Dead Threshold (Days)
              </span>
              <span className="industrial-badge industrial-badge-amber">
                Driving Cell
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min="30"
                max="730"
                value={rules.deadThresholdDays}
                onChange={(e) => handleChange('deadThresholdDays', e.target.value)}
                className="w-full text-base font-mono font-bold p-2.5 rounded-lg bg-white/90 dark:bg-neutral-900/90 border border-amber-300/80 dark:border-amber-700/80 text-neutral-950 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-xs font-mono font-bold text-neutral-500">Days</span>
            </div>
            <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <strong>Six months (180 days)</strong> is the normal first cut for a fabrication unit. It is not a law. Start at 180 unless the owner tells you his trade dies faster.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-neutral-500 font-mono">
            Default: 180 days (~6 months)
          </div>
        </div>

        {/* Cell 3: Slow if idle at least */}
        <div className="p-5 rounded-xl glass-card glass-card-amber shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="industrial-label text-amber-900 dark:text-amber-200">
                Cell 3: Slow Threshold (Days)
              </span>
              <span className="industrial-badge industrial-badge-amber">
                Driving Cell
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min="15"
                max="365"
                value={rules.slowThresholdDays}
                onChange={(e) => handleChange('slowThresholdDays', e.target.value)}
                className="w-full text-base font-mono font-bold p-2.5 rounded-lg bg-white/90 dark:bg-neutral-900/90 border border-amber-300/80 dark:border-amber-700/80 text-neutral-950 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-xs font-mono font-bold text-neutral-500">Days</span>
            </div>
            <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Quiet, but not dead. 90 to 179 days. Action for these items: <strong>Freeze purchase</strong>. Do not reorder them, but do not scrap them yet.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-neutral-500 font-mono">
            Default: 90 days (~3 months)
          </div>
        </div>

        {/* Cell 4: Class A Cutoff */}
        <div className="p-5 rounded-xl glass-card glass-card-amber shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="industrial-label text-amber-900 dark:text-amber-200">
                Cell 4: Class A Cutoff (%)
              </span>
              <span className="industrial-badge industrial-badge-amber">
                Driving Cell
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min="50"
                max="90"
                value={rules.classACutoff}
                onChange={(e) => handleChange('classACutoff', e.target.value)}
                className="w-full text-base font-mono font-bold p-2.5 rounded-lg bg-white/90 dark:bg-neutral-900/90 border border-amber-300/80 dark:border-amber-700/80 text-neutral-950 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-xs font-mono font-bold text-neutral-500">%</span>
            </div>
            <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Sort items from largest closing value down. Walk down until you cover 80% of total stock. Those are <strong>Class A</strong>. A dead A-item is an emergency because it is a lot of money.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-neutral-500 font-mono">
            Default: 80% (Pareto top tier)
          </div>
        </div>

        {/* Cell 5: Class B Cutoff */}
        <div className="p-5 rounded-xl glass-card glass-card-amber shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="industrial-label text-amber-900 dark:text-amber-200">
                Cell 5: Class B Cutoff (%)
              </span>
              <span className="industrial-badge industrial-badge-amber">
                Driving Cell
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min="80"
                max="99"
                value={rules.classBCutoff}
                onChange={(e) => handleChange('classBCutoff', e.target.value)}
                className="w-full text-base font-mono font-bold p-2.5 rounded-lg bg-white/90 dark:bg-neutral-900/90 border border-amber-300/80 dark:border-amber-700/80 text-neutral-950 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-xs font-mono font-bold text-neutral-500">%</span>
            </div>
            <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              The next slice, up to 95%, is <strong>Class B</strong>. Whatever is left is <strong>Class C</strong>. A dead C-item is a cleanup because it is cheap.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-neutral-500 font-mono">
            Default: 95% (Class C is remaining 5%)
          </div>
        </div>

        {/* Cell 6: Holding Cost Per Year */}
        <div className="p-5 rounded-xl glass-card glass-card-amber shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="industrial-label text-amber-900 dark:text-amber-200">
                Cell 6: Holding Cost Rate (%)
              </span>
              <span className="industrial-badge industrial-badge-amber">
                Driving Cell
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="50"
                value={rules.holdingCostPercent}
                onChange={(e) => handleChange('holdingCostPercent', e.target.value)}
                className="w-full text-base font-mono font-bold p-2.5 rounded-lg bg-white/90 dark:bg-neutral-900/90 border border-amber-300/80 dark:border-amber-700/80 text-neutral-950 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-xs font-mono font-bold text-neutral-500">% p.a.</span>
            </div>
            <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Indian SME working-capital interest sits around <strong>11–14%</strong>, plus shed rent, rust, theft, obsolescence. 18% is the factory standard. If he says <em>"my OD is 12%,"</em> change this to 12%. Do not invent a lower number to make the story softer.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-neutral-500 font-mono">
            Default: 18% per year
          </div>
        </div>
      </div>
    </div>
  );
};
