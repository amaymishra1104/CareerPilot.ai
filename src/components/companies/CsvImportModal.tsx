'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCsv: (csvText: string) => Promise<{ success: boolean; addedCompaniesCount: number; errors: string[] }>;
}

const SAMPLE_CSV = `company_name,website,locations,category,headquarters,buying_signals,contact_name,title,email
"Smashburger Mid-Atlantic Group","https://smashatlantic.demo",38,"burgers","Washington, DC","restaurant expansion","Jason Scott","VP of Operations","jscott@smashatlantic.demo"
"Jersey Mike's Carolinas LLC","https://jmcarolinas.demo",54,"sandwiches","Raleigh, NC","hiring for operations","Karen Mitchell","Head of Customer Experience","kmitchell@jmcarolinas.demo"
"Wingstop Texas Franchisees","https://wingstoptx.demo",72,"chicken","Dallas, TX","documented investments in automation","Robert Garcia","Chief Operating Officer","rgarcia@wingstoptx.demo"`;

export function CsvImportModal({ isOpen, onClose, onImportCsv }: CsvImportModalProps) {
  const [csvText, setCsvText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; addedCompaniesCount: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!csvText.trim()) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await onImportCsv(csvText);
      setResult(res);
      if (res.success && res.addedCompaniesCount > 0) {
        setTimeout(() => {
          onClose();
          setResult(null);
          setCsvText('');
        }, 1800);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadSample = () => {
    setCsvText(SAMPLE_CSV);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Companies via CSV</h3>
              <p className="text-xs text-slate-400">
                All records imported here are tagged with provenance <span className="text-amber-300 font-mono">[MANUALLY SOURCED]</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Paste CSV Content (with headers)
            </label>
            <button
              onClick={handleLoadSample}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Load Sample CSV</span>
            </button>
          </div>

          <textarea
            rows={8}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="company_name,website,locations,category,headquarters,buying_signals..."
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {result && (
          <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
            result.success ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
          }`}>
            {result.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            <div>
              <p className="font-semibold">
                {result.success ? `Successfully imported ${result.addedCompaniesCount} companies!` : 'Import encountered issues.'}
              </p>
              {result.errors.length > 0 && (
                <p className="mt-1 text-[11px] text-slate-400">{result.errors.join('; ')}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !csvText.trim()}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Parsing & Ingesting...' : 'Ingest & Deduplicate Records'}
          </button>
        </div>
      </div>
    </div>
  );
}
