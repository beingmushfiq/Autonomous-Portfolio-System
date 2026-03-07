const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyDYKIyr3UJ9r-X-hfaB5R5iR64qiazzF20");

async function run() {
  try {
    // There is no direct listModels in the genAI instance in some versions, 
    // but we can try to hit a known model.
    console.log("Testing gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.log("gemini-1.5-flash failed.");
    try {
        console.log("Testing gemini-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Say hello");
        console.log("Success:", result.response.text());
    } catch (e2) {
        console.log("gemini-pro failed.");
        console.error(e2);
    }
  }
}

run();
