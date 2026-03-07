const prisma = require('../db');

const getGraphData = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            where: { status: 'PUBLISHED' } // Only show published projects in the graph
        });
        const drafts = await prisma.project.findMany({
            where: { status: 'DRAFT' }
        });

        const allProjects = [...projects, ...drafts];

        const nodes = [
            { id: 'owner', group: 0, label: 'Owner', val: 10, color: '#ffffff' }
        ];

        const links = [];
        const techSet = new Set();

        allProjects.forEach(project => {
            // Add Project Node
            nodes.push({
                id: project.id,
                group: project.status === 'PUBLISHED' ? 3 : 4,
                label: project.title,
                val: 5,
                color: project.status === 'PUBLISHED' ? '#22c55e' : '#eab308'
            });

            // Link Project to Owner
            links.push({ source: 'owner', target: project.id, value: 2 });

            // Add Technology Nodes and Links
            project.technologies.forEach(tech => {
                const techId = tech.toLowerCase();
                if (!techSet.has(techId)) {
                    nodes.push({
                        id: techId,
                        group: 1,
                        label: tech,
                        val: 4,
                        color: '#06b6d4'
                    });
                    techSet.add(techId);
                    
                    // Link Owner to Tech (as a skill)
                    links.push({ source: 'owner', target: techId, value: 1 });
                }

                // Link Project to Tech
                links.push({ source: project.id, target: techId, value: 1 });
            });
        });

        res.json({ nodes, links });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch graph data.' });
    }
};

module.exports = {
    getGraphData
};
