const { generateInsights, generateCaseStudy } = require('../services/aiEngine');
const prisma = require('../db');

/**
 * AIController
 * Handles manual AI triggers and insight management.
 */

const refreshInsights = async (req, res) => {
    const { userId } = req.body;
    try {
        const insights = await generateInsights(userId || 'default-owner');
        res.json({ insights });
    } catch (error) {
        res.status(500).json({ error: 'Failed to refresh insights.' });
    }
};

const reAnalyzeProject = async (req, res) => {
    const { id } = req.params;
    try {
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project) return res.status(404).json({ error: 'Project not found.' });

        // Trigger AI analysis again
        const aiDraft = await generateCaseStudy(
            project.title, 
            [], // Mocking commits for simplicity in re-analysis
            project.technologies
        );

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                problem: aiDraft.problem,
                solution: aiDraft.solution,
                devProcess: aiDraft.devProcess,
                technologies: aiDraft.technologies,
            }
        });

        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to re-analyze project.' });
    }
};

module.exports = {
    refreshInsights,
    reAnalyzeProject
};
