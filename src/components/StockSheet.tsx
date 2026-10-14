import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { StockItem, RulesConfig, CurrencyCode, UserRole, StockCategory, StockStatus } from '../types';
import { evaluateStockEngine, formatCurrency } from '../utils/calculations';
import { Sparkline } from './Sparkline';
import { SmartTallyImporterModal } from './SmartTallyImporterModal';
import { 
  Search, 
  Plus, 
  Trash2, 
  FileUp, 
  Download, 
  RotateCcw, 
  Lock, 
  HelpCircle, 
  Info,
  Check,
  AlertCircle,
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react';

interface StockSheetProps {
  items: StockItem[];
  rules: RulesConfig;
  currency: CurrencyCode;
  userRole: UserRole;
  onUpdateItem: (updated: StockItem) => void;
  onAddItem: (newItem: StockItem) => void;
  onDeleteItem: (id: string) => void;
  onResetItems: () => void;
  onBulkImport: (newItems: StockItem[]) => void;
}

export const StockSheet: React.FC<StockSheetProps> = ({
  items,
  rules,
  currency,
  userRole,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onResetItems,
  onBulkImport,
}) => {
  // Evaluated rows with formulas applied
  const evaluatedItems = evaluateStockEngine(items, rules);

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Dead' | 'Slow' | 'Moving'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [abcFilter, setAbcFilter] = useState<'All' | 'A' | 'B' | 'C'>('All');

  // Formula tooltip modal / notification
  const [formulaNotice, setFormulaNotice] = useState<{ col: string; formula: string; explanation: string } | null>(null);

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemData, setNewItemData] = useState<Omit<StockItem, 'id'>>({
    itemCode: '',
    itemName: '',
    category: 'Raw Material',
    qtyOnHand: 10,
    costRate: 500,
    lastMovement: rules.asOfDate,
  });

  // Tally Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // CSV Export Menu & Toast Notification
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [subtleSaveNotice, setSubtleSaveNotice] = useState<string | null>(null);

  // Large catalog pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Filter items
  const filteredItems = evaluatedItems.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesAbc = abcFilter === 'All' || item.abcClass === abcFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesAbc;
  });

  const totalPages = pageSize === 0 ? 1 : Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    if (pageSize === 0) return filteredItems;
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Quick edit handler for yellow cells
  const handleCellChange = (id: string, field: keyof StockItem, value: any) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const updated = {
      ...target,
      [field]: field === 'qtyOnHand' || field === 'costRate' ? Number(value) || 0 : value,
    };
    onUpdateItem(updated);
    setSubtleSaveNotice(`Formulas recalculated for ${target.itemCode}`);
    setTimeout(() => setSubtleSaveNotice(null), 2500);
  };

  // Click on a white formula cell
  const handleWhiteCellClick = (colName: string, formulaStr: string, explanation: string) => {
    setFormulaNotice({
      col: colName,
      formula: formulaStr,
      explanation,
    });
  };

  // Add Item Submit
  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemData.itemName.trim()) return;
    const id = `sku-${Date.now().toString(36)}`;
    onAddItem({
      id,
      itemCode: newItemData.itemCode || `SKU-${Math.floor(100 + Math.random() * 900)}`,
      itemName: newItemData.itemName,
      category: newItemData.category,
      qtyOnHand: Number(newItemData.qtyOnHand) || 0,
      costRate: Number(newItemData.costRate) || 0,
      lastMovement: newItemData.lastMovement || rules.asOfDate,
    });
    setShowAddModal(false);
    setNewItemData({
      itemCode: '',
      itemName: '',
      category: 'Raw Material',
      qtyOnHand: 10,
      costRate: 500,
      lastMovement: rules.asOfDate,
    });
  };

  // CSV / Tally Parser
  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    try {
      const lines = importText.trim().split('\n');
      const parsed: StockItem[] = [];

      lines.forEach((line, index) => {
        // Skip header line if detected
        if (index === 0 && (line.toLowerCase().includes('item') || line.toLowerCase().includes('qty'))) {
          return;
        }
        // Support tab-delimited, comma-delimited, or pipe-delimited
        const delimiter = line.includes('\t') ? '\t' : line.includes(',') ? ',' : '|';
        const parts = line.split(delimiter).map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 3) {
          const itemCode = parts[0] || `SKU-${index + 1}`;
          const itemName = parts[1] || `Item ${index + 1}`;
          const category = (['Raw Material', 'Finished Goods', 'Spares', 'Consumable'].find((c) =>
            parts[2]?.toLowerCase().includes(c.toLowerCase())
          ) || 'Raw Material') as StockCategory;
          const qtyOnHand = parseFloat(parts[3] || parts[2] || '1') || 1;
          const costRate = parseFloat(parts[4] || parts[3] || '100') || 100;
          const lastMovement = parts[5] && parts[5].length >= 8 ? parts[5] : rules.asOfDate;

          parsed.push({
            id: `import-${Date.now()}-${index}`,
            itemCode,
            itemName,
            category,
            qtyOnHand,
            costRate,
            lastMovement,
          });
        }
      });

      if (parsed.length > 0) {
        onBulkImport(parsed);
        setShowImportModal(false);
        setImportText('');
        setImportStatus(null);
      } else {
        setImportStatus('Could not parse any rows. Ensure columns: Code, Name, Category, Qty, Rate, Date');
      }
    } catch (err: any) {
      setImportStatus(`Import error: ${err.message}`);
    }
  };

  // Helper to sanitize CSV cells
  const sanitizeCsvCell = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Export CSV handler for full, tally, or dead stock options
  const handleExportCsv = (mode: 'full' | 'tally' | 'dead' = 'full') => {
    setShowExportMenu(false);

    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = '';

    if (mode === 'tally') {
      // 6 Clean Yellow Input Columns formatted for Tally ERP 9 / TallyPrime import
      headers = [
        'Item Code',
        'Item Name',
        'Stock Group (Category)',
        'Billed Qty On Hand',
        `Standard Cost Rate (${currency})`,
        'Last Movement Date',
      ];
      rows = evaluatedItems.map((item) => [
        sanitizeCsvCell(item.itemCode),
        sanitizeCsvCell(item.itemName),
        sanitizeCsvCell(item.category),
        item.qtyOnHand,
        item.costRate,
        sanitizeCsvCell(item.lastMovement),
      ]);
      filename = `tally_inventory_movement_${rules.asOfDate}.csv`;
    } else if (mode === 'dead') {
      // Filtered to Dead Stock items only for liquidation / scrap recovery
      const deadItems = evaluatedItems.filter((i) => i.status === 'Dead');
      headers = [
        'Item Code',
        'Item Name',
        'Category',
        'Qty On Hand',
        `Cost Rate (${currency})`,
        'Last Movement',
        `Trapped Value (${currency})`,
        'Days Idle',
        'Status',
        'ABC Class',
        'Action Recommendation',
        `Annual Holding Burn (${currency})`,
      ];
      rows = deadItems.map((item) => [
        sanitizeCsvCell(item.itemCode),
        sanitizeCsvCell(item.itemName),
        sanitizeCsvCell(item.category),
        item.qtyOnHand,
        item.costRate,
        sanitizeCsvCell(item.lastMovement),
        item.closingValue || 0,
        item.daysIdle || 0,
        sanitizeCsvCell(item.status),
        sanitizeCsvCell(item.abcClass),
        sanitizeCsvCell(item.action),
        Math.round((item.closingValue || 0) * (rules.holdingCostPercent / 100)),
      ]);
      filename = `dead_stock_liquidation_list_${rules.asOfDate}.csv`;
    } else {
      // Full 15-Column Master Sheet for Excel financial audits
      headers = [
        'Item Code',
        'Item Name',
        'Category',
        'Qty On Hand',
        `Cost Rate (${currency})`,
        'Last Movement',
        `Closing Value (${currency})`,
        'Days Idle',
        'Status',
        'Value Rank',
        'Cumulative %',
        'ABC Class',
        'Action Recommendation',
        `Dead Value (${currency})`,
        `Holding Cost Burn (${currency})`,
      ];
      rows = evaluatedItems.map((item) => [
        sanitizeCsvCell(item.itemCode),
        sanitizeCsvCell(item.itemName),
        sanitizeCsvCell(item.category),
        item.qtyOnHand,
        item.costRate,
        sanitizeCsvCell(item.lastMovement),
        item.closingValue || 0,
        item.daysIdle || 0,
        sanitizeCsvCell(item.status),
        item.valueRank || '',
        item.cumulativePercent || '',
        sanitizeCsvCell(item.abcClass),
        sanitizeCsvCell(item.action),
        item.deadValue || 0,
        Math.round((item.deadValue || 0) * (rules.holdingCostPercent / 100)),
      ]);
      filename = `factory_stock_engine_full_${rules.asOfDate}.csv`;
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportToast(`Exported "${filename}" (${rows.length} rows) for Excel & Tally integration.`);
    setTimeout(() => setExportToast(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Sheet Philosophy Banner */}
      <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                14-Column Forensic Stock Engine
              </h2>
              {subtleSaveNotice && (
                <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                  {subtleSaveNotice} ✓
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">Yellow cells</span> are editable inputs (Item Code, Name, Category, Quantity, Cost Rate, Last Movement Date).{' '}
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">White cells</span> are calculated formulas (Closing Value, Days Idle, Classification, ABC Pareto Rank, Carrying Cost Bleed).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Import Tally File</span>
          </button>

          {/* Export CSV Dropdown */}
          <div className="relative">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => handleExportCsv('full')}
                className="px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-l-md transition-colors flex items-center gap-1.5"
                title="Export complete 15-column inventory master as CSV for Excel"
              >
                <Download className="w-3.5 h-3.5 text-amber-500" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-1.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border-y border-r border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-r-md transition-colors"
                title="Choose CSV export format (Excel, Tally, or Dead stock list)"
                aria-label="Export options"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dropdown Menu */}
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-64 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl z-30 p-1.5 text-xs font-sans space-y-1">
                <button
                  onClick={() => handleExportCsv('full')}
                  className="w-full text-left p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-start gap-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Full Engine Master CSV
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      All 15 columns + formulas + Pareto ABC ranks for Excel analysis
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExportCsv('tally')}
                  className="w-full text-left p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-start gap-2.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Tally ERP Import CSV
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      Clean 6 yellow input columns for Tally Daybook / Stock Journal
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExportCsv('dead')}
                  className="w-full text-left p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-start gap-2.5 transition-colors"
                >
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Dead Stock Liquidation List
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      Only items with &ge;{rules.deadThresholdDays}d idle for vendor/scrap recovery
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onResetItems}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors flex items-center gap-1"
            title="Reset to Ambattur fabrication unit sample (20 SKUs)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sample</span>
          </button>
        </div>
      </div>

      {/* CSV Export Success Toast */}
      {exportToast && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{exportToast}</span>
          </div>
          <button
            onClick={() => setExportToast(null)}
            className="text-xs text-emerald-700 hover:text-emerald-950 dark:text-emerald-400 dark:hover:text-emerald-200 px-2 py-0.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg glass-card shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search SKU code or item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md bg-white/70 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            aria-label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-md px-2 py-1.5 focus:outline-none"
          >
            <option value="All">Status: All</option>
            <option value="Dead">Dead (≥{rules.deadThresholdDays}d)</option>
            <option value="Slow">Slow (≥{rules.slowThresholdDays}d)</option>
            <option value="Moving">Moving (&lt;{rules.slowThresholdDays}d)</option>
          </select>

          {/* Category filter */}
          <select
            aria-label="Filter by Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-md px-2 py-1.5 focus:outline-none"
          >
            <option value="All">Category: All</option>
            <option value="Raw Material">Raw Material</option>
            <option value="Finished Goods">Finished Goods</option>
            <option value="Spares">Spares</option>
            <option value="Consumable">Consumable</option>
          </select>

          {/* ABC Class filter */}
          <select
            aria-label="Filter by ABC Class"
            value={abcFilter}
            onChange={(e) => setAbcFilter(e.target.value as any)}
            className="text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-md px-2 py-1.5 focus:outline-none"
          >
            <option value="All">ABC: All</option>
            <option value="A">Class A (Top 80%)</option>
            <option value="B">Class B (Next 15%)</option>
            <option value="C">Class C (Tail 5%)</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 rounded-md transition-colors flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>
      </div>

      {/* Formula Explanation Banner (If clicked) */}
      {formulaNotice && (
        <div className="p-3 rounded-lg bg-neutral-900 text-white dark:bg-neutral-800 border border-neutral-700 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-400">
                Formula Protected: Column [{formulaNotice.col}]
              </div>
              <div className="font-mono text-neutral-300 mt-0.5">
                Formula: {formulaNotice.formula}
              </div>
              <div className="text-neutral-400 mt-1">
                {formulaNotice.explanation}
              </div>
            </div>
          </div>
          <button
            onClick={() => setFormulaNotice(null)}
            className="text-neutral-400 hover:text-white px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. The Core Stock Engine Table */}
      <div className="glass-card rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[700px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-20 bg-neutral-100/90 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-800 dark:text-neutral-200 border-b border-neutral-300 dark:border-neutral-700/80 shadow-xs">
              <tr>
                <th className="py-2.5 px-3 font-semibold border-r border-neutral-200 dark:border-neutral-700 w-10 text-center">#</th>
                
                {/* Yellow Input Columns Header */}
                <th className="py-2.5 px-3 font-semibold bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-r border-neutral-200 dark:border-neutral-700">
                  Item Code <span className="text-[10px] font-normal text-amber-700 dark:text-amber-400">(Type)</span>
                </th>
                <th className="py-2.5 px-3 font-semibold bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-r border-neutral-200 dark:border-neutral-700 min-w-[180px]">
                  Item Name <span className="text-[10px] font-normal text-amber-700 dark:text-amber-400">(Type)</span>
                </th>
                <th className="py-2.5 px-2 font-semibold border-r border-neutral-200 dark:border-neutral-700 w-28 text-center">
                  12M Trend <span className="text-[10px] font-normal text-neutral-400">(D3)</span>
                </th>
                <th className="py-2.5 px-3 font-semibold bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-r border-neutral-200 dark:border-neutral-700">
                  Category <span className="text-[10px] font-normal text-amber-700 dark:text-amber-400">(Type)</span>
                </th>
                <th className="py-2.5 px-3 font-semibold text-right bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-r border-neutral-200 dark:border-neutral-700">
                  Qty on Hand <span className="text-[10px] font-normal text-amber-700 dark:text-amber-400">(Type)</span>
                </th>
                <th className="py-2.5 px-3 font-semibold text-right bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-r border-neutral-200 dark:border-neutral-700">
                  Cost Rate (₹) <span className="text-[10px] font-normal text-amber-700 dark:text-amber-400">(Type)</span>
                </th>
                <th className="py-2.5 px-3 font-semibold text-center bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-r border-neutral-200 dark:border-neutral-700">
                  Last Movement <span className="text-[10px] font-normal text-amber-700 dark:text-amber-400">(Type)</span>
                </th>

                {/* White Formula Columns Header */}
                <th className="py-2.5 px-3 font-semibold text-right border-r border-neutral-200 dark:border-neutral-700">
                  Closing Value <span className="text-[10px] font-normal text-neutral-400">(=Qty×Rate)</span>
                </th>
                <th className="py-2.5 px-3 font-semibold text-right border-r border-neutral-200 dark:border-neutral-700">
                  Days Idle <span className="text-[10px] font-normal text-neutral-400">(=AsOf-Last)</span>
                </th>
                <th className="py-2.5 px-3 font-semibold text-center border-r border-neutral-200 dark:border-neutral-700">
                  Status <span className="text-[10px] font-normal text-neutral-400">(=Rules)</span>
                </th>
                <th className="py-2.5 px-3 font-semibold text-center border-r border-neutral-200 dark:border-neutral-700">
                  Rank <span className="text-[10px] font-normal text-neutral-400">(=Sort)</span>
                </th>
                <th className="py-2.5 px-3 font-semibold text-right border-r border-neutral-200 dark:border-neutral-700">
                  Cumul % <span className="text-[10px] font-normal text-neutral-400">(=Sum)</span>
                </th>
                <th className="py-2.5 px-3 font-semibold text-center border-r border-neutral-200 dark:border-neutral-700">
                  ABC <span className="text-[10px] font-normal text-neutral-400">(=Pareto)</span>
                </th>
                <th className="py-2.5 px-3 font-semibold border-r border-neutral-200 dark:border-neutral-700 min-w-[200px]">
                  Action Recommendation <span className="text-[10px] font-normal text-neutral-400">(=Derived)</span>
                </th>
                <th className="py-2.5 px-3 font-semibold text-right border-r border-neutral-200 dark:border-neutral-700">
                  Dead Value <span className="text-[10px] font-normal text-neutral-400">(Helper)</span>
                </th>
                <th className="py-2.5 px-2 text-center">Del</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={17} className="py-8 text-center text-neutral-500 dark:text-neutral-400 font-sans text-xs">
                    No SKU items match the active search and filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                const isDead = item.status === 'Dead';
                const isSlow = item.status === 'Slow';
                const globalIdx = pageSize === 0 ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition-colors ${
                      isDead ? 'bg-rose-50/20 dark:bg-rose-950/10' : isSlow ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                    }`}
                  >
                    {/* Index */}
                    <td className="py-2 px-3 text-center text-neutral-400 text-[11px] border-r border-neutral-200 dark:border-neutral-800">
                      {globalIdx}
                    </td>

                    {/* Yellow 1: Item Code */}
                    <td className="py-1 px-2 border-r border-neutral-200 dark:border-neutral-800 bg-amber-50/40 dark:bg-amber-950/20">
                      <input
                        type="text"
                        value={item.itemCode}
                        onChange={(e) => handleCellChange(item.id, 'itemCode', e.target.value)}
                        className="w-full bg-transparent px-1.5 py-1 text-xs text-neutral-900 dark:text-neutral-100 focus:bg-amber-100 dark:focus:bg-amber-900/60 rounded focus:outline-none font-medium"
                      />
                    </td>

                    {/* Yellow 2: Item Name */}
                    <td className="py-1 px-2 border-r border-neutral-200 dark:border-neutral-800 bg-amber-50/40 dark:bg-amber-950/20 font-sans">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => handleCellChange(item.id, 'itemName', e.target.value)}
                        className="w-full bg-transparent px-1.5 py-1 text-xs text-neutral-900 dark:text-neutral-100 focus:bg-amber-100 dark:focus:bg-amber-900/60 rounded focus:outline-none font-medium"
                      />
                    </td>

                    {/* Inline D3 SVG Sparkline Component */}
                    <td className="py-1 px-2 border-r border-neutral-200 dark:border-neutral-800 text-center align-middle bg-neutral-50/30 dark:bg-neutral-900/30">
                      <Sparkline
                        movementDates={item.movementDates && item.movementDates.length > 0 ? item.movementDates : [item.lastMovement]}
                        asOfDate={rules.asOfDate}
                        status={item.status || 'Moving'}
                        width={84}
                        height={24}
                      />
                    </td>

                    {/* Yellow 3: Category */}
                    <td className="py-1 px-2 border-r border-neutral-200 dark:border-neutral-800 bg-amber-50/40 dark:bg-amber-950/20 font-sans">
                      <select
                        aria-label={`Category for ${item.itemName}`}
                        value={item.category}
                        onChange={(e) => handleCellChange(item.id, 'category', e.target.value)}
                        className="w-full bg-transparent px-1 py-1 text-xs text-neutral-700 dark:text-neutral-300 focus:bg-amber-100 dark:focus:bg-amber-900/60 rounded focus:outline-none cursor-pointer"
                      >
                        <option value="Raw Material">Raw Material</option>
                        <option value="Finished Goods">Finished Goods</option>
                        <option value="Spares">Spares</option>
                        <option value="Consumable">Consumable</option>
                      </select>
                    </td>

                    {/* Yellow 4: Qty on Hand */}
                    <td className="py-1 px-2 text-right border-r border-neutral-200 dark:border-neutral-800 bg-amber-50/40 dark:bg-amber-950/20">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.qtyOnHand}
                        onChange={(e) => handleCellChange(item.id, 'qtyOnHand', e.target.value)}
                        className="w-20 text-right bg-transparent px-1.5 py-1 text-xs text-neutral-900 dark:text-neutral-100 focus:bg-amber-100 dark:focus:bg-amber-900/60 rounded focus:outline-none font-bold"
                      />
                    </td>

                    {/* Yellow 5: Cost Rate */}
                    <td className="py-1 px-2 text-right border-r border-neutral-200 dark:border-neutral-800 bg-amber-50/40 dark:bg-amber-950/20">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.costRate}
                        onChange={(e) => handleCellChange(item.id, 'costRate', e.target.value)}
                        className="w-24 text-right bg-transparent px-1.5 py-1 text-xs text-neutral-900 dark:text-neutral-100 focus:bg-amber-100 dark:focus:bg-amber-900/60 rounded focus:outline-none font-bold"
                      />
                    </td>

                    {/* Yellow 6: Last Movement */}
                    <td className="py-1 px-2 text-center border-r border-neutral-200 dark:border-neutral-800 bg-amber-50/40 dark:bg-amber-950/20">
                      <input
                        type="date"
                        value={item.lastMovement}
                        onChange={(e) => handleCellChange(item.id, 'lastMovement', e.target.value)}
                        className="bg-transparent px-1 py-1 text-xs text-neutral-900 dark:text-neutral-100 focus:bg-amber-100 dark:focus:bg-amber-900/60 rounded focus:outline-none cursor-pointer"
                      />
                    </td>

                    {/* White 1: Closing Value */}
                    <td
                      onClick={() =>
                        handleWhiteCellClick(
                          'Closing Value',
                          '= Qty On Hand × Cost Rate',
                          'Multiplies the physical count by unit cost rate to calculate total cash trapped in this SKU.'
                        )
                      }
                      className="py-2 px-3 text-right border-r border-neutral-200 dark:border-neutral-800 cursor-help hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-neutral-900 dark:text-neutral-100 tabular-nums"
                      title="Formula: =Qty × Cost Rate (Click to inspect)"
                    >
                      {formatCurrency(item.closingValue || 0, currency)}
                    </td>

                    {/* White 2: Days Idle */}
                    <td
                      onClick={() =>
                        handleWhiteCellClick(
                          'Days Idle',
                          `= AsOfDate (${rules.asOfDate}) - Last Movement (${item.lastMovement})`,
                          'Days since this stock left the premises (sold to customer or issued to floor).'
                        )
                      }
                      className={`py-2 px-3 text-right border-r border-neutral-200 dark:border-neutral-800 cursor-help hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold tabular-nums ${
                        isDead ? 'text-rose-600 dark:text-rose-400' : isSlow ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                      title="Formula: =AsOfDate - LastMovement (Click to inspect)"
                    >
                      {item.daysIdle}d
                    </td>

                    {/* White 3: Status */}
                    <td
                      onClick={() =>
                        handleWhiteCellClick(
                          'Status',
                          `= IF(DaysIdle >= ${rules.deadThresholdDays}, "Dead", IF(DaysIdle >= ${rules.slowThresholdDays}, "Slow", "Moving"))`,
                          'Classifies movement cadence based on factory cutoff rules.'
                        )
                      }
                      className="py-2 px-3 text-center border-r border-neutral-200 dark:border-neutral-800 cursor-help hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title="Formula: =IF(DaysIdle >= 180, 'Dead', ...) (Click to inspect)"
                    >
                      <span className={`industrial-badge ${
                        isDead
                          ? 'industrial-badge-rose'
                          : isSlow
                          ? 'industrial-badge-amber'
                          : 'industrial-badge-emerald'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    {/* White 4: Rank */}
                    <td
                      onClick={() =>
                        handleWhiteCellClick(
                          'Value Rank',
                          '= RANK(Closing Value, All Values, DESC)',
                          'Sorts items from largest rupee value down to smallest.'
                        )
                      }
                      className="py-2 px-3 text-center border-r border-neutral-200 dark:border-neutral-800 cursor-help hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 tabular-nums font-mono"
                      title="Formula: =RANK(Closing Value) (Click to inspect)"
                    >
                      #{item.valueRank}
                    </td>

                    {/* White 5: Cumul % */}
                    <td
                      onClick={() =>
                        handleWhiteCellClick(
                          'Cumulative %',
                          '= RunningSum(Closing Value) / Total Stock',
                          'Tracks Pareto 80/20 share as we walk down the value rank.'
                        )
                      }
                      className="py-2 px-3 text-right border-r border-neutral-200 dark:border-neutral-800 cursor-help hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 tabular-nums font-mono font-semibold"
                      title="Formula: =RunningSum / Total (Click to inspect)"
                    >
                      {item.cumulativePercent}%
                    </td>

                    {/* White 6: ABC */}
                    <td
                      onClick={() =>
                        handleWhiteCellClick(
                          'ABC Class',
                          `= IF(Cumul% <= ${rules.classACutoff}%, "A", IF(Cumul% <= ${rules.classBCutoff}%, "B", "C"))`,
                          'Class A represents the top 80% of money. Class B next 15%. Class C is the tail 5%.'
                        )
                      }
                      className="py-2 px-3 text-center border-r border-neutral-200 dark:border-neutral-800 cursor-help hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold"
                      title="Formula: =ABC(Cumulative%) (Click to inspect)"
                    >
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

                    {/* White 7: Action */}
                    <td
                      onClick={() =>
                        handleWhiteCellClick(
                          'Action Recommendation',
                          '= ActionLookup(Status, ABC Class)',
                          'Action sentence for that row: Stop buying, discount, freeze, protect.'
                        )
                      }
                      className="py-2 px-3 border-r border-neutral-200 dark:border-neutral-800 cursor-help hover:bg-neutral-100 dark:hover:bg-neutral-800 font-sans text-xs"
                      title="Formula: Action derived from Status and ABC (Click to inspect)"
                    >
                      <span className={
                        isDead && item.abcClass === 'A'
                          ? 'font-bold text-rose-700 dark:text-rose-400'
                          : isDead
                          ? 'font-medium text-rose-800 dark:text-rose-400'
                          : isSlow
                          ? 'font-medium text-amber-800 dark:text-amber-400'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }>
                        {item.action}
                      </span>
                    </td>

                    {/* White 8: Dead Value (Helper) */}
                    <td
                      onClick={() =>
                        handleWhiteCellClick(
                          'Dead Value',
                          '= IF(Status="Dead", ClosingValue, 0)',
                          'Helper column used to calculate dead cash totals and rank top dead items.'
                        )
                      }
                      className="py-2 px-3 text-right border-r border-neutral-200 dark:border-neutral-800 cursor-help hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 tabular-nums"
                      title="Formula: =IF(Status='Dead', Value, 0) (Click to inspect)"
                    >
                      {item.deadValue && item.deadValue > 0 ? formatCurrency(item.deadValue, currency) : '—'}
                    </td>

                    {/* Delete button */}
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="text-neutral-400 hover:text-rose-500 p-1 rounded transition-colors"
                        title="Delete SKU row"
                        aria-label="Delete SKU row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>

          {/* Pagination & Catalog Size Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 text-xs text-neutral-600 dark:text-neutral-400 font-sans">
            <div className="flex items-center gap-2">
              <span>Showing</span>
              <strong className="text-neutral-900 dark:text-neutral-100 font-mono">
                {filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </strong>
              <span>to</span>
              <strong className="text-neutral-900 dark:text-neutral-100 font-mono">
                {pageSize === 0 ? filteredItems.length : Math.min(currentPage * pageSize, filteredItems.length)}
              </strong>
              <span>of</span>
              <strong className="text-neutral-900 dark:text-neutral-100 font-mono">
                {filteredItems.length}
              </strong>
              <span>SKUs</span>
              {filteredItems.length !== items.length && (
                <span className="text-[10px] text-neutral-400 font-mono">({items.length} total in catalog)</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="p-1 rounded bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-xs text-neutral-900 dark:text-neutral-100 cursor-pointer"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                  <option value={0}>All (Unlimited)</option>
                </select>
              </div>

              {pageSize > 0 && totalPages > 1 && (
                <div className="flex items-center gap-1 font-mono">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                  >
                    Prev
                  </button>
                  <span className="px-2 font-bold text-neutral-900 dark:text-neutral-100">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Add Row Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg max-w-md w-full p-5 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Add New SKU (Type in Yellow Inputs)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Enter the item details. All formula calculations (Closing value, idle days, status, ABC) will run automatically.
            </p>

            <form onSubmit={handleAddItemSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Item Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. RM-SS-304"
                  value={newItemData.itemCode}
                  onChange={(e) => setNewItemData({ ...newItemData, itemCode: e.target.value })}
                  className="mt-1 w-full text-xs p-2 rounded bg-amber-50/50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stainless Steel Round Bar 25mm"
                  value={newItemData.itemName}
                  onChange={(e) => setNewItemData({ ...newItemData, itemName: e.target.value })}
                  className="mt-1 w-full text-xs p-2 rounded bg-amber-50/50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Category
                  </label>
                  <select
                    value={newItemData.category}
                    onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value as any })}
                    className="mt-1 w-full text-xs p-2 rounded bg-amber-50/50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  >
                    <option value="Raw Material">Raw Material</option>
                    <option value="Finished Goods">Finished Goods</option>
                    <option value="Spares">Spares</option>
                    <option value="Consumable">Consumable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Qty on Hand
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItemData.qtyOnHand}
                    onChange={(e) => setNewItemData({ ...newItemData, qtyOnHand: Number(e.target.value) })}
                    className="mt-1 w-full text-xs p-2 rounded bg-amber-50/50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Cost Rate (₹)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    value={newItemData.costRate}
                    onChange={(e) => setNewItemData({ ...newItemData, costRate: Number(e.target.value) })}
                    className="mt-1 w-full text-xs p-2 rounded bg-amber-50/50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Last Movement Date
                  </label>
                  <input
                    type="date"
                    value={newItemData.lastMovement}
                    onChange={(e) => setNewItemData({ ...newItemData, lastMovement: e.target.value })}
                    className="mt-1 w-full text-xs p-2 rounded bg-amber-50/50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded shadow-sm"
                >
                  Add to Engine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Smart Tally & Excel CSV Importer Modal */}
      {showImportModal && (
        <SmartTallyImporterModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={(importedItems) => {
            onBulkImport(importedItems);
            setShowImportModal(false);
          }}
        />
      )}
    </div>
  );
};
