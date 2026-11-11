import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { ContractDossier, PRESET_CONTRACTS, UserRole } from '../data/contractsData';
import { MosbyFileCabinet } from './MosbyFileCabinet';

interface LandingViewProps {
  onOpenSummarizer: (role?: UserRole, presetContract?: ContractDossier) => void;
  onOpenCreator: () => void;
}

const STAGGERED_DOSSIER_COLUMNS = [
  {
    id: 'col-1',
    folderColor: '#1351D8', // Royal Blue
    stickyPrimary: '#6DBAA1', // Teal
    stickySecondary: '#EEDD6D', // Yellow
    offsetClass: 'lg:mt-24',
    role: 'freelancer' as UserRole,
    tabName: 'Freelance MSA',
    title: 'Vanguard Labs Contractor IP',
    dropLetter: 'F',
    leadText:
      'reelance software agreements often hide sweeping background IP assignments inside standard deliverables clauses.',
    cardTitle: 'BACKGROUND IP SWEEP (SEC 3.1)',
    cardBody:
      'Transfers ownership of pre-existing code libraries and design systems unless explicitly carved out in Exhibit A.',
    secondaryCardTitle: 'NET-60 PAYOUT TRAP',
    secondaryCardBody: 'Payment tied to subjective client satisfaction with zero late-fee interest.'
  },
  {
    id: 'col-2',
    folderColor: '#D4E119', // Chartreuse Yellow
    stickyPrimary: '#E88D96', // Pink
    stickySecondary: '#6DBAA1', // Teal
    offsetClass: 'lg:mt-10',
    role: 'tenant' as UserRole,
    tabName: 'Student Lease',
    title: 'Meridian Campus Co-Living',
    dropLetter: 'J',
    leadText:
      'oint and several liability turns an individual bedroom lease into a shared financial guarantee for three strangers.',
    cardTitle: 'ROOMMATE ARREARS (SEC 2.3)',
    cardBody:
      'Landlord can legally pursue any single student tenant for 100% of the $5,800/mo unit rent and common damages.',
    secondaryCardTitle: '90-DAY ROLLOVER LOCK',
    secondaryCardBody: 'Automatically renews for 12 months at +8% rent unless physical mail is sent.'
  },
  {
    id: 'col-3',
    folderColor: '#C91D12', // Crimson Red
    stickyPrimary: '#4A8FE7', // Blue
    stickySecondary: '#EEDD6D', // Yellow
    offsetClass: 'lg:mt-0',
    role: 'student' as UserRole,
    tabName: 'Intern Offer',
    title: 'Helios Quantitative Offer',
    dropLetter: 'I',
    leadText:
      'nternship invention clauses frequently overreach beyond working hours to claim student hackathons and thesis research.',
    cardTitle: 'STIPEND CLAWBACK (SEC 3.2)',
    cardBody:
      'Requires repaying 100% of your $3,500 summer housing stipend within 14 days if you decline a full-time return offer.',
    secondaryCardTitle: '24/7 HACKATHON IP CLAIM',
    secondaryCardBody: 'Assigns weekend and dorm-room side projects built during the 12-week summer.'
  },
  {
    id: 'col-4',
    folderColor: '#3B1E8C', // Deep Indigo Purple
    stickyPrimary: '#EEDD6D', // Yellow
    stickySecondary: '#E88D96', // Pink
    offsetClass: 'lg:mt-16',
    role: 'freelancer' as UserRole,
    tabName: 'Creator T&Cs',
    title: 'NovaCloud AI Platform Terms',
    dropLetter: 'S',
    leadText:
      'ilent terms updates and perpetual worldwide AI training licenses strip creators of ownership without an opt-in prompt.',
    cardTitle: 'AI TRAINING LICENSE (SEC 2.4)',
    cardBody:
      'Grants an irrevocable worldwide sub-licensable right to train commercial models on private workspace files.',
    secondaryCardTitle: 'UNILATERAL FEE HIKE',
    secondaryCardBody: 'Continued login after a silent webpage update is deemed conclusive consent.'
  }
];

export const LandingView: React.FC<LandingViewProps> = ({
  onOpenSummarizer,
  onOpenCreator
}) => {
  const [headlineVariant, setHeadlineVariant] = useState<'decoded' | 'confidence'>('decoded');

  const lines =
    headlineVariant === 'decoded'
      ? ['Legal Text', 'Decoded In', 'Seconds']
      : ['Sign With', 'Complete', 'Confidence'];

  return (
    <div className="bg-[#080808] text-[#F5F5F5] min-h-screen">
      {/* =====================================================================
          SECTION 1: BRUTALIST-EDITORIAL HERO (Screenshot 4 Reference)
         ===================================================================== */}
      <section className="relative min-h-[86vh] flex flex-col justify-between px-6 sm:px-12 lg:px-20 pt-10 pb-20 border-b border-neutral-900">
        {/* Top subtle editorial index row */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500 pb-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-neutral-400">ARCHIVE REF. 2026-FG</span>
            <span aria-hidden="true">·</span>
            <span>Legal Contract Intelligence</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() =>
                setHeadlineVariant((prev) => (prev === 'decoded' ? 'confidence' : 'decoded'))
              }
              className="text-neutral-400 hover:text-[#98FF98] transition-colors underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
            >
              Switch Editorial Cover ({headlineVariant === 'decoded' ? '01/02' : '02/02'})
            </button>
          </div>
          <div className="font-mono text-neutral-500">
            <span>PLAIN-ENGLISH ENGINE · NOT LEGAL ADVICE</span>
          </div>
        </div>

        {/* Massive Gradient Display Headline (Top-Left Anchor) */}
        <div className="my-auto py-6">
          <h1
            aria-label={lines.join(' ')}
            className="font-display font-bold tracking-[-0.045em] leading-[0.95] select-none"
            style={{ fontSize: 'clamp(3.4rem, 9.2vw, 8.2rem)' }}
          >
            {lines.map((line, idx) => (
              <div key={`${headlineVariant}-${line}`} className="overflow-hidden py-1">
                <motion.span
                  initial={{ y: '105%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{
                    duration: 0.75,
                    delay: idx * 0.11,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className="block editorial-gradient-text"
                >
                  {line}
                </motion.span>
              </div>
            ))}
          </h1>
        </div>

        {/* Bottom-Right Offset "About project" Block + Workspace Launchers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end pt-10">
          {/* Left: Quick Dossier Access */}
          <div className="lg:col-span-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={() => onOpenSummarizer('freelancer')}
              className="group flex items-center justify-between gap-6 px-6 py-4 bg-[#F5F5F5] text-[#080808] font-medium text-sm hover:bg-[#98FF98] transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Launch User Summarizer</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>

            <button
              onClick={onOpenCreator}
              className="group flex items-center justify-between gap-6 px-6 py-4 bg-[#111111] text-neutral-200 border border-neutral-800 hover:border-neutral-500 font-medium text-sm transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Open T&amp;C Creator Studio</span>
              <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          {/* Right: Exact Screenshot 4 "About project" Green Kicker + Muted Prose */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 lg:col-start-8 space-y-5"
          >
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/Pasted_03-11-2026_at_23.39.27_1655382f.png"
                alt="Froggo Mascot Emblem"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-neutral-700"
              />
              <span className="text-[#98FF98] text-lg font-normal tracking-tight">
                About project
              </span>
            </div>
            <p className="text-neutral-400 text-base sm:text-lg font-light leading-relaxed max-w-md">
              Froggo turns dense legal contracts and T&amp;Cs into plain-English
              summaries, flagging obligations, hidden risks and missing clauses.
            </p>
          </motion.div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: MOSBY'S FILES INTERACTIVE STACKED FOLDER CABINET & DOSSIER
          (Exact recreation of the reference video 00:00 - 00:29)
         ===================================================================== */}
      <section className="px-6 sm:px-12 lg:px-20 py-24 sm:py-32 border-b border-neutral-900">
        <MosbyFileCabinet onInspectInSummarizer={onOpenSummarizer} />
      </section>

      {/* =====================================================================
          SECTION 3: 4-COLUMN STAGGERED COLORED DOSSIER COLLAGE
          (Exact recreation of 00:25 - 00:27 in the Mosby's Files video)
         ===================================================================== */}
      <section className="px-6 sm:px-12 lg:px-20 py-24 sm:py-32 border-b border-neutral-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-16">
            <div>
              <div className="text-xs font-mono text-[#98FF98] mb-2">
                PARALLAX DOSSIER SPREAD · 4-ROLE COMPARISON
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
                Every Clause Pinned &amp; Exposed
              </h2>
            </div>
            <p className="text-sm text-neutral-400 max-w-md">
              Click any archival sheet below to open the full contract inside the User
              Summarizer with clause-by-clause citations.
            </p>
          </div>

          {/* 4 Staggered Colored Dossiers (Blue, Yellow, Red, Purple) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {STAGGERED_DOSSIER_COLUMNS.map((col, idx) => (
              <motion.div
                key={col.id}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.25 }}
                onClick={() => {
                  const match = PRESET_CONTRACTS.find(
                    (c) => c.recommendedRole === col.role
                  );
                  onOpenSummarizer(col.role, match);
                }}
                style={{ backgroundColor: col.folderColor }}
                className={`${col.offsetClass} p-3.5 rounded-t-md shadow-2xl cursor-pointer relative group`}
              >
                {/* Right-edge vertical folder tab */}
                <div
                  style={{ backgroundColor: col.folderColor }}
                  className="hidden xl:flex absolute -right-5 top-12 w-5 h-24 rounded-r-md items-center justify-center shadow-md"
                >
                  <span className="rotate-90 text-[10px] font-serif text-white whitespace-nowrap">
                    {col.tabName}
                  </span>
                </div>

                {/* Inner Cream Loose-Leaf Sheet */}
                <div className="bg-[#F6F4EA] text-[#141413] p-5 shadow-md space-y-5 relative">
                  {/* Tiny binder holes on left edge */}
                  <div
                    aria-hidden="true"
                    className="flex flex-col justify-between absolute left-1.5 top-8 bottom-8"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-800/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-800/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-800/80" />
                  </div>

                  <div className="pl-3 space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-300 pb-2">
                      <span className="font-mono text-[10px] uppercase text-neutral-600">
                        DOSSIER 0{idx + 1}
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase text-neutral-900">
                        {col.role}
                      </span>
                    </div>

                    {/* Drop-cap opening */}
                    <p className="font-serif text-xs leading-relaxed text-neutral-800">
                      <span className="text-3xl font-display font-light float-left mr-2 leading-none text-black">
                        {col.dropLetter}
                      </span>
                      {col.leadText}
                    </p>

                    {/* Connected Node Line o──────o */}
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-2 h-2 rounded-full border border-black bg-[#F6F4EA]" />
                      <div className="h-[1px] bg-black flex-1" />
                      <span className="w-2 h-2 rounded-full bg-black" />
                    </div>

                    {/* Primary Tilted Sticky Note */}
                    <div
                      style={{ backgroundColor: col.stickyPrimary }}
                      className="p-4 text-[#111111] shadow-md -rotate-1 border border-black/15 space-y-1.5"
                    >
                      <div className="font-display font-extrabold text-xs uppercase tracking-tight">
                        {col.cardTitle}
                      </div>
                      <p className="font-mono text-[11px] leading-snug text-neutral-900">
                        {col.cardBody}
                      </p>
                    </div>

                    {/* Secondary Tilted Sticky Note */}
                    <div
                      style={{ backgroundColor: col.stickySecondary }}
                      className="p-3.5 text-[#111111] shadow-md rotate-1 border border-black/15 space-y-1"
                    >
                      <div className="font-display font-bold text-[11px] uppercase">
                        {col.secondaryCardTitle}
                      </div>
                      <p className="font-mono text-[10px] leading-snug text-neutral-900">
                        {col.secondaryCardBody}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between font-mono text-[11px] font-bold text-neutral-900 group-hover:underline">
                      <span>Open in Summarizer</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 4: HIGH-CONTRAST EDITORIAL QUOTE & STRATEGIC PLAN
          (Screenshots 2 & 3 Reference)
         ===================================================================== */}
      <section className="px-6 sm:px-12 lg:px-20 py-28 sm:py-36">
        <div className="max-w-6xl mx-auto space-y-28">
          {/* Screenshot 3 Editorial Quote */}
          <motion.blockquote
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-light tracking-[-0.025em] leading-[1.22]"
            style={{ fontSize: 'clamp(1.85rem, 4.3vw, 4.1rem)' }}
          >
            <span className="text-neutral-500">
              “ Want a simple, intuitive design for{' '}
            </span>
            <span className="text-white font-normal">
              students, tenants, and freelancers to decode contracts,
            </span>{' '}
            <span className="text-neutral-500">flag risky clauses, and </span>
            <span className="text-white font-normal">
              implement negotiation instructions
            </span>{' '}
            <span className="text-neutral-500">in real time.</span>
          </motion.blockquote>

          {/* Screenshot 2 "Strategic Plan" + "What Is It?" */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end pt-12 border-t border-neutral-900">
            <div className="lg:col-span-7">
              <h2
                className="font-display font-bold tracking-[-0.045em] leading-[0.96] editorial-gradient-text select-none"
                style={{ fontSize: 'clamp(3rem, 7.8vw, 6.8rem)' }}
              >
                <span className="block">Strategic</span>
                <span className="block">Plan</span>
              </h2>
            </div>

            <div className="lg:col-span-4 lg:col-start-9 space-y-4">
              <p className="text-[#98FF98] text-lg font-normal tracking-tight">
                What Is It?
              </p>
              <p className="text-neutral-400 text-base font-light leading-relaxed">
                We are formulating a strategy to reshape the scenario-based contract
                signing experience and enhance the transparency of legal agreements.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
