export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // ✅ Handle body parsing for Node serverless function
    let body = req.body;

    // Sometimes Vercel gives stringified JSON → parse it
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (err) {
        return res.status(400).json({ error: "Invalid JSON body" });
      }
    }

    const { prompt } = body;

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
