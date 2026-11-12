import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  FileText,
  ShieldCheck,
  Upload,
  Wand2,
  Copy,
  LayoutGrid,
  MessageSquareText,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Search,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import { PageType } from './Sidebar';

export interface HomeViewProps {
  files: any[];
  homeTab: 'documents' | 'workflow';
  setHomeTab: (tab: 'documents' | 'workflow') => void;
  navigateTo: (page: PageType) => void;
  openContractInReadingRoom: (index: number) => void;
  selectedFileIndex: number;
  setShieldSubTab: (tab: any) => void;
  setAiAssistantMode: (mode: 'chat' | 'voice') => void;
  setAiAssistantOpen: (open: boolean) => void;
  search: string;
  setSearch: (s: string) => void;
  handleRenameContract: (id: string, currentTitle: string) => void;
  handleDeleteContract: (id: string, title: string) => void;
  documentRail: React.RefObject<HTMLDivElement | null>;
}

export const HomeView: React.FC<HomeViewProps> = ({
  files,
  homeTab,
  setHomeTab,
  navigateTo,
  openContractInReadingRoom,
  selectedFileIndex,
  setShieldSubTab,
  setAiAssistantMode,
  setAiAssistantOpen,
  search,
  setSearch,
  handleRenameContract,
  handleDeleteContract,
  documentRail,
}) => {
  return (
    <div className="emerald-home">
      <div className="dashboard-title">
        <div>
          <span className="dashboard-eyebrow">YOUR WORKSPACE</span>
          <h1>Everything, in clearer terms.</h1>
          <p>A focused space to understand, review, and refine your contracts.</p>
        </div>
        <button className="emerald-primary" onClick={() => navigateTo('upload')}>
          <Plus size={16} /> New document
        </button>
      </div>

      <div className="dashboard-tabs">
        <div role="tablist" aria-label="Workspace view">
          <button
            role="tab"
            aria-selected={homeTab === 'documents'}
            onClick={() => setHomeTab('documents')}
            className={homeTab === 'documents' ? 'active' : ''}
          >
            <FileText size={16} /> Documents{' '}
            <span>{files.length.toString().padStart(2, '0')}</span>
          </button>
          <button
            role="tab"
            aria-selected={homeTab === 'workflow'}
            onClick={() => setHomeTab('workflow')}
            className={homeTab === 'workflow' ? 'active' : ''}
          >
            <ShieldCheck size={16} /> Review workflow
          </button>
        </div>
        <span className="dashboard-tabs-note">Built around your next decision</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={homeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          {homeTab === 'documents' ? (
            <>
              {/* First-Visit / Primary Overview Section */}
              <div className="mb-8 p-6 sm:p-8 rounded-2xl border border-[#d9e7df] dark:border-[#32483c] bg-white/70 dark:bg-[#1b2e25]/80 backdrop-blur-md shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck size={14} />
                      <span>Contract Review for Freelancers, Tenants &amp; Students in India</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                      Review contracts with clarity, statutory rigor &amp; client-side privacy.
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      Automatic PII masking redacts PAN, Aadhaar, phone, email &amp; bank data locally before any network call.
                      Clauses are audited against Sec 27 non-compete restraints, MSMED 45-day payment caps, and Section 194J TDS.
                    </p>

                    {/* Two Primary Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={() => navigateTo('upload')}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#005f44] hover:bg-[#004a35] text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
                      >
                        <Upload size={17} />
                        <span>Upload a contract</span>
                      </button>
                      <button
                        onClick={() => openContractInReadingRoom(0)}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-100 font-semibold text-sm transition-all cursor-pointer"
                      >
                        <FileText size={17} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Try a sample</span>
                      </button>
                    </div>

                    {/* 3-Step Explainer */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-800 text-xs">
                      <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                        <strong className="block text-gray-900 dark:text-white mb-1">1. Add &amp; Mask PII</strong>
                        <span className="text-gray-500 dark:text-gray-400">PDF, DOCX, or TXT. All personal identifiers are masked in-browser.</span>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                        <strong className="block text-gray-900 dark:text-white mb-1">2. Indian Law Audit</strong>
                        <span className="text-gray-500 dark:text-gray-400">Non-competes (Sec 27), MSME payment caps, and withholding verified.</span>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50/80 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                        <strong className="block text-gray-900 dark:text-white mb-1">3. Chat &amp; Audit PDF</strong>
                        <span className="text-gray-500 dark:text-gray-400">Ask clause-cited questions and download a verifiable audit report.</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Result Preview */}
                  <div className="lg:col-span-5">
                    <div className="p-4 sm:p-5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-emerald-950/40 dark:to-teal-950/20 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                          Sample Result Preview
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          Est. Score: 52/100 · Caution
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                          Freelance Master Services Agreement
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Role perspective: Freelancer · 9 clauses audited
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="p-2 rounded bg-white/90 dark:bg-slate-900/80 border border-red-200 dark:border-red-900/50 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                          <div>
                            <strong className="text-red-900 dark:text-red-300">Sec 27 Restraint:</strong>{' '}
                            <span className="text-gray-600 dark:text-gray-300">12-month post-termination non-compete is void under Indian law.</span>
                          </div>
                        </div>
                        <div className="p-2 rounded bg-white/90 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                          <div>
                            <strong className="text-amber-900 dark:text-amber-300">MSMED Sec 15:</strong>{' '}
                            <span className="text-gray-600 dark:text-gray-300">Net-60 payment term exceeds the statutory 45-day MSME limit.</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => openContractInReadingRoom(0)}
                        className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Explore This Sample in Reading Room</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Quick Workspace Actions */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Workspace Tools
                  </span>
                </div>
                <div className="quick-actions">
                  {[
                    { label: 'Upload a contract', description: 'Start a new review', icon: Upload, action: () => navigateTo('upload') },
                    { label: 'Open reading room', description: 'Understand the fine print', icon: FileText, action: () => openContractInReadingRoom(selectedFileIndex) },
                    { label: 'Create a draft', description: 'Make your terms clearer', icon: Wand2, action: () => navigateTo('create') },
                    { label: 'Compare documents', description: 'See what changed', icon: Copy, action: () => { setShieldSubTab('compare'); navigateTo('shield'); } },
                    { label: 'Browse templates', description: 'A considered starting point', icon: LayoutGrid, action: () => { setShieldSubTab('templates'); navigateTo('shield'); } },
                    { label: 'Ask your assistant', description: 'Talk through a clause', icon: MessageSquareText, action: () => { setAiAssistantMode('chat'); setAiAssistantOpen(true); } }
                  ].map((action) => (
                    <button className="quick-action" key={action.label} onClick={action.action}>
                      <span className="action-icon">
                        <action.icon size={17} />
                      </span>
                      <ArrowUpRight className="action-arrow" size={15} />
                      <strong>{action.label}</strong>
                      <span>{action.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Rail */}
              <section className="document-collection">
                <div className="collection-heading">
                  <h2>
                    Your documents <span>{files.length}</span>
                  </h2>
                  <div className="collection-controls">
                    <button
                      aria-label="Scroll documents left"
                      onClick={() => documentRail.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      aria-label="Scroll documents right"
                      onClick={() => documentRail.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                    >
                      <ChevronRight size={16} />
                    </button>
                    <span className="collection-rule" />
                    <button
                      className="collection-see-all"
                      onClick={() => document.getElementById('document-table')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      View all <ArrowUpRight size={13} />
                    </button>
                  </div>
                </div>
                <div className="document-rail" ref={documentRail}>
                  {files.map((file, index) => (
                    <button
                      className="collection-card"
                      key={file.id}
                      onClick={() => openContractInReadingRoom(index)}
                    >
                      <div className={'contract-cover cover-' + (index % 3)}>
                        <span className="cover-label">
                          {file.isCustom ? 'YOUR DOCUMENT' : 'SAMPLE AGREEMENT'}
                        </span>
                        <div className="cover-ribbons" aria-hidden="true">
                          {[0, 1, 2, 3, 4].map((n) => (
                            <i key={n} />
                          ))}
                        </div>
                        <span className="cover-monogram">
                          {file.type.includes('Housing') ? 'RE' : file.type.includes('Subscription') ? 'TC' : 'MS'}
                        </span>
                        <div className="cover-footer">
                          <span>{file.clauses.length} clauses</span>
                          <FileCheck size={23} />
                        </div>
                      </div>
                      <div className="contract-card-info">
                        <div>
                          <strong>
                            {file.isCustom
                              ? file.title
                              : index === 0
                              ? 'Freelance agreement'
                              : index === 1
                              ? 'Residential lease'
                              : 'Subscription terms'}
                          </strong>
                          <span>{file.type}</span>
                        </div>
                        <ChevronRight size={17} />
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Document Table Section */}
              <section className="document-table-section" id="document-table">
                <div className="table-heading">
                  <h2>All documents</h2>
                  <label className="document-search">
                    <Search size={15} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Find a document"
                      aria-label="Find a document"
                    />
                    {search && (
                      <button aria-label="Clear search" onClick={() => setSearch('')}>
                        <X size={13} />
                      </button>
                    )}
                  </label>
                </div>
                <div className="document-table">
                  <div className="table-labels">
                    <span>DOCUMENT</span>
                    <span>TYPE</span>
                    <span>CLAUSES</span>
                    <span />
                  </div>
                  {files
                    .map((file, index) => ({ file, index }))
                    .filter(({ file }) =>
                      (file.title + ' ' + file.type).toLowerCase().includes(search.toLowerCase())
                    )
                    .map(({ file, index }) => (
                      <div
                        className="document-row group cursor-pointer"
                        key={file.id}
                        onClick={() => openContractInReadingRoom(index)}
                      >
                        <span className="row-title">
                          <span className="row-icon">
                            <FileText size={18} />
                          </span>
                          <span>
                            <strong>
                              {file.isCustom
                                ? file.title
                                : index === 0
                                ? 'Freelance agreement'
                                : index === 1
                                ? 'Residential lease'
                                : 'Subscription terms'}
                            </strong>
                            <small>{file.isCustom ? 'Uploaded document' : 'Sample document'}</small>
                          </span>
                        </span>
                        <span className="row-type">{file.type}</span>
                        <span className="row-clause-count">
                          {file.clauses.length.toString().padStart(2, '0')}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameContract(file.id, file.title);
                            }}
                            title="Rename"
                            className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-white"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteContract(file.id, file.title);
                            }}
                            title="Delete"
                            className="p-1 rounded text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={13} />
                          </button>
                          <ArrowUpRight size={16} />
                        </div>
                      </div>
                    ))}
                  {!files.some((file) =>
                    (file.title + ' ' + file.type).toLowerCase().includes(search.toLowerCase())
                  ) && (
                    <div className="search-empty">
                      <Search size={24} />
                      <strong>No matching documents</strong>
                      <p>Try another name or document type.</p>
                      <button onClick={() => setSearch('')}>Clear search</button>
                    </div>
                  )}
                </div>
              </section>
            </>
          ) : (
            <section className="workflow-board">
              <div className="workflow-title">
                <div>
                  <span>YOUR REVIEW, STEP BY STEP</span>
                  <h2>
                    From document
                    <br />
                    to decision.
                  </h2>
                </div>
                <span className="workflow-count">
                  Three steps.
                  <br />
                  <strong>One clearer view.</strong>
                </span>
              </div>
              <div className="workflow-columns">
                {[
                  {
                    name: '01 / Prepare',
                    items: ['Add your document', 'Choose your perspective', 'Check the source text'],
                    icon: Upload,
                    action: () => navigateTo('upload'),
                  },
                  {
                    name: '02 / Understand',
                    items: ['Read the summary', 'Inspect risk flags', 'Review missing clauses'],
                    icon: FileCheck,
                    action: () => openContractInReadingRoom(0),
                  },
                  {
                    name: '03 / Refine',
                    items: ['Prepare your questions', 'Refine the wording', 'Review your draft'],
                    icon: Wand2,
                    action: () => navigateTo('create'),
                  },
                ].map((step) => (
                  <div className="workflow-column" key={step.name}>
                    <h3>{step.name}</h3>
                    {step.items.map((item, i) => (
                      <button
                        key={item}
                        style={{ '--step': i } as React.CSSProperties}
                        onClick={step.action}
                      >
                        <span>
                          <step.icon size={17} />
                        </span>
                        {item}
                        <ArrowUpRight size={13} />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
