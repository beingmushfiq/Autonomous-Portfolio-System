# Autonomous Portfolio System: System Architecture

The Autonomous Portfolio System operates as a continuously evolving digital identity platform. It is designed to minimize manual input while maximizing the professional visibility and credibility of the portfolio owner.

## High-Level Architecture Overview

The system is composed of four primary layers:
1. **Presentation Layer (Frontend)**: Immersive, dynamic user interface.
2. **Application Layer (Backend API & Automation Engines)**: The core logic, integrations, and event processing.
3. **Intelligence Layer (AI & Analytics)**: LLM integration, insight generation, and intent analysis.
4. **Data Layer (Storage & Graph)**: Relational data, vector embeddings, and a knowledge graph.

---

## 1. Presentation Layer (Frontend)
Built for performance, aesthetics, and engagement.

- **Framework**: Next.js (React) App Router for SSR/SSG and API routes.
- **Styling**: TailwindCSS for utility-first styling with a custom design system tailored for a premium, glassmorphic UI.
- **Animations**: Framer Motion for complex page transitions and micro-interactions; GSAP for scroll-based storytelling.
- **3D Visualization**: React Three Fiber and Three.js for rendering the interactive knowledge graph (skills constellations) and project networks.
- **State Management**: Zustand for lightweight global state (e.g., current visitor intent state, 3D camera coordinates).
- **Hosting**: Vercel (Edge network for fast global delivery).

## 2. Application Layer (Backend & Engines)
Handles business logic, background tasks, and coordination.

- **Framework**: Node.js (via Next.js API Routes for synchronous tasks, and separate workers for async tasks).
- **Automation Engine**: 
  - Listens to webhooks (GitHub pushed commits, Dev.to/Medium RSS feeds).
  - Uses Temporal.io or BullMQ (Redis) for managing complex, retriable workflows (e.g., "Ingest Commit -> Generate Summary -> Update Graph").
- **Content Distribution Engine**: API integrations with social platforms (LinkedIn, Twitter) to auto-post generated content.
- **Reputation Engine**: Aggregates metrics (views, stars, read time) to calculate a dynamic "credibility score".

## 3. Intelligence Layer (AI & Analytics)
The "brain" of the digital representative.

- **AI Provider**: OpenAI (GPT-4o) for high-quality text synthesis, summarization, and conversation.
- **AI Writing Engine**: Triggered by the Automation Engine to draft case studies, technical explanations, and tutorials from raw project data.
- **AI Assistant**: A RAG (Retrieval-Augmented Generation) chatbot embedded in the UI, answering visitor questions based purely on the portfolio's knowledge base.
- **Visitor Intent Analysis**: Edge middleware that analyzes navigation patterns, time-on-page, and clicked tags to classify the user (Recruiter, Client, Developer, Collaborator) and personalize the UI layout.
- **Opportunity Engine**: Heuristics and ML algorithms to score visitor sessions. High scores trigger alerts on the owner's dashboard.

## 4. Data Layer (Storage)
A hybrid persistence approach for disparate data types.

- **Relational DB (PostgreSQL)**: Stores user configurations, raw project metadata, articles, and analytics logs.
- **Graph DB (Neo4j)**: Powers the "Self-Updating Knowledge Graph". Nodes include `Skill`, `Project`, `Technology`, `Article`, `Concept`. Edges denote relationships (e.g., `[Project] -USES-> [Technology]`).
- **Vector DB (Pinecone / PgVector)**: Stores embeddings of all portfolio content to enable the RAG AI Assistant.
- **Object Storage (AWS S3 / Cloudflare R2)**: Hosts generated images, PDF resumes, and 3D models.

---

## Component Interaction Flow (Example: New Project)

1. **Trigger**: Owner pushes to GitHub `main` branch.
2. **Ingestion**: Webhook hits the Backend API. Action is queued in BullMQ.
3. **Extraction**: Automation Engine fetches README, package.json, and recent commits.
4. **Generation**: AI Writing Engine analyzes tech stack and commits to draft a "Case Study".
5. **Storage**: Project saved to PostgreSQL. Vector embeddings generated and saved to PgVector.
6. **Graph Update**: Neo4j creates new `Project` node and links it to extracted `Technology` nodes.
7. **Frontend Sync**: Next.js Incremental Static Regeneration (ISR) rebuilds the project page and updates the 3D graph visualization on the homepage.
8. **Notification**: Dashboard alerts the owner of a new draft ready for review.
