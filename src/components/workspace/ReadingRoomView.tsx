import React, { useState } from 'react';
import {
  Download,
  Plus,
  Scale,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  Copy,
  Check,
  Edit2,
  Trash2,
} from 'lucide-react';
import { PageType } from './Sidebar';
import { ContractRole, ContractDocument } from '../../lib/types';

export interface ReadingRoomViewProps {
  currentFile: any;
  role: ContractRole;
  setRole: (r: ContractRole) => void;
  useSerifLegalText: boolean;
  setUseSerifLegalText: React.Dispatch<React.SetStateAction<boolean>>;
  handleExportPdf: () => void;
  navigateTo: (p: PageType) => void;
  files: any[];
  selectedFileIndex: number;
  setSelectedFileIndex: (idx: number) => void;
  activeClauseIndex: number;
  setActiveClauseIndex: (idx: number) => void;
  handleRenameContract: (id: string, currentTitle: string) => void;
  handleDeleteContract: (id: string, title: string) => void;
  clauseRefs: React.MutableRefObject<Record<number, HTMLElement | null>>;
  scrollToClause: (index: number) => void;
}

export const ReadingRoomView: React.FC<ReadingRoomViewProps> = ({
  currentFile,
  role,
  setRole,
  useSerifLegalText,
  setUseSerifLegalText,
  handleExportPdf,
  navigateTo,
  files,
  selectedFileIndex,
  setSelectedFileIndex,
  activeClauseIndex,
  setActiveClauseIndex,
  handleRenameContract,
  handleDeleteContract,
  clauseRefs,
  scrollToClause,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getRiskBadgeStyle = (score: number) => {
    if (score < 40)
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        bar: 'bg-emerald-600',
        label: 'Low Risk',
      };
    if (score < 70)
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        bar: 'bg-amber-500',
        label: 'Moderate Risk',
      };
    return {
      bg: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
      bar: 'bg-red-600',
      label: 'High Risk',
    };
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Action Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#0F766E] dark:text-teal-400">
              <span>{currentFile.id}</span>
              <span>·</span>
              <span>{currentFile.type}</span>
              <span>·</span>
              <span>Reading as {role}</span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#111827] dark:text-white mt-0.5">
              {currentFile.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Font Toggle for Legal Text */}
            <button
              onClick={() => setUseSerifLegalText((prev) => !prev)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F9FAFB] text-xs font-medium text-gray-700 dark:text-slate-300"
            >
              Font: {useSerifLegalText ? 'Merriweather Serif' : 'Inter Sans'}
            </button>

            <button
              onClick={handleExportPdf}
              className="px-3.5 py-2 rounded-lg border border-teal-300 dark:border-teal-700 bg-teal-50/80 dark:bg-emerald-950/40 hover:bg-teal-100 dark:hover:bg-emerald-900 text-sm font-semibold text-[#0F766E] dark:text-emerald-300 flex items-center gap-2 transition-colors cursor-pointer"
              title="Download official PDF contract audit report"
            >
              <Download size={15} />
              <span>Download Audit PDF</span>
            </button>

            <button
              onClick={() => navigateTo('upload')}
              className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus size={16} />
              <span>Upload Contract</span>
            </button>
          </div>
        </div>

        {/* 3-Column Reading Room Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDEBAR (3/12): Workspace Documents & Role Switcher */}
          <aside className="lg:col-span-3 space-y-5">
            {/* Workspace Document List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-sm font-bold text-[#111827] dark:text-white uppercase tracking-wider">
                  Workspace Files
                </h2>
                <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                  {files.length} docs
                </span>
              </div>

              <div className="space-y-2">
                {files.map((file, idx) => {
                  const isSelected = selectedFileIndex === idx;
                  return (
                    <div
                      key={file.id}
                      onClick={() => {
                        setSelectedFileIndex(idx);
                        setActiveClauseIndex(0);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors block cursor-pointer group ${
                        isSelected
                          ? 'bg-teal-50/80 dark:bg-teal-950/50 border-[#0F766E] text-[#111827] dark:text-white'
                          : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:bg-[#F9FAFB] dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-medium mb-1">
                        <span
                          className={
                            isSelected
                              ? 'text-[#0F766E] dark:text-teal-300 font-semibold'
                              : 'text-gray-500 dark:text-slate-400'
                          }
                        >
                          {file.type}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-700 dark:text-slate-300 mr-1">
                            Score: {file.score}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameContract(file.id, file.title);
                            }}
                            title="Rename contract"
                            className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteContract(file.id, file.title);
                            }}
                            title="Delete contract"
                            className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="font-heading text-sm font-semibold leading-snug">
                        {file.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Role Lens Switcher Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
              <h2 className="font-heading text-sm font-bold text-[#111827] dark:text-white uppercase tracking-wider">
                Role Perspective
              </h2>
              <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed">
                Switch roles to see how this contract specifically affects your rights and
                finances.
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Freelancer', 'Tenant', 'Student'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-colors text-center ${
                      role === r
                        ? 'bg-[#0F766E] text-white border-[#0F766E]'
                        : 'bg-[#F9FAFB] dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Indian Statutory Checks Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-[#0F766E] dark:text-teal-400" />
                <h2 className="font-heading text-sm font-bold text-[#111827] dark:text-white uppercase tracking-wider">
                  Indian Law Audit
                </h2>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[#F9FAFB] dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <span className="font-semibold text-gray-700 dark:text-slate-200 block">
                    Section 27 (Non-Compete):
                  </span>
                  <span className="text-gray-600 dark:text-slate-400 mt-0.5 block">
                    {currentFile.indiaStatutoryChecks.sec27Status}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F9FAFB] dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <span className="font-semibold text-gray-700 dark:text-slate-200 block">
                    MSME 45-Day Rule (Sec 15):
                  </span>
                  <span className="text-gray-600 dark:text-slate-400 mt-0.5 block">
                    {currentFile.indiaStatutoryChecks.msme45DayStatus}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F9FAFB] dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <span className="font-semibold text-gray-700 dark:text-slate-200 block">
                    Section 194J TDS Check:
                  </span>
                  <span className="text-gray-600 dark:text-slate-400 mt-0.5 block">
                    {currentFile.indiaStatutoryChecks.tds194JStatus}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* MIDDLE COLUMN (5/12): Clean White (#FFFFFF) Contract Text Viewer */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Contract Text Viewer
                </span>
                <h2 className="font-heading text-lg font-bold text-[#111827] dark:text-white">
                  Original Clauses (Click any clause to inspect)
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
                  High Risk
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Moderate
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Safe
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Not Assessed
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {currentFile.clauses.map((clauseText: string, idx: number) => {
                const isSelected = activeClauseIndex === idx;
                const severity = currentFile.clauseSeverities?.[idx] || 'not_assessed';

                const severityStyles =
                  severity === 'high'
                    ? 'bg-red-50/70 dark:bg-red-950/30 border-l-4 border-l-red-500 border-red-200 dark:border-red-900 hover:bg-red-50'
                    : severity === 'medium'
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-l-4 border-l-amber-500 border-amber-200 dark:border-amber-900 hover:bg-amber-50'
                    : severity === 'safe'
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-l-4 border-l-emerald-600 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-50'
                    : 'bg-slate-50/80 dark:bg-slate-900/40 border-l-4 border-l-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100/50';

                const badgeStyles =
                  severity === 'high'
                    ? 'bg-red-100 dark:bg-red-900/70 text-red-900 dark:text-red-200'
                    : severity === 'medium'
                    ? 'bg-amber-100 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200'
                    : severity === 'safe'
                    ? 'bg-emerald-100 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

                return (
                  <button
                    key={idx}
                    ref={(el) => {
                      clauseRefs.current[idx] = el;
                    }}
                    onClick={() => scrollToClause(idx)}
                    className={`w-full text-left p-5 rounded-xl border transition-all block ${severityStyles} ${
                      isSelected ? 'ring-2 ring-[#0F766E] shadow-md scale-[1.005]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wide">
                        Clause 0{idx + 1} {currentFile.risks[idx] ? `· ${currentFile.risks[idx]}` : ''}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded uppercase ${badgeStyles}`}
                      >
                        {severity === 'not_assessed' ? 'Not Assessed' : severity}
                      </span>
                    </div>
                    <p
                      className={`${
                        useSerifLegalText ? 'font-legal-serif' : 'font-legal'
                      } text-base text-[#111827] dark:text-slate-100 leading-relaxed`}
                    >
                      {clauseText}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN (4/12): Scrollable Insights Panel */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Card 1: Overall Risk Score */}
            {(() => {
              const badge = getRiskBadgeStyle(currentFile.score);
              return (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                      Contract Risk Score
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="font-heading text-3xl font-bold text-[#111827] dark:text-white">
                      {currentFile.score}
                      <span className="text-base font-normal text-gray-500 dark:text-slate-400">
                        /100
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-slate-400">
                      Lower score = safer terms
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${badge.bar}`}
                      style={{ width: `${currentFile.score}%` }}
                    />
                  </div>

                  {/* Score Breakdown & Disclaimer */}
                  {currentFile.scoreBreakdown && (
                    <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2 text-xs">
                      <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                        Point Breakdown
                      </div>
                      {currentFile.scoreBreakdown.penalties.length > 0 ? (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {currentFile.scoreBreakdown.penalties.map((p: any, pIdx: number) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => {
                                const foundIdx = currentFile.clauses.findIndex(
                                  (_: string, cIdx: number) =>
                                    `c-${String(cIdx + 1).padStart(3, '0')}` === p.clauseId
                                );
                                if (foundIdx !== -1) scrollToClause(foundIdx);
                              }}
                              className="w-full text-left flex items-center justify-between p-1.5 rounded hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
                            >
                              <span className="font-medium text-gray-700 dark:text-slate-300 truncate max-w-[210px]">
                                {p.title}
                              </span>
                              <span className="font-bold text-red-600 dark:text-red-400 shrink-0">
                                +{p.points} pts
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                          No statutory penalty points identified.
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 pt-1">
                        <span>Assessed:</span>
                        <span className="font-semibold text-gray-700 dark:text-slate-200">
                          {currentFile.scoreBreakdown.assessedClausesCount} of{' '}
                          {currentFile.scoreBreakdown.totalClausesCount} clauses
                        </span>
                      </div>
                      {currentFile.scoreBreakdown.unassessedClausesCount > 0 && (
                        <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/40 p-2 rounded">
                          {currentFile.scoreBreakdown.unassessedClausesCount} clause(s) not
                          assessed for specific statutory violations.
                        </div>
                      )}
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 italic pt-1 leading-tight">
                        {currentFile.scoreBreakdown.disclaimer}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Card 2: Plain-English Summary of Selected Clause */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[#0F766E] dark:text-teal-400" />
                  <h3 className="font-heading text-base font-bold text-[#111827] dark:text-white">
                    Plain-English Summary
                  </h3>
                </div>
                <span className="text-xs font-semibold text-[#0F766E] dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded">
                  Clause 0{activeClauseIndex + 1}
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                  What this clause actually means:
                </div>
                <p className="text-base text-[#111827] dark:text-slate-100 leading-relaxed">
                  {currentFile.plain[activeClauseIndex]}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F9FAFB] dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 space-y-1.5">
                <div className="text-xs font-bold text-[#0F766E] dark:text-teal-400 uppercase">
                  Why it matters to a {role}:
                </div>
                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                  {currentFile.roleImpact?.[role]?.[activeClauseIndex] ||
                    currentFile.plain[activeClauseIndex]}
                </p>
              </div>
            </div>

            {/* Card 3: Suggested Questions to Ask Before Signing */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                <HelpCircle size={18} className="text-[#1D4ED8] dark:text-blue-400" />
                <h3 className="font-heading text-base font-bold text-[#111827] dark:text-white">
                  Questions to Ask Before Signing
                </h3>
              </div>

              <div className="space-y-3">
                {currentFile.questions.map((q: string, idx: number) => {
                  const isCurrent = idx === activeClauseIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => scrollToClause(idx)}
                      className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 ring-1 ring-blue-400'
                          : 'bg-[#F9FAFB] dark:bg-slate-800/70 border-gray-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-[#111827] dark:text-slate-100 leading-relaxed">
                          <span className="font-bold text-[#1D4ED8] dark:text-blue-400 mr-1.5">
                            Q{idx + 1}.
                          </span>
                          “{q}”
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyText(`q-${idx}`, q);
                          }}
                          className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 hover:bg-gray-100 text-xs font-medium text-gray-700 dark:text-slate-300 shrink-0 flex items-center gap-1"
                        >
                          {copiedKey === `q-${idx}` ? (
                            <>
                              <Check size={12} className="text-emerald-700" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 4: Missing Protective Clauses */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                <ShieldAlert size={18} className="text-amber-600 dark:text-amber-400" />
                <h3 className="font-heading text-base font-bold text-[#111827] dark:text-white">
                  Missing Clauses to Request
                </h3>
              </div>

              <div className="space-y-3">
                {currentFile.missing.map((m: string) => (
                  <div
                    key={m}
                    className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#111827] dark:text-white">
                        {m}
                      </span>
                      {currentFile.missingWording?.[m] && (
                        <button
                          onClick={() =>
                            handleCopyText(`gap-${m}`, currentFile.missingWording[m])
                          }
                          className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 text-xs font-semibold text-amber-900 dark:text-amber-300 shrink-0 flex items-center gap-1"
                        >
                          {copiedKey === `gap-${m}` ? (
                            <>
                              <Check size={12} />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy Clause</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {currentFile.missingWording?.[m] && (
                      <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-amber-100 dark:border-slate-800">
                        <strong>Suggested Wording:</strong> “{currentFile.missingWording[m]}”
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
