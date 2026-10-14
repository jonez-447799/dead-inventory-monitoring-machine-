import React, { useState, useMemo } from 'react';
import { StockItem, RulesConfig, CurrencyCode, OwnerReportSummary, BankDrawingPowerConfig, WhiteLabelProfile } from '../types';
import { formatCurrency, generateOwnerReport } from '../utils/calculations';
import { 
  Building, 
  Landmark, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Scale, 
  FileSpreadsheet, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface BankDrawingPowerHubProps {
  items: StockItem[];
  rules: RulesConfig;
  currency: CurrencyCode;
  clientName?: string;
  whiteLabel?: WhiteLabelProfile;
}

const DEFAULT_BANK_CONFIG: BankDrawingPowerConfig = {
  bankName: 'State Bank of India',
  branchName: 'Ambattur Industrial Estate Branch (IFSC: SBIN0001234)',
  sanctionedLimit: 5000000, // ₹50 Lakhs CC Limit
  currentOutstanding: 4350000, // ₹43.5 Lakhs utilized
  stockMarginPercent: 25, // 25% margin on inventory
  debtorMarginPercent: 40, // 40% margin on book debts
  eligibleBookDebts: 3200000, // ₹32 Lakhs debtors (<90 days)
  unpaidCreditors: 850000, // ₹8.5 Lakhs unpaid trade creditors
  annualInterestRate: 11.25, // 11.25% p.a.
  penalInterestRate: 2.0, // 2% penal interest on DP breach
};

export const BankDrawingPowerHub: React.FC<BankDrawingPowerHubProps> = ({
  items,
  rules,
  currency,
  clientName = 'Ambattur Fabrication Works',
  whiteLabel,
}) => {
  const [bankConfig, setBankConfig] = useState<BankDrawingPowerConfig>(() => {
    try {
      const saved = localStorage.getItem('p1_bank_dp_config');
      return saved ? JSON.parse(saved) : DEFAULT_BANK_CONFIG;
    } catch {
      return DEFAULT_BANK_CONFIG;
    }
  });

  const [includeDeadInBankStatement, setIncludeDeadInBankStatement] = useState(false);
  const [showFormulaGuide, setShowFormulaGuide] = useState(false);
  const [copiedStatement, setCopiedStatement] = useState(false);

  // Update bank config handler
  const handleConfigChange = (field: keyof BankDrawingPowerConfig, val: any) => {
    const updated = {
      ...bankConfig,
      [field]: typeof val === 'number' ? val : val,
    };
    setBankConfig(updated);
    try {
      localStorage.setItem('p1_bank_dp_config', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const summary = useMemo(() => generateOwnerReport(items, rules), [items, rules]);

  // Calculations per Tandon / Nayak Indian Banking Guidelines
  const dpCalculations = useMemo(() => {
    const totalInventory = summary.totalStockValue;
    const deadInventory = summary.deadCash;
    const movingAndSlowInventory = totalInventory - deadInventory;

    // SCENARIO 1: DIRTY / UNCLEANED (Bank inspects and disallows dead stock > 180 days)
    // When bank auditor disallows dead stock:
    const eligibleStockUncleaned = Math.max(0, movingAndSlowInventory - bankConfig.unpaidCreditors);
    const dpStockUncleaned = Math.round(eligibleStockUncleaned * (1 - bankConfig.stockMarginPercent / 100));
    const dpDebtors = Math.round(bankConfig.eligibleBookDebts * (1 - bankConfig.debtorMarginPercent / 100));
    const totalComputedDpUncleaned = Math.min(bankConfig.sanctionedLimit, dpStockUncleaned + dpDebtors);
    
    // Check if outstanding breaches uncleaned DP
    const isDpBreachedUncleaned = bankConfig.currentOutstanding > totalComputedDpUncleaned;
    const dpDeficitUncleaned = Math.max(0, bankConfig.currentOutstanding - totalComputedDpUncleaned);
    const monthlyPenalInterest = isDpBreachedUncleaned 
      ? Math.round((dpDeficitUncleaned * (bankConfig.annualInterestRate + bankConfig.penalInterestRate) / 100) / 12)
      : 0;

    // SCENARIO 2: CLEANED / AUDITED (Dead stock liquidated, cash credited to CC account)
    // Assume 50% cash recovery on dead inventory directly credited to bank account:
    const recoveredCash = Math.round(deadInventory * 0.50);
    const postLiquidationOutstanding = Math.max(0, bankConfig.currentOutstanding - recoveredCash);
    const eligibleStockCleaned = Math.max(0, movingAndSlowInventory - bankConfig.unpaidCreditors);
    const dpStockCleaned = Math.round(eligibleStockCleaned * (1 - bankConfig.stockMarginPercent / 100));
    const totalComputedDpCleaned = Math.min(bankConfig.sanctionedLimit, dpStockCleaned + dpDebtors);
    
    const postLiquidationHeadroom = Math.max(0, totalComputedDpCleaned - postLiquidationOutstanding);
    const annualInterestSaved = Math.round(recoveredCash * (bankConfig.annualInterestRate / 100));
    const monthlyInterestSaved = Math.round(annualInterestSaved / 12);

    return {
      totalInventory,
      deadInventory,
      movingAndSlowInventory,
      dpDebtors,
      dpStockUncleaned,
      totalComputedDpUncleaned,
      isDpBreachedUncleaned,
      dpDeficitUncleaned,
      monthlyPenalInterest,
      recoveredCash,
      postLiquidationOutstanding,
      dpStockCleaned,
      totalComputedDpCleaned,
      postLiquidationHeadroom,
      annualInterestSaved,
      monthlyInterestSaved,
    };
  }, [summary, bankConfig]);

  // Form A Bank Stock Statement Plain Text for Copying / Exporting
  const bankStatementText = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const audVal = includeDeadInBankStatement ? summary.totalStockValue : dpCalculations.movingAndSlowInventory;
    const audDeadDeduction = includeDeadInBankStatement ? 0 : summary.deadCash;

    return `FORM 'A' - MONTHLY STOCK & BOOK DEBT STATEMENT FOR CC/OD LIMIT
(Submitted to: ${bankConfig.bankName}, ${bankConfig.branchName})
================================================================================
BORROWER NAME     : ${clientName}
SANCTIONED LIMIT  : ₹${bankConfig.sanctionedLimit.toLocaleString()}
STATEMENT AS OF   : ${rules.asOfDate} (Submitted on: ${todayStr})
================================================================================

PART I: VALUATION OF STOCKS
--------------------------------------------------------------------------------
1. Total Inventory Valuation on Books (At Cost/Market whichever is lower) : ₹${summary.totalStockValue.toLocaleString()}
   Less: Ineligible Obsolete / Dead Stock (>180 Days Dormancy)            : ₹${summary.deadCash.toLocaleString()}
--------------------------------------------------------------------------------
2. Eligible Moving & Slow Stocks Certified by Borrower                    : ₹${dpCalculations.movingAndSlowInventory.toLocaleString()}
3. Less: Unpaid Trade Creditors for Goods / Jobwork (Sundry Creditors)     : ₹${bankConfig.unpaidCreditors.toLocaleString()}
--------------------------------------------------------------------------------
4. Net Paid Inventory Base Eligible for Bank Advance                     : ₹${Math.max(0, dpCalculations.movingAndSlowInventory - bankConfig.unpaidCreditors).toLocaleString()}
5. Less: Bank Prescribed Margin (${bankConfig.stockMarginPercent}%)                                      : -₹${Math.round(Math.max(0, dpCalculations.movingAndSlowInventory - bankConfig.unpaidCreditors) * (bankConfig.stockMarginPercent / 100)).toLocaleString()}
--------------------------------------------------------------------------------
(A) DRAWING POWER DERIVED FROM INVENTORY                                  : ₹${dpCalculations.dpStockCleaned.toLocaleString()}

PART II: VALUATION OF BOOK DEBTS (<90 DAYS)
--------------------------------------------------------------------------------
1. Eligible Sundry Debtors for Goods Supplied                             : ₹${bankConfig.eligibleBookDebts.toLocaleString()}
2. Less: Bank Prescribed Margin (${bankConfig.debtorMarginPercent}%)                                      : -₹${Math.round(bankConfig.eligibleBookDebts * (bankConfig.debtorMarginPercent / 100)).toLocaleString()}
--------------------------------------------------------------------------------
(B) DRAWING POWER DERIVED FROM BOOK DEBTS                                 : ₹${dpCalculations.dpDebtors.toLocaleString()}

================================================================================
PART III: CONSOLIDATED DRAWING POWER & CC UTILIZATION
================================================================================
Total Drawing Power (A + B)                                               : ₹${(dpCalculations.dpStockCleaned + dpCalculations.dpDebtors).toLocaleString()}
Maximum Sanctioned Limit                                                  : ₹${bankConfig.sanctionedLimit.toLocaleString()}
EFFECTIVE PERMISSIBLE DRAWING POWER (Lower of DP or Sanctioned Limit)     : ₹${dpCalculations.totalComputedDpCleaned.toLocaleString()}
Current Book Outstandings in Cash Credit Account                          : ₹${bankConfig.currentOutstanding.toLocaleString()}
--------------------------------------------------------------------------------
DRAWING POWER HEADROOM (AVAILABLE LIQUIDITY)                              : ₹${Math.max(0, dpCalculations.totalComputedDpCleaned - bankConfig.currentOutstanding).toLocaleString()}
--------------------------------------------------------------------------------

STATUTORY & BORROWER DECLARATION:
We hereby certify that the stocks enumerated herein are the unencumbered property
of the borrower, properly stored, fully insured against fire and allied perils,
and that all dead/obsolete lines exceeding 180 days have been segregated from bank margin.

Audited and certified by Working Capital Advisory:
${whiteLabel?.practitionerName || 'V. Raman, Lead Auditor'} (${whiteLabel?.firmName || 'Apex Working Capital Advisory'})
Registration / UDIN: ${whiteLabel?.registrationOrUdin || 'UDIN-2026-P1-AUDIT-992'}`;
  }, [bankConfig, clientName, rules.asOfDate, summary, dpCalculations, includeDeadInBankStatement, whiteLabel]);

  const handleCopyStatement = async () => {
    await navigator.clipboard.writeText(bankStatementText);
    setCopiedStatement(true);
    setTimeout(() => setCopiedStatement(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Concept */}
      <div className="p-4 rounded-xl glass-card glass-card-emerald flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-base font-bold text-neutral-950 dark:text-neutral-50 tracking-tight">
              Bank Drawing Power (DP) &amp; CC Overdraft Optimizer
            </h1>
            <span className="industrial-badge bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20">
              Indian Banking Norms (Tandon/Nayak)
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-3xl leading-relaxed font-mono">
            Every month, factories submit <strong>Form 'A' Stock Statements</strong> to their bank. If concurrent auditors identify dormant inventory &gt;180 days, they <strong>disallow dead stock</strong>, slash Drawing Power, and levy 2% penal interest.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowFormulaGuide(!showFormulaGuide)}
            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Banking Formula Guide</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Bank Statement</span>
          </button>
        </div>
      </div>

      {/* 2. Formula Explainer Drawer */}
      {showFormulaGuide && (
        <div className="p-4 rounded-xl glass-panel text-xs space-y-2 animate-in fade-in duration-150">
          <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>How Indian Banks Compute Drawing Power (DP):</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
            <div className="p-3 rounded-lg bg-white/70 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 space-y-1">
              <div className="font-bold text-neutral-900 dark:text-white">Inventory DP Formula:</div>
              <div>1. Eligible Stock = Total Stock - Ineligible Stock (&gt;180d) - Unpaid Creditors</div>
              <div>2. Inventory DP = Eligible Stock × (1 - 25% Stock Margin)</div>
            </div>
            <div className="p-3 rounded-lg bg-white/70 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 space-y-1">
              <div className="font-bold text-neutral-900 dark:text-white">Debtor DP Formula:</div>
              <div>1. Eligible Debtors = Sundry Debtors aged &lt; 90 Days</div>
              <div>2. Debtor DP = Eligible Debtors × (1 - 40% Debtor Margin)</div>
              <div>3. Permissible DP = Min(Sanctioned Limit, Inventory DP + Debtor DP)</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. The Core Diagnostic: Pre-Audit Threat vs. Post-Liquidation Relief */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Card A: Uncleaned Threat (What happens if bank disallows dead stock) */}
        <div className="p-5 rounded-xl glass-card glass-card-rose shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <span className="font-bold text-sm text-rose-950 dark:text-rose-100 tracking-tight">
                  Scenario A: Bank Auditor Disallowance Threat
                </span>
              </div>
              <span className="industrial-badge bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30">
                HIGH RISK
              </span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3 leading-relaxed font-mono">
              If the bank auditor inspects your stock ledger and disallows your <strong>₹{summary.deadCash.toLocaleString()}</strong> in &gt;180-day dormant inventory:
            </p>

            <div className="mt-4 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-600 dark:text-neutral-400 font-sans">Permissible Drawing Power:</span>
                <span className="font-bold text-rose-700 dark:text-rose-400 tabular-nums">₹{dpCalculations.totalComputedDpUncleaned.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-600 dark:text-neutral-400 font-sans">Current CC Overdraft Outstanding:</span>
                <span className="font-bold text-neutral-900 dark:text-white tabular-nums">₹{bankConfig.currentOutstanding.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-950 dark:text-rose-100">
                <span className="font-bold font-sans">
                  {dpCalculations.isDpBreachedUncleaned ? '⚠️ Drawing Power Deficit (Breach):' : 'Available Headroom:'}
                </span>
                <span className="font-bold text-sm tabular-nums">
                  {dpCalculations.isDpBreachedUncleaned 
                    ? `-₹${dpCalculations.dpDeficitUncleaned.toLocaleString()}`
                    : `+₹${(dpCalculations.totalComputedDpUncleaned - bankConfig.currentOutstanding).toLocaleString()}`}
                </span>
              </div>
            </div>

            {dpCalculations.isDpBreachedUncleaned && (
              <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-900 dark:text-rose-200 space-y-1 font-mono">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Consequences of DP Deficit:</span>
                </div>
                <div>• Bank Manager will freeze fresh cheque clearances until deficit is funded.</div>
                <div>• Penal interest of {bankConfig.penalInterestRate}% p.a. applies (~₹{dpCalculations.monthlyPenalInterest.toLocaleString()}/month extra charge).</div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-rose-500/20 text-[11px] text-rose-800 dark:text-rose-300 font-mono">
            Uncleaned dead inventory directly threatens your factory's working capital liquidity.
          </div>
        </div>

        {/* Card B: Post-Liquidation Relief (The Auditor's Solution) */}
        <div className="p-5 rounded-xl glass-card glass-card-emerald shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold text-sm text-emerald-950 dark:text-emerald-100 tracking-tight">
                  Scenario B: Post-Audit Cash Recovery Relief
                </span>
              </div>
              <span className="industrial-badge bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                AUDITOR'S PROMISE
              </span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3 leading-relaxed">
              When we execute our 30-day buyback and secondary liquidation, recovering <strong>50% cash (₹{dpCalculations.recoveredCash.toLocaleString()})</strong> to pay down your CC limit:
            </p>

            <div className="mt-4 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-800/60">
                <span className="text-neutral-600 dark:text-neutral-400 font-sans">Reduced CC Overdraft Balance:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{dpCalculations.postLiquidationOutstanding.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-800/60">
                <span className="text-neutral-600 dark:text-neutral-400 font-sans">Cleaned Drawing Power:</span>
                <span className="font-bold text-neutral-900 dark:text-white">₹{dpCalculations.totalComputedDpCleaned.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-emerald-100/80 dark:bg-emerald-900/40 border border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100">
                <span className="font-bold font-sans">Unlocked Safe Liquid Headroom:</span>
                <span className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                  +₹{dpCalculations.postLiquidationHeadroom.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-950 dark:text-emerald-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Monthly Bank Overdraft Savings:</span>
              </div>
              <div>• Permanent monthly interest reduction: <strong>₹{dpCalculations.monthlyInterestSaved.toLocaleString()}/month</strong>.</div>
              <div>• Annual finance interest saved: <strong>₹{dpCalculations.annualInterestSaved.toLocaleString()}/year</strong> (@ {bankConfig.annualInterestRate}% p.a.).</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-300 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
            This metric alone justifies your ₹15,000–₹35,000 audit fee in a single client meeting.
          </div>
        </div>
      </div>

      {/* 4. Bank Parameters Customization Panel */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mb-3">
          <Building className="w-4 h-4 text-emerald-600" />
          <span>Client Bank Facilities &amp; CC Parameters</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-semibold block text-neutral-700 dark:text-neutral-300 mb-1">
              Financing Bank &amp; Branch:
            </label>
            <input
              type="text"
              value={bankConfig.bankName}
              onChange={(e) => handleConfigChange('bankName', e.target.value)}
              className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold block text-neutral-700 dark:text-neutral-300 mb-1">
              Sanctioned CC/OD Limit (₹):
            </label>
            <input
              type="number"
              step={100000}
              value={bankConfig.sanctionedLimit}
              onChange={(e) => handleConfigChange('sanctionedLimit', Number(e.target.value) || 0)}
              className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold block text-neutral-700 dark:text-neutral-300 mb-1">
              Current CC Outstanding Balance (₹):
            </label>
            <input
              type="number"
              step={50000}
              value={bankConfig.currentOutstanding}
              onChange={(e) => handleConfigChange('currentOutstanding', Number(e.target.value) || 0)}
              className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold block text-neutral-700 dark:text-neutral-300 mb-1">
              Eligible Book Debts &lt;90 Days (₹):
            </label>
            <input
              type="number"
              step={50000}
              value={bankConfig.eligibleBookDebts}
              onChange={(e) => handleConfigChange('eligibleBookDebts', Number(e.target.value) || 0)}
              className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold block text-neutral-700 dark:text-neutral-300 mb-1">
              Unpaid Trade Creditors (₹):
            </label>
            <input
              type="number"
              step={25000}
              value={bankConfig.unpaidCreditors}
              onChange={(e) => handleConfigChange('unpaidCreditors', Number(e.target.value) || 0)}
              className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold block text-neutral-700 dark:text-neutral-300 mb-1">
              Stock Margin Required (%):
            </label>
            <input
              type="number"
              value={bankConfig.stockMarginPercent}
              onChange={(e) => handleConfigChange('stockMarginPercent', Number(e.target.value) || 0)}
              className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold block text-neutral-700 dark:text-neutral-300 mb-1">
              Bank Base Interest Rate (% p.a.):
            </label>
            <input
              type="number"
              step={0.25}
              value={bankConfig.annualInterestRate}
              onChange={(e) => handleConfigChange('annualInterestRate', Number(e.target.value) || 0)}
              className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold block text-neutral-700 dark:text-neutral-300 mb-1">
              Penal Interest on Breach (% p.a.):
            </label>
            <input
              type="number"
              step={0.5}
              value={bankConfig.penalInterestRate}
              onChange={(e) => handleConfigChange('penalInterestRate', Number(e.target.value) || 0)}
              className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 5. Official Form 'A' Bank Stock Statement Export Preview */}
      <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Official Monthly Form 'A' Stock Statement (Bank Deliverable)
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Ready-to-submit monthly compliance filing for {bankConfig.bankName} credit department.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyStatement}
              className="px-3 py-1.5 text-xs font-semibold rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
            >
              {copiedStatement ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
              <span>{copiedStatement ? 'Copied Form A' : 'Copy Statement'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Form 'A'</span>
            </button>
          </div>
        </div>

        <pre className="p-4 rounded-lg bg-neutral-950 text-neutral-200 font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed border border-neutral-800 selection:bg-emerald-500/30">
          {bankStatementText}
        </pre>
      </div>
    </div>
  );
};

export default BankDrawingPowerHub;
