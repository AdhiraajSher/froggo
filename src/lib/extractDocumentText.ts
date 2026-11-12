/**
 * Extraction module for contracts in PDF, DOCX, TXT, and MD formats.
 * Implements specific error handling for:
 * - Files exceeding 10 MB
 * - Legacy .doc binary files (unsupported)
 * - Password-protected PDFs
 * - Scanned / image-only PDFs lacking a text layer
 * - Empty text extractions
 */

export interface ExtractionResult {
  text: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'md';
  pageCount?: number;
  wordCount: number;
}

export async function extractDocumentText(
  file: File | { name: string; size: number; arrayBuffer: () => Promise<ArrayBuffer>; text?: () => Promise<string> }
): Promise<ExtractionResult> {
  const fileName = file.name || 'document';
  const size = file.size || 0;

  // 1. Size constraint: maximum 10 MB
  if (size > 10 * 1024 * 1024) {
    throw new Error(`File "${fileName}" exceeds the 10 MB limit. Please select a smaller contract file.`);
  }

  const extensionMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extensionMatch ? extensionMatch[1].toLowerCase() : '';

  // 2. Reject legacy .doc with a clear, helpful message
  if (ext === 'doc') {
    throw new Error(
      `Legacy Word (.doc) files cannot be parsed directly in the browser. Please open the file in Word, Google Docs, or LibreOffice and save it as .docx or .pdf before uploading.`
    );
  }

  // 3. Plain text and Markdown (.txt, .md)
  if (ext === 'txt' || ext === 'md') {
    let rawText = '';
    if (typeof file.text === 'function') {
      rawText = await file.text();
    } else {
      const buffer = await file.arrayBuffer();
      rawText = new TextDecoder('utf-8').decode(buffer);
    }

    const trimmed = rawText.trim();
    if (!trimmed) {
      throw new Error(`The file "${fileName}" is completely empty. Please upload a file containing contract clauses.`);
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    return {
      text: trimmed,
      fileName,
      fileType: ext === 'md' ? 'md' : 'txt',
      wordCount: words.length,
    };
  }

  // 4. Word Document (.docx)
  if (ext === 'docx') {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const options =
        typeof Buffer !== 'undefined'
          ? { buffer: Buffer.from(arrayBuffer) }
          : { arrayBuffer };
      const result = await mammoth.extractRawText(options as any);
      const rawText = (result.value || '').trim();

      if (!rawText) {
        throw new Error(
          `The Word document "${fileName}" contains no readable text layer or is empty. Please verify the document contents.`
        );
      }

      const words = rawText.split(/\s+/).filter(Boolean);
      return {
        text: rawText,
        fileName,
        fileType: 'docx',
        wordCount: words.length,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Word document')) {
        throw err;
      }
      throw new Error(
        `Failed to parse DOCX file "${fileName}": ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // 5. Adobe PDF (.pdf)
  if (ext === 'pdf') {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      // Set worker source if in browser environment
      if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions?.workerSrc) {
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
        } catch {
          // Worker fallback if CDN blocked
        }
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      });

      let pdfDoc;
      try {
        pdfDoc = await loadingTask.promise;
      } catch (pdfErr: any) {
        if (pdfErr?.name === 'PasswordException' || (pdfErr?.message && /password/i.test(pdfErr.message))) {
          throw new Error(
            `The PDF "${fileName}" is password-protected. Please remove the password encryption before uploading.`
          );
        }
        throw pdfErr;
      }

      const numPages = pdfDoc.numPages;
      const textPieces: string[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => (typeof item?.str === 'string' ? item.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (pageText) {
          textPieces.push(pageText);
        }
      }

      const fullText = textPieces.join('\n\n').trim();

      // Detect scanned or image-only PDF
      if (!fullText) {
        throw new Error(
          `The PDF "${fileName}" appears to be a scanned or image-only document with no digital text layer. Froggo requires contracts with selectable text (OCR is not supported).`
        );
      }

      const words = fullText.split(/\s+/).filter(Boolean);
      return {
        text: fullText,
        fileName,
        fileType: 'pdf',
        pageCount: numPages,
        wordCount: words.length,
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(`Unable to read PDF file "${fileName}". The file may be corrupted.`);
    }
  }

  // 6. Unsupported file type
  throw new Error(
    `Unsupported file format for "${fileName}". Please upload a contract in .pdf, .docx, .txt, or .md format.`
  );
}
