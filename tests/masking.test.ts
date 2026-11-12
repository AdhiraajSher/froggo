import { describe, it, expect } from 'vitest';
import {
  maskPii,
  sanitizeTextForNetwork,
  PAN_REGEX,
  AADHAAR_SPACED_REGEX,
  AADHAAR_HYPHEN_REGEX,
  PHONE_REGEX,
  EMAIL_REGEX,
  BANK_ACCOUNT_REGEX,
  IFSC_REGEX,
} from '../src/lib/masking';

describe('PII Masking Module', () => {
  describe('Individual Regex Patterns', () => {
    it('matches Indian PAN numbers correctly', () => {
      const pan = 'ABCDE1234F';
      expect(pan).toMatch(PAN_REGEX);
      expect('INVALID123').not.toMatch(PAN_REGEX);
    });

    it('matches Aadhaar numbers in spaced format', () => {
      const aadhaarSpaced = '5432 1098 7654';
      expect(aadhaarSpaced).toMatch(AADHAAR_SPACED_REGEX);
    });

    it('matches Aadhaar numbers in hyphenated format', () => {
      const aadhaarHyphen = '5432-1098-7654';
      expect(aadhaarHyphen).toMatch(AADHAAR_HYPHEN_REGEX);
    });

    it('matches Indian mobile phone numbers', () => {
      expect('+91 98765 43210').toMatch(PHONE_REGEX);
      expect('+91-9876543210').toMatch(PHONE_REGEX);
      expect('9876543210').toMatch(PHONE_REGEX);
    });

    it('matches valid email addresses', () => {
      expect('counsel.contact@lawfirm.in').toMatch(EMAIL_REGEX);
      expect('freelancer+tax@gmail.com').toMatch(EMAIL_REGEX);
    });

    it('matches bank accounts with cues', () => {
      expect('A/C: 12345678901234').toMatch(BANK_ACCOUNT_REGEX);
      expect('Bank Account No: 987654321098').toMatch(BANK_ACCOUNT_REGEX);
    });

    it('matches Indian IFSC codes', () => {
      expect('SBIN0001234').toMatch(IFSC_REGEX);
      expect('HDFC0000567').toMatch(IFSC_REGEX);
    });
  });

  describe('maskPii Functionality', () => {
    it('handles empty or blank string gracefully', () => {
      const result = maskPii('');
      expect(result.maskedText).toBe('');
      expect(result.maskedCount).toBe(0);
      expect(result.summary.total).toBe(0);
    });

    it('leaves clean legal contract text untouched', () => {
      const cleanText = 'The Consultant shall deliver services within thirty (30) days from execution.';
      const result = maskPii(cleanText);
      expect(result.maskedText).toBe(cleanText);
      expect(result.maskedCount).toBe(0);
      expect(result.summary.total).toBe(0);
    });

    it('masks PAN cards accurately', () => {
      const text = 'The Service Provider with PAN ABCDE1234F agrees to the terms.';
      const result = maskPii(text);
      expect(result.maskedText).toContain('[PAN-MASKED]');
      expect(result.maskedText).not.toContain('ABCDE1234F');
      expect(result.summary.pan).toBe(1);
    });

    it('masks Aadhaar cards in spaced, hyphenated and keyword formats', () => {
      const text = `
        Party A Aadhaar: 3456 7890 1234
        Party B UID: 3456-7890-5678
        Party C Aadhaar No: 345678909012
      `;
      const result = maskPii(text);
      expect(result.maskedText).not.toContain('3456 7890 1234');
      expect(result.maskedText).not.toContain('3456-7890-5678');
      expect(result.maskedText).not.toContain('345678909012');
      expect(result.summary.aadhaar).toBe(3);
    });

    it('masks Indian phone numbers in all formats', () => {
      const text = 'Contact landlord at +91 98765 43210 or alternate 9123456789.';
      const result = maskPii(text);
      expect(result.maskedText).toContain('[PHONE-MASKED]');
      expect(result.maskedText).not.toContain('98765 43210');
      expect(result.maskedText).not.toContain('9123456789');
      expect(result.summary.phone).toBe(2);
    });

    it('masks email addresses', () => {
      const text = 'Notices must be emailed to notice-legal@clientcorp.in and cc to admin@agency.co.';
      const result = maskPii(text);
      expect(result.maskedText).toContain('[EMAIL-MASKED]');
      expect(result.maskedText).not.toContain('notice-legal@clientcorp.in');
      expect(result.maskedText).not.toContain('admin@agency.co');
      expect(result.summary.email).toBe(2);
    });

    it('masks bank accounts and IFSC codes', () => {
      const text = 'Payments shall be made to Account No: 12345678901234 at IFSC SBIN0001234.';
      const result = maskPii(text);
      expect(result.maskedText).toContain('[BANK-A/C-MASKED]');
      expect(result.maskedText).toContain('[IFSC-MASKED]');
      expect(result.maskedText).not.toContain('12345678901234');
      expect(result.maskedText).not.toContain('SBIN0001234');
      expect(result.summary.bankAccount).toBe(1);
      expect(result.summary.ifsc).toBe(1);
    });

    it('sanitizes full realistic contract party preamble containing multiple PII fields', () => {
      const preamble = `
        This Agreement is made on 1st April 2025 between Mr. Rajesh Sharma (PAN: ABCDE1234F,
        Aadhaar: 4321 8765 2109, Phone: +91 98765 12345, Email: rajesh@consultant.in),
        hereinafter called the "Consultant", and Acme India Pvt Ltd.
        Remittance shall be to Bank Account: 98765432109876, IFSC: HDFC0000456.
      `;
      const result = maskPii(preamble);
      expect(result.summary.pan).toBe(1);
      expect(result.summary.aadhaar).toBe(1);
      expect(result.summary.phone).toBe(1);
      expect(result.summary.email).toBe(1);
      expect(result.summary.bankAccount).toBe(1);
      expect(result.summary.ifsc).toBe(1);
      expect(result.maskedCount).toBe(6);

      // Verify no sensitive tokens remain in the output
      expect(result.maskedText).not.toContain('ABCDE1234F');
      expect(result.maskedText).not.toContain('4321 8765 2109');
      expect(result.maskedText).not.toContain('98765 12345');
      expect(result.maskedText).not.toContain('rajesh@consultant.in');
      expect(result.maskedText).not.toContain('98765432109876');
      expect(result.maskedText).not.toContain('HDFC0000456');
    });
  });

  describe('sanitizeTextForNetwork Helper', () => {
    it('returns clean text directly without metadata', () => {
      const sanitized = sanitizeTextForNetwork('Send ₹50,000 to A/C: 112233445566 with PAN ABCDE9999Z');
      expect(sanitized).toContain('[BANK-A/C-MASKED]');
      expect(sanitized).toContain('[PAN-MASKED]');
      expect(sanitized).not.toContain('112233445566');
      expect(sanitized).not.toContain('ABCDE9999Z');
    });
  });
});
