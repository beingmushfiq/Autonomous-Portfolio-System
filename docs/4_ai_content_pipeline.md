# Autonomous Portfolio System: AI Content Generation Pipeline

The AI Content Pipeline is responsible for ingesting structured data (code, readmes, notes) and outputting polished, professional content across various mediums. 

It utilizes large language models (e.g., GPT-4o) using prompt chaining and retrieval-augmented generation (RAG).

---

## 1. Auto Project Generation (Case Studies)

Triggered by the Automation Engine when a new GitHub repository or update is detected.

### Pipeline Steps:

1. **Context Construction**:
   - `repo_name`, `description`
   - `package.json` (to infer the tech stack)
   - `README.md` (to infer the problem statement and features)
   - `git log` (first 10 commits to infer the "Development Process" and challenges)

2. **System Prompt (Roleplay)**:
   > "You are an elite technical writer creating a professional portfolio case study for an elite software engineer. The tone must be authoritative, clear, and focused on value creation. Use active voice."

3. **Generation Prompts**:
   - **Step A (Structure)**: 
     > "Analyze the provided repository context. Identify: 1. The Core Problem Solved. 2. The Solution Architecture. 3. The Tech Stack."
   - **Step B (Narrative)**:
     > "Using the structured data from Step A, generate a 5-section case study. Include sections: Problem, Solution, Technology Stack, Development Process, and Results."
   - **Step C (Refinement)**:
     > "Review the case study. Enhance the vocabulary. Ensure formatting uses modern markdown with subtle emphasis on key metrics. Extract 3 'Lessons Learned'."

4. **Output Parsing**:
   - AI outputs JSON containing the parsed sections to be stored cleanly in the PostgreSQL database.
   - Saves row to `Project` table with `status = PENDING_REVIEW`.

---

## 2. AI Writing Engine (Articles & Insights)

Triggered periodically (e.g., weekly) or directly by the owner providing "scratchpad notes".

### Pipeline Steps:

1. **Topic Ideation Vector Search**:
   - Queries the vector database for the owner's most prominent skills and recent project completions.
   - *Example Query*: "What are the most complex challenges solved in the last 30 days based on the project database?"

2. **Thematic Generation Prompt**:
   > "Based on the recent projects [A, B] and focus technologies [X, Y], suggest three potential technical article topics. For each topic, provide a headline, a 2-sentence synopsis, and the target audience (e.g., Developers, Clients)."

3. **Article Drafting**:
   - If the owner approves a topic (or if Auto-Publish is on), the AI is prompted to write a comprehensive 1500-word tutorial or thought-leadership piece.
   - *Prompt Snippet*: "Write a technical article on [Topic]. Include code snippets illustrating [Concept]. Conclude with architecture trade-offs."

---

## 3. RAG-Powered AI Assistant

Embedded in the frontend to answer visitor queries interactively.

### Pipeline Steps:

1. **User Input**: Visitor asks: "Has this person worked with AI automation?"
2. **Intent Classification**:
   > "Classify the user intent: Recruit_Seeking_Skills, Client_Seeking_Services, Tech_Seeking_Implementation."
3. **Vector Retrieval**:
   - Convert question to embeddings. Search Pinecone/PgVector for top-K relevant chunks across `Project`, `Skill`, and `Article` embeddings.
4. **Contextual Answer Generation**:
   > "You are the AI representative of the portfolio owner. Using ONLY the provided context, answer the visitor's question professionally. If the context does not contain the answer, politely state that."
   > *Context Provided:* [Retrieved Vectors from DB]
5. **Stream Output**: Stream response tokens to the Next.js frontend for a typing-effect UX.
