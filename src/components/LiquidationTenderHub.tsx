import React, { useState, useMemo } from 'react';
import { StockItem, RulesConfig, CurrencyCode, WhiteLabelProfile } from '../types';
import { formatCurrency, generateOwnerReport } from '../utils/calculations';
import { 
  Flame, 
  Send, 
  Printer, 
  Copy, 
  Check, 
  Gavel, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  Scale
} from 'lucide-react';

interface LiquidationTenderHubProps {
  items: StockItem[];
  rules: RulesConfig;
  currency: CurrencyCode;
  clientName?: string;
  whiteLabel?: WhiteLabelProfile;
  onUpdateItemStatus?: (itemId: string, statusText: string) => void;
}

export const LiquidationTenderHub: React.FC<LiquidationTenderHubProps> = ({
  items,
  rules,
  currency,
  clientName = 'Ambattur Fabrication Works',
  whiteLabel,
}) => {
  const summary = useMemo(() => generateOwnerReport(items, rules), [items, rules]);
  
  // Customization controls
  const [activeSubTab, setActiveSubTab] = useState<'buyback' | 'tender' | 'tracker'>('buyback');
  const [restockingFeePercent, setRestockingFeePercent] = useState(10); // 10% restocking discount to supplier
  const [vendorTargetName, setVendorTargetName] = useState('Primary Steel Mill & Distributor');
  const [inspectionDeadlineDays, setInspectionDeadlineDays] = useState(7);
  const [copiedType, setCopiedType] = useState<'buyback' | 'tender' | null>(null);

  // Status tracking state (persisted locally)
  const [itemRecoveryStatus, setItemRecoveryStatus] = useState<Record<string, 'Identified' | 'Letter Sent' | 'Agreed' | 'Recovered'>>(() => {
    try {
      const saved = localStorage.getItem('p1_liquidation_status_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleStatusChange = (itemId: string, newStatus: 'Identified' | 'Letter Sent' | 'Agreed' | 'Recovered') => {
    const updated = { ...itemRecoveryStatus, [itemId]: newStatus };
    setItemRecoveryStatus(updated);
    try {
      localStorage.setItem('p1_liquidation_status_map', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Isolate dead items (>180 days)
  const deadItems = useMemo(() => {
    return items.filter((i) => (i.daysIdle || 0) >= rules.deadThresholdDays);
  }, [items, rules.deadThresholdDays]);

  // Stream 1: Prime items suitable for vendor buyback
  const buybackItems = useMemo(() => {
    return deadItems.filter((i) => i.category === 'Raw Material' || i.category === 'Spares');
  }, [deadItems]);

  // Stream 2: Surplus items suitable for secondary market / scrap auction
  const scrapItems = useMemo(() => {
    return deadItems.filter((i) => i.category === 'Finished Goods' || i.category === 'Consumable');
  }, [deadItems]);

  const totalBuybackCost = buybackItems.reduce((acc, i) => acc + (i.closingValue || 0), 0);
  const totalOfferedBuybackValue = Math.round(totalBuybackCost * (1 - restockingFeePercent / 100));

  // Vendor Buyback Letter Formal Text
  const vendorBuybackLetterText = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const itemsTable = buybackItems.map((item, idx) => {
      const discountedRate = Math.round(item.costRate * (1 - restockingFeePercent / 100));
      const totalClaim = Math.round(item.qtyOnHand * discountedRate);
      return `${idx + 1}. SKU: ${item.itemCode} | ${item.itemName}
   Quantity: ${item.qtyOnHand} | Landed Rate: ₹${item.costRate} | Proposed Buyback Rate: ₹${discountedRate} (Less ${restockingFeePercent}%)
   Total Settlement Value: ₹${totalClaim.toLocaleString()} (Idle for ${item.daysIdle} days)`;
    }).join('\n\n');

    return `FORMAL REQUEST FOR SURPLUS INVENTORY BUYBACK / CREDIT SETTLEMENT
Date: ${todayStr}
To: Management / Commercial Head, ${vendorTargetName}
From: Commercial Directorate, ${clientName}
Reference: Strategic Materials Rationalization & Mutual Supply Optimization

Dear Sir / Madam,

This formal communication relates to prime standard material lots previously procured
from your esteemed organization, which have remained dormant in our project staging yards:

TOTAL PROPOSED CONSIGNMENT VALUE : ₹${totalOfferedBuybackValue.toLocaleString()} (Net of ${restockingFeePercent}% Restocking Consideration)
ORIGINAL INVOICE PURCHASE BASE   : ₹${totalBuybackCost.toLocaleString()}

SCHEDULE OF PRIME INVENTORY OFFERED FOR RETURN:
--------------------------------------------------------------------------------
${itemsTable}
--------------------------------------------------------------------------------

MUTUAL COMMERCIAL PROPOSAL:
1. RESTOCKING CONSIDERATION: We offer a structured ${restockingFeePercent}% restocking allowance on the original landed purchase rate to cover handling, freight, and inspection overheads.
2. SETTLEMENT MECHANISM: We welcome settlement via:
   (A) Immediate Credit Note adjusted against our upcoming project purchase orders; OR
   (B) Direct RTGS wire transfer within fourteen (14) business days of material receipt.
3. QUALITY INSPECTION: All materials remain in original prime mill condition with test certificates. Your quality engineer is invited to inspect the lots at our works within ${inspectionDeadlineDays} days.

We value our long-term supplier relationship and anticipate your affirmative response
to preserve mutual cash flow velocity.

Yours faithfully,
For ${clientName}

Authorized Signatory / Managing Director
Cc: Working Capital Auditor (${whiteLabel?.firmName || 'Apex Industrial Advisory'})`;
  }, [buybackItems, clientName, vendorTargetName, restockingFeePercent, inspectionDeadlineDays, totalBuybackCost, totalOfferedBuybackValue, whiteLabel]);

  // Sealed Bid Scrap / Secondary Market Tender Notice
  const scrapTenderNoticeText = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const tenderItems = scrapItems.length > 0 ? scrapItems : deadItems.slice(0, 5);
    const estScrapBase = Math.round(tenderItems.reduce((acc, i) => acc + (i.closingValue || 0), 0) * 0.40);

    return `NOTICE INVITING COMPETITIVE SEALED BIDS (SURPLUS INDUSTRIAL ASSETS)
Tender Ref No: TDR/${new Date().getFullYear()}/DEAD-STOCK-AUCTION-01
Issued by: ${clientName}
Issue Date: ${todayStr} | Bid Submission Window: ${inspectionDeadlineDays} Days

Sealed competitive quotes are invited from certified secondary metal merchants,
fabrication contractors, and registered recyclers for the outright purchase of surplus lots:

LOT SUMMARY FOR DISPOSAL:
--------------------------------------------------------------------------------
LOT 1: PRIME FABRICATION OFFCUTS & BEAMS     - Approx Value: ₹${estScrapBase.toLocaleString()} (Floor Reserve)
LOT 2: INDUSTRIAL VALVES & HARDWARE         - As-Is-Where-Is Basis
LOT 3: SURPLUS CONSUMABLE SPOOLS & ELECTRODES - Unopened Factory Packaging
--------------------------------------------------------------------------------

MANDATORY TENDER CONDITIONS:
1. INSPECTION: Material inspection allowed from 10:00 AM to 04:00 PM at factory gate.
2. PAYMENT: 100% advance payment via RTGS before vehicle loading or gate pass issuance.
3. WEIGHMENT: Certified weighment at authorized estate electronic weighbridge.
4. TAXATION: GST @ applicable scrap/hardware rates extra. Form E-way bill required.

Submit sealed envelope marked "TENDER BID: SURPLUS LOTS" to factory main office.

Commercial Directorate, ${clientName}
Facilitated by: ${whiteLabel?.firmName || 'Apex Working Capital Advisory'}`;
  }, [scrapItems, deadItems, clientName, inspectionDeadlineDays, whiteLabel]);

  const handleCopyBuyback = async () => {
    await navigator.clipboard.writeText(vendorBuybackLetterText);
    setCopiedType('buyback');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyTender = async () => {
    await navigator.clipboard.writeText(scrapTenderNoticeText);
    setCopiedType('tender');
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Recovered cash so far
  const totalCashActuallyRecovered = useMemo(() => {
    return deadItems.reduce((acc, item) => {
      const st = itemRecoveryStatus[item.id] || 'Identified';
      if (st === 'Recovered') {
        return acc + Math.round((item.closingValue || 0) * 0.85); // assume 85% recovered
      }
      return acc;
    }, 0);
  }, [deadItems, itemRecoveryStatus]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      {/* 1. Header & Concept */}
      <div className="p-4 rounded-xl glass-card glass-card-amber flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h1 className="text-base font-bold text-neutral-950 dark:text-neutral-50 tracking-tight">
              Surplus Liquidation &amp; Vendor Buyback Automation
            </h1>
            <span className="industrial-badge bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20">
              Execution Suite
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-3xl leading-relaxed font-mono">
            Automates the actual recovery of trapped cash: generate formal Vendor Buyback Requests with 10% restocking consideration and competitive Sealed-Bid Scrap Tenders.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right font-mono text-xs">
            <div className="text-neutral-500">Dead Pool Target:</div>
            <div className="font-bold text-rose-600 dark:text-rose-400 text-sm tabular-nums">₹{summary.deadCash.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800/80 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('buyback')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
            activeSubTab === 'buyback'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-200/60 dark:border-neutral-700/60'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Stream 1: Vendor Buyback Letter ({buybackItems.length} SKUs)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tender')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
            activeSubTab === 'tender'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-200/60 dark:border-neutral-700/60'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <Gavel className="w-3.5 h-3.5" />
          <span>Stream 2: Sealed-Bid Scrap Tender</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tracker')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
            activeSubTab === 'tracker'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-200/60 dark:border-neutral-700/60'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Stream 3: Execution Recovery Tracker</span>
        </button>
      </div>

      {/* 3. Sub-Tab 1: Vendor Buyback Generator */}
      {activeSubTab === 'buyback' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-semibold block text-neutral-700 dark:text-neutral-300 mb-1">
                Original Supplier / Mill Name:
              </label>
              <input
                type="text"
                value={vendorTargetName}
                onChange={(e) => setVendorTargetName(e.target.value)}
                className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold block text-neutral-700 dark:text-neutral-300 mb-1">
                Restocking Discount Offered to Supplier:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={restockingFeePercent}
                  onChange={(e) => setRestockingFeePercent(Number(e.target.value) || 0)}
                  className="w-24 p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono font-bold"
                />
                <span className="text-neutral-500 font-mono">% (Standard: 10%)</span>
              </div>
            </div>

            <div>
              <label className="font-semibold block text-neutral-700 dark:text-neutral-300 mb-1">
                Inspection Window Deadline:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={inspectionDeadlineDays}
                  onChange={(e) => setInspectionDeadlineDays(Number(e.target.value) || 0)}
                  className="w-24 p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 font-mono font-bold"
                />
                <span className="text-neutral-500 font-mono">Days</span>
              </div>
            </div>
          </div>

          {/* Letterhead Preview */}
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <span>Executive Vendor Buyback Letter (10% Restocking Incentive)</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Offers supplier an immediate credit settlement or RTGS return for prime raw materials.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyBuyback}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
                >
                  {copiedType === 'buyback' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
                  <span>{copiedType === 'buyback' ? 'Copied Letter' : 'Copy Text'}</span>
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(vendorBuybackLetterText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Vendor WhatsApp</span>
                </a>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Letterhead</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-lg bg-neutral-950 text-neutral-200 font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed border border-neutral-800 selection:bg-amber-500/30">
              {vendorBuybackLetterText}
            </pre>
          </div>
        </div>
      )}

      {/* 4. Sub-Tab 2: Sealed-Bid Scrap & Secondary Market Tender */}
      {activeSubTab === 'tender' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-amber-600" />
                  <span>Surplus Metal &amp; Hardware Sealed-Bid Tender Notice</span>
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Distribute to 3 local estate merchants to secure competitive bids for non-standard offcuts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyTender}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
                >
                  {copiedType === 'tender' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
                  <span>{copiedType === 'tender' ? 'Copied Tender' : 'Copy Notice'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Tender (Notice Board)</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-lg bg-neutral-950 text-neutral-200 font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed border border-neutral-800 selection:bg-amber-500/30">
              {scrapTenderNoticeText}
            </pre>
          </div>
        </div>
      )}

      {/* 5. Sub-Tab 3: Execution Recovery Milestone Tracker */}
      {activeSubTab === 'tracker' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Actual Bank Cash Recovered</div>
              <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                ₹{totalCashActuallyRecovered.toLocaleString()}
              </div>
            </div>
            <div className="text-xs text-neutral-500">
              Target Recovery: <strong>₹{Math.round(summary.deadCash * 0.5).toLocaleString()}</strong> (50% of Dead Pool)
            </div>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Item / SKU</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Days Idle</th>
                    <th className="py-2.5 px-3 text-right">Dead Value</th>
                    <th className="py-2.5 px-3">Liquidation Stream</th>
                    <th className="py-2.5 px-3 text-right">Milestone Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {deadItems.map((item) => {
                    const currentStatus = itemRecoveryStatus[item.id] || 'Identified';
                    const isPrime = item.category === 'Raw Material' || item.category === 'Spares';

                    return (
                      <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                        <td className="py-2.5 px-3 font-sans font-medium text-neutral-900 dark:text-neutral-100">
                          <div>{item.itemName}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{item.itemCode} · Qty: {item.qtyOnHand}</div>
                        </td>
                        <td className="py-2.5 px-3 text-neutral-500">{item.category}</td>
                        <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 font-bold">{item.daysIdle}d</td>
                        <td className="py-2.5 px-3 text-right font-bold text-neutral-900 dark:text-neutral-100">
                          ₹{(item.closingValue || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isPrime ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                          }`}>
                            {isPrime ? 'Supplier Buyback' : 'Scrap / Secondary Auction'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <select
                            value={currentStatus}
                            onChange={(e) => handleStatusChange(item.id, e.target.value as any)}
                            className={`p-1 rounded text-xs font-mono font-semibold border cursor-pointer focus:outline-none ${
                              currentStatus === 'Recovered'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-400'
                                : currentStatus === 'Agreed'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-400'
                                : currentStatus === 'Letter Sent'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-400'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
                            }`}
                          >
                            <option value="Identified">1. Identified</option>
                            <option value="Letter Sent">2. Letter Sent</option>
                            <option value="Agreed">3. Terms Agreed</option>
                            <option value="Recovered">4. Cash Recovered ✓</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiquidationTenderHub;
