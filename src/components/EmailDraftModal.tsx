import React, { useState, useMemo } from 'react';
import { OwnerReportSummary, CurrencyCode, ClientWorkspace, RulesConfig, WhiteLabelProfile } from '../types';
import { formatCurrency } from '../utils/calculations';
import { 
  Mail, 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Eye, 
  Code2, 
  Send, 
  Building2, 
  Sparkles, 
  FileText, 
  TrendingDown, 
  AlertTriangle,
  Clock,
  Printer
} from 'lucide-react';

export interface EmailDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: OwnerReportSummary;
  rules: RulesConfig;
  currency: CurrencyCode;
  client?: ClientWorkspace | null;
  whiteLabel?: WhiteLabelProfile;
}

export const EmailDraftModal: React.FC<EmailDraftModalProps> = ({
  isOpen,
  onClose,
  summary,
  rules,
  currency,
  client,
  whiteLabel,
}) => {
  const clientName = client?.clientName || 'Ambattur Fabrication Works';
  const clientLocation = client?.location || 'Ambattur Industrial Estate, Chennai';
  const contactPerson = client?.contactPerson || 'Managing Director';
  const contactPhone = client?.contactPhone || '';

  // Customizable Consultant & Email Details
  const [recipientEmail, setRecipientEmail] = useState('md@ambatturfabrication.com');
  const [consultantName, setConsultantName] = useState(whiteLabel?.practitionerName || 'V. Raman, Working Capital Lead');
  const [firmName, setFirmName] = useState(whiteLabel?.firmName || 'Apex Industrial Working Capital Advisory');
  const [consultantPhone, setConsultantPhone] = useState(whiteLabel?.contactPhone || '+91 98401 23456');
  const [fixedAuditFee, setFixedAuditFee] = useState(15000);
  const [successFeePct, setSuccessFeePct] = useState(5);
  const [targetRecoveryPct, setTargetRecoveryPct] = useState(50);
  
  const [subject, setSubject] = useState(
    `Executive Inventory Cash Audit: ${formatCurrency(summary.deadCash, currency)} Locked in Dormant Stock – ${clientName}`
  );
  const [activeTab, setActiveTab] = useState<'preview' | 'html'>('preview');
  const [copiedType, setCopiedType] = useState<'rich' | 'html' | null>(null);

  const targetRecoverableCash = Math.round(summary.deadCash * (targetRecoveryPct / 100));
  const estimatedAnnualInterestSaved = Math.round(targetRecoverableCash * (summary.holdingCostRate / 100));
  const potentialSuccessFee = Math.round(targetRecoverableCash * (successFeePct / 100));

  // Generate Email-Safe Clean Inline HTML
  const emailHtml = useMemo(() => {
    const formattedTotalStock = formatCurrency(summary.totalStockValue, currency);
    const formattedDeadCash = formatCurrency(summary.deadCash, currency);
    const formattedSlowCash = formatCurrency(summary.slowCash, currency);
    const formattedHoldingBurn = formatCurrency(summary.annualHoldingBurn, currency);
    const formattedTargetCash = formatCurrency(targetRecoverableCash, currency);
    const formattedAnnualSaved = formatCurrency(estimatedAnnualInterestSaved, currency);

    // Top Dead Items Rows
    const deadItemsRows = summary.topDeadItems.slice(0, 5).map((item, idx) => {
      const daysOver = Math.max(0, (item.daysIdle || 0) - rules.deadThresholdDays);
      return `
        <tr style="border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #1f2937;">
          <td style="padding: 10px 12px; font-weight: 600;">
            ${idx + 1}. ${item.itemName}
            <div style="font-family: monospace; font-size: 10px; color: #6b7280; font-weight: normal; margin-top: 2px;">
              Code: ${item.itemCode} | Qty: ${item.qtyOnHand}
            </div>
          </td>
          <td style="padding: 10px 12px; color: #4b5563;">${item.category}</td>
          <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-weight: 600; color: #dc2626;">
            ${item.daysIdle}d
            <div style="font-size: 10px; color: #991b1b;">+${daysOver}d cutoff</div>
          </td>
          <td style="padding: 10px 12px; text-align: right; font-family: monospace; font-weight: 700; color: #111827;">
            ${formatCurrency(item.closingValue || 0, currency)}
          </td>
          <td style="padding: 10px 12px; font-size: 11px; color: #b45309; font-weight: 500;">
            ${item.action}
          </td>
        </tr>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; line-height: 1.5;">
  <div style="max-width: 680px; margin: 24px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    
    <!-- Header Banner -->
    <div style="background-color: #1e293b; padding: 24px 28px; border-bottom: 3px solid #f59e0b;">
      <div style="color: #f59e0b; font-family: monospace; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
        Confidential Executive Diagnostic · Working Capital Advisory
      </div>
      <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 6px 0 2px 0; line-height: 1.3;">
        Inventory Cash Audit &amp; Dead Stock Diagnostic
      </h1>
      <div style="color: #94a3b8; font-size: 12px;">
        Prepared for: <strong>${clientName}</strong> (${clientLocation}) · As of <strong>${rules.asOfDate}</strong>
      </div>
    </div>

    <!-- Main Content Body -->
    <div style="padding: 24px 28px;">
      
      <!-- Greeting -->
      <p style="font-size: 14px; margin-top: 0; color: #374151;">
        Dear <strong>${contactPerson}</strong>,
      </p>
      <p style="font-size: 13px; color: #4b5563; line-height: 1.6;">
        Following our preliminary analysis of <strong>${clientName}</strong>'s inventory ledgers, we have compiled this executive working capital diagnostic. Our objective is to expose non-moving capital locked in warehouse racks and outline an immediate 30-day cash recovery plan.
      </p>

      <!-- The Plain-English Headline Callout -->
      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 14px 18px; margin: 20px 0;">
        <div style="font-size: 10px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
          The Core Executive Headline
        </div>
        <div style="font-size: 14px; font-weight: 600; color: #78350f; line-height: 1.5;">
          "Of <strong>${formattedTotalStock}</strong> sitting in stock, <strong>${formattedDeadCash}</strong> has not moved in ${rules.deadThresholdDays} days. That dead pile costs about <strong>${formattedHoldingBurn}</strong> a year in bank overdraft interest just to keep."
        </div>
      </div>

      <!-- 4 Key Numbers Table -->
      <h3 style="font-size: 13px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; margin: 24px 0 10px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
        1. Summary Inventory Balance Sheet
      </h3>
      <table style="width: 100%; border-collapse: separate; border-spacing: 8px; margin-bottom: 20px;">
        <tr>
          <!-- Card 1 -->
          <td style="width: 50%; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; vertical-align: top;">
            <div style="font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase;">Stock on Books (Total)</div>
            <div style="font-size: 18px; font-family: monospace; font-weight: 700; color: #0f172a; margin-top: 4px;">${formattedTotalStock}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Every row's physical count × purchase rate</div>
          </td>
          <!-- Card 2 -->
          <td style="width: 50%; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; vertical-align: top;">
            <div style="font-size: 10px; color: #991b1b; font-weight: 700; text-transform: uppercase;">
              ⚠️ Dead Cash (${rules.deadThresholdDays}d+ Idle)
            </div>
            <div style="font-size: 18px; font-family: monospace; font-weight: 700; color: #dc2626; margin-top: 4px;">
              ${formattedDeadCash} <span style="font-size: 12px; color: #b91c1c; font-weight: normal;">(${summary.deadCashPercent}%)</span>
            </div>
            <div style="font-size: 11px; color: #991b1b; margin-top: 4px;">${summary.deadItemCount} of ${summary.totalItemCount} SKUs completely frozen</div>
          </td>
        </tr>
        <tr>
          <!-- Card 3 -->
          <td style="width: 50%; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; vertical-align: top;">
            <div style="font-size: 10px; color: #92400e; font-weight: 600; text-transform: uppercase;">Slow Moving (${rules.slowThresholdDays}–${rules.deadThresholdDays - 1}d)</div>
            <div style="font-size: 18px; font-family: monospace; font-weight: 700; color: #b45309; margin-top: 4px;">
              ${formattedSlowCash} <span style="font-size: 12px; color: #92400e; font-weight: normal;">(${summary.slowCashPercent}%)</span>
            </div>
            <div style="font-size: 11px; color: #92400e; margin-top: 4px;">Urgent: Freeze purchase reorders</div>
          </td>
          <!-- Card 4 -->
          <td style="width: 50%; background-color: #fdf4ff; border: 1px solid #f5d0fe; border-radius: 8px; padding: 12px 16px; vertical-align: top;">
            <div style="font-size: 10px; color: #86198f; font-weight: 700; text-transform: uppercase;">Annual Bank OD Bleed</div>
            <div style="font-size: 18px; font-family: monospace; font-weight: 700; color: #a21caf; margin-top: 4px;">
              ~${formattedHoldingBurn} / yr
            </div>
            <div style="font-size: 11px; color: #86198f; margin-top: 4px;">Calculated @ ${summary.holdingCostRate}% p.a. bank overdraft interest</div>
          </td>
        </tr>
      </table>

      <!-- Top 5 Dead Items Table -->
      <h3 style="font-size: 13px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; margin: 26px 0 10px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
        2. Priority Hitlist: Top Dormant Stock Lines
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background-color: #f3f4f6; text-align: left; font-size: 11px; color: #4b5563; text-transform: uppercase;">
            <th style="padding: 8px 12px; border-bottom: 2px solid #e5e7eb;">Item / SKU Code</th>
            <th style="padding: 8px 12px; border-bottom: 2px solid #e5e7eb;">Category</th>
            <th style="padding: 8px 12px; border-bottom: 2px solid #e5e7eb; text-align: right;">Days Idle</th>
            <th style="padding: 8px 12px; border-bottom: 2px solid #e5e7eb; text-align: right;">Value Locked</th>
            <th style="padding: 8px 12px; border-bottom: 2px solid #e5e7eb;">Recommended Action</th>
          </tr>
        </thead>
        <tbody>
          ${deadItemsRows}
        </tbody>
      </table>

      <!-- 30-Day Liquidation Roadmap -->
      <h3 style="font-size: 13px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; margin: 26px 0 10px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
        3. 30-Day Cash Recovery Strategy
      </h3>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; font-size: 12px; color: #334155;">
        <ul style="margin: 0; padding-left: 18px; line-height: 1.7;">
          <li><strong>Phase 1 (Week 1): Physical Verification:</strong> Reconcile the top 5 lines on the shop floor with your Tally balances.</li>
          <li><strong>Phase 2 (Week 2): Supplier Buybacks:</strong> Issue formal letters to original mills/distributors offering a 10% restocking discount on prime standard materials.</li>
          <li><strong>Phase 3 (Week 3): Secondary Market &amp; Scrap Auction:</strong> Invite 3 local certified merchants to bid on non-standard offcuts for immediate RTGS payment.</li>
          <li><strong>Phase 4 (Week 4): Overdraft Reduction:</strong> Deposit recovered proceeds directly into current account to permanently cut ~<strong>${formattedAnnualSaved}/year</strong> in bank finance interest.</li>
        </ul>
      </div>

      <!-- Commercial Options -->
      <h3 style="font-size: 13px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; margin: 26px 0 10px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
        4. Engagement Options for ${clientName}
      </h3>
      <table style="width: 100%; border-collapse: separate; border-spacing: 8px; margin-bottom: 24px;">
        <tr>
          <td style="width: 50%; background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 8px; padding: 14px; vertical-align: top;">
            <div style="font-size: 12px; font-weight: 700; color: #111827;">Option A: Fixed Advisory Retainer</div>
            <div style="font-size: 18px; font-family: monospace; font-weight: 700; color: #059669; margin: 6px 0;">₹${fixedAuditFee.toLocaleString()}</div>
            <div style="font-size: 11px; color: #6b7280; line-height: 1.4;">
              Flat fee for complete diagnostic report, supplier negotiation scripts, and scrap tender documentation.
            </div>
          </td>
          <td style="width: 50%; background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 14px; vertical-align: top;">
            <div style="font-size: 12px; font-weight: 700; color: #065f46;">Option B: Value-Shared Success Fee</div>
            <div style="font-size: 18px; font-family: monospace; font-weight: 700; color: #059669; margin: 6px 0;">${successFeePct}% of Cash Recovered</div>
            <div style="font-size: 11px; color: #047857; line-height: 1.4;">
              Zero upfront risk. Fee applies only to liquid capital deposited into your company current account.
            </div>
          </td>
        </tr>
      </table>

      <!-- Next Steps & Call to Action -->
      <div style="text-align: center; margin: 30px 0 10px 0;">
        <p style="font-size: 13px; color: #4b5563; margin-bottom: 14px;">
          Would you be open for a 15-minute briefing at your Ambattur office this week?
        </p>
        <a href="mailto:${consultantPhone}?subject=Re:%20Inventory%20Cash%20Audit%20Briefing" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 24px; border-radius: 6px;">
          Confirm 15-Minute Working Capital Briefing
        </a>
      </div>

    </div>

    <!-- Sign-off & Footer -->
    <div style="background-color: #f8fafc; padding: 18px 28px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #64748b;">
      <div style="font-weight: 700; color: #1e293b;">${consultantName}</div>
      <div style="color: #475569;">${firmName}</div>
      <div style="margin-top: 4px;">Phone: ${consultantPhone}</div>
      <div style="margin-top: 10px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px;">
        This document contains proprietary financial insights prepared strictly for ${clientName}. Generated via Project 1 Factory Cash Audit Engine.
      </div>
    </div>

  </div>
</body>
</html>`;
  }, [summary, rules, currency, clientName, clientLocation, contactPerson, subject, consultantName, firmName, consultantPhone, fixedAuditFee, successFeePct, targetRecoverableCash, estimatedAnnualInterestSaved]);

  // Clean Plain-Text representation for mailto: or text copy
  const emailPlainText = useMemo(() => {
    return `Subject: ${subject}
To: ${recipientEmail}

Dear ${contactPerson},

Following our preliminary review of ${clientName}'s inventory ledgers, here is our Working Capital Audit Summary:

• Total Stock on Books: ${formatCurrency(summary.totalStockValue, currency)}
• Dead Inventory (≥180d Idle): ${formatCurrency(summary.deadCash, currency)} (${summary.deadCashPercent}% of stock)
• Annual Bank Overdraft Bleed: ~${formatCurrency(summary.annualHoldingBurn, currency)} / year in finance interest

THE EXECUTIVE HEADLINE:
"Of ${formatCurrency(summary.totalStockValue, currency)} sitting in stock, ${formatCurrency(summary.deadCash, currency)} has not moved in ${rules.deadThresholdDays} days. That dead pile costs about ${formatCurrency(summary.annualHoldingBurn, currency)} a year in bank overdraft interest just to keep."

TOP DORMANT ITEMS:
${summary.topDeadItems.slice(0, 5).map((i, idx) => `${idx + 1}. ${i.itemName} (${i.itemCode}) - ${i.daysIdle} days idle - ${formatCurrency(i.closingValue || 0, currency)} locked - Action: ${i.action}`).join('\n')}

30-DAY CASH RECOVERY STRATEGY:
• Target Recoverable Cash: +${formatCurrency(targetRecoverableCash, currency)}
• Estimated Overdraft Interest Saved: ~${formatCurrency(estimatedAnnualInterestSaved, currency)}/year

ENGAGEMENT OPTIONS:
Option A: Fixed Advisory Retainer: ₹${fixedAuditFee.toLocaleString()}
Option B: Value-Shared Success Fee: ${successFeePct}% on Cash Recovered (0% upfront)

Would you be open for a 15-minute briefing at your office this week?

Sincerely,
${consultantName}
${firmName}
Phone: ${consultantPhone}`;
  }, [subject, recipientEmail, contactPerson, clientName, summary, rules, currency, targetRecoverableCash, estimatedAnnualInterestSaved, fixedAuditFee, successFeePct, consultantName, firmName, consultantPhone]);

  // Copy Styled Rich Text to Clipboard for Gmail / Outlook
  const handleCopyRichText = async () => {
    try {
      if (typeof window !== 'undefined' && 'clipboard' in navigator && window.ClipboardItem) {
        const htmlBlob = new Blob([emailHtml], { type: 'text/html' });
        const textBlob = new Blob([emailPlainText], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob,
          }),
        ]);
        setCopiedType('rich');
        setTimeout(() => setCopiedType(null), 3000);
        return;
      }
    } catch (e) {
      console.warn('ClipboardItem not supported or denied, falling back to text copy', e);
    }

    // Fallback: copy HTML source code
    await navigator.clipboard.writeText(emailHtml);
    setCopiedType('html');
    setTimeout(() => setCopiedType(null), 3000);
  };

  // Copy HTML source
  const handleCopyHtmlCode = async () => {
    await navigator.clipboard.writeText(emailHtml);
    setCopiedType('html');
    setTimeout(() => setCopiedType(null), 3000);
  };

  // Open default mail client
  const handleOpenMailClient = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailPlainText)}`;
    window.location.href = mailtoUrl;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-panel rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col my-6 max-h-[92vh] border border-neutral-300 dark:border-neutral-700/80">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                  Formatted HTML Audit Email Generator
                </h2>
                <span className="industrial-badge bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30">
                  Outlook &amp; Gmail Ready
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
                Generate an executive HTML email draft of the inventory audit findings to pitch factory owners.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close Email Draft Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-3.5 bg-neutral-100/70 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800 text-xs grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Recipient Email (Client MD):
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="e.g. md@ambatturfabrication.com"
              className="w-full p-1.5 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Consultant / Advisory Lead:
            </label>
            <input
              type="text"
              value={consultantName}
              onChange={(e) => setConsultantName(e.target.value)}
              className="w-full p-1.5 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Consultant Phone / WhatsApp:
            </label>
            <input
              type="text"
              value={consultantPhone}
              onChange={(e) => setConsultantPhone(e.target.value)}
              className="w-full p-1.5 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Email Subject Line:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-1.5 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Preview / HTML Code Switcher Tabs */}
        <div className="px-5 pt-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs bg-white dark:bg-neutral-900 shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 font-semibold rounded-t-lg border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'preview'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Formatted Email Preview</span>
            </button>

            <button
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1.5 font-semibold rounded-t-lg border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'html'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw HTML Source</span>
            </button>
          </div>

          <div className="text-[11px] text-neutral-500 font-mono hidden sm:block">
            Responsive · Inline CSS · Table-based layout
          </div>
        </div>

        {/* Viewport Content */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto bg-neutral-100 dark:bg-neutral-950">
          {activeTab === 'preview' ? (
            <div className="bg-white rounded-lg shadow-sm border border-neutral-300 overflow-hidden mx-auto max-w-2xl">
              {/* Simulated Email Envelope Header */}
              <div className="bg-neutral-50 border-b border-neutral-200 p-3 text-xs text-neutral-600 font-mono space-y-1">
                <div><span className="font-bold text-neutral-500">From:</span> {consultantName} &lt;advisory@apexcapital.in&gt;</div>
                <div><span className="font-bold text-neutral-500">To:</span> {recipientEmail}</div>
                <div><span className="font-bold text-neutral-500">Subject:</span> <strong className="text-neutral-900">{subject}</strong></div>
              </div>

              {/* Rendered HTML Document via Sandboxed Iframe */}
              <iframe
                title="Email Draft Preview"
                srcDoc={emailHtml}
                className="w-full h-[460px] border-0"
              />
            </div>
          ) : (
            <div className="relative">
              <pre className="p-4 rounded-lg bg-neutral-900 text-neutral-200 font-mono text-[11px] overflow-x-auto max-h-[460px] leading-relaxed border border-neutral-800 selection:bg-amber-500/30">
                {emailHtml}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            {copiedType === 'rich' ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Copied Styled Email! Open Gmail or Outlook and press Ctrl+V / Cmd+V to paste.</span>
              </span>
            ) : copiedType === 'html' ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Copied Raw HTML code to clipboard!</span>
              </span>
            ) : (
              <span>Tip: Click "Copy Styled Email" then paste directly into your email compose window.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyHtmlCode}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
              title="Copy raw HTML markup"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Copy HTML</span>
            </button>

            <button
              onClick={handleCopyRichText}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="Copy formatted rich text table directly into Outlook/Gmail compose window"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Styled Email</span>
            </button>

            <button
              onClick={handleOpenMailClient}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="Open default email application"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Mail App</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmailDraftModal;
