 import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // =====================================================
  // STATE
  // =====================================================

  const [behaviorInsight, setBehaviorInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(true);

  const [totalGoals, setTotalGoals] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalMemories, setTotalMemories] = useState(0);

  const [loadingStats, setLoadingStats] = useState(true);


  // =====================================================
  // FETCH AI BEHAVIORAL INSIGHT
  // =====================================================

  useEffect(() => {
    const fetchBehaviorInsight = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/behaviors/insights",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBehaviorInsight(response.data.insight);
      } catch (error) {
        console.error(
          "Failed to fetch behavioral insight:",
          error
        );

        setBehaviorInsight(
          "Unable to generate behavioral insights right now."
        );
      } finally {
        setLoadingInsight(false);
      }
    };

    if (token) {
      fetchBehaviorInsight();
    } else {
      setLoadingInsight(false);

      setBehaviorInsight(
        "Please log in to view your behavioral insights."
      );
    }
  }, [token]);


  // =====================================================
  // FETCH DASHBOARD STATISTICS
  // =====================================================

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          goalsResponse,
          tasksResponse,
          memoriesResponse,
        ] = await Promise.all([
          axios.get(
            "http://localhost:5000/api/goals",
            {
              headers,
            }
          ),

          axios.get(
            "http://localhost:5000/api/tasks",
            {
              headers,
            }
          ),

          axios.get(
            "http://localhost:5000/api/memories",
            {
              headers,
            }
          ),
        ]);


        // =================================================
        // HANDLE DIFFERENT API RESPONSE STRUCTURES
        // =================================================

        const goals =
          goalsResponse.data.goals ||
          goalsResponse.data.data ||
          goalsResponse.data ||
          [];

        const tasks =
          tasksResponse.data.tasks ||
          tasksResponse.data.data ||
          tasksResponse.data ||
          [];

        const memories =
          memoriesResponse.data.memories ||
          memoriesResponse.data.data ||
          memoriesResponse.data ||
          [];


        // =================================================
        // UPDATE STATISTICS
        // =================================================

        setTotalGoals(
          Array.isArray(goals)
            ? goals.length
            : 0
        );


        setCompletedTasks(
          Array.isArray(tasks)
            ? tasks.filter(
                (task) =>
                  task.status === "completed"
              ).length
            : 0
        );


        setTotalMemories(
          Array.isArray(memories)
            ? memories.length
            : 0
        );

      } catch (error) {
        console.error(
          "Failed to fetch dashboard statistics:",
          error
        );
      } finally {
        setLoadingStats(false);
      }
    };


    if (token) {
      fetchDashboardStats();
    } else {
      setLoadingStats(false);
    }

  }, [token]);


  // =====================================================
  // DASHBOARD UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">

      {/* =====================================================
          WELCOME
      ===================================================== */}

      <div className="mb-8">

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Welcome back, {user?.name || "User"} 👋
        </h1>

        <p className="text-gray-500 mt-2">
          Here's an overview of your Personal Digital Twin.
        </p>

      </div>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">


        {/* TOTAL GOALS */}

        <div className="bg-white p-6 rounded-xl shadow-sm border">

          <p className="text-gray-500 text-sm">
            Total Goals
          </p>

          <h2 className="text-3xl font-bold mt-2 text-blue-600">
            {loadingStats ? "..." : totalGoals}
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
            {loadingStats ? "..." : completedTasks}
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
            {loadingStats ? "..." : totalMemories}
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


      {/* =====================================================
          QUICK ACTIONS + RECENT ACTIVITY
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">


        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

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


            {/* GOAL */}

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


            {/* TASK */}

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


        {/* ===================================================
            RECENT ACTIVITY
        =================================================== */}

        <div className="bg-white p-6 rounded-xl shadow-sm border">

          <h2 className="text-xl font-bold text-gray-800">
            Recent Activity
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Your latest interactions will appear here.
          </p>


          <div className="mt-6 text-center py-10">

            <p className="text-gray-400 text-lg">
              No activity yet.
            </p>

            <p className="text-gray-400 text-sm mt-2">
              Start adding memories, goals, or tasks to see
              your activity.
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          AI BEHAVIORAL INSIGHTS
      ===================================================== */}

      <div className="bg-white border rounded-xl shadow-sm mt-8 overflow-hidden">


        {/* HEADER */}

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold">
                🧠 AI Behavioral Insights
              </h2>

              <p className="text-blue-100 text-sm mt-1">
                Personalized insights based on your tasks,
                goals, and recent activity.
              </p>

            </div>

            <div className="text-3xl">
              📊
            </div>

          </div>

        </div>


        {/* INSIGHT CONTENT */}

        <div className="p-6">

          {loadingInsight ? (

            <div className="flex items-center gap-3 text-gray-500 py-6">

              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

              <p>
                Analyzing your behavior...
              </p>

            </div>

          ) : (

            <div className="text-gray-700 leading-relaxed">

              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{

                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold mb-3 text-gray-800">
                      {children}
                    </h1>
                  ),

                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold mb-3 mt-4 text-gray-800">
                      {children}
                    </h2>
                  ),

                  h3: ({ children }) => (
                    <h3 className="font-bold mb-2 mt-3 text-gray-800">
                      {children}
                    </h3>
                  ),

                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0">
                      {children}
                    </p>
                  ),

                  ul: ({ children }) => (
                    <ul className="list-disc list-outside ml-6 mb-4 space-y-2">
                      {children}
                    </ul>
                  ),

                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside ml-6 mb-4 space-y-2">
                      {children}
                    </ol>
                  ),

                  li: ({ children }) => (
                    <li className="pl-1 leading-relaxed">
                      {children}
                    </li>
                  ),

                  strong: ({ children }) => (
                    <strong className="font-bold text-gray-900">
                      {children}
                    </strong>
                  ),

                  em: ({ children }) => (
                    <em className="italic">
                      {children}
                    </em>
                  ),

                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border border-gray-300 text-sm">
                        {children}
                      </table>
                    </div>
                  ),

                  thead: ({ children }) => (
                    <thead className="bg-gray-200">
                      {children}
                    </thead>
                  ),

                  th: ({ children }) => (
                    <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                      {children}
                    </th>
                  ),

                  td: ({ children }) => (
                    <td className="border border-gray-300 px-3 py-2">
                      {children}
                    </td>
                  ),

                }}
              >
                {behaviorInsight}
              </ReactMarkdown>

            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          AI TWIN CHAT
      ===================================================== */}

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl mt-8">

        <h2 className="text-xl font-bold">
          🤖 Talk to Your AI Twin
        </h2>

        <p className="mt-2 text-blue-100">
          Ask your Personal Digital Twin about your goals,
          tasks, memories, productivity, or decisions.
        </p>

        <Link
          to="/ai-twin"
          className="inline-block mt-4 bg-white text-blue-600 px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
        >
          Start Conversation
        </Link>

      </div>

    </div>
  );
}

export default Dashboard;