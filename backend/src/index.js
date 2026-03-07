const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { handleGithubWebhook } = require('./services/githubWebhook');
const projectController = require('./controllers/ProjectController');
const logController = require('./controllers/LogController');
const aiController = require('./controllers/AIController');
const articleController = require('./controllers/ArticleController');
const graphController = require('./controllers/GraphController');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(bodyParser.json());

// --- GitHub Webhook ---
app.post('/api/webhooks/github', async (req, res) => {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    if (event === 'push') {
        console.log(`[Webhook] Received push for: ${payload.repository.name}`);
        handleGithubWebhook(payload); // Async processing
        res.status(202).json({ message: 'Processing started.' });
    } else {
        res.status(200).json({ message: 'Ignored.' });
    }
});

// --- Dashboard API ---
// Projects
app.get('/api/admin/projects', projectController.getReviewQueue);
app.patch('/api/admin/projects/:id/approve', projectController.approveProject);
app.put('/api/admin/projects/:id', projectController.updateProject);

// Articles
app.get('/api/admin/articles', articleController.getArticles);
app.post('/api/admin/projects/:projectId/generate-article', articleController.generateFromProject);
app.patch('/api/admin/articles/:id/publish', articleController.publishArticle);

// AI Controls
app.post('/api/admin/ai/insights', aiController.refreshInsights);
app.post('/api/admin/projects/:id/re-analyze', aiController.reAnalyzeProject);

// System Logs
app.get('/api/admin/logs', logController.getLogs);

// Knowledge Graph
app.get('/api/admin/graph', graphController.getGraphData);

app.listen(PORT, () => {
    console.log(`[Autonomous Portfolio] Backend engine running on port ${PORT}`);
});
