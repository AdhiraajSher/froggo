import React from 'react';
import { UserCheck, Upload, ArrowRight } from 'lucide-react';
import { PageType } from './Sidebar';
import { ContractRole } from '../../lib/types';

export interface UploadViewProps {
  role: ContractRole;
  setRole: (r: ContractRole) => void;
  handleFileUpload: (file?: File) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isExtracting: boolean;
  uploadFilename: string;
  uploadText: string;
  setUploadText: (t: string) => void;
  uploadError: string;
  navigateTo: (p: PageType) => void;
  handleRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export const UploadView: React.FC<UploadViewProps> = ({
  role,
  setRole,
  handleFileUpload,
  fileInputRef,
  isExtracting,
  uploadFilename,
  uploadText,
  setUploadText,
  uploadError,
  navigateTo,
  handleRunAnalysis,
  isAnalyzing,
}) => {
  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E] dark:text-teal-400">
              New Document Analysis
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white mt-1">
              Add your document
            </h1>
            <p className="text-base text-gray-600 dark:text-slate-300 mt-2">
              Extract and review your contract with automatic client-side PII masking
              (PAN, Aadhaar, phone, email, and bank accounts). Anonymized text is assessed
              against Indian statutory protections.
            </p>
          </div>

          {/* Role Selector */}
          <div className="p-4 rounded-xl bg-[#F9FAFB] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#111827] dark:text-white">
              <UserCheck size={18} className="text-[#0F766E] dark:text-teal-400" />
              <span>Your perspective</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['Freelancer', 'Tenant', 'Student'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    role === r
                      ? 'bg-[#0F766E] text-white border-[#0F766E]'
                      : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border-gray-300 dark:border-slate-700 hover:bg-gray-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileUpload(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-[#0F766E] rounded-xl p-8 text-center bg-[#F9FAFB] dark:bg-slate-950 hover:bg-teal-50/30 cursor-pointer transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx,.md"
              hidden
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
            />
            <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950 text-[#0F766E] dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
              <Upload size={22} />
            </div>
            <p className="text-base font-semibold text-[#111827] dark:text-white">
              {isExtracting
                ? 'Extracting contract text from document...'
                : uploadFilename
                ? `Loaded: ${uploadFilename} (click to replace)`
                : 'Drop your contract file here, or click to browse'}
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Supports PDF, DOCX, TXT, and MD up to 10 MB
            </p>
          </div>

          {/* Editable Preview / Paste Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-[#111827] dark:text-white">
                {uploadFilename
                  ? `Extracted Contract Text (Editable Preview):`
                  : 'Or paste contract text / clauses below:'}
              </label>
              {uploadText.trim() && (
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {uploadText.split(/\s+/).filter(Boolean).length} words · Review before analysis
                </span>
              )}
            </div>
            <textarea
              rows={8}
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
              placeholder="Paste the clauses you want to understand (e.g., payment terms, IP ownership, non-compete, lease deposit deductions)..."
              className="w-full p-4 rounded-xl bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 text-sm text-[#111827] dark:text-white leading-relaxed placeholder:text-gray-400 font-mono"
            />
          </div>

          {uploadError && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-300 font-medium"
            >
              {uploadError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              onClick={() => navigateTo('home')}
              className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !uploadText.trim()}
              className="px-6 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] disabled:opacity-50 text-white text-base font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <span>
                {isAnalyzing
                  ? 'Analyzing Clauses...'
                  : 'Analyze Contract in Reading Room'}
              </span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
