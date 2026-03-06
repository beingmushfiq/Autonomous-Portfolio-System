# Autonomous Portfolio System: Automation Workflows

The Automation Engine is the heartbeat of the Autonomous Portfolio System. It continuously monitors external sources, ingests data, and orchestration AI content generation without requiring direct input from the owner.

---

## 1. Project Auto-Generation Workflow

This workflow triggers when the portfolio owner creates or updates a project in their development environment.

**Trigger:** GitHub Webhook (`push` to main branch, or `release` published).

**Steps:**
1. **Webhook Reception**: API endpoint receives the webhook payload.
2. **Relevance Filter**: Checks if the repository is tagged with `portfolio-visible` or ignores specific patterns (e.g., `*-test`).
3. **Data Extraction (Scraper Worker)**:
   - Fetches repository metadata (Name, Description, Stars, Forks).
   - Downloads `README.md`, `package.json` (or equivalent dependency files).
   - Fetches the last 10 significant commit messages.
4. **AI Processing Pipeline (AI Engine)**:
   - *Prompt 1 (Analysis)*: Analyzes technologies used based on dependencies.
   - *Prompt 2 (Summarization)*: Generates a human-readable "Case Study" draft:
     - Problem Statement (inferred from README).
     - Solution & Stack.
     - Development Process (inferred from commits).
5. **Database Transaction**:
   - Save drafted project to relational DB with `status: PENDING_REVIEW`.
   - Update Graph DB to link new project to existing or new technology nodes.
6. **Notification**: Send a push notification or email to the Owner Dashboard indicating a new project entry requires approval.

---

## 2. AI Content & Article Generation Workflow

This workflow transforms project updates and notes into publishable content.

**Trigger:** Scheduled Task (Weekly) OR "Project Published" event.

**Steps:**
1. **Content Aggregation**: Fetch recently completed projects and private development notes inputted by the owner.
2. **Topic Ideation (AI Engine)**:
   - AI evaluates recent work and suggests 3 actionable article topics (e.g., "How I built a scalable AI pipeline using Temporal").
3. **Draft Generation**:
   - If auto-generation is enabled, AI selects the highest-scoring topic and generates a comprehensive technical article or tutorial.
4. **Content Distribution Preparation**:
   - AI slices the long-form article into:
     - A 280-character Twitter thread.
     - A LinkedIn post with appropriate professional tone and hashtags.
5. **Dashboard Delivery**: Drafts are placed in the "Content Suggestions" queue on the owner's dashboard.

---

## 3. Knowledge Graph Maintenance Workflow

Ensures the 3D visualization is always up-to-date and relationships correctly reflect the owner's evolving skill set.

**Trigger:** Any Creation/Update event (New Project, New Article, Edited Skill).

**Steps:**
1. **Entity Extraction (AI/NLP)**: Scan the new content text to identify standard terms (e.g., "PostgreSQL", "React", "System Design").
2. **Graph Upsert (Neo4j)**:
   - `MERGE` nodes for identified entities.
   - `MERGE` edges connecting the new content to these entities.
   - Update Edge Weights: If a technology is used frequently, increase the `weight` property of the `[User]-KNOWS->[Technology]` edge.
3. **Cache Invalidation**: Trigger frontend ISR cache flush so the 3D webGL visualization fetches the newly weighted graph.

---

## 4. Opportunity & Visitor Intent Workflow

Real-time analysis to connect the owner with valuable opportunities.

**Trigger:** Ongoing visitor session analytics.

**Steps:**
1. **Event Streaming**: UI telemetry (scroll depth, time spent on case studies, clicks on contact forms) sent to a lightweight analytics endpoint.
2. **Intent Classification (Edge AI)**:
   - Analyze behavior sequence. *Example: Visitor views multiple React/Next.js projects, clicks on 'Resume', and stays > 5 minutes.* -> **Intent: Recruiter / Hiring Manager**.
3. **Dynamic UI Adaptation**:
   - If Intent == 'Recruiter', the UI subtly highlights available work hours, PDF download links, and shifts the AI Assistant's initial prompt to: "Are you looking to hire? I can summarize [Owner's] experience."
4. **Opportunity Alert Generation**:
   - If engagement score breaches a threshold (e.g., 90/100), log an "Opportunity Signal" to the owner's dashboard with geolocation, intent type, and viewed technologies.
