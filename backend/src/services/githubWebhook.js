/**
 * githubWebhook.js
 * Handles the ingestion part of the Automation Engine
 */

const prisma = require('../db');
const { generateCaseStudy } = require('./aiEngine');

async function handleGithubWebhook(payload) {
  const repoName = payload.repository.name;
  const repoUrl = payload.repository.html_url;
  const commits = payload.commits.map(c => c.message);

  console.log(`[Automation Engine] Extracting metadata from ${repoName}...`);
  
  // Simulated extraction of package.json or go.mod
  const inferredDependencies = ['React', 'Node.js', 'PostgreSQL', 'TailwindCSS'];

  // 1. Ensure User exists (Default Portfolio Owner)
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Portfolio Owner',
        email: 'owner@example.com',
        githubUsername: payload.repository.owner.login,
        bio: 'Automated Portfolio Representative'
      }
    });
  }

  // 2. Trigger AI generation pipeline
  const aiDraft = await generateCaseStudy(repoName, commits, inferredDependencies);

  // 3. Save draft to PostgreSQL
  console.log(`[Database] Saving draft for ${repoName} to PostgreSQL...`);
  const project = await prisma.project.upsert({
    where: { slug: repoName.toLowerCase() },
    update: {
      description: aiDraft.problem,
      problem: aiDraft.problem,
      solution: aiDraft.solution,
      devProcess: aiDraft.devProcess,
      technologies: aiDraft.technologies,
      status: 'AUTO_GENERATED'
    },
    create: {
      userId: user.id,
      title: repoName,
      slug: repoName.toLowerCase(),
      description: aiDraft.problem,
      repositoryUrl: repoUrl,
      problem: aiDraft.problem,
      solution: aiDraft.solution,
      devProcess: aiDraft.devProcess,
      technologies: aiDraft.technologies,
      status: 'AUTO_GENERATED'
    }
  });
  
  // 4. Log the event
  await prisma.dashboardLog.create({
    data: {
      userId: user.id,
      type: 'SYSTEM_UPDATE',
      message: `Successfully ingested ${repoName}. New AI-generated draft is ready for review.`,
      metadata: { projectId: project.id, repoUrl }
    }
  });

  console.log(`[Notification] Alerting Owner Dashboard: New draft for ${repoName} is ready.`);
}

module.exports = {
  handleGithubWebhook
};
