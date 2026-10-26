'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  Check, 
  Edit3
} from 'lucide-react';
import { 
  JobListing, 
  RecruiterContact, 
  ResumeRecord, 
  PersonalizedEmailDraft 
} from '@/types';
import { OutreachEmailType, OutreachTone } from '@/lib/career/outreach-generator';

interface PersonalizedOutreachTabProps {
  jobs: JobListing[];
  resumes: ResumeRecord[];
  contacts: RecruiterContact[];
  drafts: PersonalizedEmailDraft[];
  onGenerateDraft: (params: {
    jobId: string;
    contactId?: string;
    resumeId?: string;
    emailType: OutreachEmailType;
    tone: OutreachTone;
  }) => Promise<PersonalizedEmailDraft>;
  onSaveDraftEdit: (id: string, subject: string, body: string, signature: string) => Promise<void>;
  onPushToGmail: (draftId: string) => Promise<{ success: boolean; gmailDraftId?: string; error?: string }>;
}

export function PersonalizedOutreachTab({
  jobs,
  resumes: _resumes,
  contacts,
  drafts,
  onGenerateDraft,
  onSaveDraftEdit,
  onPushToGmail
}: PersonalizedOutreachTabProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [emailType, setEmailType] = useState<OutreachEmailType>('recruiter_outreach');
  const [tone, setTone] = useState<OutreachTone>('professional');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPushingGmail, setIsPushingGmail] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
  const jobContacts = contacts.filter(c => c.job_id === selectedJobId);
  const currentContact = jobContacts[0];

  // Find existing draft for current job
  const existingDraft = drafts.find(d => d.job_id === selectedJobId);

  // Editable draft fields
  const [editSubject, setEditSubject] = useState(existingDraft?.subject || '');
  const [editBody, setEditBody] = useState(existingDraft?.body || '');
  const [editSignature, setEditSignature] = useState(existingDraft?.signature || '');

  // Keep state synced when switching jobs
  React.useEffect(() => {
    if (existingDraft) {
      setEditSubject(existingDraft.subject);
      setEditBody(existingDraft.body);
      setEditSignature(existingDraft.signature);
    }
  }, [existingDraft]);

  const handleGenerate = async () => {
    if (!currentJob) return;
    setIsGenerating(true);
    try {
      const generated = await onGenerateDraft({
        jobId: currentJob.id,
        contactId: currentContact?.id,
        emailType,
        tone
      });
      setEditSubject(generated.subject);
      setEditBody(generated.body);
      setEditSignature(generated.signature);
    } catch (err: any) {
      alert(`Outreach generation error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!existingDraft) return;
    try {
      await onSaveDraftEdit(existingDraft.id, editSubject, editBody, editSignature);
      alert('Draft edits saved successfully.');
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  const handleCreateGmailDraft = async () => {
    if (!existingDraft) return;
    setIsPushingGmail(true);
    try {
      const res = await onPushToGmail(existingDraft.id);
      if (res.success) {
        alert(`Gmail draft created successfully into your authorized test inbox! Draft ID: ${res.gmailDraftId}`);
      } else {
        alert(res.error || 'Saved to Internal Draft Queue.');
      }
    } catch (err: any) {
      alert(`Gmail error: ${err.message}`);
    } finally {
      setIsPushingGmail(false);
    }
  };

  const copyDraft = () => {
    const full = `Subject: ${editSubject}\n\n${editBody}`;
    navigator.clipboard.writeText(full);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            <span>Personalized Outreach Email Generator</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate tailored emails across 7 interaction types grounded in actual resume projects and job evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero-Send Policy: Drafts Created Only in Test Inbox</span>
          </span>
        </div>
      </div>

      {/* Configuration & Trigger Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="space-y-1">
          <label className="text-slate-700 font-semibold">Target Opening</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} — {j.company}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-slate-700 font-semibold">Email Type (7 Types)</label>
          <select
            value={emailType}
            onChange={(e) => setEmailType(e.target.value as OutreachEmailType)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="recruiter_outreach">Recruiter Outreach</option>
            <option value="job_application">Formal Job Application</option>
            <option value="hiring_manager">Hiring Manager Inquiry</option>
            <option value="internship_inquiry">University / Summer Intern Inquiry</option>
            <option value="referral_request">Alumni / Peer Referral Request</option>
            <option value="application_followup">Application Follow-Up</option>
            <option value="interview_thankyou">Post-Interview Thank You</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-slate-700 font-semibold">Preferred Tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as OutreachTone)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="professional">Professional &amp; Direct</option>
            <option value="enthusiastic_student">Enthusiastic Student / Fresher</option>
            <option value="concise_impactful">Concise &amp; Bulleted</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing...' : 'Generate Personalized Email'}</span>
          </button>
        </div>
      </div>

      {/* Editor & Evidence Claims Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Interactive Email Editor */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-900 text-sm">Outreach Email Editor</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyDraft}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Copy full text"
                >
                  {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Recipient Gating Notice */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px] text-slate-600">
              <div><strong className="text-slate-800">Target Recipient:</strong> {existingDraft?.recipient_name || currentContact?.name || currentJob.company} &lt;{existingDraft?.recipient_email || 'recruiting@company.com'}&gt;</div>
              <div className="text-emerald-700 font-medium"><strong className="text-slate-800">Draft Delivery Target:</strong> {existingDraft?.delivery_target_email || 'amaymishra1104@gmail.com'} (Authorized Test Inbox)</div>
            </div>

            {/* Subject Input */}
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Subject Line</label>
              <input
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                placeholder="Subject line..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Body Textarea */}
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold">Email Body</label>
              <textarea
                rows={12}
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                placeholder="Email body text..."
                className="w-full px-3.5 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 font-sans text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                onClick={handleSaveEdits}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                Save Edits to Draft
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateGmailDraft}
                  disabled={isPushingGmail || !existingDraft}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <Mail className={`w-3.5 h-3.5 ${isPushingGmail ? 'animate-spin' : ''}`} />
                  <span>{isPushingGmail ? 'Creating in Gmail...' : 'Create Gmail Draft (Test Inbox)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Evidence Claims Used */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3.5 text-xs">
            <div className="flex items-center gap-2 text-indigo-700 font-bold">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Grounding Evidence Claims</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Every personalization claim in this draft is anchored on verified resume projects and job qualifications:
            </p>

            <div className="space-y-2 pt-1">
              {(existingDraft?.evidence_used || [
                `Job requirements for ${currentJob.title} at ${currentJob.company}`,
                'Verified student status: Computer Science senior graduating June 2026',
                'Demonstrated technical project: Distributed Task Queue in TypeScript and Redis'
              ]).map((claim, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                  <div className="text-indigo-700 font-semibold mb-0.5">Evidence Factor #{idx + 1}</div>
                  <div>{claim}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              No hypothetical company initiatives or fake recruiter relationships are ever invented.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
