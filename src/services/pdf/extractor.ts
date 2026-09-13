import * as pdfjsLib from 'pdfjs-dist';
import type { ExtractedPage } from '../../types';

// Configure PDF.js worker in Vite environment
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<{
  pageCount: number;
  extractedPages: ExtractedPage[];
}> {
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;
  const extractedPages: ExtractedPage[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    extractedPages.push({
      pageNumber: pageNum,
      text: pageText,
    });
  }

  return {
    pageCount,
    extractedPages,
  };
}

export { pdfjsLib };
