const express = require("express");
const Groq = require("groq-sdk");

const Task = require("../models/tasks");
const Goal = require("../models/goal");
const ActivityLog = require("../models/ActivityLog");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// AI BEHAVIORAL INSIGHTS
router.post("/insights", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // Get user's data
    const [tasks, goals, activities] = await Promise.all([
      Task.find({ user: userId }),
      Goal.find({ user: userId }),
      ActivityLog.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50),
    ]);

    // Calculate basic behavioral metrics
    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    const pendingTasks = tasks.filter(
      (task) => task.status === "pending"
    ).length;

    const highPriorityPendingTasks = tasks.filter(
      (task) =>
        task.status === "pending" &&
        task.priority === "high"
    ).length;

    const taskCompletionRate =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    const totalGoals = goals.length;

    const completedGoals = goals.filter(
      (goal) => goal.status === "completed"
    ).length;

    const activeGoals = goals.filter(
      (goal) => goal.status === "active"
    ).length;

    const goalCompletionRate =
      totalGoals > 0
        ? Math.round((completedGoals / totalGoals) * 100)
        : 0;

    const recentActivities = activities.length;

    // Send metrics to Groq
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content: `
You are the Behavioral Analysis component of the user's Personal Digital Twin.

Analyze the behavioral metrics provided below.

RULES:
1. Use only the provided metrics.
2. Never invent personal habits, schedules, preferences, or facts.
3. Do not create specific study times or work schedules.
4. Explain what the numbers indicate.
5. Identify strengths and possible areas for improvement.
6. Give practical recommendations based only on the available data.
7. Use simple Markdown.
8. Use short headings and bullet points.
9. Do not use Markdown tables.
10. Keep the response concise and useful.

BEHAVIORAL METRICS:

Tasks:
- Total tasks: ${totalTasks}
- Completed tasks: ${completedTasks}
- Pending tasks: ${pendingTasks}
- High-priority pending tasks: ${highPriorityPendingTasks}
- Task completion rate: ${taskCompletionRate}%

Goals:
- Total goals: ${totalGoals}
- Active goals: ${activeGoals}
- Completed goals: ${completedGoals}
- Goal completion rate: ${goalCompletionRate}%

Recent activities:
- Recent activities: ${recentActivities}
`,
        },
      ],
    });

    const insight =
      completion.choices[0]?.message?.content ||
      "Unable to generate behavioral insights.";

    res.json({
      message: "AI behavioral insights generated successfully",
      insight,
    });
  } catch (error) {
    console.error("AI behavioral insight error:", error);

    res.status(500).json({
      message: "Failed to generate AI behavioral insights",
    });
  }
});

// BEHAVIORAL SUMMARY
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const [tasks, goals, activities] = await Promise.all([
      Task.find({ user: userId }),
      Goal.find({ user: userId }),
      ActivityLog.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50),
    ]);

    // =========================
    // TASK ANALYSIS
    // =========================

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    const pendingTasks = tasks.filter(
      (task) => task.status === "pending"
    ).length;

    const highPriorityPendingTasks = tasks.filter(
      (task) =>
        task.status === "pending" &&
        task.priority === "high"
    ).length;

    const taskCompletionRate =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    // =========================
    // DATE ANALYSIS
    // =========================

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = tasks.filter((task) => {
      if (!task.dueDate || task.status === "completed") {
        return false;
      }

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      return dueDate < today;
    });

    const upcomingTasks = tasks.filter((task) => {
      if (!task.dueDate || task.status === "completed") {
        return false;
      }

      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      return dueDate >= today;
    });

    // =========================
    // GOAL ANALYSIS
    // =========================

    const totalGoals = goals.length;

    const activeGoals = goals.filter(
      (goal) => goal.status === "active"
    ).length;

    const completedGoals = goals.filter(
      (goal) => goal.status === "completed"
    ).length;

    const goalCompletionRate =
      totalGoals > 0
        ? Math.round((completedGoals / totalGoals) * 100)
        : 0;

    // =========================
    // ACTIVITY ANALYSIS
    // =========================

    const recentActivities = activities.length;

    const taskCreatedActivities = activities.filter(
      (activity) => activity.type === "task_created"
    ).length;

    const taskCompletedActivities = activities.filter(
      (activity) => activity.type === "task_completed"
    ).length;

    // =========================
    // BEHAVIORAL STATUS
    // =========================

    let taskPerformance = "No data";

    if (taskCompletionRate >= 80) {
      taskPerformance = "Excellent";
    } else if (taskCompletionRate >= 60) {
      taskPerformance = "Good";
    } else if (taskCompletionRate >= 40) {
      taskPerformance = "Needs Improvement";
    } else if (totalTasks > 0) {
      taskPerformance = "Low";
    }

    let goalProgress = "No data";

    if (goalCompletionRate >= 80) {
      goalProgress = "Excellent";
    } else if (goalCompletionRate >= 60) {
      goalProgress = "Good";
    } else if (goalCompletionRate >= 40) {
      goalProgress = "Moderate";
    } else if (totalGoals > 0) {
      goalProgress = "Low";
    }

    // =========================
    // RESPONSE
    // =========================

    res.json({
      message: "Behavioral analysis generated successfully",

      analysis: {
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          highPriorityPending: highPriorityPendingTasks,
          completionRate: taskCompletionRate,
          performance: taskPerformance,
        },

        deadlines: {
          overdueTasks: overdueTasks.length,
          upcomingTasks: upcomingTasks.length,
        },

        goals: {
          total: totalGoals,
          active: activeGoals,
          completed: completedGoals,
          completionRate: goalCompletionRate,
          progress: goalProgress,
        },

        activity: {
          recentActivities,
          tasksCreated: taskCreatedActivities,
          tasksCompleted: taskCompletedActivities,
        },
      },
    });
  } catch (error) {
    console.error("Behavior analysis error:", error);

    res.status(500).json({
      message: "Failed to generate behavioral analysis",
    });
  }
});

module.exports = router;