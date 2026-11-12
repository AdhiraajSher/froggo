import { describe, it, expect } from 'vitest';
import { analyzeContractDocument, contractDocumentToFroggoFile } from '../src/lib/documentAnalysis';
import { exportContractPdf } from '../src/lib/generatePdfReport';

describe('Phase 5: Contract History & PDF Report Generation', () => {
  const sampleDoc = analyzeContractDocument(
    `1. Payment Terms: Invoices payable within 30 days.
2. Non-Compete: Contractor shall not work for any competitor for 12 months.
3. Intellectual Property: Rights transfer upon full payment.`,
    'Consulting Agreement.txt',
    'Freelancer'
  );

  it('transforms ContractDocument to FroggoFile preserving full breakdown', () => {
    const file = contractDocumentToFroggoFile(sampleDoc);
    expect(file.id).toBe(sampleDoc.id);
    expect(file.scoreBreakdown).toBeDefined();
    expect(file.scoreBreakdown.totalClausesCount).toBe(3);
    expect(file.indiaStatutoryChecks.sec27Status).toContain('Issue detected');
  });

  it('generates a PDF report document without runtime errors', () => {
    const file = contractDocumentToFroggoFile(sampleDoc);

    // Mock document.save if running in headless node
    let savedPdfName = '';
    const originalSave = (globalThis as any).jsPDF?.prototype?.save;

    expect(() => {
      exportContractPdf(file, 'Freelancer');
    }).not.toThrow();
  });

  it('ensures distinct IDs are created for uploads and drafts so none overwrite', () => {
    const doc1 = analyzeContractDocument('Clause 1: Scope A', 'Doc1.txt', 'Freelancer');
    const doc2 = analyzeContractDocument('Clause 1: Scope B', 'Doc2.txt', 'Freelancer');
    const doc3 = analyzeContractDocument('Clause 1: Scope C', 'Doc3.txt', 'Tenant');

    expect(doc1.id).not.toBe(doc2.id);
    expect(doc2.id).not.toBe(doc3.id);
  });
});
