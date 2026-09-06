const express = require("express");

const Task = require("../models/tasks");
const Goal = require("../models/goal");
const ActivityLog = require("../models/ActivityLog");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// BEHAVIORAL ANALYSIS
router.get("/analysis", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // Get user's tasks, goals, and activities
    const [tasks, goals, activities] = await Promise.all([
      Task.find({ user: userId }),

      Goal.find({ user: userId }),

      ActivityLog.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50),
    ]);

    // Task statistics
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

    // Task completion rate
    const taskCompletionRate =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    // Goal statistics
    const totalGoals = goals.length;

    const activeGoals = goals.filter(
      (goal) => goal.status === "active"
    ).length;

    const completedGoals = goals.filter(
      (goal) => goal.status === "completed"
    ).length;

    // Recent activity statistics
    const recentActivities = activities.length;

    res.json({
      message: "Behavioral analysis generated successfully",

      analysis: {
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          highPriorityPending: highPriorityPendingTasks,
          completionRate: taskCompletionRate,
        },

        goals: {
          total: totalGoals,
          active: activeGoals,
          completed: completedGoals,
        },

        activity: {
          recentActivities,
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