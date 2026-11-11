import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Check,
  Copy,
  Layers,
  BookOpen,
  FilePlus2,
  ArrowUpRight
} from 'lucide-react';
import {
  ContractDossier,
  PRESET_CONTRACTS,
  UserRole,
  analyzeCustomContractText
} from '../data/contractsData';

interface UserSummarizerDashboardProps {
  initialRole?: UserRole;
  initialContract?: ContractDossier;
}

const ROLE_OPTIONS: {
  id: UserRole;
  label: string;
  folderColor: string;
  tabText: string;
  focus: string;
}[] = [
  {
    id: 'freelancer',
    label: 'Freelancer',
    folderColor: '#1351D8', // Royal Blue
    tabText: '#FFFFFF',
    focus: 'Focuses on IP ownership, Net-60 payment traps, kill fees & non-competes'
  },
  {
    id: 'tenant',
    label: 'Tenant',
    folderColor: '#0E7C47', // Emerald Green
    tabText: '#FFFFFF',
    focus: 'Focuses on joint roommate liability, deposit skims, auto-renewals & entry notice'
  },
  {
    id: 'student',
    label: 'Student',
    folderColor: '#D4E119', // Chartreuse Yellow
    tabText: '#080808',
    focus: 'Focuses on stipend clawbacks, hackathon/thesis IP claims & intern restrictions'
  }
];

const SEPARATION_LAYERS = [
  {
    code: 'LAYER 01',
    label: 'Segmenting Verbatim Clauses & Definitions',
    pages: 'Pages 1–14',
    bg: '#1351D8',
    text: '#FFFFFF'
  },
  {
    code: 'LAYER 02',
    label: 'Isolating Financial Obligations & Deadlines',
    pages: 'Fee Schedules',
    bg: '#0E7C47',
    text: '#FFFFFF'
  },
  {
    code: 'LAYER 03',
    label: 'Cross-Checking One-Sided Risk Flags',
    pages: 'Liability & IP',
    bg: '#3B1E8C',
    text: '#FFFFFF'
  },
  {
    code: 'LAYER 04',
    label: 'Auditing Missing Standard Protections',
    pages: 'Redline Synthesis',
    bg: '#C91D12',
    text: '#FFFFFF'
  }
];

const STICKY_PALETTE = ['#E88D96', '#EEDD6D', '#6DBAA1', '#98FF98', '#8AB4F8'];

export const UserSummarizerDashboard: React.FC<UserSummarizerDashboardProps> = ({
  initialRole = 'freelancer',
  initialContract
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [activeContract, setActiveContract] = useState<ContractDossier>(
    initialContract ||
      PRESET_CONTRACTS.find((c) => c.recommendedRole === initialRole) ||
      PRESET_CONTRACTS[0]
  );

  // Toggle between Dark Editorial Paper and Mosby's Cream Loose-Leaf 3-Ring Paper
  const [paperTheme, setPaperTheme] = useState<'cream-dossier' | 'dark-brutalist'>('cream-dossier');

  // Selected risk flag ID (syncs right sidebar sticky note with left original text clause)
  const [selectedFlagId, setSelectedFlagId] = useState<string>(
    activeContract.riskFlags[0]?.id || ''
  );
  const [rightSidebarTab, setRightSidebarTab] = useState<'risks' | 'missing'>('risks');
  const [showUploadPanel, setShowUploadPanel] = useState<boolean>(false);
  const [customPasteText, setCustomPasteText] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Mosby's Files "File Separation" processing animation state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<number>(0);

  // Copy feedback states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Refs for scrolling to highlighted clause in original contract pane
  const clauseRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFileSeparationSequence = (nextContract: ContractDossier, nextRole?: UserRole) => {
    setIsProcessing(true);
    setProcessingStep(0);

    const t1 = setTimeout(() => setProcessingStep(1), 240);
    const t2 = setTimeout(() => setProcessingStep(2), 480);
    const t3 = setTimeout(() => setProcessingStep(3), 720);
    const t4 = setTimeout(() => {
      setActiveContract(nextContract);
      if (nextRole) setSelectedRole(nextRole);
      setSelectedFlagId(nextContract.riskFlags[0]?.id || '');
      setIsProcessing(false);
      setShowUploadPanel(false);
    }, 1050);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  };

  const handleRoleSwitch = (role: UserRole) => {
    setSelectedRole(role);
    const matchingPreset = PRESET_CONTRACTS.find((c) => c.recommendedRole === role);
    if (matchingPreset && matchingPreset.id !== activeContract.id) {
      triggerFileSeparationSequence(matchingPreset, role);
    }
  };

  const handleSelectRiskFlag = (flagId: string, clauseId: string) => {
    setSelectedFlagId(flagId);
    const targetEl = clauseRefs.current[clauseId];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleAnalyzeCustomText = () => {
    if (!customPasteText.trim()) return;
    const analyzed = analyzeCustomContractText(customPasteText, selectedRole);
    triggerFileSeparationSequence(analyzed, selectedRole);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = typeof e.target?.result === 'string' ? e.target.result : '';
      if (content.trim().length > 20) {
        setCustomPasteText(content);
        const analyzed = analyzeCustomContractText(content, selectedRole);
        analyzed.title = file.name.replace(/\.[^/.]+$/, '');
        triggerFileSeparationSequence(analyzed, selectedRole);
      } else {
        const fallback = analyzeCustomContractText(
          `Uploaded Document: ${file.name}. Party A requires Party B to indemnify and hold harmless without limitation, with automatic 12-month renewal and Net-60 payment terms.`,
          selectedRole
        );
        fallback.title = file.name;
        triggerFileSeparationSequence(fallback, selectedRole);
      }
    };
    reader.readAsText(file);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeClauseId =
    activeContract.riskFlags.find((f) => f.id === selectedFlagId)?.clauseId || '';

  const currentRoleConfig =
    ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[0];

  return (
    <div className="bg-[#080808] text-[#F5F5F5] min-h-screen px-6 sm:px-12 lg:px-20 py-12">
      {/* =====================================================================
          HEADER & ROLE LENS SELECTOR
         ===================================================================== */}
      <div className="border-b border-neutral-900 pb-10 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <div className="text-xs font-mono text-[#98FF98] mb-3">
              DASHBOARD A · USER / SUMMARIZER WORKSPACE
            </div>
            <h1
              className="font-display font-bold tracking-[-0.04em] leading-[0.96] editorial-gradient-text"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.75rem)' }}
            >
              Plain-English Decoder
            </h1>
          </div>

          <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-end space-y-3">
            <span className="text-xs font-mono text-neutral-400">
              SELECT YOUR SIGNING ROLE LENS (DIE-CUT FOLDER TABS)
            </span>
            <div className="flex items-end gap-2">
              {ROLE_OPTIONS.map((roleOpt) => {
                const isActive = selectedRole === roleOpt.id;
                return (
                  <button
                    key={roleOpt.id}
                    onClick={() => handleRoleSwitch(roleOpt.id)}
                    style={{
                      backgroundColor: isActive ? roleOpt.folderColor : '#151515',
                      color: isActive ? roleOpt.tabText : '#A3A3A3'
                    }}
                    className={`px-5 py-2.5 rounded-t-xl font-serif text-xs sm:text-sm font-semibold transition-transform cursor-pointer whitespace-nowrap shrink-0 border-t border-x border-white/15 ${
                      isActive ? 'translate-y-0 shadow-lg' : 'translate-y-1 hover:translate-y-0'
                    }`}
                  >
                    {roleOpt.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-neutral-500 text-left lg:text-right">
              {currentRoleConfig.focus}
            </p>
          </div>
        </div>

        {/* Preset Dossier Switcher + Sheet Mode + Upload/Paste Trigger Bar */}
        <div className="mt-8 pt-6 border-t border-neutral-900/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-neutral-500 mr-2">ACTIVE DOSSIER:</span>
            {PRESET_CONTRACTS.map((preset) => {
              const isCurrent = activeContract.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() =>
                    triggerFileSeparationSequence(preset, preset.recommendedRole)
                  }
                  className={`px-3.5 py-2 text-xs font-mono border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isCurrent
                      ? 'bg-[#F6F4EA] text-[#080808] border-[#F6F4EA] font-semibold'
                      : 'bg-[#0E0E0E] text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-neutral-200'
                  }`}
                >
                  {preset.fileCode} · {preset.recommendedRole.toUpperCase()}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() =>
                setPaperTheme((prev) =>
                  prev === 'cream-dossier' ? 'dark-brutalist' : 'cream-dossier'
                )
              }
              className="px-3.5 py-2 text-xs font-mono text-neutral-300 bg-[#111111] border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Sheet Style: {paperTheme === 'cream-dossier' ? '3-Ring Archival Paper' : 'Dark Brutalist'}
            </button>

            <button
              onClick={() => triggerFileSeparationSequence(activeContract, selectedRole)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono text-neutral-300 bg-[#111111] border border-neutral-800 hover:border-neutral-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Replay Mosby's File Separation Breakdown"
            >
              <Layers className="w-3.5 h-3.5 text-[#98FF98]" />
              <span>Replay File Separation</span>
            </button>

            <button
              onClick={() => setShowUploadPanel((prev) => !prev)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                showUploadPanel
                  ? 'bg-white text-black'
                  : 'bg-[#98FF98] text-[#080808] hover:bg-white'
              }`}
            >
              <FilePlus2 className="w-3.5 h-3.5" />
              <span>{showUploadPanel ? 'Close Input Drawer' : 'Upload or Paste Contract'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          COLLAPSIBLE DRAG-AND-DROP / PASTE CONTRACT DRAWER
         ===================================================================== */}
      <AnimatePresence>
        {showUploadPanel && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="mb-12 p-6 sm:p-8 bg-[#101010] border border-neutral-800 grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Drag & Drop File Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile) handleFileUpload(droppedFile);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`lg:col-span-5 border border-dashed p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-[#98FF98] bg-[#98FF98]/5'
                  : 'border-neutral-700 hover:border-neutral-500 bg-[#0B0B0B]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <Upload className="w-7 h-7 text-[#98FF98] mb-4" />
              <p className="text-sm font-medium text-neutral-100">
                Drop a contract file here or click to browse
              </p>
              <p className="text-xs text-neutral-500 mt-2 max-w-xs">
                Supports rent agreements, freelance SOWs, internship offers, and app T&amp;Cs (.txt, .md, .pdf)
              </p>
            </div>

            {/* Direct Text Paste Area */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="contract-paste-input"
                  className="text-xs font-mono text-neutral-400"
                >
                  OR PASTE RAW LEGAL CLAUSES BELOW ({selectedRole.toUpperCase()} LENS ACTIVE)
                </label>
                <button
                  onClick={() =>
                    setCustomPasteText(
                      `1. COMPENSATION & ACCEPTANCE: Contractor shall deliver all software milestones subject to Client's sole and absolute discretion. Undisputed invoices shall be paid Net-60.\n\n2. INTELLECTUAL PROPERTY: Contractor irrevocably assigns all pre-existing libraries, tools, and work product in perpetuity throughout the universe to Client.\n\n3. INDEMNITY & NON-COMPETE: Contractor shall indemnify and hold harmless Client without limitation, and shall not provide services to any competing software company for 18 months.`
                    )
                  }
                  className="text-xs text-[#98FF98] hover:underline cursor-pointer"
                >
                  Insert Sample Risky Clause Text
                </button>
              </div>

              <textarea
                id="contract-paste-input"
                rows={5}
                value={customPasteText}
                onChange={(e) => setCustomPasteText(e.target.value)}
                placeholder="Paste any lease, freelance agreement, or Terms & Conditions text here to run Froggo's file-separation risk analysis..."
                className="w-full p-4 bg-[#080808] border border-neutral-800 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-[#98FF98] font-mono leading-relaxed"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowUploadPanel(false)}
                  className="px-4 py-2.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAnalyzeCustomText}
                  disabled={!customPasteText.trim()}
                  className="px-6 py-2.5 bg-[#98FF98] text-[#080808] text-xs font-semibold hover:bg-white disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Separate &amp; Decode Text
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          MOSBY'S FILES COLORED FOLDER SEPARATION PROCESSING ANIMATION
         ===================================================================== */}
      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div
            key="processing-separation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-16 px-6 bg-[#0C0C0C] border border-neutral-800 mb-12"
          >
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between text-xs font-mono text-[#98FF98] mb-6">
                <span>MOSBY’S ARCHIVAL DECONSTRUCTION IN PROGRESS</span>
                <span className="tabular-nums">STAGE 0{processingStep + 1} / 04</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight text-white mb-10">
                Separating Contract Into Colored Dossier Layers...
              </h2>

              {/* Colored Die-Cut Archival Folders Separating Vertically */}
              <div className="space-y-3">
                {SEPARATION_LAYERS.map((layer, index) => {
                  const isActive = processingStep >= index;
                  return (
                    <motion.div
                      key={layer.code}
                      initial={{ y: -24 * index, opacity: 0.35 }}
                      animate={{
                        y: isActive ? index * 8 : 0,
                        opacity: isActive ? 1 : 0.35
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 240,
                        damping: 24
                      }}
                    >
                      {/* Protruding Die-Cut Tab */}
                      <div
                        style={{
                          backgroundColor: layer.bg,
                          color: layer.text,
                          marginLeft: `${index * 48}px`
                        }}
                        className="inline-block px-5 py-1.5 rounded-t-xl font-serif text-xs font-semibold"
                      >
                        {layer.code}
                      </div>
                      {/* Colored Folder Strip */}
                      <div
                        style={{
                          backgroundColor: layer.bg,
                          color: layer.text
                        }}
                        className="p-5 rounded-b-md rounded-tr-md shadow-xl flex items-center justify-between border-t border-white/25"
                      >
                        <span className="font-mono text-sm sm:text-base font-medium">
                          {layer.label}
                        </span>
                        <span className="font-mono text-xs opacity-90 tabular-nums">
                          {layer.pages} →
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeContract.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* =================================================================
                PROMINENT RISK SCORE & CONTRACT TELEMETRY STRIP
               ================================================================= */}
            <div className="bg-[#101010] border border-neutral-800 p-6 sm:p-8 mb-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Dossier Title & Metadata */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                    <span>{activeContract.fileCode}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeContract.documentType}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{activeContract.wordCount.toLocaleString()} words</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                    {activeContract.title}
                  </h2>
                  <p className="text-sm text-neutral-400">
                    Counterparty: <span className="text-neutral-200">{activeContract.counterparty}</span>
                  </p>
                </div>

                {/* Center: Key Obligations 4-Metric Grid */}
                <div className="lg:col-span-4 grid grid-cols-2 gap-4 border-y lg:border-y-0 lg:border-x border-neutral-800/80 py-4 lg:py-0 lg:px-6">
                  {activeContract.plainSummary.keyObligations.map((ob) => (
                    <div key={ob.label} className="space-y-1">
                      <div className="text-xs text-neutral-500">{ob.label}</div>
                      <div className="text-base font-mono font-semibold text-white tabular-nums">
                        {ob.metric}
                      </div>
                      <div className="text-xs text-neutral-400 line-clamp-1" title={ob.detail}>
                        {ob.detail}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: Prominent Visual Risk Score Dial */}
                <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-6">
                  <div className="text-left lg:text-right">
                    <div className="text-xs font-mono text-neutral-400 uppercase">
                      Froggo Risk Index
                    </div>
                    <div
                      className={`text-4xl sm:text-5xl font-display font-extrabold tabular-nums tracking-tight ${
                        activeContract.riskScore >= 75
                          ? 'text-amber-400'
                          : 'text-[#98FF98]'
                      }`}
                    >
                      {activeContract.riskScore}
                      <span className="text-lg font-normal text-neutral-500">/100</span>
                    </div>
                    <div className="text-xs text-neutral-300 mt-1">
                      {activeContract.riskVerdict}
                    </div>
                  </div>

                  {/* Radial Dial SVG */}
                  <div className="relative w-16 h-16 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        fill="none"
                        stroke="#222222"
                        strokeWidth="5"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        fill="none"
                        stroke={activeContract.riskScore >= 75 ? '#FBBF24' : '#98FF98'}
                        strokeWidth="5"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={
                          2 * Math.PI * 26 * (1 - activeContract.riskScore / 100)
                        }
                        strokeLinecap="square"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-neutral-300">
                      RISK
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================
                GEMINI NOTEBOOK + MOSBY'S FILES SPLIT-SCREEN WORKSPACE
                Left: 3-Ring Loose-Leaf Cream Dossier Sheet + Verbatim Clauses
                Right: Interactive Colored Sticky Notes & Protruding Folder Tabs
               ================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
              {/* LEFT COLUMN (7/12): PLAIN-ENGLISH SUMMARY & ANNOTATED SOURCE TEXT */}
              <div className="lg:col-span-7 space-y-8">
                {/* 1. Plain-English Executive Summary on Colored Folder Mat + 3-Ring Paper */}
                <div
                  style={{ backgroundColor: currentRoleConfig.folderColor }}
                  className="p-3 sm:p-5 rounded-md shadow-2xl"
                >
                  <div
                    className={
                      paperTheme === 'cream-dossier'
                        ? 'bg-[#F6F4EA] text-[#141413] p-6 sm:p-10 relative shadow-md'
                        : 'bg-[#101010] text-[#F5F5F5] p-6 sm:p-10 relative border border-neutral-800'
                    }
                  >
                    {/* 3-Ring Binder Holes on Left Edge (like Mosby's Files video 00:22-00:24) */}
                    <div
                      aria-hidden="true"
                      className="hidden sm:flex flex-col justify-between items-center absolute left-3 top-12 bottom-12 w-5"
                    >
                      <span className="w-4 h-4 rounded-full bg-[#141413]" />
                      <span className="w-4 h-4 rounded-full bg-[#141413]" />
                      <span className="w-4 h-4 rounded-full bg-[#141413]" />
                    </div>

                    <div className="sm:pl-8 space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/15 pb-4">
                        <div className="flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4" />
                          <h3 className="text-xs sm:text-sm font-mono uppercase tracking-wider font-bold">
                            01. Plain-English Summary ({selectedRole} Dossier)
                          </h3>
                        </div>
                        <span className="text-xs font-mono opacity-70">
                          {activeContract.pageCount} PAGES DECODED
                        </span>
                      </div>

                      {/* Giant Drop-Cap Editorial Summary (Mosby's Files style) */}
                      <p className="font-serif text-lg sm:text-2xl leading-relaxed first-letter:text-6xl first-letter:font-display first-letter:font-light first-letter:float-left first-letter:mr-4 first-letter:leading-none">
                        {activeContract.plainSummary.headline}
                      </p>

                      {/* Architectural Node Line (o───────────o) */}
                      <div className="flex items-center gap-2 py-1 font-mono text-xs opacity-80">
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-current shrink-0" />
                        <div className="h-[1.5px] bg-current flex-1" />
                        <span className="w-2.5 h-2.5 rounded-full bg-current shrink-0" />
                        <span className="uppercase font-semibold">
                          KEY OBLIGATIONS &amp; FINE PRINT
                        </span>
                      </div>

                      <div className="space-y-4 font-serif text-base leading-relaxed opacity-90">
                        {activeContract.plainSummary.overview.map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Synchronized Original Contract Clauses (Highlights when Risk Flag is clicked) */}
                <div className="bg-[#0C0C0C] border border-neutral-800 p-6 sm:p-8 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-900 pb-4">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-neutral-200">
                      02. Verbatim Contract Source &amp; Clause Citations
                    </h3>
                    <span className="text-xs text-neutral-500">
                      Click any Sticky Note on the right to jump &amp; highlight clause
                    </span>
                  </div>

                  <div className="space-y-5">
                    {activeContract.clauses.map((clause) => {
                      const isHighlighted = activeClauseId === clause.id;
                      const linkedFlag = activeContract.riskFlags.find(
                        (f) => f.clauseId === clause.id
                      );

                      return (
                        <div
                          key={clause.id}
                          ref={(el) => {
                            clauseRefs.current[clause.id] = el;
                          }}
                          onClick={() => {
                            if (linkedFlag) setSelectedFlagId(linkedFlag.id);
                          }}
                          className={`p-5 border transition-all duration-200 cursor-pointer ${
                            isHighlighted
                              ? 'bg-[#161916] border-[#98FF98]'
                              : 'bg-[#101010] border-neutral-900 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs text-[#98FF98] tabular-nums">
                                SECTION {clause.sectionNumber}
                              </span>
                              <h4 className="text-base font-semibold text-white">
                                {clause.title}
                              </h4>
                            </div>
                            {linkedFlag && (
                              <span className="text-xs font-mono text-amber-400">
                                LINKED TO {linkedFlag.tabCode}
                              </span>
                            )}
                          </div>

                          {/* Verbatim Legal Text */}
                          <p
                            className={`font-mono text-xs sm:text-sm leading-relaxed p-3.5 border ${
                              isHighlighted
                                ? 'bg-[#090D09] border-[#98FF98]/40 text-neutral-100'
                                : 'bg-[#080808] border-neutral-900 text-neutral-400'
                            }`}
                          >
                            {clause.verbatimText}
                          </p>

                          {/* Plain-English Translation Callout */}
                          <div className="mt-3 pt-3 border-t border-neutral-900 flex items-start justify-between gap-4">
                            <p className="text-xs sm:text-sm text-neutral-300">
                              <span className="text-[#98FF98] font-mono text-xs mr-2">
                                PLAIN ENGLISH:
                              </span>
                              {clause.plainMeaning}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDEBAR (5/12): MOSBY'S FILES COLORED STICKY NOTES & DIE-CUT TABS */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
                {/* Die-Cut Folder Tab Switcher Header */}
                <div className="flex items-end gap-2 border-b border-neutral-800 pt-2">
                  <button
                    onClick={() => setRightSidebarTab('risks')}
                    className={`px-6 py-3 rounded-t-xl font-serif text-sm font-semibold transition-transform cursor-pointer whitespace-nowrap shrink-0 ${
                      rightSidebarTab === 'risks'
                        ? 'bg-[#C91D12] text-white translate-y-0 shadow-lg'
                        : 'bg-[#141414] text-neutral-400 hover:text-white translate-y-1'
                    }`}
                  >
                    Risk Flags ({activeContract.riskFlags.length})
                  </button>
                  <button
                    onClick={() => setRightSidebarTab('missing')}
                    className={`px-6 py-3 rounded-t-xl font-serif text-sm font-semibold transition-transform cursor-pointer whitespace-nowrap shrink-0 ${
                      rightSidebarTab === 'missing'
                        ? 'bg-[#1351D8] text-white translate-y-0 shadow-lg'
                        : 'bg-[#141414] text-neutral-400 hover:text-white translate-y-1'
                    }`}
                  >
                    Missing Clauses ({activeContract.missingClauses.length})
                  </button>
                </div>

                {/* Tab 1: Interactive Tilted Sticky-Note Cards for Risk Flags (like 00:25-00:27 in video) */}
                {rightSidebarTab === 'risks' ? (
                  <div className="space-y-4">
                    <div className="text-xs font-mono text-neutral-500 px-1">
                      CLICK ANY STICKY NOTE TO HIGHLIGHT THE VERBATIM CLAUSE ON THE LEFT
                    </div>

                    {activeContract.riskFlags.map((flag, idx) => {
                      const isSelected = selectedFlagId === flag.id;
                      const stickyBg = STICKY_PALETTE[idx % STICKY_PALETTE.length];

                      return (
                        <motion.div
                          key={flag.id}
                          layout
                          whileHover={{ scale: 1.01 }}
                          onClick={() => handleSelectRiskFlag(flag.id, flag.clauseId)}
                          style={{
                            backgroundColor: isSelected ? stickyBg : '#141414',
                            color: isSelected ? '#111111' : '#F5F5F5',
                            rotate: isSelected ? (idx % 2 === 0 ? -0.8 : 0.8) : 0
                          }}
                          className={`p-5 border transition-colors cursor-pointer shadow-xl ${
                            isSelected
                              ? 'border-white my-4'
                              : 'border-neutral-800 hover:border-neutral-600'
                          }`}
                        >
                          {/* Top Archival File Tab Strip */}
                          <div
                            className={`pb-2.5 mb-3 border-b flex items-center justify-between text-xs font-mono ${
                              isSelected ? 'border-black/20' : 'border-neutral-800'
                            }`}
                          >
                            <span className="font-bold">{flag.tabCode}</span>
                            <span className="opacity-75">{flag.category}</span>
                          </div>

                          {/* Card Body */}
                          <div className="space-y-3">
                            <h4 className="text-lg font-display font-extrabold uppercase tracking-tight leading-snug">
                              {flag.title}
                            </h4>
                            <p className="font-mono text-xs sm:text-sm leading-relaxed opacity-90">
                              {flag.plainExplanation}
                            </p>

                            {/* Role-Specific Impact Box */}
                            <div
                              className={`p-3.5 border space-y-1 ${
                                isSelected
                                  ? 'bg-black/10 border-black/20 text-[#111111]'
                                  : 'bg-[#090909] border-neutral-800 text-neutral-300'
                              }`}
                            >
                              <div className="text-[11px] font-mono uppercase font-bold">
                                Impact on You as a {selectedRole}:
                              </div>
                              <p className="text-xs leading-relaxed">
                                {flag.roleImpact[selectedRole]}
                              </p>
                            </div>

                            {isSelected && (
                              <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold">
                                <span>● SOURCE CLAUSE HIGHLIGHTED ON LEFT</span>
                                <span>SEC 0{idx + 1} →</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  /* Tab 2: Missing Clauses Interactive File Cards */
                  <div className="space-y-4">
                    <div className="text-xs font-mono text-neutral-500 px-1">
                      STANDARD PROTECTIONS OMITTED FROM THIS CONTRACT
                    </div>

                    {activeContract.missingClauses.map((mc, idx) => (
                      <div
                        key={mc.id}
                        style={{
                          backgroundColor: idx % 2 === 0 ? '#6DBAA1' : '#EEDD6D'
                        }}
                        className="text-[#111111] border border-black/20 p-5 space-y-4 shadow-xl"
                      >
                        <div className="flex items-center justify-between text-xs font-mono font-bold border-b border-black/15 pb-2">
                          <span>{mc.tabCode}</span>
                          <span>{mc.importance} Protection</span>
                        </div>

                        <h4 className="text-lg font-display font-extrabold uppercase tracking-tight">
                          {mc.title}
                        </h4>

                        <p className="text-xs sm:text-sm font-mono leading-relaxed">
                          {mc.whyYouNeedIt}
                        </p>

                        <div className="p-3.5 bg-[#F6F4EA] border border-black/20 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold text-neutral-700">
                              SUGGESTED PROTECTIVE CLAUSE TO ADD:
                            </span>
                            <button
                              onClick={() => handleCopyText(mc.id, mc.suggestedWording)}
                              className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#1351D8] hover:underline cursor-pointer"
                            >
                              {copiedId === mc.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Clause</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs font-mono text-neutral-900 leading-relaxed">
                            {mc.suggestedWording}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* =================================================================
                SECTION 3: ACTIONABLE INSIGHTS — QUESTIONS TO ASK OR NEGOTIATE
               ================================================================= */}
            <div className="bg-[#101010] border border-neutral-800 p-6 sm:p-10 mb-12">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-900 pb-6 mb-8">
                <div>
                  <div className="text-xs font-mono text-[#98FF98] mb-2">
                    03. ACTIONABLE NEGOTIATION PLAYBOOK
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                    Questions to Ask or Negotiate Before Signing
                  </h3>
                </div>

                <button
                  onClick={() => {
                    const allEmails = activeContract.negotiationQuestions
                      .map((q) => q.emailSnippet)
                      .join('\n\n');
                    handleCopyText('all-negotiation-emails', allEmails);
                  }}
                  className="flex items-center gap-2 px-5 py-3 bg-[#98FF98] text-[#080808] text-xs font-semibold hover:bg-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {copiedId === 'all-negotiation-emails' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Full Negotiation Email Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Complete Counter-Offer Email</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {activeContract.negotiationQuestions.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-[#0B0B0B] border border-neutral-800 p-6 flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="text-xs font-mono text-neutral-400">
                        0{idx + 1} · {item.targetClause}
                      </div>
                      <h4 className="text-base font-semibold text-white leading-snug">
                        “{item.questionToAsk}”
                      </h4>
                      <div className="p-3.5 bg-[#121212] border border-neutral-800 space-y-2">
                        <div className="text-[11px] font-mono text-[#98FF98]">
                          READY-TO-SEND EMAIL SCRIPT:
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          {item.emailSnippet}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-900 space-y-3">
                      <p className="text-xs text-neutral-500">
                        <strong className="text-neutral-300">Why this works:</strong>{' '}
                        {item.leverageNote}
                      </p>
                      <button
                        onClick={() => handleCopyText(item.id, item.emailSnippet)}
                        className="w-full py-2.5 border border-neutral-700 hover:border-[#98FF98] text-xs font-mono text-neutral-200 hover:text-[#98FF98] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied Script to Clipboard</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy This Question</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          CLEAR, SUBTLE "NOT LEGAL ADVICE" DISCLAIMER FOOTER
         ===================================================================== */}
      <footer className="pt-6 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500">
        <div>
          <strong className="text-neutral-400 font-medium">Disclaimer: Not Legal Advice.</strong>{' '}
          Froggo provides automated plain-English summaries and clause citations for informational
          and educational purposes only.
        </div>
        <div className="font-mono">
          CONSULT A QUALIFIED ATTORNEY FOR HIGH-STAKES AGREEMENTS
        </div>
      </footer>
    </div>
  );
};
