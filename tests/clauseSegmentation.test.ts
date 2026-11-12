import { describe, it, expect } from 'vitest';
import {
  segmentContractClauses,
  inferContractType,
  analyzeContractDocument,
} from '../src/lib/documentAnalysis';

describe('Clause Segmentation & Offset Extraction', () => {
  it('segments standard numbered clauses with accurate offsets and stable IDs', () => {
    const rawText = `1. Payment Terms: Invoices payable within 30 days.
2. Intellectual Property: Rights belong to the developer.
3. Termination: 14 days written notice.`;

    const clauses = segmentContractClauses(rawText);
    expect(clauses.length).toBe(3);
    expect(clauses[0].id).toBe('c-001');
    expect(clauses[1].id).toBe('c-002');
    expect(clauses[2].id).toBe('c-003');

    // Offsets verify against rawText
    for (const c of clauses) {
      expect(rawText.slice(c.start, c.end)).toBe(c.text);
    }
  });

  it('handles Roman numerals (I., II., III., IV.)', () => {
    const rawText = `I. Term of Agreement: Commencing on April 1, 2026.
II. Scope of Services: Full-stack web application development.
III. Compensation: Fixed milestone fee of INR 1,50,000.`;

    const clauses = segmentContractClauses(rawText);
    expect(clauses.length).toBe(3);
    expect(clauses[0].id).toBe('c-001');
    expect(clauses[0].title).toContain('Term of Agreement');
    expect(clauses[1].id).toBe('c-002');
    expect(clauses[2].id).toBe('c-003');

    for (const c of clauses) {
      expect(rawText.slice(c.start, c.end)).toBe(c.text);
    }
  });

  it('handles bracketed clause numbering ((1), (2), [1], [2])', () => {
    const rawText = `(1) Confidentiality: Both parties shall preserve business secrets.
(2) Governing Law: Jurisdiction of courts in New Delhi, India.`;

    const clauses = segmentContractClauses(rawText);
    expect(clauses.length).toBe(2);
    expect(clauses[0].id).toBe('c-001');
    expect(clauses[1].id).toBe('c-002');
  });

  it('falls back to paragraph double newlines when headings are missing', () => {
    const rawText = `This is the first independent covenant without any heading. It explains the background.

This is the second independent covenant. It explains the mutual obligations of the parties.`;

    const clauses = segmentContractClauses(rawText);
    expect(clauses.length).toBe(2);
    expect(clauses[0].id).toBe('c-001');
    expect(clauses[1].id).toBe('c-002');
    expect(clauses[0].text).toContain('first independent covenant');
    expect(clauses[1].text).toContain('second independent covenant');
  });
});

describe('Context-Aware Detection & Statutory Integrity', () => {
  it('correctly handles negation: "no non-compete applies" must NOT trigger Sec 27 violation', () => {
    const textWithNegation = `1. Post-Termination: For the avoidance of doubt, no non-compete applies to the Contractor following termination of this agreement.`;
    const doc = analyzeContractDocument(textWithNegation, 'Negation Test.txt', 'Freelancer');

    expect(doc.statutoryChecks.sec27Status).toContain('Not detected in this text');
    expect(doc.findings[0].severity).not.toBe('high');
  });

  it('flags unnegated non-compete covenants as high risk under Section 27', () => {
    const restrictiveText = `1. Restraint: Contractor agrees not to engage in any competing business for 24 months post-termination.`;
    const doc = analyzeContractDocument(restrictiveText, 'NonCompete.txt', 'Freelancer');

    expect(doc.statutoryChecks.sec27Status).toContain('Issue detected');
    expect(doc.findings[0].severity).toBe('high');
    expect(doc.findings[0].title).toBe('Post-Termination Non-Compete Restraint');
  });

  it('word boundary check: "entire" should NOT trigger tenancy "enter" unannounced inspection rule', () => {
    const tenancyText = `1. The entire premises shall be kept clean by the tenant.
2. The licensor respects tenant quiet enjoyment.`;

    const doc = analyzeContractDocument(tenancyText, 'Rent.txt', 'Tenant');
    const findingTitles = doc.findings.map((f) => f.title);
    expect(findingTitles).not.toContain('Unannounced Landlord Entry or Discretionary Deposit Deduction');
  });

  it('contract type gating: MSME 45-day payment checks do NOT run on residential tenancy', () => {
    const tenancyText = `1. Lease Agreement: The tenant agrees to pay ₹35,000 rent per month for flat 402.`;
    const doc = analyzeContractDocument(tenancyText, 'Lease.txt', 'Tenant');

    expect(doc.statutoryChecks.msme45DayStatus).toContain('Not applicable to this contract type');
    expect(doc.statutoryChecks.sec27Status).toContain('Not applicable to this contract type');
  });

  it('unrecognised clauses default to "not_assessed", NEVER "safe"', () => {
    const oddText = `1. Equipment Care: The developer shall wipe the keyboard with isopropyl alcohol once every fortnight.`;
    const doc = analyzeContractDocument(oddText, 'Odd.txt', 'Freelancer');

    expect(doc.findings[0].severity).toBe('not_assessed');
    expect(doc.findings[0].title).toContain('Not Assessed');
    expect(doc.scoreBreakdown.unassessedClausesCount).toBe(1);
  });

  it('statutory statuses NEVER contain the word "Compliant"', () => {
    const doc = analyzeContractDocument(
      `1. Payment: Invoices payable in 15 days.\n2. Confidentiality: Mutual standard NDA.`,
      'Sample.txt',
      'Freelancer'
    );

    const statuses = Object.values(doc.statutoryChecks);
    for (const status of statuses) {
      if (typeof status === 'string') {
        expect(status.toLowerCase()).not.toContain('compliant');
      }
    }
  });

  it('provides a transparent score breakdown with penalties and legal disclaimer', () => {
    const doc = analyzeContractDocument(
      `1. Payment: Client pays within 90 days.\n2. Non-Compete: Contractor shall not work for any competitor for 1 year.`,
      'HighRisk.txt',
      'Freelancer'
    );

    expect(doc.scoreBreakdown).toBeDefined();
    expect(doc.scoreBreakdown.penalties.length).toBeGreaterThanOrEqual(2);
    expect(doc.scoreBreakdown.disclaimer).toContain('not a formal legal opinion');
    expect(doc.score).toBeGreaterThan(30);
  });
});
