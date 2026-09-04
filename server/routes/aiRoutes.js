 const express = require("express");
const Groq = require("groq-sdk");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// AI TWIN CHAT
router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful Personal Digital Twin assistant. Give clear, friendly and useful responses to the user.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    res.json({
      message: "AI response generated successfully",
      userMessage: message,
      reply,
    });

  } catch (error) {
    console.error("AI Error:", error);

    res.status(500).json({
      message: "Failed to generate AI response",
    });
  }
});

module.exports = router;