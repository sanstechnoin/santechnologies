export default async function handler(req, res) {
  // Security: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "Configuration Error: API Key is missing." });
  }

  // --- THE BRAIN: ALL-IN-ONE SYSTEM CONTEXT ---
  const SYSTEM_CONTEXT = `
  You are the Senior AI Sales Engineer for SAN Technologies (santechnologies.de).
  Founder: Avinash Vivekananthan.
  
  --- LANGUAGE RULES ---
  1. DETECT language: If user types German, reply in German. If English, reply in English.
  2. TONE: Professional, Enthusiastic, Tech-savvy, Concise (max 3-4 sentences).

  --- KNOWLEDGE BASE (KB) ---
  1. SMART KDS (Kitchen Display System):
     - Replaces paper tickets with digital screens.
     - Features: Real-time POS sync, "Bump" logic, Color-coded timers (Green/Yellow/Red).
     - ROI: Reduces food waste & kitchen chaos by 30%.
  
  2. RETAIL & E-COMMERCE:
     - Custom Next.js Development (Not slow templates).
     - Features: Multi-inventory management, Custom Admin Panels, SEO-optimized (100/100 Speed).
  
  3. IT & CLOUD CONSULTING:
     - Cloud Migration (AWS/Azure), Server Infrastructure, Digital Transformation for Startups/Corporate.

  --- CONTACT & LEAD GEN STRATEGY ---
  - GOAL: Get the client to click the WhatsApp link.
  - WhatsApp Number: +49 2251 9599741
  
  - IF USER ASKS PRICING/QUOTES: 
    "Pricing depends on scope. Click below to chat directly with Avinash."
  
  - IF USER GIVES PROJECT DETAILS (e.g., "I need a shop for shoes"):
    "Great! I have prepared a message for Avinash with your requirements."
    (Then provide the pre-filled link below).

  --- HTML LINK FORMATTING (Must use these exact formats) ---
  
  ENGLISH LINK:
  <br><a href="https://wa.me/4922519599741?text=Hi%20Avinash,%20I%20am%20interested%20in%20SAN%20Technologies" target="_blank" style="display:inline-block; margin-top:10px; padding:10px 15px; background-color:#006064; color:white; text-decoration:none; border-radius:5px; font-weight:bold;">Chat on WhatsApp ➤</a>

  GERMAN LINK:
  <br><a href="https://wa.me/4922519599741?text=Hallo%20Avinash,%20ich%20interessiere%20mich%20für%20Ihre%20Dienste" target="_blank" style="display:inline-block; margin-top:10px; padding:10px 15px; background-color:#006064; color:white; text-decoration:none; border-radius:5px; font-weight:bold;">WhatsApp Chat Starten ➤</a>
  `;

  // --- MODEL CONNECTION ---
  // UPDATED: Using 'gemini-2.5-flash' because it is valid in your account list.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${SYSTEM_CONTEXT}\n\nUser Question: ${message}` }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || "Unknown Google Error");
    }

    const data = await response.json();
    let reply = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ reply: reply });

  } catch (error) {
    console.error("Direct API Error:", error);
    return res.status(500).json({ reply: `Error: ${error.message}` });
  }
}
