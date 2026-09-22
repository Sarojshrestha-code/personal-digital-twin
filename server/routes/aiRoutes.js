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
    const today = new Date();

const todayDate = today.toLocaleDateString("en-CA");
    const personalContext = `
    TODAY'S DATE:
${todayDate}

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
2. Never invent, assume, or fabricate personal facts.
3. Do not claim to know the user's habits, routine, schedule, preferred study times, work hours, preferences, or behavior unless explicitly provided in the PERSONAL CONTEXT.
4. Do not invent dates, deadlines, priorities, task relationships, or goal relationships.
5. When recommending a task, use evidence from its status, priority, due date, description, or linked goal.
6. For task prioritization questions, use this exact order:

   1. Overdue pending tasks.
   2. Among tasks with the same overdue status, higher priority.
   3. Among tasks with the same priority, earlier due date.
   4. If still tied, prefer a task linked to an active goal.

7. When the user asks what they should work on first, which task to prioritize, what task is most urgent, or what they should do today:
   - Recommend only from the actual pending tasks in PERSONAL CONTEXT.
   - Explain the recommendation using the task's actual priority, due date, overdue status, and linked goal.
   - Do NOT create a study schedule or work schedule.
   - Do NOT suggest a specific time, duration, day, evening, morning, weekend, or study window unless that information is explicitly present in PERSONAL CONTEXT.
8. Never say that the user "usually" studies, works, or follows a particular routine unless that information is explicitly present in PERSONAL CONTEXT.9. If no due date exists, clearly state that the task has no due date rather than assuming one.
10. If there is not enough information to create a reliable plan, say so.
11. For task prioritization questions, do not provide a "Suggested Study Window", "Suggested Time", "Study Schedule", or similar section unless the user's available schedule is explicitly provided in PERSONAL CONTEXT.12. Use simple and clean Markdown formatting.
13. Use headings, bold text, numbered lists, and bullet lists when appropriate.
14. IMPORTANT LIST FORMATTING:
   - Keep each bullet point on the same line as its bullet marker.
   - Keep each numbered item on the same line as its number.
   - Do NOT put a blank line between a list marker and its text.
   - Do NOT create a list item with the number or bullet on a separate line.
   - For numbered recommendations, use this format:
     1. **Task or Goal Name** — explanation.
     2. **Task or Goal Name** — explanation.
     3. **Task or Goal Name** — explanation.
   - For bullet points, use this format:
     - **Task or Goal Name** — explanation.
     - **Task or Goal Name** — explanation.
   - If an item needs additional explanation, put it on the following indented line rather than separating the marker from the item title.
15. DO NOT use Markdown tables.
16. Do not add an "AI Twin" heading or emoji at the beginning because the application already displays the AI Twin label.
17. Keep responses clear, concise, and easy to read in a chat interface.
18. When displaying a task due date, show ONLY the calendar date in YYYY-MM-DD format. Never display a time unless a time is explicitly stored in PERSONAL CONTEXT.

19. Do not calculate or state how many days remain until a deadline unless the number of days is explicitly provided by the application.

20. Do not invent phrases such as "nearest deadline", "only X days away", or "soonest deadline" unless they can be directly verified from PERSONAL CONTEXT.

21. When answering task-priority questions, keep the response focused on task selection and its evidence. Do not add study sessions, work schedules, durations, or time windows.

22. If there is only one pending task, simply identify that task and explain why using its actual status, priority, due date, and goal information.

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

// =====================================================
// AI TWIN - TASK PRIORITIZATION
// =====================================================

router.post("/prioritize", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // -------------------------------------------------
    // Get user's pending tasks and goals
    // -------------------------------------------------

    const [tasks, goals] = await Promise.all([
      Task.find({
        user: userId,
        status: "pending",
      }).populate(
        "goal",
        "title status targetDate"
      ),

      Goal.find({
        user: userId,
      }),
    ]);

    // -------------------------------------------------
    // Check if there are pending tasks
    // -------------------------------------------------

    if (tasks.length === 0) {
      return res.json({
        message: "No pending tasks found",
        recommendation: null,
        tasks: [],
      });
    }

    // -------------------------------------------------
    // Today's date
    // -------------------------------------------------

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    // -------------------------------------------------
    // Prepare task data for AI
    // -------------------------------------------------

    const taskDetails = tasks.map((task) => {
      let dueDate = null;
      let isOverdue = false;

      if (task.dueDate) {
        dueDate = new Date(task.dueDate);

        const comparisonDate =
          new Date(dueDate);

        comparisonDate.setHours(0, 0, 0, 0);

        isOverdue =
          comparisonDate < today;
      }

      return {
        id: task._id.toString(),

        title: task.title,

        priority:
          task.priority || "medium",

        dueDate: dueDate
          ? dueDate
              .toISOString()
              .split("T")[0]
          : "No due date",

        isOverdue,

        description:
          task.description ||
          "No description",

        goal: task.goal
          ? {
              title: task.goal.title,
              status:
                task.goal.status ||
                "unknown",
              targetDate:
                task.goal.targetDate
                  ? new Date(
                      task.goal.targetDate
                    )
                      .toISOString()
                      .split("T")[0]
                  : "No target date",
            }
          : null,
      };
    });

    // -------------------------------------------------
    // Send task data to Groq
    // -------------------------------------------------

    const completion =
      await groq.chat.completions.create({
        model:
          "openai/gpt-oss-20b",

        messages: [
          {
            role: "system",

            content: `
You are the Decision Support component of the user's Personal Digital Twin.

Your job is to determine which pending task should receive attention first.

Use ONLY the task information provided below.

PRIORITIZATION RULES:

1. Overdue tasks should receive the highest attention.
2. Among non-overdue tasks, consider the nearest due date.
3. Higher-priority tasks should receive more attention.
4. Tasks linked to active goals can receive additional consideration.
5. Never invent task information.
6. Never invent deadlines.
7. Never claim a task is overdue unless isOverdue is true.
8. If a task has no due date, clearly state that it has no due date.
9. Use the actual task title.
10. Use the actual goal title when a goal exists.
11. Give a concise explanation based on the provided data.
12. Do not create a specific clock time or schedule.
13. Do not use Markdown tables.
14. Use simple Markdown.
15. Keep the response concise.

RESPONSE FORMAT:

## Recommended task

**Task Name**

- **Priority:** actual priority
- **Due date:** actual due date
- **Goal:** actual goal or "No linked goal"
- **Reason:** explain why this task should receive attention first using only the provided data.

## Other pending tasks

- **Task Name** — short factual explanation.
- **Task Name** — short factual explanation.

TODAY'S DATE:
${today.toISOString().split("T")[0]}

PENDING TASKS:

${taskDetails
  .map(
    (task) => `
Task ID: ${task.id}
Title: ${task.title}
Priority: ${task.priority}
Due Date: ${task.dueDate}
Overdue: ${task.isOverdue}
Description: ${task.description}
Goal: ${
      task.goal
        ? `${task.goal.title} | Status: ${task.goal.status} | Target Date: ${task.goal.targetDate}`
        : "No linked goal"
    }
`
  )
  .join("\n")}
`,
          },
        ],
      });

    // -------------------------------------------------
    // Get AI recommendation
    // -------------------------------------------------

    const recommendation =
      completion.choices[0]?.message
        ?.content ||
      "Unable to generate task prioritization.";

    // -------------------------------------------------
    // Send response
    // -------------------------------------------------

    res.json({
      message:
        "AI task prioritization generated successfully",

      recommendation,

      tasks: taskDetails,
    });

  } catch (error) {

    console.error(
      "AI task prioritization error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to generate task prioritization",
    });
  }
});

module.exports = router;