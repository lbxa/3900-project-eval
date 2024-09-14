import fs from "fs";
import path from "path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs"
import type { ProjectIdentifier } from "./types";

export const extractPDFText = async (pdfDir: string, projectId: ProjectIdentifier): Promise<string | null> => {
  const files = fs.readdirSync(pdfDir);

  const matchingFiles = files.filter(file => file.startsWith(projectId) && file.endsWith('.pdf'));
  if (matchingFiles.length > 0) {
    const pdfPath = path.join(pdfDir, matchingFiles[0]);
    
    const pdf = await getDocument({ data: new Uint8Array(fs.readFileSync(pdfPath)) }).promise;

    let extractedText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(' ');
      extractedText += pageText + '\n';
    }

    return extractedText;

  } else {
    console.error("No PDF found");
    return null;
  }
}