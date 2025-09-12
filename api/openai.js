export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // ✅ Properly parse request body
    const { prompt } = await req.json();

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt in request body" });
    }

    console.log("📩 Received prompt:", prompt);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful fashion designer assistant." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    console.log("✅ OpenAI response status:", response.status);
    const data = await response.json();
    console.log("🔍 OpenAI response body:", JSON.stringify(data).slice(0, 500));

    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ Error in /api/openai:", err);
    return res.status(500).json({ error: err.message });
  }
}
