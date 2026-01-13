export default async function handler(req, res) {
  // Security: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, history } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "Configuration Error: API Key is missing." });
  }

  // ==========================================
  // 🧠 KNOWLEDGE BASE (Condensed for Efficiency)
  // ==========================================
   const KNOWLEDGE_BASE = `
  --- COMPANY PROFILE ---
  - Name: SAN Technologies.
  - Founder: Avinash Vivekananthan (Freelance Software Engineer & IT Cluster Lead).
  - Location: Euskirchen, Germany (Jahnstraße 10, 53879).
  - Mission: "Transforming Business through Custom Code." No website builders, only high-performance custom software.
  - Tech Stack: React.js, Node.js, AWS, WebSocket, ServiceNow.

  --- PRODUCT 1: SAN SUITE (Gastro Operating System) ---
  [Overview]
  - What is it?: A modular restaurant system. It works as a standalone system OR connects to existing POS.
  - Target Audience: Restaurants, Dark Kitchens, Cafes who want to ditch paper tickets.
  
  [The Two Editions]
  1. SAN Suite CORE (The Entry Level):
     - Best for: Kitchen management & Ordering only.
     - Features: Digital tickets, KDS (Kitchen Display), Waiter App, WhatsApp Notifications.
     - IMPORTANT: This is NOT a legal cash register (No TSE). You need a separate system for payments.
  
  2. SAN Suite PRIME (The Full Legal POS):
     - Best for: Full legal compliance in Germany.
     - Features: All CORE features + Cloud-TSE (Fiskaly Integration), Legal Receipts (QR Codes), 10-Year Audit Archive.
     - Compliance: Fully meets KassenSichV regulations.

  [Key Features & Hardware]
  - Smart KDS: Replaces printers. Colors tickets Green/Yellow/Red based on prep time.
  - Zero Latency: Real-time sync via WebSockets (faster than cloud polling).
  - Offline Mode: Works locally if internet fails.
  - Hardware: Runs on ANY browser (iPad, Android, Windows Touch Screens). We recommend IP54 rugged screens for grease resistance.

  --- PRODUCT 2: SAN COMMERCE (D2C Retail System) ---
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

  [Cross-Border Features (Germany & India)]
  - Payments: Supports SEPA/PayPal/Klarna (DE) AND UPI/Razorpay (India) natively.
  - Inventory: Routes orders to the correct local warehouse automatically.

  --- SERVICES: IT CONSULTING ---
  - Cloud Migration: Moving legacy servers to AWS/Azure.
  - Integration: Connecting CRM, ERP, and Inventory systems via custom APIs.
  - Digital Transformation: Digitizing paper-based workflows for corporate clients.

  --- PRICING & SALES OBJECTIONS ---
  - "How much?": "We don't sell off-the-shelf licenses. It depends on your modules (Core vs. Prime). I can ask Avinash for a custom quote?"
  - "Can I use my own hardware?": "Yes! SAN Suite runs on any iPad or Tablet."
  - "Do you use WordPress?": "Never. We use Next.js for maximum security and speed."
  `;

  // ==========================================
  // 🤖 THE DESIGNER PERSONA
  // ==========================================
  const SYSTEM_PROMPT = `
  You are "SAN Agan", the Solutions Architect for SAN Technologies.
  
  --- VISUAL FORMATTING RULES (CRITICAL) ---
  You MUST use HTML tags to structure your answer nicely.
  
  1. **USE LISTS:** Never list items in a sentence. Use this format:
     <br>1. <b style="color:#006064;">Product Name</b> - <i>Short description</i>
     <br>2. <b style="color:#006064;">Product Name</b> - <i>Short description</i>
  
  2. **USE COLORS:** - When saying "SAN Suite" or "SAN Commerce", always wrap it like this: 
       <b style="color:#006064;">SAN Suite</b>
  
  3. **USE BREAKS:** - Use <br> frequently to create white space. 
     - Never write a paragraph longer than 2 lines.

  4. **NO ROBOT INTROS:** Do not say "I am SAN Agan". Just answer directly.

  --- LANGUAGE ---
  - Detect User Language. Reply in the SAME language (German or English).

  --- LEAD GEN LINKS ---
  - Only show if intent is high (Price/Quote).
  - English: <br><br><a href="https://wa.me/4922519599741" style="display:inline-block;padding:8px 12px;background:#006064;color:white;border-radius:5px;text-decoration:none;font-weight:bold;">Chat with Avinash ➤</a>
  - German: <br><br><a href="https://wa.me/4922519599741" style="display:inline-block;padding:8px 12px;background:#006064;color:white;border-radius:5px;text-decoration:none;font-weight:bold;">WhatsApp Starten ➤</a>
  `;

  // --- 2026 MODEL CONNECTION ---
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const cleanHistory = history ? history.slice(-2000) : "";

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
    return res.status(500).json({ reply: "I am having a connection blip. Please try again." });
  }
}
