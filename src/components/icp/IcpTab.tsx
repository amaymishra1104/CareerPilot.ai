'use client';

import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Save, 
  Plus, 
  X, 
  RotateCcw, 
  HelpCircle,
  Check,
  AlertCircle
} from 'lucide-react';
import { ICPConfig } from '@/types';
import { INITIAL_ICP } from '@/lib/seed';

interface IcpTabProps {
  icp: ICPConfig;
  onSaveIcp: (updated: Partial<ICPConfig>) => Promise<void>;
}

export function IcpTab({ icp, onSaveIcp }: IcpTabProps) {
  const [formData, setFormData] = useState<ICPConfig>(icp);
  const [newCategory, setNewCategory] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newSignal, setNewSignal] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveIcp(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setFormData({ ...INITIAL_ICP });
  };

  const addItem = (field: 'restaurantCategories' | 'targetRoles' | 'buyingSignals', val: string, setVal: (v: string) => void) => {
    if (!val.trim()) return;
    if (!formData[field].includes(val.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], val.trim()]
      }));
    }
    setVal('');
  };

  const removeItem = (field: 'restaurantCategories' | 'targetRoles' | 'buyingSignals', itemToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== itemToRemove)
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Ideal Customer Profile (ICP) Configuration</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ICP criteria are treated as empirical hypotheses for US restaurant operators, continuously editable and persisted across searches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Hypotheses</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save ICP Config'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of criteria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Geographic & Industry Bounds */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Geography & Industry Segment</span>
            <span className="text-[10px] text-indigo-400 font-mono">Bound: US Only</span>
          </h3>

          <div>
            <label className="text-xs font-medium text-slate-400">Target Geography</label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {formData.geography.map(geo => (
                <span key={geo} className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-200 border border-slate-700">
                  {geo}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400">Industry Sectors</label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {formData.industries.map(ind => (
                <span key={ind} className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-200 border border-slate-700">
                  {ind}
                </span>
              ))}
            </div>
          </div>

          {/* Location Count Range */}
          <div>
            <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
              <span>Location Count Range (Sweet Spot)</span>
              <span className="text-indigo-400 font-mono font-bold">
                {formData.companySizeMinLocations} – {formData.companySizeMaxLocations} locations
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <span className="text-[10px] text-slate-400">Min Units</span>
                <input
                  type="number"
                  value={formData.companySizeMinLocations}
                  onChange={(e) => setFormData(prev => ({ ...prev, companySizeMinLocations: Number(e.target.value) }))}
                  className="w-full mt-0.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Max Units</span>
                <input
                  type="number"
                  value={formData.companySizeMaxLocations}
                  onChange={(e) => setFormData(prev => ({ ...prev, companySizeMaxLocations: Number(e.target.value) }))}
                  className="w-full mt-0.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Categories */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Restaurant Categories (Target Concepts)
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {formData.restaurantCategories.map(cat => (
              <span 
                key={cat} 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              >
                <span>{cat}</span>
                <button 
                  onClick={() => removeItem('restaurantCategories', cat)}
                  className="hover:text-rose-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Add category (e.g., tacos, coffee)..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem('restaurantCategories', newCategory, setNewCategory)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => addItem('restaurantCategories', newCategory, setNewCategory)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Target Roles */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Target Executive Roles
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {formData.targetRoles.map(role => (
              <span 
                key={role} 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-sky-500/10 text-sky-300 border border-sky-500/20"
              >
                <span>{role}</span>
                <button 
                  onClick={() => removeItem('targetRoles', role)}
                  className="hover:text-rose-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Add executive title..."
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem('targetRoles', newRole, setNewRole)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => addItem('targetRoles', newRole, setNewRole)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Buying Signals */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Observed Buying Signals (Triggers)
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {formData.buyingSignals.map(sig => (
              <span 
                key={sig} 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              >
                <span>{sig}</span>
                <button 
                  onClick={() => removeItem('buyingSignals', sig)}
                  className="hover:text-rose-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Add buying signal..."
              value={newSignal}
              onChange={(e) => setNewSignal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem('buyingSignals', newSignal, setNewSignal)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => addItem('buyingSignals', newSignal, setNewSignal)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Operational Hypothesis Callout */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/25 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-semibold text-amber-300">ICP Qualification Hypothesis</span>
          <p className="text-slate-300 leading-relaxed">
            Multi-unit franchisees with 20–200 locations experience communication bottlenecks between phone/app orders and kitchen lines, but lack internal engineering teams to build custom multi-agent orchestration. OSVI.ai Journey provides an out-of-the-box orchestration layer.
          </p>
        </div>
      </div>
    </div>
  );
}
