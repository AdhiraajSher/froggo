export interface LegalTemplateItem {
  id: string;
  code: string;
  title: string;
  category:
    | 'Startup & Founders'
    | 'Freelance & MSME'
    | 'Employment & Interns'
    | 'Rent & Housing'
    | 'SaaS & DPDP Privacy';
  statuteTag: string;
  readability: number;
  summary: string;
  clauses: string[];
}

export const INDIA_24_TEMPLATES: LegalTemplateItem[] = [
  // 1. Startup & Founders (5)
  {
    id: 'tpl-01',
    code: 'TPL-01',
    title: 'Co-Founder Equity & Vesting Agreement',
    category: 'Startup & Founders',
    statuteTag: 'Companies Act, 2013 · Sec 27 Compliant',
    readability: 92,
    summary: '4-year reverse vesting with 1-year cliff, clean IP assignment, and good-leaver / bad-leaver definitions.',
    clauses: [
      '1. EQUITY VESTING SCHEDULE: Co-Founder equity shall vest over forty-eight (48) months with a twelve (12) month cliff. Unvested shares upon voluntary exit before the cliff shall revert to the ESOP/Founder pool.',
      '2. INTELLECTUAL PROPERTY ASSIGNMENT: Each Co-Founder assigns all startup-related IP created during the venture to the Company, excluding pre-existing prior inventions listed in Schedule A.',
      '3. SECTION 27 COMPLIANT RESTRAINT: During active engagement, Founders shall devote full professional time. Post-exit restrictions are limited strictly to confidentiality and non-solicitation for 12 months (compliant with Section 27, Indian Contract Act, 1872).'
    ]
  },
  {
    id: 'tpl-02',
    code: 'TPL-02',
    title: 'Mutual Non-Disclosure Agreement (India NDA)',
    category: 'Startup & Founders',
    statuteTag: 'Indian Contract Act, 1872',
    readability: 95,
    summary: 'Balanced two-way NDA protecting pitch decks, source code, and financials with a 3-year survival window.',
    clauses: [
      '1. DEFINITION OF CONFIDENTIAL INFORMATION: Includes all non-public technical, financial, product, or customer data shared between the Parties, whether marked confidential or reasonably understood to be confidential.',
      '2. OBLIGATIONS & EXCLUSIONS: Receiving Party will protect Confidential Information using reasonable care and will not disclose it to third parties without prior written consent. Excludes publicly available or independently developed information.',
      '3. TERM & RETURN/DESTRUCTION: Confidentiality obligations survive for three (3) years. Upon written request, Receiving Party will delete or return all confidential materials within 14 days.'
    ]
  },
  {
    id: 'tpl-03',
    code: 'TPL-03',
    title: 'Startup Advisor & Mentor Equity Agreement (FAST India)',
    category: 'Startup & Founders',
    statuteTag: 'Companies Act, 2013',
    readability: 91,
    summary: 'Standard 0.25% to 1.0% advisory equity agreement with quarterly vesting and clear monthly mentorship hours.',
    clauses: [
      '1. ADVISORY SCOPE: Advisor agrees to provide strategic introductions and product mentorship for approximately 4–6 hours per month.',
      '2. EQUITY COMPENSATION: Subject to Board approval, Advisor will be granted stock options vesting quarterly over twenty-four (24) months with a three (3) month cliff.',
      '3. NO AGENCY OR AUTHORITY: Advisor acts as an independent mentor and has no authority to bind the Company to financial or legal obligations.'
    ]
  },
  {
    id: 'tpl-04',
    code: 'TPL-04',
    title: 'iSAFE Note (India Simple Agreement for Future Equity)',
    category: 'Startup & Founders',
    statuteTag: 'FEMA & Companies Act, 2013 (CCPS)',
    readability: 88,
    summary: 'Founder-friendly angel investment instrument structured as Compulsorily Convertible Preference Shares (CCPS) under Indian law.',
    clauses: [
      '1. INVESTMENT & CCPS ISSUANCE: Against the investment amount, Company issues iSAFE notes structured as Compulsorily Convertible Preference Shares (CCPS) compliant with the Companies Act, 2013.',
      '2. CONVERSION EVENT & VALUATION CAP: The iSAFE automatically converts into equity shares at the next priced institutional round at the agreed Valuation Cap or Discount Rate, whichever is more favorable to the Investor.',
      '3. NO PERSONAL GUARANTEE: Founders give no personal financial guarantee or personal asset indemnity for the investment.'
    ]
  },
  {
    id: 'tpl-05',
    code: 'TPL-05',
    title: 'Shareholders & Cap-Table Governance Agreement (SHA)',
    category: 'Startup & Founders',
    statuteTag: 'Companies Act, 2013',
    readability: 87,
    summary: 'Balanced board rights, pro-rata anti-dilution, tag-along rights, and founder-protective drag-along thresholds.',
    clauses: [
      '1. BOARD COMPOSITION & RESERVED MATTERS: Founders retain operational control over day-to-day hiring and product roadmap; affirmative investor consent applies only to listed structural matters.',
      '2. PRE-EMPTIVE & TAG-ALONG RIGHTS: Existing shareholders hold pro-rata right of first refusal on new issuances and tag-along protection on secondary transfers.',
      '3. FOUNDER LOCK-IN & GOOD LEAVER: Founder lock-in is subject to fair market value buyback upon disability, death, or termination without cause.'
    ]
  },

  // 2. Freelance, Agency & MSME (6)
  {
    id: 'tpl-06',
    code: 'TPL-06',
    title: 'Freelance / Independent Contractor MSA (MSME & 194J Ready)',
    category: 'Freelance & MSME',
    statuteTag: 'MSMED Act Sec 15 · Income Tax Sec 194J',
    readability: 94,
    summary: 'Protects freelancers with Net-15/30 payment (within MSME 45-day limit), explicit 2%/10% TDS clause, and Background IP retention.',
    clauses: [
      '1. PAYMENT & MSME 45-DAY COMPLIANCE: Client will pay undisputed invoices within fifteen (15) days of receipt (and in no event later than the statutory 45-day ceiling under Section 15 of the MSMED Act, 2006 and Section 43B(h) of the Income Tax Act).',
      '2. TDS CLARITY (SECTION 194J): Any Tax Deducted at Source (TDS) under Section 194J (2% for technical services or 10% for professional services, if aggregate annual payout exceeds ₹50,000) will be deposited against Contractor’s PAN with Form 16A issued quarterly.',
      '3. IP TRANSFER UPON FULL PAYMENT: Ownership of custom deliverables transfers to Client only upon 100% invoice settlement. Contractor retains all pre-existing code libraries, templates, and background tools.'
    ]
  },
  {
    id: 'tpl-07',
    code: 'TPL-07',
    title: 'Software Development Statement of Work (SOW + Kill Fee)',
    category: 'Freelance & MSME',
    statuteTag: 'Indian Contract Act Sec 73',
    readability: 93,
    summary: 'Milestone-based SOW with 7-day deemed acceptance, 2 revision rounds included, and a 25% kill fee on early cancellation.',
    clauses: [
      '1. MILESTONE ACCEPTANCE (7-DAY DEEMED APPROVAL): Client has seven (7) business days to review each milestone against written SOW criteria. If no written defect list is provided within 7 business days, the milestone is deemed accepted.',
      '2. REVISION BOUNDARY: Includes two (2) rounds of revisions per milestone. Out-of-scope feature requests will be estimated separately at ₹2,500/hour.',
      '3. CONVENIENCE TERMINATION & KILL FEE: If Client cancels mid-project without cause, Client will pay for all completed work pro-rata plus a 25% kill fee on the active milestone.'
    ]
  },
  {
    id: 'tpl-08',
    code: 'TPL-08',
    title: 'UI/UX & Brand Design Licensing Agreement',
    category: 'Freelance & MSME',
    statuteTag: 'Copyright Act, 1957 (Sec 19)',
    readability: 92,
    summary: 'Complies with Section 19(5)/(6) of the Indian Copyright Act so unused concepts stay with the designer and portfolio rights are preserved.',
    clauses: [
      '1. FINAL ARTWORK ASSIGNMENT: Upon full payment, Designer assigns commercial rights solely to the final selected design direction. Unused concepts, Figma components, and preliminary sketches remain Designer’s property.',
      '2. COPYRIGHT ACT SEC 19(5) TERRITORY & TERM: Unless otherwise stated, assignment of final artwork is worldwide for the full term of copyright, subject to full invoice settlement.',
      '3. PORTFOLIO DISPLAY RIGHT: Designer may showcase non-confidential visuals of the launched project in professional portfolios and award submissions.'
    ]
  },
  {
    id: 'tpl-09',
    code: 'TPL-09',
    title: 'Creator & Influencer Brand Sponsorship Contract',
    category: 'Freelance & MSME',
    statuteTag: 'ASCI Guidelines · Consumer Protection Act',
    readability: 94,
    summary: 'Protects creators from perpetual paid-ad whitelisting grabs, limits brand exclusivity to 30 days, and enforces Net-15 payout.',
    clauses: [
      '1. DELIVERABLES & ORGANIC USAGE WINDOW: Creator will publish 1 Instagram Reel and 1 YouTube integration. Brand may repost organically for 60 days; paid ad whitelisting or AI voice/likeness cloning requires a separate paid addendum.',
      '2. NARROW CATEGORY EXCLUSIVITY: Creator agrees not to promote direct named competitors in the exact product sub-category for thirty (30) days following publication.',
      '3. PAYMENT & ASCI DISCLOSURE: 50% advance upon signing and 50% within 15 days of content approval. Creator will include standard #Ad / #Sponsored disclosure per ASCI rules.'
    ]
  },
  {
    id: 'tpl-10',
    code: 'TPL-10',
    title: 'Retainer Consulting Agreement (Section 44ADA / GST Ready)',
    category: 'Freelance & MSME',
    statuteTag: 'Income Tax Sec 44ADA & CGST Act',
    readability: 91,
    summary: 'Monthly advisory/engineering retainer with clear hour caps, rollover rules, mutual 14-day termination notice, and GST invoicing.',
    clauses: [
      '1. MONTHLY RETAINER & HOUR CAP: Client engages Consultant for up to 40 hours per month against a fixed monthly retainer paid on the 1st of each month.',
      '2. TAX & GST COMPLIANCE: Fees are exclusive of 18% GST (if registered). TDS shall be deducted strictly per Section 194J guidelines.',
      '3. MUTUAL 14-DAY NOTICE: Either party may end the retainer with 14 days’ written email notice without penalty.'
    ]
  },
  {
    id: 'tpl-11',
    code: 'TPL-11',
    title: 'MSME Delayed Payment Legal Demand Notice (Sec 15/16)',
    category: 'Freelance & MSME',
    statuteTag: 'MSMED Act, 2006 (Sec 15, 16 & 18)',
    readability: 90,
    summary: 'Formal statutory notice demanding overdue invoice payout within 7 days prior to filing on the MSME Samadhaan portal, including 3x RBI interest.',
    clauses: [
      '1. STATUTORY DEFAULT UNDER SECTION 15: Notice is hereby given that Invoice No. [INV-2026] has remained unpaid beyond the mandatory 45-day ceiling prescribed under Section 15 of the MSMED Act, 2006.',
      '2. COMPOUND INTEREST AT 3X RBI BANK RATE (SECTION 16): Under Section 16 of the MSMED Act, the buyer is liable to pay compound interest with monthly rests at three times (3x) the bank rate notified by the Reserve Bank of India.',
      '3. SECTION 43B(h) INCOME TAX DISALLOWANCE WARNING: Failure to clear the principal and statutory interest within 7 days will result in a reference to the Micro and Small Enterprises Facilitation Council (MSEFC) and tax disallowance under Section 43B(h).'
    ]
  },

  // 3. Employment, HR & Internships (5)
  {
    id: 'tpl-12',
    code: 'TPL-12',
    title: 'Full-Time Employment Offer & Appointment Contract',
    category: 'Employment & Interns',
    statuteTag: 'Indian Contract Act Sec 27 · Shops & Est. Act',
    readability: 93,
    summary: 'Fair employment contract with symmetric notice period, no training bond/clawback trap, and Section 27 compliant post-exit clause.',
    clauses: [
      '1. COMPENSATION & STATUTORY BENEFITS: Employee will receive the agreed CTC paid monthly by the last working day, inclusive of PF, Gratuity (per Payment of Gratuity Act), and statutory leave under the Shops and Establishments Act.',
      '2. SYMMETRIC NOTICE PERIOD: During probation, notice is 15 days for both sides; post-confirmation, notice is 30 days (or salary in lieu) equally for Employee and Employer.',
      '3. NO POST-EXIT NON-COMPETE (SECTION 27 COMPLIANCE): Post-termination restrictions are limited strictly to protection of trade secrets and customer non-solicitation. Employee’s constitutional right to pursue any lawful profession is fully preserved under Section 27.'
    ]
  },
  {
    id: 'tpl-13',
    code: 'TPL-13',
    title: 'Student Internship & Stipend Offer Letter (Academic Carve-Out)',
    category: 'Employment & Interns',
    statuteTag: 'Indian Contract Act · AICTE / University Norms',
    readability: 96,
    summary: 'Student-first internship offer guaranteeing stipend payout, zero return-offer clawback, and full protection for university thesis & hackathons.',
    clauses: [
      '1. STIPEND & NO CLAWBACK GUARANTEE: Intern will receive a monthly stipend paid by the 5th of each month. The stipend and any relocation allowance are earned compensation and are never subject to repayment or clawback if Intern declines a future return offer.',
      '2. ACADEMIC & HACKATHON IP CARVE-OUT: Company claims ownership only over work performed directly for Company tasks. University capstones, thesis research, and weekend student hackathons built on personal equipment belong 100% to the Student.',
      '3. FLEXIBLE EXAM & COMPLETION CERTIFICATE: Intern may take 7 days’ notice to exit early for academic commitments and will receive an Internship Completion Certificate for all completed weeks.'
    ]
  },
  {
    id: 'tpl-14',
    code: 'TPL-14',
    title: 'Employee Proprietary Information & Inventions Agreement (PIIA)',
    category: 'Employment & Interns',
    statuteTag: 'Copyright Act & Patents Act, 1970',
    readability: 90,
    summary: 'Clean IP assignment with an explicit Schedule A for prior side-projects and off-duty open-source contributions.',
    clauses: [
      '1. COMPANY INVENTIONS: Assigns inventions conceived using Company resources or directly relating to Company’s active product line.',
      '2. OFF-DUTY & OPEN-SOURCE EXEMPTION: Does not apply to personal projects developed entirely on Employee’s own time and personal laptop without using Company trade secrets.',
      '3. PRIOR INVENTIONS SCHEDULE: All prior repositories, apps, and patents listed by Employee in Exhibit A are permanently excluded from assignment.'
    ]
  },
  {
    id: 'tpl-15',
    code: 'TPL-15',
    title: 'POSH Workplace Safety & ICC Policy Charter',
    category: 'Employment & Interns',
    statuteTag: 'POSH Act, 2013',
    readability: 94,
    summary: 'Mandatory Internal Complaints Committee (ICC) charter and complaint redressal timeline for Indian startups with 10+ employees.',
    clauses: [
      '1. ZERO-TOLERANCE & SCOPE: Applies to all full-time employees, interns, freelancers, and visitors across physical offices and remote video workspaces under the POSH Act, 2013.',
      '2. INTERNAL COMPLAINTS COMMITTEE (ICC): Establishes a time-bound 90-day inquiry framework with an external independent member and strict confidentiality protections.',
      '3. ANTI-RETALIATION SAFEGUARD: Strictly prohibits any adverse performance review, stipend withholding, or retaliation against a complainant or witness.'
    ]
  },
  {
    id: 'tpl-16',
    code: 'TPL-16',
    title: 'Relieving Letter & Full-and-Final (FnF) Settlement Deed',
    category: 'Employment & Interns',
    statuteTag: 'Payment of Wages Act · Shops & Est. Act',
    readability: 95,
    summary: 'Guarantees FnF salary and leave encashment payout within 14 days of last working day alongside unconditional relieving letter.',
    clauses: [
      '1. FULL AND FINAL PAYOUT SLA: Company will process all unpaid salary, approved reimbursements, and earned leave encashment within fourteen (14) days of the Last Working Day.',
      '2. UNCONDITIONAL RELIEVING & EXPERIENCE LETTER: Upon handover of company laptop/credentials, Company issues the formal Relieving and Experience Letter on the Last Working Day.',
      '3. MUTUAL RELEASE: Both parties release each other from future claims relating to the completed employment tenure.'
    ]
  },

  // 4. Rent, Real Estate & Co-Living (4)
  {
    id: 'tpl-17',
    code: 'TPL-17',
    title: '11-Month Residential Leave & License Agreement (Tenant-Safe)',
    category: 'Rent & Housing',
    statuteTag: 'Indian Easements Act, 1882 · Model Tenancy Act',
    readability: 95,
    summary: 'Standard 11-month Indian flat/room rental with individual by-the-bed liability, 24-hour entry notice, and zero cleaning skim.',
    clauses: [
      '1. INDIVIDUAL TENANT LIABILITY (NO JOINT DEFAULT TRAP): Where shared by roommates, each Licensee is responsible solely for their individual monthly rent share and pro-rata utility bill.',
      '2. REFUNDABLE SECURITY DEPOSIT & NO CLEANING SKIM: Security deposit will be refunded via UPI/NEFT on the day keys are handed back, with zero automatic painting or sanitization fee deductions for normal wear and tear.',
      '3. 24-HOUR ENTRY NOTICE & 30-DAY EXIT: Licensor must provide at least 24 hours’ prior WhatsApp/email notice before visiting. Either party may terminate after the initial lock-in with 30 days’ written notice.'
    ]
  },
  {
    id: 'tpl-18',
    code: 'TPL-18',
    title: 'Student PG / Hostel & Co-Living Accommodation Agreement',
    category: 'Rent & Housing',
    statuteTag: 'Consumer Protection Act, 2019',
    readability: 96,
    summary: 'Protects students in PGs/co-living spaces from sudden curfews, unannounced lock-in extensions, and deposit forfeiture during summer break.',
    clauses: [
      '1. TRANSPARENT ALL-INCLUSIVE RENT: Monthly fee includes Wi-Fi, housekeeping, water, and common electricity; electricity sub-meter charges shall be billed strictly at actual state utility tariff rates with no markup.',
      '2. SUMMER INTERNSHIP EXIT / PAUSE OPTION: Student may vacate or pause room occupancy for summer internships or semester breaks with 30 days’ notice via email or WhatsApp.',
      '3. 7-DAY DEPOSIT REFUND GUARANTEE: Security deposit will be refunded within 7 calendar days of check-out; any delay accrues ₹200/day penalty.'
    ]
  },
  {
    id: 'tpl-19',
    code: 'TPL-19',
    title: 'Commercial Coworking Desk & Studio License',
    category: 'Rent & Housing',
    statuteTag: 'Indian Contract Act, 1872',
    readability: 92,
    summary: 'Flexible month-to-month office desk license for startups and freelancers with GST tax invoice and 30-day notice.',
    clauses: [
      '1. LICENSE FEE & GST INPUT CREDIT: Operator will issue a valid B2B GST invoice each month enabling Licensee to claim 18% GST Input Tax Credit.',
      '2. NO AUTO-RENEWAL LOCK-IN: Converts automatically to a flexible month-to-month plan after the initial term, cancellable with 30 days’ email notice.',
      '3. 24/7 ACCESS & DATA PRIVACY: Licensee retains 24/7 keycard access and confidential workspace privacy.'
    ]
  },
  {
    id: 'tpl-20',
    code: 'TPL-20',
    title: 'Move-In / Move-Out Condition Checklist & Deposit Receipt',
    category: 'Rent & Housing',
    statuteTag: 'Bharatiya Sakshya Adhiniyam (BSA), 2023',
    readability: 97,
    summary: 'Timestamped photo inventory addendum preventing landlords from blaming tenants for pre-existing wall marks or appliance faults.',
    clauses: [
      '1. 7-DAY MOVE-IN INSPECTION WINDOW: Tenant has 7 days from key handover to log photos/videos of pre-existing dampness, scratches, or faulty appliances via email/WhatsApp.',
      '2. WEAR AND TEAR EXEMPTION: Faded paint, minor nail holes, and routine appliance aging are explicitly classified as normal wear and tear and cannot be deducted from the deposit.',
      '3. INSTANT HANDOVER RECEIPT: Landlord signs off on joint inspection at key return and transfers deposit balance immediately.'
    ]
  },

  // 5. SaaS, Data Privacy & Website Policies (4)
  {
    id: 'tpl-21',
    code: 'TPL-21',
    title: 'DPDP Act 2023 Compliant Privacy Policy & Consent Notice',
    category: 'SaaS & DPDP Privacy',
    statuteTag: 'Digital Personal Data Protection (DPDP) Act, 2023',
    readability: 95,
    summary: 'Itemized plain-English Data Principal consent notice, right to withdraw consent, right to erasure, and Grievance Officer details.',
    clauses: [
      '1. ITEMIZED PURPOSE & ZERO AI TRAINING (DPDP SEC 5 & 6): We collect only the minimum personal data required to deliver the service. Your uploaded documents and personal data are never sold or used to train third-party AI models.',
      '2. DATA PRINCIPAL RIGHTS (SEC 11–14): You have the right to access, correct, export, and permanently erase your personal data at any time with a single click, and to nominate a representative.',
      '3. DATA PROTECTION & GRIEVANCE OFFICER: All inquiries and erasure requests are resolved within 7 business days by our designated India Grievance Officer.'
    ]
  },
  {
    id: 'tpl-22',
    code: 'TPL-22',
    title: 'SaaS Master Subscription Agreement (Fair SLA & Mutual Cap)',
    category: 'SaaS & DPDP Privacy',
    statuteTag: 'IT Act, 2000 · Indian Contract Act',
    readability: 91,
    summary: 'Balanced B2B SaaS agreement with 99.9% uptime SLA credits, 30-day price-change notice, and a 12-month mutual liability cap.',
    clauses: [
      '1. CUSTOMER DATA OWNERSHIP & PORTABILITY: Customer retains 100% ownership of all uploaded data. Upon termination, Customer has 30 days to export all records in JSON/CSV format before permanent deletion.',
      '2. NO SILENT PRICE HIKES: Subscription renewals occur at the existing rate unless Provider gives at least 30 days’ prior email notice of any pricing adjustment.',
      '3. MUTUAL LIABILITY CAP & PERKINS EASTMAN ARBITRATION: Mutual liability is capped at 12 months’ fees. Any arbitration under the Arbitration and Conciliation Act, 1996 shall use a mutually appointed neutral sole arbitrator.'
    ]
  },
  {
    id: 'tpl-23',
    code: 'TPL-23',
    title: 'Website & App Terms of Service (IT Rules 2021 Compliant)',
    category: 'SaaS & DPDP Privacy',
    statuteTag: 'IT (Intermediary Guidelines) Rules, 2021',
    readability: 93,
    summary: 'User-friendly app T&Cs with a 14-day cure window before account suspension, clear refund rules, and creator content ownership.',
    clauses: [
      '1. USER CONTENT OWNERSHIP: You own what you create and upload. You grant the platform only a limited license to host and display your content while your account is active.',
      '2. FAIR ACCOUNT SUSPENSION & 14-DAY CURE: Except for unlawful activity, we will notify you by email and give you 14 days to resolve any policy issue before suspending your account.',
      '3. TRANSPARENT REFUNDS & CANCELLATION: One-click cancellation in account settings; unused annual prepayments are refunded pro-rata within 7 business days.'
    ]
  },
  {
    id: 'tpl-24',
    code: 'TPL-24',
    title: 'Data Processing Addendum (DPA · CERT-In & DPDP Ready)',
    category: 'SaaS & DPDP Privacy',
    statuteTag: 'CERT-In Directions, 2022 · DPDP Act, 2023',
    readability: 90,
    summary: 'Enterprise DPA covering sub-processor transparency, encryption at rest/transit, and CERT-In 6-hour cybersecurity incident notification.',
    clauses: [
      '1. DATA PROCESSOR OBLIGATIONS: Processor will process Personal Data solely on documented instructions from the Data Fiduciary and maintain AES-256 encryption at rest and TLS 1.3 in transit.',
      '2. INCIDENT NOTIFICATION (CERT-IN COMPLIANCE): Processor will notify Customer without undue delay (and within 6 hours for reportable CERT-In cybersecurity incidents) upon discovering any unauthorized data breach.',
      '3. SUB-PROCESSOR NOTICE & AUDIT: Processor will give 30 days’ advance notice before adding any new sub-processor and delete all data slices upon contract termination.'
    ]
  }
];

export interface ComparisonRow {
  category: string;
  isNew?: boolean;
  items: {
    feature: string;
    froggo: { status: 'check'; text: string };
    chatgpt: { status: 'cross' | 'warn'; text: string };
    clm: { status: 'cross' | 'warn'; text: string };
  }[];
}

export const CONTRACTSHIELD_COMPARISON_ROWS: ComparisonRow[] = [
  {
    category: 'CONTRACT ANALYSIS (INDIAN STATUTORY SIFTERS)',
    items: [
      {
        feature: 'Section 27 Non-Compete Checks (Indian Contract Act)',
        froggo: { status: 'check', text: 'Auto-detects & warns (Void post-exit)' },
        chatgpt: { status: 'cross', text: 'Manual prompting' },
        clm: { status: 'cross', text: 'Lawyer review needed' }
      },
      {
        feature: 'MSME 45-Day Payment Flags (Sec 15 & Sec 43B(h))',
        froggo: { status: 'check', text: 'Auto-validates clauses & interest' },
        chatgpt: { status: 'cross', text: 'Unaware of Indian law' },
        clm: { status: 'cross', text: 'Manual template setup' }
      },
      {
        feature: 'TDS Checks (Section 194J / 194C & Sec 44ADA)',
        froggo: { status: 'check', text: 'Flags threshold & 2% vs 10% anomalies' },
        chatgpt: { status: 'cross', text: 'Hallucinates rates' },
        clm: { status: 'cross', text: 'No legal math verify' }
      },
      {
        feature: 'LegalSifter Missing Clauses & Unilateral Arbitration',
        froggo: { status: 'check', text: 'Flags omissions & Perkins Eastman rule' },
        chatgpt: { status: 'cross', text: 'Only reads what is pasted' },
        clm: { status: 'warn', text: 'Complex enterprise playbook' }
      }
    ]
  },
  {
    category: 'CONTRACT GENERATION & AI COMPARE',
    isNew: true,
    items: [
      {
        feature: 'AI Contract Drafting (24+ India Templates)',
        froggo: { status: 'check', text: 'NDA, Employment, Founders, MSME, Rent' },
        chatgpt: { status: 'warn', text: 'Generic US law, not India law' },
        clm: { status: 'cross', text: 'Lawyer drafts only' }
      },
      {
        feature: 'Lito-Style AI Redline & "Mitigate Risk" Compare',
        froggo: { status: 'check', text: 'Side-by-side diff & 1-click rewrite' },
        chatgpt: { status: 'cross', text: 'No inline redline tracking' },
        clm: { status: 'warn', text: 'Requires Word desktop plugin' }
      },
      {
        feature: 'Export as PDF / Word (.doc)',
        froggo: { status: 'check', text: 'One-click Word & PDF export' },
        chatgpt: { status: 'cross', text: 'Copy-paste only' },
        clm: { status: 'cross', text: 'Manual formatting' }
      }
    ]
  },
  {
    category: 'COST, PRIVACY & ACCESS',
    items: [
      {
        feature: 'User Data Privacy (DPDP Act 2023 & PII Masker)',
        froggo: { status: 'check', text: 'Zero-retention + PAN/Aadhaar auto-mask' },
        chatgpt: { status: 'cross', text: 'Trains models on uploads' },
        clm: { status: 'warn', text: 'Cloud vendor lock-in' }
      },
      {
        feature: 'Starting Price',
        froggo: { status: 'check', text: '₹99/contract (Free Student Tier)' },
        chatgpt: { status: 'warn', text: '₹1,999/mo sub required' },
        clm: { status: 'cross', text: '₹3 lakh+ annual license' }
      },
      {
        feature: 'Setup Time',
        froggo: { status: 'check', text: 'Instant — 0 minutes' },
        chatgpt: { status: 'warn', text: 'Prompt learning curve' },
        clm: { status: 'cross', text: 'Weeks of onboarding' }
      }
    ]
  }
];

export interface RedlineComparisonItem {
  id: string;
  clauseTitle: string;
  statuteCited: string;
  riskSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  counterpartyText: string;
  deletedSpan: string;
  addedSpan: string;
  froggoRedlineText: string;
  legalRationale: string;
}

export const AI_REDLINE_COMPARISONS: RedlineComparisonItem[] = [
  {
    id: 'redline-sec27',
    clauseTitle: 'Post-Termination Non-Compete vs. Section 27 Indian Contract Act',
    statuteCited: 'Section 27, Indian Contract Act, 1872 · Percept D’Mark v. Zaheer Khan (SC)',
    riskSeverity: 'CRITICAL',
    counterpartyText:
      'For a period of 24 months after termination, Contractor/Employee shall not join, advise, or build any competing software business anywhere in India.',
    deletedSpan:
      'shall not join, advise, or build any competing software business anywhere in India.',
    addedSpan:
      'shall maintain strict confidentiality of Company trade secrets and shall not solicit active Company clients for 12 months. Post-exit employment or freelance practice remains unrestricted per Section 27 of the Indian Contract Act, 1872.',
    froggoRedlineText:
      'For a period of 12 months after termination, Contractor/Employee shall maintain strict confidentiality of Company trade secrets and shall not solicit active Company clients. Post-exit employment or freelance practice remains unrestricted per Section 27 of the Indian Contract Act, 1872.',
    legalRationale:
      'Under Section 27 of the Indian Contract Act, post-termination restraint of trade is void ab initio. Froggo replaces the unenforceable ban with a valid Confidentiality & Non-Solicitation covenant.'
  },
  {
    id: 'redline-msme',
    clauseTitle: 'Net-90 Payment Delay vs. MSME 45-Day Statutory Ceiling',
    statuteCited: 'Section 15 & 16, MSMED Act, 2006 · Section 43B(h), Income Tax Act',
    riskSeverity: 'CRITICAL',
    counterpartyText:
      'Client shall remit payment within ninety (90) days of invoice approval in its sole discretion, without any late payment interest.',
    deletedSpan:
      'ninety (90) days of invoice approval in its sole discretion, without any late payment interest.',
    addedSpan:
      'fifteen (15) days of invoice submission (and strictly within the 45-day statutory ceiling under Section 15 of the MSMED Act, 2006). Overdue balances attract compound interest at 3x the RBI bank rate per Section 16.',
    froggoRedlineText:
      'Client shall remit payment within fifteen (15) days of invoice submission (and strictly within the 45-day statutory ceiling under Section 15 of the MSMED Act, 2006). Overdue balances attract compound interest at 3x the RBI bank rate per Section 16.',
    legalRationale:
      'Any contractual credit period exceeding 45 days for an MSME vendor violates Section 15 of the MSMED Act and triggers tax expense disallowance for the client under Section 43B(h).'
  },
  {
    id: 'redline-tds',
    clauseTitle: 'Section 194J TDS Classification (2% Technical vs. 10% Professional)',
    statuteCited: 'Section 194J(a)/(b), Income Tax Act, 1961 · Finance Act 2020 Amendment',
    riskSeverity: 'HIGH',
    counterpartyText:
      'Client shall deduct flat 10% TDS on all software and technical invoices regardless of annual threshold.',
    deletedSpan:
      'flat 10% TDS on all software and technical invoices regardless of annual threshold.',
    addedSpan:
      'applicable TDS under Section 194J only if aggregate annual fees exceed ₹50,000, applying 2% for technical/software services under Section 194J(b) and issuing quarterly Form 16A certificates.',
    froggoRedlineText:
      'Client shall deduct applicable TDS under Section 194J only if aggregate annual fees exceed ₹50,000, applying 2% for technical/software services under Section 194J(b) and issuing quarterly Form 16A certificates.',
    legalRationale:
      'Generic AI often confuses 10% professional royalty/legal TDS with the 2% TDS rate for technical services introduced under Section 194J(b), locking up 8% of your cash flow unnecessarily.'
  },
  {
    id: 'redline-arb',
    clauseTitle: 'Unilateral Arbitrator Appointment vs. Supreme Court Neutrality Rule',
    statuteCited: 'Section 12(5), Arbitration & Conciliation Act, 1996 · Perkins Eastman v. HSCC',
    riskSeverity: 'HIGH',
    counterpartyText:
      'Any dispute shall be referred to a Sole Arbitrator appointed exclusively by the Company’s Managing Director.',
    deletedSpan: 'appointed exclusively by the Company’s Managing Director.',
    addedSpan:
      'appointed mutually by both Parties (or by an independent arbitral institution) in accordance with Section 12(5) of the Arbitration and Conciliation Act, 1996.',
    froggoRedlineText:
      'Any dispute shall be referred to a neutral Sole Arbitrator appointed mutually by both Parties (or by an independent arbitral institution) in accordance with Section 12(5) of the Arbitration and Conciliation Act, 1996.',
    legalRationale:
      'The Supreme Court of India held in Perkins Eastman Architects DPC v. HSCC (India) Ltd. that unilateral appointment of a sole arbitrator by an interested party is invalid under Section 12(5).'
  }
];
