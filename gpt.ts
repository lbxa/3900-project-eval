import OpenAI from 'openai';
import projects from './projects.json';
import path from "path";
import { extractPDFText } from './pdf';
import { type Project, type Evaluation, isValidProjectIdentifier } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function evaluateProject(project: Project): Promise<Evaluation> {
  const prompt = `
As an impartial evaluator, please assess the following final year computer science project proposal for students in Sydney, Australia. 
Evaluate the project holistically, considering multiple factors to ensure a fair and critical assessment. Use the following criteria:

1. Impact (1-5): How significant is the problem being addressed? Consider the potential benefit to society, industry, or academic advancement. 
   Be harsh with academic advancement, there are instances of projects where the academic proposing it could find an off the shelf solution 
   with more careful research
2. Feasibility (1-5): How realistic is it for a team of 6 computer science students with diverse backgrounds to complete this in 10 weeks? 
   Assume intermediate skills can be acquired during the project.
3. Scalability (1-5): Can the project be expanded or adapted to serve a larger audience or solve related problems in the future? 

For each criterion, use the following scale:
1 = Poor, 2 = Below Average, 3 = Average, 4 = Good, 5 = Excellent

Project ID: ${project.id}
Project Title: ${project.title}
Project details: ${project.details}

Please provide your evaluation in the following format (do not add any markdown formatting, plain text only):
Impact Score: [1-5]
Feasibility Score: [1-5]
Scalability Score: [1-5]

Strengths: 
- [List at least 2 key strengths]

Weaknesses: 
- [List at least 2 key weaknesses or challenges]

Suggestions for Improvement:
- [Provide at least 2 constructive suggestions]

Ensure your evaluation is balanced, considering both the positive aspects and potential challenges of the project. Be specific in your feedback to help students understand the reasoning behind the scores and how they might improve their proposal.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.choices[0].message?.content;
  console.log(content)
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
    Impact: e.impactScore,
    Feasibility: e.feasibilityScore,
    Scalability: e.scalabilityScore,
    Overall: e.overallScore
  })));
}
