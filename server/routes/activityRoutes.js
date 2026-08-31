const express = require("express");

const ActivityLog = require("../models/ActivityLog");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// GET USER ACTIVITY LOGS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const activities = await ActivityLog.find({
      user: req.userId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(100);

    res.json({
      activities,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch activities",
    });
  }
});


// CREATE ACTIVITY LOG
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      type,
      description,
      relatedId,
      metadata,
    } = req.body;

    if (!type || !description) {
      return res.status(400).json({
        message:
          "Activity type and description are required",
      });
    }

    const activity = await ActivityLog.create({
      user: req.userId,
      type,
      description,
      relatedId: relatedId || null,
      metadata: metadata || {},
    });

    res.status(201).json({
      message: "Activity logged successfully",
      activity,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create activity",
    });
  }
});


module.exports = router;