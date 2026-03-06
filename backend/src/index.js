const express = require('express');
const bodyParser = require('body-parser');

const { handleGithubWebhook } = require('./services/githubWebhook');
const { generateCaseStudy } = require('./services/aiEngine');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

// Main webhook endpoint from GitHub
app.post('/api/webhooks/github', async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  if (event === 'push') {
    // 1. Kick off automation workflow
    console.log(`[Webhook] Received push event for repo: ${payload.repository.name}`);
    await handleGithubWebhook(payload);
    
    // Acknowledgement
    res.status(202).json({ message: 'Push event processing started.' });
  } else {
    res.status(200).json({ message: 'Event ignored.' });
  }
});

// Admin Dashboard endpoint to fetch review queue
app.get('/api/admin/review-queue', (req, res) => {
  // Simulated database fetch for DRAFT projects
  res.json([
    {
      id: 'proj-1',
      title: 'Autonomous Portfolio System',
      status: 'PENDING_REVIEW',
      generatedSummary: 'A Next.js based portfolio system built to automate content generation...'
    }
  ]);
});

app.listen(PORT, () => {
  console.log(`[Autonomous Portfolio] Backend engine running on port ${PORT}`);
});
