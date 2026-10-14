import React, { useState } from 'react';
import { OwnerReportSummary, CurrencyCode, ClientWorkspace, WhiteLabelProfile } from '../types';
import { formatCurrency } from '../utils/calculations';
import { EmailDraftModal } from './EmailDraftModal';
import { 
  FileText, 
  Send, 
  Printer, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Briefcase, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Flame, 
  ArrowRight,
  Clock,
  Mail
} from 'lucide-react';

interface ConsultingProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: OwnerReportSummary;
  currency: CurrencyCode;
  client: ClientWorkspace | null;
  whiteLabel?: WhiteLabelProfile;
}

export const ConsultingProposalModal: React.FC<ConsultingProposalModalProps> = ({
  isOpen,
  onClose,
  summary,
  currency,
  client,
  whiteLabel,
}) => {
  const [consultantName, setConsultantName] = useState(whiteLabel?.practitionerName || whiteLabel?.firmName || 'Working Capital Advisory Services');
  const [fixedAuditFee, setFixedAuditFee] = useState(15000);
  const [successFeePct, setSuccessFeePct] = useState(5);
  const [targetRecoveryPct, setTargetRecoveryPct] = useState(50);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  if (!isOpen) return null;

  const clientName = client?.clientName || 'Ambattur Fabrication Unit';
  const location = client?.location || 'Ambattur Industrial Estate, Chennai';
  const targetRecoverableCash = Math.round(summary.deadCash * (targetRecoveryPct / 100));
  const estimatedAnnualInterestSaved = Math.round(targetRecoverableCash * (summary.holdingCostRate / 100));
  const potentialSuccessFee = Math.round(targetRecoverableCash * (successFeePct / 100));

  const pitchWhatsApp = `Dear ${client?.contactPerson || 'Managing Director'},

Following our preliminary review of ${clientName}'s inventory ledgers, here is our Working Capital Audit Summary:

• Total Stock on Books: ${formatCurrency(summary.totalStockValue, currency)}
• Dead Inventory (≥180d Idle): ${formatCurrency(summary.deadCash, currency)} (${summary.deadCashPercent}% of stock)
• Annual Bank Overdraft Bleed: ~${formatCurrency(summary.annualHoldingBurn, currency)} / year in finance interest

Our 30-Day Liquidation Roadmap targets recovering ${formatCurrency(targetRecoverableCash, currency)} directly into your current account while cutting ~${formatCurrency(estimatedAnnualInterestSaved, currency)}/year in bank interest.

Engagement Options:
Option 1: Fixed Audit & Playbook Fee: ₹${fixedAuditFee.toLocaleString()}
Option 2: Success-Fee Model: 0% upfront, ${successFeePct}% on recovered cash.

Would you be open for a 15-minute briefing this Thursday at your factory office?`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-panel rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col my-8 border border-neutral-300 dark:border-neutral-700/80">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 tracking-tight">
                <span>Client Proposal &amp; Engagement Letter Generator</span>
                <span className="industrial-badge bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30">
                  Client-Ready
                </span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                Turn audit numbers into a signed consulting contract with fixed or success-fee pricing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close Proposal Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 flex-1 max-h-[75vh] overflow-y-auto">
          {/* Controls Bar */}
          <div className="p-3.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-600 dark:text-neutral-400">Fixed Audit Fee:</span>
              <div className="flex items-center gap-1 font-mono">
                <span>₹</span>
                <input
                  type="number"
                  value={fixedAuditFee}
                  onChange={(e) => setFixedAuditFee(Number(e.target.value) || 0)}
                  className="w-24 p-1 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-bold text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-600 dark:text-neutral-400">Success Fee Rate:</span>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  value={successFeePct}
                  onChange={(e) => setSuccessFeePct(Number(e.target.value) || 0)}
                  className="w-16 p-1 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-bold text-neutral-900 dark:text-white"
                />
                <span>%</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-600 dark:text-neutral-400">Recovery Target:</span>
              <select
                value={targetRecoveryPct}
                onChange={(e) => setTargetRecoveryPct(Number(e.target.value))}
                className="p-1 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono font-bold text-neutral-900 dark:text-white"
              >
                <option value={25}>25% Recovery</option>
                <option value={50}>50% Recovery (Target)</option>
                <option value={75}>75% Recovery</option>
                <option value={100}>100% Recovery</option>
              </select>
            </div>
          </div>

          {/* Printable Proposal Document Container */}
          <div className="border border-neutral-300 dark:border-neutral-700 rounded-xl p-6 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 space-y-5 shadow-sm">
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
                  CONFIDENTIAL EXECUTIVE PROPOSAL
                </span>
                <h3 className="text-lg font-bold mt-0.5">
                  Working Capital &amp; Dead Inventory Optimization
                </h3>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Prepared for: <strong>{clientName}</strong> · {location}
                </div>
              </div>
              <div className="text-left sm:text-right text-xs font-mono text-neutral-400">
                <div>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div>Status: Proposal Draft</div>
              </div>
            </div>

            {/* Section 1: Executive Diagnosis */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                1. Executive Diagnostic Findings
              </h4>
              <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                Based on our preliminary inventory audit, <strong>{clientName}</strong> currently maintains{' '}
                <strong className="font-mono text-neutral-900 dark:text-white">{formatCurrency(summary.totalStockValue, currency)}</strong> in recorded stock.
                Of this balance, <strong className="font-mono text-rose-600 dark:text-rose-400">{formatCurrency(summary.deadCash, currency)}</strong> ({summary.deadCashPercent}%) has remained idle for over {summary.ageingBreakdown.range180_plus_pct}% days without production issue or customer billing.
              </p>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
                  <div className="text-[10px] text-rose-800 dark:text-rose-300 font-bold uppercase">Dead Capital Trapped</div>
                  <div className="text-base font-mono font-bold text-rose-700 dark:text-rose-400 mt-0.5">
                    {formatCurrency(summary.deadCash, currency)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                  <div className="text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase">Annual Bank OD Bleed</div>
                  <div className="text-base font-mono font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                    ~{formatCurrency(summary.annualHoldingBurn, currency)}
                  </div>
                  <div className="text-[10px] text-amber-900/60 dark:text-amber-300/60 mt-0.5">@ {summary.holdingCostRate}% p.a. bank cost</div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                  <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold uppercase">Target Cash Recovery</div>
                  <div className="text-base font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    +{formatCurrency(targetRecoverableCash, currency)}
                  </div>
                  <div className="text-[10px] text-emerald-900/60 dark:text-emerald-300/60 mt-0.5">{targetRecoveryPct}% Liquidation Target</div>
                </div>
              </div>
            </div>

            {/* Section 2: 4-Week Scope of Work */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                2. Scope of Engagement &amp; 30-Day Execution Timeline
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-2 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">Week 1:</span>
                  <div>
                    <strong>Data Cleansing &amp; Pareto 80/20 Classification:</strong> Extract Tally inventory daybooks, isolate the top 5 high-value dead SKUs, and verify physical counts.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">Week 2:</span>
                  <div>
                    <strong>Vendor Buyback Negotiations:</strong> Formulate structured commercial letters offering suppliers a 10% restocking discount on standard prime raw materials.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">Week 3:</span>
                  <div>
                    <strong>Secondary Market &amp; Scrap Auction:</strong> Conduct competitive sealed bids among 3 certified industrial merchants for non-standard offcuts.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">Week 4:</span>
                  <div>
                    <strong>Cash Collection &amp; Bank Overdraft Reduction:</strong> Ensure funds hit your current account, pay down the bank CC line, and establish re-order freezes.
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Commercial Engagement Models */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                3. Commercial Engagement Options
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Option A */}
                <div className="p-3.5 rounded-lg border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-1.5">
                  <div className="font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                    <span>Option A: Fixed Advisory Retainer</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                      ₹{fixedAuditFee.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Flat one-time fee. Includes complete audit deliverable, vendor communication scripts, and scrap auction management.
                  </p>
                </div>

                {/* Option B */}
                <div className="p-3.5 rounded-lg border-2 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-1.5">
                  <div className="font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                    <span>Option B: Value-Shared Success Fee</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                      {successFeePct}% on Cash Recovered
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Zero upfront fees. You only pay {successFeePct}% of the liquid cash credited to your current account (Projected fee: ~₹{potentialSuccessFee.toLocaleString()}).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-neutral-500">
            Share this pitch directly with {clientName}'s management.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Generate formatted HTML email draft of initial audit findings"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>HTML Email Draft</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Proposal (A4)</span>
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(pitchWhatsApp)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Pitch via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Formatted HTML Email Draft Modal */}
      {isEmailModalOpen && (
        <EmailDraftModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          summary={summary}
          rules={{
            asOfDate: summary.asOfDate,
            deadThresholdDays: 180,
            slowThresholdDays: 90,
            classACutoff: 80,
            classBCutoff: 95,
            holdingCostPercent: summary.holdingCostRate,
          }}
          currency={currency}
          client={client}
          whiteLabel={whiteLabel}
        />
      )}
    </div>
  );
};

export default ConsultingProposalModal;
