const OpenAI = require('openai');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configuration with fallbacks for local dev stability
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateCaseStudy(repoName, commitMessages, dependencies) {
    console.log(`[AI Engine] Analyzing repository context for ${repoName}...`);
    
    const prompt = `
    Analyze this repository: "${repoName}".
    Tech Stack: ${dependencies.join(', ')}.
    Recent Commits: ${commitMessages.slice(0, 5).join('; ')}.

    Generate a JSON object representing a project case study with these fields:
    - problem: The technical challenge being solved.
    - solution: How the tech stack solves it.
    - devProcess: Brief summary of the development flow.
    - technologies: Array of core technologies used.
    
    Return ONLY JSON.
    `;

    // Strategy: Try Gemini first (Reliable), Fallback to OpenAI (Redundant)
    try {
        console.log(`[AI Engine] Attempting generation with Gemini...`);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        // Clean JSON from markdown if necessary
        const cleanedJson = text.replace(/```json|```/g, '').trim();
        const draft = JSON.parse(cleanedJson);
        
        return { ...draft, status: 'AUTO_GENERATED_GEMINI' };
    } catch (geminiError) {
        console.warn(`[AI Engine] Gemini failed: ${geminiError.message}. Falling back to OpenAI...`);
        
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            });

            const draft = JSON.parse(response.choices[0].message.content);
            return { ...draft, status: 'AUTO_GENERATED_OPENAI' };
        } catch (openaiError) {
            console.error(`[AI Engine Error] All AI providers failed: ${openaiError.message}`);
            return {
                problem: `Analyzing ${repoName} structure and dependencies.`,
                solution: `Leveraged ${dependencies[0]} for a scalable implementation.`,
                devProcess: `Iterative development based on ${commitMessages.length} commits.`,
                technologies: dependencies,
                status: 'FALLBACK_DRAFT'
            };
        }
    }
}

async function generateInsights(userId) {
    console.log(`[AI Engine] Generating growth insights for ${userId}...`);
    
    const prompt = `
    Generate 3 short developer growth insights for a portfolio dashboard.
    Focus on skill improvement and market trends. 
    Return as a JSON array of 3 strings.
    Return ONLY JSON.
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedJson = text.replace(/```json|```/g, '').trim();
        const json = JSON.parse(cleanedJson);
        return json.insights || json;
    } catch (error) {
        return [
            "Your proficiency in recent techs is growing steadily.",
            "Market interest in your core stacks remains high.",
            "Recommended: Explore a new niche framework to expand your graph."
        ];
    }
}

async function generateArticle(projectTitle, projectContext) {
    console.log(`[AI Engine] Drafting deep-dive article for: ${projectTitle}...`);
    
    const prompt = `
    Write a high-quality technical article based on the project: "${projectTitle}".
    Context: ${projectContext}
    
    Structure:
    - Title: Catchy technical title.
    - Content: Markdown formatted technical deep-dive (approx 500 words).
    - Topic: Primary technology topic.
    
    Return as a JSON object with fields: title, content, topic.
    Return ONLY JSON.
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanedJson = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanedJson);
    } catch (error) {
        console.warn(`[AI Engine] Gemini article gen failed, using OpenAI...`);
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            });
            return JSON.parse(response.choices[0].message.content);
        } catch (openaiErr) {
            return {
                title: `Deep Dive: ${projectTitle}`,
                content: `Exploring the architecture and implementation of ${projectTitle}. This project leverages modern patterns to solve complex problems...`,
                topic: "Software Engineering"
            };
        }
    }
}

module.exports = {
    generateCaseStudy,
    generateInsights,
    generateArticle
};
