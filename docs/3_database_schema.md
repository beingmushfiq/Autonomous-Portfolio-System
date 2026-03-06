# Autonomous Portfolio System: Database Schema

The system requires a dual-database approach: a **Relational Database (PostgreSQL)** for structured transactional data, and a **Graph Database (Neo4j)** for the interconnected knowledge representation and 3D visualization.

---

## 1. Relational Schema (PostgreSQL Prisma Schema)

Used for user management, standard project data, articles, content drafts, and analytics logging.

```prisma
model User {
  id             String    @id @default(uuid())
  name           String
  email          String    @unique
  githubUsername String?
  bio            String?
  reputationScore Int      @default(0)
  projects       Project[]
  articles       Article[]
  dashboardLogs  DashboardLog[]
  createdAt      DateTime  @default(now())
}

model Project {
  id             String    @id @default(uuid())
  userId         String
  user           User      @relation(fields: [userId], references: [id])
  title          String
  slug           String    @unique
  description    String
  repositoryUrl  String?
  liveUrl        String?
  
  // AI Generated Case Study Fields
  problem        String?   @db.Text
  solution       String?   @db.Text
  devProcess     String?   @db.Text
  results        String?   @db.Text
  lessonsLearned String?   @db.Text
  
  technologies   String[]  // Array of tech names (mirrors graph edges)
  
  status         PublicationStatus @default(DRAFT) // ENUM: DRAFT, PUBLISHED, AUTO_GENERATED
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model Article {
  id             String    @id @default(uuid())
  userId         String
  title          String
  slug           String    @unique
  content        String    @db.Text
  summary        String?
  topic          String?
  status         PublicationStatus @default(DRAFT)
  publishedAt    DateTime?
  createdAt      DateTime  @default(now())
}

model DashboardLog {
  // Captures Opportunity Signals and Automation Engine events
  id             String    @id @default(uuid())
  userId         String
  type           LogType   // ENUM: OPPORTUNITY, SYSTEM_UPDATE, AI_TASK
  message        String
  metadata       Json?     // Flexible data for specific logs
  isRead         Boolean   @default(false)
  createdAt      DateTime  @default(now())
}

model VisitorSession {
  // Telemetry for intent analysis
  id             String    @id @default(uuid())
  sessionId      String    @unique
  inferredIntent String?   // Recruiter, Developer, Client
  engagementScore Float    @default(0.0)
  viewedPaths    String[]
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

---

## 2. Graph Schema (Neo4j)

Used for powering the "Self-Updating Knowledge Graph" and 3D Visualizations.

### Node Labels

- `User`: Represents the portfolio owner.
- `Project`: Represents a built application or repository.
- `Technology`: Represents a framework, language, or tool (e.g., "React", "Python").
- `Concept`: Represents an abstract skill or architectural pattern (e.g., "Microservices", "Machine Learning").
- `Article`: Represents a written piece of content.

### Relationship Types

- `(User)-[:BUILT]->(Project)`
- `(User)-[:BEYOND_PROFICIENT_IN {level: Int, weight: Float}]->(Technology)`
- `(Project)-[:USES {prominence: Float}]->(Technology)`
- `(Project)-[:IMPLEMENTS]->(Concept)`
- `(Article)-[:DISCUSSES]->(Technology)`

### Example Cypher Queries

**Update Graph on New Project Input:**
```cypher
MERGE (p:Project {id: $projectId, title: $title})
WITH p
UNWIND $technologies AS techName
MERGE (t:Technology {name: techName})
MERGE (p)-[:USES]->(t)
// Increase the user's proficiency weight dynamically
MATCH (u:User {id: $userId})
MERGE (u)-[r:BEYOND_PROFICIENT_IN]->(t)
ON CREATE SET r.weight = 1
ON MATCH SET r.weight = r.weight + 1
```

**Fetch Data for 3D Node Map Visualization:**
```cypher
// Get top technologies and their connected projects to render in Three.js
MATCH (t:Technology)<-[r1:USES]-(p:Project)
RETURN t.name AS skill, COUNT(p) AS projectCount, COLLECT(p.title) as projects
ORDER BY projectCount DESC
LIMIT 50
```
