import React, { useState } from 'react';
import { ClientWorkspace, StockItem, RulesConfig } from '../types';
import { 
  Building2, 
  Plus, 
  Check, 
  Trash2, 
  X, 
  FolderOpen, 
  Briefcase, 
  Calendar, 
  FileText, 
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface ClientWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: ClientWorkspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (workspace: ClientWorkspace) => void;
  onDeleteWorkspace: (id: string) => void;
  currency: string;
}

export const ClientWorkspaceModal: React.FC<ClientWorkspaceModalProps> = ({
  isOpen,
  onClose,
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onDeleteWorkspace,
  currency,
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newIndustry, setNewIndustry] = useState('Heavy Fabrication');
  const [newLocation, setNewLocation] = useState('Ambattur Industrial Estate');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newNotes, setNewNotes] = useState('');

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newWorkspace: ClientWorkspace = {
      id: `client-${Date.now()}`,
      clientName: newClientName.trim(),
      industry: newIndustry,
      location: newLocation,
      contactPerson: newContactPerson.trim(),
      notes: newNotes.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      items: [], // empty workspace ready for their Tally file
      rules: {
        asOfDate: new Date().toISOString().split('T')[0],
        deadThresholdDays: 180,
        slowThresholdDays: 90,
        classACutoff: 80,
        classBCutoff: 95,
        holdingCostPercent: 18,
      },
    };

    onCreateWorkspace(newWorkspace);
    setIsCreatingNew(false);
    setNewClientName('');
    setNewContactPerson('');
    setNewNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-panel rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col my-8 border border-neutral-300 dark:border-neutral-700/80">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>Client Audit Workspaces</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Data Isolation
                </span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Manage separate factory audits. Keep client inventory rates, dates, and reports strictly isolated.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 flex-1">
          {isCreatingNew ? (
            <form onSubmit={handleCreateSubmit} className="space-y-3 p-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-amber-500" />
                  <span>Create New Client Workspace</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold block text-neutral-700 dark:text-neutral-300 mb-1">
                    Company / Factory Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sri Ram Precision Machine Tools"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-neutral-700 dark:text-neutral-300 mb-1">
                    Industry Sector
                  </label>
                  <select
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Heavy Metal Fabrication">Heavy Metal Fabrication</option>
                    <option value="Precision CNC Machining">Precision CNC Machining</option>
                    <option value="Valve & Pump Manufacturing">Valve & Pump Manufacturing</option>
                    <option value="Automotive Component Tier-2">Automotive Component Tier-2</option>
                    <option value="Electrical Panels & Switchgear">Electrical Panels & Switchgear</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block text-neutral-700 dark:text-neutral-300 mb-1">
                    Industrial Cluster / City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ambattur, Chennai"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-neutral-700 dark:text-neutral-300 mb-1">
                    Owner / MD Contact Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. K. Sundaram (Managing Director)"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    className="w-full p-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block text-xs text-neutral-700 dark:text-neutral-300 mb-1">
                  Audit Notes / Preliminary Goal
                </label>
                <input
                  type="text"
                  placeholder="e.g. Audit ₹15L bank CC limit; MD wants to liquidate non-moving stainless steel stock"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Workspace</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                Active Client Workspaces ({workspaces.length})
              </span>
              <button
                onClick={() => setIsCreatingNew(true)}
                className="px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 border border-amber-300 dark:border-amber-800 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Client Audit</span>
              </button>
            </div>
          )}

          {/* Workspaces List */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {workspaces.map((ws) => {
              const isActive = ws.id === activeWorkspaceId;
              const totalItems = ws.items.length;
              const totalVal = ws.items.reduce((sum, i) => sum + (i.closingValue || 0), 0);

              return (
                <div
                  key={ws.id}
                  onClick={() => onSelectWorkspace(ws.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 bg-white dark:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100 truncate">
                          {ws.clientName}
                        </span>
                        {isActive && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-600 text-white shrink-0">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                        <span>{ws.industry}</span>
                        <span>·</span>
                        <span>{ws.location}</span>
                        {ws.contactPerson && (
                          <>
                            <span>·</span>
                            <span className="text-neutral-700 dark:text-neutral-300">{ws.contactPerson}</span>
                          </>
                        )}
                      </div>

                      {ws.notes && (
                        <div className="text-[10px] text-amber-700 dark:text-amber-400 italic mt-1 truncate">
                          Note: {ws.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right font-mono">
                      <div className="font-bold text-neutral-900 dark:text-neutral-100">
                        {totalItems} SKUs
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        ₹{totalVal.toLocaleString()}
                      </div>
                    </div>

                    {workspaces.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete workspace "${ws.clientName}"?`)) {
                            onDeleteWorkspace(ws.id);
                          }
                        }}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Delete Workspace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between text-xs text-neutral-500">
          <span>Client data is stored securely and isolated in local storage.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientWorkspaceModal;
