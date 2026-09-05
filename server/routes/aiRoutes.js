const express = require("express");
const Groq = require("groq-sdk");

const Memory = require("../models/memory");
const Goal = require("../models/goal");
const Task = require("../models/tasks");
const ActivityLog = require("../models/ActivityLog");

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

    // Get the logged-in user's personal data
    const [memories, goals, tasks, activities] =
      await Promise.all([
        Memory.find({
          user: req.userId,
        })
          .sort({ createdAt: -1 })
          .limit(20),

        Goal.find({
          user: req.userId,
        })
          .sort({ createdAt: -1 })
          .limit(20),

         Task.find({
         user: req.userId,
         })
          .populate("goal", "title status targetDate")
          .sort({ createdAt: -1 })
          .limit(20),

        ActivityLog.find({
          user: req.userId,
        })
          .sort({ createdAt: -1 })
          .limit(20),
      ]);

    // Prepare personal context for the AI
    const personalContext = `
USER MEMORIES:
${
  memories.length
    ? memories
        .map(
          (memory) =>
            `- ${memory.content} (Category: ${
              memory.category || "general"
            })`
        )
        .join("\n")
    : "No memories stored."
}

USER GOALS:
${
  goals.length
    ? goals
        .map(
          (goal) =>
            `- ${goal.title} | Status: ${
              goal.status || "unknown"
            } | Target Date: ${
              goal.targetDate || "Not specified"
            }`
        )
        .join("\n")
    : "No goals stored."
}

USER TASKS:
${
  tasks.length
    ? tasks
        .map(
          (task) =>
            `- Title: ${task.title}
  Status: ${task.status || "unknown"}
  Priority: ${task.priority || "unknown"}
  Due Date: ${
    task.dueDate
      ? new Date(task.dueDate).toLocaleString()
      : "Not specified"
  }
  Description: ${
    task.description || "No description"
  }
  Goal: ${
  task.goal
    ? `${task.goal.title} | Status: ${
        task.goal.status || "unknown"
      } | Target Date: ${
        task.goal.targetDate
          ? new Date(task.goal.targetDate).toLocaleDateString()
          : "Not specified"
      }`
    : "Not linked to a goal"
}`
        )
        .join("\n")
    : "No tasks stored."
}
RECENT ACTIVITY:
${
  activities.length
    ? activities
        .map(
          (activity) =>
            `- ${activity.description} (${activity.type})`
        )
        .join("\n")
    : "No recent activity."
}
`;

    // Send personal context + user message to Groq
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
         content: `
You are the user's Personal Digital Twin.

Your job is to provide personalized assistance using the user's stored memories, goals, tasks, and recent activities.

IMPORTANT RESPONSE RULES:
1. Use the PERSONAL CONTEXT below as the only source of truth for the user's personal information.
2. Never invent, assume, or infer personal facts that are not explicitly present in the PERSONAL CONTEXT.
3. Do not claim to know the user's study habits, work schedule, preferred times, preferences, routines, or behavior unless they are explicitly present in the PERSONAL CONTEXT.
4. When recommending a goal or task, use only evidence explicitly available in the PERSONAL CONTEXT.
5. Valid evidence includes goal status, goal target date, task status, task priority, task due date, memory content, and recent activity.
6. Do not invent relationships between tasks and goals. Only mention a task's goal if that relationship is explicitly provided in the PERSONAL CONTEXT.
7. Do not invent deadlines, dates, schedules, or priorities.
8. If the available information is insufficient to make a reliable recommendation, say so clearly.
9. When explaining a recommendation, explicitly mention the data that supports it.
10. Use simple Markdown formatting.
11. Use headings, bold text, numbered lists, and bullet points when appropriate.
12. DO NOT use Markdown tables.
13. Do not add an "AI Twin" heading or emoji at the beginning because the application already displays the AI Twin label.
14. Keep responses clear, concise, and easy to read in a chat interface.

PERSONAL CONTEXT:
${personalContext}
`,
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