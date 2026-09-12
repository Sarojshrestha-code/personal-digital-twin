import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import API from "../api/api";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  // Dashboard statistics
  const [totalGoals, setTotalGoals] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalMemories, setTotalMemories] = useState(0);
  
  // AI Behavioral Summary
const [behaviorSummary, setBehaviorSummary] = useState(null);
const [loadingBehavior, setLoadingBehavior] = useState(true);

  // AI Behavioral Insights
const [behaviorInsight, setBehaviorInsight] = useState("");
const [loadingInsight, setLoadingInsight] = useState(true);

  // Recent activity
  const [activities, setActivities] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // Fetch dashboard data
 useEffect(() => {
  fetchRecentActivity();
  fetchDashboardStats();
  fetchBehaviorInsight();
  fetchBehaviorSummary();
}, []);

// =========================
// FETCH AI BEHAVIORAL INSIGHT
// =========================
const fetchBehaviorInsight = async () => {
  try {
    setLoadingInsight(true);

    const response = await API.post("/behaviors/insights");

    setBehaviorInsight(
      response.data.insight ||
        "No behavioral insight available yet."
    );

  } catch (error) {
    console.error(
      "Failed to fetch AI behavioral insight:",
      error
    );

    setBehaviorInsight(
      "Unable to generate behavioral insight right now."
    );

  } finally {
    setLoadingInsight(false);
  }
};

const fetchBehaviorSummary = async () => {
  try {
    setLoadingBehavior(true);

    const response = await API.get("/behaviors/summary");

    setBehaviorSummary(
      response.data.analysis || null
    );

  } catch (error) {
    console.error(
      "Failed to fetch behavioral summary:",
      error
    );

  } finally {
    setLoadingBehavior(false);
  }
};

  // =========================
  // FETCH RECENT ACTIVITY
  // =========================
  const fetchRecentActivity = async () => {
    try {
      const response = await API.get("/activity");

      // Show only latest 5 activities
      setActivities(
        (response.data.activities || []).slice(0, 5)
      );
    } catch (error) {
      console.error(
        "Failed to fetch recent activity:",
        error
      );
    } finally {
      setLoadingActivity(false);
    }
  };

  // =========================
  // FETCH DASHBOARD STATISTICS
  // =========================
  const fetchDashboardStats = async () => {
    try {
      const [
        goalsResponse,
        tasksResponse,
        memoriesResponse,
      ] = await Promise.all([
        API.get("/goals"),
        API.get("/tasks"),
        API.get("/memories"),
      ]);

      const goals = goalsResponse.data.goals || [];
      const tasks = tasksResponse.data.tasks || [];
      const memories =
        memoriesResponse.data.memories || [];

      // Total goals
      setTotalGoals(goals.length);

      // Completed tasks
      setCompletedTasks(
        tasks.filter(
          (task) => task.status === "completed"
        ).length
      );

      // Total memories
      setTotalMemories(memories.length);

    } catch (error) {
      console.error(
        "Failed to fetch dashboard statistics:",
        error
      );
    }
  };

  // =========================
  // FORMAT ACTIVITY TYPE
  // =========================
  const formatActivityType = (type) => {
    return type.replaceAll("_", " ");
  };

  // =========================
  // DASHBOARD UI
  // =========================
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">

      {/* =========================
          WELCOME SECTION
      ========================= */}
      <div className="mb-8">

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Welcome back, {user?.name || "User"} 👋
        </h1>

        <p className="text-gray-500 mt-2">
          Here's an overview of your Personal Digital Twin.
        </p>

      </div>


      {/* =========================
          STATISTICS CARDS
      ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* TOTAL GOALS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">

          <p className="text-gray-500 text-sm">
            Total Goals
          </p>

          <h2 className="text-3xl font-bold mt-2 text-blue-600">
            {totalGoals}
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Goals you are working on
          </p>

        </div>


        {/* COMPLETED TASKS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">

          <p className="text-gray-500 text-sm">
            Completed Tasks
          </p>

          <h2 className="text-3xl font-bold mt-2 text-green-600">
            {completedTasks}
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Tasks completed
          </p>

        </div>


        {/* PERSONAL MEMORIES */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">

          <p className="text-gray-500 text-sm">
            Personal Memories
          </p>

          <h2 className="text-3xl font-bold mt-2 text-purple-600">
            {totalMemories}
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Stored notes and memories
          </p>

        </div>


        {/* AI TWIN STATUS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">

          <p className="text-gray-500 text-sm">
            AI Twin Status
          </p>

          <h2 className="text-lg font-bold mt-3 text-green-600">
            ● Ready
          </h2>

          <p className="text-sm text-gray-400 mt-2">
            Your assistant is available
          </p>

        </div>

      </div>


      {/* =========================
          MAIN DASHBOARD CONTENT
      ========================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">


        {/* =========================
            QUICK ACTIONS
        ========================= */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">

          <h2 className="text-xl font-bold text-gray-800">
            Quick Actions
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Start interacting with your Digital Twin.
          </p>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">


            {/* MEMORY */}
            <Link
              to="/memory"
              className="border rounded-lg p-4 hover:bg-blue-50 hover:border-blue-400 transition"
            >

              <h3 className="font-semibold">
                🧠 Add Memory
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Save notes, thoughts, or important information.
              </p>

            </Link>


            {/* GOALS */}
            <Link
              to="/goals"
              className="border rounded-lg p-4 hover:bg-green-50 hover:border-green-400 transition"
            >

              <h3 className="font-semibold">
                🎯 Create Goal
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Set a new personal or professional goal.
              </p>

            </Link>


            {/* TASKS */}
            <Link
              to="/tasks"
              className="border rounded-lg p-4 hover:bg-purple-50 hover:border-purple-400 transition"
            >

              <h3 className="font-semibold">
                ✅ Manage Tasks
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Organize and track your tasks.
              </p>

            </Link>


            {/* AI TWIN */}
            <Link
              to="/ai-twin"
              className="border rounded-lg p-4 hover:bg-orange-50 hover:border-orange-400 transition"
            >

              <h3 className="font-semibold">
                🤖 Talk to AI Twin
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Ask for personalized assistance.
              </p>

            </Link>

          </div>

        </div>


        {/* =========================
            RECENT ACTIVITY
        ========================= */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">


          {/* HEADER */}
          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold text-gray-800">
                Recent Activity
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Your latest interactions will appear here.
              </p>

            </div>


            <Link
              to="/activity"
              className="text-blue-600 text-sm hover:underline"
            >
              View All
            </Link>

          </div>


          {/* ACTIVITY CONTENT */}
          <div className="mt-6">


            {/* LOADING */}
            {loadingActivity && (
              <p className="text-gray-400 text-center py-10">
                Loading activity...
              </p>
            )}


            {/* NO ACTIVITY */}
            {!loadingActivity &&
              activities.length === 0 && (
                <div className="text-center py-10">

                  <p className="text-gray-400 text-lg">
                    No activity yet.
                  </p>

                  <p className="text-gray-400 text-sm mt-2">
                    Start adding memories, goals, or tasks
                    to see your activity.
                  </p>

                </div>
              )}


            {/* ACTIVITY LIST */}
            {!loadingActivity &&
              activities.length > 0 && (

                <div className="space-y-3">

                  {activities.map((activity) => (

                    <div
                      key={activity._id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition"
                    >

                      <div className="flex justify-between items-start gap-4">

                        <div>

                          <h3 className="font-semibold text-gray-800 capitalize">
                            {formatActivityType(
                              activity.type
                            )}
                          </h3>

                          <p className="text-sm text-gray-600 mt-1">
                            {activity.description}
                          </p>

                        </div>


                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(
                            activity.createdAt
                          ).toLocaleDateString()}
                        </span>

                      </div>

                    </div>

                  ))}

                </div>

              )}

          </div>

        </div>

      </div>


      {/* =========================
    {/* =========================
    AI BEHAVIORAL INSIGHTS
========================= */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-200 mt-8 overflow-hidden">

  {/* Header */}
  <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

    <div>
      <div className="flex items-center gap-2">
        <span className="text-2xl">🧠</span>

        <h2 className="text-xl font-bold text-gray-900">
          AI Behavioral Insights
        </h2>
      </div>

      <p className="text-gray-500 text-sm mt-1">
        Your Personal Digital Twin analyzes your recent behavior and progress.
      </p>
    </div>

    <Link
      to="/ai-twin"
      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
    >
      Talk to AI Twin
    </Link>

  </div>


  {/* Behavioral Metrics */}
  <div className="p-6">

    {loadingBehavior ? (

      <div className="text-center py-8 text-gray-500">
        Analyzing your behavior...
      </div>

    ) : behaviorSummary ? (

      <>
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Task Completion */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">

            <p className="text-sm text-gray-500">
              Task Completion
            </p>

            <div className="flex items-end gap-2 mt-2">

              <span className="text-3xl font-bold text-blue-600">
                {behaviorSummary.tasks.completionRate}%
              </span>

              <span className="text-sm text-gray-500 mb-1">
                {behaviorSummary.tasks.performance}
              </span>

            </div>

            <p className="text-xs text-gray-500 mt-2">
              {behaviorSummary.tasks.completed} of{" "}
              {behaviorSummary.tasks.total} tasks completed
            </p>

          </div>


          {/* Goal Progress */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">

            <p className="text-sm text-gray-500">
              Goal Progress
            </p>

            <div className="flex items-end gap-2 mt-2">

              <span className="text-3xl font-bold text-indigo-600">
                {behaviorSummary.goals.completionRate}%
              </span>

              <span className="text-sm text-gray-500 mb-1">
                {behaviorSummary.goals.progress}
              </span>

            </div>

            <p className="text-xs text-gray-500 mt-2">
              {behaviorSummary.goals.completed} of{" "}
              {behaviorSummary.goals.total} goals completed
            </p>

          </div>


          {/* Activity */}
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">

            <p className="text-sm text-gray-500">
              Recent Activity
            </p>

            <div className="flex items-end gap-2 mt-2">

              <span className="text-3xl font-bold text-purple-600">
                {behaviorSummary.activity.recentActivities}
              </span>

              <span className="text-sm text-gray-500 mb-1">
                actions
              </span>

            </div>

            <p className="text-xs text-gray-500 mt-2">
              {behaviorSummary.activity.tasksCompleted} tasks completed
            </p>

          </div>

        </div>


        {/* Status Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

          {/* Strengths */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-5">

            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <span>✓</span>
              Current Strengths
            </h3>

            <ul className="mt-3 space-y-2 text-sm text-gray-600">

              {behaviorSummary.tasks.completionRate >= 60 && (
                <li>
                  • Strong task completion performance
                </li>
              )}

              {behaviorSummary.goals.completionRate >= 60 && (
                <li>
                  • Good progress toward your goals
                </li>
              )}

              {behaviorSummary.activity.recentActivities > 0 && (
                <li>
                  • Consistent recent activity
                </li>
              )}

              {behaviorSummary.tasks.completionRate < 60 &&
                behaviorSummary.goals.completionRate < 60 && (
                  <li>
                    • Building a consistent productivity pattern
                  </li>
              )}

            </ul>

          </div>


          {/* Areas to Improve */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">

            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <span>⚠</span>
              Areas to Improve
            </h3>

            <ul className="mt-3 space-y-2 text-sm text-gray-600">

              {behaviorSummary.tasks.highPriorityPending > 0 && (
                <li>
                  • {behaviorSummary.tasks.highPriorityPending} high-priority task(s) pending
                </li>
              )}

              {behaviorSummary.deadlines.overdueTasks > 0 && (
                <li>
                  • {behaviorSummary.deadlines.overdueTasks} overdue task(s) need attention
                </li>
              )}

              {behaviorSummary.goals.completionRate < 60 && (
                <li>
                  • Goal completion needs improvement
                </li>
              )}

              {behaviorSummary.tasks.highPriorityPending === 0 &&
                behaviorSummary.deadlines.overdueTasks === 0 &&
                behaviorSummary.goals.completionRate >= 60 && (
                  <li>
                    • No major issues detected from current data
                  </li>
              )}

            </ul>

          </div>

        </div>


        {/* AI Insight */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-2 mb-3">

            <span className="text-lg">🤖</span>

            <h3 className="font-semibold text-gray-900">
              AI Analysis
            </h3>

          </div>

          {loadingInsight ? (

            <p className="text-gray-500 text-sm">
              Generating personalized analysis...
            </p>

          ) : (

            <div className="text-gray-700 text-sm leading-relaxed">

              <ReactMarkdown
                components={{

                  h2: ({ children }) => (
                    <h2 className="text-base font-bold text-gray-900 mt-4 mb-2">
                      {children}
                    </h2>
                  ),

                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-2">
                      {children}
                    </h3>
                  ),

                  p: ({ children }) => (
                    <p className="mb-2">
                      {children}
                    </p>
                  ),

                  ul: ({ children }) => (
                    <ul className="list-disc ml-5 space-y-1 mb-3">
                      {children}
                    </ul>
                  ),

                  li: ({ children }) => (
                    <li>
                      {children}
                    </li>
                  ),

                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">
                      {children}
                    </strong>
                  ),

                  hr: () => (
                    <hr className="border-gray-200 my-4" />
                  ),

                }}
              >
                {behaviorInsight}
              </ReactMarkdown>

            </div>

          )}

        </div>

      </>

    ) : (

      <div className="text-center py-8 text-gray-500">
        Behavioral data is not available yet.
      </div>

    )}

  </div>

</div>
    </div>
  );
}

export default Dashboard;