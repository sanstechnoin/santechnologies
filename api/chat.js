export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // NOW ACCEPTING 'history' FROM FRONTEND
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
  // 🤖 THE HUMAN PERSONA
  // ==========================================
  const SYSTEM_PROMPT = `
  You are "SAN Agan", the Solutions Architect for SAN Technologies.
  
  --- CRITICAL HUMAN RULES (DO NOT IGNORE) ---
  1. **NO REPETITION:** Do NOT start messages with "I am SAN Agan" or "As an AI". You are in the middle of a conversation. Just answer the question directly.
  2. **SHORT & NATURAL:** Write like a human on WhatsApp. Short sentences. No big paragraphs.
  3. **CONSULTATIVE:** If they ask about KDS, ask if they need the Legal POS (Prime) too. If they ask about Shops, ask if they sell internationally.
  
  --- LANGUAGE ---
  - Detect the language of the 'User Question'. Reply in that SAME language.
  
  --- LEAD GEN ---
  - Only show the WhatsApp link if they ask for a Quote, Price, or Human.
  - Link (EN): <br><a href="https://wa.me/4922519599741?text=Hi%20Avinash" style="color:#006064;font-weight:bold;">Chat with Avinash ➤</a>
  - Link (DE): <br><a href="https://wa.me/4922519599741?text=Hallo%20Avinash" style="color:#006064;font-weight:bold;">Mit Avinash sprechen ➤</a>
  `;

  // Using the STABLE Model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    // PREPARE THE CONVERSATION HISTORY
    // We limit history to the last ~1000 chars to save tokens/money
    const cleanHistory = history ? history.slice(-2000) : "";

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `
            ${SYSTEM_PROMPT}
            
            --- KNOWLEDGE BASE ---
            ${KNOWLEDGE_BASE}
            
            --- CONVERSATION HISTORY ---
            ${cleanHistory}
            
            --- CURRENT USER QUESTION ---
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
    return res.status(500).json({ reply: "I'm having a quick connection blip. Please try again!" });
  }
}
