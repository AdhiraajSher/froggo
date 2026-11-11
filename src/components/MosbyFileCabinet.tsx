import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, FileText, ShieldAlert, Check, Sparkles } from 'lucide-react';
import { ContractDossier, PRESET_CONTRACTS, UserRole } from '../data/contractsData';
import { FroggoLogo } from './FroggoLogo';

export interface FolderLayerData {
  id: string;
  categoryLabel: string;
  folderColor: string;
  textColor: string;
  borderColor: string;
  tiltAngle: string;
  role: UserRole;
  tabs: {
    id: string;
    label: string;
    tabBg: string;
    tabText: string;
    offsetLeft: string;
    headline: string;
    summary: string;
    riskScore: number;
    keyTrap: string;
    clauseQuote: string;
    stickyColor: string;
  }[];
}

export const MOSBY_FOLDER_LAYERS: FolderLayerData[] = [
  {
    id: 'layer-freelance',
    categoryLabel: 'Freelance & IP Contracts',
    folderColor: '#1351D8', // Mosby's Royal Blue
    textColor: '#FFFFFF',
    borderColor: '#2B6BF3',
    tiltAngle: '90°',
    role: 'freelancer',
    tabs: [
      {
        id: 'tab-ip-grab',
        label: 'Background IP Grab',
        tabBg: '#1351D8',
        tabText: '#FFFFFF',
        offsetLeft: '2%',
        headline: 'Section 3.1 · Work Made For Hire & Pre-Existing Code Trap',
        summary:
          'This clause quietly sweeps up routines, UI libraries, and frameworks you built years before meeting this client. Once incorporated into a deliverable, you lose legal rights to reuse your own starter code.',
        riskScore: 86,
        keyTrap: 'Irrevocable perpetual assignment of prior tools without Exhibit A carve-out.',
        clauseQuote:
          '“All Work Product, including any routines, libraries, or frameworks created prior to or during the Engagement, shall be deemed work made for hire...”',
        stickyColor: '#EEDD6D'
      },
      {
        id: 'tab-net60',
        label: 'Net-60 & Kill Fee',
        tabBg: '#C91D12',
        tabText: '#FFFFFF',
        offsetLeft: '24%',
        headline: 'Section 2.1 · Subjective Rejection & Unpaid Cancellation',
        summary:
          'Conditioning payment on "sole and absolute subjective discretion" lets a client cancel at 95% completion and owe $0. Standard freelance contracts require objective SOW acceptance criteria and a 20% kill fee.',
        riskScore: 78,
        keyTrap: '60-day payout delay after subjective written sign-off; zero late interest.',
        clauseQuote:
          '“All Deliverables shall be subject to Client’s acceptance in its sole and absolute subjective discretion... without payment obligation.”',
        stickyColor: '#E88D96'
      }
    ]
  },
  {
    id: 'layer-tenant',
    categoryLabel: 'Residential & Student Leases',
    folderColor: '#0E7C47', // Mosby's Emerald Green
    textColor: '#FFFFFF',
    borderColor: '#199A5B',
    tiltAngle: '82°',
    role: 'tenant',
    tabs: [
      {
        id: 'tab-joint-lease',
        label: 'Joint Roommate Liability',
        tabBg: '#0E7C47',
        tabText: '#FFFFFF',
        offsetLeft: '4%',
        headline: 'Section 2.3 · Joint & Several Co-Occupant Debt Liability',
        summary:
          'Even when marketed as a $1,450/mo student bedroom, "Joint and Several Liability" means if your three housemates stop paying rent or damage the unit, the landlord can legally demand all $5,800/mo from you alone.',
        riskScore: 84,
        keyTrap: 'Single tenant can be sued for 100% of unit rent arrears and common damages.',
        clauseQuote:
          '“Landlord may pursue any single Tenant for the entirety of any unpaid rent, utility arrears, or damages caused by any co-occupant...”',
        stickyColor: '#6DBAA1'
      }
    ]
  },
  {
    id: 'layer-student',
    categoryLabel: 'Internship & Graduate Offers',
    folderColor: '#3B1E8C', // Mosby's Deep Indigo Purple
    textColor: '#FFFFFF',
    borderColor: '#5632B8',
    tiltAngle: '85°',
    role: 'student',
    tabs: [
      {
        id: 'tab-clawback',
        label: 'Stipend Clawback',
        tabBg: '#3B1E8C',
        tabText: '#FFFFFF',
        offsetLeft: '3%',
        headline: 'Section 3.2 · $3,500 Return-Offer Refusal Repayment',
        summary:
          'Turns your summer housing stipend into a conditional loan: if you decline their full-time return offer upon graduation, you must wire back 100% of the $3,500 gross stipend within 14 calendar days.',
        riskScore: 74,
        keyTrap: 'Repayment triggered even after completing the full 12-week summer internship.',
        clauseQuote:
          '“Should Intern decline a full-time Return Offer extended by Company within six (6) months of graduation, Intern agrees to repay 100%...”',
        stickyColor: '#D4E119'
      },
      {
        id: 'tab-hackathon-ip',
        label: '24/7 Side-Project IP',
        tabBg: '#D4E119',
        tabText: '#080808',
        offsetLeft: '22%',
        headline: 'Section 5.1 · Off-Duty Hackathon & Thesis Assignment',
        summary:
          'Claims corporate ownership over any software, algorithm, or startup prototype conceived during the chronological dates of your internship—even if built on your own laptop in a university dorm.',
        riskScore: 81,
        keyTrap: 'No carve-out for university coursework, capstones, or weekend hackathons.',
        clauseQuote:
          '“...whether during or outside regular working hours, and whether or not using Company equipment or university resources.”',
        stickyColor: '#EEDD6D'
      },
      {
        id: 'tab-noncompete',
        label: '12-Mo Garden Lock',
        tabBg: '#16233B',
        tabText: '#FFFFFF',
        offsetLeft: '41%',
        headline: 'Section 7.1 · Post-Internship Industry Employment Ban',
        summary:
          'Blocks a 12-week summer intern from interviewing with or joining any quantitative finance or fintech firm for 12 months after the summer ends, without paid garden leave.',
        riskScore: 69,
        keyTrap: 'Restricts new-grad campus recruiting across the entire fintech sector.',
        clauseQuote:
          '“For twelve (12) months following the conclusion of the Internship, Intern shall not accept employment or fellowships with any fintech organization.”',
        stickyColor: '#E88D96'
      }
    ]
  },
  {
    id: 'layer-saas',
    categoryLabel: 'App T&Cs & Creator Licenses',
    folderColor: '#C91D12', // Mosby's Crimson Red
    textColor: '#FFFFFF',
    borderColor: '#E5352A',
    tiltAngle: '100°',
    role: 'freelancer',
    tabs: [
      {
        id: 'tab-perpetual-license',
        label: 'Perpetual AI Training Grab',
        tabBg: '#C91D12',
        tabText: '#FFFFFF',
        offsetLeft: '2%',
        headline: 'Section 2.4 · Irrevocable Worldwide Sub-Licensable Content Right',
        summary:
          'Dense legal text that quietly grants the platform a permanent, royalty-free right to train commercial models on your private uploads and sublicense your work to third parties forever.',
        riskScore: 88,
        keyTrap: 'Survives account deletion; waives moral rights and attribution worldwide.',
        clauseQuote:
          '“User grants an irrevocable, perpetual, worldwide license to reproduce, train models on, and distribute uploaded content throughout the universe.”',
        stickyColor: '#E88D96'
      },
      {
        id: 'tab-silent-amendment',
        label: 'Silent Fee & Terms Rollover',
        tabBg: '#C91D12',
        tabText: '#FFFFFF',
        offsetLeft: '26%',
        headline: 'Section 8.1 · Unilateral Modification Without Email Notice',
        summary:
          'Allows the provider to raise subscription fees or add arbitration waivers silently by updating a webpage URL, treating your next login as "conclusive legal acceptance."',
        riskScore: 76,
        keyTrap: 'Zero advance email notice required before material pricing or legal changes.',
        clauseQuote:
          '“Continued use of the platform following any posted revision shall be deemed conclusively accepted by User without prior notice.”',
        stickyColor: '#EEDD6D'
      }
    ]
  }
];

interface MosbyFileCabinetProps {
  onInspectInSummarizer: (role: UserRole, contract?: ContractDossier) => void;
}

export const MosbyFileCabinet: React.FC<MosbyFileCabinetProps> = ({
  onInspectInSummarizer
}) => {
  const [openLayerId, setOpenLayerId] = useState<string>('layer-saas');
  const [activeTabId, setActiveTabId] = useState<string>('tab-perpetual-license');
  const [activeDossierIndex, setActiveDossierIndex] = useState<number>(0);

  const handleSelectTab = (layerId: string, tabId: string) => {
    setOpenLayerId(layerId);
    setActiveTabId(tabId);
  };

  return (
    <div className="space-y-32">
      {/* =====================================================================
          PART 1: MOSBY'S FILES STACKED DIE-CUT COLORED ARCHIVAL CABINET
          (Exact recreation of 00:00 - 00:10 & 00:15 - 00:17 in video)
         ===================================================================== */}
      <div className="max-w-5xl mx-auto">
        {/* Centered Condensed Archival Header like "AMERICAN MODERNISM" */}
        <div className="text-center mb-14 space-y-4">
          <div className="text-[11px] font-mono tracking-[0.22em] uppercase text-neutral-400">
            FROGGO’S FILES · INTERACTIVE CLAUSE CABINET
          </div>
          <h2
            className="font-display font-extrabold uppercase tracking-[-0.03em] text-white leading-none"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 5.2rem)' }}
          >
            CONTRACT ARCHIVE
          </h2>
          <p className="text-neutral-400 font-serif italic text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            A research-driven dossier exploring dense legal clauses, contrasting fine-print
            traps with plain-English obligations before you sign.
          </p>
        </div>

        {/* Stacked Physical Colored Folders with Protruding Die-Cut Top Tabs */}
        <div className="relative pt-8">
          {MOSBY_FOLDER_LAYERS.map((layer, layerIdx) => {
            const isLayerOpen = openLayerId === layer.id;
            const currentTab =
              layer.tabs.find((t) => t.id === activeTabId) || layer.tabs[0];

            return (
              <motion.div
                key={layer.id}
                layout
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 28
                }}
                style={{
                  zIndex: (layerIdx + 1) * 10
                }}
                className="relative -mt-2 first:mt-0"
              >
                {/* Protruding Die-Cut Top Tabs Row */}
                <div className="relative min-h-9 flex items-end px-2 sm:px-6 select-none overflow-x-auto no-scrollbar">
                  {layer.tabs.map((tab, tabIdx) => {
                    const isSelectedTab =
                      isLayerOpen && currentTab.id === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleSelectTab(layer.id, tab.id)}
                        style={{
                          backgroundColor: tab.tabBg,
                          color: tab.tabText,
                          marginLeft: tabIdx === 0 ? '0px' : '12px'
                        }}
                        className={`relative h-9 px-5 sm:px-7 rounded-t-xl font-serif text-xs sm:text-sm font-medium tracking-tight flex items-center gap-2 transition-transform duration-150 cursor-pointer whitespace-nowrap shrink-0 shadow-md ${
                          isSelectedTab
                            ? 'translate-y-0 ring-1 ring-white/40 font-semibold'
                            : 'translate-y-1 hover:translate-y-0 opacity-95'
                        }`}
                      >
                        {/* Left/Right chamfered folder ear illusion */}
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Main Colored Horizontal Folder Body */}
                <motion.div
                  layout
                  onClick={() => {
                    if (!isLayerOpen) {
                      handleSelectTab(layer.id, layer.tabs[0].id);
                    }
                  }}
                  style={{
                    backgroundColor: layer.folderColor,
                    color: layer.textColor
                  }}
                  className="w-full rounded-t-md shadow-2xl border-t border-white/20 overflow-hidden cursor-pointer"
                >
                  {/* Folder Top Spine Bar (Always visible even when collapsed) */}
                  <div className="px-6 sm:px-10 py-3.5 flex items-center justify-between border-b border-black/15">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] uppercase tracking-wider opacity-80">
                        FOLDER 0{layerIdx + 1} · {layer.role.toUpperCase()} LENS
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs opacity-90">
                      <span>{layer.categoryLabel}</span>
                      <span>→</span>
                    </div>
                  </div>

                  {/* Expandable Archival Folder Interior (Mosby's Files Red/Blue Open Drawer) */}
                  <AnimatePresence initial={false}>
                    {isLayerOpen && (
                      <motion.div
                        key={`content-${layer.id}-${currentTab.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.38,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        className="px-6 sm:px-10 py-8 sm:py-10"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                          {/* Left: Typewriter Monospace Plain-English Breakdown (like video 00:01-00:04) */}
                          <div className="lg:col-span-7 space-y-5">
                            <div className="inline-block px-2.5 py-1 bg-black/25 font-mono text-xs uppercase tracking-wider">
                              {currentTab.headline}
                            </div>

                            <p className="font-mono text-xs sm:text-sm leading-relaxed opacity-95 max-w-xl">
                              {currentTab.summary}
                            </p>

                            <div className="pt-2 flex flex-wrap items-center gap-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const match = PRESET_CONTRACTS.find(
                                    (c) => c.recommendedRole === layer.role
                                  );
                                  onInspectInSummarizer(layer.role, match);
                                }}
                                className="px-5 py-2.5 bg-[#F6F4EA] text-[#080808] font-mono text-xs font-semibold hover:bg-[#98FF98] transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                              >
                                <span>Open Full Dossier in Summarizer</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>

                              <span className="font-mono text-xs opacity-80 tabular-nums">
                                RISK SCORE: {currentTab.riskScore}/100
                              </span>
                            </div>
                          </div>

                          {/* Right: Tilted Physical Archival Sticky Card on top of Folder */}
                          <div className="lg:col-span-5 flex justify-end">
                            <motion.div
                              initial={{ rotate: -1.5, scale: 0.96, opacity: 0 }}
                              animate={{ rotate: 1.2, scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              style={{ backgroundColor: currentTab.stickyColor }}
                              className="w-full max-w-sm p-5 text-[#111111] shadow-xl border border-black/15 space-y-3"
                            >
                              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider border-b border-black/15 pb-2">
                                <span>FLAGGED CLAUSE EXCERPT</span>
                                <span>TAB // {currentTab.label}</span>
                              </div>
                              <p className="font-serif italic text-xs sm:text-sm leading-snug text-neutral-900">
                                {currentTab.clauseQuote}
                              </p>
                              <div className="pt-2 border-t border-black/15 font-mono text-[11px] font-semibold">
                                CATCH: {currentTab.keyTrap}
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          PART 2: LOOSE-LEAF 3-RING BINDER PAPER DOSSIER & STAGGERED CARDS
          (Exact recreation of 00:22 - 00:27 in video: Cream punched paper on
          colored folder mat, giant drop-cap, connected node line o────o,
          vertical side index tabs, and tilted sticky notes)
         ===================================================================== */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10 border-b border-neutral-900 pb-6">
          <div>
            <div className="text-xs font-mono text-[#98FF98] mb-2">
              PHYSICAL DOSSIER INSPECTION · LOOSE-LEAF CLAUSE DISSECTION
            </div>
            <h3 className="text-2xl sm:text-4xl font-display font-bold text-white tracking-tight">
              Inside the Decoded Archival Sheet
            </h3>
          </div>
          <div className="text-xs font-mono text-neutral-400">
            CLICK VERTICAL TABS ON RIGHT EDGE TO FLIP DOSSIERS
          </div>
        </div>

        {/* Colored Folder Mat Backdrop with Vertical Right-Edge Index Tabs */}
        <div className="relative flex flex-col lg:flex-row items-stretch">
          {/* Active Colored Folder Mat */}
          <motion.div
            key={PRESET_CONTRACTS[activeDossierIndex].id}
            initial={{ opacity: 0.85, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              backgroundColor:
                activeDossierIndex === 0
                  ? '#D4E119' // Chartreuse Yellow Folder Mat (like I.M. Pei at 00:23)
                  : activeDossierIndex === 1
                  ? '#1351D8' // Royal Blue Folder Mat
                  : '#C91D12' // Crimson Red Folder Mat
            }}
            className="flex-1 p-4 sm:p-8 lg:p-12 rounded-l-md shadow-2xl relative overflow-hidden"
          >
            {/* Cream Loose-Leaf Archival Paper Sheet (#F6F4EA) with 3-Ring Binder Holes */}
            <div className="bg-[#F6F4EA] text-[#141413] p-6 sm:p-10 lg:p-12 shadow-xl relative border border-black/10">
              {/* Left-Margin 3-Ring Binder Punch Holes (like 00:22 - 00:24 in video) */}
              <div
                aria-hidden="true"
                className="hidden sm:flex flex-col justify-between items-center absolute left-4 top-16 bottom-16 w-6"
              >
                <span className="w-5 h-5 rounded-full bg-[#181818]/90 shadow-inner" />
                <span className="w-5 h-5 rounded-full bg-[#181818]/90 shadow-inner" />
                <span className="w-5 h-5 rounded-full bg-[#181818]/90 shadow-inner" />
              </div>

              <div className="sm:pl-10 space-y-10">
                {/* Top Row: Mascot Stamp + Giant Drop-Cap Paragraph + Node Line Callout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Archival Portrait / Stamp Column (like architect portrait at 00:23) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-[#171815] p-4 border border-black/20 flex items-center gap-4">
                      <FroggoLogo size={60} />
                      <div className="text-[#F6F4EA] font-mono text-xs space-y-1">
                        <div className="text-[#98FF98] font-semibold">FROGGO AUDIT</div>
                        <div>{PRESET_CONTRACTS[activeDossierIndex].fileCode}</div>
                        <div className="tabular-nums">
                          SCORE: {PRESET_CONTRACTS[activeDossierIndex].riskScore}/100
                        </div>
                      </div>
                    </div>

                    <dl className="font-mono text-xs space-y-2 text-neutral-700 border-t border-neutral-300 pt-3">
                      <div>
                        <dt className="font-bold text-neutral-900">Counterparty:</dt>
                        <dd>{PRESET_CONTRACTS[activeDossierIndex].counterparty}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-neutral-900">Role Lens:</dt>
                        <dd className="uppercase">
                          {PRESET_CONTRACTS[activeDossierIndex].recommendedRole}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold text-neutral-900">Verdict:</dt>
                        <dd>{PRESET_CONTRACTS[activeDossierIndex].riskVerdict}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Right Editorial Drop-Cap Prose + Connected Node Line (o──────o) */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="relative">
                      <p className="font-serif text-lg sm:text-xl leading-relaxed text-[#181816] first-letter:text-6xl first-letter:font-display first-letter:font-light first-letter:float-left first-letter:mr-4 first-letter:leading-none">
                        {PRESET_CONTRACTS[activeDossierIndex].plainSummary.headline}
                      </p>

                      {/* Architectural Node Callout Line (o───────────o) from 00:23 in video */}
                      <div className="my-5 flex items-center gap-2 text-xs font-mono text-neutral-700">
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-[#181816] bg-[#F6F4EA] shrink-0" />
                        <div className="h-[1.5px] bg-[#181816] flex-1" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#181816] shrink-0" />
                        <span className="px-2.5 py-1 bg-[#181816] text-[#F6F4EA] uppercase">
                          PLAIN-ENGLISH CLAUSE LINKED
                        </span>
                      </div>

                      <p className="font-serif text-base leading-relaxed text-neutral-700">
                        {PRESET_CONTRACTS[activeDossierIndex].plainSummary.overview[0]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Collage of Tilted Sticky Notes (Risk Flags & Missing Clauses like 00:25-00:27) */}
                <div className="pt-6 border-t border-neutral-300 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PRESET_CONTRACTS[activeDossierIndex].riskFlags.slice(0, 3).map((flag, idx) => {
                    const cardColors = ['#E88D96', '#6DBAA1', '#EEDD6D'];
                    const rotations = ['-1.2deg', '1.4deg', '-0.8deg'];
                    return (
                      <div
                        key={flag.id}
                        style={{
                          backgroundColor: cardColors[idx % cardColors.length],
                          transform: `rotate(${rotations[idx % rotations.length]})`
                        }}
                        className="p-5 text-[#111111] shadow-md border border-black/15 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="font-mono text-[10px] uppercase tracking-wider border-b border-black/15 pb-1.5 mb-2 flex justify-between">
                            <span>{flag.tabCode}</span>
                            <span>{flag.category}</span>
                          </div>
                          <h4 className="font-display font-bold text-base uppercase tracking-tight leading-snug">
                            {flag.title}
                          </h4>
                          <p className="font-mono text-xs mt-2 leading-relaxed text-neutral-900">
                            {flag.plainExplanation}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            onInspectInSummarizer(
                              PRESET_CONTRACTS[activeDossierIndex].recommendedRole,
                              PRESET_CONTRACTS[activeDossierIndex]
                            )
                          }
                          className="pt-2 border-t border-black/15 font-mono text-[11px] font-bold flex items-center justify-between hover:underline cursor-pointer"
                        >
                          <span>Inspect Clause Citation</span>
                          <span>→</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Vertical Die-Cut Folder Tabs on the Right Edge (like 00:22 - 00:24 in video) */}
          <div className="flex lg:flex-col justify-start gap-2 pt-4 lg:pt-8">
            {PRESET_CONTRACTS.map((dossier, idx) => {
              const isSelected = activeDossierIndex === idx;
              const tabColors = ['#D4E119', '#1351D8', '#C91D12'];
              const textColors = ['#080808', '#FFFFFF', '#FFFFFF'];
              return (
                <button
                  key={dossier.id}
                  onClick={() => setActiveDossierIndex(idx)}
                  style={{
                    backgroundColor: tabColors[idx % tabColors.length],
                    color: textColors[idx % textColors.length]
                  }}
                  className={`px-4 py-6 lg:w-12 lg:h-44 rounded-r-xl font-serif text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center transition-transform cursor-pointer shadow-lg ${
                    isSelected
                      ? 'lg:translate-x-0 ring-2 ring-white'
                      : 'lg:-translate-x-1 opacity-85 hover:opacity-100 hover:translate-x-0'
                  }`}
                >
                  <span className="lg:rotate-90 whitespace-nowrap">
                    {dossier.recommendedRole.charAt(0).toUpperCase() +
                      dossier.recommendedRole.slice(1)}{' '}
                    Dossier
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================================
          PART 3: ARCHIVAL SIDE-PROFILE FOLDER ANGLE PHYSICS INSPECTOR
          (Inspired by 00:28 - 00:29 in the video showing the vertical red/blue
          standing folders tilting at 90°, 82°, 85°, 100° above the pocket)
         ===================================================================== */}
      <div className="max-w-5xl mx-auto pt-8 border-t border-[#42443b]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center bg-[#1e201b] border border-[#42443b] p-6 sm:p-12">
          {/* Left: Standing Side-Profile Folder Bars & Red Pocket */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full flex items-end justify-around h-48 border-b border-[#42443b] px-2 sm:px-6 pb-2">
              {[
                { label: 'obligations', angle: 0, deg: '90°', role: 'freelancer' as UserRole },
                { label: 'risk flags', angle: -8, deg: '82°', role: 'tenant' as UserRole },
                { label: 'missing clauses', angle: -5, deg: '85°', role: 'student' as UserRole },
                { label: 'negotiation', angle: 10, deg: '100°', role: 'freelancer' as UserRole }
              ].map((bar, idx) => (
                <button
                  key={bar.label}
                  onClick={() => onInspectInSummarizer(bar.role)}
                  className="group flex flex-col items-center gap-3 cursor-pointer"
                >
                  <div className="relative h-32 flex items-end">
                    {/* Blue reference spine */}
                    <div className="w-1.5 h-28 bg-[#1351D8] mr-0.5" />
                    {/* Tilting red folder spine */}
                    <motion.div
                      whileHover={{ rotate: bar.angle - 6 }}
                      animate={{ rotate: bar.angle }}
                      style={{ transformOrigin: 'bottom center' }}
                      className="w-2 h-28 bg-[#C91D12] group-hover:bg-[#98FF98] transition-colors"
                    />
                  </div>
                  <span className="font-mono text-[10px] text-neutral-400 tabular-nums">
                    {bar.deg}
                  </span>
                  <span className="font-mono text-[10px] text-[#0E7C47] group-hover:text-[#98FF98]">
                    {bar.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Bottom Red Archival Pocket Icon (from 00:29) */}
            <div className="mt-8 flex flex-col items-center">
              <div className="w-36 h-3 rounded-t-md bg-[#1351D8] border border-white/20" />
              <div className="w-40 h-24 rounded-b-md bg-[#C91D12] border border-white/20 shadow-lg flex items-center justify-center font-mono text-[11px] text-white uppercase tracking-widest">
                FROGGO ARCHIVE
              </div>
            </div>
          </div>

          {/* Right: Index Card Explanation (like the white speckled card on the right at 00:29) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="bg-[#F6F4EA] text-[#141413] p-8 max-w-sm w-full shadow-2xl border border-neutral-300 space-y-6 rotate-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <span>FROGGO // LEGAL LAB</span>
                <span>2026 EDITION</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-2xl text-[#141413]">
                  Froggo’s Files
                </h4>
                <p className="text-xs font-mono text-neutral-600 mt-1">
                  By Baltic Technology · Track A
                </p>
              </div>
              <p className="text-xs font-serif leading-relaxed text-neutral-700">
                The project treats contract browsing as part of the legal defense: how you
                separate, flag, and question each clause is designed to matter as much as the
                contract itself.
              </p>
              {/* Dot-matrix pattern from 00:29 */}
              <div className="grid grid-cols-5 gap-3 py-3 place-items-center">
                {Array.from({ length: 15 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i % 2 === 0 ? 'bg-[#141413]' : 'bg-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => onInspectInSummarizer('freelancer')}
                className="w-full py-2.5 bg-[#141413] text-[#F6F4EA] font-mono text-xs uppercase tracking-wider hover:bg-[#1351D8] transition-colors cursor-pointer"
              >
                Open Contract Decoder →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
