export type UserRole = 'freelancer' | 'tenant' | 'student';

export interface ContractClause {
  id: string;
  sectionNumber: string;
  title: string;
  verbatimText: string;
  plainMeaning: string;
  riskFlagId?: string;
}

export interface RiskFlag {
  id: string;
  clauseId: string;
  tabCode: string;
  title: string;
  severity: 'critical' | 'warning' | 'notice';
  category: string;
  plainExplanation: string;
  roleImpact: Record<UserRole, string>;
  verbatimExcerpt: string;
}

export interface MissingClause {
  id: string;
  tabCode: string;
  title: string;
  importance: 'Essential' | 'Recommended';
  whyYouNeedIt: string;
  suggestedWording: string;
}

export interface NegotiationQuestion {
  id: string;
  targetClause: string;
  questionToAsk: string;
  emailSnippet: string;
  leverageNote: string;
}

export interface ContractDossier {
  id: string;
  fileCode: string;
  title: string;
  counterparty: string;
  documentType: string;
  recommendedRole: UserRole;
  lastUpdated: string;
  pageCount: number;
  wordCount: number;
  riskScore: number; // 0-100 (higher = riskier)
  riskVerdict: string;
  plainSummary: {
    headline: string;
    overview: string[];
    keyObligations: {
      label: string;
      detail: string;
      metric: string;
    }[];
  };
  clauses: ContractClause[];
  riskFlags: RiskFlag[];
  missingClauses: MissingClause[];
  negotiationQuestions: NegotiationQuestion[];
}

export const PRESET_CONTRACTS: ContractDossier[] = [
  {
    id: 'freelancer-msa-2026',
    fileCode: 'FILE-01 · MSA/IP',
    title: 'Master Independent Contractor & IP Assignment Agreement',
    counterparty: 'Vanguard Labs Inc. (Series A)',
    documentType: 'Freelance Service Contract',
    recommendedRole: 'freelancer',
    lastUpdated: 'Nov 2026',
    pageCount: 14,
    wordCount: 4820,
    riskScore: 78,
    riskVerdict: 'High Caution · 3 One-Sided Clauses Detected',
    plainSummary: {
      headline:
        'You are building software for $6,500/month, but the client claims ownership of your pre-existing code library, can delay payment up to 60 days, and blocks you from working with any other AI company for 18 months.',
      overview: [
        'While the headline compensation looks standard, Section 4.2 contains a sweeping "Background IP Sweep" that transfers ownership of any reusable tools, templates, or components you bring into the project unless they are listed in an attached exhibit (which is currently blank).',
        'Additionally, payment is tied to "Client’s sole and absolute satisfaction" on Net-60 terms without late-fee protection, and the Termination clause allows the client to cancel mid-milestone without paying for work already completed.'
      ],
      keyObligations: [
        {
          label: 'Payment Schedule',
          detail: 'Invoiced monthly, paid 60 days after client approval',
          metric: 'Net-60 Days'
        },
        {
          label: 'Post-Contract Non-Compete',
          detail: 'Restricted from working with any competing SaaS or AI firm',
          metric: '18 Months'
        },
        {
          label: 'Uncapped Liability',
          detail: 'You personally indemnify client for any third-party IP claims',
          metric: 'Unlimited $'
        },
        {
          label: 'Kill-Fee Protection',
          detail: 'Payment for partial milestone work upon early cancellation',
          metric: '$0 Guaranteed'
        }
      ]
    },
    clauses: [
      {
        id: 'clause-1',
        sectionNumber: '01',
        title: 'Scope of Services & Acceptance Criteria',
        verbatimText:
          '1.1 Contractor shall perform the software architecture and frontend engineering services set forth in Statement of Work #1. All Deliverables shall be subject to Client’s acceptance in its sole and absolute subjective discretion. Should Client reject any Deliverable, Contractor shall re-perform the Services at no additional charge within five (5) business days, or Client may terminate this Agreement without payment Obligation for the rejected milestone.',
        plainMeaning:
          'The client can reject your finished work purely based on subjective taste ("sole and absolute subjective discretion") and refuse to pay you for that milestone.',
        riskFlagId: 'flag-acceptance'
      },
      {
        id: 'clause-2',
        sectionNumber: '02',
        title: 'Compensation, Invoicing & Net-60 Terms',
        verbatimText:
          '2.1 Conditioned upon Client’s written final acceptance of all Deliverables, Client shall pay Contractor within sixty (60) calendar days of receipt of an undisputed invoice. Client reserves the right to withhold payment on any invoice disputed in good faith without incurring interest or penalties.',
        plainMeaning:
          'You only get paid 60 days after they formally approve your work, and there is no penalty if they pay late.',
        riskFlagId: 'flag-net60'
      },
      {
        id: 'clause-3',
        sectionNumber: '03',
        title: 'Intellectual Property & Pre-Existing Tools',
        verbatimText:
          '3.1 All Work Product, including any routines, libraries, frameworks, design systems, or code utilities incorporated into the Deliverables (whether created prior to or during the Engagement), shall be deemed "work made for hire" and Contractor hereby irrevocably assigns all right, title, and interest worldwide in perpetuity to Client, waiving all moral rights.',
        plainMeaning:
          'If you use your own personal code snippets, UI library, or starter kit in their project, they own your starter kit forever and you cannot reuse it for future clients.',
        riskFlagId: 'flag-ip'
      },
      {
        id: 'clause-4',
        sectionNumber: '04',
        title: 'Non-Competition & Non-Solicitation Covenant',
        verbatimText:
          '4.1 During the term of this Agreement and for a period of eighteen (18) months following termination for any reason, Contractor shall not, directly or indirectly, provide design, consulting, or engineering services to any entity developing artificial intelligence, document automation, or enterprise workflow software anywhere in North America or Europe.',
        plainMeaning:
          'Even after a 2-month freelance gig ends, you are banned from freelancing for any other AI or workflow software company for 1.5 years.',
        riskFlagId: 'flag-noncompete'
      },
      {
        id: 'clause-5',
        sectionNumber: '05',
        title: 'Indemnification & Unlimited Liability',
        verbatimText:
          '5.1 Contractor shall defend, indemnify, and hold harmless Client, its officers, investors, and successors from and against any and all claims, damages, losses, consequential liabilities, and attorneys’ fees arising out of or relating to Contractor’s work product or alleged infringement, without monetary cap.',
        plainMeaning:
          'If the client gets sued over something related to the project, you are personally on the hook for 100% of their legal bills and damages, even if it exceeds what they paid you.',
        riskFlagId: 'flag-indemnity'
      }
    ],
    riskFlags: [
      {
        id: 'flag-ip',
        clauseId: 'clause-3',
        tabCode: 'RF-01 · CRITICAL',
        title: 'Pre-Existing Code & Tooling Grab',
        severity: 'critical',
        category: 'Intellectual Property',
        plainExplanation:
          'Section 3.1 assigns ownership of tools created "prior to or during the Engagement" if incorporated into the deliverables. You could lose the right to use your own boilerplate code.',
        roleImpact: {
          freelancer: 'Destroys your ability to reuse your own component libraries and utilities for future freelance clients.',
          student: 'Could claim ownership over class projects or personal GitHub repos if you reference them.',
          tenant: 'Overbroad assignment of personal property rights.'
        },
        verbatimExcerpt:
          '"...including any routines, libraries, frameworks... created prior to or during the Engagement, shall be deemed work made for hire and Contractor hereby irrevocably assigns all right, title, and interest..."'
      },
      {
        id: 'flag-noncompete',
        clauseId: 'clause-4',
        tabCode: 'RF-02 · CRITICAL',
        title: '18-Month Industry-Wide Non-Compete',
        severity: 'critical',
        category: 'Restraint of Trade',
        plainExplanation:
          'Bans you from working with any company in AI, document automation, or enterprise workflow software for 18 months after the contract ends.',
        roleImpact: {
          freelancer: 'Independent contractors rely on multiple clients in their niche; locking yourself out of AI/SaaS for 18 months is a career blocker.',
          student: 'Would block you from accepting full-time graduate software roles at almost any tech company.',
          tenant: 'Restricts commercial activity.'
        },
        verbatimExcerpt:
          '"...for a period of eighteen (18) months following termination... Contractor shall not provide design, consulting, or engineering services to any entity developing artificial intelligence..."'
      },
      {
        id: 'flag-acceptance',
        clauseId: 'clause-1',
        tabCode: 'RF-03 · WARNING',
        title: 'Subjective "Sole Discretion" Rejection',
        severity: 'warning',
        category: 'Payment Security',
        plainExplanation:
          'Deliverables are judged by "Client’s sole and absolute subjective discretion" rather than objective specifications in the SOW.',
        roleImpact: {
          freelancer: 'Client can change their mind about a design direction and legally refuse to pay for the milestone.',
          student: 'Leaves your internship stipend completely at the mercy of a manager’s mood.',
          tenant: 'Subjective inspection standard.'
        },
        verbatimExcerpt:
          '"All Deliverables shall be subject to Client’s acceptance in its sole and absolute subjective discretion... or Client may terminate without payment Obligation."'
      },
      {
        id: 'flag-indemnity',
        clauseId: 'clause-5',
        tabCode: 'RF-04 · CRITICAL',
        title: 'Uncapped Personal Indemnification',
        severity: 'critical',
        category: 'Financial Exposure',
        plainExplanation:
          'There is no limitation of liability cap. Your personal assets are exposed to unlimited legal fees and consequential damages.',
        roleImpact: {
          freelancer: 'A $6,500 contract should never carry unlimited million-dollar lawsuit liability.',
          student: 'Exposes you to corporate legal costs you cannot afford.',
          tenant: 'Unlimited damage liability.'
        },
        verbatimExcerpt:
          '"Contractor shall defend, indemnify, and hold harmless Client... from and against any and all claims, damages, losses, consequential liabilities... without monetary cap."'
      },
      {
        id: 'flag-net60',
        clauseId: 'clause-2',
        tabCode: 'RF-05 · NOTICE',
        title: 'Net-60 Payment Delay After Approval',
        severity: 'notice',
        category: 'Cash Flow',
        plainExplanation:
          'Waiting 60 days after written acceptance means you may wait 75–90 days from the day you actually write the code to see cash.',
        roleImpact: {
          freelancer: 'Creates severe cash-flow strain for solo independents; standard freelance terms are Net-15 or Net-30.',
          student: 'Delays stipend payout until after the semester ends.',
          tenant: 'Delayed reimbursement window.'
        },
        verbatimExcerpt:
          '"Client shall pay Contractor within sixty (60) calendar days of receipt of an undisputed invoice."'
      }
    ],
    missingClauses: [
      {
        id: 'missing-killfee',
        tabCode: 'MC-01 · MISSING',
        title: 'Kill Fee / Pro-Rata Termination Payout',
        importance: 'Essential',
        whyYouNeedIt:
          'Right now, if the client cancels the project when you are 90% done with a milestone, they owe you $0. You need a clause guaranteeing pro-rata payment for work performed.',
        suggestedWording:
          '"In the event Client terminates this Agreement for convenience, Client shall pay Contractor on a pro-rata basis for all work performed through the effective date of termination, plus a 20% kill fee on the remaining milestone balance."'
      },
      {
        id: 'missing-latefee',
        tabCode: 'MC-02 · MISSING',
        title: 'Late Payment Interest & Right to Pause Work',
        importance: 'Essential',
        whyYouNeedIt:
          'Without a late-payment penalty or right to suspend services, you have zero leverage if an invoice sits unpaid for months.',
        suggestedWording:
          '"Overdue invoices shall accrue interest at 1.5% per month. Contractor may suspend work and withhold IP transfer if any invoice remains unpaid more than 10 days past due."'
      },
      {
        id: 'missing-portfolio',
        tabCode: 'MC-03 · MISSING',
        title: 'Portfolio Display Right',
        importance: 'Recommended',
        whyYouNeedIt:
          'Because all work is assigned under strict confidentiality, you cannot legally show screenshots or mention the project in your portfolio without a carve-out.',
        suggestedWording:
          '"Following public launch of the Deliverables, Contractor may display non-confidential visuals and a general description of the work in Contractor’s professional portfolio."'
      }
    ],
    negotiationQuestions: [
      {
        id: 'neg-1',
        targetClause: 'Section 3.1 · Pre-Existing IP Carve-Out',
        questionToAsk:
          'Can we separate "Background Technology" (my pre-existing reusable code/tools) from custom "Client Work Product", and grant you a perpetual license to the background tools instead of outright ownership?',
        emailSnippet:
          'Hi team — excited to kick off! Looking at Section 3.1, since I use my own pre-built UI/code utilities to deliver faster for you, could we add standard Background IP language so I retain ownership of my pre-existing tools while granting you a perpetual, royalty-free license to use them in the deliverables?',
        leverageNote: '95% of startups accept this immediately because using your pre-built tools saves them weeks of billing.'
      },
      {
        id: 'neg-2',
        targetClause: 'Section 4.1 & 5.1 · Non-Compete & Liability Cap',
        questionToAsk:
          'Can we replace the broad 18-month industry non-compete with a strict NDA + non-solicitation of your customers, and cap total liability at the total fees paid under the SOW?',
        emailSnippet:
          'On Section 4.1, since I’m an independent contractor working across the software ecosystem, I can’t sign an 18-month industry-wide non-compete, though I’m happy to sign strict confidentiality and customer non-solicitation. Also on Section 5.1, could we cap mutual liability at the total fees paid under the SOW?',
        leverageNote: 'Non-competes for independent contractors are unenforceable in many jurisdictions and standard MSAs cap liability at 1x fees paid.'
      },
      {
        id: 'neg-3',
        targetClause: 'Section 1.1 & 2.1 · Acceptance & Payment Window',
        questionToAsk:
          'Can we tie acceptance to objective SOW specifications (with a 7-day deemed-approval window) and shorten payment terms from Net-60 to Net-15?',
        emailSnippet:
          'Finally, in Sections 1.1 and 2.1, could we benchmark acceptance against the written SOW specs (deemed approved if no feedback is given within 7 business days) and adjust invoicing from Net-60 to Net-15?',
        leverageNote: 'Deemed-approval prevents your invoice from being stuck forever if the client gets busy.'
      }
    ]
  },
  {
    id: 'tenant-lease-2026',
    fileCode: 'FILE-02 · LEASE',
    title: 'Urban Student & Co-Living Residential Lease Agreement',
    counterparty: 'Meridian Campus Properties LLC',
    documentType: '12-Month Residential Lease',
    recommendedRole: 'tenant',
    lastUpdated: 'Oct 2026',
    pageCount: 19,
    wordCount: 6340,
    riskScore: 82,
    riskVerdict: 'High Risk · Joint Liability & Automatic Renewal Trap',
    plainSummary: {
      headline:
        'You are signing a $1,450/month lease where you can be forced to pay your roommates’ unpaid rent, the lease auto-renews for a full year unless you give 90 days’ notice, and the landlord can enter your room with zero notice.',
      overview: [
        'Although marketed as an individual student room rental, Section 2 establishes "Joint and Several Liability" across all four occupants of the unit. If a roommate drops out or stops paying rent, the landlord can demand their entire share from you and withhold your security deposit.',
        'Watch out for Section 8 (Automatic 12-Month Rollover) which requires written notice 90 days before lease end—meaning you must decide by February whether you are staying the following academic year—and a mandatory $450 non-refundable "carpet & sanitization fee" deducted automatically from your deposit.'
      ],
      keyObligations: [
        {
          label: 'Auto-Renewal Notice Cutoff',
          detail: 'Must send certified letter 90 days before lease expiration',
          metric: '90 Days Prior'
        },
        {
          label: 'Roommate Default Liability',
          detail: 'Jointly & severally liable for 100% of apartment rent',
          metric: 'Up to $5,800/mo'
        },
        {
          label: 'Mandatory Move-Out Deduction',
          detail: 'Automatic deduction from deposit regardless of cleanliness',
          metric: '$450 Fixed Fee'
        },
        {
          label: 'Early Termination Penalty',
          detail: '3 months rent penalty plus forfeiture of entire security deposit',
          metric: '$4,350 + Deposit'
        }
      ]
    },
    clauses: [
      {
        id: 'lease-1',
        sectionNumber: '02',
        title: 'Joint and Several Financial Obligation',
        verbatimText:
          '2.3 All Tenants executing this Lease for Unit 4B shall be jointly and severally liable for the full performance of all obligations hereunder, including the aggregate monthly rent of $5,800. Landlord may pursue any single Tenant for the entirety of any unpaid rent, utility arrears, or common-area damages caused by any co-occupant or guest.',
        plainMeaning:
          'Even though you think you are only renting one bedroom for $1,450, if your three roommates stop paying, the landlord can legally demand all $5,800/month from you alone.',
        riskFlagId: 'flag-joint'
      },
      {
        id: 'lease-2',
        sectionNumber: '06',
        title: 'Security Deposit & Automatic Deductions',
        verbatimText:
          '6.2 Upon termination of tenancy, Landlord shall automatically deduct a mandatory $450.00 Professional Steam & Sanitization Fee and a $175.00 Administrative Move-Out Processing Fee from the Security Deposit prior to assessing any physical wear, tear, or damages. Landlord shall return any remaining balance within sixty (60) days.',
        plainMeaning:
          '$625 of your security deposit is automatically taken even if you leave the apartment spotless, and they take 60 days to return the rest.',
        riskFlagId: 'flag-deposit'
      },
      {
        id: 'lease-3',
        sectionNumber: '08',
        title: 'Evergreen Automatic 12-Month Renewal',
        verbatimText:
          '8.1 Unless Tenant delivers written notice via certified physical mail at least ninety (90) calendar days prior to the Expiration Date, this Lease shall automatically renew for an additional twelve (12) month term at a rental rate increased by eight percent (8%) over the prior period.',
        plainMeaning:
          'If you forget to mail a physical letter 3 months before your lease ends (or only send an email), you are locked into another full year at 8% higher rent.',
        riskFlagId: 'flag-autorenew'
      },
      {
        id: 'lease-4',
        sectionNumber: '11',
        title: 'Landlord Right of Unannounced Entry',
        verbatimText:
          '11.1 Landlord, its maintenance personnel, and prospective buyers or lenders may enter the Premises and individual bedrooms at any hour without prior notice to Tenant for purposes of inspection, routine maintenance, or property showings.',
        plainMeaning:
          'The landlord or their agents can walk into your bedroom at any time without knocking or giving 24-hour advance notice.',
        riskFlagId: 'flag-entry'
      }
    ],
    riskFlags: [
      {
        id: 'flag-joint',
        clauseId: 'lease-1',
        tabCode: 'RF-01 · CRITICAL',
        title: 'Joint & Several Roommate Liability',
        severity: 'critical',
        category: 'Financial Liability',
        plainExplanation:
          'Makes you 100% financially responsible for your roommates’ rent and damages, up to $5,800/month.',
        roleImpact: {
          tenant: 'If one roommate moves out mid-semester, you and the remaining roommates must cover their rent or face eviction.',
          student: 'Your parents/guarantor could be sued for a stranger roommate’s unpaid rent.',
          freelancer: 'Shared liability across co-tenants.'
        },
        verbatimExcerpt:
          '"Landlord may pursue any single Tenant for the entirety of any unpaid rent, utility arrears, or common-area damages caused by any co-occupant..."'
      },
      {
        id: 'flag-autorenew',
        clauseId: 'lease-3',
        tabCode: 'RF-02 · CRITICAL',
        title: '90-Day Physical Mail Auto-Renewal Trap',
        severity: 'critical',
        category: 'Lock-In & Renewal',
        plainExplanation:
          'Requires physical certified mail 90 days before lease end, or locks you into another 12 months with an automatic 8% rent hike.',
        roleImpact: {
          tenant: 'Email notice doesn’t count under this clause—missing the 90-day cutoff costs you a full year’s lease commitment.',
          student: 'Students graduating or leaving for summer internships get trapped paying for an empty apartment.',
          freelancer: 'Locks you into a 12-month fixed overhead.'
        },
        verbatimExcerpt:
          '"Unless Tenant delivers written notice via certified physical mail at least ninety (90) calendar days prior... this Lease shall automatically renew for an additional twelve (12) month term..."'
      },
      {
        id: 'flag-deposit',
        clauseId: 'lease-2',
        tabCode: 'RF-03 · WARNING',
        title: '$625 Mandatory Non-Refundable Deposit Skim',
        severity: 'warning',
        category: 'Hidden Fees',
        plainExplanation:
          'Automatically deducts $450 sanitization + $175 admin fee from your security deposit regardless of how clean you leave the unit.',
        roleImpact: {
          tenant: 'In many states, landlords cannot deduct routine cleaning/admin fees from a security deposit unless there is actual damage beyond normal wear and tear.',
          student: 'Shrinks your refundable deposit by $625 on day one.',
          freelancer: 'Hidden back-end fee.'
        },
        verbatimExcerpt:
          '"Landlord shall automatically deduct a mandatory $450.00 Professional Steam & Sanitization Fee and a $175.00 Administrative Move-Out Processing Fee..."'
      },
      {
        id: 'flag-entry',
        clauseId: 'lease-4',
        tabCode: 'RF-04 · WARNING',
        title: 'Zero-Notice Bedroom Entry Waiver',
        severity: 'warning',
        category: 'Privacy & Quiet Enjoyment',
        plainExplanation:
          'Waives your right to advance notice before the landlord or showing agents enter your private room.',
        roleImpact: {
          tenant: 'Violates standard 24-hour residential privacy norms.',
          student: 'Strangers touring the unit can walk into your room during exams or while you are sleeping.',
          freelancer: 'Disrupts remote work privacy.'
        },
        verbatimExcerpt:
          '"Landlord, its maintenance personnel, and prospective buyers... may enter the Premises and individual bedrooms at any hour without prior notice..."'
      }
    ],
    missingClauses: [
      {
        id: 'missing-sublet',
        tabCode: 'MC-01 · MISSING',
        title: 'Right to Sublet for Summer / Study Abroad',
        importance: 'Essential',
        whyYouNeedIt:
          'The lease is silent on subletting (or bans it by default), meaning if you get a summer internship in another city, you cannot legally sublease your room for June–August.',
        suggestedWording:
          '"Tenant may sublet their individual bedroom or assign the remainder of the Lease term with Landlord’s written consent, which shall not be unreasonably withheld or delayed, and with no subletting fee exceeding $75."'
      },
      {
        id: 'missing-checklist',
        tabCode: 'MC-02 · MISSING',
        title: 'Move-In Condition Inventory & Photo Addendum',
        importance: 'Essential',
        whyYouNeedIt:
          'Without a signed 48-hour move-in inspection grace period, the landlord can blame you for scratches, stains, or broken blinds left by the previous tenant.',
        suggestedWording:
          '"Tenant shall have seven (7) days from move-in to submit a written and photographic Move-In Condition Report; any pre-existing defects noted therein shall not be deducted from Tenant’s Security Deposit."'
      }
    ],
    negotiationQuestions: [
      {
        id: 'lease-neg-1',
        targetClause: 'Section 2.3 · Individual Room Liability Addendum',
        questionToAsk:
          'Can we switch this to an Individual By-The-Bed Lease Addendum so I am only responsible for my $1,450 bedroom rent and a 25% share of common areas?',
        emailSnippet:
          'Hi leasing team — before I sign, could we attach an Individual Liability Addendum to Section 2.3 clarifying that my financial responsibility is limited to my individual bedroom rent ($1,450/mo) rather than joint liability for the other roommates?',
        leverageNote: 'Student housing complexes almost always have a "By-the-Bed" rider available if you ask before signing.'
      },
      {
        id: 'lease-neg-2',
        targetClause: 'Section 8.1 & 11.1 · Renewal Notice & 24-Hour Entry',
        questionToAsk:
          'Can we allow email notice 60 days before lease end instead of 90-day certified mail, and require 24 hours’ advance notice before non-emergency entry?',
        emailSnippet:
          'Also, could we amend Section 8.1 to allow 60 days’ notice via email (converting to month-to-month rather than an automatic 12-month lock-in), and add standard 24-hour advance notice for non-emergency entry in Section 11.1?',
        leverageNote: '24-hour notice is required by statute in most jurisdictions, so landlords rarely push back on writing it into the lease.'
      }
    ]
  },
  {
    id: 'student-internship-2026',
    fileCode: 'FILE-03 · OFFER/NDA',
    title: 'Summer Software Engineering Internship & Invention Offer',
    counterparty: 'Helios Quantitative Systems',
    documentType: 'Employment & IP Agreement',
    recommendedRole: 'student',
    lastUpdated: 'Nov 2026',
    pageCount: 9,
    wordCount: 3150,
    riskScore: 68,
    riskVerdict: 'Elevated Caution · Clawback & 24/7 Side-Project IP Claim',
    plainSummary: {
      headline:
        'Great $42/hr internship offer, but the company claims ownership of anything you build on your own laptop at night or in university hackathons, and requires you to repay your $3,500 relocation stipend if you don’t accept a full-time return offer.',
      overview: [
        'Section 5 (Invention Assignment) isn’t limited to work you do during internship hours—it covers any idea, algorithm, or app you conceive at any hour during the 12-week summer window, even on personal equipment.',
        'Section 3.2 also includes a hidden "Relocation & Sign-On Clawback" stating that if you leave early OR decline a full-time return offer upon graduation, the $3,500 housing stipend converts into an interest-bearing loan due within 14 days.'
      ],
      keyObligations: [
        {
          label: 'Housing Stipend Clawback',
          detail: 'Must repay $3,500 if you decline post-graduation return offer',
          metric: '$3,500 Repayment'
        },
        {
          label: '24/7 Invention Assignment',
          detail: 'Company owns side projects & hackathon code built during summer',
          metric: 'All Personal IP'
        },
        {
          label: 'Post-Internship Garden Leave',
          detail: 'Restriction on joining quantitative trading peers',
          metric: '12 Months'
        },
        {
          label: 'Mandatory Arbitration',
          detail: 'Waives right to court or class action; venue in Delaware',
          metric: 'Private Arb Only'
        }
      ]
    },
    clauses: [
      {
        id: 'intern-1',
        sectionNumber: '03',
        title: 'Relocation Stipend & Return-Offer Clawback',
        verbatimText:
          '3.2 Company shall advance Intern a one-time Housing & Relocation Stipend of $3,500.00. Should Intern’s employment terminate prior to the completion of the 12-week program for any reason, OR should Intern decline a full-time Return Offer extended by Company within six (6) months of graduation, Intern agrees to repay 100% of the gross Relocation Stipend within fourteen (14) days.',
        plainMeaning:
          'If they offer you a full-time job after graduation and you turn it down to work elsewhere, you have to pay back the $3,500 summer housing stipend in 14 days.',
        riskFlagId: 'flag-clawback'
      },
      {
        id: 'intern-2',
        sectionNumber: '05',
        title: 'All-Hours Assignment of Inventions & Academic Projects',
        verbatimText:
          '5.1 Intern hereby assigns to Company all right, title, and interest in any invention, software, model, or creative work conceived, developed, or reduced to practice by Intern during the chronological period of the Internship (whether during or outside regular working hours, and whether or not using Company equipment or university resources).',
        plainMeaning:
          'Anything you code on weekends, at a student hackathon, or for your senior thesis during those 12 summer weeks legally belongs to the company.',
        riskFlagId: 'flag-247ip'
      },
      {
        id: 'intern-3',
        sectionNumber: '07',
        title: '12-Month Post-Internship Non-Compete',
        verbatimText:
          '7.1 For twelve (12) months following the conclusion of the Internship, Intern shall not accept employment, internship, or research fellowships with any financial technology, algorithmic trading, or market-making organization.',
        plainMeaning:
          'A 12-week summer internship locks you out of interviewing with any other fintech or quant firm for a full year.',
        riskFlagId: 'flag-intern-nc'
      }
    ],
    riskFlags: [
      {
        id: 'flag-clawback',
        clauseId: 'intern-1',
        tabCode: 'RF-01 · CRITICAL',
        title: '$3,500 Return-Offer Refusal Clawback',
        severity: 'critical',
        category: 'Financial Trap',
        plainExplanation:
          'Ties your summer housing stipend to accepting a future full-time job offer whose salary isn’t even stated yet.',
        roleImpact: {
          student: 'Forces you to either pay $3,500 out of pocket as a student or accept whatever full-time offer they hand you.',
          freelancer: 'Conditional fee clawback.',
          tenant: 'Housing allowance clawback.'
        },
        verbatimExcerpt:
          '"...OR should Intern decline a full-time Return Offer extended by Company within six (6) months of graduation, Intern agrees to repay 100% of the gross Relocation Stipend within fourteen (14) days."'
      },
      {
        id: 'flag-247ip',
        clauseId: 'intern-2',
        tabCode: 'RF-02 · CRITICAL',
        title: 'Weekend, Hackathon & University Thesis IP Claim',
        severity: 'critical',
        category: 'Intellectual Property',
        plainExplanation:
          'Claims ownership of inventions created outside work hours on your personal laptop or university labs.',
        roleImpact: {
          student: 'Jeopardizes your startup ideas, hackathon prizes, and university capstone ownership.',
          freelancer: 'Blocks side client work.',
          tenant: 'N/A'
        },
        verbatimExcerpt:
          '"...whether during or outside regular working hours, and whether or not using Company equipment or university resources..."'
      },
      {
        id: 'flag-intern-nc',
        clauseId: 'intern-3',
        tabCode: 'RF-03 · WARNING',
        title: '12-Month Fintech Non-Compete for a 12-Week Intern',
        severity: 'warning',
        category: 'Career Mobility',
        plainExplanation:
          'Imposes a 1-year non-compete on an hourly summer intern without paid garden leave.',
        roleImpact: {
          student: 'Prevents you from recruiting with other finance/fintech employers during fall campus recruiting.',
          freelancer: 'Blocks industry consulting.',
          tenant: 'N/A'
        },
        verbatimExcerpt:
          '"For twelve (12) months following the conclusion of the Internship, Intern shall not accept employment, internship, or research fellowships with any financial technology..."'
      }
    ],
    missingClauses: [
      {
        id: 'missing-prior-inventions',
        tabCode: 'MC-01 · MISSING',
        title: 'Off-Duty & Academic Carve-Out (CA Labor Code § 2870 Standard)',
        importance: 'Essential',
        whyYouNeedIt:
          'Protects any project you build on your own time, with your own equipment, that doesn’t use company secrets.',
        suggestedWording:
          '"Section 5.1 shall not apply to any invention developed entirely on Intern’s own time without using Company’s equipment, supplies, facilities, or trade secret information, including university coursework and student hackathons."'
      }
    ],
    negotiationQuestions: [
      {
        id: 'intern-neg-1',
        targetClause: 'Section 3.2 · Housing Stipend Clawback',
        questionToAsk:
          'Can we limit the relocation stipend clawback strictly to leaving the 12-week summer internship early, and remove the penalty for declining a post-graduation return offer?',
        emailSnippet:
          'Hi Recruiting Team — thank you so much for the offer! In Section 3.2, could we clarify that the $3,500 housing stipend only prorates if I leave the 12-week summer program early, rather than triggering a repayment if I decline a future post-graduation offer?',
        leverageNote: 'HR teams frequently use boilerplate full-time executive clawback templates by mistake on intern offers and will readily fix this.'
      },
      {
        id: 'intern-neg-2',
        targetClause: 'Section 5.1 · Academic & Side-Project Exemption',
        questionToAsk:
          'Can I list my ongoing university research / hackathon project on a Prior Inventions Exhibit and exclude off-duty personal projects?',
        emailSnippet:
          'Also, since I have ongoing university coursework and personal GitHub projects, could we attach a Prior Inventions schedule to Section 5.1 and exclude off-duty work created on personal equipment?',
        leverageNote: 'Standard legal request—every tech company has an Exhibit A for Prior Inventions.'
      }
    ]
  }
];

export function analyzeCustomContractText(text: string, role: UserRole): ContractDossier {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = Math.max(words.length, 45);
  const lower = text.toLowerCase();

  const hasIndemnity = lower.includes('indemnif') || lower.includes('hold harmless') || lower.includes('liabilit');
  const hasAutoRenew = lower.includes('renew') || lower.includes('automatic') || lower.includes('notice');
  const hasIP = lower.includes('intellectual property') || lower.includes('assign') || lower.includes('work made for hire') || lower.includes('perpetuity');
  const hasNonCompete = lower.includes('non-compete') || lower.includes('competing') || lower.includes('exclusiv');

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  const clauses: ContractClause[] = (paragraphs.length > 0 ? paragraphs.slice(0, 5) : [text]).map((para, idx) => ({
    id: `custom-clause-${idx + 1}`,
    sectionNumber: String(idx + 1).padStart(2, '0'),
    title:
      idx === 0
        ? 'Primary Obligation & Scope Clause'
        : idx === 1
        ? 'Financial, Fee & Payment Terms'
        : idx === 2
        ? 'Intellectual Property & Rights Allocation'
        : `Section ${idx + 1} Covenant & Liability`,
    verbatimText: para,
    plainMeaning:
      idx === 0
        ? 'Defines your core legal obligations and gives the counterparty wide latitude over performance standards.'
        : idx === 1
        ? 'Governs when payments or fees are due and shifts financial risk onto the signer if deadlines are missed.'
        : 'Transfers broad legal rights or waives standard remedies unless explicitly carved out in writing.',
    riskFlagId: `custom-flag-${idx + 1}`
  }));

  const riskScore = Math.min(
    92,
    58 + (hasIndemnity ? 10 : 0) + (hasAutoRenew ? 8 : 0) + (hasIP ? 9 : 0) + (hasNonCompete ? 7 : 0)
  );

  return {
    id: `custom-${Date.now()}`,
    fileCode: 'FILE-CUSTOM · LIVE',
    title: 'Uploaded Custom Contract Analysis',
    counterparty: 'Extracted Counterparty Agreement',
    documentType: `Custom ${role.charAt(0).toUpperCase() + role.slice(1)} Contract`,
    recommendedRole: role,
    lastUpdated: 'Just Now',
    pageCount: Math.max(1, Math.ceil(wordCount / 320)),
    wordCount,
    riskScore,
    riskVerdict: `${riskScore >= 75 ? 'High Caution' : 'Elevated Caution'} · Custom Document Decoded`,
    plainSummary: {
      headline: `Froggo analyzed ${wordCount} words through a ${role.toUpperCase()} lens and flagged asymmetrical risk allocation, broad obligations, and missing mutual protections.`,
      overview: [
        `This agreement places primary performance and compliance burdens on you as the ${role}, while giving the drafting party broad discretion over enforcement, remedies, and termination.`,
        `Before signing, review the highlighted clauses below—especially around liability caps, termination notice windows, and ownership/deposit return rules—and use the generated questions to request balanced mutual language.`
      ],
      keyObligations: [
        {
          label: 'Risk Asymmetry',
          detail: 'Drafted heavily in favor of the issuing party',
          metric: `${riskScore}/100 Risk`
        },
        {
          label: 'Termination Balance',
          detail: 'One-sided cancellation rights without reciprocal cure window',
          metric: 'Unbalanced'
        },
        {
          label: 'Liability Exposure',
          detail: hasIndemnity ? 'Broad indemnification language detected' : 'No explicit monetary liability cap found',
          metric: 'Uncapped'
        },
        {
          label: 'Cure Period',
          detail: 'Grace period to fix alleged breaches before penalty',
          metric: '0 Days Stated'
        }
      ]
    },
    clauses,
    riskFlags: clauses.slice(0, 3).map((cl, i) => ({
      id: `custom-flag-${i + 1}`,
      clauseId: cl.id,
      tabCode: `RF-0${i + 1} · ${i === 0 ? 'CRITICAL' : 'WARNING'}`,
      title:
        i === 0
          ? 'Asymmetric Obligation & Discretion Language'
          : i === 1
          ? 'Uncapped Financial / Penalty Exposure'
          : 'Broad Rights Waiver Without Mutual Reciprocity',
      severity: i === 0 ? 'critical' : 'warning',
      category: i === 0 ? 'Core Obligations' : i === 1 ? 'Financial Risk' : 'Legal Remedies',
      plainExplanation: cl.plainMeaning,
      roleImpact: {
        freelancer: 'Leaves your invoice payout and liability exposed without a mutual cap.',
        tenant: 'Shifts repair, fee, or lock-in burdens onto the tenant without a cure period.',
        student: 'Binds you to strict obligations without an academic or early-exit safeguard.'
      },
      verbatimExcerpt: `"${cl.verbatimText.slice(0, 180)}${cl.verbatimText.length > 180 ? '...' : ''}"`
    })),
    missingClauses: [
      {
        id: 'custom-missing-1',
        tabCode: 'MC-01 · MISSING',
        title: '14-Day Written Notice & Opportunity to Cure',
        importance: 'Essential',
        whyYouNeedIt:
          'Ensures the other party cannot penalize or terminate you immediately over a minor misunderstanding without giving you 14 days to fix it.',
        suggestedWording:
          '"Neither party may terminate this Agreement for breach or assess penalties unless the breaching party fails to cure such breach within fourteen (14) days after receiving written notice."'
      },
      {
        id: 'custom-missing-2',
        tabCode: 'MC-02 · MISSING',
        title: 'Mutual Limitation of Liability Cap',
        importance: 'Essential',
        whyYouNeedIt:
          'Caps your worst-case financial exposure to the actual dollar value of the agreement.',
        suggestedWording:
          '"In no event shall either party’s aggregate liability exceed the total amounts paid or payable under this Agreement in the six (6) months preceding the claim."'
      }
    ],
    negotiationQuestions: [
      {
        id: 'custom-neg-1',
        targetClause: 'Section 01 · Mutual Cure Period & Liability Cap',
        questionToAsk:
          'Can we add a mutual 14-day notice-and-cure period before any penalty or termination takes effect, and cap liability at the contract value?',
        emailSnippet:
          'Hi — thanks for sending the agreement over! Before I sign, could we make two quick standard updates: (1) add a 14-day written notice-and-cure window for any alleged breach, and (2) include a mutual limitation of liability capped at the fees paid under the agreement?',
        leverageNote: 'Framing edits as "making the clause mutual" is the highest-converting negotiation tactic.'
      }
    ]
  };
}

// ============================================================================
// DASHBOARD B: CREATOR / UPLOADER STUDIO DATA (For T&C Creators & Legal Teams)
// ============================================================================

export interface JargonRule {
  id: string;
  phrase: string;
  severity: 'high' | 'medium';
  reason: string;
  plainReplacement: string;
}

export const JARGON_DICTIONARY: JargonRule[] = [
  {
    id: 'jargon-1',
    phrase: 'in its sole and absolute discretion',
    severity: 'high',
    reason: 'Signals one-sided arbitrary power to users and triggers high risk flags.',
    plainReplacement: 'acting reasonably and based on objective criteria'
  },
  {
    id: 'jargon-2',
    phrase: 'indemnify, defend, and hold harmless without limitation',
    severity: 'high',
    reason: 'Exposes everyday users or freelancers to uncapped corporate legal bills.',
    plainReplacement: 'reimburse for direct damages caused by proven gross negligence, up to the fees paid'
  },
  {
    id: 'jargon-3',
    phrase: 'in perpetuity throughout the universe',
    severity: 'high',
    reason: 'Archaic overreach that scares creators and students away from signing.',
    plainReplacement: 'for the duration of the active service agreement'
  },
  {
    id: 'jargon-4',
    phrase: 'heretofore and hereinafter set forth',
    severity: 'medium',
    reason: '19th-century archaic legalese that degrades reading comprehension by 40%.',
    plainReplacement: 'described in this agreement'
  },
  {
    id: 'jargon-5',
    phrase: 'without prior notice or liability of any kind whatsoever',
    severity: 'high',
    reason: 'Threatens sudden account or lease termination without warning.',
    plainReplacement: 'with at least 14 days’ advance written notice and a pro-rata refund'
  },
  {
    id: 'jargon-6',
    phrase: 'deemed conclusively accepted',
    severity: 'medium',
    reason: 'Creates a silent consent trap when users miss fine-print notifications.',
    plainReplacement: 'confirmed via an explicit opt-in prompt'
  }
];

export interface StandardClauseCheck {
  id: string;
  code: string;
  title: string;
  benchmarkRate: string;
  description: string;
  detectKeywords: string[];
  clauseToInsert: string;
}

export const INDUSTRY_STANDARD_CLAUSES: StandardClauseCheck[] = [
  {
    id: 'std-notice',
    code: 'STD-01',
    title: 'Advance Notice Before Material Changes',
    benchmarkRate: '91% of Fair SaaS/Lease Terms',
    description: 'Guarantees users at least 14–30 days’ email notice before price increases or terms updates.',
    detectKeywords: ['advance written notice', '30 days notice', '14 days’ advance', 'prior email notice'],
    clauseToInsert:
      '\n\n6. ADVANCE NOTICE OF UPDATES: We will provide at least thirty (30) days’ prior email notice before any material change to these Terms or pricing takes effect, and you may cancel without penalty before the new terms begin.'
  },
  {
    id: 'std-cap',
    code: 'STD-02',
    title: 'Mutual & Proportional Liability Cap',
    benchmarkRate: '88% Industry Standard',
    description: 'Caps both parties’ maximum liability at the amount actually paid in the past 12 months.',
    detectKeywords: ['liability cap', 'up to the fees paid', '12 months preceding', 'proportional liability'],
    clauseToInsert:
      '\n\n7. MUTUAL LIABILITY CAP: Neither party’s total cumulative liability under this Agreement shall exceed the total fees paid by User in the twelve (12) months preceding the claim.'
  },
  {
    id: 'std-data',
    code: 'STD-03',
    title: 'Data Export & 30-Day Deletion Guarantee',
    benchmarkRate: '94% GDPR/CCPA Compliant',
    description: 'Confirms users own their uploaded content and can export or permanently delete it within 30 days.',
    detectKeywords: ['permanently delete', 'export your data', 'retain ownership of your content'],
    clauseToInsert:
      '\n\n8. USER CONTENT OWNERSHIP & DELETION: You retain 100% ownership of all content you upload. Upon account closure, you may export your files and we will permanently delete your data from active servers within thirty (30) days.'
  },
  {
    id: 'std-cure',
    code: 'STD-04',
    title: '14-Day Cure Window Before Termination',
    benchmarkRate: '84% Balanced Contracts',
    description: 'Gives users a chance to fix an issue or billing failure before their account or contract is terminated.',
    detectKeywords: ['cure window', 'opportunity to cure', '14 days to resolve'],
    clauseToInsert:
      '\n\n9. FAIR CURE PERIOD: Before suspending or terminating your access for a non-critical breach or billing failure, we will notify you and provide a fourteen (14) day opportunity to cure the issue.'
  }
];

export interface ArchivalDocumentFile {
  id: string;
  archiveNumber: string;
  title: string;
  category: string;
  version: string;
  updatedAt: string;
  readabilityScore: number;
  jargonCount: number;
  clauseCoverage: string;
  status: 'Froggo-Safe Certified' | 'Needs Simplification' | 'High Friction Draft';
  draftContent: string;
}

export const CREATOR_ARCHIVE_FILES: ArchivalDocumentFile[] = [
  {
    id: 'arch-1',
    archiveNumber: 'ARCHIVE // 01',
    title: 'NovaCloud AI — Master Terms of Service & Creator License',
    category: 'SaaS & AI Platform Terms',
    version: 'v3.4 Draft',
    updatedAt: '03 Nov 2026',
    readabilityScore: 54,
    jargonCount: 5,
    clauseCoverage: '1 / 4 Standard Clauses',
    status: 'Needs Simplification',
    draftContent: `1. ACCEPTANCE OF TERMS: By accessing NovaCloud AI, you agree to be bound by the terms heretofore and hereinafter set forth. Continued use of the platform after any silent update shall be deemed conclusively accepted by the User.\n\n2. CONTENT & IP LICENSE: By uploading any document, design, or code to the workspace, User grants NovaCloud AI a worldwide, royalty-free, transferable license to reproduce, train models on, and distribute such content in perpetuity throughout the universe.\n\n3. ACCOUNT TERMINATION & FEES: NovaCloud AI reserves the right, in its sole and absolute discretion, to suspend or terminate your account or modify pricing tiers without prior notice or liability of any kind whatsoever.\n\n4. INDEMNIFICATION: User agrees to indemnify, defend, and hold harmless without limitation NovaCloud AI and its affiliates from any third-party claims arising out of User's use of the service.`
  },
  {
    id: 'arch-2',
    archiveNumber: 'ARCHIVE // 02',
    title: 'Rishihood Student Founder — Standard Freelance Design SOW',
    category: 'Freelance & Agency Template',
    version: 'v2.1 Certified',
    updatedAt: '29 Oct 2026',
    readabilityScore: 89,
    jargonCount: 1,
    clauseCoverage: '3 / 4 Standard Clauses',
    status: 'Froggo-Safe Certified',
    draftContent: `1. SCOPE & MILESTONES: Designer will deliver the agreed Figma prototypes in two milestones. Client will review deliverables acting reasonably and based on objective criteria within 7 business days.\n\n2. PAYMENT & OWNERSHIP: Invoices are payable on Net-15 terms. You retain ownership of your content and pre-existing design tools, while Client receives full commercial rights to the final approved deliverables upon full payment.\n\n3. TERMINATION & CURE: Either party may terminate with 14 days’ advance written notice and a pro-rata refund or payment for completed work. We provide a 14 days to resolve opportunity to cure any issue.\n\n4. LIABILITY CAP: Each party agrees to reimburse for direct damages caused by proven gross negligence, up to the fees paid in the 12 months preceding the claim.`
  },
  {
    id: 'arch-3',
    archiveNumber: 'ARCHIVE // 03',
    title: 'MetroNest Co-Living — Semester Housing Agreement',
    category: 'Residential Lease Template',
    version: 'v1.8 Draft',
    updatedAt: '21 Oct 2026',
    readabilityScore: 61,
    jargonCount: 3,
    clauseCoverage: '1 / 4 Standard Clauses',
    status: 'High Friction Draft',
    draftContent: `1. OCCUPANCY & RULES: Resident agrees to abide by all house rules heretofore and hereinafter set forth by Management.\n\n2. DEPOSIT & INSPECTIONS: Management may assess repair deductions in its sole and absolute discretion upon move-out. Lease renewals shall be deemed conclusively accepted unless physical notice is received 90 days prior.\n\n3. LIABILITY: Resident shall indemnify, defend, and hold harmless without limitation the Property Owner for any guest incident.`
  },
  {
    id: 'arch-4',
    archiveNumber: 'ARCHIVE // 04',
    title: 'Construct 2.0 Hackathon — Open Source Contributor Agreement',
    category: 'Developer & IP Policy',
    version: 'v4.0 Certified',
    updatedAt: '15 Oct 2026',
    readabilityScore: 93,
    jargonCount: 0,
    clauseCoverage: '4 / 4 Standard Clauses',
    status: 'Froggo-Safe Certified',
    draftContent: `1. DEVELOPER OWNERSHIP: You retain ownership of your content, repositories, and hackathon prototypes submitted through the platform.\n\n2. DATA PRIVACY: You may export your data at any time, and upon request we will permanently delete your account artifacts within 30 days.\n\n3. TRANSPARENT UPDATES: We provide 30 days notice via prior email notice before any rule updates, with a fair opportunity to cure any submission issue and a mutual liability cap up to the fees paid.`
  }
];
