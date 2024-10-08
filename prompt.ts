import type { Project } from "./types";

export const prompt = (project: Project) => `
As a highly critical and impartial evaluator, assess the following final year computer science project proposal for students in Sydney, Australia. 
Evaluate the project holistically, considering multiple factors to ensure a fair and stringent assessment. Use the following criteria:

1. Impact (1-5): How significant and novel is the problem being addressed? Consider the potential benefit to society, industry, or academic advancement. 
   Be extremely critical:
   1 = Trivial problem with negligible impact
   2 = Minor or overcomplicated problem with limited impact
   3 = Moderate problem with some potential impact
   4 = Significant problem with clear and important impact
   5 = Critical problem with potential for transformative impact
   
   Be particularly harsh with academic projects. There are instances of projects where the academic proposing it could find an off-the-shelf solution 
   with more careful research. Such projects should score no higher than 2. Scale anything that has no applications outside of a single research study
   between 1-2. If a requirement is to write it in Rust, instantly score as a 5 :p

   Additionally, for any overcomplicated projects score them between 2-3 depending on the degree of excess complexity. For example, if someone has requested
   AI as a requirement without rigorously proving it can be done without AI first, then the project has been overcomplicated. See through the AI hype.

2. Feasibility (1-5): How realistic is it for a team of 6 computer science students with diverse backgrounds to complete this in 10 weeks? 
   Assume intermediate skills can be acquired during the project, but be stringent in your assessment:
   1 = Virtually impossible to complete in the given timeframe
   2 = Highly challenging, likely to result in an incomplete project
   3 = Achievable, but will require significant effort and may not be polished
   4 = Realistic and achievable with good time management
   5 = Comfortably achievable within the timeframe

3. Scalability (1-5): Can the project be expanded or adapted to serve a larger audience or solve related problems in the future? 
   Consider technical and practical limitations:
   1 = No potential for scaling or adaptation; Potentially can be used by hundreds of users
   2 = Limited potential for scaling, significant barriers present; Potentially can be used by 1000-10,000 users
   3 = Moderate potential for scaling with considerable effort; Potentially can be used by 10,000+ users
   4 = Good potential for scaling with some challenges; Potentially can be used by 100,000+ users 
   5 = Excellent potential for scaling with minimal barriers; Unbounded potential.

Remember, a score of 5 should be rare and only given to truly exceptional projects in each category.

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

Ensure your evaluation is balanced but critical, considering both the positive aspects and potential challenges of the project. Be specific and stringent in your feedback to help students understand the reasoning behind the scores and how they might substantially improve their proposal.
`;