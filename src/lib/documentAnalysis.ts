import {
  ContractDocument,
  DocumentClause,
  DocumentFinding,
  FindingSeverity,
  MissingClauseSuggestion,
  RoleType,
  ScoreBreakdown,
  ScorePenalty,
  StatutoryCheckResult,
} from './types';
import type { ContractDossier, UserRole } from '../data/contractsData';

/**
 * Segment raw contract text into discrete clauses with stable IDs ("c-001")
 * and character offsets (start, end) into rawText.
 *
 * Supports:
 * - Numbered headings: "1. ", "1) ", "1: ", "1 - ", "1.1 ", "1.1.1 "
 * - Roman numerals: "I. ", "II. ", "III. ", "IV. ", etc.
 * - Bracketed clauses: "(1) ", "(2) ", "[1] ", "[a] "
 * - Explicit keywords: "Clause 1", "Section 1", "Article 1"
 * - Double newline / paragraph fallback when headings are absent
 */
export function segmentContractClauses(rawText: string): DocumentClause[] {
  if (!rawText || !rawText.trim()) {
    return [];
  }

  const normalized = rawText.replace(/\r\n/g, '\n');
  const clauses: DocumentClause[] = [];

  // Regex identifying clause starts:
  // 1. "Clause 1", "Section 1", "Article 1"
  // 2. Numbers: "1. ", "1) ", "1: ", "1 - ", "1.1 "
  // 3. Roman numerals: "I. ", "II. ", "III. ", "IV. ", "V. ", "VI. ", "VII. ", "VIII. ", "IX. ", "X. "
  // 4. Bracketed: "(1) ", "(2) ", "[1] ", "[2] "
  const boundaryRegex = /(?:^|\n)(?=(?:(?:Clause|Section|Article)\s+\d+[\.\:\-\s]|\b(?:I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\.\s+|\(?\d+\)[\.\:\-\s]|\b\d+\.\d+(?:\.\d+)?\b|\b\d+[\.\:\-]\s+))/i;

  const parts = normalized
    .split(boundaryRegex)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // If the boundary regex produced meaningful clauses (>= 2), use them;
  // otherwise, fall back to paragraph-based segmentation (split on double newline).
  const candidateSegments =
    parts.length >= 2
      ? parts
      : normalized
          .split(/\n\s*\n+/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

  let currentSearchPos = 0;

  for (let i = 0; i < candidateSegments.length; i++) {
    const segment = candidateSegments[i];
    const startIndex = normalized.indexOf(segment, currentSearchPos);
    const start = startIndex !== -1 ? startIndex : currentSearchPos;
    const end = start + segment.length;
    currentSearchPos = end;

    // Extract title if the segment begins with a heading (e.g. "1. Payment Terms: ...")
    const titleMatch = segment.match(
      /^(?:(?:Clause|Section|Article|\b(?:I|II|III|IV|V|VI|VII|VIII|IX|X)\.|\(?\d+\)?|\d+\.\d+)[\s\.\:\-\)]+([^\n\:\.]+))/i
    );
    const title = titleMatch ? titleMatch[1].trim() : `Clause ${i + 1}`;

    clauses.push({
      id: `c-${String(i + 1).padStart(3, '0')}`,
      text: segment,
      start,
      end,
      title,
    });
  }

  return clauses;
}

/**
 * Determine contract category from text cues
 */
export function inferContractType(
  rawText: string,
  role: RoleType
): 'freelance' | 'tenancy' | 'student' | 'general' {
  const lower = rawText.toLowerCase();

  // Explicit tenancy cues
  if (
    /\b(tenant|tenancy|landlord|licensor|licensee|lease|rent|premises|flat|apartment|security\s+deposit|lock-in)\b/i.test(
      lower
    )
  ) {
    return 'tenancy';
  }

  // Explicit student / internship cues
  if (
    /\b(intern|internship|stipend|university|student|college|coursework|thesis|academic)\b/i.test(
      lower
    )
  ) {
    return 'student';
  }

  // Explicit freelance / contractor cues
  if (
    /\b(freelanc\w*|contractor|independent\s+contractor|deliverable\w*|consultant|sow|statement\s+of\s+work|client|hourly\s+rate|milestone)\b/i.test(
      lower
    )
  ) {
    return 'freelance';
  }

  if (role === 'Tenant') return 'tenancy';
  if (role === 'Student') return 'student';
  return 'freelance';
}

/**
 * Single Analysis Pipeline: analyzes raw contract text honestly without any
 * fabricated fallbacks or simulated canned text.
 *
 * Adheres to:
 * - Word boundary checks (e.g. \benter\b vs entire)
 * - Negation detection ("no non-compete applies")
 * - Gated statutory checks per contract type (MSME checks omitted for tenancy)
 * - Default severity is "not_assessed", NEVER "safe"
 * - Statutory statuses strictly use "Issue detected", "Not detected in this text", or "Not applicable to this contract type"
 */
export function analyzeContractDocument(
  rawText: string,
  sourceFileName: string = 'Uploaded Contract',
  role: RoleType = 'Freelancer'
): ContractDocument {
  const trimmed = rawText.trim();
  const contractType = inferContractType(trimmed, role);
  const clauses = segmentContractClauses(trimmed);

  const findings: DocumentFinding[] = [];
  const plainSummary: string[] = [];
  const penalties: ScorePenalty[] = [];

  let sec27Detected = false;
  let msmeDetected = false;
  let sec43BhDetected = false;
  let tdsDetected = false;
  let dpdpDetected = false;

  let unassessedCount = 0;
  let assessedCount = 0;

  // Process each clause honestly
  for (let i = 0; i < clauses.length; i++) {
    const clause = clauses[i];
    const text = clause.text;
    const lower = text.toLowerCase();
    const clauseId = clause.id;

    let clauseSeverity: FindingSeverity = 'not_assessed';
    let findingTitle = '';
    let explanation = '';
    let suggestedEdit = '';
    let penaltyPoints = 0;

    // Negation detection helper: distinguishes explicit safe disclaimers ("no non-compete applies", "shall not be restricted from competing")
    // from actual restrictive covenants ("agrees not to engage in competing business").
    const hasNonCompeteNegation =
      /\b(?:no\s+non-compete|without\s+any\s+non-compete|not\s+(?:be\s+)?restricted\s+from\s+competing|not\s+(?:be\s+)?prohibited\s+from\s+competing|nothing\s+herein\s+shall\s+(?:restrict|prevent|prohibit))\b/i.test(
        lower
      ) ||
      /\bshall\s+not\s+be\s+restricted\s+from\s+(?:working|competing|offering\s+services)\b/i.test(
        lower
      );

    const hasPaymentDelayNegation =
      /\b(?:within|no\s+later\s+than)\s+(?:15|30|45)\s*days\b/i.test(lower);

    // 1. Non-compete restraint check (Indian Contract Act Sec 27)
    // Only applies to employment / freelance / student engagements, not residential leases
    const mentionsNonCompete =
      /\b(?:non-compete|restraint\s+of\s+trade|competing\s+business|competing\s+firm|restrict(?:ed)?\s+from\s+working\s+with\s+competitor)\b/i.test(
        lower
      );

    if (contractType !== 'tenancy' && mentionsNonCompete && !hasNonCompeteNegation) {
      sec27Detected = true;
      clauseSeverity = 'high';
      penaltyPoints = 25;
      findingTitle = 'Post-Termination Non-Compete Restraint';
      explanation =
        'This clause attempts to restrain you from working with competing businesses or clients after termination. In India, post-employment non-compete covenants are generally held void under Section 27 of the Indian Contract Act, 1872.';
      suggestedEdit =
        'Request replacing this post-termination restriction with a standard non-solicitation and proprietary trade secrets confidentiality covenant.';
    }
    // 2. Payment terms & MSME 45-day ceiling (Sections 15 & 16, MSMED Act, 2006 + Section 43B(h))
    // Not applicable to tenancy agreements
    else if (
      contractType !== 'tenancy' &&
      !hasPaymentDelayNegation &&
      (/\b(?:60|90|120)\s*days?\b/i.test(lower) ||
        /\bsole\s+and\s+absolute\s+discretion\b/i.test(lower) ||
        (/\bwithhold\s+payment\b/i.test(lower) && !/\bwithhold\s+tax\b/i.test(lower)))
    ) {
      msmeDetected = true;
      sec43BhDetected = true;
      clauseSeverity = 'high';
      penaltyPoints = 20;
      findingTitle = 'Delayed Payment Window & Subjective Approval';
      explanation =
        'Payment terms exceeding 45 days violate Section 15 of the MSMED Act, 2006 for registered MSMEs. Furthermore, under Section 43B(h) of the Income Tax Act, buyers cannot claim tax deductions for delayed payments beyond 45 days. Subjective satisfaction creates cash-flow risk.';
      suggestedEdit =
        'Specify Net-15 or Net-30 payment terms tied to written deliverable acceptance against objective criteria, citing Section 15 of the MSMED Act, 2006 and Section 43B(h).';
    }
    // 3. IP Ownership Sweep & Prior Tools
    else if (
      contractType !== 'tenancy' &&
      (/\bwork\s+made\s+for\s+hire\b/i.test(lower) ||
        /\bexclusive\s+property\s+of\s+(?:the\s+)?(?:company|client)\b/i.test(lower) ||
        /\bpre-existing\s+(?:utilities|tools|libraries|ip)\b/i.test(lower) ||
        (/\bintellectual\s+property\b/i.test(lower) && /\bin\s+perpetuity\b/i.test(lower)))
    ) {
      clauseSeverity = 'medium';
      penaltyPoints = 15;
      findingTitle = 'Broad IP Ownership Transfer & Prior Tool Sweep';
      explanation =
        'Transfers ownership of all work product (and potentially prior personal tools, starter libraries, or design components) immediately upon creation rather than upon full payment.';
      suggestedEdit =
        'Clarify that custom IP transfers solely upon full invoice settlement, and insert an explicit carve-out for pre-existing tools, templates, and general know-how.';
    }
    // 4. Tenancy issues: Deposit deductions & unannounced landlord entry (with word boundaries)
    else if (
      contractType === 'tenancy' &&
      (/\bunannounced\s+entry\b/i.test(lower) ||
        (/\benter\b/i.test(lower) && /\bwithout\s+(?:prior\s+)?notice\b/i.test(lower)) ||
        /\bdeduct\b[^\.\n]{0,40}\bdeposit\b/i.test(lower) ||
        /\bjoint\s+and\s+several\b/i.test(lower))
    ) {
      clauseSeverity = 'high';
      penaltyPoints = 20;
      findingTitle = 'Unannounced Landlord Entry or Discretionary Deposit Deduction';
      explanation =
        'Permits property entry without advance notice (violating peaceful possession), or grants unrestricted discretion over security deposit deductions without an itemized move-out damages inspection.';
      suggestedEdit =
        'Require at least 24 hours written notice before non-emergency landlord entry, and stipulate that deposit refunds occur within 7 days of key handover with normal wear-and-tear exempted.';
    }
    // 5. Unilateral termination or unlimited indemnity
    else if (
      /\bindemnif(?:y|ication)\b/i.test(lower) ||
      (/\bterminate\s+immediately\b/i.test(lower) && /\bsole\s+discretion\b/i.test(lower))
    ) {
      clauseSeverity = 'medium';
      penaltyPoints = 12;
      findingTitle = 'One-Sided Termination or Broad Indemnification';
      explanation =
        'Permits unilateral termination without notice, or imposes broad indemnification for indirect damages without a reciprocal liability cap.';
      suggestedEdit =
        'Require a mutual 14-day notice period for termination and cap total liability at fees paid under this agreement.';
    }
    // 6. Balanced / standard clause (marked safe ONLY if strictly mutual standard administrative terms)
    else if (
      (/\bmutual\s+confidential(?:ity)?\b/i.test(lower) ||
        (/\bconfidential(?:ity)?\b/i.test(lower) && /\bboth\s+parties\b/i.test(lower))) ||
      /\bgoverning\s+law\b/i.test(lower) ||
      /\bforce\s+majeure\b/i.test(lower)
    ) {
      clauseSeverity = 'safe';
      findingTitle = 'Standard Mutual Contractual Terms';
      explanation =
        'This clause outlines standard administrative, confidentiality, or jurisdictional guidelines with balanced mutual responsibilities.';
      suggestedEdit = 'Ensure notice periods and confidentiality durations remain reciprocal.';
    } else {
      // 7. Unassessed clause: strictly "not_assessed", NEVER "safe"
      clauseSeverity = 'not_assessed';
      findingTitle = 'Clause Terms (Not Assessed)';
      explanation =
        'Froggo did not identify high-risk non-compete, MSME payment delay, or IP sweep keywords in this clause. Not assessed for formal legal validity.';
      suggestedEdit =
        'Review with qualified legal counsel if this clause impacts core deliverables or personal liability.';
    }

    if (clauseSeverity === 'not_assessed') {
      unassessedCount++;
    } else {
      assessedCount++;
    }

    if (penaltyPoints > 0) {
      penalties.push({
        clauseId,
        title: findingTitle,
        severity: clauseSeverity,
        points: penaltyPoints,
        reason: explanation,
      });
    }

    if (
      lower.includes('194j') ||
      (/\btds\b/i.test(lower) && /\btax\b/i.test(lower)) ||
      /\btax\s+deduction\b/i.test(lower)
    ) {
      tdsDetected = true;
    }

    if (
      /\bdata\s+protection\b/i.test(lower) ||
      /\bdpdp\b/i.test(lower) ||
      /\bpersonal\s+data\b/i.test(lower)
    ) {
      dpdpDetected = true;
    }

    const findingId = `f-${String(i + 1).padStart(3, '0')}`;
    findings.push({
      id: findingId,
      clauseId,
      category:
        clauseSeverity === 'high'
          ? 'Critical Risk'
          : clauseSeverity === 'medium'
          ? 'Financial & Rights'
          : clauseSeverity === 'safe'
          ? 'Standard Terms'
          : 'General Terms',
      severity: clauseSeverity,
      title: findingTitle,
      explanation,
      suggestedQuestionOrEdit: suggestedEdit,
      quotedText: text.length > 140 ? text.slice(0, 137) + '...' : text,
      quotedTextVerified: true,
    });

    plainSummary.push(explanation);
  }

  // Calculate honest risk score estimate (0 - 100)
  // Transparent base score: 0 + sum of penalties (capped at 100)
  const totalPenaltyPoints = penalties.reduce((sum, p) => sum + p.points, 0);
  const calculatedScore = Math.min(100, Math.max(0, totalPenaltyPoints));

  const scoreBreakdown: ScoreBreakdown = {
    totalScore: calculatedScore,
    baseScore: 0,
    penalties,
    unassessedClausesCount: unassessedCount,
    totalClausesCount: clauses.length,
    assessedClausesCount: assessedCount,
    disclaimer:
      'Froggo risk score is an automated estimate for informational guidance, not a formal legal opinion or advocate certification under the Advocates Act, 1961.',
  };

  // Statutory checks panel states: Strictly "Issue detected", "Not detected in this text", or "Not applicable to this contract type". Never "Compliant".
  const statutoryChecks: StatutoryCheckResult = {
    sec27Status:
      contractType === 'tenancy'
        ? 'Not applicable to this contract type (Section 27 applies to trade, profession, or business agreements, not residential tenancy)'
        : sec27Detected
        ? 'Issue detected: Restraint of trade/non-compete clause found (Generally void under Section 27, Indian Contract Act, 1872)'
        : 'Not detected in this text (No Section 27 post-exit non-compete detected in extracted clauses)',

    msme45DayStatus:
      contractType === 'tenancy'
        ? 'Not applicable to this contract type (MSMED Act 2006 governs commercial supplier and service-provider transactions)'
        : msmeDetected
        ? 'Issue detected: Payment timeline exceeds 45 days or contains subjective delay (Conflicts with Section 15, MSMED Act, 2006)'
        : 'Not detected in this text (No explicit payment term exceeding 45 days detected)',

    sec43BhStatus:
      contractType === 'tenancy'
        ? 'Not applicable to this contract type'
        : sec43BhDetected
        ? 'Issue detected: Buyer may face disallowance of tax deduction under Section 43B(h) if payment to registered MSME is delayed beyond 45 days'
        : 'Not detected in this text (No delayed payment triggering Section 43B(h) deduction risks detected)',

    tds194JStatus:
      contractType === 'tenancy'
        ? 'Not applicable to this contract type (Rent TDS is governed by Section 194-IB if monthly rent exceeds ₹50,000, not Section 194J)'
        : tdsDetected
        ? 'Issue detected: Verify applicable rate — 2% TDS under Sec 194J(b) for technical services vs 10% under Sec 194J(a) for professional services'
        : 'Not detected in this text (Recommend explicitly specifying 2% TDS under Section 194J(b) for technical/software deliverables)',

    dpdpStatus: dpdpDetected
      ? 'Issue detected: Data processing mentioned — verify purpose limitation, user consent withdrawal, and data erasure compliance under DPDP Act, 2023'
      : 'Not detected in this text (No explicit DPDP Act 2023 data retention or consent terms found)',
  };

  // Missing clauses depending strictly on contract type and role
  const missingClauses: MissingClauseSuggestion[] = [];
  if (contractType === 'freelance') {
    missingClauses.push(
      {
        title: 'MSME Section 15 & 16 Payment and Compound Interest Protection',
        wording:
          'Payment terms shall not exceed 15 days (and in no case beyond 45 days per Section 15 of the MSMED Act, 2006). Overdue invoices accrue compound interest at three times the RBI bank rate per Section 16.',
        reason:
          'Prevents delayed client payouts and leverages statutory interest rights under Indian law.',
        importance: 'Essential',
      },
      {
        title: 'Pre-Existing IP Carve-Out & Payment-Linked Transfer',
        wording:
          'Title to custom deliverables transfers to the Client only upon full and final payment of all fees. The Contractor retains full ownership of pre-existing code libraries, utilities, and general know-how.',
        reason:
          'Protects reusable starter libraries and prevents clients from owning work they have not paid for.',
        importance: 'Essential',
      },
      {
        title: 'Section 194J(b) 2% Technical TDS Specification',
        wording:
          'TDS shall be deducted at 2% for technical/software services under Section 194J(b) of the Income Tax Act, 1961, and Form 16A certificates shall be furnished quarterly.',
        reason:
          'Avoids excessive 10% TDS deductions intended for traditional professional services.',
        importance: 'Recommended',
      },
      {
        title: 'Defined Revision Scope & Written Change Orders',
        wording:
          'Fees include up to two (2) rounds of revisions within thirty (30) days of initial delivery. Material additions or scope alterations require a written Change Order with agreed additional fees.',
        reason: 'Prevents unpaid scope creep and endless review cycles.',
        importance: 'Recommended',
      }
    );
  } else if (contractType === 'tenancy') {
    missingClauses.push(
      {
        title: 'Normal Wear-and-Tear Exemption & Move-In Photo Inventory',
        wording:
          'Licensee shall not be held liable for routine wear and tear, seasonal maintenance, or pre-existing building defects documented during joint move-in inspection.',
        reason:
          'Stops arbitrary deposit deductions for painting and age-related property degradation.',
        importance: 'Essential',
      },
      {
        title: '24-Hour Advance Written Notice for Property Entry',
        wording:
          'Licensor and inspection agents must provide at least 24 hours advance written notice prior to entering the premises, except in verified life-safety emergencies.',
        reason:
          'Guarantees privacy and peaceful enjoyment for residential tenants and students.',
        importance: 'Essential',
      },
      {
        title: 'Same-Day Security Deposit Refund Upon Key Handover',
        wording:
          'The security deposit shall be refunded via bank transfer/UPI on the date of vacating and key return, subject only to mutually agreed, itemized physical damage deductions.',
        reason:
          'Prevents months-long landlord retention of security deposits after lease exit.',
        importance: 'Essential',
      }
    );
  } else {
    // Student / Internship
    missingClauses.push(
      {
        title: 'Off-Duty Side Project & University Thesis Carve-Out',
        wording:
          'Company claims no ownership over inventions, software, coursework, or open-source contributions developed by the Intern outside working hours on personal devices without using Company confidential data.',
        reason:
          'Protects student hackathon projects, academic thesis work, and personal portfolio repositories.',
        importance: 'Essential',
      },
      {
        title: 'Academic Notice & Exam Period Accommodation',
        wording:
          'Intern may terminate with 7 calendar days notice for academic obligations and may request unpaid study leave during university examination schedules.',
        reason:
          'Ensures university coursework and degree completion take priority over internship work.',
        importance: 'Essential',
      },
      {
        title: 'Certificate of Internship and Experience Letter Guarantee',
        wording:
          'Upon satisfactory completion of the internship term, Company shall issue an official Internship Certificate and Experience Letter detailing roles and skills acquired within seven (7) days.',
        reason:
          'Guarantees written credentials necessary for academic credits and subsequent job applications.',
        importance: 'Recommended',
      }
    );
  }

  // Differentiated role impact genuinely tailored to each perspective
  const roleImpact: Record<RoleType, string[]> = {
    Freelancer: findings.map((f) => {
      if (f.severity === 'high') {
        return `Independent Business Risk: ${f.title} directly restricts your client billing pipeline or exposes you to unpaid cash-flow delays beyond the 45-day statutory limit.`;
      }
      if (f.severity === 'medium') {
        return `Commercial Scope Risk: ${f.title} compromises your ownership of proprietary code templates or creates unilateral termination exposure.`;
      }
      if (f.severity === 'safe') {
        return `Commercial Standard: ${f.title} provides balanced mutual protections standard in Indian B2B contracting.`;
      }
      return `Unassessed Term: Froggo did not identify specific statutory violations in this clause. Have qualified counsel review if it imposes unexpected freelancer obligations.`;
    }),

    Tenant: findings.map((f) => {
      if (f.severity === 'high') {
        return `Residential Housing Exposure: ${f.title} jeopardizes your security deposit refund or compromises your peaceful home privacy and 24-hour advance notice rights.`;
      }
      if (f.severity === 'medium') {
        return `Maintenance & Liability Burden: ${f.title} shifts major structural building repairs, utility costs, or flatmate default risks onto you.`;
      }
      if (f.severity === 'safe') {
        return `Residential Standard: ${f.title} reflects normal mutual tenancy guidelines under state Leave & License conventions.`;
      }
      return `Unassessed Term: No residential penalty triggers detected. Confirm this clause does not restrict routine household utility usage.`;
    }),

    Student: findings.map((f) => {
      if (f.severity === 'high') {
        return `Career & Academic Roadblock: ${f.title} could block your post-graduation job placement, university hackathons, or campus recruitment eligibility.`;
      }
      if (f.severity === 'medium') {
        return `Stipend & Portfolio Impact: ${f.title} threatens your internship stipend or claims rights over your student project repositories.`;
      }
      if (f.severity === 'safe') {
        return `Educational Standard: ${f.title} follows fair workplace practices suitable for student interns.`;
      }
      return `Unassessed Term: Standard administrative language. Ensure this clause does not interfere with university exam schedules.`;
    }),
  };

  return {
    id: `DOC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    title: sourceFileName.replace(/\.[^/.]+$/, ''),
    sourceFileName,
    rawText: trimmed,
    clauses,
    findings,
    score: calculatedScore,
    scoreBreakdown,
    role,
    createdAt: new Date().toISOString(),
    isSample: false,
    statutoryChecks,
    roleImpact,
    plainSummary,
    missingClauses,
  };
}

/**
 * Adapter converting ContractDocument to ContractDossier for UserSummarizerDashboard
 */
export function contractDocumentToDossier(doc: ContractDocument): ContractDossier {
  const roleLower = doc.role.toLowerCase() as UserRole;
  const wordCount = doc.rawText.split(/\s+/).filter(Boolean).length;

  return {
    id: doc.id,
    fileCode: doc.isSample ? 'SAMPLE · ARCHIVE' : 'LIVE · EXTRACTED',
    title: doc.title,
    counterparty: doc.sourceFileName || 'Analyzed Agreement',
    documentType: `${doc.role} Contract Review`,
    recommendedRole: roleLower,
    lastUpdated: doc.isSample ? 'Sample Contract' : 'Just Now · Local Browser Session',
    pageCount: Math.max(1, Math.ceil(wordCount / 320)),
    wordCount,
    riskScore: doc.score,
    riskVerdict: `${
      doc.score >= 70 ? 'High Caution' : doc.score >= 45 ? 'Elevated Caution' : 'Moderate'
    } · ${doc.findings.length} Clauses Analyzed`,
    plainSummary: {
      headline: `Froggo analyzed ${doc.clauses.length} clauses (${wordCount} words) with Indian statutory protections (Sec 27, MSMED 15/16, Sec 194J).`,
      overview:
        doc.plainSummary.length > 0
          ? doc.plainSummary.slice(0, 3)
          : ['Document analyzed under Indian legal guidelines.'],
      keyObligations: doc.findings.slice(0, 4).map((f) => ({
        label: f.category,
        detail: f.title,
        metric:
          f.severity === 'high'
            ? 'High Risk'
            : f.severity === 'medium'
            ? 'Review'
            : f.severity === 'safe'
            ? 'Standard'
            : 'Not Assessed',
      })),
    },
    clauses: doc.clauses.map((c, idx) => ({
      id: c.id,
      sectionNumber: String(idx + 1).padStart(2, '0'),
      title: c.title || `Clause ${idx + 1}`,
      verbatimText: c.text,
      plainMeaning: doc.findings[idx]?.explanation || 'Clause terms parsed from contract source.',
      riskFlagId: doc.findings[idx]?.id,
    })),
    riskFlags: doc.findings.map((f, i) => ({
      id: f.id,
      clauseId: f.clauseId,
      tabCode: `RF-${String(i + 1).padStart(2, '0')} · ${f.severity.toUpperCase()}`,
      title: f.title,
      severity:
        f.severity === 'high'
          ? 'critical'
          : f.severity === 'medium'
          ? 'warning'
          : f.severity === 'safe'
          ? 'notice'
          : 'notice',
      category: f.category,
      plainExplanation: f.explanation,
      roleImpact: {
        freelancer: doc.roleImpact.Freelancer[i] || f.explanation,
        tenant: doc.roleImpact.Tenant[i] || f.explanation,
        student: doc.roleImpact.Student[i] || f.explanation,
      },
      verbatimExcerpt: f.quotedText || '',
    })),
    missingClauses: (doc.missingClauses || []).map((m, i) => ({
      id: `mc-${i + 1}`,
      tabCode: `MC-${String(i + 1).padStart(2, '0')}`,
      title: m.title,
      importance: m.importance,
      whyYouNeedIt: m.reason,
      suggestedWording: m.wording,
    })),
    negotiationQuestions: doc.findings.map((f, i) => ({
      id: `nq-${i + 1}`,
      targetClause: f.category,
      questionToAsk: f.suggestedQuestionOrEdit,
      emailSnippet: `Hi, regarding clause "${f.title}", could we update the wording to clarify: ${f.suggestedQuestionOrEdit}`,
      leverageNote: f.explanation,
    })),
  };
}

/**
 * Adapter converting ContractDocument to FroggoFile for App.tsx Reading Room
 */
export function contractDocumentToFroggoFile(doc: ContractDocument): any {
  return {
    id: doc.id,
    title: doc.title,
    type: doc.isSample ? doc.title : `Custom ${doc.role} Document`,
    subtitle: doc.isSample
      ? 'Sample Contract · India Statutory Audit'
      : 'Analyzed with Indian statutory checks (Sec 27, MSMED 15/16, Sec 194J).',
    score: doc.score,
    scoreBreakdown: doc.scoreBreakdown,
    lastUpdated: doc.isSample ? 'Sample Contract' : 'Just now · Local Browser Session',
    clauses: doc.clauses.map((c) => c.text),
    clauseSeverities: doc.findings.map((f) => f.severity),
    plain: doc.plainSummary,
    risks: doc.findings.map((f) => f.title),
    questions: doc.findings.map((f) => f.suggestedQuestionOrEdit),
    missing: doc.missingClauses.map((m) => m.title),
    missingWording: Object.fromEntries(doc.missingClauses.map((m) => [m.title, m.wording])),
    roleImpact: doc.roleImpact,
    indiaStatutoryChecks: doc.statutoryChecks,
    isCustom: !doc.isSample,
    rawDocument: doc,
  };
}
