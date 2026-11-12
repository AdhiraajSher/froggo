import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { extractDocumentText } from '../src/lib/extractDocumentText';
import { segmentContractClauses, analyzeContractDocument } from '../src/lib/documentAnalysis';

describe('Real Document Text Extraction & Segmentation', () => {
  it('extracts plain text from a .txt contract file', async () => {
    const filePath = path.resolve(__dirname, 'fixtures/sample-contract.txt');
    const buffer = fs.readFileSync(filePath);
    const mockFile = {
      name: 'sample-contract.txt',
      size: buffer.length,
      arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
      text: async () => buffer.toString('utf-8'),
    };

    const result = await extractDocumentText(mockFile);
    expect(result.fileType).toBe('txt');
    expect(result.text).toContain('Payment shall be remitted within 60 days');
    expect(result.text).toContain('Post-Termination Non-Compete');
    expect(result.wordCount).toBeGreaterThan(20);
  });

  it('extracts text from a markdown (.md) contract file', async () => {
    const filePath = path.resolve(__dirname, 'fixtures/sample-contract.md');
    const buffer = fs.readFileSync(filePath);
    const mockFile = {
      name: 'sample-contract.md',
      size: buffer.length,
      arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
      text: async () => buffer.toString('utf-8'),
    };

    const result = await extractDocumentText(mockFile);
    expect(result.fileType).toBe('md');
    expect(result.text).toContain('Residential Leave and License Agreement');
    expect(result.text).toContain('Joint and Several Liability');
  });

  it('extracts text from a DOCX contract file using mammoth', async () => {
    const filePath = path.resolve(__dirname, 'fixtures/sample-contract.docx');
    const buffer = fs.readFileSync(filePath);
    const mockFile = {
      name: 'sample-contract.docx',
      size: buffer.length,
      arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
    };

    const result = await extractDocumentText(mockFile);
    expect(result.fileType).toBe('docx');
    expect(result.text).toContain('Payment will be cleared within 30 days');
    expect(result.text).toContain('Intellectual property rights transfer');
  });

  it('rejects legacy .doc binary files with a helpful message', async () => {
    const mockFile = {
      name: 'ancient-contract.doc',
      size: 1024,
      arrayBuffer: async () => new ArrayBuffer(1024),
    };

    await expect(extractDocumentText(mockFile)).rejects.toThrow(
      /Legacy Word \(\.doc\) files cannot be parsed directly/i
    );
  });

  it('rejects files larger than 10 MB', async () => {
    const mockFile = {
      name: 'giant-contract.txt',
      size: 11 * 1024 * 1024,
      arrayBuffer: async () => new ArrayBuffer(0),
    };

    await expect(extractDocumentText(mockFile)).rejects.toThrow(
      /exceeds the 10 MB limit/i
    );
  });

  it('rejects completely empty text files', async () => {
    const mockFile = {
      name: 'blank.txt',
      size: 0,
      arrayBuffer: async () => new ArrayBuffer(0),
      text: async () => '   ',
    };

    await expect(extractDocumentText(mockFile)).rejects.toThrow(
      /is completely empty/i
    );
  });

  it('segments clauses with stable IDs and exact offsets without truncation', () => {
    const contractText = `1. Payment Terms: Payment shall be made within 15 days of invoice.
2. Intellectual Property: Contractor retains pre-existing tools.
3. Termination: Either party may terminate with 14 days notice.
4. Governing Law: This agreement is governed by the laws of India.
5. Non-Solicitation: Neither party shall solicit the other's employees.
6. Confidentiality: Mutual non-disclosure obligations apply.
7. Miscellaneous: Entire agreement clause.`;

    const clauses = segmentContractClauses(contractText);
    expect(clauses.length).toBe(7);
    expect(clauses[0].id).toBe('c-001');
    expect(clauses[6].id).toBe('c-007');

    // Verify exact offsets
    for (const clause of clauses) {
      expect(contractText.slice(clause.start, clause.end)).toBe(clause.text);
    }
  });

  it('analyzes entire document without .slice(0, 5) or .slice(0, 6) limits', () => {
    const clausesList = Array.from({ length: 8 }, (_, i) => `Clause ${i + 1}: Obligation ${i + 1} with standard operational conditions.`);
    const rawText = clausesList.join('\n\n');

    const doc = analyzeContractDocument(rawText, 'full-document.txt', 'Freelancer');
    expect(doc.clauses.length).toBe(8);
    expect(doc.findings.length).toBe(8);
    expect(doc.findings[7].clauseId).toBe('c-008');
  });
});
