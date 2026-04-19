import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const { text } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Turn rough nursing notes into a clean professional nursing chart note."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.4
    });

    res.status(200).json({
      result: completion.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({
      error: "AI generation failed"
    });
  }
}
