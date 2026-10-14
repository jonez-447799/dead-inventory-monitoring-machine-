import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Video, 
  Headphones, 
  BookOpen, 
  CheckCircle2, 
  Sliders, 
  Download, 
  SkipForward, 
  SkipBack, 
  FastForward, 
  FileText, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  Flame,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { CurrencyCode } from '../types';

interface TutorialStudioProps {
  currency: CurrencyCode;
  onNavigateToStock: () => void;
  onOpenDrill: () => void;
  onPrintReport: () => void;
}

// ---------------- VIDEO SCENES DATA ----------------
export interface VideoScene {
  id: number;
  title: string;
  durationSec: number;
  description: string;
  narrationText: string;
  badge: string;
  visualType: 'problem' | 'yellow_columns' | 'white_formulas' | 'holding_burn' | 'the_drill' | 'tally_keys' | 'whatsapp_pitches' | 'aes_security' | 'auditor_persona' | 'redacted_teaser' | 'success_fee';
  tips: string[];
}

export const VIDEO_SCENES: VideoScene[] = [
  {
    id: 1,
    title: 'The ₹4.55 Lakh Problem: Idle Cash Trapped in Piles',
    durationSec: 16,
    badge: 'Overview',
    description: 'Understand how fabrication units tie up 20% to 35% of working capital in dormant materials.',
    narrationText: "Welcome to Project 1: The Dead Inventory & Idle Stock Cash Flow Engine. In manufacturing and fabrication units like our Ambattur Estate baseline, owners often discover between 20% to 35% of working capital trapped in dormant raw materials, off-cut plates, and unmoving finished goods. This application exposes exactly where cash is trapped, calculates the daily interest burn on your bank overdraft, and ranks items for immediate recovery.",
    visualType: 'problem',
    tips: [
      'Ambattur industrial fabrication unit sample included as active baseline.',
      'Dormant inventory ties up working capital and inflates bank overdraft limits.',
      'Goal: Convert dormant metal into liquid cash within 30 to 60 days.'
    ]
  },
  {
    id: 2,
    title: 'The 6 Yellow Input Columns: Type Only Here',
    durationSec: 18,
    badge: 'Data Entry',
    description: 'How to enter or import Item Code, Name, Category, Qty on Hand, Cost Rate, and Last Movement Date.',
    narrationText: "The core design rule of Project 1 is strict segregation. The table contains only 6 Yellow Input Columns where humans or Tally imports are allowed to type: Item Code, Item Name, Category, Physical Quantity on Hand, Unit Cost Rate in Rupees, and Last Movement Date. Never alter any white formula column. If an item has not moved, its last movement date determines its entire idle lifespan.",
    visualType: 'yellow_columns',
    tips: [
      'Yellow headers indicate manual or ERP-imported inputs.',
      'Only 6 columns ever require input: Code, Name, Category, Qty, Cost Rate, Last Movement.',
      'Compatible with CSV paste and Tally Daybook exports.'
    ]
  },
  {
    id: 3,
    title: 'The 8 White Formula Columns: Automated Cash Flow Math',
    durationSec: 20,
    badge: 'Formulas',
    description: 'Automated math: Closing Value, Days Idle, Status, Pareto Rank, Cumul %, ABC, and Action Recommendations.',
    narrationText: "All 8 white columns calculate automatically with industrial rigor. Closing Value multiplies Quantity by Unit Cost Rate. Days Idle measures the exact elapsed calendar days from the Last Movement Date to your measurement As-Of date. If Days Idle exceeds your cutoff threshold, the status turns to Rose Red Dead Stock. Then, the Pareto 80/20 algorithm sorts and assigns Category A, B, or C, and outputs a concrete recovery action.",
    visualType: 'white_formulas',
    tips: [
      'Closing Value = Qty On Hand × Cost Rate.',
      'Days Idle = As-Of Date minus Last Movement Date.',
      'Status = IF(DaysIdle >= DeadCutoff, "Dead", IF(DaysIdle >= SlowCutoff, "Slow", "Moving")).',
      'ABC Pareto = A (Top 80% Cash), B (Next 15%), C (Bottom 5%).'
    ]
  },
  {
    id: 4,
    title: 'Bank Overdraft (OD) Holding Burn: The Hidden Profit Killer',
    durationSec: 16,
    badge: 'Cash Flow',
    description: 'How holding 18% p.a. bank interest quietly drains thousands of rupees every single month.',
    narrationText: "Dead stock does not sit for free. When your company operates on a Bank Overdraft or Cash Credit facility at 18% annual interest, every 100,000 rupees of idle metal burns 18,000 rupees a year in pure interest, or 1,500 rupees per month. In our sample file, holding ₹4.55 Lakhs of dead inventory burns over ₹81,900 each year without creating a single rupee of value. Clearing dead stock directly reduces monthly interest payments to the bank.",
    visualType: 'holding_burn',
    tips: [
      'Default OD holding rate is 18.0% p.a. (customizable in Rules tab).',
      'Monthly burn = Dead Cash × (OD Rate / 12).',
      'Recovering dead cash directly repays the overdraft limit and saves hard interest.'
    ]
  },
  {
    id: 5,
    title: '"The Drill": Live Date Sensitivity Testing',
    durationSec: 18,
    badge: 'Interactive Tool',
    description: 'See instant recalculations by moving a 150NB SS Flange date from 2024 to today.',
    narrationText: "To prove how sensitive your cash flow metrics are, we built The Drill. In the top navigation bar, click The Drill. It focuses on SKU FG-FLG-150, a Stainless Steel Flange that has been idle for 608 days, locking up ₹46,250. Click Move to Today, and watch Days Idle collapse from 608 down to zero. The item turns from Rose Red Dead to Emerald Green Moving, immediately removing ₹46,250 from your dead cash tally and slashing your annual holding burn.",
    visualType: 'the_drill',
    tips: [
      'Accessible anytime via the "The Drill" button in the top header.',
      'Demonstrates real-time Pareto resort and holding burn reduction.',
      'Use this drill to train plant heads and store keepers.'
    ]
  },
  {
    id: 6,
    title: 'Tally ERP 9 & Prime Export Shortcuts',
    durationSec: 16,
    badge: 'ERP Integration',
    description: 'Export stock summaries directly from Tally using Alt+E, Ctrl+B, and Movement Analysis.',
    narrationText: "Extracting this data from Tally takes less than 2 minutes. Open Tally ERP 9 or Tally Prime. Navigate to Gateway of Tally, select Display More Reports, then Statements of Inventory, and choose Movement Analysis. Press Alt plus E to open Export, select Excel or CSV format, press Control plus B to show opening and closing balances, and export. You can then paste the data directly into the Stock Engine or use our REST endpoint.",
    visualType: 'tally_keys',
    tips: [
      'Gateway of Tally → Display → Statements of Inventory → Movement Analysis.',
      'Shortcut: Alt+E for Export, select Excel / CSV format.',
      'Press Ctrl+B to display closing values and last movement dates.'
    ]
  },
  {
    id: 7,
    title: 'WhatsApp Supplier & Scrap Recovery Pitches',
    durationSec: 16,
    badge: 'Liquidation',
    description: '1-click WhatsApp messages tailored for OEM returns, vendor buybacks, and scrap auctions.',
    narrationText: "Identifying dead stock is useless without recovery action. In the Words and Tally tab, we provided pre-drafted WhatsApp pitch templates customized for fabrication owners. You have three battle-tested strategies: The OEM Return Pitch to return unused flanges for a 10% restocking fee, the Tier-1 Vendor Barter to trade idle plates for active stock, and the Scrap Dealer Auction to liquidate dead metal at market spot rates today.",
    visualType: 'whatsapp_pitches',
    tips: [
      'Pre-written negotiation scripts ready for instant WhatsApp sending.',
      'Strategy 1: OEM Return with 10-15% restocking fee discount.',
      'Strategy 2: Barter swap for fast-moving consumables.',
      'Strategy 3: Cash scrap auction for immediate liquidity.'
    ]
  },
  {
    id: 8,
    title: 'AES-256 Vault, GDPR Privacy & Session Lock',
    durationSec: 18,
    badge: 'High Security',
    description: 'Hardware Web Crypto API encryption, 15-minute auto-lock, and 1-click SKU pseudonymization.',
    narrationText: "Your manufacturing cost rates and supplier margins are sensitive proprietary assets. Project 1 protects them with a military-grade Web Crypto API vault using AES-256-GCM encryption and PBKDF2 with 100,000 rounds. Unattended workstations auto-lock after 15 minutes of inactivity. When presenting inventory audits to external bankers or buyers, activate the GDPR Privacy Shield to pseudonymize SKUs into anonymous codes, preventing trade secret leaks.",
    visualType: 'aes_security',
    tips: [
      'Browser-native Web Crypto API AES-GCM-256 client-side encryption.',
      '15-minute inactivity watchdog auto-locks unattended factory PCs.',
      'GDPR Privacy Shield masks part codes to ANON-SKU-*** in 1 click.',
      'Default Master PIN: 2026.'
    ]
  },
  {
    id: 9,
    title: 'Your Persona: The Industrial Working Capital Auditor',
    durationSec: 20,
    badge: 'Persona Blueprint',
    description: 'How to introduce yourself as a forensic balance sheet doctor rather than an IT guy or freelancer.',
    narrationText: "Never introduce yourself as a software developer, IT consultant, or programmer. Factory owners dismiss IT people, but they write large checks to senior financial and operational authorities. Introduce yourself as an Industrial Working Capital and Inventory Auditor. You are a forensic doctor for their balance sheet. Your mission is to uncover trapped cash leaking in dormant raw materials, prevent bank loan penalties, and unlock instant liquidity.",
    visualType: 'auditor_persona',
    tips: [
      'Official Title: Industrial Working Capital & Inventory Auditor.',
      'Never say: "I built an app." Say: "I run a forensic working capital audit."',
      'Dress Code: Business-casual (collared shirt, dark trousers, formal shoes).',
      'The Psychological Frame: You are recovering money the factory already earned.'
    ]
  },
  {
    id: 10,
    title: 'The 48-Hour Free Diagnostic: Hooking the Managing Director',
    durationSec: 18,
    badge: 'Client Pitch',
    description: 'The zero-risk outreach pitch that gets factory owners to hand over their Tally stock ledger without hesitation.',
    narrationText: "When reaching out to a factory Managing Director, use the zero-risk hook. Say: 'Mr. Owner, we run a 48-hour working capital diagnostic for mid-sized manufacturers. Send us your stock movement ledger from Tally. If we do not uncover at least ₹1 Lakh of trapped cash that can be recovered within 30 days, you owe us nothing. If we do, we will show you exactly where it is.' No business owner refuses this offer.",
    visualType: 'whatsapp_pitches',
    tips: [
      'The Offer: 48-Hour Diagnostic Scan with zero upfront risk.',
      'Data Requested: Tally Movement Analysis export (Alt+E) or Excel stock summary.',
      'Guarantee: If we do not find trapped money, you pay zero.'
    ]
  },
  {
    id: 11,
    title: 'The Redacted Teaser: Proving Cash Leaks Without Giving Away the List',
    durationSec: 20,
    badge: 'The Secret Weapon',
    description: 'Using the watermarked teaser to prove you found their money while ensuring they must pay to get the fix.',
    narrationText: "Once you paste their data into the Stock Engine, jump to the Monetization tab and click Copy Teaser. This generates a 1-page report with the top dead items partially redacted, showing 'SKU-REDACTED-1' and 'SS-FLG-***' with the exact rupees trapped and days idle. When the owner sees this, he knows you found his cash leaks, but he cannot fix it alone. He has to sign your engagement letter to get the unredacted recovery schedule.",
    visualType: 'redacted_teaser',
    tips: [
      'Found in Monetization tab: Click "Copy Teaser for WhatsApp/Email".',
      'Shows total dead rupees (e.g. ₹3.8 Lakhs) and idle days (232d).',
      'Masks part codes so storekeepers cannot bypass you.',
      'Creates an irresistible urge to sign your engagement letter.'
    ]
  },
  {
    id: 12,
    title: 'The 15% Success Fee: How to Collect Your Big Check',
    durationSec: 20,
    badge: 'Closing & Cash',
    description: 'How to structure your agreement: fixed diagnostic retainer + 15% contingency fee on unlocked cash.',
    narrationText: "The fastest way to earn high income is value pricing. Charge an upfront audit fee of ₹25,000 to ₹50,000 to cover your time. Then, charge a 15% contingency success fee on all verified cash recovered through supplier buyback credit notes and scrap auction tenders. When ₹3 Lakhs of idle materials are returned or sold, you collect ₹45,000 pure profit. That is how a single factory audit yields ₹70,000 to ₹1 Lakh in cash.",
    visualType: 'success_fee',
    tips: [
      'Fee Structure: ₹25,000 Fixed Retainer + 15% Contingency on cash unlocked.',
      'Billed when supplier issues credit note or scrap buyer pays cash.',
      'Upsell: ₹30,000/month recurring retainer to audit monthly bank Form A statements.'
    ]
  }
];

// ---------------- A TO Z GLOSSARY NARRATION DATA ----------------
export interface AtoZItem {
  letter: string;
  term: string;
  category: 'Metric' | 'Concept' | 'Formula' | 'Security' | 'Integration';
  audioNarration: string;
  definition: string;
  formulaOrShortcut?: string;
}

export const ATOZ_GLOSSARY: AtoZItem[] = [
  {
    letter: 'A',
    term: 'Ambattur Industrial Baseline',
    category: 'Concept',
    audioNarration: 'Letter A stands for Ambattur Industrial Baseline. Our built-in practice data represents an authentic 15-SKU fabrication unit located in the Ambattur Industrial Estate of Chennai. It contains real-world stainless steel flanges, MS structural plates, aluminium channels, and welding consumables with actual Indian Rupees cost rates.',
    definition: 'Pre-loaded 15-SKU industrial fabrication dataset reflecting real-world raw materials, WIP, and finished items.',
    formulaOrShortcut: 'Baseline: ₹15.86L Total Stock, ₹4.55L Dead Stock'
  },
  {
    letter: 'B',
    term: 'Bank Overdraft (OD) Burn',
    category: 'Metric',
    audioNarration: 'Letter B is Bank Overdraft Holding Burn. Manufacturing businesses rely on bank credit lines charging between 12% to 18% annual interest. Every rupee trapped in idle inventory directly inflates your OD balance. The annual burn formula is Dead Cash multiplied by your Holding Cost percentage.',
    definition: 'The silent cash outflow paid to the bank every month because working capital is tied up in dead stock.',
    formulaOrShortcut: '= DeadValue × HoldingCostPercent (Default 18% p.a.)'
  },
  {
    letter: 'C',
    term: 'Closing Value Formula',
    category: 'Formula',
    audioNarration: 'Letter C is Closing Value. This is the first automated white column in the Stock Engine. It calculates the exact monetary value locked in each SKU by multiplying physical quantity on hand by the unit cost rate. Never type here; the engine computes this in real time.',
    definition: 'Total monetary investment trapped inside a specific SKU item based on current verified physical inventory.',
    formulaOrShortcut: '= QtyOnHand × CostRate'
  },
  {
    letter: 'D',
    term: 'Dead Stock Cutoff (180+ Days)',
    category: 'Concept',
    audioNarration: 'Letter D is Dead Stock Cutoff. By factory convention, any item with zero dispatches or issues for 180 consecutive days or more is classified as Dead. Dead items are highlighted with a rose red badge and an immediate cash liquidation recommendation.',
    definition: 'Inventory with no movement or factory consumption for 180 or more elapsed calendar days.',
    formulaOrShortcut: 'Threshold: DaysIdle ≥ 180 days (Configurable in Rules)'
  },
  {
    letter: 'E',
    term: 'Excel & Tally Keyboard Shortcuts',
    category: 'Integration',
    audioNarration: 'Letter E is Excel and Tally Keyboard Shortcuts. To integrate your day-to-day accounts without double entry, press Alt plus E in Tally to export Daybook and Movement Analysis into Excel or CSV. You can then paste the raw numbers straight into the 6 yellow columns.',
    definition: 'Standard accounting hotkeys in Tally ERP 9 and Prime to extract item-wise movement summaries.',
    formulaOrShortcut: 'Alt+E (Export) · Ctrl+B (Basis of Values) · Alt+F1 (Detailed)'
  },
  {
    letter: 'F',
    term: 'Fast-Moving (Moving) Status',
    category: 'Concept',
    audioNarration: 'Letter F is Fast-Moving Inventory. Items that have been consumed or dispatched within the last 90 days are marked as Emerald Green Moving. These are healthy working capital assets that turn into receivables quickly.',
    definition: 'Healthy active inventory that has moved within the recent 90-day manufacturing cycle.',
    formulaOrShortcut: 'Condition: DaysIdle < 90 days'
  },
  {
    letter: 'G',
    term: 'GDPR Commercial Privacy Shield',
    category: 'Security',
    audioNarration: 'Letter G is the GDPR Commercial Privacy Shield. In manufacturing, showing your raw part numbers and metal grades to external auditors or bankers could leak trade secrets. Toggling Privacy Mode replaces codes with ANON-SKU-001 and masks metal grades while preserving all financial totals.',
    definition: 'Article 32 & 25 compliant data pseudonymization that masks proprietary SKU names during third-party audits.',
    formulaOrShortcut: 'ANON-SKU-*** Pseudonymization Active'
  },
  {
    letter: 'H',
    term: 'Holding Cost Percentage',
    category: 'Metric',
    audioNarration: 'Letter H is Holding Cost Percentage. In our Rules sheet, the default holding rate is 18% per year. This accounts for 12% bank overdraft interest plus 6% for factory warehouse storage, material handling, rust deterioration, and insurance.',
    definition: 'The comprehensive annual cost of carrying inventory, including bank debt interest, storage, scrap risk, and insurance.',
    formulaOrShortcut: 'Default: 18.0% p.a. (Adjustable from 5% to 35%)'
  },
  {
    letter: 'I',
    term: 'Idle Days Calculation',
    category: 'Formula',
    audioNarration: 'Letter I is Idle Days Calculation. This is the calendar age of stock stagnation. The formula subtracts the SKU last movement date from the factory reference as-of date. If last movement was February 1, 2024 and today is October 1, 2026, Days Idle is 608 days.',
    definition: 'Number of consecutive calendar days since the material was last issued to a job order or sold.',
    formulaOrShortcut: '= AsOfDate - LastMovementDate'
  },
  {
    letter: 'J',
    term: 'Just-In-Time (JIT) Buffer Rules',
    category: 'Concept',
    audioNarration: 'Letter J is Just-In-Time Buffer Rules. Once dead stock is identified, the owner report recommends lowering minimum reorder points on Class A dead items to zero, switching them to make-to-order rather than buying ahead.',
    definition: 'Preventative reordering policy that eliminates forward bulk purchasing on slow-turning metal profiles.',
    formulaOrShortcut: 'Recommendation: Set Reorder Level = 0 for Dead A/B SKUs'
  },
  {
    letter: 'K',
    term: 'Key Sparkline Trend (D3 SVG)',
    category: 'Metric',
    audioNarration: 'Letter K is Key Sparkline Trend powered by D3. Next to every SKU in the table, our custom D3 component calculates 12 monthly movement frequency bins and draws a smooth cubic spline SVG curve showing whether consumption is steady or flatlining.',
    definition: 'D3.js mathematical visualization charting 12-month transaction issue frequency next to each item row.',
    formulaOrShortcut: 'D3 scaleLinear + curveMonotoneX SVG Path'
  },
  {
    letter: 'L',
    term: 'Lock Screen & Auto-Watchdog',
    category: 'Security',
    audioNarration: 'Letter L is Lock Screen and Inactivity Watchdog. If a factory supervisor or accountant steps away from their desk for 15 minutes, the application automatically locks the screen with AES-256 protection. You can also click the Lock icon in the header at any time.',
    definition: 'Automated 15-minute inactivity barrier and 1-click manual lock to prevent unauthorized shopfloor tampering.',
    formulaOrShortcut: 'Auto-lock: 15min idle · Master PIN: 2026'
  },
  {
    letter: 'M',
    term: 'Multi-Factor Auth & Role Permissions',
    category: 'Security',
    audioNarration: 'Letter M is Multi-Factor Authentication and Role-Based Access Control. The system provides 5 operational roles: Owner with full governance, Plant Head for shop floor thresholds, Accounts for stock rates, Auditor for read and export, and Read Only.',
    definition: 'Segregation of duties enforcing strict permissions between manufacturing heads and accounting teams.',
    formulaOrShortcut: 'Roles: Owner · Plant Head · Accounts · Auditor · Read Only'
  },
  {
    letter: 'N',
    term: 'Negotiation Scripts for WhatsApp',
    category: 'Integration',
    audioNarration: 'Letter N is Negotiation Scripts. Found in the Words and Tally tab, these are pre-written WhatsApp messages ready to send to suppliers, scrap dealers, or sister factories to negotiate buybacks, discounts, or steel scrap auctions.',
    definition: 'One-click WhatsApp templates customized for returning idle items to OEMs or auctioning off scrap.',
    formulaOrShortcut: 'Click-to-Chat with pre-populated SKU details and offer prices'
  },
  {
    letter: 'O',
    term: 'Owner 1-Page Printable Report',
    category: 'Metric',
    audioNarration: 'Letter O is the Owner 1-Page Printable Report. Click the Print button in the header or Owner Report tab to generate a high-contrast executive summary formatted for A4 printing, displaying total dead cash, bank burn, and the top 5 dead items for Monday meetings.',
    definition: 'Zero-clutter executive deliverable designed specifically for factory owners and bank credit managers.',
    formulaOrShortcut: 'Keyboard: Ctrl+P or Header "Print 1-Pager" CTA'
  },
  {
    letter: 'P',
    term: 'Pareto ABC Classification',
    category: 'Formula',
    audioNarration: 'Letter P is Pareto ABC Classification. In inventory management, 80% of your total dead cash is typically trapped in just 20% of your SKUs. The engine sorts items by closing value descending, calculates cumulative percentage, and flags Class A for immediate owner focus.',
    definition: 'The 80-15-5 cumulative value stratification categorizing inventory by financial significance.',
    formulaOrShortcut: 'Class A: ≤80% · Class B: 80%-95% · Class C: >95%'
  },
  {
    letter: 'Q',
    term: 'Quantity On Hand Verifications',
    category: 'Concept',
    audioNarration: 'Letter Q is Quantity On Hand. This is Yellow Column 4. It must reflect actual physical stock verified by tape measure, weigh scale, or bin card count, rather than theoretical numbers that might be skewed by unrecorded offcuts.',
    definition: 'The true physical unit count present on factory racks, scrap bins, or raw material yards.',
    formulaOrShortcut: 'Physical Audit Rule: Inspect before quarterly financials'
  },
  {
    letter: 'R',
    term: 'Rules & Cutoff Customization',
    category: 'Concept',
    audioNarration: 'Letter R is Rules & Cutoff Configuration. In the Rules tab, you can customize the As-Of measurement date, the Dead Threshold Days, the Slow Threshold Days, the Annual Holding Cost percentage, and the Target Cash Release percentage.',
    definition: 'Central governance sheet controlling all algorithmic decision cutoffs and bank interest multipliers.',
    formulaOrShortcut: 'Dead: 180d · Slow: 90d · Holding: 18% · Target: 40%'
  },
  {
    letter: 'S',
    term: 'Security Vault (AES-256-GCM)',
    category: 'Security',
    audioNarration: 'Letter S is the Web Crypto Security Vault. All local inventory records and financial metrics are encrypted using browser-native AES-256-GCM with 12-byte random initialization vectors and PBKDF2 key derivation using 100,000 rounds of SHA-256.',
    definition: 'Hardware-accelerated cryptographic protection ensuring financial data is safe from local browser snooping.',
    formulaOrShortcut: 'Web Crypto API · AES-GCM (256-bit) · SHA-256 HMAC'
  },
  {
    letter: 'T',
    term: '"The Drill" Sensitivity Simulation',
    category: 'Concept',
    audioNarration: 'Letter T is The Drill. This is the interactive test bench in the top navigation. It isolates Stainless Steel Flange 150NB and lets you change its movement date from 2024 to today with one click, proving how rapidly dead cash numbers update.',
    definition: 'Single-click sensitivity simulator showing how moving one single dormant SKU changes overall cash health.',
    formulaOrShortcut: 'Header CTA: "The Drill" · SKU FG-FLG-150'
  },
  {
    letter: 'U',
    term: 'Unit Cost Rate Validation',
    category: 'Formula',
    audioNarration: 'Letter U is Unit Cost Rate. This is Yellow Column 5. Enter the true landed purchase cost per unit in Indian Rupees, including freight and non-creditable GST. The engine uses this rate to calculate both Closing Value and Dead Value.',
    definition: 'Landed unit purchase rate per unit of measurement (Kg, Nos, Meters, Liters).',
    formulaOrShortcut: 'Input in Yellow Cell: ₹ / Unit'
  },
  {
    letter: 'V',
    term: 'Vendor Scrap Liquidation Matrix',
    category: 'Concept',
    audioNarration: 'Letter V is Vendor Scrap Liquidation Matrix. When materials sit idle past 365 days, holding burn exceeds 18% of their value. The engine recommends immediate cash liquidation at 35% to 50% discount to stop ongoing interest bleed.',
    definition: 'Strategic pricing rules for discounting dormant metal to recover immediate liquidity.',
    formulaOrShortcut: 'Discount Guidance: Class C Dead → Liquidate at Scrap Value'
  },
  {
    letter: 'W',
    term: 'Words & Tally Bilingual Glossary',
    category: 'Integration',
    audioNarration: 'Letter W is Words & Tally Glossary. In the Words tab, we provide clear explanations for shopfloor terminology in both English and Tamil idioms used in industrial estates, bridging the gap between shop supervisors and chartered accountants.',
    definition: 'Industrial lexicon bridging accountant terminology with factory floor vernacular and Tally menus.',
    formulaOrShortcut: 'Tab: "Words & Tally" · English + Tamil Factory Vernacular'
  },
  {
    letter: 'X',
    term: 'XML & JSON REST Sync Connectors',
    category: 'Integration',
    audioNarration: 'Letter X is XML & JSON REST Sync Connectors. In the Security & API Hub, you can copy cURL commands and JSON schemas to push stock summaries directly from custom ERP software or automated Tally TDL daybook scripts.',
    definition: 'Standard REST endpoints and cURL recipes for automated daily ERP stock data push.',
    formulaOrShortcut: 'POST /api/v1/tally/sync-export'
  },
  {
    letter: 'Y',
    term: 'Yellow Input Columns (Rule of 6)',
    category: 'Concept',
    audioNarration: 'Letter Y is Yellow Input Columns, also known as the Rule of 6. Only the 6 yellow columns accept human typing. If anyone edits any other column, formulas can break. Always remember: Type only in yellow; read results in white.',
    definition: 'The fundamental UI rule: Human data entry is restricted strictly to the 6 yellow-tinted columns.',
    formulaOrShortcut: 'Columns 1 to 6 (Yellow) = Input · Columns 7 to 14 (White) = Math'
  },
  {
    letter: 'Z',
    term: 'Zero-Knowledge Data Shredder',
    category: 'Security',
    audioNarration: 'Letter Z is Zero-Knowledge Data Shredder. If an employee resigns or a laptop is decommissioned, click the Emergency Data Shredder button in the lock screen or Security tab. It overwrites stored buffers with cryptographic noise before deleting.',
    definition: 'Cryptographic wiping protocol that destroys local data buffers with random byte noise before unlinking.',
    formulaOrShortcut: 'Action: Overwrite with crypto.getRandomValues + removeItem'
  }
];

export const TutorialStudio: React.FC<TutorialStudioProps> = ({
  currency,
  onNavigateToStock,
  onOpenDrill,
  onPrintReport,
}) => {
  // Main view mode: 'video' | 'audio' | 'quickstart'
  const [activeMode, setActiveMode] = useState<'video' | 'audio' | 'quickstart'>('video');

  // ---------- VIDEO SIMULATOR STATE ----------
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);
  const [videoProgressSec, setVideoProgressSec] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const currentScene = VIDEO_SCENES[currentSceneIdx];

  // ---------- AUDIO GUIDE (A TO Z) STATE ----------
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentSpeakingTerm, setCurrentSpeakingTerm] = useState<string | null>(null);

  // Audio Equalizer Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load browser SpeechSynthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0 && !selectedVoice) {
          const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David')));
          setSelectedVoice(naturalVoice ? naturalVoice.name : voices[0].name);
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // ---------- VIDEO PLAYBACK CLOCK & VOICE SYNC ----------
  useEffect(() => {
    let interval: any = null;
    if (isPlayingVideo) {
      interval = setInterval(() => {
        setVideoProgressSec((prev) => {
          const next = prev + 0.25 * playbackSpeed;
          if (next >= currentScene.durationSec) {
            // Next scene
            if (currentSceneIdx < VIDEO_SCENES.length - 1) {
              setCurrentSceneIdx(currentSceneIdx + 1);
              return 0;
            } else {
              setIsPlayingVideo(false);
              return 0;
            }
          }
          return next;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlayingVideo, currentSceneIdx, playbackSpeed, currentScene.durationSec]);

  // Video Voice Narration on scene change
  useEffect(() => {
    if (isPlayingVideo && !isVideoMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentScene.narrationText);
      utterance.rate = playbackSpeed;
      if (selectedVoice) {
        const v = availableVoices.find(voice => voice.name === selectedVoice);
        if (v) utterance.voice = v;
      }
      utterance.onend = () => {
        // speech finished
      };
      window.speechSynthesis.speak(utterance);
    } else if (!isPlayingVideo || isVideoMuted) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [currentSceneIdx, isPlayingVideo, isVideoMuted, playbackSpeed, selectedVoice]);

  // ---------- AUDIO GUIDE NARRATION CONTROLLER ----------
  const selectedAtoZItem = useMemo(() => {
    return ATOZ_GLOSSARY.find(item => item.letter === selectedLetter) || ATOZ_GLOSSARY[0];
  }, [selectedLetter]);

  const handlePlayAudio = (item: AtoZItem) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    if (isPlayingAudio && currentSpeakingTerm === item.term) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setCurrentSpeakingTerm(null);
      return;
    }

    window.speechSynthesis.cancel();
    const fullSpeech = `${item.term}. Category: ${item.category}. ${item.audioNarration} Formula or guideline: ${item.formulaOrShortcut || 'Standard factory protocol.'}`;
    const utterance = new SpeechSynthesisUtterance(fullSpeech);
    utterance.rate = audioSpeed;
    if (selectedVoice) {
      const v = availableVoices.find(voice => voice.name === selectedVoice);
      if (v) utterance.voice = v;
    }

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setCurrentSpeakingTerm(item.term);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setCurrentSpeakingTerm(null);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setCurrentSpeakingTerm(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setCurrentSpeakingTerm(null);
  };

  // Play next letter automatically in Audio mode
  const handlePlayAllAtoZ = () => {
    let index = ATOZ_GLOSSARY.findIndex(item => item.letter === selectedLetter);
    if (index === -1) index = 0;
    const playItem = (idx: number) => {
      if (idx >= ATOZ_GLOSSARY.length) {
        setIsPlayingAudio(false);
        setCurrentSpeakingTerm(null);
        return;
      }
      const item = ATOZ_GLOSSARY[idx];
      setSelectedLetter(item.letter);
      const fullSpeech = `${item.letter}. ${item.term}. ${item.audioNarration}`;
      const utterance = new SpeechSynthesisUtterance(fullSpeech);
      utterance.rate = audioSpeed;
      if (selectedVoice) {
        const v = availableVoices.find(voice => voice.name === selectedVoice);
        if (v) utterance.voice = v;
      }
      utterance.onstart = () => {
        setIsPlayingAudio(true);
        setCurrentSpeakingTerm(item.term);
      };
      utterance.onend = () => {
        playItem(idx + 1);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setCurrentSpeakingTerm(null);
      };
      window.speechSynthesis.speak(utterance);
    };
    window.speechSynthesis.cancel();
    playItem(index);
  };

  // Canvas Waveform Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 36;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const isSpeaking = isPlayingAudio || isPlayingVideo;
        const amplitude = isSpeaking
          ? Math.sin(phase + i * 0.35) * 16 + Math.cos(phase * 1.5 + i * 0.2) * 8 + 18
          : 3;
        const height = Math.max(3, Math.min(canvas.height - 4, amplitude));
        const y = (canvas.height - height) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + height);
        if (isSpeaking) {
          grad.addColorStop(0, '#f59e0b'); // amber-500
          grad.addColorStop(1, '#10b981'); // emerald-500
        } else {
          grad.addColorStop(0, '#525252');
          grad.addColorStop(1, '#262626');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(i * barWidth + 1, y, barWidth - 2, height);
      }

      phase += 0.15;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlayingAudio, isPlayingVideo]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Download full transcript
  const handleDownloadTranscript = () => {
    const header = `# Project 1: Dead Inventory & Idle Stock Cash Flow Engine\n## Complete Training Masterclass & A-to-Z Audio Transcript\nExported: ${new Date().toLocaleString()}\n\n---\n\n`;
    const videoSection = `### PART 1: VIDEO MASTERCLASS (8 SCENES)\n\n` + VIDEO_SCENES.map(s => `#### Scene ${s.id}: ${s.title} (${s.badge})\n${s.narrationText}\nKey Tips:\n${s.tips.map(t => `- ${t}`).join('\n')}\n`).join('\n\n');
    const atozSection = `\n\n---\n\n### PART 2: A TO Z FACTORY AUDIT GLOSSARY\n\n` + ATOZ_GLOSSARY.map(g => `#### [${g.letter}] ${g.term} (${g.category})\n${g.definition}\nFormula / Key: ${g.formulaOrShortcut || 'N/A'}\nNarration: "${g.audioNarration}"\n`).join('\n');
    
    const blob = new Blob([header + videoSection + atozSection], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Project1_Complete_Training_Audio_Video_Guide_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Training Academy &amp; Audio-Visual Studio
            </h1>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Interactive Video Simulator, A-to-Z Audio Masterclass, and Step-by-Step Operator Playbooks.
          </p>
        </div>

        {/* Primary View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800/80 rounded-lg text-xs font-semibold">
          <button
            onClick={() => {
              setActiveMode('video');
              handleStopAudio();
            }}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeMode === 'video'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs border border-neutral-200/80 dark:border-neutral-700/60'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-amber-500" />
            <span>Video Walkthrough</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('audio');
              setIsPlayingVideo(false);
            }}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeMode === 'audio'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-emerald-500" />
            <span>A to Z Audio Guide</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('quickstart');
              setIsPlayingVideo(false);
              handleStopAudio();
            }}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeMode === 'quickstart'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-500" />
            <span>3-Step Quickstart</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: VIDEO MASTERCLASS (SIMULATOR WALKTHROUGH)              */}
      {/* ============================================================== */}
      {activeMode === 'video' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Simulator Display (Left / Top 8 cols) */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              {/* The Mock Screen Viewport */}
              <div className="relative aspect-video w-full rounded-xl bg-neutral-950 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col justify-between text-neutral-100">
                {/* Simulated App Title Bar */}
                <div className="h-8 bg-neutral-900/90 border-b border-neutral-800 px-3 flex items-center justify-between text-xs font-mono text-neutral-400 select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="ml-2 text-[11px] text-neutral-300 font-sans">
                      Scene {currentScene.id} of {VIDEO_SCENES.length}: {currentScene.title}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-amber-400 font-bold">
                    {currentScene.badge}
                  </span>
                </div>

                {/* Animated Graphic Content according to Scene visualType */}
                <div className="flex-1 p-6 flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-neutral-900/40 via-neutral-950 to-neutral-950">
                  {/* Subtle Grid Background */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                  {/* Scene 1: Problem Overview */}
                  {currentScene.visualType === 'problem' && (
                    <div className="text-center space-y-4 max-w-md animate-fadeIn">
                      <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                        <Flame className="w-12 h-12 animate-pulse" />
                      </div>
                      <div className="text-3xl font-extrabold text-white font-mono">
                        ₹4,55,500 <span className="text-sm font-sans font-normal text-rose-400">Dead Cash</span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        Ambattur Fabrication Unit Practice File: <strong className="text-amber-400">28.7%</strong> of active inventory value is locked in zero-movement piles burning bank OD interest every night.
                      </p>
                    </div>
                  )}

                  {/* Scene 2: Yellow Columns */}
                  {currentScene.visualType === 'yellow_columns' && (
                    <div className="w-full max-w-lg space-y-3 font-mono text-xs">
                      <div className="text-center text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
                        Yellow Columns: Type Only in These 6 Cells
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200 text-center font-bold">
                          1. Item Code
                        </div>
                        <div className="p-2.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200 text-center font-bold">
                          2. Item Name
                        </div>
                        <div className="p-2.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200 text-center font-bold">
                          3. Category
                        </div>
                        <div className="p-2.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200 text-center font-bold">
                          4. Qty On Hand
                        </div>
                        <div className="p-2.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200 text-center font-bold">
                          5. Cost Rate (₹)
                        </div>
                        <div className="p-2.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200 text-center font-bold">
                          6. Last Movement
                        </div>
                      </div>
                      <div className="text-center text-[11px] text-neutral-400 font-sans mt-3">
                        Never alter any white cell; formulas derive all status and rankings automatically.
                      </div>
                    </div>
                  )}

                  {/* Scene 3: White Formulas */}
                  {currentScene.visualType === 'white_formulas' && (
                    <div className="w-full max-w-lg space-y-2.5 font-mono text-xs">
                      <div className="text-center text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                        The 8 Automated White Formulas
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded bg-neutral-900 border border-neutral-700 text-neutral-200">
                          <span className="text-neutral-400">Closing Value:</span> = Qty × Cost Rate
                        </div>
                        <div className="p-2 rounded bg-neutral-900 border border-neutral-700 text-neutral-200">
                          <span className="text-neutral-400">Days Idle:</span> = As-Of - LastMovement
                        </div>
                        <div className="p-2 rounded bg-neutral-900 border border-neutral-700 text-neutral-200">
                          <span className="text-neutral-400">Status:</span> = IF(Idle≥180, "Dead")
                        </div>
                        <div className="p-2 rounded bg-neutral-900 border border-neutral-700 text-neutral-200">
                          <span className="text-neutral-400">ABC Pareto:</span> Top 80% = Class A
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scene 4: Holding Burn */}
                  {currentScene.visualType === 'holding_burn' && (
                    <div className="text-center space-y-3 max-w-md">
                      <div className="inline-block px-3 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-800 font-mono text-xs font-bold">
                        Annual Bank OD Interest Rate: 18.0% p.a.
                      </div>
                      <div className="text-2xl font-bold font-mono text-amber-400">
                        ₹81,990 / year <span className="text-neutral-400 text-sm font-sans font-normal">Holding Burn</span>
                      </div>
                      <div className="text-xs font-mono text-neutral-400">
                        ₹6,833 cash paid to the bank every 30 days on dead materials
                      </div>
                    </div>
                  )}

                  {/* Scene 5: The Drill */}
                  {currentScene.visualType === 'the_drill' && (
                    <div className="w-full max-w-md p-4 rounded-xl bg-neutral-900 border border-amber-500/40 text-left space-y-2.5 font-mono text-xs">
                      <div className="flex items-center justify-between text-amber-400 font-bold">
                        <span>SKU: FG-FLG-150 (SS Flange 150NB)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20">The Drill</span>
                      </div>
                      <div className="flex items-center justify-between text-neutral-300">
                        <span>Before: 2024-02-01 (608d Idle)</span>
                        <span className="text-rose-400 font-bold">Status: DEAD (₹46,250)</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-400 pt-1 border-t border-neutral-800">
                        <span>After: 2026-10-01 (0d Idle)</span>
                        <span className="text-emerald-400 font-bold">Status: MOVING (₹0 Dead)</span>
                      </div>
                    </div>
                  )}

                  {/* Scene 6: Tally Keys */}
                  {currentScene.visualType === 'tally_keys' && (
                    <div className="w-full max-w-md space-y-2 font-mono text-xs text-left">
                      <div className="text-sky-400 font-bold uppercase text-[11px] text-center mb-1">
                        Tally ERP 9 / Prime Export Route
                      </div>
                      <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                        <span>Gateway → Display More Reports</span>
                        <span className="text-sky-400 font-bold">D</span>
                      </div>
                      <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                        <span>Statements of Inventory → Movement Analysis</span>
                        <span className="text-sky-400 font-bold">I → M</span>
                      </div>
                      <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                        <span>Export to Excel / CSV</span>
                        <span className="text-amber-400 font-bold">Alt + E</span>
                      </div>
                    </div>
                  )}

                  {/* Scene 7: WhatsApp Pitches */}
                  {currentScene.visualType === 'whatsapp_pitches' && (
                    <div className="w-full max-w-md p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-left font-sans text-xs space-y-2 text-neutral-200">
                      <div className="font-bold text-emerald-400 flex items-center justify-between font-mono">
                        <span>WhatsApp Supplier Pitch Template</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-800 text-white font-bold">Ready</span>
                      </div>
                      <p className="text-[11px] italic text-neutral-300">
                        &quot;Dear Vendor, we have 25 Nos of SS Flange 150NB prime surplus. We can offer immediate return for 10% restocking credit on our next sheet order.&quot;
                      </p>
                    </div>
                  )}

                  {/* Scene 8: AES-256 Security */}
                  {currentScene.visualType === 'aes_security' && (
                    <div className="text-center space-y-3 max-w-md">
                      <div className="inline-flex p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <ShieldCheck className="w-10 h-10" />
                      </div>
                      <div className="text-base font-bold text-white font-mono">
                        Hardware AES-GCM (256-bit) Encrypted
                      </div>
                      <p className="text-[11px] text-neutral-300">
                        PBKDF2 100,000 SHA-256 Rounds · 15-Minute Session Inactivity Lock · GDPR Article 32 Privacy Shield
                      </p>
                    </div>
                  )}

                  {/* Scene 9: Auditor Persona */}
                  {currentScene.visualType === 'auditor_persona' && (
                    <div className="w-full max-w-md p-4 rounded-xl bg-neutral-900 border border-emerald-500/40 text-left space-y-3 font-sans">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
                          Official Professional Identity
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          Senior Authority Frame
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-black text-white">
                          Industrial Working Capital &amp; Inventory Auditor
                        </div>
                        <p className="text-xs text-neutral-400">
                          "I specialize in uncovering trapped working capital and hidden dead inventory in mid-sized manufacturing plants."
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                        <div className="p-2 rounded bg-neutral-950 text-neutral-300 border border-neutral-800">
                          <span className="text-rose-400 block font-bold">Never Say:</span>
                          "I sell software / apps"
                        </div>
                        <div className="p-2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                          <span className="text-emerald-400 block font-bold">Always Say:</span>
                          "I run a cash-flow audit"
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scene 11: Redacted Teaser */}
                  {currentScene.visualType === 'redacted_teaser' && (
                    <div className="w-full max-w-md p-4 rounded-xl bg-neutral-900 border border-amber-500/40 text-left space-y-2.5 font-mono text-xs">
                      <div className="flex items-center justify-between text-amber-400 font-bold border-b border-neutral-800 pb-2">
                        <span>CONFIDENTIAL PRELIMINARY AUDIT TEASER</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">Watermarked</span>
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex justify-between text-neutral-300 p-1.5 rounded bg-neutral-950">
                          <span>1. [SKU-REDACTED-1] SS Flange 150***</span>
                          <span className="text-rose-400 font-bold">₹46,250 (232d Idle)</span>
                        </div>
                        <div className="flex justify-between text-neutral-300 p-1.5 rounded bg-neutral-950">
                          <span>2. [SKU-REDACTED-2] Cast Valve 6"***</span>
                          <span className="text-rose-400 font-bold">₹2,55,600 (410d Idle)</span>
                        </div>
                      </div>
                      <div className="pt-2 text-[10px] text-amber-400/90 text-center font-sans italic border-t border-neutral-800">
                        "Proves you found their money without giving away the SKU list until they pay your retainer."
                      </div>
                    </div>
                  )}

                  {/* Scene 12: Success Fee */}
                  {currentScene.visualType === 'success_fee' && (
                    <div className="w-full max-w-md p-4 rounded-xl bg-gradient-to-br from-emerald-950/60 to-neutral-900 border border-emerald-500/40 text-left space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-emerald-900 pb-2">
                        <span>The Value-Pricing Settlement Formula</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-800 text-white">Cash Collected</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-neutral-300">
                          <span>Upfront Diagnostic Retainer:</span>
                          <span className="font-bold text-white">₹25,000</span>
                        </div>
                        <div className="flex justify-between text-neutral-300">
                          <span>15% Contingency on ₹3.8L Unlocked:</span>
                          <span className="font-bold text-emerald-400">+₹56,895</span>
                        </div>
                        <div className="flex justify-between text-emerald-300 pt-2 border-t border-emerald-800 text-sm font-bold">
                          <span>Total Single Client Revenue:</span>
                          <span className="text-emerald-400 font-black">₹81,895 Pure Profit</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Player Control Bar */}
                <div className="bg-neutral-900/95 border-t border-neutral-800 p-3 flex flex-col gap-2">
                  {/* Progress timeline bar */}
                  <div className="relative w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden cursor-pointer">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-200"
                      style={{ width: `${(videoProgressSec / currentScene.durationSec) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (currentSceneIdx > 0) {
                            setCurrentSceneIdx(currentSceneIdx - 1);
                            setVideoProgressSec(0);
                          }
                        }}
                        disabled={currentSceneIdx === 0}
                        className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30"
                        title="Previous Scene"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                        className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-transform active:scale-95"
                        title={isPlayingVideo ? 'Pause Simulation' : 'Play Simulation'}
                      >
                        {isPlayingVideo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      </button>

                      <button
                        onClick={() => {
                          if (currentSceneIdx < VIDEO_SCENES.length - 1) {
                            setCurrentSceneIdx(currentSceneIdx + 1);
                            setVideoProgressSec(0);
                          }
                        }}
                        disabled={currentSceneIdx === VIDEO_SCENES.length - 1}
                        className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30"
                        title="Next Scene"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setVideoProgressSec(0)}
                        className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
                        title="Replay Current Scene"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <span className="font-mono text-[11px] text-neutral-400 ml-2">
                        {Math.floor(videoProgressSec)}s / {currentScene.durationSec}s
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Voice narration audio toggle */}
                      <button
                        onClick={() => setIsVideoMuted(!isVideoMuted)}
                        className={`p-1.5 rounded transition-colors ${
                          isVideoMuted ? 'text-rose-400 hover:bg-neutral-800' : 'text-emerald-400 hover:bg-neutral-800'
                        }`}
                        title={isVideoMuted ? 'Unmute Audio Narration' : 'Mute Audio Narration'}
                      >
                        {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      {/* Speed selector */}
                      <select
                        aria-label="Simulation speed"
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="bg-neutral-800 text-neutral-200 text-[11px] font-mono rounded px-2 py-1 border border-neutral-700 focus:outline-none cursor-pointer"
                      >
                        <option value="0.75">0.75x</option>
                        <option value="1">1.0x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2.0x</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Narration Transcript & Subtitles */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Synchronized Spoken Narration (Scene {currentScene.id})</span>
                  </span>
                  <span className="font-mono text-[10px]">Natural Voice Engine Active</span>
                </div>
                <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans">
                  &ldquo;{currentScene.narrationText}&rdquo;
                </p>
              </div>
            </div>

            {/* Scenes Chapter List (Right 4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100 dark:border-neutral-800">
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                    Tutorial Chapters ({VIDEO_SCENES.length})
                  </h3>
                  <button
                    onClick={handleDownloadTranscript}
                    className="text-amber-600 dark:text-amber-400 hover:underline text-[11px] flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Transcript</span>
                  </button>
                </div>

                <div className="mt-3 space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                  {VIDEO_SCENES.map((scene, idx) => {
                    const isActive = idx === currentSceneIdx;
                    return (
                      <button
                        key={scene.id}
                        onClick={() => {
                          setCurrentSceneIdx(idx);
                          setVideoProgressSec(0);
                        }}
                        className={`w-full p-2.5 rounded-lg text-left text-xs transition-all flex items-start gap-2.5 ${
                          isActive
                            ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-amber-950 dark:text-amber-100 shadow-sm'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 border border-transparent'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                            isActive
                              ? 'bg-amber-500 text-neutral-950'
                              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {scene.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{scene.title}</div>
                          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                            {scene.description}
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-neutral-400 shrink-0">
                          {scene.durationSec}s
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direct Practice Launch CTA */}
              <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 text-xs space-y-2">
                <div className="font-bold text-amber-900 dark:text-amber-200">
                  Ready to test on factory data?
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-normal">
                  Open the Stock Sheet to inspect live items or launch The Drill to simulate date adjustments.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={onOpenDrill}
                    className="flex-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-center transition-colors"
                  >
                    Launch The Drill
                  </button>
                  <button
                    onClick={onNavigateToStock}
                    className="py-1.5 px-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg text-center hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Stock Engine
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: A TO Z AUDIO MASTERCLASS GUIDE                         */}
      {/* ============================================================== */}
      {activeMode === 'audio' && (
        <div className="space-y-6">
          {/* Audio Master Control Station */}
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-emerald-500" />
                  <span>The Complete A to Z Factory Masterclass Audio Tour</span>
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Listen to an exhaustive, continuous voice explanation of every operational concept, formula, and shortcut.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handlePlayAllAtoZ}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Play Full A-to-Z Tour</span>
                </button>

                <button
                  onClick={handleDownloadTranscript}
                  className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Script</span>
                </button>
              </div>
            </div>

            {/* Audio Waveform Canvas & Live Visualizer */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center space-y-3">
              <canvas
                ref={canvasRef}
                width={400}
                height={48}
                className="w-full max-w-lg h-12"
              />
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-neutral-400">
                  <span className={`w-2 h-2 rounded-full ${isPlayingAudio ? 'bg-emerald-500 animate-ping' : 'bg-neutral-600'}`} />
                  <span>Status: {isPlayingAudio ? `Narrating "${currentSpeakingTerm}"` : 'Standby / Ready'}</span>
                </span>
                <span className="text-neutral-600">·</span>
                <span className="text-neutral-400">Web Speech Natural Synthesizer</span>
              </div>
            </div>

            {/* Voice & Speed Settings Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <div className="flex items-center gap-3">
                <label className="text-neutral-500 dark:text-neutral-400 font-medium">Narrator Voice:</label>
                <select
                  aria-label="Narrator Voice"
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs rounded-md px-2.5 py-1.5 max-w-xs truncate cursor-pointer"
                >
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                  {availableVoices.length === 0 && <option value="">Default System Voice</option>}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-neutral-500 dark:text-neutral-400 font-medium">Pacing:</label>
                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-md">
                  {[0.8, 1.0, 1.25, 1.5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setAudioSpeed(spd)}
                      className={`px-2 py-1 text-xs rounded font-mono ${
                        audioSpeed === spd
                          ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-bold'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Letter Navigation Strip (A through Z) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {ATOZ_GLOSSARY.map((item) => {
              const isSelected = item.letter === selectedLetter;
              const isCurrentlyPlaying = isPlayingAudio && currentSpeakingTerm === item.term;
              return (
                <button
                  key={item.letter}
                  onClick={() => {
                    setSelectedLetter(item.letter);
                    handlePlayAudio(item);
                  }}
                  className={`w-9 h-9 rounded-lg font-mono font-bold text-xs shrink-0 flex items-center justify-center transition-all ${
                    isCurrentlyPlaying
                      ? 'bg-emerald-500 text-white shadow-md animate-pulse ring-2 ring-emerald-400'
                      : isSelected
                      ? 'bg-amber-500 text-neutral-950 font-extrabold shadow-sm'
                      : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                  }`}
                  title={`${item.letter}: ${item.term}`}
                >
                  {item.letter}
                </button>
              );
            })}
          </div>

          {/* Selected Letter Focused Audio Spotlight Card */}
          <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-xl font-bold font-mono">
                  {selectedAtoZItem.letter}
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {selectedAtoZItem.term}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {selectedAtoZItem.category}
                    </span>
                    {selectedAtoZItem.formulaOrShortcut && (
                      <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        {selectedAtoZItem.formulaOrShortcut}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Play / Stop Button */}
              <button
                onClick={() => handlePlayAudio(selectedAtoZItem)}
                className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all self-start sm:self-auto shadow-sm ${
                  isPlayingAudio && currentSpeakingTerm === selectedAtoZItem.term
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isPlayingAudio && currentSpeakingTerm === selectedAtoZItem.term ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause Narration</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Listen to Chapter {selectedAtoZItem.letter}</span>
                  </>
                )}
              </button>
            </div>

            {/* Content & Spoken Script */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-[11px]">
                  Operational Definition:
                </span>
                <p className="mt-1 text-neutral-800 dark:text-neutral-200 text-sm leading-relaxed">
                  {selectedAtoZItem.definition}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 italic font-sans leading-relaxed">
                &ldquo;{selectedAtoZItem.audioNarration}&rdquo;
              </div>
            </div>
          </div>

          {/* Full A-to-Z Grid View */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Browse All 26 Glossary Terms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ATOZ_GLOSSARY.map((item) => (
                <div
                  key={item.letter}
                  onClick={() => {
                    setSelectedLetter(item.letter);
                    handlePlayAudio(item);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    item.letter === selectedLetter
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-mono font-bold text-xs text-neutral-800 dark:text-neutral-200">
                      {item.letter}
                    </span>
                    <button
                      className="p-1 text-neutral-400 hover:text-emerald-500 transition-colors"
                      title="Play this item"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="mt-2 font-bold text-xs text-neutral-900 dark:text-neutral-100">
                    {item.term}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                    {item.definition}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 3: 3-STEP QUICKSTART GUIDE & CHEAT SHEET                  */}
      {/* ============================================================== */}
      {activeMode === 'quickstart' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 font-bold font-mono flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Inspect Baseline or Import Tally
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Review the 15-SKU Ambattur practice file. Notice the 6 Yellow Input Columns where data is typed, versus the 8 White Formula Columns where calculations occur.
              </p>
              <button
                onClick={onNavigateToStock}
                className="w-full py-2 px-3 text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 transition-colors text-center"
              >
                Go to Stock Sheet →
              </button>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 font-bold font-mono flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Run &quot;The Drill&quot; Sensitivity Test
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Open The Drill to adjust the movement date of SS Flange 150NB. Watch Days Idle drop from 608 days to 0 and remove ₹46,250 from dead cash status immediately.
              </p>
              <button
                onClick={onOpenDrill}
                className="w-full py-2 px-3 text-xs font-semibold bg-amber-500 hover:bg-amber-400 rounded-lg text-neutral-950 transition-colors text-center"
              >
                Open The Drill →
              </button>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 font-bold font-mono flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Print 1-Page Owner Deliverable
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Print the high-contrast 1-page A4 report for your Monday production meeting or bank OD credit review to negotiate reduced interest charges.
              </p>
              <button
                onClick={onPrintReport}
                className="w-full py-2 px-3 text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 transition-colors text-center"
              >
                Print 1-Pager →
              </button>
            </div>
          </div>

          {/* Quick FAQ / Common Troubleshooting */}
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Frequently Asked Questions (FAQ)
            </h3>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              <div className="py-2.5">
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  Q: Why is my item marked Dead even though we use it once a year?
                </span>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  A: If an item sits idle for 180+ days, it costs 18% in annual holding costs. Even if used once a year, holding it in bulk is burning cash; it should be ordered just-in-time.
                </p>
              </div>

              <div className="py-2.5">
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  Q: What is the master unlock PIN if my session locks?
                </span>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  A: The default master security PIN is <code className="font-mono text-amber-500 font-bold">2026</code> (or <code className="font-mono text-neutral-400">1234</code>).
                </p>
              </div>

              <div className="py-2.5">
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  Q: How do I export my data without leaking supplier rates?
                </span>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  A: Toggle GDPR Privacy Shield in the header or Security tab. All SKU codes will be masked to <code className="font-mono text-neutral-400">ANON-SKU-***</code> before printing or exporting.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
