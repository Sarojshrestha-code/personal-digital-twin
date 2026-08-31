const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "memory_created",
        "memory_deleted",
        "goal_created",
        "goal_completed",
        "goal_deleted",
        "task_created",
        "task_completed",
        "task_deleted",
        "login",
        "other",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const ActivityLog = mongoose.model(
  "ActivityLog",
  activityLogSchema
);

module.exports = ActivityLog;