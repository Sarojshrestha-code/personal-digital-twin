 const express = require("express");

const Task = require("../models/tasks");
const authMiddleware = require("../middleware/authMiddleware");
const logActivity = require("../utils/activityLogger");

const router = express.Router();


// ==========================================
// CREATE TASK
// ==========================================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      goal,
      title,
      description,
      priority,
      dueDate,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    const task = await Task.create({
      user: req.userId,
      goal: goal || null,
      title,
      description,
      priority,
      dueDate: dueDate || null,
    });

    // Automatically log task creation
    await logActivity({
      userId: req.userId,
      type: "task_created",
      description: `Created task: ${task.title}`,
      relatedId: task._id,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create task",
    });
  }
});


// ==========================================
// GET USER TASKS
// ==========================================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.userId,
    })
      .populate("goal", "title")
      .sort({
        createdAt: -1,
      });

    res.json({
      tasks,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
});


// ==========================================
// UPDATE TASK STATUS
// ==========================================
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Status must be pending or completed",
      });
    }

    // First find the task
   const existingTask = await Task.findOne({
  _id: req.params.id,
  user: req.userId,
});

if (!existingTask) {
  return res.status(404).json({
    message: "Task not found",
  });
}

// Remember the previous status
const previousStatus = existingTask.status;

// Update task
existingTask.status = status;

const task = await existingTask.save();

// Log only when changing from pending to completed
if (
  previousStatus !== "completed" &&
  status === "completed"
) {
      await logActivity({
        userId: req.userId,
        type: "task_completed",
        description: `Completed task: ${task.title}`,
        relatedId: task._id,
      });
    }

    res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update task",
    });
  }
});


// ==========================================
// DELETE TASK
// ==========================================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Automatically log task deletion
    await logActivity({
      userId: req.userId,
      type: "task_deleted",
      description: `Deleted task: ${task.title}`,
      relatedId: task._id,
    });

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete task",
    });
  }
});


module.exports = router;