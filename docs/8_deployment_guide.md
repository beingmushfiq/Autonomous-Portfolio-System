# Autonomous Portfolio System: Deployment Guide

To achieve high availability, low latency, and robust automation, the system relies on a modern serverless and managed-services stack.

---

## 1. Hosting Architecture Overview

1. **Frontend (Next.js Application)**: Vercel
   - Edge network for fast global delivery.
   - Built-in ISR (Incremental Static Regeneration) support to update the UI when the backend generates new content.
2. **Backend API (Node.js/Express or Next.js API Routes)**: Railway or Render
   - Needed for long-running cron jobs and event webhooks that Vercel serverless functions might time out on.
3. **Database (Relational)**: Supabase (PostgreSQL)
   - Handles the core application schema, Prisma integration, and user authentication.
4. **Database (Graph)**: Neo4j AuraDB (Managed Cloud)
   - Hosts the knowledge graph and executes Cypher queries.
5. **Worker Queue**: Upstash (Redis)
   - Used by BullMQ to manage the background automation tasks for the webhooks and AI generation.

---

## 2. Infrastructure Setup Steps

### Step A: Database Provisioning
1. **PostgreSQL**: Create a project in [Supabase](https://supabase.com/). Retrieve the `DATABASE_URL`. run `npx prisma db push` to initialize schema.
2. **Neo4j Aura**: Create a free-tier AuraDB instance at [neo4j.com](https://cloud.neo4j.io/). Retrieve the `NEO4J_URI`, `NEO4J_USERNAME`, and `NEO4J_PASSWORD`.
3. **Redis**: Create a free database on [Upstash](https://upstash.com/). Retrieve the `REDIS_URL` containing credentials.

### Step B: Environment Variables Configuration
Ensure the following variables are set across your deployment portals:

```env
# Databases
DATABASE_URL="postgres://postgres.xxx:pass@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
NEO4J_URI="neo4j+s://xxxxx.databases.neo4j.io"
NEO4J_USERNAME="neo4j"
NEO4J_PASSWORD="password"
REDIS_URL="rediss://default:xxxx@epic-redis.upstash.io:30000"

# Secret Keys
OPENAI_API_KEY="sk-proj-xxxxx"
GITHUB_WEBHOOK_SECRET="your_custom_secret_here"
NEXTAUTH_SECRET="random_string_for_nextauth"
```

---

## 3. Application Deployment

### Deploying the Frontend (Vercel)
1. Push the `frontend/` codebase to a GitHub repository.
2. Sign in to Vercel, click "Add New Project", and import the repository.
3. Vercel will automatically detect Next.js.
4. Add the frontend-specific environment variables in the Vercel dashboard.
5. Click **Deploy**. Vercel will build the React application and deploy to the edge.

### Deploying the Backend & Workers (Railway)
1. Install the Railway CLI or use the web dashboard.
2. Import the `backend/` codebase from GitHub.
3. Provision a "NodeJS Service" on Railway.
4. Input the environment variables.
5. Railway will automatically install dependencies and run the start script defined in `package.json` (e.g., `node src/index.js`).
6. Ensure the webhook endpoint (`/api/webhooks/github`) is publicly accessible.

---

## 4. Hooking Up The Automation

1. **GitHub Integration**:
   - Go to your personal GitHub settings, or a specific repository settings.
   - Click "Webhooks" -> "Add webhook".
   - Payload URL: Set to your Railway backend URL (e.g., `https://portfolio-backend-production.up.railway.app/api/webhooks/github`).
   - Content type: `application/json`.
   - Secret: Must match `GITHUB_WEBHOOK_SECRET`.
   - Select specific events: "Pushes", "Releases".

2. **Triggering First Initial Sync**:
   - Use the Dashboard UI to manually trigger an initial sync, scanning your public repositories and writing the initial Neo4j graph nodes.

## 5. Maintenance and Logging
- View backend automation errors inside Railway logs.
- Manage PostgreSQL data visually within the Supabase dashboard.
- Update Neo4j models manually using the AuraDB workspace visualizer if necessary.
