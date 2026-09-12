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

  fetchBehaviorInsight();
}, []);

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
    AI BEHAVIORAL INSIGHTS
========================= */}
<div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl mt-8">

  <div className="flex items-center justify-between">

    <div>
      <h2 className="text-xl font-bold">
        🧠 AI Behavioral Insights
      </h2>

      <p className="text-blue-100 text-sm mt-1">
        Insights generated from your tasks, goals, and activity.
      </p>
    </div>

    <Link
      to="/ai-twin"
      className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
    >
      Talk to AI Twin
    </Link>

  </div>

  <div className="mt-6 bg-white/10 rounded-lg p-5">

    {loadingInsight ? (
      <p className="text-blue-100">
        Analyzing your behavior...
      </p>
    ) : (
      <div className="text-blue-50 leading-relaxed">
  <ReactMarkdown
    components={{
      h2: ({ children }) => (
        <h2 className="text-lg font-bold text-white mt-5 mb-3">
          {children}
        </h2>
      ),

      h3: ({ children }) => (
        <h3 className="text-base font-semibold text-white mt-4 mb-2">
          {children}
        </h3>
      ),

      p: ({ children }) => (
        <p className="mb-3 text-blue-50">
          {children}
        </p>
      ),

      ul: ({ children }) => (
        <ul className="list-disc ml-5 space-y-2 mb-4">
          {children}
        </ul>
      ),

      li: ({ children }) => (
        <li className="text-blue-50">
          {children}
        </li>
      ),

      strong: ({ children }) => (
        <strong className="font-semibold text-white">
          {children}
        </strong>
      ),

      hr: () => (
        <hr className="border-white/20 my-5" />
      ),
    }}
  >
    {behaviorInsight}
  </ReactMarkdown>
</div>
    )}

  </div>

</div>
    </div>
  );
}

export default Dashboard;