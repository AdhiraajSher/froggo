/**
 * PII Auto-Masking Engine for Indian Contracts & Legal Queries
 *
 * Automatically detects and redacts personal identifiable information
 * (PAN, Aadhaar, Indian phone numbers, emails, bank accounts, IFSC codes)
 * client-side before any text leaves the browser.
 */

export interface MaskingSummary {
  pan: number;
  aadhaar: number;
  phone: number;
  email: number;
  bankAccount: number;
  ifsc: number;
  total: number;
}

export interface MaskingResult {
  maskedText: string;
  maskedCount: number;
  summary: MaskingSummary;
}

// 1. Permanent Account Number (PAN): 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)
export const PAN_REGEX = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g;

// 2. Aadhaar Numbers (12 digits):
// - Spaced: "1234 5678 9012"
// - Hyphenated: "1234-5678-9012"
// - Unspaced preceded by Aadhaar/UID keywords: "Aadhaar: 123456789012"
export const AADHAAR_SPACED_REGEX = /\b[2-9]\d{3}\s\d{4}\s\d{4}\b/g;
export const AADHAAR_HYPHEN_REGEX = /\b[2-9]\d{3}-\d{4}-\d{4}\b/g;
export const AADHAAR_KEYWORD_REGEX = /(?:aadhaar|uidai|uid|adhar)(?:\s*(?:no|number|#)?)?\s*[:\-]?\s*([2-9]\d{11})\b/gi;

// 3. Indian Mobile Numbers: +91 98765 43210, +91-9876543210, 9876543210
export const PHONE_REGEX = /(?:\+91[\s\-]?)?[6-9]\d{4}[\s\-]?\d{5}\b/g;

// 4. Email Addresses
export const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

// 5. Bank Account Numbers: 9 to 18 digits preceded by account cues
export const BANK_ACCOUNT_REGEX = /(?:a\/c|account(?:\s*no|\s*number)?|bank\s*a\/c|bank\s*account)\s*[:.\-]?\s*(\b\d{9,18}\b)/gi;

// 6. Indian Financial System Code (IFSC): 4 letters + 0 + 6 alphanumeric (e.g. SBIN0001234)
export const IFSC_REGEX = /\b[A-Z]{4}0[A-Z0-9]{6}\b/g;

/**
 * Redacts all detected PII patterns from text
 */
export function maskPii(text: string): MaskingResult {
  if (!text) {
    return {
      maskedText: '',
      maskedCount: 0,
      summary: { pan: 0, aadhaar: 0, phone: 0, email: 0, bankAccount: 0, ifsc: 0, total: 0 },
    };
  }

  let masked = text;
  let panCount = 0;
  let aadhaarCount = 0;
  let phoneCount = 0;
  let emailCount = 0;
  let bankCount = 0;
  let ifscCount = 0;

  // 1. Mask Email
  masked = masked.replace(EMAIL_REGEX, () => {
    emailCount++;
    return '[EMAIL-MASKED]';
  });

  // 2. Mask PAN (case-sensitive uppercase PAN pattern)
  masked = masked.replace(PAN_REGEX, () => {
    panCount++;
    return '[PAN-MASKED]';
  });

  // 3. Mask Aadhaar with spaces or hyphens
  masked = masked.replace(AADHAAR_SPACED_REGEX, () => {
    aadhaarCount++;
    return '[AADHAAR-MASKED]';
  });
  masked = masked.replace(AADHAAR_HYPHEN_REGEX, () => {
    aadhaarCount++;
    return '[AADHAAR-MASKED]';
  });
  masked = masked.replace(AADHAAR_KEYWORD_REGEX, (full, num) => {
    aadhaarCount++;
    return full.replace(num, '[AADHAAR-MASKED]');
  });

  // 4. Mask Bank Accounts (must precede generic phone to catch account numbers)
  masked = masked.replace(BANK_ACCOUNT_REGEX, (full, accNum) => {
    bankCount++;
    return full.replace(accNum, '[BANK-A/C-MASKED]');
  });

  // 5. Mask IFSC Code
  masked = masked.replace(IFSC_REGEX, () => {
    ifscCount++;
    return '[IFSC-MASKED]';
  });

  // 6. Mask Indian Phone Numbers
  masked = masked.replace(PHONE_REGEX, () => {
    phoneCount++;
    return '[PHONE-MASKED]';
  });

  const total = panCount + aadhaarCount + phoneCount + emailCount + bankCount + ifscCount;

  return {
    maskedText: masked,
    maskedCount: total,
    summary: {
      pan: panCount,
      aadhaar: aadhaarCount,
      phone: phoneCount,
      email: emailCount,
      bankAccount: bankCount,
      ifsc: ifscCount,
      total,
    },
  };
}

/**
 * Convenient shorthand to get sanitized string
 */
export function sanitizeTextForNetwork(rawText: string): string {
  return maskPii(rawText).maskedText;
}
