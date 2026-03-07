const prisma = require('../db');

/**
 * LogController
 * Handles fetching activity logs for the live event stream.
 */

const getLogs = async (req, res) => {
    try {
        const logs = await prisma.dashboardLog.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' }
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs.' });
    }
};

module.exports = {
    getLogs
};
