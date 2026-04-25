module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body || {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "No text provided" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "Convert rough nursing notes into clean professional nursing documentation. Preserve the clinical meaning. Do not invent facts. Output only the polished nursing note.",
          },
          {
            role: "user",
            content: String(text),
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI request failed",
      });
    }

    const result = data.choices?.[0]?.message?.content?.trim() || "";

    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "AI generation failed",
    });
  }
};
