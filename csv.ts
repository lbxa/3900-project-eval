import fs from "fs";
import path from "path";
import type { Evaluation } from "./types";

function convertToCsv(data: Evaluation[]) {
  const header = ['ID', 'Name', 'Impact', 'Feasibility', 'Scalability', 'Overall'];
  const rows = data.map(e => [
    e.projectId,
    e.projectName,
    e.impactScore,
    e.feasibilityScore,
    e.scalabilityScore,
    e.overallScore
  ]);

  return [header, ...rows].map(row => row.join(',')).join('\n');
}

export const writeCsv = (evaluations: Evaluation[]) => {
  const csvData = convertToCsv(evaluations);
  const outputFilePath = path.join(process.cwd(), 'evaluations.csv');
  fs.writeFileSync(outputFilePath, csvData, 'utf-8');
}