/**
 * githubWebhook.js
 * Handles the ingestion part of the Automation Engine
 */

const { generateCaseStudy } = require('./aiEngine');

async function handleGithubWebhook(payload) {
  const repoName = payload.repository.name;
  const commits = payload.commits.map(c => c.message);

  console.log(`[Automation Engine] Extracting metadata from ${repoName}...`);
  
  // Simulated extraction of package.json or go.mod
  const inferredDependencies = ['React', 'Node.js', 'PostgreSQL'];

  // Trigger AI generation pipeline
  const caseStudyDraft = await generateCaseStudy(repoName, commits, inferredDependencies);

  console.log(`[Database] Saving draft for ${repoName} to PostgreSQL...`);
  // await prisma.project.create({ data: caseStudyDraft });
  
  console.log(`[Graph] Updating Neo4j: Merging Project node and Technology nodes...`);
  // await neo4j.run(...)

  console.log(`[Notification] Alerting Owner Dashboard of new draft ready for review.`);
}

module.exports = {
  handleGithubWebhook
};
