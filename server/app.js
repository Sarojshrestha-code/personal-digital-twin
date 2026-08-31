 const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const memoryRoutes = require("./routes/memoryRoutes");
const goalRoutes = require("./routes/goalRoutes");
const taskRoutes = require("./routes/taskRoutes");
const activityRoutes = require("./routes/activityRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Personal Digital Twin API is running 🚀",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activity", activityRoutes);

module.exports = app;