const express = require("express");

const Memory = require("../models/memory");
const authMiddleware = require("../middleware/authMiddleware");
const logActivity = require("../utils/activityLogger");

const router = express.Router();

/*
  CREATE MEMORY
  POST /api/memories
*/

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { content, category } = req.body;

    if (!content) {
      return res.status(400).json({
        message: "Memory content is required",
      });
    }

    const memory = await Memory.create({
      user: req.userId,
      content,
      category,
    });

    await logActivity({
  userId: req.userId,
  type: "memory_created",
  description: `Created memory: ${memory.content}`,
  relatedId: memory._id,
});

    res.status(201).json({
      message: "Memory saved successfully",
      memory,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to save memory",
    });
  }
});

/*
  GET USER MEMORIES
  GET /api/memories
*/

router.get("/", authMiddleware, async (req, res) => {
  try {
    const memories = await Memory.find({
      user: req.userId,
    }).sort({
      createdAt: -1,
    });

    res.json({
      memories,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch memories",
    });
  }
});

/*
  DELETE MEMORY
  DELETE /api/memories/:id
*/

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const memory = await Memory.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    
    if (!memory) {
      return res.status(404).json({
        message: "Memory not found",
      });
    }

    await logActivity({
  userId: req.userId,
  type: "memory_deleted",
  description: `Deleted memory: ${memory.content}`,
  relatedId: memory._id,
});

    res.json({
      message: "Memory deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete memory",
    });
  }
});

module.exports = router;