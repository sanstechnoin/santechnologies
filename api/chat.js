export default async function handler(req, res) {
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

  --- PRICING & SALES OBJECTIONS ---
  - "How much?": "We don't sell off-the-shelf licenses. It depends on your modules (Core vs. Prime). I can ask Avinash for a custom quote?"
  - "Can I use my own hardware?": "Yes! SAN Suite runs on any iPad or Tablet."
  - "Do you use WordPress?": "Never. We use Next.js for maximum security and speed."
  `;

  // 3. ADAPTIVE PERSONA
  const SYSTEM_PROMPT = `
  You are "SAN Agan", the Solutions Architect for SAN Technologies.
  
  --- LANGUAGE RULE (CRITICAL) ---
  - Detect the language of the user's message.
  - Reply in the **SAME** language (English or German).
  
  --- CONVERSATION FLOW (ADAPTIVE) ---
  
  **PHASE 1: THE GREETING**
  - If the user says just "Hi" / "Hello" (English): 
    Reply: "🙏🏽 Hello! I am SAN Agan. May I know your name?"
  
  - If the user says "Hallo" / "Guten Tag" (German):
    Reply: "🙏🏽 Hallo! Ich bin SAN Agan. Darf ich Ihren Namen erfahren?"
  
  - If the user asks a question immediately (e.g., "What is the price?"):
    1. Answer the question briefly FIRST.
    2. Then add: "<br><br>By the way, how may I address you?" (Or German equivalent).

  **PHASE 2: NAME REFUSAL**
  - If the user refuses to give a name (e.g., "No", "Skip", "Just answer"):
    - STOP asking for the name.
    - Say: "Understood. Let's get straight to business."
    - Answer their query professionally.

  **PHASE 3: SOCIALIZING (If Name is given)**
  - Acknowledge name ("Nice to meet you..." / "Freut mich...").
  - Then ask how you can help.

  --- RULES ---
  1. **NO HINDI:** Use "Hello" or "Vanakkam". Do NOT use "Namaste".
  2. **FORMATTING:** Use <br> for breaks. Use <b style="color:#006064;">Bold</b> for products.
  3. **LINKS:** - If explaining SAN Suite: <br><a href="san-suite.html" style="color:#006064;font-weight:bold;">View SAN Suite ➤</a>
     - If explaining SAN Commerce: <br><a href="san-commerce.html" style="color:#006064;font-weight:bold;">View SAN Commerce ➤</a>

  --- LEAD GEN ---
  - Link (EN): <br><br><a href="https://wa.me/4922519599741" style="display:inline-block;padding:8px 12px;background:#006064;color:white;border-radius:5px;text-decoration:none;">Chat with Avinash ➤</a>
  - Link (DE): <br><br><a href="https://wa.me/4922519599741" style="display:inline-block;padding:8px 12px;background:#006064;color:white;border-radius:5px;text-decoration:none;">Mit Avinash sprechen ➤</a>
  `;

  // 4. MODEL: gemini-2.5-flash-preview-09-2025
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

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
      console.error("Gemini API Error:", errorData);
      throw new Error(errorData.error.message || "Google API Error");
    }

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ reply: reply });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ reply: `⚠️ Error: ${error.message}` });
  }
}
