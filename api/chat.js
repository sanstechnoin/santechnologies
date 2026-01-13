export default async function handler(req, res) {
  // Security Check
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "⚠️ Error: GOOGLE_API_KEY is missing." });
  }

  try {
    // 1. Ask Google for the list of available models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error.message);
    }

    const data = await response.json();

    // 2. Filter for models that can actually Generate Content (Chat)
    const chatModels = data.models
      .filter(m => m.supportedGenerationMethods.includes("generateContent"))
      .map(m => m.name.replace('models/', '')) // Remove 'models/' prefix for clarity
      .join('<br>• ');

    // 3. Send the list back to the chat bubble
    return res.status(200).json({ 
      reply: `<b>✅ SUCCESS! Here are the models YOUR key can use:</b><br><br>• ${chatModels}<br><br>Please copy one of these exactly.` 
    });

  } catch (error) {
    console.error("Debug Error:", error);
    return res.status(500).json({ reply: `⚠️ API Key Error: ${error.message}` });
  }
}
