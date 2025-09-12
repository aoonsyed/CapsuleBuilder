export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { prompt } = req.body;

    // 🔹 Log incoming request
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

    // 🔹 Log raw response status
    console.log("✅ OpenAI response status:", response.status);

    const data = await response.json();

    // 🔹 Log response data (trimmed if huge)
    console.log("🔍 OpenAI response body:", JSON.stringify(data).slice(0, 500));

    res.status(200).json(data);
  } catch (err) {
    console.error("❌ Error in /api/openai:", err);
    res.status(500).json({ error: err.message });
  }
}
