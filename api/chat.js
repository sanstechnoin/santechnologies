export default async function handler(req, res) {
  // 1. Security Check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Get Data
  const { message, history } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "⚠️ System Error: GOOGLE_API_KEY is missing in your .env file." });
  }

  // 3. Knowledge Base

  const KNOWLEDGE_BASE = `

  --- COMPANY PROFILE ---

  - Name: SAN Technologies.

  - Founder: Avinash Vivekananthan (Freelance Software Engineer & IT Cluster Lead).

  - Location: Euskirchen, Germany (Jahnstraße 10, 53879).

  - Mission: "Transforming Business through Custom Code." No website builders, only high-performance custom software.

  - Tech Stack: React.js, Node.js, AWS, WebSocket, ServiceNow.



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

  // 4. System Persona
  const SYSTEM_PROMPT = `
  You are "SAN Agan", the Solutions Architect for SAN Technologies.
  
  --- RULES ---
  1. **NO REPETITION:** Do NOT introduce yourself if the history shows we are already talking.
  2. **FORMATTING:** Use <br> for breaks. Use <b style="color:#006064;">Bold</b> for products.
  3. **LINKS:** - SAN Suite: <br><a href="san-suite.html" style="color:#006064;font-weight:bold;">View SAN Suite ➤</a>
     - SAN Commerce: <br><a href="san-commerce.html" style="color:#006064;font-weight:bold;">View SAN Commerce ➤</a>
  
  --- LEAD GEN ---
  - Link (EN): <br><br><a href="https://wa.me/4922519599741?text=Hi%20Avinash" style="display:inline-block;padding:8px 12px;background:#006064;color:white;border-radius:5px;text-decoration:none;">Chat with Avinash ➤</a>
  - Link (DE): <br><br><a href="https://wa.me/4922519599741?text=Hallo%20Avinash" style="display:inline-block;padding:8px 12px;background:#006064;color:white;border-radius:5px;text-decoration:none;">Mit Avinash sprechen ➤</a>
  `;

  // 5. Connect to Google 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

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
      // SEND ACTUAL ERROR TO FRONTEND FOR DEBUGGING
      console.error("Google API Error:", errorData);
      throw new Error(errorData.error.message || "Google API Error");
    }

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ reply: reply });

  } catch (error) {
    console.error("API Error:", error);
    // RETURN THE ACTUAL ERROR MESSAGE SO WE CAN SEE IT
    return res.status(500).json({ reply: `⚠️ Error: ${error.message}` });
  }
}
