const express = require("express");

const Goal = require("../models/goal");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// CREATE GOAL
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, targetDate } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Goal title is required",
      });
    }

    const goal = await Goal.create({
      user: req.userId,
      title,
      description,
      targetDate,
    });

    res.status(201).json({
      message: "Goal created successfully",
      goal,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create goal",
    });
  }
});


// GET USER GOALS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({
      user: req.userId,
    }).sort({
      createdAt: -1,
    });

    res.json({
      goals,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch goals",
    });
  }
});


// UPDATE GOAL STATUS
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Status must be active or completed",
      });
    }

    const goal = await Goal.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.userId,
      },
      {
        status,
      },
      {
        new: true,
      }
    );

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    res.json({
      message: "Goal updated successfully",
      goal,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update goal",
    });
  }
});


// DELETE GOAL
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    res.json({
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete goal",
    });
  }
});


module.exports = router;