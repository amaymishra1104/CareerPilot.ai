'use client';

import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Save, 
  Check, 
  Briefcase, 
  MapPin, 
  Sparkles, 
  Building,
  Globe
} from 'lucide-react';
import { JobPreferences } from '@/types';

interface JobPreferencesTabProps {
  preferences: JobPreferences;
  onSavePreferences: (updated: Partial<JobPreferences>) => Promise<void>;
}

export function JobPreferencesTab({
  preferences,
  onSavePreferences
}: JobPreferencesTabProps) {
  const [formData, setFormData] = useState<JobPreferences>({ ...preferences });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New tag inputs
  const [newRole, setNewRole] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newLoc, setNewLoc] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await onSavePreferences(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Failed to save preferences: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const addRole = () => {
    if (newRole.trim() && !formData.target_roles.includes(newRole.trim())) {
      setFormData({ ...formData, target_roles: [...formData.target_roles, newRole.trim()] });
      setNewRole('');
    }
  };

  const removeRole = (role: string) => {
    setFormData({ ...formData, target_roles: formData.target_roles.filter(r => r !== role) });
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addLoc = () => {
    if (newLoc.trim() && !formData.locations.includes(newLoc.trim())) {
      setFormData({ ...formData, locations: [...formData.locations, newLoc.trim()] });
      setNewLoc('');
    }
  };

  const removeLoc = (loc: string) => {
    setFormData({ ...formData, locations: formData.locations.filter(l => l !== loc) });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
            <span>Job Preferences &amp; Discovery Filter</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure your target roles, locations, work preferences, and skills to guide the job discovery and matching engine.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <Check className="w-4 h-4" />
            <span>Preferences Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Target Roles Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Target Job Titles &amp; Roles</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Specific titles you want the automated crawler and matching engine to prioritize.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {formData.target_roles.map(role => (
              <span 
                key={role} 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium"
              >
                <span>{role}</span>
                <button 
                  type="button" 
                  onClick={() => removeRole(role)}
                  className="hover:text-rose-600 cursor-pointer font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRole(); } }}
              placeholder="Add target role (e.g., Software Engineer Intern, AI Engineer)..."
              className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
            />
            <button
              type="button"
              onClick={addRole}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Add Role
            </button>
          </div>
        </div>

        {/* Work Model & Locations Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Globe className="w-4 h-4 text-sky-600" />
            <span>Location &amp; Remote Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold">Remote / Work Model Preference</label>
              <select
                value={formData.remote_preference}
                onChange={(e) => setFormData({ ...formData, remote_preference: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="any">Any (Remote, Hybrid, or On-Site)</option>
                <option value="remote_only">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="on_site">On-Site Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold">Experience Level</label>
              <select
                value={formData.experience_level}
                onChange={(e) => setFormData({ ...formData, experience_level: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="internship">Internship (Summer / Off-Cycle)</option>
                <option value="entry_level">Fresher / Entry Level (0-1 yrs)</option>
                <option value="associate">Associate / Junior (1-2 yrs)</option>
                <option value="mid_level">Mid Level (2-4 yrs)</option>
              </select>
            </div>
          </div>

          {/* Locations Tag Input */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-slate-700 font-semibold">Target Locations &amp; Metros</label>
            <div className="flex flex-wrap gap-2">
              {formData.locations.map(loc => (
                <span 
                  key={loc} 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 font-medium"
                >
                  <MapPin className="w-3 h-3 text-sky-600" />
                  <span>{loc}</span>
                  <button 
                    type="button" 
                    onClick={() => removeLoc(loc)}
                    className="hover:text-rose-600 cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newLoc}
                onChange={(e) => setNewLoc(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLoc(); } }}
                placeholder="Add city or region (e.g. San Francisco, CA, Remote, New York, NY)..."
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
              />
              <button
                type="button"
                onClick={addLoc}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Add Location
              </button>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={formData.willing_to_relocate}
                onChange={(e) => setFormData({ ...formData, willing_to_relocate: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Willing to relocate for the right role or summer cohort</span>
            </label>
          </div>
        </div>

        {/* Priority Skills Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Priority Skills to Match</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Skills you want to feature heavily in job requirement filtering.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {formData.skills.map(skill => (
              <span 
                key={skill} 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium"
              >
                <span>{skill}</span>
                <button 
                  type="button" 
                  onClick={() => removeSkill(skill)}
                  className="hover:text-rose-600 cursor-pointer font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              placeholder="Add skill tag (e.g. TypeScript, PyTorch, Next.js, Redis)..."
              className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Add Skill
            </button>
          </div>
        </div>

        {/* Salary & Preferred Company Types */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Building className="w-4 h-4 text-amber-600" />
            <span>Company Types &amp; Compensation Expectations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold">Expected Salary / Hourly Stipend</label>
              <input
                type="text"
                value={formData.expected_salary_or_stipend || ''}
                onChange={(e) => setFormData({ ...formData, expected_salary_or_stipend: e.target.value })}
                placeholder="e.g. $45 - $60 / hr or $8,000 / month"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-semibold">Target Industries</label>
              <input
                type="text"
                value={formData.industries.join(', ')}
                onChange={(e) => setFormData({ ...formData, industries: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="e.g. AI & Machine Learning, Developer Tools, SaaS, FinTech"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Job Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
