import React, { useState, useMemo } from 'react';
import { StockItem, StockCategory } from '../types';
import { 
  FileUp, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Table, 
  Layers, 
  RotateCcw,
  UploadCloud,
  FileSpreadsheet,
  Check,
  Copy,
  Info
} from 'lucide-react';
import { SAMPLE_DATASET_PRESETS, SampleDatasetInfo } from '../data/sampleDatasets';

interface SmartTallyImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: StockItem[]) => void;
}

// Common Tally/Excel header synonyms for fuzzy matching
const HEADER_SYNONYMS = {
  itemCode: ['item code', 'itemcode', 'part no', 'partno', 'part number', 'code', 'sku', 'item alias', 'alias', 'item id'],
  itemName: ['item name', 'itemname', 'particulars', 'stock item', 'item description', 'description', 'product', 'material name'],
  category: ['category', 'group', 'stock group', 'item group', 'material type', 'type'],
  qtyOnHand: ['qty on hand', 'quantity', 'qty', 'closing qty', 'closing balance', 'balance qty', 'billed qty', 'actual qty', 'stock qty', 'nos', 'kgs'],
  costRate: ['cost rate', 'rate', 'unit rate', 'cost price', 'purchase rate', 'price', 'standard cost', 'standard rate', 'basic rate'],
  lastMovement: ['last movement', 'last movement date', 'last date', 'last voucher date', 'last sales date', 'last issue date', 'movement date', 'voucher date', 'date'],
};

// Realistic Messy 40-SKU Tally Export Raw Text for 1-Click Testing
const SAMPLE_MESSY_TALLY_CSV = `Particulars,Part No,Stock Group,Closing Qty,Standard Rate,Last Voucher Date
"MS Heavy Plate 32mm IS 2062",RM-PLT-32,Raw Material,2400 Kg,"₹ 72.50",14-May-2024
"Seamless Pipe 4 Inch Sch 40",RM-PIP-4IN,Raw Material,85 Meters,"₹ 1,840.00",02-Jan-2025
"SS Hex Bolt M16 x 75mm Grade 304",CS-BLT-M16,Consumable,3500 Nos,"₹ 18.00",19-Sep-2026
"Forged Gate Valve 3 Inch #150",SP-VLV-GATE,Spares,12 Nos,"₹ 8,400.00",10-Oct-2024
"Mild Steel Equal Angle 75x75x6",RM-ANG-75,Raw Material,1850 Meters,"₹ 410.00",05-Jun-2024
"Plasma Torch Consumable Nozzle 80A",CS-PLS-NOZ,Consumable,120 Nos,"₹ 320.00",28-Aug-2026
"Duplex 2205 Round Bar 50mm",RM-BAR-DUP,Raw Material,620 Kg,"₹ 480.00",15-Nov-2023
"High Pressure Ball Valve 1 Inch",SP-VLV-1IN,Spares,18 Nos,"₹ 3,900.00",12-Mar-2025
"Welding Wire MIG ER70S-6 1.2mm",CS-WIR-MIG,Consumable,250 Spools,"₹ 1,650.00",14-Sep-2026
"Stainless Steel Flange 200NB Class 300",FG-FLG-200,Finished Goods,14 Nos,"₹ 3,850.00",08-Feb-2024
"Hydraulic Seal Kit Rexroth 32mm",SP-HYD-SEAL,Spares,24 Sets,"₹ 1,450.00",18-Aug-2024
"Aluminium Sheet 3mm 6061-T6",RM-SHT-ALU,Raw Material,45 Sheets,"₹ 4,800.00",21-Jan-2025
"Grinding Wheel 7 Inch 4mm Depressed",CS-WHL-GRN,Consumable,480 Nos,"₹ 65.00",02-Oct-2026
"Pneumatic Cylinder 50mm Bore 200 Stroke",SP-PNEU-50,Spares,6 Nos,"₹ 5,200.00",04-Jul-2024
"MS Flange Slip-On 100NB Table E",FG-FLG-MSO,Finished Goods,45 Nos,"₹ 680.00",11-May-2025
"Tungsten Carbide Tipped Saw Blade",CS-BLD-TCT,Consumable,8 Nos,"₹ 2,900.00",19-Apr-2025
"Copper Busbar 50x6mm Electrolytic",RM-BUS-COP,Raw Material,180 Kg,"₹ 820.00",22-Feb-2024
"Pressure Gauge 0-25 Bar Bottom Entry",SP-GAUGE-25,Spares,15 Nos,"₹ 950.00",11-Aug-2024
"Flux Cored Wire E71T-1 1.2mm Spool",CS-WIR-FLX,Consumable,110 Spools,"₹ 2,400.00",26-Sep-2026
"Carbon Steel Elbow 90 Deg 4 Inch Sch 40",FG-ELB-90,Finished Goods,65 Nos,"₹ 420.00",17-Dec-2024`;

export const SmartTallyImporterModal: React.FC<SmartTallyImporterModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [rawText, setRawText] = useState('');
  const [step, setStep] = useState<'input' | 'mapping'>('input');
  
  // Detected parsed rows
  const [parsedRawData, setParsedRawData] = useState<{ headers: string[]; rows: string[][] }>({
    headers: [],
    rows: [],
  });

  // Column mappings
  const [mapping, setMapping] = useState<{
    itemCode: string;
    itemName: string;
    category: string;
    qtyOnHand: string;
    costRate: string;
    lastMovement: string;
  }>({
    itemCode: '',
    itemName: '',
    category: '',
    qtyOnHand: '',
    costRate: '',
    lastMovement: '',
  });

  // Split raw text into rows & columns respecting quotes
  const parseDelimitedText = (text: string): { headers: string[]; rows: string[][] } => {
    const lines = text
      .trim()
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);
    if (lines.length < 2) return { headers: [], rows: [] };

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      const delimiter = line.includes('\t') ? '\t' : ',';

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map(parseLine);
    return { headers, rows };
  };

  // Find best match header
  const detectBestHeader = (headers: string[], synonyms: string[]): string => {
    for (const h of headers) {
      const clean = h.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
      for (const syn of synonyms) {
        if (clean === syn || clean.includes(syn) || syn.includes(clean)) {
          return h;
        }
      }
    }
    return '';
  };

  // Parse raw text and trigger auto-detection
  const handleProceedToMapping = () => {
    const parsed = parseDelimitedText(rawText);
    if (parsed.headers.length === 0 || parsed.rows.length === 0) {
      return;
    }
    setParsedRawData(parsed);

    // Auto-detect columns using fuzzy dictionary
    const autoCode = detectBestHeader(parsed.headers, HEADER_SYNONYMS.itemCode) || parsed.headers[0] || '';
    const autoName = detectBestHeader(parsed.headers, HEADER_SYNONYMS.itemName) || parsed.headers[1] || '';
    const autoCat = detectBestHeader(parsed.headers, HEADER_SYNONYMS.category) || parsed.headers[2] || '';
    const autoQty = detectBestHeader(parsed.headers, HEADER_SYNONYMS.qtyOnHand) || parsed.headers[3] || '';
    const autoRate = detectBestHeader(parsed.headers, HEADER_SYNONYMS.costRate) || parsed.headers[4] || '';
    const autoDate = detectBestHeader(parsed.headers, HEADER_SYNONYMS.lastMovement) || parsed.headers[5] || '';

    setMapping({
      itemCode: autoCode,
      itemName: autoName,
      category: autoCat,
      qtyOnHand: autoQty,
      costRate: autoRate,
      lastMovement: autoDate,
    });

    setStep('mapping');
  };

  // Clean numbers from raw strings (e.g., "₹ 1,850.00" -> 1850)
  const sanitizeNumber = (val: string): number => {
    if (!val) return 0;
    const clean = val.replace(/[^\d.-]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : Math.abs(num);
  };

  // Clean dates into YYYY-MM-DD
  const sanitizeDate = (val: string): string => {
    if (!val) return '2026-01-01';
    const clean = val.trim();

    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;

    // DD-MM-YYYY or DD/MM/YYYY
    const dmy = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmy) {
      const day = dmy[1].padStart(2, '0');
      const month = dmy[2].padStart(2, '0');
      const year = dmy[3];
      return `${year}-${month}-${day}`;
    }

    // DD-Mon-YYYY (e.g. 14-May-2024 or 14-MAY-2024)
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const dMonY = clean.match(/^(\d{1,2})[-/\s]([A-Za-z]{3})[-/\s](\d{4})$/);
    if (dMonY) {
      const day = dMonY[1].padStart(2, '0');
      const monStr = dMonY[2].toLowerCase();
      const monthIdx = monthNames.indexOf(monStr);
      if (monthIdx !== -1) {
        const month = String(monthIdx + 1).padStart(2, '0');
        const year = dMonY[3];
        return `${year}-${month}-${day}`;
      }
    }

    // Fallback try Date.parse
    try {
      const parsed = new Date(clean);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch {
      // ignore
    }

    return '2026-01-01';
  };

  // Clean category
  const sanitizeCategory = (val: string): StockCategory => {
    if (!val) return 'Raw Material';
    const lower = val.toLowerCase();
    if (lower.includes('finish') || lower.includes('fg')) return 'Finished Goods';
    if (lower.includes('spare') || lower.includes('part')) return 'Spares';
    if (lower.includes('consum') || lower.includes('weld') || lower.includes('tool')) return 'Consumable';
    return 'Raw Material';
  };

  // Convert raw rows into formatted StockItem array
  const previewConvertedItems: StockItem[] = useMemo(() => {
    if (step !== 'mapping' || parsedRawData.rows.length === 0) return [];

    const headers = parsedRawData.headers;
    const colIdx = {
      code: headers.indexOf(mapping.itemCode),
      name: headers.indexOf(mapping.itemName),
      category: headers.indexOf(mapping.category),
      qty: headers.indexOf(mapping.qtyOnHand),
      rate: headers.indexOf(mapping.costRate),
      date: headers.indexOf(mapping.lastMovement),
    };

    return parsedRawData.rows.map((row, index) => {
      const rawCode = colIdx.code !== -1 ? row[colIdx.code] : `SKU-${index + 1}`;
      const rawName = colIdx.name !== -1 ? row[colIdx.name] : `Imported Stock Item ${index + 1}`;
      const rawCat = colIdx.category !== -1 ? row[colIdx.category] : 'Raw Material';
      const rawQty = colIdx.qty !== -1 ? row[colIdx.qty] : '1';
      const rawRate = colIdx.rate !== -1 ? row[colIdx.rate] : '100';
      const rawDate = colIdx.date !== -1 ? row[colIdx.date] : '2026-01-01';

      const qtyOnHand = sanitizeNumber(rawQty);
      const costRate = sanitizeNumber(rawRate);
      const lastMovement = sanitizeDate(rawDate);
      const category = sanitizeCategory(rawCat);

      return {
        id: `tally-import-${Date.now()}-${index}`,
        itemCode: rawCode || `SKU-${index + 1}`,
        itemName: rawName || `Item ${index + 1}`,
        category,
        qtyOnHand,
        costRate,
        lastMovement,
        closingValue: Math.round(qtyOnHand * costRate),
      };
    });
  }, [step, parsedRawData, mapping]);

  // Handle final import
  const handleFinalExecuteImport = () => {
    if (previewConvertedItems.length === 0) return;
    onImport(previewConvertedItems);
    onClose();
  };

  const [activePreset, setActivePreset] = useState<SampleDatasetInfo | null>(null);
  const [copiedPreset, setCopiedPreset] = useState<boolean>(false);

  // Load sample file
  const handleLoadSample = (preset?: SampleDatasetInfo) => {
    if (preset) {
      setActivePreset(preset);
      setRawText(preset.csvData);
    } else {
      setActivePreset(null);
      setRawText(SAMPLE_MESSY_TALLY_CSV);
    }
  };

  const handleCopyCurrentCsv = () => {
    if (!rawText) return;
    navigator.clipboard.writeText(rawText);
    setCopiedPreset(true);
    setTimeout(() => setCopiedPreset(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-panel rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col my-8 border border-neutral-300 dark:border-neutral-700/80">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 tracking-tight">
                <span>Smart Tally &amp; Excel CSV Ingestor</span>
                <span className="industrial-badge bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30">
                  Fuzzy Mapping
                </span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                Paste real-world messy Tally stock reports or select pre-configured industry test datasets.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close Smart Tally Importer Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 flex-1">
          {step === 'input' ? (
            <div className="space-y-3">
              {/* Preset Datasets Selector Bar */}
              <div className="p-3 rounded-lg bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    1-Click Industry Test Datasets:
                  </span>
                  {rawText && (
                    <button
                      onClick={handleCopyCurrentCsv}
                      className="text-[11px] font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
                    >
                      {copiedPreset ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500 font-semibold">Copied CSV</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Raw CSV</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_DATASET_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleLoadSample(preset)}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                        activePreset?.id === preset.id
                          ? 'bg-amber-500 text-neutral-950 font-bold border-amber-600 shadow-sm'
                          : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:border-amber-400'
                      }`}
                    >
                      <span>{preset.id === 'auto-cnc' ? '🚗' : preset.id === 'elec-pcb' ? '⚡' : '🏭'}</span>
                      <span>{preset.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">({preset.expectedStats.skuCount} SKUs)</span>
                    </button>
                  ))}
                  <button
                    onClick={() => handleLoadSample()}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                      !activePreset && rawText === SAMPLE_MESSY_TALLY_CSV
                        ? 'bg-amber-500 text-neutral-950 font-bold border-amber-600 shadow-sm'
                        : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:border-amber-400'
                    }`}
                  >
                    <span>📋</span>
                    <span>Tally Raw Messy Export</span>
                    <span className="text-[10px] opacity-75 font-mono">(20 SKUs)</span>
                  </button>
                </div>

                {/* If active preset selected, display expected verification metrics */}
                {activePreset && (
                  <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400 gap-2">
                    <div>
                      <strong className="text-neutral-900 dark:text-white">{activePreset.name}:</strong>{' '}
                      <span>{activePreset.description}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span>Total: <strong className="text-neutral-900 dark:text-white">{activePreset.expectedStats.totalStockValue}</strong></span>
                      <span>Dead: <strong className="text-rose-600 dark:text-rose-400">{activePreset.expectedStats.deadStockValue} ({activePreset.expectedStats.deadStockPercent})</strong></span>
                      <span>Burn/yr: <strong className="text-amber-600 dark:text-amber-400">{activePreset.expectedStats.annualHoldingBurn}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                  Paste CSV or Tab-Delimited Stock Export:
                </span>
                <span className="text-[11px] text-neutral-500">
                  {rawText ? `${rawText.split('\n').filter(Boolean).length} rows ready` : 'Or type / paste custom data below'}
                </span>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  setActivePreset(null);
                }}
                rows={9}
                placeholder="Paste stock lines here... (e.g. Particulars, Part No, Closing Qty, Rate, Last Date)"
                className="w-full text-xs font-mono p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1">
                <div className="font-semibold text-neutral-900 dark:text-neutral-200">
                  Quick Data Entry Tip:
                </div>
                <div>You can also directly copy any of the dataset tables provided in the assistant chat and paste them right here. Click <strong>Proceed to Column Mapping</strong> below to preview calculated values before importing!</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Confirm Column Matchings ({parsedRawData.rows.length} rows detected)
                </div>
                <button
                  onClick={() => setStep('input')}
                  className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Edit Raw Text
                </button>
              </div>

              {/* 6 Column Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'itemName', label: 'Item Name / Description *' },
                  { key: 'itemCode', label: 'Part No / SKU Code *' },
                  { key: 'category', label: 'Stock Group / Category' },
                  { key: 'qtyOnHand', label: 'Closing Quantity *' },
                  { key: 'costRate', label: 'Standard / Cost Rate *' },
                  { key: 'lastMovement', label: 'Last Voucher Date *' },
                ].map(({ key, label }) => (
                  <div key={key} className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
                    <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                      {label}
                    </label>
                    <select
                      value={(mapping as any)[key]}
                      onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })}
                      className="w-full text-xs font-mono p-1.5 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">-- Select Column --</option>
                      {parsedRawData.headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Data Preview Table */}
              <div>
                <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5 flex items-center justify-between">
                  <span>Cleaned Data Preview (First 5 Rows):</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Total Value: ₹{previewConvertedItems.reduce((acc, i) => acc + (i.closingValue || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-lg max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Item Name</th>
                        <th className="py-2 px-3">Code</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3 text-right">Qty</th>
                        <th className="py-2 px-3 text-right">Rate</th>
                        <th className="py-2 px-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
                      {previewConvertedItems.slice(0, 5).map((item, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                          <td className="py-2 px-3 font-sans font-medium text-neutral-900 dark:text-neutral-100 max-w-[180px] truncate">
                            {item.itemName}
                          </td>
                          <td className="py-2 px-3 text-neutral-500">{item.itemCode}</td>
                          <td className="py-2 px-3 text-neutral-500">{item.category}</td>
                          <td className="py-2 px-3 text-right">{item.qtyOnHand}</td>
                          <td className="py-2 px-3 text-right">₹{item.costRate}</td>
                          <td className="py-2 px-3 text-right text-neutral-600 dark:text-neutral-300">{item.lastMovement}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancel
          </button>

          {step === 'input' ? (
            <button
              onClick={handleProceedToMapping}
              disabled={rawText.trim().length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Parse &amp; Match Columns</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinalExecuteImport}
              disabled={previewConvertedItems.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Import {previewConvertedItems.length} SKUs into Engine</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartTallyImporterModal;
