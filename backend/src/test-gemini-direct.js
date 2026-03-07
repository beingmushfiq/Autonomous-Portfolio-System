const { GoogleGenerativeAI } = require("@google/generative-ai");

// DIRECT INJECTION FOR TESTING ONLY
const genAI = new GoogleGenerativeAI("AIzaSyDYKIyr3UJ9r-X-hfaB5R5iR64qiazzF20");

async function run() {
  try {
    console.log("Testing gemini-2.0-flash with direct key...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Respond with only 'Success'");
    console.log("Success:", result.response.text());
  } catch (e) {
    console.error("Failed with direct key:", e.message);
    if (e.statusText) console.error("Status Text:", e.statusText);
  }
}

run();
