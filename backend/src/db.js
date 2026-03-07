const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
console.log('[Debug] db.js DATABASE_URL:', process.env.DATABASE_URL);

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres"
    }
  }
});

module.exports = prisma;
