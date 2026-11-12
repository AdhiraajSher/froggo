import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Home,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ArrowUpRight,
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Edit2,
  FileCheck,
  FileText,
  HelpCircle,
  Info,
  LayoutGrid,
  List,
  Lock,
  MessageSquareText,
  Mic,
  Moon,
  Plus,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  UserCheck,
  Wand2
} from 'lucide-react';
import { ContractShieldHub } from './components/ContractShieldHub';
import { FroggoLogo } from './components/FroggoLogo';
import { LegalAIAssistant, type AssistantClause } from './components/LegalAIAssistant';
import { Sidebar, PageType } from './components/workspace/Sidebar';
import { Topbar } from './components/workspace/Topbar';
import { HomeView } from './components/workspace/HomeView';
import { UploadView } from './components/workspace/UploadView';
import { ReadingRoomView } from './components/workspace/ReadingRoomView';

import { ScoreBreakdown } from './lib/types';

export type RoleType = 'Freelancer' | 'Tenant' | 'Student';
export type ClauseRiskLevel = 'high' | 'medium' | 'safe' | 'not_assessed';

export interface FroggoFile {
  id: string;
  title: string;
  type: string;
  subtitle: string;
  score: number;
  scoreBreakdown?: ScoreBreakdown;
  lastUpdated: string;
  clauses: string[];
  clauseSeverities: ClauseRiskLevel[];
  plain: string[];
  risks: string[];
  questions: string[];
  missing: string[];
  missingWording: Record<string, string>;
  roleImpact: Record<RoleType, string[]>;
  indiaStatutoryChecks: {
    sec27Status: string;
    msme45DayStatus: string;
    tds194JStatus: string;
    sec43BhStatus?: string;
    dpdpStatus?: string;
  };
  isCustom?: boolean;
}

const INITIAL_FILES: FroggoFile[] = [
  {
    id: 'DOC-01',
    title: 'Freelancer Master Service Agreement (MSA)',
    type: 'Work & Freelance',
    subtitle: 'Independent contractor agreement with IP assignment, Net-60 payment, and non-compete clauses.',
    score: 65,
    scoreBreakdown: {
      totalScore: 65,
      baseScore: 0,
      penalties: [
        { clauseId: 'c-001', title: 'Delayed Payment Window & Subjective Approval', severity: 'high', points: 20, reason: 'Payment within 60 days exceeds MSMED Act Section 15 limit of 45 days.' },
        { clauseId: 'c-002', title: 'Broad IP Ownership Transfer & Prior Tool Sweep', severity: 'medium', points: 15, reason: 'Transfers pre-existing tools upon creation before invoice settlement.' },
        { clauseId: 'c-003', title: 'Post-Termination Non-Compete Restraint', severity: 'high', points: 25, reason: '18-month non-compete void under Section 27, Indian Contract Act.' },
      ],
      unassessedClausesCount: 0,
      totalClausesCount: 4,
      assessedClausesCount: 4,
      disclaimer: 'Froggo automated estimate for informational guidance, not a formal legal opinion or advocate certification under the Advocates Act, 1961.',
    },
    lastUpdated: 'Sample Contract · India Statutory Audit',
    indiaStatutoryChecks: {
      sec27Status: 'Issue detected: 18-month post-exit non-compete is generally void under Section 27, Indian Contract Act, 1872',
      msme45DayStatus: 'Issue detected: Net-60 payment exceeds the 45-day statutory maximum under Section 15, MSMED Act, 2006',
      tds194JStatus: 'Issue detected: Verify applicable rate — specify 2% technical TDS (Sec 194J(b)) instead of 10% deduction'
    },
    clauses: [
      '1. Payment Terms: Payment shall be remitted within 60 days of invoice approval. The Company may withhold payment pending satisfactory completion in its sole discretion.',
      '2. Intellectual Property: All work product, including preliminary concepts and pre-existing contractor utilities, shall become the exclusive property of the Company upon creation.',
      '3. Termination & Non-Compete: The Company may terminate the agreement immediately at its sole discretion, and Contractor shall not work for any competing business for 18 months following termination.',
      '4. Confidentiality & Data Protection: Both parties agree to maintain the confidentiality of proprietary business records in accordance with applicable Indian data protection laws.'
    ],
    clauseSeverities: ['high', 'high', 'high', 'safe'],
    plain: [
      'You may have to wait 60 days after invoice approval to get paid (which violates the 45-day MSME rule in India), and the client has no deadline to approve your invoice.',
      'Even your unused drafts and personal reusable code or design libraries become the client’s property immediately—even before they pay your invoice.',
      'The company can cancel the contract without notice mid-project, and attempts to ban you from working with competitors for 18 months (void under Section 27 of the Indian Contract Act).',
      'Standard mutual confidentiality obligation protecting sensitive business data shared during the project.'
    ],
    risks: [
      'Net-60 violates MSME 45-Day limit & subjective approval',
      'IP ownership transfers before payment & includes prior tools',
      'Void Section 27 non-compete & unilateral termination',
      'Balanced mutual confidentiality clause (Safe)'
    ],
    questions: [
      'Can we update payment terms to Net-15 or Net-30 days (compliant with the MSME 45-day limit) with 2% TDS under Section 194J(b)?',
      'Can IP ownership transfer only upon full payment of the invoice, with my pre-existing tools and libraries carved out?',
      'Can we remove the post-termination non-compete (void under Section 27) and include a mutual 14-day termination notice period?',
      'Does confidentiality terminate 2 years after the end of the engagement?'
    ],
    missing: [
      'Revision limits & scope boundary (max 2 rounds)',
      'MSME Section 16 late payment interest (3x RBI bank rate)',
      'Section 194J(b) 2% technical TDS specification'
    ],
    missingWording: {
      'Revision limits & scope boundary (max 2 rounds)':
        'Deliverables include up to two (2) rounds of revisions based on the written Statement of Work; additional scope changes shall be billed separately.',
      'MSME Section 16 late payment interest (3x RBI bank rate)':
        'Invoices must be cleared within 15 days (and never beyond 45 days per Section 15 of the MSMED Act, 2006). Overdue balances accrue compound interest at 3x the RBI bank rate.',
      'Section 194J(b) 2% technical TDS specification':
        'Client shall deduct TDS at 2% for technical/software services under Section 194J(b) of the Income Tax Act and issue Form 16A quarterly.'
    },
    roleImpact: {
      Freelancer: [
        'Waiting 60+ days violates MSME 45-day protections and creates severe cash-flow risk.',
        'Losing rights to your own starter kit or component library blocks future client work.',
        'Post-contract non-competes are void under Section 27 in India, but fighting them wastes time.',
        'Standard confidentiality protects both you and your client.'
      ],
      Student: [
        'Summer freelance or campus project stipends can be delayed until next semester.',
        'Company claims ownership of your portfolio concepts even if rejected.',
        'Attempts to block you from interviewing with other tech companies after graduation.',
        'Allows you to discuss the project only after removing confidential client names.'
      ],
      Tenant: [
        'Work-for-rent or maintenance service credits lack a clear payout schedule.',
        'Custom studio improvements become landlord property immediately.',
        'Arrangement can be revoked without notice.',
        'Standard privacy protection for personal records.'
      ]
    }
  },
  {
    id: 'DOC-02',
    title: 'Residential Leave & License (Tenant Lease)',
    type: 'Rent & Housing',
    subtitle: '11-month residential flat & PG rental agreement with security deposit and entry rules.',
    score: 40,
    scoreBreakdown: {
      totalScore: 40,
      baseScore: 0,
      penalties: [
        { clauseId: 'c-001', title: 'Mandatory painting deduction', severity: 'medium', points: 15, reason: 'Unilateral deposit deduction for painting.' },
        { clauseId: 'c-002', title: 'Unannounced landlord entry', severity: 'high', points: 25, reason: 'Entry without 24-hour advance notice disrupts peaceful possession.' },
      ],
      unassessedClausesCount: 0,
      totalClausesCount: 4,
      assessedClausesCount: 4,
      disclaimer: 'Froggo automated estimate for informational guidance, not a formal legal opinion or advocate certification under the Advocates Act, 1961.',
    },
    lastUpdated: 'Sample Contract · Residential Housing',
    indiaStatutoryChecks: {
      sec27Status: 'Not applicable to this contract type (Section 27 applies to trade or profession, not residential leases)',
      msme45DayStatus: 'Not applicable to this contract type (Residential tenancy)',
      tds194JStatus: 'Not applicable to this contract type (Rent TDS is governed by Sec 194-IB if rent > ₹50,000/mo)'
    },
    clauses: [
      '1. Security Deposit Deduction: The security deposit may be retained for restoration of the premises to the satisfaction of the Licensor, plus a mandatory ₹8,500 move-out painting and sanitization deduction.',
      '2. Landlord Entry Rights: The Licensor or showing agents may enter the premises at any time without prior notice for inspection, maintenance, or property tours.',
      '3. Joint & Several Liability: All Licensees shall be jointly and severally responsible for 100% of unit rent and all structural, plumbing, or appliance repairs during the term of the lease.',
      '4. Notice Period: Either party may terminate this Leave & License after the lock-in period by providing 30 days written notice via email or registered post.'
    ],
    clauseSeverities: ['medium', 'high', 'high', 'safe'],
    plain: [
      'Deposit deductions depend on the landlord’s subjective judgment, and ₹8,500 is automatically deducted even if you leave the flat spotless.',
      'The landlord or broker can walk into your flat or bedroom at any hour without giving 24-hour advance notice.',
      'Puts major structural/geyser repairs and your flatmates’ unpaid rent entirely on you, without distinguishing normal wear and tear.',
      'Standard 30-day mutual notice period after the initial lock-in period ends.'
    ],
    risks: [
      'Subjective deposit deductions & mandatory ₹8,500 painting deduction',
      'Unannounced landlord/broker entry without 24-hour notice',
      'Joint flatmate rent liability & structural repair burden',
      'Fair 30-day mutual termination notice (Safe)'
    ],
    questions: [
      'Can deductions be itemized against a move-in photo checklist with normal wear and tear exempted?',
      'Can non-emergency entry require at least 24 hours advance notice via WhatsApp or email?',
      'Can we limit tenant repairs to minor consumables under ₹1,000 and keep structural/appliance repairs with the landlord?',
      'Can the security deposit be refunded via UPI/NEFT on the same day keys are handed back?'
    ],
    missing: [
      'Same-day security deposit refund via UPI/NEFT upon key handover',
      'Normal wear-and-tear exemption & move-in photo inventory'
    ],
    missingWording: {
      'Same-day security deposit refund via UPI/NEFT upon key handover':
        'Licensor shall refund the security deposit via UPI/NEFT on the date of key handover, deducting only documented physical damages beyond normal wear and tear.',
      'Normal wear-and-tear exemption & move-in photo inventory':
        'Licensee shall not be liable for routine wear and tear, seasonal painting, or structural plumbing and electrical repairs.'
    },
    roleImpact: {
      Tenant: [
        'Subjective restoration deductions can wipe out your security deposit.',
        'Unannounced inspections disrupt quiet enjoyment and work-from-home privacy.',
        'You can be forced to pay for a broken geyser/AC or a flatmate’s missed rent.',
        'Gives you a clear 30-day window to plan your move-out.'
      ],
      Student: [
        'Mandatory painting deduction shrinks student PG/flat deposits on day one.',
        'Brokers can bring tours into your room during university exams.',
        'If a flatmate drops out mid-semester, the landlord can demand their rent from you.',
        'Allows you to give 30 days notice before semester break.'
      ],
      Freelancer: [
        'Home-studio security deposit tied to subjective repainting rules.',
        'Unannounced daytime entry interrupts client calls and meetings.',
        'Broad repair clause shifts building electrical/plumbing costs onto you.',
        'Predictable 30-day notice period for relocating your workspace.'
      ]
    }
  },
  {
    id: 'DOC-03',
    title: 'SaaS & App Subscription Terms of Service',
    type: 'Apps & Subscriptions',
    subtitle: 'Digital workspace subscription with auto-renewal, AI model training, and refund rules.',
    score: 40,
    scoreBreakdown: {
      totalScore: 40,
      baseScore: 0,
      penalties: [
        { clauseId: 'c-001', title: 'Annual Auto-Renewal Lock', severity: 'medium', points: 15, reason: '30-day cancellation lock before renewal.' },
        { clauseId: 'c-002', title: 'Commercial AI Training & Ad Sharing', severity: 'high', points: 25, reason: 'Permanent AI model training without clear DPDP erasure.' },
      ],
      unassessedClausesCount: 0,
      totalClausesCount: 3,
      assessedClausesCount: 3,
      disclaimer: 'Froggo automated estimate for informational guidance, not a formal legal opinion or advocate certification under the Advocates Act, 1961.',
    },
    lastUpdated: 'Sample Contract · DPDP Act 2023 Audit',
    indiaStatutoryChecks: {
      sec27Status: 'Not detected in this text (No restraint of trade clause detected)',
      msme45DayStatus: 'Not applicable to this contract type (Consumer SaaS subscription)',
      tds194JStatus: 'Not detected in this text (Verify 18% GST tax invoice on B2B software plans)'
    },
    clauses: [
      '1. Automatic Renewal: Your subscription automatically renews for successive annual terms at the prevailing rate unless cancelled at least 30 days before the renewal date.',
      '2. Data Sharing & AI Training: We may share usage data with advertising partners and train commercial AI models on uploaded workspace documents in perpetuity.',
      '3. No Refunds: All fees are strictly non-refundable, including fees for unused subscription periods following account cancellation or termination.'
    ],
    clauseSeverities: ['medium', 'high', 'medium'],
    plain: [
      'Your plan renews automatically at whatever the current price is. You must cancel a full 30 days before the renewal date or you are billed for another full year.',
      'Your activity and uploaded files may be shared with ad partners and used to train commercial AI models permanently.',
      'If you cancel early—or if they close your account—you will not get the unused portion of your prepayment back.'
    ],
    risks: [
      '30-day advance cancellation lock before annual auto-renewal',
      'Permanent AI model training & third-party ad data sharing',
      'No pro-rata refunds for unused prepaid months'
    ],
    questions: [
      'Can I cancel any time up to 24 hours before the renewal date?',
      'Can I opt out of third-party data sharing and AI model training under the DPDP Act, 2023?',
      'What happens to my prepaid balance if the service changes price or discontinues features?'
    ],
    missing: [
      '30-day advance email notice before price increases or renewal',
      'DPDP Act 2023 30-day data deletion & export guarantee'
    ],
    missingWording: {
      '30-day advance email notice before price increases or renewal':
        'Provider will send at least 30 days advance email notice before any annual auto-renewal or price increase takes effect.',
      'DPDP Act 2023 30-day data deletion & export guarantee':
        'Upon cancellation, User may export all workspace files and Provider will permanently delete all personal data within 30 calendar days per the DPDP Act, 2023.'
    },
    roleImpact: {
      Student: [
        'Easy to forget over semester break and get charged for a full year at post-student pricing.',
        'Uploading class coursework or thesis research could grant the app a permanent license.',
        'Annual student prepayments cannot be refunded if you switch tools.'
      ],
      Freelancer: [
        'Locks client project tooling into automatic annual billing cycles.',
        'Client NDA files uploaded to the app could be exposed to third-party AI training.',
        'Sunk software overhead if a client project ends early.'
      ],
      Tenant: [
        'Resident portal subscriptions auto-renew alongside your lease.',
        'Smart-home and utility portal usage shared with third-party marketers.',
        'Prepaid resident amenity fees are non-refundable upon move-out.'
      ]
    }
  }
];

const JARGON_REPLACEMENTS: Record<string, { label: string; replacement: string; why: string }> = {
  shall: {
    label: 'shall',
    replacement: 'will',
    why: 'Overused legal archaism that creates ambiguity between future tense and mandatory obligation.'
  },
  'sole discretion': {
    label: 'sole discretion',
    replacement: 'reasonable judgment based on objective criteria',
    why: 'Gives one party unchecked power to reject work or change rules arbitrarily.'
  },
  indemnify: {
    label: 'indemnify',
    replacement: 'reimburse for direct proven damages (capped at fees paid)',
    why: 'Often hides uncapped personal liability for corporate legal fees.'
  },
  'work product': {
    label: 'work product',
    replacement: 'final custom deliverables (excluding pre-existing tools)',
    why: 'Can accidentally sweep up your personal code libraries and unused drafts.'
  },
  remitted: {
    label: 'remitted',
    replacement: 'paid via bank transfer or UPI',
    why: 'Simpler, everyday payment wording improves clarity for both parties.'
  },
  'in perpetuity': {
    label: 'in perpetuity',
    replacement: 'for the duration of the active agreement',
    why: 'Prevents permanent, irreversible rights grabs over your data or creative work.'
  },
  'without prior notice': {
    label: 'without prior notice',
    replacement: 'with at least 14 days advance written notice',
    why: 'Protects both parties from sudden, unannounced termination or entry.'
  }
};

const CREATOR_CLAUSES_TO_ADD = [
  {
    id: 'msme-payment',
    title: 'MSME 45-Day Payment & Sec 194J(b) 2% TDS Clause',
    category: 'Payment & Tax',
    text: '\n\nPayment & TDS Compliance: Client will pay approved invoices within 15 days (and never beyond 45 days per Section 15 of the MSMED Act, 2006) after deducting 2% TDS for technical services under Section 194J(b).'
  },
  {
    id: 'sec27-safe',
    title: 'Section 27 Compliant Confidentiality (No Non-Compete)',
    category: 'Indian Contract Act',
    text: '\n\nFreedom of Trade (Section 27 Compliant): Nothing in this Agreement restricts Contractor from engaging in lawful profession or independent client work after termination, provided proprietary trade secrets remain confidential.'
  },
  {
    id: 'ip-carveout',
    title: 'Pre-Existing IP Carve-Out & Payment-Linked Transfer',
    category: 'Intellectual Property',
    text: '\n\nIntellectual Property Transfer: Ownership of custom deliverables transfers to the Client only upon full payment of all invoices. Contractor retains all rights to pre-existing tools, templates, and general know-how.'
  },
  {
    id: 'dpdp-privacy',
    title: 'DPDP Act 2023 Data Deletion & Zero AI Training Clause',
    category: 'Data Privacy',
    text: '\n\nData Privacy (DPDP Act, 2023): Personal data will be processed solely to fulfill this agreement, will never be used to train external AI models, and will be permanently erased within 30 days of termination.'
  }
];

import { analyzeContractDocument, contractDocumentToFroggoFile } from './lib/documentAnalysis';
import { extractDocumentText } from './lib/extractDocumentText';
import { sanitizeTextForNetwork } from './lib/masking';
import {
  getAllStoredContracts,
  saveContractToStore,
  deleteContractFromStore,
  renameContractInStore,
} from './lib/contractStore';
import { exportContractPdf } from './lib/generatePdfReport';

function buildCustomFileFromText(rawText: string, fileName: string, role: RoleType): FroggoFile {
  const doc = analyzeContractDocument(rawText, fileName, role);
  return contractDocumentToFroggoFile(doc);
}

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => { try { return localStorage.getItem('froggo-theme') === 'dark'; } catch { return false; } });
  const [homeTab,setHomeTab] = useState<'documents'|'workflow'>('documents');
  const [search,setSearch] = useState('');
  const [sidebarOpen,setSidebarOpen] = useState(false);
  const documentRail = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState<'home' | 'read' | 'create' | 'upload' | 'shield'>('home');
  const [shieldSubTab, setShieldSubTab] = useState<
    'templates' | 'compare' | 'sifters' | 'privacy' | 'matrix'
  >('templates');
  const [files, setFiles] = useState<FroggoFile[]>(INITIAL_FILES);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [activeClauseIndex, setActiveClauseIndex] = useState<number>(0);
  const clauseRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  function scrollToClause(index: number) {
    setActiveClauseIndex(index);
    const el = clauseRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  const [role, setRole] = useState<RoleType>('Freelancer');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [useSerifLegalText, setUseSerifLegalText] = useState<boolean>(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState<boolean>(false);
  const [aiAssistantMode, setAiAssistantMode] = useState<'chat' | 'voice'>('chat');

  // Upload / Paste State
  const [uploadText, setUploadText] = useState<string>('');
  const [uploadFilename, setUploadFilename] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Creator Desk State
  const [draftTitle, setDraftTitle] = useState<string>('Independent Consultant Agreement — 2026');
  const [draft, setDraft] = useState<string>(
    '1. Payment Terms: Payment shall be remitted within 60 days of invoice approval. The Company may withhold payment in its sole discretion.\n\n2. Intellectual Property: All work product shall become the exclusive property of the Company in perpetuity without prior notice.\n\n3. Liability: Contractor shall indemnify the Company against any claims.'
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
    try { localStorage.setItem('froggo-theme', darkMode ? 'dark' : 'light'); } catch {}
  }, [darkMode]);

  // Load persisted contracts from IndexedDB on startup
  useEffect(() => {
    async function loadHistory() {
      try {
        const stored = await getAllStoredContracts();
        if (stored.length > 0) {
          const storedFiles = stored.map(contractDocumentToFroggoFile);
          const storedIds = new Set(stored.map((d) => d.id));
          const remainingSamples = INITIAL_FILES.filter((s) => !storedIds.has(s.id));
          setFiles([...storedFiles, ...remainingSamples]);
        }
      } catch (err) {
        console.error('Failed to load contract history from IndexedDB:', err);
      }
    }
    loadHistory();
  }, []);

  const currentFile = files[selectedFileIndex] || files[0];

  function navigateTo(nextPage: typeof page) {
    setPage(nextPage);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openContractInReadingRoom(index: number) {
    setSelectedFileIndex(index);
    setActiveClauseIndex(0);
    navigateTo('read');
  }

  async function handleFileUpload(file?: File) {
    if (!file) return;
    setUploadError('');
    setIsExtracting(true);
    try {
      const result = await extractDocumentText(file);
      setUploadFilename(result.fileName);
      setUploadText(result.text);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Failed to extract text from file.');
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleRunAnalysis() {
    const textToAnalyze = uploadText.trim();
    if (!textToAnalyze) {
      setUploadError('Please paste or upload contract text to analyze. Froggo never analyzes empty input.');
      return;
    }

    setIsAnalyzing(true);
    setUploadError('');

    try {
      const sanitizedText = sanitizeTextForNetwork(textToAnalyze);
      const customDoc = analyzeContractDocument(
        sanitizedText,
        uploadFilename || 'Uploaded Contract',
        role
      );
      await saveContractToStore(customDoc);
      const newFile = contractDocumentToFroggoFile(customDoc);

      // Persist into state without overwriting prior user uploads
      setFiles((prev) => [newFile, ...prev]);
      setSelectedFileIndex(0);
      setActiveClauseIndex(0);
      setIsAnalyzing(false);
      navigateTo('read');
    } catch (err: unknown) {
      setIsAnalyzing(false);
      setUploadError(err instanceof Error ? err.message : 'Analysis failed. Please verify the contract text.');
    }
  }

  function handleCopyText(key: string, content: string) {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function handleExportPdf() {
    exportContractPdf(currentFile, role);
  }

  async function handleRenameContract(id: string, currentTitle: string) {
    const newTitle = window.prompt('Enter new title for this contract:', currentTitle);
    if (!newTitle || !newTitle.trim() || newTitle === currentTitle) return;
    await renameContractInStore(id, newTitle.trim());
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, title: newTitle.trim() } : f))
    );
  }

  async function handleDeleteContract(id: string, title: string) {
    const confirmed = window.confirm(`Are you sure you want to delete "${title}"?`);
    if (!confirmed) return;
    await deleteContractFromStore(id);
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      return next.length > 0 ? next : INITIAL_FILES;
    });
    setSelectedFileIndex(0);
    setActiveClauseIndex(0);
  }

  function replaceJargonInDraft(jargonWord: string) {
    const rule = JARGON_REPLACEMENTS[jargonWord];
    if (!rule) return;
    const regex = new RegExp(jargonWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    setDraft((prev) => prev.replace(regex, rule.replacement));
  }

  async function previewCreatorDraftInReadingRoom() {
    const sanitizedDraft = sanitizeTextForNetwork(draft);
    const customDoc = analyzeContractDocument(sanitizedDraft, draftTitle, role);
    customDoc.title = draftTitle;
    await saveContractToStore(customDoc);
    const customFromDraft = contractDocumentToFroggoFile(customDoc);
    customFromDraft.type = 'Creator Working Draft';
    setFiles((prev) => [customFromDraft, ...prev]);
    setSelectedFileIndex(0);
    setActiveClauseIndex(0);
    navigateTo('read');
  }

  async function handleLoadTemplateIntoReadingRoom(title: string, clauses: string[]) {
    const sanitizedClauses = clauses.map(sanitizeTextForNetwork);
    const customDoc = analyzeContractDocument(sanitizedClauses.join('\n\n'), title, role);
    customDoc.title = title;
    await saveContractToStore(customDoc);
    const tplFile = contractDocumentToFroggoFile(customDoc);
    tplFile.type = 'India Legal Template';
    setFiles((prev) => [tplFile, ...prev]);
    setSelectedFileIndex(0);
    setActiveClauseIndex(0);
    navigateTo('read');
  }

  const detectedJargonList = Object.keys(JARGON_REPLACEMENTS).filter((w) =>
    draft.toLowerCase().includes(w)
  );
  const wordCount = draft.split(/\s+/).filter(Boolean).length;
  const readabilityScore = Math.max(45, Math.min(98, 94 - detectedJargonList.length * 10));

  function getRiskBadgeStyle(score: number) {
    if (score >= 65) {
      return {
        label: `High Risk (${score}/100)`,
        bg: 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
        bar: 'bg-red-600'
      };
    }
    if (score >= 40) {
      return {
        label: `Moderate Risk (${score}/100)`,
        bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        bar: 'bg-amber-500'
      };
    }
    return {
      label: `Low Risk / Safe (${score}/100)`,
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      bar: 'bg-emerald-600'
    };
  }

  return (
    <div className="mint-app emerald-app min-h-screen text-[#111827] dark:text-slate-100 transition-colors">
      {/* =====================================================================
          TOP NAVIGATION BAR (Clean Light Theme + Standard Dark Mode Toggle)
         ===================================================================== */}
      <Sidebar
        page={page}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navigateTo={navigateTo}
        setAiAssistantMode={setAiAssistantMode}
        setAiAssistantOpen={setAiAssistantOpen}
        setShieldSubTab={setShieldSubTab}
      />
      <div className="emerald-surface">
        <Topbar
          page={page}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {page === 'home' && (
              <HomeView
                files={files}
                homeTab={homeTab}
                setHomeTab={setHomeTab}
                navigateTo={navigateTo}
                openContractInReadingRoom={openContractInReadingRoom}
                selectedFileIndex={selectedFileIndex}
                setShieldSubTab={setShieldSubTab}
                setAiAssistantMode={setAiAssistantMode}
                setAiAssistantOpen={setAiAssistantOpen}
                search={search}
                setSearch={setSearch}
                handleRenameContract={handleRenameContract}
                handleDeleteContract={handleDeleteContract}
                documentRail={documentRail}
              />
            )}

            {page === 'upload' && (
              <UploadView
                role={role}
                setRole={setRole}
                handleFileUpload={handleFileUpload}
                fileInputRef={fileInputRef}
                isExtracting={isExtracting}
                uploadFilename={uploadFilename}
                uploadText={uploadText}
                setUploadText={setUploadText}
                uploadError={uploadError}
                navigateTo={navigateTo}
                handleRunAnalysis={handleRunAnalysis}
                isAnalyzing={isAnalyzing}
              />
            )}

            {page === 'read' && (
              <ReadingRoomView
                currentFile={currentFile}
                role={role}
                setRole={setRole}
                useSerifLegalText={useSerifLegalText}
                setUseSerifLegalText={setUseSerifLegalText}
                handleExportPdf={handleExportPdf}
                navigateTo={navigateTo}
                files={files}
                selectedFileIndex={selectedFileIndex}
                setSelectedFileIndex={setSelectedFileIndex}
                activeClauseIndex={activeClauseIndex}
                setActiveClauseIndex={setActiveClauseIndex}
                handleRenameContract={handleRenameContract}
                handleDeleteContract={handleDeleteContract}
                clauseRefs={clauseRefs}
                scrollToClause={scrollToClause}
              />
            )}

            {/* ===============================================================
                DASHBOARD B: THE CREATOR DESK (Standard Split-Pane Editor UI)
               =============================================================== */}
            {page === 'create' && (
              <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                  {/* Creator Desk Top Header */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E] dark:text-teal-400">
                        Creator desk
                      </span>
                      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white mt-0.5">
                        Draft transparent, human-readable agreements
                      </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => {
                          setShieldSubTab('templates');
                          navigateTo('shield');
                        }}
                        className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F9FAFB] text-sm font-semibold text-[#111827] dark:text-white flex items-center gap-2"
                      >
                        <FileText size={16} className="text-[#0F766E] dark:text-teal-400" />
                        <span>Browse 24+ Templates</span>
                      </button>

                      <button
                        onClick={previewCreatorDraftInReadingRoom}
                        className="px-5 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
                      >
                        <Sparkles size={16} />
                        <span>Generate Froggo-Safe Summary</span>
                      </button>
                    </div>
                  </div>

                  {/* Split-Pane Editor Layout (Left: Document Editor, Right: Insights Sidebar) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT PANE (7/12): Clean White (#FFFFFF) Text Editor */}
                    <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-slate-800 pb-4">
                        <div className="flex-1 min-w-[240px]">
                          <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                            Document Title
                          </label>
                          <input
                            type="text"
                            value={draftTitle}
                            onChange={(e) => setDraftTitle(e.target.value)}
                            className="w-full font-heading text-xl font-bold text-[#111827] dark:text-white bg-[#F9FAFB] dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 focus:bg-white"
                          />
                        </div>

                        <div className="flex items-center gap-3 text-xs font-medium text-gray-600 dark:text-slate-300">
                          <span className="px-2.5 py-1 rounded-md bg-[#F9FAFB] dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                            {wordCount} words
                          </span>
                          <button
                            onClick={() => handleCopyText('draft-copy', draft)}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-[#F9FAFB] text-[#111827] dark:text-white font-semibold flex items-center gap-1.5"
                          >
                            {copiedKey === 'draft-copy' ? (
                              <>
                                <Check size={14} className="text-emerald-700" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                <span>Copy Draft</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="creator-draft-editor"
                          className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-2"
                        >
                          Contract Text Editor (16px High-Legibility View)
                        </label>
                        <textarea
                          id="creator-draft-editor"
                          rows={15}
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          className="w-full p-5 rounded-xl bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 font-legal text-base text-[#111827] dark:text-slate-100 leading-relaxed resize-y"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-gray-500 dark:text-slate-400">
                        <span>
                          Tip: Click any highlighted jargon tag on the right to rewrite it in plain
                          English.
                        </span>
                        <span>Auto-saved in browser session</span>
                      </div>
                    </div>

                    {/* RIGHT PANE (5/12): Readability Score, Jargon Replacer & Missing Clauses */}
                    <aside className="lg:col-span-5 space-y-5">
                      {/* 1. Readability Score Card with Progress Bar */}
                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                              Readability Score
                            </span>
                            <h2 className="font-heading text-lg font-bold text-[#111827] dark:text-white">
                              Plain-English Clarity Index
                            </h2>
                          </div>
                          <div className="font-heading text-3xl font-bold text-[#0F766E] dark:text-teal-400">
                            {readabilityScore}
                            <span className="text-base font-normal text-gray-500 dark:text-slate-400">
                              /100
                            </span>
                          </div>
                        </div>

                        <div className="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              readabilityScore >= 80
                                ? 'bg-emerald-600'
                                : readabilityScore >= 65
                                ? 'bg-amber-500'
                                : 'bg-red-600'
                            }`}
                            style={{ width: `${readabilityScore}%` }}
                          />
                        </div>

                        <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                          {readabilityScore >= 85
                            ? 'Great job! Your draft uses clear, accessible language that signers can easily understand.'
                            : `We detected ${detectedJargonList.length} archaic legal phrases that reduce readability. Click the tags below to simplify them.`}
                        </p>
                      </div>

                      {/* 2. Jargon Replacer Card (Standard Clickable Tags) */}
                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wand2 size={18} className="text-[#0F766E] dark:text-teal-400" />
                            <h2 className="font-heading text-base font-bold text-[#111827] dark:text-white">
                              Jargon Replacer
                            </h2>
                          </div>
                          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                            {detectedJargonList.length} detected
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-slate-300">
                          Click any detected legalese tag below to automatically replace it in your
                          draft with clear, balanced wording:
                        </p>

                        {detectedJargonList.length === 0 ? (
                          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-sm font-medium text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
                            <span>Zero archaic legalese phrases remaining in your draft!</span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {detectedJargonList.map((word) => (
                              <button
                                key={word}
                                onClick={() => replaceJargonInDraft(word)}
                                title={JARGON_REPLACEMENTS[word].why}
                                className="px-3.5 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-[#0F766E] text-amber-950 dark:text-amber-200 hover:text-white border border-amber-300 dark:border-amber-700 hover:border-[#0F766E] text-sm font-medium flex items-center gap-2 transition-colors"
                              >
                                <Wand2 size={14} />
                                <span>“{word}”</span>
                                <span className="text-xs opacity-75">
                                  → “{JARGON_REPLACEMENTS[word].replacement}”
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3. Missing Clauses Card (Standard List Items with "Add to Draft" Button) */}
                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="font-heading text-base font-bold text-[#111827] dark:text-white">
                            Recommended Clauses
                          </h2>
                          <span className="text-xs font-medium text-[#0F766E] dark:text-teal-400">
                            India Statutory Standards
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-slate-300">
                          Add balanced, statutory-compliant clauses directly into your working
                          draft:
                        </p>

                        <div className="space-y-3">
                          {CREATOR_CLAUSES_TO_ADD.map((item) => (
                            <div
                              key={item.id}
                              className="p-4 rounded-xl bg-[#F9FAFB] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-0.5">
                                <span className="text-xs font-semibold text-[#0F766E] dark:text-teal-400">
                                  {item.category}
                                </span>
                                <h3 className="font-heading text-sm font-bold text-[#111827] dark:text-white">
                                  {item.title}
                                </h3>
                              </div>

                              <button
                                onClick={() => setDraft((prev) => prev.trim() + item.text)}
                                className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-teal-50 text-[#0F766E] dark:text-teal-300 border border-gray-300 dark:border-slate-700 hover:border-[#0F766E] text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                              >
                                <Plus size={14} />
                                <span>Add to Draft</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>
              </section>
            )}

            {/* ===============================================================
                DEDICATED 24+ TEMPLATES & AI COMPARE VIEW
               =============================================================== */}
            {page === 'shield' && (
              <ContractShieldHub
                onLoadTemplateIntoReadingRoom={handleLoadTemplateIntoReadingRoom}
                initialSubTab={shieldSubTab}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* =====================================================================
          CLEAN SAAS FOOTER WITH LEGAL DISCLAIMER
         ===================================================================== */}
      <footer className="mint-footer"><span>© {new Date().getFullYear()} Froggo</span><span>For information, not legal advice.</span><button onClick={()=>{setShieldSubTab('privacy');navigateTo('shield')}}>Privacy <ArrowUpRight size={12}/></button></footer>

      {/* =====================================================================
          FROGGO AI LEGAL QUERY CHATBOT & GEMINI LIVE VOICE ASSISTANT
         ===================================================================== */}
      </div>
      <LegalAIAssistant
        isOpen={aiAssistantOpen}
        initialMode={aiAssistantMode}
        onClose={() => setAiAssistantOpen(false)}
        onOpenWithMode={(mode) => {
          setAiAssistantMode(mode);
          setAiAssistantOpen(true);
        }}
        role={role}
        contractTitle={currentFile.title}
        contractClauses={currentFile.clauses.map((text, idx) => ({
          id: `c-${String(idx + 1).padStart(3, '0')}`,
          text,
        }))}
        onSelectClause={(clauseId) => {
          const matchIdx = currentFile.clauses.findIndex(
            (_, idx) => `c-${String(idx + 1).padStart(3, '0')}` === clauseId.toLowerCase()
          );
          if (matchIdx !== -1) {
            if (page !== 'read') {
              navigateTo('read');
            }
            scrollToClause(matchIdx);
          }
        }}
      />
    </div>
  );
}
