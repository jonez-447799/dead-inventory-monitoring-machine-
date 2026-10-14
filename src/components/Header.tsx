import React, { useState, useRef, useEffect } from 'react';
import { CurrencyCode, UserRole, AppTab } from '../types';
import { CURRENCY_CONFIGS } from '../utils/calculations';
import { 
  FileSpreadsheet, 
  FileText, 
  Sliders, 
  BookOpen, 
  ShieldCheck, 
  Printer, 
  PlayCircle,
  Sun,
  Moon,
  Lock,
  ChevronDown,
  GraduationCap,
  Building2,
  Landmark,
  Flame,
  DollarSign,
  Wrench,
  FlaskConical
} from 'lucide-react';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
  onOpenDrill: () => void;
  onPrint: () => void;
  onLockSession?: () => void;
  gdprPrivacyMode?: boolean;
  onTogglePrivacy?: () => void;
  isCalculationsRefreshed?: boolean;
  asOfDate?: string;
  activeClientName?: string;
  onOpenClientModal?: () => void;
  onOpenProposalModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  currentRole,
  setCurrentRole,
  darkMode,
  setDarkMode,
  onOpenDrill,
  onPrint,
  onLockSession,
  asOfDate,
  activeClientName,
  onOpenClientModal,
  onOpenProposalModal,
}) => {
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  const isToolTabActive = ['rules', 'words', 'security', 'tutorial', 'rnd'].includes(activeTab);

  // Close tools dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 dark:border-neutral-800/80 glass-panel no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand & Context */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-700/80 bg-neutral-950 text-amber-400 font-mono font-bold flex items-center justify-center text-xs tracking-wider shadow-sm ring-1 ring-white/10">
              P1
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  Project 1 <span className="font-normal text-neutral-400 dark:text-neutral-500">/</span> Cash Engine
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">{activeClientName || 'Ambattur Fabrication'}</span>
                <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-600">·</span>
                <span>As-of {asOfDate || '01-Oct-2026'}</span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation - 5 Core Operational Tabs + Tools Dropdown */}
          <nav className="hidden lg:flex items-center gap-1 bg-neutral-100/80 dark:bg-neutral-900/80 p-1 rounded-lg border border-neutral-200/80 dark:border-neutral-800/80">
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'report'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs border border-neutral-200/60 dark:border-neutral-700/60'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-white/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              Owner Report
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'stock'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-white/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              Stock Engine
            </button>

            <button
              onClick={() => setActiveTab('banking')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'banking'
                  ? 'bg-white dark:bg-neutral-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-white/50 dark:hover:bg-neutral-800/50'
              }`}
              title="Bank Drawing Power (DP) Optimizer and Monthly Form A Stock Statement"
            >
              <Landmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
              Bank DP &amp; OD
            </button>

            <button
              onClick={() => setActiveTab('liquidation')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'liquidation'
                  ? 'bg-white dark:bg-neutral-800 text-amber-700 dark:text-amber-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-white/50 dark:hover:bg-neutral-800/50'
              }`}
              title="Vendor Buyback Letters and Sealed-Bid Scrap Tenders"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
              Liquidation Tender
            </button>

            <button
              onClick={() => setActiveTab('commercial')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'commercial'
                  ? 'bg-white dark:bg-neutral-800 text-amber-800 dark:text-amber-300 font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-white/50 dark:hover:bg-neutral-800/50'
              }`}
              title="Commercial Engine: SaaS ROI & Turnaround Audit Pricing"
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Monetization &amp; ROI
            </button>

            <button
              onClick={() => setActiveTab('rnd')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'rnd'
                  ? 'bg-white dark:bg-neutral-800 text-purple-700 dark:text-purple-300 font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-white/50 dark:hover:bg-neutral-800/50'
              }`}
              title="R&D Test Bench: Unit Tests, Stress Testing, Monte Carlo Sensitivity & Formula Verification"
            >
              <FlaskConical className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>R&amp;D Lab</span>
              <span className="text-[10px] px-1 py-0.2 rounded font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">18 PASS</span>
            </button>

            {/* Tools Dropdown */}
            <div className="relative" ref={toolsMenuRef}>
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 whitespace-nowrap ${
                  isToolTabActive
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
                aria-expanded={toolsOpen}
              >
                <Wrench className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                <span>Tools</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {toolsOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl py-1 z-50 text-xs">
                  <button
                    onClick={() => {
                      setActiveTab('rnd');
                      setToolsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors ${
                      activeTab === 'rnd' ? 'font-semibold text-purple-600 dark:text-purple-400' : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>R&amp;D Test Bench</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('rules');
                      setToolsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors ${
                      activeTab === 'rules' ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Cutoff Rules</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('words');
                      setToolsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors ${
                      activeTab === 'words' ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Tally XML Guide</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('security');
                      setToolsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors ${
                      activeTab === 'security' ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Security &amp; API</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('tutorial');
                      setToolsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-colors ${
                      activeTab === 'tutorial' ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Tutorial Studio</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3: Actions & Utility Controls */}
          <div className="flex items-center gap-2">
            
            {/* Currency Selector */}
            <div className="relative">
              <select
                aria-label="Select currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="appearance-none bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800/80 text-neutral-800 dark:text-neutral-200 text-xs font-mono font-medium rounded-lg pl-2.5 pr-6 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs backdrop-blur-xs"
              >
                {(Object.keys(CURRENCY_CONFIGS) as CurrencyCode[]).map((c) => (
                  <option key={c} value={c}>
                    {c} ({CURRENCY_CONFIGS[c].symbol.trim()})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-1.5 top-2.5 pointer-events-none" />
            </div>

            {/* Client Workspace Button */}
            {onOpenClientModal && (
              <button
                onClick={onOpenClientModal}
                className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800/80 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-2xs backdrop-blur-xs"
                title="Switch client audit workspaces"
              >
                <Building2 className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                <span className="hidden xl:inline max-w-[120px] truncate">{activeClientName || 'Workspace'}</span>
              </button>
            )}

            {/* Quick Drill Interactive Test */}
            <button
              onClick={onOpenDrill}
              className="px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
              title="Interactive simulation: Test date change on SS flange 150NB"
            >
              <PlayCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">The Drill</span>
            </button>

            {/* Primary Action: Proposal Modal */}
            {onOpenProposalModal && (
              <button
                onClick={onOpenProposalModal}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 dark:bg-amber-500 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                title="Generate Client Proposal & Engagement Letter"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Proposal</span>
              </button>
            )}

            {/* Print 1-Pager CTA */}
            <button
              onClick={onPrint}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Print 1-Page Owner Report"
              aria-label="Print report"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Role Switcher */}
            <div className="relative hidden xl:block">
              <select
                aria-label="Active User Role"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="appearance-none bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800/80 text-neutral-700 dark:text-neutral-300 text-xs font-medium rounded-lg pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer shadow-2xs backdrop-blur-xs font-mono"
              >
                <option value="Owner">Role: Owner</option>
                <option value="Plant Head">Role: Plant Head</option>
                <option value="Accounts">Role: Accounts</option>
                <option value="Auditor">Role: Auditor</option>
                <option value="Read Only">Role: Read Only</option>
              </select>
              <Lock className="w-3 h-3 text-neutral-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Lock Session Quick Action */}
            {onLockSession && (
              <button
                onClick={onLockSession}
                className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Lock Session (Vault)"
                aria-label="Lock Session"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Strip */}
        <div className="flex lg:hidden items-center py-2 border-t border-neutral-200 dark:border-neutral-800 overflow-x-auto gap-1 text-xs">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'report' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Report
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'stock' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Stock
          </button>
          <button
            onClick={() => setActiveTab('banking')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'banking' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Bank DP
          </button>
          <button
            onClick={() => setActiveTab('liquidation')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'liquidation' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Liquidation
          </button>
          <button
            onClick={() => setActiveTab('commercial')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'commercial' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Commercial
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'rules' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Rules
          </button>
          <button
            onClick={() => setActiveTab('words')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'words' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Tally XML
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'security' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('rnd')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'rnd' ? 'bg-purple-600 text-white font-semibold' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            R&amp;D Lab
          </button>
          <button
            onClick={() => setActiveTab('tutorial')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'tutorial' ? 'bg-amber-500 text-neutral-950 font-bold' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Tutorial
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;
