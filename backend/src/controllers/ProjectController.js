const prisma = require('../db');

/**
 * ProjectController
 * Handles CRUD operations for Projects, specifically for the Admin Dashboard.
 */

// Fetch all projects (Drafts first)
const getReviewQueue = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(projects);
    } catch (error) {
        console.error('[ProjectController] Error fetching queue:', error);
        res.status(500).json({ error: 'Failed to fetch projects.' });
    }
};

// Approve a project (Change status to PUBLISHED)
const approveProject = async (req, res) => {
    const { id } = req.params;
    try {
        const project = await prisma.project.update({
            where: { id },
            data: { publicationStatus: 'PUBLISHED' }
        });
        
        // Log the action
        await prisma.dashboardLog.create({
            data: {
                type: 'SYSTEM_UPDATE',
                message: `Project "${project.title}" approved and published.`,
            }
        });

        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve project.' });
    }
};

// Update project content (Case study refinement)
const updateProject = async (req, res) => {
    const { id } = req.params;
    const { title, description, problem, solution, technologies } = req.body;
    try {
        const project = await prisma.project.update({
            where: { id },
            data: { title, description, problem, solution, technologies }
        });
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project.' });
    }
};

module.exports = {
    getReviewQueue,
    approveProject,
    updateProject
};
