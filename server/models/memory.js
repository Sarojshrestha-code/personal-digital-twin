const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "personal",
        "study",
        "work",
        "goal",
        "habit",
        "other",
      ],
      default: "personal",
    },
  },
  {
    timestamps: true,
  }
);

const Memory = mongoose.model("Memory", memorySchema);

module.exports = Memory;