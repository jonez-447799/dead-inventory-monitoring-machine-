import React, { useState, useMemo } from 'react';
import { 
  StockItem, 
  RulesConfig, 
  CurrencyCode, 
  ClientWorkspace, 
  WhiteLabelProfile 
} from '../types';
import { formatCurrency, generateOwnerReport } from '../utils/calculations';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Briefcase, 
  Flame, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  Send, 
  Users, 
  Percent, 
  ChevronRight, 
  ArrowRight, 
  Lock, 
  Scale, 
  Clock, 
  Sparkles, 
  Calculator, 
  ShieldAlert, 
  PhoneCall, 
  Mail, 
  FileSpreadsheet,
  Zap,
  Target,
  BadgeAlert,
  Kanban
} from 'lucide-react';

interface CommercialMonetizationHubProps {
  items: StockItem[];
  rules: RulesConfig;
  currency: CurrencyCode;
  client?: ClientWorkspace | null;
  whiteLabel?: WhiteLabelProfile;
  onNavigateToTab?: (tab: any) => void;
}

interface AuditDealLead {
  id: string;
  companyName: string;
  industry: string;
  contactPerson: string;
  phone: string;
  stage: 'Lead' | 'Tally Dump' | 'Teaser Sent' | 'Engagement Signed' | 'Liquidation' | 'Fee Paid';
  estimatedDeadStock: number;
  quotedAuditFee: number;
  contingencyRate: number;
  notes: string;
}

const DEFAULT_DEAL_PIPELINE: AuditDealLead[] = [
  {
    id: 'deal-01',
    companyName: 'Ambattur Fabrication Works',
    industry: 'Heavy Structural Steel',
    contactPerson: 'Mr. R. Sundaram (MD)',
    phone: '+91 98400 12345',
    stage: 'Engagement Signed',
    estimatedDeadStock: 379300,
    quotedAuditFee: 25000,
    contingencyRate: 15,
    notes: 'Advance of ₹15,000 received. Target: Liquidate ₹1.9L dead stock within 30 days via vendor buybacks.',
  },
  {
    id: 'deal-02',
    companyName: 'Sri Ram Precision Machine Tools',
    industry: 'Pumps & Industrial Valves',
    contactPerson: 'Mr. K. Narayanan (Plant Head)',
    phone: '+91 94440 67890',
    stage: 'Teaser Sent',
    estimatedDeadStock: 350800,
    quotedAuditFee: 35000,
    contingencyRate: 12,
    notes: 'Sent watermarked audit teaser highlighting ₹3.5L dead stock in cast valves & bronze impellers. Follow-up meeting scheduled for Thursday.',
  },
  {
    id: 'deal-03',
    companyName: 'Apex Automotive Stamping Pvt Ltd',
    industry: 'Auto Ancillary Tier 2',
    contactPerson: 'Mr. Arvind Swamy (CFO)',
    phone: '+91 98840 55432',
    stage: 'Tally Dump',
    estimatedDeadStock: 820000,
    quotedAuditFee: 50000,
    contingencyRate: 15,
    notes: 'Received FY24-25 XML stock ledgers. Ingesting into engine to prepare 1-page Preliminary Diagnostic Teaser.',
  },
  {
    id: 'deal-04',
    companyName: 'Madras Alloy Fasteners & Springs',
    industry: 'Industrial Fasteners',
    contactPerson: 'Mr. Suresh Babu (Managing Partner)',
    phone: '+91 97910 11223',
    stage: 'Lead',
    estimatedDeadStock: 450000,
    quotedAuditFee: 30000,
    contingencyRate: 10,
    notes: 'Referred by branch manager at Canara Bank Ambattur. Client struggling with ₹18L bank drawing power shortfall.',
  },
];

export const CommercialMonetizationHub: React.FC<CommercialMonetizationHubProps> = ({
  items,
  rules,
  currency,
  client,
  whiteLabel,
  onNavigateToTab,
}) => {
  const summary = useMemo(() => generateOwnerReport(items, rules), [items, rules]);
  
  // Dual-mode master switcher: SaaS vs Auditor
  const [activeCommercialMode, setActiveCommercialMode] = useState<'saas_product' | 'auditor_weapon'>('saas_product');

  // Mode 1: SaaS State
  const [saasTier, setSaasTier] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [targetReleasePct, setTargetReleasePct] = useState<number>(35);
  const [scrapRecoveryRate, setScrapRecoveryRate] = useState<number>(30); // scrap salvage rate
  const [copiedMemo, setCopiedMemo] = useState(false);

  // Mode 2: Auditor State
  const [diagnosticFee, setDiagnosticFee] = useState<number>(25000);
  const [floorAuditFee, setFloorAuditFee] = useState<number>(100000);
  const [contingencyPct, setContingencyPct] = useState<number>(15);
  const [monthlyRetainerFee, setMonthlyRetainerFee] = useState<number>(30000);
  const [copiedTeaser, setCopiedTeaser] = useState(false);
  const [copiedPitchScript, setCopiedPitchScript] = useState<string | null>(null);

  // Pipeline CRM State
  const [deals, setDeals] = useState<AuditDealLead[]>(() => {
    try {
      const saved = localStorage.getItem('p1_auditor_crm_deals');
      return saved ? JSON.parse(saved) : DEFAULT_DEAL_PIPELINE;
    } catch {
      return DEFAULT_DEAL_PIPELINE;
    }
  });

  const [newDealCompany, setNewDealCompany] = useState('');
  const [newDealContact, setNewDealContact] = useState('');
  const [newDealPhone, setNewDealPhone] = useState('');
  const [newDealStock, setNewDealStock] = useState(300000);
  const [showAddDealForm, setShowAddDealForm] = useState(false);

  const handleUpdateDealStage = (dealId: string, newStage: AuditDealLead['stage']) => {
    const updated = deals.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d));
    setDeals(updated);
    try {
      localStorage.setItem('p1_auditor_crm_deals', JSON.stringify(updated));
    } catch {}
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealCompany.trim()) return;
    const newDeal: AuditDealLead = {
      id: `deal-${Date.now()}`,
      companyName: newDealCompany.trim(),
      industry: 'Manufacturing Unit',
      contactPerson: newDealContact.trim() || 'Owner / Director',
      phone: newDealPhone.trim() || '+91 98xxx xxxxx',
      stage: 'Lead',
      estimatedDeadStock: newDealStock,
      quotedAuditFee: Math.round(newDealStock * 0.08),
      contingencyRate: 15,
      notes: 'Initial outreach lead logged.',
    };
    const updated = [newDeal, ...deals];
    setDeals(updated);
    try {
      localStorage.setItem('p1_auditor_crm_deals', JSON.stringify(updated));
    } catch {}
    setNewDealCompany('');
    setNewDealContact('');
    setNewDealPhone('');
    setShowAddDealForm(false);
  };

  // SaaS Pricing Tiers
  const SAAS_TIERS = {
    starter: {
      name: 'Plant Starter',
      monthlyPrice: currency === 'INR' ? 18000 : 249,
      annualPrice: currency === 'INR' ? 180000 : 2490,
      limits: '1 Factory · Up to 1,000 SKUs · Daily Refresh',
      audience: 'Single-plant MSME owners & store heads',
    },
    pro: {
      name: 'CFO Professional',
      monthlyPrice: currency === 'INR' ? 38000 : 499,
      annualPrice: currency === 'INR' ? 380000 : 4990,
      limits: 'Up to 3 Plants · 10,000 SKUs · Bank DP Optimizer · Tally Live Sync',
      audience: 'Mid-market manufacturing CFOs & Operations Heads',
    },
    enterprise: {
      name: 'Enterprise Portfolio',
      monthlyPrice: currency === 'INR' ? 85000 : 1199,
      annualPrice: currency === 'INR' ? 850000 : 11990,
      limits: 'Unlimited Plants · Group Consolidated Dashboard · Scrap Tender API',
      audience: 'Industrial Conglomerates & PE Operating Partners',
    },
  };

  // SaaS Calculations
  const selectedTierConfig = SAAS_TIERS[saasTier];
  const annualSoftwareCost = selectedTierConfig.annualPrice;
  const simulatedUnlockedCash = Math.round(summary.deadCash * (targetReleasePct / 100));
  const simulatedAnnualHoldingSaved = Math.round(simulatedUnlockedCash * (rules.holdingCostPercent / 100));
  const totalFinancialBenefit = simulatedUnlockedCash + simulatedAnnualHoldingSaved;
  const netRoiRatio = annualSoftwareCost > 0 ? (totalFinancialBenefit / annualSoftwareCost).toFixed(1) : '10+';
  const paybackDays = annualSoftwareCost > 0 ? Math.round((annualSoftwareCost / (simulatedUnlockedCash / 30))) : 15;

  // Working Capital Health Score (0 - 100)
  const healthScore = useMemo(() => {
    let score = 100;
    // Penalty for dead cash ratio: if dead cash > 15%, heavy penalty
    if (summary.deadCashPercent > 35) score -= 45;
    else if (summary.deadCashPercent > 20) score -= 30;
    else if (summary.deadCashPercent > 10) score -= 15;
    else score -= Math.round(summary.deadCashPercent * 0.8);

    // Penalty for slow cash ratio
    if (summary.slowCashPercent > 25) score -= 20;
    else if (summary.slowCashPercent > 10) score -= 10;

    // Penalty for holding cost burn
    if (summary.annualHoldingBurn > 100000) score -= 15;
    else if (summary.annualHoldingBurn > 50000) score -= 8;

    return Math.max(12, Math.min(98, Math.round(score)));
  }, [summary]);

  const healthGrade = healthScore >= 85 ? 'A' : healthScore >= 70 ? 'B' : healthScore >= 50 ? 'C' : healthScore >= 35 ? 'D' : 'F';
  const healthLabel = 
    healthGrade === 'A' ? 'Healthy Working Capital Velocity' :
    healthGrade === 'B' ? 'Minor Inefficiencies & Pockets of Idle Stock' :
    healthGrade === 'C' ? 'Moderate Capital Hemorrhage (Immediate Liquidation Recommended)' :
    healthGrade === 'D' ? 'Severe Working Capital Freeze (High Risk of Bank DP Breach)' :
    'Critical Balance Sheet Distress (Immediate Cash Recovery Intervention Required)';

  // Auditor Calculations
  const consultantFirm = whiteLabel?.firmName || 'Apex Working Capital Advisory';
  const consultantAuditor = whiteLabel?.practitionerName || 'V. Raman, Senior Working Capital Auditor';
  const potentialContingencyFee = Math.round(summary.deadCash * (contingencyPct / 100));
  const totalAuditEngagementValue = diagnosticFee + potentialContingencyFee + (monthlyRetainerFee * 3);

  // Boardroom Memo Content
  const boardroomMemoText = `CONFIDENTIAL EXECUTIVE MEMORANDUM
TO: Board of Directors & Banking Consortium
FROM: Chief Financial Officer / Working Capital Auditor
SUBJECT: Trapped Working Capital Audit & Inventory Liquidation Plan
DATE: ${rules.asOfDate}
FACILITY: ${client?.clientName || 'Ambattur Fabrication Works'}

1. EXECUTIVE SUMMARY & DIAGNOSTIC FINDINGS
• Total Physical Inventory on Balance Sheet: ${formatCurrency(summary.totalStockValue, currency)} across ${summary.totalItemCount} active SKUs.
• Trapped / Dead Capital (≥${rules.deadThresholdDays} Days Idle): ${formatCurrency(summary.deadCash, currency)} (${summary.deadCashPercent}% of total book value).
• Annual Working Capital Finance Bleed: ${formatCurrency(summary.annualHoldingBurn, currency)} per year at ${rules.holdingCostPercent}% p.a. carrying cost.
• Health Diagnostic Score: ${healthScore}/100 [Grade: ${healthGrade}] — ${healthLabel}.

2. TARGET LIQUIDATION & CASH UNLOCK TIMELINE
• Proposed Target Liquidation: ${targetReleasePct}% of dead inventory over the next 45 days.
• Projected Direct Cash Unlocked into Current Account: ${formatCurrency(simulatedUnlockedCash, currency)}.
• Ongoing Bank Overdraft Interest Savings: ${formatCurrency(simulatedAnnualHoldingSaved, currency)} / year.
• Combined 12-Month Financial Uplift: ${formatCurrency(totalFinancialBenefit, currency)}.

3. TOP TRAINED DEAD ASSETS REQUIRING IMMEDIATE DISPOSAL
${summary.topDeadItems.slice(0, 5).map((item, idx) => `  ${idx + 1}. [${item.itemCode}] ${item.itemName} — Qty: ${item.qtyOnHand} | Value: ${formatCurrency(item.closingValue || 0, currency)} | Idle: ${item.daysIdle || 0} days`).join('\n')}

4. RECOMMENDED BOARD ACTIONS
[ ] Approve 10% restocking discount for original steel & component vendors on identified raw materials.
[ ] Authorize sealed-bid tender for unworkable slow spares & scrap castings.
[ ] File adjusted Form A stock statement with working capital bank to secure compliant Drawing Power.`;

  // Preliminary Teaser Content (Partially Redacted for Prospecting)
  const teaserText = `CONFIDENTIAL PRELIMINARY AUDIT TEASER
CLIENT: ${client?.clientName || 'Manufacturing Enterprise'} (Target Facility)
AUDIT AUTHORITY: ${consultantFirm} (${whiteLabel?.registrationOrUdin || 'UDIN-2026-P1'})
DATE: ${rules.asOfDate}

ATTENTION: Managing Director / Chief Financial Officer

PRELIMINARY INVENTORY DIAGNOSTIC HIGHLIGHTS:
We have completed a preliminary algorithmic scan of your factory's inventory ledgers. Below are the verified metrics:

• Total Inventory Value Scanned: ${formatCurrency(summary.totalStockValue, currency)}
• Verified Dead Capital (Idle >${rules.deadThresholdDays}d): ${formatCurrency(summary.deadCash, currency)} [${summary.deadCashPercent}% of stock!]
• Finance & Overdraft Bleed: ~${formatCurrency(summary.annualHoldingBurn, currency)} / year in avoidable interest

SAMPLE IDENTIFIED DEAD INVENTORY ASSETS (REDACTED PREVIEW):
${summary.topDeadItems.slice(0, 4).map((item, idx) => `  ${idx + 1}. [SKU-REDACTED-${idx + 1}] ${item.itemName.slice(0, 18)}*** — Book Value: ${formatCurrency(item.closingValue || 0, currency)} | Idle: ${item.daysIdle || 0} days`).join('\n')}

COMMERCIAL ENGAGEMENT OFFER:
To receive the complete unredacted SKU-level liquidation schedule, vendor buyback letters, and bank drawing power restoration plan:
• Upfront Diagnostic Retainer: ${formatCurrency(diagnosticFee, currency)}
• Contingency Success Fee: ${contingencyPct}% of verified cash recovered through vendor returns & tender auctions. (No cash unlocked = No success fee).

Contact: ${consultantAuditor} | ${whiteLabel?.contactPhone || '+91 98401 23456'} | ${whiteLabel?.contactEmail || 'audit@apexcapital.in'}`;

  const handleCopyMemo = () => {
    navigator.clipboard.writeText(boardroomMemoText);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 2500);
  };

  const handleCopyTeaser = () => {
    navigator.clipboard.writeText(teaserText);
    setCopiedTeaser(true);
    setTimeout(() => setCopiedTeaser(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Mode Switcher */}
      <div className="glass-panel text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-neutral-200/80 dark:border-neutral-800/80">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="industrial-badge bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                Dual Commercial Monetization Engine
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                Project 1 Enterprise Capital Architecture
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Working Capital Monetization &amp; ROI Center
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed font-mono text-xs">
              Equipped with both modes: deploy as an automated monthly SaaS platform for factory CFOs, or wield as an executive auditing instrument to close high-ticket diagnostic engagements with contingency success fees.
            </p>
          </div>

          {/* Master Mode Switcher Tabs */}
          <div className="bg-neutral-100/90 dark:bg-neutral-900/90 p-1 rounded-lg border border-neutral-300/80 dark:border-neutral-800 flex items-center gap-1 shrink-0">
            <button
              onClick={() => setActiveCommercialMode('saas_product')}
              className={`px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                activeCommercialMode === 'saas_product'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-200/80 dark:border-neutral-700/60'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Mode A: SaaS Product to Factories</span>
            </button>
            <button
              onClick={() => setActiveCommercialMode('auditor_weapon')}
              className={`px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                activeCommercialMode === 'auditor_weapon'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-200/80 dark:border-neutral-700/60'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Mode B: Internal Tool to Sell Audits</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE A: AS A SOFTWARE PRODUCT SOLD TO FACTORIES (SAAS BUYER EXPERIENCE)   */}
      {/* ========================================================================= */}
      {activeCommercialMode === 'saas_product' && (
        <div className="space-y-6">
          {/* Key Metrics Bar: Health Score & Live ROI */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Health Score Card */}
            <div className="glass-card p-5 rounded-xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="industrial-label text-neutral-600 dark:text-neutral-400 text-[11px]">
                  Trapped Capital Score
                </span>
                <span className={`industrial-badge ${
                  healthGrade === 'A' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' :
                  healthGrade === 'B' ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30' :
                  healthGrade === 'C' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' :
                  'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
                }`}>
                  Grade {healthGrade}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl industrial-metric text-neutral-950 dark:text-neutral-50">
                  {healthScore}
                </span>
                <span className="text-xs text-neutral-500 font-mono">/ 100</span>
              </div>
              <p className="mt-2 text-[11px] text-neutral-600 dark:text-neutral-400 font-mono line-clamp-2">
                {healthLabel}
              </p>
            </div>

            {/* Total Trapped Cash */}
            <div className="glass-card glass-card-rose p-5 rounded-xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="industrial-label text-rose-800 dark:text-rose-300 text-[11px]">
                  Dead Trapped Stock
                </span>
                <BadgeAlert className="w-4 h-4 text-rose-500" />
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl industrial-metric text-rose-600 dark:text-rose-400">
                  {formatCurrency(summary.deadCash, currency)}
                </span>
                <span className="text-xs font-mono ml-2 text-rose-600 dark:text-rose-400">
                  ({summary.deadCashPercent}% of total)
                </span>
              </div>
              <p className="mt-2 text-[11px] text-rose-800/80 dark:text-rose-300/80 font-mono">
                {summary.deadItemCount} SKUs idle &gt;{rules.deadThresholdDays} days without production movement.
              </p>
            </div>

            {/* Annual Carrying Cost Bleed */}
            <div className="glass-card glass-card-amber p-5 rounded-xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="industrial-label text-amber-800 dark:text-amber-300 text-[11px]">
                  Bank Overdraft Bleed
                </span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl industrial-metric text-amber-600 dark:text-amber-400">
                  {formatCurrency(summary.annualHoldingBurn, currency)}
                </span>
                <span className="text-xs text-neutral-500 font-mono ml-1">/ year</span>
              </div>
              <p className="mt-2 text-[11px] text-amber-800/80 dark:text-amber-300/80 font-mono">
                Calculated at {rules.holdingCostPercent}% p.a. bank CC interest + warehouse space &amp; shrinkage.
              </p>
            </div>

            {/* Net Software Payback ROI */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-neutral-900 p-5 rounded-xl border border-amber-300 dark:border-amber-800/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  SaaS Payback Multiple
                </span>
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-700 dark:text-amber-400">
                  {netRoiRatio}x
                </span>
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                  Net ROI in Year 1
                </span>
              </div>
              <p className="mt-2 text-[11px] text-amber-800/90 dark:text-amber-300/80">
                Recovers full software cost in just <span className="font-bold">{paybackDays} days</span> through prevented dead stock.
              </p>
            </div>
          </div>

          {/* Interactive SaaS ROI & Payback Engine */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Tier Selector & ROI Math */}
            <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-amber-500" />
                    <span>The "No-Brainer" Factory CFO ROI Justification Engine</span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Select a software tier to see how this system proves positive cash flow to your factory buyer from Month 1.
                  </p>
                </div>

                {/* Tier Switcher Buttons */}
                <div className="inline-flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  {(['starter', 'pro', 'enterprise'] as const).map((tierKey) => (
                    <button
                      key={tierKey}
                      onClick={() => setSaasTier(tierKey)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
                        saasTier === tierKey
                          ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                      }`}
                    >
                      {tierKey}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Tier Banner */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    {selectedTierConfig.name}
                  </span>
                  <div className="text-lg font-black text-neutral-900 dark:text-white mt-0.5">
                    {formatCurrency(selectedTierConfig.monthlyPrice, currency)} / month
                    <span className="text-xs font-normal text-neutral-400 ml-2">
                      ({formatCurrency(selectedTierConfig.annualPrice, currency)} billed annually)
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {selectedTierConfig.limits} · {selectedTierConfig.audience}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-xs text-neutral-400 uppercase font-semibold">Net Payback Multiple</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {netRoiRatio}x Cash Return
                  </div>
                </div>
              </div>

              {/* Trapped Cash Release Simulator Sliders */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    <span>Target Dead Stock Liquidation Rate via Software Alerts:</span>
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded font-mono font-bold">
                      {targetReleasePct}%
                    </span>
                  </label>
                  <span className="text-xs text-neutral-400">
                    Recovering: {formatCurrency(simulatedUnlockedCash, currency)}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={targetReleasePct}
                  onChange={(e) => setTargetReleasePct(Number(e.target.value))}
                  className="w-full accent-amber-500 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                    <span className="text-[11px] font-medium text-neutral-400">Direct Trapped Cash Freed</span>
                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      {formatCurrency(simulatedUnlockedCash, currency)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                    <span className="text-[11px] font-medium text-neutral-400">Bank Interest Saved / Yr</span>
                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      {formatCurrency(simulatedAnnualHoldingSaved, currency)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                    <span className="text-[11px] font-medium text-neutral-400">Payback Period</span>
                    <div className="text-base font-black text-neutral-900 dark:text-neutral-100 mt-1">
                      {paybackDays} Days
                    </div>
                  </div>
                </div>
              </div>

              {/* Bullet Points for Closing the CFO */}
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs space-y-2">
                <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Why CFOs Will Never Cancel This Software Subscription:</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-neutral-700 dark:text-neutral-300">
                  <li><strong>Protects Banking Drawing Power (DP):</strong> Prevents bank auditors from finding unlisted dead stock during annual inspections and chopping their overdraft limit by ₹10L–₹50L.</li>
                  <li><strong>Autonomous Ageing Alerts:</strong> Instead of waiting for year-end audit write-offs, store managers get flagged on Day 180 to initiate return-to-vendor before materials rust.</li>
                  <li><strong>Board-Ready Documentation:</strong> Generates instantaneous board resolutions and scrap tender packs with complete audit trails.</li>
                </ul>
              </div>
            </div>

            {/* Right 1 Col: Boardroom Executive Memorandum */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    <span>Boardroom Executive Memo</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                    Export Ready
                  </span>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 mb-3">
                  One-click executive paper prepared for Board of Directors &amp; Bank Consortium review.
                </p>

                <div className="bg-neutral-50 dark:bg-neutral-950 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 font-mono text-[11px] text-neutral-700 dark:text-neutral-300 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                  {boardroomMemoText}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleCopyMemo}
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMemo ? 'Copied to Clipboard' : 'Copy Board Memo'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Print Boardroom Memo"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE B: AS AN INTERNAL TOOL FOR YOU TO SELL AUDITS (AUDITOR ADVISORY HUB)  */}
      {/* ========================================================================= */}
      {activeCommercialMode === 'auditor_weapon' && (
        <div className="space-y-6">
          {/* Auditor Earnings Potential Summary Banner */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-neutral-900 border border-emerald-800/80 rounded-xl p-5 shadow-sm text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Auditor Value-Pricing Calculator
                </span>
                <h3 className="text-xl font-black mt-1 text-white">
                  Projected Revenue from this Audit Client: {formatCurrency(totalAuditEngagementValue, currency)}
                </h3>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Combination of Upfront Diagnostic Fee + {contingencyPct}% Contingency Success Fee on recovered cash + Monthly Bank DP surveillance retainer.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] text-neutral-400 uppercase font-mono">Your 15% Success Fee on Trapped Cash</div>
                  <div className="text-2xl font-black text-emerald-400">
                    +{formatCurrency(potentialContingencyFee, currency)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Config & The "Confidential Teaser" Generator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Engagement Fee Structure Configurator */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-5">
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>The High-Ticket Audit Pricing Formula</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Never sell your time by the hour. Price based on the trapped cash you identify and unlock.
                </p>
              </div>

              <div className="space-y-4">
                {/* 1. Diagnostic Fee */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Phase 1: 48-Hour Diagnostic Scan (Upfront Retainer)
                    </label>
                    <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(diagnosticFee, currency)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="100000"
                    step="5000"
                    value={diagnosticFee}
                    onChange={(e) => setDiagnosticFee(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] text-neutral-400">
                    Covers raw Tally ingest, running the 14-column engine, and generating the Preliminary Teaser.
                  </span>
                </div>

                {/* 2. Contingency Success Fee */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <span>Phase 2: Contingency Success Fee on Recovered Cash:</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-xs">
                        {contingencyPct}%
                      </span>
                    </label>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(potentialContingencyFee, currency)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    step="1"
                    value={contingencyPct}
                    onChange={(e) => setContingencyPct(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] text-neutral-400">
                    Billed when factory receives vendor return credit notes or scrap liquidation cash.
                  </span>
                </div>

                {/* 3. Monthly Retainer */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Phase 3: Monthly Working Capital Surveillance Retainer
                    </label>
                    <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(monthlyRetainerFee, currency)} / mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15000"
                    max="75000"
                    step="5000"
                    value={monthlyRetainerFee}
                    onChange={(e) => setMonthlyRetainerFee(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] text-neutral-400">
                    Ongoing monthly Form A stock filing, Drawing Power protection, and quarterly stock aging verification.
                  </span>
                </div>
              </div>

              {/* Pitch Script Quick Action */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    The "Zero-Risk" Pitch to the Factory Managing Director:
                  </span>
                  <button
                    onClick={() => {
                      const pitch = `Mr. Sundaram, you are losing ₹${(summary.annualHoldingBurn/12).toLocaleString()} every single month in bank overdraft interest on ₹${summary.deadCash.toLocaleString()} of idle stock. Give us your stock ledger. If we do not identify and unlock at least 3x our fee in trapped cash, you pay us nothing.`;
                      navigator.clipboard.writeText(pitch);
                      setCopiedPitchScript('director');
                      setTimeout(() => setCopiedPitchScript(null), 2500);
                    }}
                    className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    {copiedPitchScript === 'director' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPitchScript === 'director' ? 'Copied' : 'Copy Pitch Script'}</span>
                  </button>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 italic">
                  "Give us your stock ledger. We will run our 14-column audit engine. If we do not identify and unlock at least 3x our fee in recoverable liquidity, you owe us nothing. When cash hits your bank account, we take our {contingencyPct}% success fee."
                </p>
              </div>
            </div>

            {/* Right: The Secret Weapon - Confidential Teaser Generator */}
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500" />
                      <span>One-Click Preliminary Audit Teaser (Redacted)</span>
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      The teaser that closes the deal: proves you found their cash leaks without giving away the SKU list for free.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Redacted Preview
                  </span>
                </div>

                <div className="mt-3 bg-neutral-50 dark:bg-neutral-950 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 font-mono text-[11px] text-neutral-700 dark:text-neutral-300 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                  {teaserText}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleCopyTeaser}
                  className="flex-1 py-2.5 px-3 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  {copiedTeaser ? <Check className="w-3.5 h-3.5 text-white" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{copiedTeaser ? 'Teaser Copied to Clipboard!' : 'Copy Teaser for WhatsApp / Email'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Print Teaser"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Deal Pipeline & Client Acquisition Kanban CRM */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Kanban className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Auditor Deal Pipeline &amp; Engagement CRM</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Track your prospective factory audits from initial Tally ledger ingest to contingency fee collection.
                </p>
              </div>

              <button
                onClick={() => setShowAddDealForm(!showAddDealForm)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>{showAddDealForm ? 'Cancel' : '+ Add New Factory Lead'}</span>
              </button>
            </div>

            {/* Add Deal Form */}
            {showAddDealForm && (
              <form onSubmit={handleCreateDeal} className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-500 font-semibold mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Guindy Precision Forge"
                    value={newDealCompany}
                    onChange={(e) => setNewDealCompany(e.target.value)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. K. Murugan (MD)"
                    value={newDealContact}
                    onChange={(e) => setNewDealContact(e.target.value)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98400 xxxxx"
                    value={newDealPhone}
                    onChange={(e) => setNewDealPhone(e.target.value)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded transition-colors"
                  >
                    Save to Pipeline
                  </button>
                </div>
              </form>
            )}

            {/* Pipeline Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {deals.map((deal) => {
                const stages: AuditDealLead['stage'][] = [
                  'Lead',
                  'Tally Dump',
                  'Teaser Sent',
                  'Engagement Signed',
                  'Liquidation',
                  'Fee Paid',
                ];
                const currentStageIdx = stages.indexOf(deal.stage);

                return (
                  <div
                    key={deal.id}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                          {deal.industry}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          deal.stage === 'Fee Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          deal.stage === 'Engagement Signed' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          deal.stage === 'Teaser Sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}>
                          {deal.stage}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white mt-1.5">
                        {deal.companyName}
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {deal.contactPerson} · {deal.phone}
                      </p>

                      <div className="mt-3 p-2 rounded bg-neutral-50 dark:bg-neutral-800/50 text-[11px] font-mono space-y-0.5">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Dead Stock:</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {formatCurrency(deal.estimatedDeadStock, currency)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Fixed Fee:</span>
                          <span className="font-bold text-neutral-700 dark:text-neutral-200">
                            {formatCurrency(deal.quotedAuditFee, currency)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Success Fee ({deal.contingencyRate}%):</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            +{formatCurrency(Math.round(deal.estimatedDeadStock * (deal.contingencyRate / 100)), currency)}
                          </span>
                        </div>
                      </div>

                      <p className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 italic">
                        "{deal.notes}"
                      </p>
                    </div>

                    {/* Stage Mover Selector */}
                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <label className="text-[10px] text-neutral-400 font-semibold block mb-1">
                        Move Stage:
                      </label>
                      <select
                        aria-label={`Change stage for ${deal.companyName}`}
                        value={deal.stage}
                        onChange={(e) => handleUpdateDealStage(deal.id, e.target.value as AuditDealLead['stage'])}
                        className="w-full text-xs p-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium"
                      >
                        {stages.map((stg) => (
                          <option key={stg} value={stg}>
                            {stg}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
