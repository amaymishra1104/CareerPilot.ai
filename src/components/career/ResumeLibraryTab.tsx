'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Briefcase, 
  GraduationCap, 
  Code2, 
  Brain, 
  LineChart,
  ShieldCheck
} from 'lucide-react';
import { ResumeRecord, ResumeProfileType } from '@/types';

interface ResumeLibraryTabProps {
  resumes: ResumeRecord[];
  onUploadResume: (data: {
    fileName: string;
    fileType: 'pdf' | 'docx' | 'txt' | 'json';
    content: string;
    profileType: ResumeProfileType;
    title?: string;
  }) => Promise<void>;
  onDeleteResume: (id: string) => Promise<void>;
}

export function ResumeLibraryTab({
  resumes,
  onUploadResume,
  onDeleteResume
}: ResumeLibraryTabProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || '');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadProfileType, setUploadProfileType] = useState<ResumeProfileType>('technical');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadFileName, setUploadFileName] = useState('uploaded_resume.txt');

  const currentResume = resumes.find(r => r.id === selectedResumeId) || resumes[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setUploadContent(text);
      };
      reader.readAsText(file);
    }
  };

  const submitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadContent.trim()) {
      alert('Please enter or upload resume content.');
      return;
    }

    setIsUploading(true);
    try {
      await onUploadResume({
        fileName: uploadFileName,
        fileType: uploadFileName.endsWith('.pdf') ? 'pdf' : uploadFileName.endsWith('.docx') ? 'docx' : 'txt',
        content: uploadContent,
        profileType: uploadProfileType,
        title: uploadTitle || undefined
      });
      setShowUploadModal(false);
      setUploadContent('');
      setUploadTitle('');
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const getProfileIcon = (type: ResumeProfileType) => {
    if (type === 'ai_ml') return <Brain className="w-4 h-4 text-purple-600" />;
    if (type === 'business_gtm') return <LineChart className="w-4 h-4 text-amber-600" />;
    return <Code2 className="w-4 h-4 text-indigo-600" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Resume Library &amp; Profiles</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your 3 specialized resume profiles (Technical, AI/ML, Business/GTM). Original files are preserved immutably.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Private User Storage</span>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload or Add Resume</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Profiles List on Left, Structured Resume Viewer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Profile Cards */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Saved Resume Profiles ({resumes.length})
          </div>

          {resumes.map(resume => {
            const isSelected = (currentResume?.id === resume.id);
            return (
              <div
                key={resume.id}
                onClick={() => setSelectedResumeId(resume.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-300 shadow-xs ring-1 ring-indigo-200'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      {getProfileIcon(resume.profile_type)}
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-slate-900 leading-snug">{resume.title}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold bg-slate-100 text-slate-700">
                          {resume.profile_type.replace('_', '/')}
                        </span>
                        <span className="text-[10px] text-slate-400">v{resume.version}</span>
                        {resume.is_default && (
                          <span className="text-[10px] text-indigo-600 font-semibold">• Default</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {resumes.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete resume profile "${resume.title}"?`)) {
                          onDeleteResume(resume.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      title="Delete profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{resume.structured_data.skills.length} verified skills</span>
                  <span>{resume.structured_data.projects.length} projects</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (8 cols): Structured Details Viewer */}
        <div className="lg:col-span-8 space-y-4">
          {currentResume ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    {getProfileIcon(currentResume.profile_type)}
                    <h2 className="text-lg font-bold text-slate-900">{currentResume.title}</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    File: <span className="text-slate-700 font-mono font-medium">{currentResume.file_name}</span> • Immutable Source Original
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Parsed &amp; Validated</span>
                  </span>
                </div>
              </div>

              {/* Professional Summary */}
              {currentResume.structured_data.summary && (
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Executive Summary
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {currentResume.structured_data.summary}
                  </p>
                </div>
              )}

              {/* Verified Technical Skills */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Verified Skills ({currentResume.structured_data.skills.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentResume.structured_data.skills.map(skill => (
                    <span 
                      key={skill}
                      className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-sky-600" />
                  <span>Education &amp; Academic Credentials</span>
                </div>
                <div className="space-y-2">
                  {currentResume.structured_data.education.map((edu, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{edu.degree} in {edu.field_of_study}</span>
                        <span className="text-slate-500 font-mono text-[11px]">{edu.start_date || '2022'} – {edu.end_date || '2026'}</span>
                      </div>
                      <div className="text-slate-600">{edu.institution}</div>
                      {edu.gpa && <div className="text-indigo-600 font-semibold">GPA: {edu.gpa}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Work &amp; Internship Experience</span>
                </div>
                <div className="space-y-3">
                  {currentResume.structured_data.experience.map((exp, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{exp.role} • {exp.company}</span>
                        <span className="text-slate-500 font-mono text-[11px]">{exp.start_date} – {exp.end_date || 'Present'}</span>
                      </div>
                      <ul className="space-y-1 text-slate-700 pl-4 list-disc marker:text-indigo-600">
                        {exp.description_bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <span>Technical &amp; Applied Projects</span>
                </div>
                <div className="space-y-3">
                  {currentResume.structured_data.projects.map((proj, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-slate-900">{proj.title}</span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {proj.technologies.slice(0, 3).map(t => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 text-[11px]">{proj.description}</p>
                      <ul className="space-y-1 text-slate-700 pl-4 list-disc marker:text-indigo-600">
                        {proj.bullet_points.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              No resume profile selected. Upload or create one to get started.
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Upload or Add Resume Profile</span>
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitUpload} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Profile Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Technical SWE Resume 2026"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Specialization Profile Type</label>
                <select
                  value={uploadProfileType}
                  onChange={(e) => setUploadProfileType(e.target.value as ResumeProfileType)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="technical">Technical (Software Engineering &amp; Systems)</option>
                  <option value="ai_ml">AI / Machine Learning (Models, RAG &amp; LLMs)</option>
                  <option value="business_gtm">Business / GTM (Product Management &amp; Growth)</option>
                  <option value="custom">Custom Profile</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Select File (PDF, DOCX, TXT, JSON)</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.json,.md"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-600 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:bg-indigo-600 file:text-white file:font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold">Or Paste Resume Content / Plain Text</label>
                <textarea
                  rows={6}
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  placeholder="Paste resume text with skills, education, projects, and work experience..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 shadow-xs transition-colors"
                >
                  {isUploading ? 'Parsing & Saving...' : 'Save & Parse Resume'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
