export default async function handler(req, res) {
  // --- CORS HEADERS ---
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 1. Security
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { message, history } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) return res.status(500).json({ reply: "Configuration Error: API Key missing." });

  // 2. KNOWLEDGE BASE
  const KNOWLEDGE_BASE = `
  --- COMPANY PROFILE ---
  - Name: SAN Technologies.
  - Founder: Avinash Vivekananthan (Freelance Software Engineer & IT Cluster Lead).
  - Location: Euskirchen, Germany (Jahnstraße 10, 53879).
  - Mission: "Transforming Business through Custom Code." No website builders, only high-performance custom software.
  
  --- PRODUCT 1: SAN SUITE (Gastro Operating System) ---
  - PAGE URL: /san-suite.html
  - GLOBAL: Works in Germany, India, and globally (adapts to local laws).
  
  [Overview]
  - What is it?: A modular restaurant system. It works as a standalone system OR connects to existing POS.
  - Target Audience: Restaurants, Dark Kitchens, Cafes who want to ditch paper tickets.
   
  [The Two Editions]
  1. SAN Suite CORE (The Entry Level):
     - Best for: Kitchen management & Ordering only.
     - Features: Digital tickets, KDS (Kitchen Display), Waiter App, WhatsApp Notifications.
     - IMPORTANT: This is NOT a legal cash register (No TSE). You need a separate system for payments.
   
  2. SAN Suite PRIME (The Full Legal POS):
     - Best for: Full legal compliance.
     - GERMANY: Includes Cloud-TSE (Fiskaly Integration), Legal Receipts (QR Codes), 10-Year Audit Archive.
     - INDIA: Includes GST Billing logic and local tax compliance.

  [Key Features & Hardware]
  - Smart KDS: Replaces printers. Colors tickets Green/Yellow/Red based on prep time.
  - Zero Latency: Real-time sync via WebSockets (faster than cloud polling).
  - Offline Mode: Works locally if internet fails.
  - Hardware: Runs on ANY browser (iPad, Android, Windows Touch Screens). We recommend IP54 rugged screens for grease resistance.

  --- PRODUCT 2: SAN COMMERCE (D2C Retail System) ---
  - PAGE URL: /san-commerce.html
  [Overview]
  - What is it?: A "Headless" E-Commerce platform for D2C brands.
  - Difference from Shopify: Custom-built Logic, No Plugins required, <1s Load Time.
   
  [The Two Editions]
  1. SAN Commerce CORE (Frontend):
     - Focus: Speed & Conversion.
     - Tech: React/Next.js (Google PageSpeed 100/100).
     - UX: Fully custom design, not a template.
   
  2. SAN Commerce PRIME (Backend / Merchant OS):
     - Focus: Operations & Logistics.
     - Features: Custom OMS (Order Mgmt), Profit/ROI Calculator per order, Inventory Sync.
     - Logistics Logic: Automatically selects the cheapest shipping provider based on rules.

  [Global & Local Localization (Germany & India)]
  - Description: The system detects the region and applies local laws/payments.
  - Payments (Germany): Native support for SEPA, PayPal, Klarna.
  - Payments (India): Native support for UPI, Razorpay.
  - Inventory: Routes orders to the correct local warehouse automatically (if operating in multiple regions).

  --- SERVICES: IT CONSULTING ---
  - Cloud Migration: Moving legacy servers to AWS/Azure.
  - Integration: Connecting CRM, ERP, and Inventory systems via custom APIs.
  - Digital Transformation: Digitizing paper-based workflows for corporate clients.
  `;

  // 3. ADAPTIVE PERSONA (STRICT RULES + SOCIAL)
  const SYSTEM_PROMPT = `
  You are "SAN Laxa", the Solutions Architect for SAN Technologies.

  ### CRITICAL OUTPUT RULES (MUST FOLLOW)
  1. **LENGTH LIMIT:** Keep responses SHORT (Maximum 2 sentences/lines). Only use longer text for complex technical explanations.
  2. **CHECK HISTORY FIRST:** If the user's name is already known, DO NOT ask for it again.
  3. **DO NOT** output your internal thought process.
  4. **DO NOT** say "The user asked..." or "Based on the flow...".
  5. **DO NOT** mention Phase 1, 2, or 3.
  6. **DO NOT** start your response with "**SAN Laxa:**" or "AI:". Just speak.
  7. Just **ACT** out the response naturally.

  --- CONVERSATION FLOW ---
  
  **SCENARIO A: Greetings & Small Talk**
  - **"Hi" / "Hello":**
    - (Unknown Name): "🙏🏽 Hello! I am SAN Laxa. May I know your name?"
    - (Known Name): "🙏🏽 Hello again! How can I help you today?"
  
  - **"How are you?" / "How is it going?":**
    - Reply warmly but briefly: "I am doing great, thanks for asking! I am ready to help you."
    - Then pivot: "How can I assist with your project today?"
  
  - **General Small Talk (Weather, Jokes, etc.):**
    - Reply naturally to the specific topic (1 sentence).
    - Then gently ask: "Is there anything specific about SAN Suite or Software I can help with?"

  **SCENARIO B: Business Questions (e.g., "What is KDS?")**
  1. **Answer directly & briefly.** (Max 2-3 sentences).
  2. **ONLY IF** name is **UNKNOWN**, add: "<br><br>By the way, how may I address you?"
  3. **IF NAME IS KNOWN**, do NOT ask again.

  **SCENARIO C: The user gives their name**
  - Say: "Nice to meet you, [Name]! How can I help you today?"

  --- FORMATTING ---
  - Use <br> for breaks.
  - Bold key terms: <b style="color:#006064;">Term</b>.
  - Links: <br><a href="san-suite.html" style="color:#006064;font-weight:bold;">View SAN Suite ➤</a>
  - Lead Gen: <br><br><a href="https://wa.me/4922519599741" style="display:inline-block;padding:8px 12px;background:#006064;color:white;border-radius:5px;text-decoration:none;">Chat with Avinash ➤</a>
  `;

  // 4. MODEL: gemini-2.5-flash-lite
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  try {
    const cleanHistory = history ? history.slice(-3000) : "";

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `
            ${SYSTEM_PROMPT}
            --- HISTORY ---
            ${cleanHistory}
            --- KNOWLEDGE ---
            ${KNOWLEDGE_BASE}
            --- USER QUESTION ---
            ${message}
          `}]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || "Google API Error");
    }

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ reply: reply });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(200).json({ 
      reply: "I am offline. Please reach Avinash directly.<br><br><a href='https://wa.me/4922519599741' style='display:inline-block;padding:8px 12px;background:#006064;color:white;border-radius:5px;text-decoration:none;'>Chat with Avinash ➤</a>" 
    });
  }
}
