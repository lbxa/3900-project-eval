import OpenAI from 'openai';
import projects from './projects.json';
import path from "path";
import fs from "fs";
import { extractPDFText } from './pdf';
import { type Project, type Evaluation, isValidProjectIdentifier } from './types';
import { writeCsv } from './csv';
import { prompt } from './prompt';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function evaluateProject(project: Project): Promise<Evaluation> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt(project)}],
  });

  const content = response.choices[0].message?.content;

  // record markdown summary of the llm results
  if (content) {
    const outputFilePath = path.join(process.cwd(), 'README.md');
    fs.appendFileSync(outputFilePath, [project.title, content].join("\n") + '\n\n', 'utf-8');
  }

  if (!content) {
    throw new Error('No response from GPT-4');
  }

  const impactScore = parseInt(content.match(/Impact Score: (\d)/)?.[1] || '0');
  const feasibilityScore = parseInt(content.match(/Feasibility Score: (\d)/)?.[1] || '0');
  const scalabilityScore = parseInt(content.match(/Scalability Score: (\d)/)?.[1] || '0');
  let overallScore = (impactScore + feasibilityScore + scalabilityScore) / 3;
  overallScore = +overallScore.toFixed(2);

  const strengths = content.match(/Strengths:\s*((?:- .*\n?)+)/)?.[1].split('\n').filter(s => s.trim() !== '').map(s => s.trim().replace(/^- /, '')) || [];
  const weaknesses = content.match(/Weaknesses:\s*((?:- .*\n?)+)/)?.[1].split('\n').filter(s => s.trim() !== '').map(s => s.trim().replace(/^- /, '')) || [];
  const suggestions = content.match(/Suggestions for Improvement:\s*((?:- .*\n?)+)/)?.[1].split('\n').filter(s => s.trim() !== '').map(s => s.trim().replace(/^- /, '')) || [];

  return {
    projectId: project.id,
    projectName: project.title,
    impactScore,
    feasibilityScore,
    scalabilityScore,
    overallScore,
    strengths,
    weaknesses,
    suggestions,
  };
}

export async function llmEval() {
  // reset file summary file during each run
  fs.writeFileSync(path.join(process.cwd(), 'README.md'), "")

  const evaluations: Evaluation[] = [];
  for (const project of projects) {
    const projectId = project.title.substring(0, 3);
    if (isValidProjectIdentifier(projectId)) {
      const pdfText = await extractPDFText(path.resolve(__dirname, "pdfs"), projectId)
      if (pdfText) {
        try {
            const evaluation = await evaluateProject({id: projectId, title: project.title, details: pdfText});
            evaluations.push(evaluation)
            console.log(`Evaluated project ${projectId}`);
            console.log(`Impact: ${evaluation.impactScore}, Feasibility: ${evaluation.feasibilityScore}, Scalability: ${evaluation.scalabilityScore}`);
            console.log(`Overall Score: ${evaluation.overallScore}`);
            console.log('Strengths:', evaluation.strengths);
            console.log('Weaknesses:', evaluation.weaknesses);
            console.log('Suggestions:', evaluation.suggestions);
            console.log('---');
          } catch (error) {
            console.error(`Error evaluating project ${projectId}:`, error);
          }
      }
    } else {
      console.error("No PDF text was extracted")
    }
  }

  console.table(evaluations.map(e => ({
    ID: e.projectId,
    name: e.projectName,
    Impact: e.impactScore,
    Feasibility: e.feasibilityScore,
    Scalability: e.scalabilityScore,
    Overall: e.overallScore
  })));

  writeCsv(evaluations);
}
