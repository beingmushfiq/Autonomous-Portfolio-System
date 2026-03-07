const prisma = require('../db');
const aiEngine = require('../services/aiEngine');

const getArticles = async (req, res) => {
    try {
        const articles = await prisma.article.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch articles.' });
    }
};

const generateFromProject = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const articleDraft = await aiEngine.generateArticle(project.title, project.description);
        
        const article = await prisma.article.create({
            data: {
                userId: project.userId,
                title: articleDraft.title,
                slug: `${project.slug}-deep-dive-${Date.now()}`,
                content: articleDraft.content,
                topic: articleDraft.topic,
                status: 'DRAFT'
            }
        });

        await prisma.dashboardLog.create({
            data: {
                userId: project.userId,
                type: 'AI_TASK',
                message: `Generated technical article for: ${project.title}`
            }
        });

        res.json(article);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate article.' });
    }
};

const publishArticle = async (req, res) => {
    const { id } = req.params;
    try {
        const article = await prisma.article.update({
            where: { id },
            data: { status: 'PUBLISHED', publishedAt: new Date() }
        });
        res.json(article);
    } catch (error) {
        res.status(500).json({ error: 'Failed to publish article.' });
    }
};

module.exports = {
    getArticles,
    generateFromProject,
    publishArticle
};
