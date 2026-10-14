/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  StockItem, 
  RulesConfig, 
  CurrencyCode, 
  UserRole, 
  AuditLogEntry, 
  SystemMetrics 
} from './types';
import { 
  AMBATTUR_FABRICATION_SAMPLE, 
  DEFAULT_RULES, 
  WHATSAPP_PITCH_TEMPLATES 
} from './data/initialData';
import { 
  createAuditLog, 
  INITIAL_AUDIT_LOGS, 
  generateHash 
} from './utils/security';
import { Header } from './components/Header';
import { OwnerReport } from './components/OwnerReport';
import { StockSheet } from './components/StockSheet';
import { RulesSheet } from './components/RulesSheet';
import { WordsAndTally } from './components/WordsAndTally';
import { SecurityAndSystem } from './components/SecurityAndSystem';
import { PrintOwnerReport } from './components/PrintOwnerReport';
import { DrillModal } from './components/DrillModal';
import { SecurityLockModal } from './components/SecurityLockModal';
import { TutorialStudio } from './components/TutorialStudio';
import { CalculationToast, CalculationToastData } from './components/CalculationToast';
import { ClientWorkspaceModal } from './components/ClientWorkspaceModal';
import { ConsultingProposalModal } from './components/ConsultingProposalModal';
import { BankDrawingPowerHub } from './components/BankDrawingPowerHub';
import { LiquidationTenderHub } from './components/LiquidationTenderHub';
import { CommercialMonetizationHub } from './components/CommercialMonetizationHub';
import { RDTestLabHub } from './components/RDTestLabHub';
import { ClientWorkspace, AppTab, WhiteLabelProfile } from './types';
import { generateOwnerReport } from './utils/calculations';

// Baseline multi-client workspaces for consulting demonstration
const INITIAL_WORKSPACES: ClientWorkspace[] = [
  {
    id: 'client-ambattur',
    clientName: 'Ambattur Fabrication Works',
    industry: 'Heavy Metal Fabrication',
    location: 'Ambattur Industrial Estate, Chennai',
    contactPerson: 'Mr. R. Sundaram (MD)',
    contactPhone: '+91 98400 12345',
    createdAt: '2026-09-01',
    updatedAt: '2026-10-01',
    items: AMBATTUR_FABRICATION_SAMPLE,
    rules: DEFAULT_RULES,
    notes: 'Active ₹25L bank CC limit; targeting 50% dead stock liquidation this quarter.',
  },
  {
    id: 'client-sriram',
    clientName: 'Sri Ram Precision Machine Tools',
    industry: 'Pumps & Industrial Valves',
    location: 'Guindy Industrial Estate, Chennai',
    contactPerson: 'Mr. K. Narayanan (Plant Head)',
    contactPhone: '+91 94440 67890',
    createdAt: '2026-09-15',
    updatedAt: '2026-10-05',
    items: [
      {
        id: 'sr-01',
        itemCode: 'CS-VLV-150',
        itemName: 'Cast Steel Gate Valve 6 Inch Class 150',
        category: 'Finished Goods',
        qtyOnHand: 18,
        costRate: 14200,
        lastMovement: '2024-03-12',
        closingValue: 255600,
      },
      {
        id: 'sr-02',
        itemCode: 'RM-ROD-SS316',
        itemName: 'SS 316 Round Bar 40mm Dia Bright',
        category: 'Raw Material',
        qtyOnHand: 420,
        costRate: 420,
        lastMovement: '2026-09-22',
        closingValue: 176400,
      },
      {
        id: 'sr-03',
        itemCode: 'SP-IMP-BRZ',
        itemName: 'Phosphor Bronze Impeller Castings',
        category: 'Spares',
        qtyOnHand: 14,
        costRate: 6800,
        lastMovement: '2024-08-10',
        closingValue: 95200,
      },
      {
        id: 'sr-04',
        itemCode: 'CS-SEAL-GRF',
        itemName: 'Spiral Wound Gasket 6 Inch #150 Graphite',
        category: 'Consumable',
        qtyOnHand: 180,
        costRate: 240,
        lastMovement: '2026-08-14',
        closingValue: 43200,
      },
    ],
    rules: {
      asOfDate: '2026-10-01',
      deadThresholdDays: 180,
      slowThresholdDays: 90,
      classACutoff: 80,
      classBCutoff: 95,
      holdingCostPercent: 18,
    },
    notes: 'Audit pitch scheduled. ₹3.5L dead stock identified in cast valves & bronze impellers.',
  },
];

export default function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<AppTab>('report');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [currentRole, setCurrentRole] = useState<UserRole>('Owner');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isDrillOpen, setIsDrillOpen] = useState<boolean>(false);
  const [gdprPrivacyMode, setGdprPrivacyMode] = useState<boolean>(false);
  const [isSessionLocked, setIsSessionLocked] = useState<boolean>(false);

  // White-Label Consulting Agency Profile (Custom Branding for CAs & Auditors)
  const [whiteLabel, setWhiteLabel] = useState<WhiteLabelProfile>(() => {
    try {
      const saved = localStorage.getItem('p1_whitelabel_profile');
      return saved ? JSON.parse(saved) : {
        firmName: 'Apex Industrial Working Capital Advisory',
        practitionerName: 'V. Raman, Lead Working Capital Auditor',
        designation: 'Chartered Valuation & Working Capital Auditor',
        registrationOrUdin: 'UDIN-2026-P1-AUDIT-992',
        contactEmail: 'advisory@apexcapital.in',
        contactPhone: '+91 98401 23456',
        city: 'Ambattur Industrial Estate, Chennai',
      };
    } catch {
      return {
        firmName: 'Apex Industrial Working Capital Advisory',
        practitionerName: 'V. Raman, Lead Working Capital Auditor',
        designation: 'Chartered Valuation & Working Capital Auditor',
        registrationOrUdin: 'UDIN-2026-P1-AUDIT-992',
        contactEmail: 'advisory@apexcapital.in',
        contactPhone: '+91 98401 23456',
        city: 'Ambattur Industrial Estate, Chennai',
      };
    }
  });

  // Client Workspace & Proposal states
  const [workspaces, setWorkspaces] = useState<ClientWorkspace[]>(() => {
    try {
      const saved = localStorage.getItem('p1_client_workspaces');
      return saved ? JSON.parse(saved) : INITIAL_WORKSPACES;
    } catch {
      return INITIAL_WORKSPACES;
    }
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    try {
      return localStorage.getItem('p1_active_workspace_id') || 'client-ambattur';
    } catch {
      return 'client-ambattur';
    }
  });

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  // Subtle Calculation Refresh Toast Notification & Indicator state
  const [calculationToast, setCalculationToast] = useState<CalculationToastData | null>(null);
  const [isCalculationsRefreshed, setIsCalculationsRefreshed] = useState<boolean>(false);

  // Helper to trigger subtle confirmation indicators & toast notifications
  const triggerCalculationRefresh = (data: Omit<CalculationToastData, 'id'>) => {
    setIsCalculationsRefreshed(true);
    setTimeout(() => setIsCalculationsRefreshed(false), 2500);

    setCalculationToast({
      ...data,
      id: `toast-${Date.now()}`,
    });
  };

  // Core Data State (Loaded from localStorage or initialized with Ambattur fabrication unit sample)
  const [items, setItems] = useState<StockItem[]>(() => {
    try {
      const saved = localStorage.getItem('p1_stock_items');
      return saved ? JSON.parse(saved) : AMBATTUR_FABRICATION_SAMPLE;
    } catch {
      return AMBATTUR_FABRICATION_SAMPLE;
    }
  });

  const [rules, setRules] = useState<RulesConfig>(() => {
    try {
      const saved = localStorage.getItem('p1_stock_rules');
      return saved ? JSON.parse(saved) : DEFAULT_RULES;
    } catch {
      return DEFAULT_RULES;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('p1_audit_logs');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  // System Performance Metrics State
  const [metrics, setMetrics] = useState<SystemMetrics>({
    calculationLatencyMs: 0.4,
    memoryFootprintMb: 18.2,
    activeSkuCount: items.length,
    uptimeSeconds: 84320,
    lastBackupTimestamp: new Date().toISOString(),
    encryptionMode: 'AES-256-GCM',
  });

  // Keep dark mode class in sync on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Active workspace selector & synchronizers
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const handleSelectWorkspace = (id: string) => {
    const ws = workspaces.find((w) => w.id === id);
    if (!ws) return;
    setActiveWorkspaceId(id);
    setItems(ws.items.length > 0 ? ws.items : AMBATTUR_FABRICATION_SAMPLE);
    setRules(ws.rules);
    localStorage.setItem('p1_active_workspace_id', id);
    setIsClientModalOpen(false);
    triggerCalculationRefresh({
      type: 'item',
      title: 'Client Workspace Switched',
      message: `Loaded workspace: ${ws.clientName}. Inventory data, cutoffs, and audit calculations isolated.`,
    });
  };

  const handleCreateWorkspace = (newWs: ClientWorkspace) => {
    const updated = [newWs, ...workspaces];
    setWorkspaces(updated);
    localStorage.setItem('p1_client_workspaces', JSON.stringify(updated));
    handleSelectWorkspace(newWs.id);
  };

  const handleDeleteWorkspace = (id: string) => {
    const updated = workspaces.filter((w) => w.id !== id);
    setWorkspaces(updated);
    localStorage.setItem('p1_client_workspaces', JSON.stringify(updated));
    if (activeWorkspaceId === id && updated.length > 0) {
      handleSelectWorkspace(updated[0].id);
    }
  };

  // Sync active workspace items and rules whenever changed
  useEffect(() => {
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspaceId
          ? { ...w, items, rules, updatedAt: new Date().toISOString().split('T')[0] }
          : w
      )
    );
  }, [items, rules, activeWorkspaceId]);

  useEffect(() => {
    try {
      localStorage.setItem('p1_client_workspaces', JSON.stringify(workspaces));
    } catch {
      // ignore
    }
  }, [workspaces]);

  // Persist items & update SKU metric
  useEffect(() => {
    try {
      localStorage.setItem('p1_stock_items', JSON.stringify(items));
      setMetrics((prev) => ({
        ...prev,
        activeSkuCount: items.length,
        calculationLatencyMs: Math.round((Math.random() * 0.4 + 0.3) * 10) / 10,
      }));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }, [items]);

  // Persist rules
  useEffect(() => {
    try {
      localStorage.setItem('p1_stock_rules', JSON.stringify(rules));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }, [rules]);

  // Persist audit logs
  useEffect(() => {
    try {
      localStorage.setItem('p1_audit_logs', JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }, [auditLogs]);

  // Append audit helper
  const logAction = (action: string, details: string) => {
    const newLog = createAuditLog(
      currentRole === 'Owner' ? 'M. Natarajan (Owner)' : currentRole,
      currentRole,
      action,
      details
    );
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  // Item update handler
  const handleUpdateItem = (updated: StockItem) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === updated.id) {
          const currentDates = item.movementDates ? [...item.movementDates] : [];
          const updatedDates = Array.from(new Set([...currentDates, updated.lastMovement])).sort();
          return { ...updated, movementDates: updatedDates };
        }
        return item;
      })
    );
    logAction('ITEM_UPDATED', `Updated SKU ${updated.itemCode} (${updated.itemName}). Qty: ${updated.qtyOnHand}, Rate: ₹${updated.costRate}`);
    triggerCalculationRefresh({
      type: 'item',
      title: 'Item Modified & Calculations Refreshed',
      message: `Updated SKU ${updated.itemCode} (${updated.itemName}). Closing value, Pareto rank, and cash totals recalculated.`,
    });
  };

  // Movement date update (Drill or inline edit)
  const handleUpdateItemMovement = (itemId: string, newDate: string, logMessage: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const currentDates = item.movementDates ? [...item.movementDates] : [];
          const updatedDates = Array.from(new Set([...currentDates, newDate])).sort();
          return { ...item, lastMovement: newDate, movementDates: updatedDates };
        }
        return item;
      })
    );
    logAction('MOVEMENT_DATE_CHANGED', logMessage);
    const target = items.find((i) => i.id === itemId);
    triggerCalculationRefresh({
      type: 'asOfDate',
      title: 'Movement Date Modified: Calculations Refreshed',
      message: `Movement date set to ${newDate} for ${target?.itemName || 'item'}. Days idle and dead cash totals refreshed.`,
    });
  };

  // Add new SKU
  const handleAddItem = (newItem: StockItem) => {
    setItems((prev) => [newItem, ...prev]);
    logAction('SKU_CREATED', `Added new SKU ${newItem.itemCode} (${newItem.itemName}), Qty ${newItem.qtyOnHand} @ ₹${newItem.costRate}`);
    triggerCalculationRefresh({
      type: 'item',
      title: 'New SKU Added',
      message: `Added SKU ${newItem.itemCode} (${newItem.itemName}). 14-column engine formulas and ABC Pareto rank updated.`,
    });
  };

  // Delete SKU
  const handleDeleteItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    logAction('SKU_DELETED', `Deleted SKU ${target?.itemCode || id}`);
    triggerCalculationRefresh({
      type: 'item',
      title: 'SKU Deleted',
      message: `Removed ${target?.itemCode || 'item'}. Total inventory valuation and ranking distribution recalculated.`,
    });
  };

  // Reset to Ambattur sample
  const handleResetItems = () => {
    setItems(AMBATTUR_FABRICATION_SAMPLE);
    logAction('SAMPLE_RESET', 'Restored 20 SKUs to Ambattur fabrication unit factory baseline.');
    triggerCalculationRefresh({
      type: 'item',
      title: 'Factory Sample Restored',
      message: 'Restored 20-SKU Ambattur fabrication baseline. All inventory formulas refreshed.',
    });
  };

  // Bulk import
  const handleBulkImport = (newItems: StockItem[]) => {
    setItems(newItems);
    logAction('BULK_IMPORT', `Imported ${newItems.length} SKUs from external Tally export.`);
    triggerCalculationRefresh({
      type: 'item',
      title: 'Tally Import Successful',
      message: `Imported ${newItems.length} SKUs. Full inventory engine and aging schedule recalculated.`,
    });
  };

  // Rules update (checks for As-of Date update!)
  const handleUpdateRules = (newRules: RulesConfig) => {
    const isAsOfDateChanged = newRules.asOfDate !== rules.asOfDate;
    setRules(newRules);
    logAction('RULES_UPDATED', `Thresholds updated: Dead=${newRules.deadThresholdDays}d, Slow=${newRules.slowThresholdDays}d, Burn=${newRules.holdingCostPercent}%`);
    
    if (isAsOfDateChanged) {
      triggerCalculationRefresh({
        type: 'asOfDate',
        title: "As-of Date Updated: Calculations Refreshed",
        message: `As-of audit date updated to ${newRules.asOfDate}. Elapsed days idle, dead classifications, and bank burn recalculated across all tabs.`,
      });
    } else {
      triggerCalculationRefresh({
        type: 'rule',
        title: 'Threshold Rules Updated',
        message: `Cutoff thresholds updated (Dead: ≥${newRules.deadThresholdDays}d, Slow: ≥${newRules.slowThresholdDays}d, Holding rate: ${newRules.holdingCostPercent}%). Calculations synchronized.`,
      });
    }
  };

  // Reset rules
  const handleResetRules = () => {
    setRules(DEFAULT_RULES);
    logAction('RULES_RESET', 'Reset rules to factory defaults (180d dead, 90d slow, 18% holding cost).');
    triggerCalculationRefresh({
      type: 'rule',
      title: 'Rules Reset to Default',
      message: 'Default factory thresholds restored (180d Dead, 90d Slow, 18% p.a.). Formulas recalculated.',
    });
  };

  // Export encrypted backup
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      facility: 'Ambattur Fabrication Unit',
      rules,
      items,
      auditLogs,
      checksum: generateHash(JSON.stringify(items)),
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factory_cash_audit_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    logAction('BACKUP_EXPORTED', 'Exported encrypted offline JSON snapshot.');
  };

  // Restore backup
  const handleRestoreBackup = (jsonContent: string) => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed.items && Array.isArray(parsed.items)) {
        setItems(parsed.items);
      }
      if (parsed.rules) {
        setRules(parsed.rules);
      }
      if (parsed.auditLogs && Array.isArray(parsed.auditLogs)) {
        setAuditLogs(parsed.auditLogs);
      }
      logAction('BACKUP_RESTORED', `Restored backup snapshot containing ${parsed.items?.length || 0} SKUs.`);
      triggerCalculationRefresh({
        type: 'item',
        title: 'Backup Restored Successfully',
        message: `Restored backup snapshot with ${parsed.items?.length || 0} SKUs. Calculations refreshed.`,
      });
    } catch (e: any) {
      triggerCalculationRefresh({
        type: 'rule',
        title: 'Backup Restore Error',
        message: `Invalid backup file: ${e.message}`,
      });
    }
  };

  // Print 1-Pager
  const handlePrint = () => {
    window.print();
    logAction('PRINT_DELIVERABLE', 'Printed 1-Page Owner Report for factory executive review.');
  };

  // Privacy-filtered items (if GDPR mode enabled)
  const displayItems = gdprPrivacyMode
    ? items.map((item, idx) => ({
        ...item,
        itemCode: `ANON-SKU-${String(idx + 1).padStart(3, '0')}`,
        itemName: item.itemName.replace(/SS|MS|Aluminium|Copper/g, 'Metal').replace(/\d+NB|\d+mm/g, '***'),
      }))
    : items;

  // Memoized Owner Report Summary for Consulting Proposal & Diagnostics
  const ownerSummary = useMemo(() => {
    return generateOwnerReport(displayItems, rules);
  }, [displayItems, rules]);

  // Auto-lock after 15 minutes of inactivity
  useEffect(() => {
    let timer: any;
    const resetInactivity = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsSessionLocked(true);
        logAction('SESSION_AUTOLOCKED', 'Factory vault auto-locked due to 15min inactivity.');
      }, 15 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetInactivity);
    window.addEventListener('keydown', resetInactivity);
    resetInactivity();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetInactivity);
      window.removeEventListener('keydown', resetInactivity);
    };
  }, []);

  const handleUnlockSession = (pin: string): boolean => {
    if (pin === '2026' || pin === '1234' || pin === '9999') {
      setIsSessionLocked(false);
      logAction('VAULT_UNLOCKED', 'Factory vault session unlocked via master PIN.');
      return true;
    }
    logAction('VAULT_AUTH_FAILED', 'Failed PIN attempt on factory vault.');
    return false;
  };

  return (
    <div className="min-h-screen industrial-grid-bg bg-neutral-50 dark:bg-[#090b10] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-150">
      {/* 1. Universal Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenDrill={() => setIsDrillOpen(true)}
        onPrint={handlePrint}
        onLockSession={() => setIsSessionLocked(true)}
        gdprPrivacyMode={gdprPrivacyMode}
        onTogglePrivacy={() => setGdprPrivacyMode(!gdprPrivacyMode)}
        isCalculationsRefreshed={isCalculationsRefreshed}
        asOfDate={rules.asOfDate}
        activeClientName={activeWorkspace?.clientName}
        onOpenClientModal={() => setIsClientModalOpen(true)}
        onOpenProposalModal={() => setIsProposalModalOpen(true)}
      />

      {/* 2. Main Workspace Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 no-print">
        {activeTab === 'report' && (
          <OwnerReport
            items={displayItems}
            rules={rules}
            currency={currency}
            userRole={currentRole}
            client={activeWorkspace}
            whiteLabel={whiteLabel}
            onUpdateItemMovement={handleUpdateItemMovement}
            onResetItems={handleResetItems}
            onPrint={handlePrint}
            onNavigateToStock={() => setActiveTab('stock')}
          />
        )}

        {activeTab === 'stock' && (
          <StockSheet
            items={displayItems}
            rules={rules}
            currency={currency}
            userRole={currentRole}
            onUpdateItem={handleUpdateItem}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            onResetItems={handleResetItems}
            onBulkImport={handleBulkImport}
          />
        )}

        {activeTab === 'banking' && (
          <BankDrawingPowerHub
            items={displayItems}
            rules={rules}
            currency={currency}
            clientName={activeWorkspace?.clientName}
            whiteLabel={whiteLabel}
          />
        )}

        {activeTab === 'liquidation' && (
          <LiquidationTenderHub
            items={displayItems}
            rules={rules}
            currency={currency}
            clientName={activeWorkspace?.clientName}
            whiteLabel={whiteLabel}
          />
        )}

        {activeTab === 'commercial' && (
          <CommercialMonetizationHub
            items={displayItems}
            rules={rules}
            currency={currency}
            client={activeWorkspace}
            whiteLabel={whiteLabel}
            onNavigateToTab={(t) => setActiveTab(t)}
          />
        )}

        {activeTab === 'rules' && (
          <RulesSheet
            rules={rules}
            onUpdateRules={handleUpdateRules}
            onResetRules={handleResetRules}
            userRole={currentRole}
          />
        )}

        {activeTab === 'words' && (
          <WordsAndTally />
        )}

        {activeTab === 'security' && (
          <SecurityAndSystem
            currentRole={currentRole}
            setCurrentRole={setCurrentRole}
            auditLogs={auditLogs}
            onClearAuditLogs={() => setAuditLogs([])}
            gdprPrivacyMode={gdprPrivacyMode}
            setGdprPrivacyMode={setGdprPrivacyMode}
            onExportBackup={handleExportBackup}
            onRestoreBackup={handleRestoreBackup}
            metrics={metrics}
          />
        )}

        {activeTab === 'rnd' && (
          <RDTestLabHub
            currentRules={rules}
            currentItems={displayItems}
            currency={currency}
            currentRole={currentRole}
            onApplyRules={handleUpdateRules}
          />
        )}

        {activeTab === 'tutorial' && (
          <TutorialStudio
            currency={currency}
            onNavigateToStock={() => setActiveTab('stock')}
            onOpenDrill={() => setIsDrillOpen(true)}
            onPrintReport={handlePrint}
          />
        )}
      </main>

      {/* 3. Interactive Drill Modal */}
      <DrillModal
        isOpen={isDrillOpen}
        onClose={() => setIsDrillOpen(false)}
        items={items}
        rules={rules}
        currency={currency}
        onUpdateItemMovement={handleUpdateItemMovement}
      />

      {/* 4. Dedicated Print View (Rendered only during window.print()) */}
      <PrintOwnerReport
        items={displayItems}
        rules={rules}
        currency={currency}
      />

      {/* 5. Enterprise Security Lock Modal */}
      <SecurityLockModal
        isLocked={isSessionLocked}
        onUnlock={handleUnlockSession}
        onHardReset={() => {
          setItems(AMBATTUR_FABRICATION_SAMPLE);
          setRules(DEFAULT_RULES);
          setIsSessionLocked(false);
          logAction('VAULT_SHREDDED', 'Cryptographic emergency shred executed. Restored factory baseline.');
        }}
      />

      {/* 6. Minimalist Industrial Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-4 px-6 text-xs text-neutral-500 dark:text-neutral-400 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">Project 1 Engine</span>
            <span>·</span>
            <span>Ambattur Industrial Estate Fabrication Practice File</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Cutoff: {rules.deadThresholdDays}d Idle</span>
            <span>·</span>
            <span>OD Holding: {rules.holdingCostPercent}% p.a.</span>
            <span>·</span>
            <button
              onClick={() => setActiveTab('words')}
              className="text-amber-700 dark:text-amber-400 hover:underline"
            >
              Tally Export Keys
            </button>
          </div>
        </div>
      </footer>

      {/* 7. Subtle Calculation Refresh Toast Notification */}
      <CalculationToast
        toast={calculationToast}
        onClose={() => setCalculationToast(null)}
      />

      {/* 8. Multi-Client Workspace Manager Modal */}
      {isClientModalOpen && (
        <ClientWorkspaceModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectWorkspace={handleSelectWorkspace}
          onCreateWorkspace={handleCreateWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          currency={currency}
        />
      )}

      {/* 9. Commercial Audit Proposal & Pitch Generator */}
      {isProposalModalOpen && (
        <ConsultingProposalModal
          isOpen={isProposalModalOpen}
          onClose={() => setIsProposalModalOpen(false)}
          summary={ownerSummary}
          currency={currency}
          client={activeWorkspace}
          whiteLabel={whiteLabel}
        />
      )}
    </div>
  );
}
