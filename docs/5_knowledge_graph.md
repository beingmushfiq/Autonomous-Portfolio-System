# Autonomous Portfolio System: Knowledge Graph Structure

The Self-Updating Knowledge Graph maps out the relationships between the portfolio owner’s skills, projects, and published content. This graph serves two purposes:
1. It fuels the RAG pipeline for the AI Assistant.
2. It visually renders as a 3D interactive constellation on the frontend to wow visitors.

---

## 1. Ontology (Node Types)

- **Owner**: The central node representing the User/Portfolio Owner.
- **Skill / Technology**: Specifically defined tools, languages, or frameworks (e.g., Next.js, Node.js, TensorFlow).
- **Concept / Domain**: Abstract areas of expertise (e.g., UI/UX Design, Machine Learning, Automation).
- **Project**: Digital products, open-source repositories, or case studies.
- **Article / Note**: Published thought leadership or tutorials.

## 2. Edge Topology (Relationships)

Edges map how the nodes connect and contain properties (like `weight` or `prominence`) that dictate how they render visually and rank in searches.

**Owner ⇄ Skill**
- `(Owner)-[:PROFICIENT_IN { years: 3, weight: 1.5 }]->(Next.js)`
- Automations update the `weight` property every time a new project using Next.js is committed to GitHub.

**Project ⇄ Skill**
- `(Autonomous_Portfolio)-[:USES { level: 'core' }]->(Next.js)`
- `(Autonomous_Portfolio)-[:USES { level: 'secondary' }]->(TailwindCSS)`

**Skill ⇄ Concept**
- `(Next.js)-[:BELONGS_TO]->(Frontend_Development)`
- `(TensorFlow)-[:BELONGS_TO]->(Machine_Learning)`

**Article ⇄ Topic**
- `(Article:_How_to_Build_AI)-[:DISCUSSES { focus: 0.9 }]->(Machine_Learning)`

---

## 3. The Automation Update Cycle

The graph is purely dynamic. Manual entry is minimized.

1. **Ingest Phase**: The AI Writing Engine processes a new GitHub project ("Project X").
2. **Entity Recognition Phase**: AI identifies that Project X uses `Python`, `Docker`, and `FastAPI`.
3. **Graph Upsert Phase**:
   - `MERGE` Project X node.
   - `MERGE` Skill nodes for Python, Docker, FastAPI (creates them if they don't exist).
   - Create `USES` edges between Project X and the Skills.
   - Identify the `(Owner)-[:PROFICIENT_IN]->(Skill)` edges, incrementing their `weight` values by a standard float (e.g., +0.1 for every project).

---

## 4. 3D Visualization Implementation (Frontend)

The 3D interactive map is powered by `react-force-graph-3d`, `three.js`, and `react-three-fiber`.

- **Data Fetch**: The Next.js frontend calls an API route (`/api/graph-data`) that executes a Neo4j Cypher query to retrieve a subgraph of the most heavily weighted nodes.
- **Node Size**: The visual radius of a `Skill` node is directly tied to the sum of incoming edge weights from the `Project` node level. Use a minimum floor so new skills are still visible, and a max ceiling to prevent visual clutter.
- **Colors**:
  - Center Node (Owner): Pulsing Gold/White.
  - Skills: Cyber Blue.
  - Projects: Neon Green.
  - Concepts: Deep Purple.
- **Interactivity**: Clicking on a `Skill` node dynamically pans the camera and updates an HTML overlay to show all `Project`s and `Article`s tied to that skill.
