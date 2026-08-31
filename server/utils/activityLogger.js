const ActivityLog = require("../models/ActivityLog");

const logActivity = async ({
  userId,
  type,
  description,
  relatedId = null,
  metadata = {},
}) => {
  try {

    console.log("📊 Logging activity:", {
      userId,
      type,
      description,
    });

    const activity = await ActivityLog.create({
      user: userId,
      type,
      description,
      relatedId,
      metadata,
    });

    console.log(
      "✅ Activity saved:",
      activity._id
    );

  } catch (error) {

    console.error(
      "❌ Activity logging failed:",
      error.message
    );
  }
};

module.exports = logActivity;