
export type ProjectIdentifier = `P${number}${number}`
export const isValidProjectIdentifier = (projectId: string): projectId is ProjectIdentifier => {
  return projectId.startsWith("P") && 
          Number.isInteger(Number(projectId[1])) ||
          Number.isInteger(Number(projectId[2]))
}


export interface Project {
  id: ProjectIdentifier;
  title: string;
  details: string;
}

export interface Evaluation {
  projectId: string;
  impactScore: number;
  feasibilityScore: number;
  scalabilityScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}