import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkConnectivity() {
  try {
    console.log("Checking model access for gemini-2.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const res = await model.generateContent("Hello?");
    console.log("Success:", res.response.text());
  } catch (err) {
    console.error("Failed:", err.message);
  }
}

checkConnectivity();
