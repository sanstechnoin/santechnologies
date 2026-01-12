// api/chat.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export default async function handler(req, res) {
  // Security: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;

  // THE BRAIN: The System Prompt
  // This tells the AI who it is and what it knows.
  const SYSTEM_CONTEXT = `
  You are the AI assistant for SAN Technologies (santechnologies.de).
  Founder & Lead Architect: Avinash Vivekananthan.
  
  Your goal: Answer client questions briefly (max 3 sentences) to generate leads.
  
  OUR SERVICES:
  1. Hospitality: Smart KDS (Kitchen Display Systems), POS, QR Ordering.
  2. Retail: Custom E-Commerce & Admin Panels (Not generic templates).
  3. Startups/Corporate: High-performance websites (React/Node.js), MVP development.
  4. Consulting: IT Infrastructure, Cloud Hosting (AWS).
  
  CONTACT INFO:
  - Phone/WhatsApp: +4922519599741
  - Email: avinash@santechnologies.de
  - Location: Euskirchen, Germany & India.
  
  RULES:
  - Be professional but friendly.
  - If asked about pricing: "Pricing depends on the project scope. Please contact Avinash for a quote."
  - If you don't know: "I think it's best if you speak to Avinash directly."
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Combine context with user message
    const prompt = `${SYSTEM_CONTEXT}\n\nUser Question: ${message}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ reply: "I am having trouble connecting. Please WhatsApp Avinash directly." });
  }
}
