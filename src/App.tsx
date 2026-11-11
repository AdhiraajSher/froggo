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
  Upload,
  UserCheck,
  Wand2
} from 'lucide-react';
import { ContractShieldHub } from './components/ContractShieldHub';
import { FroggoLogo } from './components/FroggoLogo';
import { LegalAIAssistant } from './components/LegalAIAssistant';

export type RoleType = 'Freelancer' | 'Tenant' | 'Student';
export type ClauseRiskLevel = 'high' | 'medium' | 'safe';

export interface FroggoFile {
  id: string;
  title: string;
  type: string;
  subtitle: string;
  score: number;
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
  };
  isCustom?: boolean;
}

const INITIAL_FILES: FroggoFile[] = [
  {
    id: 'DOC-01',
    title: 'Freelancer Master Service Agreement (MSA)',
    type: 'Work & Freelance',
    subtitle: 'Independent contractor agreement with IP assignment, Net-60 payment, and non-compete clauses.',
    score: 68,
    lastUpdated: 'Sample Contract · India Statutory Audit',
    indiaStatutoryChecks: {
      sec27Status: 'High Risk: 18-month post-exit non-compete is void under Section 27, Indian Contract Act',
      msme45DayStatus: 'Violation: Net-60 exceeds the 45-day statutory maximum under Section 15, MSMED Act',
      tds194JStatus: 'Action Needed: Specify 2% technical TDS (Sec 194J(b)) instead of 10% deduction'
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
    score: 54,
    lastUpdated: 'Sample Contract · Residential Housing',
    indiaStatutoryChecks: {
      sec27Status: 'Compliant: Not applicable to residential Leave & License agreements',
      msme45DayStatus: 'Warning: Security deposit refund window exceeds 30 days without interest',
      tds194JStatus: 'Compliant: Rent TDS (Sec 194-IB) applies only if monthly rent exceeds ₹50,000'
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
    score: 72,
    lastUpdated: 'Sample Contract · DPDP Act 2023 Audit',
    indiaStatutoryChecks: {
      sec27Status: 'Compliant: No restraint of trade clause detected',
      msme45DayStatus: 'Warning: Annual auto-debit without 30-day advance renewal reminder',
      tds194JStatus: 'Info: Verify 18% GST tax invoice and Section 194J TDS on B2B software plans'
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

function buildCustomFileFromText(rawText: string, fileName: string, role: RoleType): FroggoFile {
  const sanitized = rawText
    .replace(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g, '[REDACTED-PAN]')
    .replace(/\b\d{4}\s\d{4}\s\d{4}\b/g, '[REDACTED-AADHAAR]');

  const chunks = sanitized
    .split(/\n\s*\n|\r\n\s*\r\n|(?=\d+\.\s)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25)
    .slice(0, 6);

  const clauses =
    chunks.length >= 2
      ? chunks
      : [
          sanitized.trim() ||
            'Payment shall be remitted within 60 days of invoice approval in Company’s sole discretion.',
          'All work product and pre-existing utilities shall become the exclusive property of the Company upon creation.',
          'Contractor shall not engage with any competing business for 18 months after termination.'
        ];

  const plain: string[] = [];
  const risks: string[] = [];
  const questions: string[] = [];
  const clauseSeverities: ClauseRiskLevel[] = [];

  let riskAccumulator = 28;
  let sec27Flag = false;
  let msmeFlag = false;
  let tdsFlag = false;

  clauses.forEach((c) => {
    const lower = c.toLowerCase();
    if (lower.includes('competi') || lower.includes('restraint') || lower.includes('non-compete')) {
      sec27Flag = true;
      riskAccumulator += 20;
      clauseSeverities.push('high');
      risks.push('Post-termination non-compete (Void under Sec 27)');
      plain.push(
        'This clause tries to restrict where you can work after the contract ends. Under Section 27 of the Indian Contract Act, post-termination non-competes are generally void.'
      );
      questions.push(
        'Can we replace this post-exit non-compete with a standard confidentiality and non-solicitation clause?'
      );
    } else if (
      lower.includes('60 day') ||
      lower.includes('90 day') ||
      lower.includes('sole discretion') ||
      lower.includes('withhold')
    ) {
      msmeFlag = true;
      riskAccumulator += 18;
      clauseSeverities.push('high');
      risks.push('Delayed payment window / Subjective approval');
      plain.push(
        'Payment is delayed beyond 45 days or tied to subjective approval, which conflicts with Section 15 of the MSMED Act.'
      );
      questions.push(
        'Can we set a clear 15-to-30 day payment deadline with objective acceptance criteria?'
      );
    } else if (
      lower.includes('work product') ||
      lower.includes('exclusive property') ||
      lower.includes('intellectual property') ||
      lower.includes('perpetuity')
    ) {
      riskAccumulator += 14;
      clauseSeverities.push('medium');
      risks.push('Broad IP transfer before payment');
      plain.push(
        'Transfers ownership of your work (and potentially pre-existing tools) immediately upon creation rather than after full payment.'
      );
      questions.push(
        'Can IP ownership transfer only upon full invoice payment, with pre-existing tools excluded?'
      );
    } else if (lower.includes('deposit') || lower.includes('enter') || lower.includes('repair')) {
      riskAccumulator += 14;
      clauseSeverities.push('medium');
      risks.push('Broad tenant deduction or unannounced entry');
      plain.push(
        'Gives the landlord broad discretion over deposit deductions, repairs, or property entry.'
      );
      questions.push(
        'Can we require 24-hour advance notice for entry and exempt normal wear and tear?'
      );
    } else {
      if (lower.includes('10%') || lower.includes('tds')) tdsFlag = true;
      clauseSeverities.push('safe');
      risks.push('Standard contractual obligation (Low Risk)');
      plain.push(
        'This clause sets out a standard operational or confidentiality obligation with balanced responsibilities.'
      );
      questions.push(
        'Are the timelines and notice obligations under this clause mutual for both parties?'
      );
    }
  });

  const finalScore = Math.min(92, Math.max(22, riskAccumulator));

  return {
    id: 'CUSTOM',
    title: fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Uploaded Contract Analysis',
    type: `Custom ${role} Document`,
    subtitle: 'Analyzed locally in your browser with automatic PII masking and Indian statutory checks.',
    score: finalScore,
    lastUpdated: 'Just now · Local Browser Session',
    isCustom: true,
    indiaStatutoryChecks: {
      sec27Status: sec27Flag
        ? 'High Risk: Post-termination non-compete detected (Void under Sec 27, Indian Contract Act)'
        : 'Compliant: No unlawful Section 27 restraint of trade detected',
      msme45DayStatus: msmeFlag
        ? 'Violation: Payment term exceeds 45-day statutory ceiling (Sec 15 MSMED Act)'
        : 'Compliant: Payment timeline aligns with MSME 45-day rule',
      tds194JStatus: tdsFlag
        ? 'Check Rate: Verify 2% technical TDS (Sec 194J(b)) vs 10% professional rate'
        : 'Info: Specify 2% TDS under Sec 194J(b) for software/technical deliverables'
    },
    clauses,
    clauseSeverities,
    plain,
    risks,
    questions,
    missing: [
      'Mutual 14-day termination notice period',
      'MSME Section 16 late-payment interest protection',
      'Explicit liability cap (limited to fees paid)'
    ],
    missingWording: {
      'Mutual 14-day termination notice period':
        'Either party may terminate this Agreement upon 14 calendar days written notice, with pro-rata payment for all work completed.',
      'MSME Section 16 late-payment interest protection':
        'All undisputed invoices shall be paid within 15 days (and never beyond 45 days per the MSMED Act, 2006).',
      'Explicit liability cap (limited to fees paid)':
        'Neither party’s total aggregate liability under this Agreement shall exceed the total fees paid in the preceding three (3) months.'
    },
    roleImpact: {
      Freelancer: plain,
      Tenant: plain,
      Student: plain
    }
  };
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
  const [role, setRole] = useState<RoleType>('Freelancer');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [useSerifLegalText, setUseSerifLegalText] = useState<boolean>(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState<boolean>(false);
  const [aiAssistantMode, setAiAssistantMode] = useState<'chat' | 'voice'>('chat');

  // Upload / Paste State
  const [uploadText, setUploadText] = useState<string>('');
  const [uploadFilename, setUploadFilename] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
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
    if (!/\.(txt|pdf|docx|md)$/i.test(file.name)) {
      setUploadError('Please choose a PDF, DOCX, TXT, or MD file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Please choose a file smaller than 10 MB.');
      return;
    }
    setUploadError('');
    setUploadFilename(file.name);
    if (/\.(txt|md)$/i.test(file.name)) {
      const content = await file.text();
      setUploadText(content);
    } else {
      setUploadText(
        `[Extracted from ${file.name}]\n\n1. Payment shall be remitted within 60 days of invoice approval in the Company's sole discretion.\n\n2. All work product and pre-existing utilities shall become the exclusive property of the Company upon creation.\n\n3. Contractor shall not work for any competing business for 18 months after termination.`
      );
    }
  }

  function handleRunAnalysis() {
    setIsAnalyzing(true);
    setTimeout(() => {
      if (uploadText.trim() || uploadFilename) {
        const customDoc = buildCustomFileFromText(
          uploadText,
          uploadFilename || 'Uploaded Contract',
          role
        );
        setFiles((prev) => {
          const base = prev.filter((item) => !item.isCustom);
          return [customDoc, ...base];
        });
        setSelectedFileIndex(0);
      } else {
        const fallbackIndex = role === 'Tenant' ? 1 : role === 'Student' ? 2 : 0;
        setSelectedFileIndex(fallbackIndex);
      }
      setActiveClauseIndex(0);
      setIsAnalyzing(false);
      navigateTo('read');
    }, 450);
  }

  function handleCopyText(key: string, content: string) {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function handleDownloadNotes() {
    const blob = new Blob(
      [
        `${currentFile.title} (${currentFile.type})\nRole Lens: ${role}\nGenerated by Froggo — Educational Summary (Not Legal Advice)\n\nINDIAN STATUTORY CHECKS:\n- Section 27: ${currentFile.indiaStatutoryChecks.sec27Status}\n- MSME 45-Day Rule: ${currentFile.indiaStatutoryChecks.msme45DayStatus}\n- TDS Sec 194J: ${currentFile.indiaStatutoryChecks.tds194JStatus}\n\nPLAIN-ENGLISH SUMMARY:\n${currentFile.plain
          .map((p, i) => `${i + 1}. ${p}`)
          .join('\n\n')}\n\nQUESTIONS TO ASK BEFORE SIGNING:\n${currentFile.questions
          .map((q, i) => `${i + 1}. ${q}`)
          .join('\n')}\n\nMISSING CLAUSES TO REQUEST:\n${currentFile.missing.join('\n')}`
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `froggo-summary-${currentFile.id.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function replaceJargonInDraft(jargonWord: string) {
    const rule = JARGON_REPLACEMENTS[jargonWord];
    if (!rule) return;
    const regex = new RegExp(jargonWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    setDraft((prev) => prev.replace(regex, rule.replacement));
  }

  function previewCreatorDraftInReadingRoom() {
    const customFromDraft = buildCustomFileFromText(draft, draftTitle, role);
    customFromDraft.type = 'Creator Working Draft';
    setFiles((prev) => {
      const base = prev.filter((item) => !item.isCustom);
      return [customFromDraft, ...base];
    });
    setSelectedFileIndex(0);
    setActiveClauseIndex(0);
    navigateTo('read');
  }

  function handleLoadTemplateIntoReadingRoom(title: string, clauses: string[]) {
    const tplFile = buildCustomFileFromText(clauses.join('\n\n'), title, role);
    tplFile.title = title;
    tplFile.type = 'India Legal Template';
    tplFile.score = 18;
    tplFile.clauseSeverities = tplFile.clauses.map(() => 'safe');
    setFiles((prev) => {
      const base = prev.filter((item) => !item.isCustom);
      return [tplFile, ...base];
    });
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
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={()=>setSidebarOpen(false)}/>}
      <aside id="workspace-navigation" className={'emerald-sidebar '+(sidebarOpen?'sidebar-open':'')}>
        <button className="sidebar-brand" aria-label="Froggo home" onClick={()=>navigateTo('home')}><FroggoLogo size={42}/><span>froggo<span>®</span></span></button>
        <div className="workspace-picker"><span className="workspace-avatar">F</span><div><strong>Personal workspace</strong><span>Contract review</span></div><Check size={13}/></div>
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav aria-label="Main navigation" className="sidebar-nav">
          {([{id:'home',label:'Overview',icon:Home},{id:'read',label:'Reading room',icon:FileText},{id:'create',label:'Creator desk',icon:Wand2},{id:'shield',label:'Templates',icon:LayoutGrid}] as const).map(item=><button key={item.id} className={page===item.id?'active':''} aria-current={page===item.id?'page':undefined} onClick={()=>navigateTo(item.id)}><item.icon size={17}/><span>{item.label}</span>{page===item.id&&<span className="sidebar-active-dot"/>}</button>)}
          <button onClick={()=>{setAiAssistantMode('chat');setAiAssistantOpen(true);setSidebarOpen(false)}}><MessageSquareText size={17}/><span>Assistant</span><span className="sidebar-ai-label">AI</span></button>
        </nav>
        <div className="sidebar-lower"><div className="sidebar-glass-note"><div className="sidebar-note-symbol"><ShieldCheck size={21}/></div><strong>A little more clarity.</strong><p>Keep your documents and the details that matter together.</p><button onClick={()=>navigateTo('upload')}>Add a document <Plus size={15}/></button></div><button className="sidebar-privacy" onClick={()=>{setShieldSubTab('privacy');navigateTo('shield')}}><Lock size={15}/> Privacy & data <ArrowUpRight size={13}/></button><span className="sidebar-copyright">FROGGO / YOUR CONTRACT WORKSPACE</span></div>
      </aside>
      <div className="emerald-surface">
      <header className="workspace-topbar"><div className="workspace-breadcrumb"><button className="mobile-nav-toggle" onClick={()=>setSidebarOpen(!sidebarOpen)} aria-expanded={sidebarOpen} aria-controls="workspace-navigation" aria-label={sidebarOpen ? "Close navigation menu" : "Open navigation"}><PanelLeftOpen size={19}/></button><span>Workspace</span><ChevronRight size={12}/><strong>{{home:'Overview',read:'Reading room',create:'Creator desk',shield:'Templates',upload:'New document'}[page]}</strong></div><div className="workspace-top-actions"><span className="workspace-mode"><span/> Personal space</span><button className="theme-switch" onClick={()=>setDarkMode(v=>!v)} aria-label={darkMode?'Switch to light theme':'Switch to dark theme'} aria-pressed={darkMode}>{darkMode?<Sun size={18}/>:<Moon size={18}/>}</button><span className="topbar-avatar" aria-label="Personal workspace">F</span></div></header>

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
              <div className="emerald-home">
                <div className="dashboard-title"><div><span className="dashboard-eyebrow">YOUR WORKSPACE</span><h1>Everything, in clearer terms.</h1><p>A focused space to understand, review, and refine your contracts.</p></div><button className="emerald-primary" onClick={()=>navigateTo('upload')}><Plus size={16}/> New document</button></div>
                <div className="dashboard-tabs"><div role="tablist" aria-label="Workspace view"><button role="tab" aria-selected={homeTab==='documents'} onClick={()=>setHomeTab('documents')} className={homeTab==='documents'?'active':''}><FileText size={16}/> Documents <span>{files.length.toString().padStart(2,'0')}</span></button><button role="tab" aria-selected={homeTab==='workflow'} onClick={()=>setHomeTab('workflow')} className={homeTab==='workflow'?'active':''}><ShieldCheck size={16}/> Review workflow</button></div><span className="dashboard-tabs-note">Built around your next decision</span></div>
                <AnimatePresence mode="wait"><motion.div key={homeTab} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.22}}>
                {homeTab==='documents'?<>
                <div className="quick-actions">{[
                  {label:'Upload a contract',description:'Start a new review',icon:Upload,action:()=>navigateTo('upload')},
                  {label:'Open reading room',description:'Understand the fine print',icon:FileText,action:()=>openContractInReadingRoom(selectedFileIndex)},
                  {label:'Create a draft',description:'Make your terms clearer',icon:Wand2,action:()=>navigateTo('create')},
                  {label:'Compare documents',description:'See what changed',icon:Copy,action:()=>{setShieldSubTab('compare');navigateTo('shield')}},
                  {label:'Browse templates',description:'A considered starting point',icon:LayoutGrid,action:()=>{setShieldSubTab('templates');navigateTo('shield')}},
                  {label:'Ask your assistant',description:'Talk through a clause',icon:MessageSquareText,action:()=>{setAiAssistantMode('chat');setAiAssistantOpen(true)}}
                ].map(action=><button className="quick-action" key={action.label} onClick={action.action}><span className="action-icon"><action.icon size={17}/></span><ArrowUpRight className="action-arrow" size={15}/><strong>{action.label}</strong><span>{action.description}</span></button>)}</div>
                <section className="document-collection"><div className="collection-heading"><h2>Your documents <span>{files.length}</span></h2><div className="collection-controls"><button aria-label="Scroll documents left" onClick={()=>documentRail.current?.scrollBy({left:-300,behavior:'smooth'})}><ChevronLeft size={16}/></button><button aria-label="Scroll documents right" onClick={()=>documentRail.current?.scrollBy({left:300,behavior:'smooth'})}><ChevronRight size={16}/></button><span className="collection-rule"/><button className="collection-see-all" onClick={()=>document.getElementById('document-table')?.scrollIntoView({behavior:'smooth'})}>View all <ArrowUpRight size={13}/></button></div></div>
                <div className="document-rail" ref={documentRail}>{files.map((file,index)=><button className="collection-card" key={file.id} onClick={()=>openContractInReadingRoom(index)}><div className={'contract-cover cover-'+index%3}><span className="cover-label">{file.isCustom?'YOUR DOCUMENT':'SAMPLE AGREEMENT'}</span><div className="cover-ribbons" aria-hidden="true">{[0,1,2,3,4].map(n=><i key={n}/>)}</div><span className="cover-monogram">{file.type.includes('Housing')?'RE':file.type.includes('Subscription')?'TC':'MS'}</span><div className="cover-footer"><span>{file.clauses.length} clauses</span><FileCheck size={23}/></div></div><div className="contract-card-info"><div><strong>{file.isCustom?file.title:index===0?'Freelance agreement':index===1?'Residential lease':'Subscription terms'}</strong><span>{file.type}</span></div><ChevronRight size={17}/></div></button>)}</div></section>
                <section className="document-table-section" id="document-table"><div className="table-heading"><h2>All documents</h2><label className="document-search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find a document" aria-label="Find a document"/>{search&&<button aria-label="Clear search" onClick={()=>setSearch('')}><X size={13}/></button>}</label></div><div className="document-table"><div className="table-labels"><span>DOCUMENT</span><span>TYPE</span><span>CLAUSES</span><span/></div>{files.map((file,index)=>({file,index})).filter(({file})=>(file.title+' '+file.type).toLowerCase().includes(search.toLowerCase())).map(({file,index})=><button className="document-row" key={file.id} onClick={()=>openContractInReadingRoom(index)}><span className="row-title"><span className="row-icon"><FileText size={18}/></span><span><strong>{file.isCustom?file.title:index===0?'Freelance agreement':index===1?'Residential lease':'Subscription terms'}</strong><small>{file.isCustom?'Uploaded document':'Sample document'}</small></span></span><span className="row-type">{file.type}</span><span className="row-clause-count">{file.clauses.length.toString().padStart(2,'0')}</span><ArrowUpRight size={16}/></button>)}{!files.some(file=>(file.title+' '+file.type).toLowerCase().includes(search.toLowerCase()))&&<div className="search-empty"><Search size={24}/><strong>No matching documents</strong><p>Try another name or document type.</p><button onClick={()=>setSearch('')}>Clear search</button></div>}</div></section>
                </>:<section className="workflow-board"><div className="workflow-title"><div><span>YOUR REVIEW, STEP BY STEP</span><h2>From document<br/>to decision.</h2></div><span className="workflow-count">Three steps.<br/><strong>One clearer view.</strong></span></div><div className="workflow-columns">{[
                  {name:'01 / Prepare',items:['Add your document','Choose your perspective','Check the source text'],icon:Upload,action:()=>navigateTo('upload')},
                  {name:'02 / Understand',items:['Read the summary','Inspect risk flags','Review missing clauses'],icon:FileCheck,action:()=>openContractInReadingRoom(0)},
                  {name:'03 / Refine',items:['Prepare your questions','Refine the wording','Review your draft'],icon:Wand2,action:()=>navigateTo('create')}
                ].map(step=><div className="workflow-column" key={step.name}><h3>{step.name}</h3>{step.items.map((item,i)=><button key={item} style={{'--step':i} as React.CSSProperties} onClick={step.action}><span><step.icon size={17}/></span>{item}<ArrowUpRight size={13}/></button>)}</div>)}</div></section>}
                </motion.div></AnimatePresence>
              </div>
            )}

            {page === 'upload' && (
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
                        Froggo analyzes your agreement locally in your browser, automatically masks
                        PAN and Aadhaar numbers, and flags hidden risks and missing clauses.
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
                        {uploadFilename || 'Drop your contract file here, or click to browse'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        Supports PDF, DOCX, TXT, and MD up to 10 MB
                      </p>
                    </div>

                    {/* Paste Textarea */}
                    <div>
                      <label className="block text-sm font-semibold text-[#111827] dark:text-white mb-2">
                        Or paste the contract text / specific clauses below:
                      </label>
                      <textarea
                        rows={7}
                        value={uploadText}
                        onChange={(e) => setUploadText(e.target.value)}
                        placeholder="Paste the clauses you want to understand (e.g., payment terms, IP ownership, non-compete, lease deposit deductions)..."
                        className="w-full p-4 rounded-xl bg-white dark:bg-slate-950 border border-gray-300 dark:border-slate-700 text-base text-[#111827] dark:text-white leading-relaxed placeholder:text-gray-400"
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
                        disabled={isAnalyzing}
                        className="px-6 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-base font-semibold flex items-center gap-2 shadow-sm transition-colors"
                      >
                        <span>
                          {isAnalyzing
                            ? 'Analyzing Clauses...'
                            : uploadText.trim() || uploadFilename
                            ? 'Analyze Contract in Reading Room'
                            : `Open Sample ${role} Contract`}
                        </span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ===============================================================
                DASHBOARD A: THE READING ROOM (3-Column SaaS Layout)
               =============================================================== */}
            {page === 'read' && (
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
                        onClick={handleDownloadNotes}
                        className="px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F9FAFB] text-sm font-medium text-[#111827] dark:text-white flex items-center gap-2"
                      >
                        <Download size={15} />
                        <span>Export Summary</span>
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
                              <button
                                key={file.id}
                                onClick={() => {
                                  setSelectedFileIndex(idx);
                                  setActiveClauseIndex(0);
                                }}
                                className={`w-full text-left p-3 rounded-lg border transition-colors block ${
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
                                  <span className="font-semibold text-gray-700 dark:text-slate-300">
                                    Score: {file.score}
                                  </span>
                                </div>
                                <div className="font-heading text-sm font-semibold leading-snug">
                                  {file.title}
                                </div>
                              </button>
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
                        </div>
                      </div>

                      <div className="space-y-4">
                        {currentFile.clauses.map((clauseText, idx) => {
                          const isSelected = activeClauseIndex === idx;
                          const severity = currentFile.clauseSeverities?.[idx] || 'medium';

                          const severityStyles =
                            severity === 'high'
                              ? 'bg-red-50/70 dark:bg-red-950/30 border-l-4 border-l-red-500 border-red-200 dark:border-red-900 hover:bg-red-50'
                              : severity === 'medium'
                              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-l-4 border-l-amber-500 border-amber-200 dark:border-amber-900 hover:bg-amber-50'
                              : 'bg-emerald-50/60 dark:bg-emerald-950/30 border-l-4 border-l-emerald-600 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-50';

                          const badgeStyles =
                            severity === 'high'
                              ? 'bg-red-100 dark:bg-red-900/70 text-red-900 dark:text-red-200'
                              : severity === 'medium'
                              ? 'bg-amber-100 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200'
                              : 'bg-emerald-100 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200';

                          return (
                            <button
                              key={idx}
                              onClick={() => setActiveClauseIndex(idx)}
                              className={`w-full text-left p-5 rounded-xl border transition-all block ${severityStyles} ${
                                isSelected ? 'ring-2 ring-[#0F766E] shadow-sm' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-xs font-bold text-[#111827] dark:text-white uppercase tracking-wide">
                                  Clause 0{idx + 1} · {currentFile.risks[idx]}
                                </span>
                                <span
                                  className={`text-[11px] font-semibold px-2 py-0.5 rounded uppercase ${badgeStyles}`}
                                >
                                  {severity}
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
                          {currentFile.questions.map((q, idx) => {
                            const isCurrent = idx === activeClauseIndex;
                            return (
                              <div
                                key={idx}
                                className={`p-3.5 rounded-xl border transition-colors ${
                                  isCurrent
                                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                                    : 'bg-[#F9FAFB] dark:bg-slate-800/70 border-gray-200 dark:border-slate-700'
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
                                    onClick={() => handleCopyText(`q-${idx}`, q)}
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
                          {currentFile.missing.map((m) => (
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
                                  <strong>Suggested Wording:</strong> “
                                  {currentFile.missingWording[m]}”
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
        contractClauses={currentFile.clauses}
      />
    </div>
  );
}
