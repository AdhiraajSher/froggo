import { jsPDF } from 'jspdf';
import { FroggoFile } from '../App';
import { RoleType } from './types';

/**
 * Generates a clean, readable, professional PDF contract audit report
 */
export function exportContractPdf(file: FroggoFile, role: RoleType): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - margin - 12) {
      doc.addPage();
      y = margin;
      drawPageHeader();
    }
  }

  function drawPageHeader() {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 130, 140);
    doc.text('Froggo Contract Review · Educational Report', margin, y);
    doc.text(new Date().toLocaleDateString('en-IN'), pageWidth - margin, y, { align: 'right' });
    y += 5;
    doc.setDrawColor(210, 220, 215);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  }

  // 1. Cover / Top Header
  drawPageHeader();

  // Brand Pill
  doc.setFillColor(15, 118, 110); // Emerald #0F766E
  doc.roundedRect(margin, y, 42, 6, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('FROGGO LEGAL AUDIT', margin + 3.5, y + 4.2);
  y += 10;

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(20, 30, 25);
  const titleLines = doc.splitTextToSize(file.title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7 + 2;

  // Metadata Bar
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90, 100, 95);
  doc.text(
    `Perspective: ${role} Lens   |   Document ID: ${file.id}   |   Date: ${new Date().toLocaleDateString('en-IN')}`,
    margin,
    y
  );
  y += 7;

  // 2. Score Summary Box
  checkPageBreak(35);
  doc.setFillColor(245, 250, 247);
  doc.setDrawColor(200, 225, 215);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 118, 110);
  doc.text('OVERALL CONTRACT RISK ESTIMATE', margin + 5, y + 7);

  doc.setFontSize(20);
  doc.setTextColor(20, 30, 25);
  doc.text(`${file.score}`, margin + 5, y + 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 120, 115);
  doc.text('/ 100', margin + 20, y + 18);

  const verdict =
    file.score >= 70 ? 'High Caution Required' : file.score >= 45 ? 'Elevated Terms' : 'Moderate Terms';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(file.score >= 70 ? 180 : 15, file.score >= 70 ? 40 : 118, file.score >= 70 ? 40 : 110);
  doc.text(`Rating: ${verdict}`, margin + 50, y + 14);

  const clausesCount = file.clauses.length;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(90, 100, 95);
  doc.text(`${clausesCount} clauses analyzed under Indian contract guidelines.`, margin + 50, y + 20);
  y += 32;

  // Point breakdown if present
  if (file.scoreBreakdown && file.scoreBreakdown.penalties.length > 0) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 30, 25);
    doc.text('Penalty Points Breakdown:', margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    for (const penalty of file.scoreBreakdown.penalties) {
      checkPageBreak(8);
      doc.setTextColor(180, 40, 40);
      doc.text(`+${penalty.points} pts`, margin + 2, y);
      doc.setTextColor(40, 50, 45);
      doc.text(`— ${penalty.title}`, margin + 18, y);
      y += 5;
    }
    y += 4;
  }

  // 3. Indian Statutory Checks Section
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 118, 110);
  doc.text('Indian Statutory Compliance Audit', margin, y);
  y += 6;

  const checks = [
    { label: 'Section 27 (Indian Contract Act - Non-Competes)', status: file.indiaStatutoryChecks.sec27Status },
    { label: 'MSME 45-Day Payment Rule (MSMED Act 2006)', status: file.indiaStatutoryChecks.msme45DayStatus },
    { label: 'Section 194J TDS Deduction Rate', status: file.indiaStatutoryChecks.tds194JStatus },
    ...(file.indiaStatutoryChecks.sec43BhStatus
      ? [{ label: 'Section 43B(h) Income Tax Deduction Rule', status: file.indiaStatutoryChecks.sec43BhStatus }]
      : []),
    ...(file.indiaStatutoryChecks.dpdpStatus
      ? [{ label: 'DPDP Act 2023 Data Protection Audit', status: file.indiaStatutoryChecks.dpdpStatus }]
      : []),
  ];

  for (const check of checks) {
    checkPageBreak(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 40, 35);
    doc.text(`• ${check.label}:`, margin, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 90, 85);
    const splitStatus = doc.splitTextToSize(check.status, contentWidth - 4);
    doc.text(splitStatus, margin + 4, y);
    y += splitStatus.length * 4 + 3;
  }
  y += 4;

  // 4. Clause-by-Clause Findings
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 118, 110);
  doc.text('Clause-by-Clause Findings & Redlines', margin, y);
  y += 7;

  file.clauses.forEach((clauseText, i) => {
    const severity = file.clauseSeverities?.[i] || 'not_assessed';
    const plain = file.plain?.[i] || '';
    const question = file.questions?.[i] || '';
    const roleText = file.roleImpact?.[role]?.[i] || '';

    checkPageBreak(35);

    // Clause Header Line
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(20, 30, 25);
    const clauseId = `Clause 0${i + 1}`;
    doc.text(clauseId, margin, y);

    // Severity badge text
    doc.setFontSize(8);
    const sevColor =
      severity === 'high'
        ? [185, 28, 28]
        : severity === 'medium'
        ? [180, 83, 9]
        : severity === 'safe'
        ? [4, 120, 87]
        : [100, 116, 139];
    doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
    doc.text(`[${severity.toUpperCase().replace('_', ' ')}]`, margin + 26, y);
    y += 5;

    // Original Text Excerpt
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(90, 100, 95);
    const originalLines = doc.splitTextToSize(`Original: "${clauseText}"`, contentWidth);
    doc.text(originalLines, margin, y);
    y += originalLines.length * 3.8 + 2;

    // Plain English Meaning
    if (plain) {
      checkPageBreak(12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 40, 35);
      const plainLines = doc.splitTextToSize(`Plain Meaning: ${plain}`, contentWidth);
      doc.text(plainLines, margin, y);
      y += plainLines.length * 3.8 + 2;
    }

    // Role Impact
    if (roleText) {
      checkPageBreak(12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 118, 110);
      const roleLines = doc.splitTextToSize(`Why it matters to a ${role}: ${roleText}`, contentWidth);
      doc.text(roleLines, margin, y);
      y += roleLines.length * 3.8 + 2;
    }

    // Suggested Question / Edit
    if (question) {
      checkPageBreak(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(29, 78, 216); // Blue
      const qLines = doc.splitTextToSize(`Suggested Negotiation Question: "${question}"`, contentWidth);
      doc.text(qLines, margin, y);
      y += qLines.length * 3.8 + 4;
    }

    // Divider line between clauses
    doc.setDrawColor(230, 235, 232);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  });

  // 5. Missing Clauses Section
  if (file.missing && file.missing.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 118, 110);
    doc.text('Missing Protective Clauses to Request', margin, y);
    y += 6;

    for (const item of file.missing) {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 40, 35);
      doc.text(`+ ${item}`, margin, y);
      y += 4;

      const wording = file.missingWording?.[item];
      if (wording) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(70, 80, 75);
        const wordingLines = doc.splitTextToSize(`Recommended wording: "${wording}"`, contentWidth - 4);
        doc.text(wordingLines, margin + 4, y);
        y += wordingLines.length * 3.8 + 3;
      }
    }
  }

  // 6. Prominent Legal Disclaimer Footer on Last Page
  checkPageBreak(25);
  y += 4;
  doc.setFillColor(248, 250, 248);
  doc.setDrawColor(215, 225, 220);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 40, 40);
  doc.text('LEGAL NOTICE & DISCLAIMER', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80, 90, 85);
  const disclaimerText =
    'This automated analysis report is generated by Froggo for educational, informational, and self-review purposes only. It does not constitute formal legal advice, representation, or certification under the Advocates Act, 1961. Consult an enrolled Indian advocate for binding legal counsel.';
  const discLines = doc.splitTextToSize(disclaimerText, contentWidth - 8);
  doc.text(discLines, margin + 4, y + 9);

  // Save the PDF
  const safeFilename = file.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  doc.save(`froggo-report-${safeFilename}.pdf`);
}
