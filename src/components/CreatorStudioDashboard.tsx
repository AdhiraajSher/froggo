import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Check,
  Plus,
  Flame,
  FileCheck2,
  FolderOpen,
  ArrowUpRight,
  Copy,
  Wand2,
  Layers
} from 'lucide-react';
import {
  CREATOR_ARCHIVE_FILES,
  INDUSTRY_STANDARD_CLAUSES,
  JARGON_DICTIONARY,
  ArchivalDocumentFile
} from '../data/contractsData';

export const CreatorStudioDashboard: React.FC = () => {
  const [archiveFiles, setArchiveFiles] = useState<ArchivalDocumentFile[]>(CREATOR_ARCHIVE_FILES);
  const [activeFileId, setActiveFileId] = useState<string>(CREATOR_ARCHIVE_FILES[0].id);
  const [draftTitle, setDraftTitle] = useState<string>(CREATOR_ARCHIVE_FILES[0].title);
  const [draftText, setDraftText] = useState<string>(CREATOR_ARCHIVE_FILES[0].draftContent);

  // Toggle between Raw Editor and Interactive Jargon Heatmap View
  const [editorMode, setEditorMode] = useState<'heatmap' | 'edit'>('heatmap');

  // Froggo-Safe End-User Summary Preview Modal/Drawer state
  const [showSafeSummary, setShowSafeSummary] = useState<boolean>(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [copiedBadge, setCopiedBadge] = useState<boolean>(false);

  // Mosby's Files Archive interactive expanded row state
  const [expandedArchiveId, setExpandedArchiveId] = useState<string>(CREATOR_ARCHIVE_FILES[0].id);

  // Live Jargon Detection & Metrics Calculation
  const analysis = useMemo(() => {
    const lower = draftText.toLowerCase();
    const detectedJargon = JARGON_DICTIONARY.filter((rule) =>
      lower.includes(rule.phrase.toLowerCase())
    );

    const clauseResults = INDUSTRY_STANDARD_CLAUSES.map((clause) => {
      const isPresent = clause.detectKeywords.some((kw) =>
        lower.includes(kw.toLowerCase())
      );
      return { ...clause, isPresent };
    });

    const presentCount = clauseResults.filter((c) => c.isPresent).length;
    const words = draftText.trim().split(/\s+/).filter(Boolean).length;

    // Readability starts high and drops per archaic jargon phrase, rises with plain clauses
    const rawReadability = Math.max(
      38,
      Math.min(98, 86 - detectedJargon.length * 9 + presentCount * 3)
    );

    const readingGrade =
      detectedJargon.length >= 4
        ? 'Post-Graduate Law (Grade 17+)'
        : detectedJargon.length >= 2
        ? 'College Senior (Grade 14)'
        : 'Plain English (Grade 8 · Ideal)';

    return {
      words,
      detectedJargon,
      clauseResults,
      presentCount,
      readabilityScore: rawReadability,
      readingGrade
    };
  }, [draftText]);

  // Replace a single confusing jargon phrase with plain English
  const handleReplaceJargon = (phrase: string, plainReplacement: string) => {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    setDraftText((prev) => prev.replace(regex, plainReplacement));
  };

  // Replace ALL detected jargon phrases at once
  const handleReplaceAllJargon = () => {
    let updated = draftText;
    JARGON_DICTIONARY.forEach((rule) => {
      const regex = new RegExp(rule.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      updated = updated.replace(regex, rule.plainReplacement);
    });
    setDraftText(updated);
  };

  // Insert a missing industry-standard clause into the draft
  const handleInsertStandardClause = (clauseText: string) => {
    setDraftText((prev) => `${prev.trim()}${clauseText}`);
  };

  // Generate Froggo-Safe End-User Summary with file-separation transition
  const handleGenerateSafeSummary = () => {
    setIsGeneratingSummary(true);
    setShowSafeSummary(true);
    setTimeout(() => {
      setIsGeneratingSummary(false);
    }, 650);
  };

  // Load a document from the Mosby's Files Archive into the active editor
  const handleLoadArchiveFile = (file: ArchivalDocumentFile) => {
    setActiveFileId(file.id);
    setDraftTitle(file.title);
    setDraftText(file.draftContent);
    setShowSafeSummary(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save current draft back to archive list
  const handleSaveToArchive = () => {
    setArchiveFiles((prev) =>
      prev.map((item) =>
        item.id === activeFileId
          ? {
              ...item,
              title: draftTitle,
              draftContent: draftText,
              readabilityScore: analysis.readabilityScore,
              jargonCount: analysis.detectedJargon.length,
              clauseCoverage: `${analysis.presentCount} / ${INDUSTRY_STANDARD_CLAUSES.length} Standard Clauses`,
              status:
                analysis.readabilityScore >= 80 && analysis.presentCount >= 3
                  ? 'Froggo-Safe Certified'
                  : 'Needs Simplification',
              updatedAt: 'Just Now'
            }
          : item
      )
    );
  };

  // Render draft text with interactive highlighted Jargon Heatmap spans
  const renderHeatmapContent = () => {
    if (!draftText.trim()) {
      return <p className="text-neutral-500 italic">Draft is empty. Switch to Edit Raw Text to type or paste terms.</p>;
    }

    // Build regex matching any jargon phrase
    const phrases = JARGON_DICTIONARY.map((j) => j.phrase);
    const pattern = new RegExp(
      `(${phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
      'gi'
    );

    const parts = draftText.split(pattern);

    return parts.map((part, idx) => {
      const matchedRule = JARGON_DICTIONARY.find(
        (r) => r.phrase.toLowerCase() === part.toLowerCase()
      );

      if (matchedRule) {
        return (
          <button
            key={idx}
            onClick={() => handleReplaceJargon(matchedRule.phrase, matchedRule.plainReplacement)}
            title={`Confusing Jargon: ${matchedRule.reason} — Click to replace with "${matchedRule.plainReplacement}"`}
            className={`inline text-left px-1.5 py-0.5 mx-0.5 border font-mono text-xs sm:text-sm transition-colors cursor-pointer ${
              matchedRule.severity === 'high'
                ? 'bg-red-950/80 border-red-500/70 text-red-200 hover:bg-[#98FF98] hover:text-black hover:border-[#98FF98]'
                : 'bg-amber-950/80 border-amber-500/70 text-amber-200 hover:bg-[#98FF98] hover:text-black hover:border-[#98FF98]'
            }`}
          >
            {part}
            <span className="ml-1.5 text-[10px] uppercase opacity-80">
              [Fix Jargon]
            </span>
          </button>
        );
      }

      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="bg-[#080808] text-[#F5F5F5] min-h-screen px-6 sm:px-12 lg:px-20 py-12">
      {/* =====================================================================
          TOP EDITORIAL HEADER & PRIMARY "GENERATE FROGGO-SAFE SUMMARY" CTA
         ===================================================================== */}
      <div className="border-b border-neutral-900 pb-10 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <div className="text-xs font-mono text-[#98FF98] mb-3">
              DASHBOARD B · T&amp;C CREATOR / LEGAL UPLOADER STUDIO
            </div>
            <h1
              className="font-display font-bold tracking-[-0.04em] leading-[0.96] editorial-gradient-text"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.75rem)' }}
            >
              Creator Clarity Studio
            </h1>
          </div>

          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:justify-end items-stretch sm:items-center gap-3">
            <button
              onClick={handleSaveToArchive}
              className="px-4 py-3.5 bg-[#121212] border border-neutral-800 hover:border-neutral-600 text-xs font-mono text-neutral-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Save Snapshot to Archive
            </button>

            <button
              onClick={handleGenerateSafeSummary}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#98FF98] text-[#080808] text-xs font-semibold hover:bg-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Froggo-Safe Summary</span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          METRICS & INSIGHTS STRIP (Readability, Jargon Density, Standard Clauses)
         ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-[#101010] border border-neutral-800 p-6 flex flex-col justify-between">
          <div className="text-xs font-mono text-neutral-400">PLAIN-ENGLISH READABILITY</div>
          <div className="my-3 flex items-baseline gap-2">
            <span
              className={`text-4xl font-display font-bold tabular-nums ${
                analysis.readabilityScore >= 80
                  ? 'text-[#98FF98]'
                  : analysis.readabilityScore >= 60
                  ? 'text-amber-400'
                  : 'text-red-400'
              }`}
            >
              {analysis.readabilityScore}
            </span>
            <span className="text-sm font-mono text-neutral-500">/ 100</span>
          </div>
          <div className="text-xs text-neutral-400">{analysis.readingGrade}</div>
        </div>

        <div className="bg-[#101010] border border-neutral-800 p-6 flex flex-col justify-between">
          <div className="text-xs font-mono text-neutral-400">CONFUSING JARGON HEATMAP</div>
          <div className="my-3 flex items-baseline gap-2">
            <span
              className={`text-4xl font-display font-bold tabular-nums ${
                analysis.detectedJargon.length === 0 ? 'text-[#98FF98]' : 'text-amber-400'
              }`}
            >
              {analysis.detectedJargon.length}
            </span>
            <span className="text-sm font-mono text-neutral-500">traps detected</span>
          </div>
          <div className="text-xs text-neutral-400">
            {analysis.detectedJargon.length === 0
              ? 'Zero archaic legalese remaining'
              : 'Click highlighted words below to simplify'}
          </div>
        </div>

        <div className="bg-[#101010] border border-neutral-800 p-6 flex flex-col justify-between">
          <div className="text-xs font-mono text-neutral-400">INDUSTRY CLAUSE BENCHMARK</div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl font-display font-bold text-white tabular-nums">
              {analysis.presentCount}
            </span>
            <span className="text-sm font-mono text-neutral-500">
              / {INDUSTRY_STANDARD_CLAUSES.length} standard clauses
            </span>
          </div>
          <div className="text-xs text-neutral-400">
            {INDUSTRY_STANDARD_CLAUSES.length - analysis.presentCount === 0
              ? '100% aligned with fair industry standards'
              : `${INDUSTRY_STANDARD_CLAUSES.length - analysis.presentCount} fairness clauses missing`}
          </div>
        </div>

        <div className="bg-[#101010] border border-neutral-800 p-6 flex flex-col justify-between">
          <div className="text-xs font-mono text-neutral-400">FROGGO CERTIFICATION STATUS</div>
          <div className="my-3">
            <span
              className={`text-lg font-display font-bold ${
                analysis.readabilityScore >= 80 && analysis.presentCount >= 3
                  ? 'text-[#98FF98]'
                  : 'text-amber-400'
              }`}
            >
              {analysis.readabilityScore >= 80 && analysis.presentCount >= 3
                ? 'Froggo-Safe Verified'
                : 'Simplification Needed'}
            </span>
          </div>
          <div className="text-xs font-mono text-neutral-500 tabular-nums">
            {analysis.words} WORDS · EST. {Math.max(1, Math.ceil(analysis.words / 180))} MIN READ
          </div>
        </div>
      </div>

      {/* =====================================================================
          GENERATED "FROGGO-SAFE SUMMARY" PREVIEW DRAWER (Unfolds on Action)
         ===================================================================== */}
      <AnimatePresence>
        {showSafeSummary && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12 bg-[#111511] border border-[#98FF98] p-6 sm:p-8"
          >
            {isGeneratingSummary ? (
              <div className="py-8 text-center space-y-3">
                <div className="text-xs font-mono text-[#98FF98]">
                  SIMULATING END-USER FROGGO DECODER...
                </div>
                <p className="text-lg font-display text-white">
                  Building Plain-English Nutrition Label for “{draftTitle}”
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                  <div>
                    <div className="text-xs font-mono text-[#98FF98]">
                      END-USER PREVIEW · FROGGO-SAFE NUTRITION LABEL
                    </div>
                    <h3 className="text-xl sm:text-2xl font-display font-bold text-white mt-1">
                      How Froggo Will Explain “{draftTitle}” to Your Users
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const snippet = `### Froggo-Safe Plain-English Summary: ${draftTitle}\n- Readability Score: ${analysis.readabilityScore}/100 (${analysis.readingGrade})\n- Standard Protections Included: ${analysis.presentCount}/${INDUSTRY_STANDARD_CLAUSES.length}\n- Jargon Traps Remaining: ${analysis.detectedJargon.length}`;
                        navigator.clipboard.writeText(snippet);
                        setCopiedBadge(true);
                        setTimeout(() => setCopiedBadge(false), 2000);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-[#98FF98] text-[#080808] text-xs font-semibold hover:bg-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {copiedBadge ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied Embed Snippet</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Froggo-Safe Summary Embed</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowSafeSummary(false)}
                      className="px-3 py-2 text-xs font-mono text-neutral-400 hover:text-white cursor-pointer"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-7 space-y-3 bg-[#090C09] p-5 border border-neutral-800">
                    <div className="text-xs font-mono text-neutral-400">
                      AI PLAIN-ENGLISH TRANSLATION TO SIGNERS:
                    </div>
                    <p className="text-base text-neutral-100 leading-relaxed">
                      {analysis.detectedJargon.length === 0 && analysis.presentCount >= 3
                        ? `“This agreement is written in clear, balanced plain English (${analysis.readabilityScore}/100). You retain ownership of your content, receive advance notice before changes, have a fair 14-day cure period, and both sides share a proportional liability cap.”`
                        : `“Heads up before signing: While this draft includes ${analysis.presentCount} of 4 standard protections, it currently contains ${analysis.detectedJargon.length} dense legalese phrases (${analysis.detectedJargon
                            .map((j) => `"${j.phrase}"`)
                            .join(', ')}) that tilt discretion toward the drafter.”`}
                    </p>
                  </div>

                  <div className="lg:col-span-5 bg-[#090C09] p-5 border border-neutral-800 space-y-2 text-xs font-mono">
                    <div className="text-neutral-400 mb-2">USER TRUST DIAGNOSTICS:</div>
                    <div className="flex justify-between py-1 border-b border-neutral-900">
                      <span className="text-neutral-400">Estimated User Sign-Off Confidence</span>
                      <span className="text-[#98FF98] tabular-nums">
                        {Math.min(99, analysis.readabilityScore + analysis.presentCount * 2)}%
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-900">
                      <span className="text-neutral-400">Flagged Jargon Blockers</span>
                      <span className="text-white tabular-nums">{analysis.detectedJargon.length}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-400">Industry Benchmark Coverage</span>
                      <span className="text-white tabular-nums">
                        {analysis.presentCount} / {INDUSTRY_STANDARD_CLAUSES.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          MAIN WORKSPACE SPLIT:
          Left (7/12): Live Contract Editor & Interactive Jargon Heatmap
          Right (5/12): Missing Industry Clauses Audit & One-Click Jargon Fixer
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
        {/* LEFT COLUMN: JARGON HEATMAP & DRAFT EDITOR */}
        <div className="lg:col-span-7 bg-[#101010] border border-neutral-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-900 pb-4">
            <div className="flex-1 min-w-[220px]">
              <label htmlFor="draft-title-input" className="text-[11px] font-mono text-neutral-500 block mb-1">
                ACTIVE DOCUMENT TITLE
              </label>
              <input
                id="draft-title-input"
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="w-full bg-transparent text-lg sm:text-xl font-display font-bold text-white focus:outline-none border-b border-transparent focus:border-[#98FF98]"
              />
            </div>

            {/* Mode Switcher: Jargon Heatmap vs Raw Text Edit */}
            <div className="flex items-center bg-[#080808] p-1 border border-neutral-800">
              <button
                onClick={() => setEditorMode('heatmap')}
                className={`px-3.5 py-1.5 text-xs font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  editorMode === 'heatmap'
                    ? 'bg-[#98FF98] text-[#080808] font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Jargon Heatmap View
              </button>
              <button
                onClick={() => setEditorMode('edit')}
                className={`px-3.5 py-1.5 text-xs font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  editorMode === 'edit'
                    ? 'bg-white text-[#080808] font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Edit Raw Text
              </button>
            </div>
          </div>

          {/* Heatmap Legend & Auto-Simplify Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-neutral-400 font-mono">
              <span>HEATMAP LEGEND:</span>
              <span className="text-red-300">High-Friction Legalese</span>
              <span>·</span>
              <span className="text-amber-300">Archaic Phrasing</span>
            </div>

            {analysis.detectedJargon.length > 0 && (
              <button
                onClick={handleReplaceAllJargon}
                className="flex items-center gap-1.5 text-xs font-mono text-[#98FF98] hover:underline cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Auto-Simplify All {analysis.detectedJargon.length} Jargon Phrases</span>
              </button>
            )}
          </div>

          {/* Interactive Heatmap Canvas OR Raw Textarea */}
          {editorMode === 'heatmap' ? (
            <div className="p-6 bg-[#080808] border border-neutral-800 min-h-[360px] font-mono text-sm leading-loose text-neutral-200 whitespace-pre-wrap">
              {renderHeatmapContent()}
            </div>
          ) : (
            <textarea
              rows={14}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Write or paste your Terms & Conditions or contract draft here..."
              className="w-full p-6 bg-[#080808] border border-neutral-800 min-h-[360px] font-mono text-sm leading-relaxed text-neutral-100 focus:outline-none focus:border-[#98FF98]"
            />
          )}
        </div>

        {/* RIGHT SIDEBAR: INDUSTRY STANDARD CLAUSE AUDIT & JARGON INSPECTOR */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Industry Standard Clauses Audit */}
          <div className="bg-[#101010] border border-neutral-800 p-6 space-y-5">
            <div className="border-b border-neutral-900 pb-4">
              <div className="text-xs font-mono text-[#98FF98]">
                BENCHMARK AUDIT · INDUSTRY STANDARDS
              </div>
              <h3 className="text-lg font-display font-semibold text-white mt-1">
                Missing &amp; Present Fairness Clauses
              </h3>
            </div>

            <div className="space-y-3">
              {analysis.clauseResults.map((clause) => (
                <div
                  key={clause.id}
                  className={`p-4 border transition-colors ${
                    clause.isPresent
                      ? 'bg-[#0C120C] border-[#98FF98]/40'
                      : 'bg-[#0B0B0B] border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className={clause.isPresent ? 'text-[#98FF98]' : 'text-amber-400'}>
                      {clause.code} · {clause.isPresent ? 'INCLUDED IN DRAFT' : 'MISSING CLAUSE'}
                    </span>
                    <span className="text-neutral-500">{clause.benchmarkRate}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-white">{clause.title}</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {clause.description}
                  </p>

                  {!clause.isPresent && (
                    <button
                      onClick={() => handleInsertStandardClause(clause.clauseToInsert)}
                      className="mt-3 w-full py-2 px-3 bg-[#161616] hover:bg-[#98FF98] text-neutral-200 hover:text-[#080808] border border-neutral-700 hover:border-[#98FF98] text-xs font-mono font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Insert Standard Clause into Draft</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2. Confusing Jargon Inspector List */}
          <div className="bg-[#101010] border border-neutral-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div className="text-xs font-mono text-neutral-400">
                CONFUSING JARGON REPLACEMENTS ({analysis.detectedJargon.length})
              </div>
            </div>

            {analysis.detectedJargon.length === 0 ? (
              <div className="p-4 bg-[#0B0F0B] border border-[#98FF98]/30 text-xs text-[#98FF98] font-mono">
                All flagged archaic legalese has been simplified into plain English.
              </div>
            ) : (
              <div className="space-y-3">
                {analysis.detectedJargon.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-[#0B0B0B] border border-neutral-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-red-300">“{item.phrase}”</span>
                      <button
                        onClick={() =>
                          handleReplaceJargon(item.phrase, item.plainReplacement)
                        }
                        className="text-[#98FF98] hover:underline cursor-pointer"
                      >
                        Replace →
                      </button>
                    </div>
                    <p className="text-xs text-neutral-400">{item.reason}</p>
                    <div className="text-xs font-mono text-neutral-300 pt-1">
                      Plain-English Fix: <span className="text-[#98FF98]">“{item.plainReplacement}”</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          MOSBY'S FILES INTERACTIVE COLORED ARCHIVE (FILE MANAGEMENT)
         ===================================================================== */}
      <section className="pt-12 border-t border-neutral-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
          <div className="lg:col-span-7">
            <div className="text-xs font-mono text-[#98FF98] mb-2">
              ARCHIVAL FILE REPOSITORY · MOSBY’S SEPARATION ENGINE
            </div>
            <h2
              className="font-display font-bold tracking-[-0.04em] leading-[0.98] editorial-gradient-subtle"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3.75rem)' }}
            >
              Past T&amp;C Documents
            </h2>
          </div>
          <div className="lg:col-span-5 text-left lg:text-right text-xs font-mono text-neutral-500">
            CLICK ANY DIE-CUT FOLDER TAB TO SEPARATE &amp; LOAD INTO STUDIO
          </div>
        </div>

        <div className="pt-4">
          {archiveFiles.map((file, idx) => {
            const isExpanded = expandedArchiveId === file.id;
            const isCurrentlyLoaded = activeFileId === file.id;
            const folderColors = ['#1351D8', '#0E7C47', '#3B1E8C', '#C91D12'];
            const bg = folderColors[idx % folderColors.length];

            return (
              <motion.div
                key={file.id}
                layout
                transition={{ type: 'spring', stiffness: 250, damping: 26 }}
                style={{ zIndex: (idx + 1) * 10 }}
                className="relative -mt-2 first:mt-0"
              >
                {/* Protruding Die-Cut Top Tab */}
                <div className="flex items-end px-4 sm:px-8">
                  <button
                    onClick={() => setExpandedArchiveId(file.id)}
                    style={{
                      backgroundColor: bg,
                      marginLeft: `${idx * 44}px`
                    }}
                    className={`h-9 px-6 rounded-t-xl font-serif text-xs sm:text-sm font-semibold text-white flex items-center gap-3 shadow-md transition-transform cursor-pointer ${
                      isExpanded ? 'translate-y-0 ring-1 ring-white/40' : 'translate-y-1 hover:translate-y-0'
                    }`}
                  >
                    <span>{file.version}</span>
                    <span>·</span>
                    <span>{file.category}</span>
                  </button>
                </div>

                {/* Colored Folder Body */}
                <div
                  onClick={() => setExpandedArchiveId(file.id)}
                  style={{ backgroundColor: bg }}
                  className="rounded-t-md shadow-2xl border-t border-white/25 text-white cursor-pointer overflow-hidden"
                >
                  {/* Top Folder Spine */}
                  <div className="px-6 sm:px-10 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-black/15">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <span className="font-mono text-xs opacity-80 tabular-nums">
                        {file.archiveNumber}
                      </span>
                      <h3 className="text-lg sm:text-xl font-display font-bold text-white">
                        {file.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-6 font-mono text-xs">
                      <span className="hidden sm:inline opacity-90 tabular-nums">
                        READABILITY: {file.readabilityScore}/100
                      </span>
                      <span className="px-2.5 py-1 bg-black/25 text-white">
                        {isCurrentlyLoaded ? 'ACTIVE IN EDITOR' : file.status}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Separated File Folder Drawer */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                        className="px-6 sm:px-10 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                      >
                        <div className="lg:col-span-8 space-y-3">
                          <div className="text-xs font-mono opacity-85">
                            ARCHIVED DRAFT EXCERPT ({file.clauseCoverage} · {file.jargonCount} Jargon Traps · Updated {file.updatedAt}):
                          </div>
                          <div className="p-5 bg-[#F6F4EA] text-[#141413] font-mono text-xs sm:text-sm leading-relaxed shadow-lg">
                            {file.draftContent}
                          </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:justify-end gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoadArchiveFile(file);
                            }}
                            className="px-6 py-3.5 bg-[#F6F4EA] text-[#080808] font-mono text-xs font-bold hover:bg-[#98FF98] transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center gap-2 shadow-lg"
                          >
                            <span>Load File into Studio Editor</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
