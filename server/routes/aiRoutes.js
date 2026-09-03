const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// AI TWIN CHAT
router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    // Temporary response
    // Real AI will be connected in the next step
    res.json({
      message: "AI Twin route is working!",
      userMessage: message,
      reply: `I received your message: "${message}"`,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to process AI request",
    });
  }
});

module.exports = router;