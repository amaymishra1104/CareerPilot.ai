'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Stethoscope,
  Printer
} from 'lucide-react';

export function DocumentationTab() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('all');
  const [zoom, setZoom] = useState<number>(100);

  const pages = [
    {
      num: 1,
      title: 'Project Overview & ICP',
      subtitle: 'Executive Summary, Business Problem & QSR Targeting Hypotheses',
      src: '/docs/page_1.png'
    },
    {
      num: 2,
      title: 'Five-Stage Pipeline',
      subtitle: 'Discovery, Deduplication, Enrichment, Approval Gate & 4-Email Cadence',
      src: '/docs/page_2.png'
    },
    {
      num: 3,
      title: 'Architecture & Safeguards',
      subtitle: 'Component Architecture, Gate Enforcement & Credential Matrix',
      src: '/docs/page_3.png'
    },
    {
      num: 4,
      title: 'Demo & Dental Adaptation',
      subtitle: 'Evaluator Walkthrough, DSO Healthcare Adaptation & Strategic Value',
      src: '/docs/page_4.png'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                Official Submission Document
              </span>
              <span className="text-xs text-slate-400">4-Page Executive Briefing & Technical Specification</span>
            </div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              OSVI.ai GTM Automation Pipeline Documentation
            </h1>
            <p className="text-xs text-slate-300">
              Prepared by <span className="font-semibold text-white">Amay Mishra</span> (GTM/Growth Intern Candidate) for OSVI.ai Evaluation.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/OSVI_GTM_Pipeline_Documentation.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Raw PDF
            </a>
            <a
              href="/OSVI_GTM_Pipeline_Documentation.pdf"
              download="OSVI_GTM_Pipeline_Documentation.pdf"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Official PDF
            </a>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Page Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              viewMode === 'all' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All 4 Pages (Continuous)
          </button>
          {pages.map(p => (
            <button
              key={p.num}
              onClick={() => {
                setViewMode('single');
                setCurrentPage(p.num);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                viewMode === 'single' && currentPage === p.num
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Page {p.num}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          {viewMode === 'single' && (
            <div className="flex items-center gap-1 mr-3 border-r border-slate-800 pr-3">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono text-slate-300 px-2">
                Page {currentPage} of 4
              </span>
              <button
                disabled={currentPage >= 4}
                onClick={() => setCurrentPage(p => Math.min(4, p + 1))}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              disabled={zoom <= 75}
              onClick={() => setZoom(z => Math.max(75, z - 15))}
              className="p-1 rounded text-slate-400 hover:text-slate-200 disabled:opacity-40"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-400 px-2 w-12 text-center">
              {zoom}%
            </span>
            <button
              disabled={zoom >= 150}
              onClick={() => setZoom(z => Math.min(150, z + 15))}
              className="p-1 rounded text-slate-400 hover:text-slate-200 disabled:opacity-40"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Document View Canvas */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center min-h-[800px] overflow-x-auto">
        <div 
          className="transition-all duration-200 flex flex-col items-center gap-8 w-full"
          style={{ maxWidth: `${Math.round(850 * (zoom / 100))}px` }}
        >
          {viewMode === 'all' ? (
            pages.map((p) => (
              <div key={p.num} className="w-full flex flex-col items-center">
                <div className="w-full flex items-center justify-between pb-2 px-1 text-slate-400 text-xs">
                  <span className="font-semibold text-slate-300">
                    Page {p.num}: {p.title}
                  </span>
                  <span className="text-[11px] text-slate-500">{p.subtitle}</span>
                </div>
                <div className="w-full bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-300/40">
                  <img
                    src={p.src}
                    alt={`Documentation Page ${p.num}`}
                    className="w-full h-auto block"
                    loading="eager"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-2 px-1 text-slate-400 text-xs">
                <span className="font-semibold text-slate-300">
                  Page {currentPage}: {pages[currentPage - 1].title}
                </span>
                <span className="text-[11px] text-slate-500">{pages[currentPage - 1].subtitle}</span>
              </div>
              <div className="w-full bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-300/40">
                <img
                  src={pages[currentPage - 1].src}
                  alt={`Documentation Page ${currentPage}`}
                  className="w-full h-auto block"
                  loading="eager"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
