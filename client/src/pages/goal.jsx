import { useEffect, useState } from "react";
import API from "../api/api";

function Goals() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // JWT authentication header
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Get all goals of the logged-in user
  const fetchGoals = async () => {
    try {
      const response = await API.get(
        "/goals",
        getAuthConfig()
      );

      setGoals(response.data.goals);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to load goals"
      );
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // Create a new goal
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await API.post(
        "/goals",
        {
          title,
          description,
          targetDate: targetDate || null,
        },
        getAuthConfig()
      );

      setMessage(response.data.message);

      setTitle("");
      setDescription("");
      setTargetDate("");

      fetchGoals();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to create goal"
      );
    } finally {
      setLoading(false);
    }
  };

  // Change goal status
  const handleStatusChange = async (id, currentStatus) => {
    const newStatus =
      currentStatus === "active"
        ? "completed"
        : "active";

    try {
      await API.patch(
        `/goals/${id}`,
        {
          status: newStatus,
        },
        getAuthConfig()
      );

      fetchGoals();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to update goal"
      );
    }
  };

  // Delete goal
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this goal?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(
        `/goals/${id}`,
        getAuthConfig()
      );

      setGoals(
        goals.filter((goal) => goal._id !== id)
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to delete goal"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            🎯 Goals
          </h1>

          <p className="text-gray-500 mt-2">
            Define your goals and let your Digital Twin understand what you want to achieve.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Create Goal */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">

            <h2 className="text-xl font-bold text-gray-800">
              Create New Goal
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 mt-5"
            >
              <input
                type="text"
                placeholder="Goal title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                className="w-full border rounded-lg p-3"
                required
              />

              <textarea
                placeholder="Describe your goal..."
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows="4"
                className="w-full border rounded-lg p-3 resize-none"
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Target Date
                </label>

                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) =>
                    setTargetDate(e.target.value)
                  }
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create Goal"}
              </button>
            </form>

            {message && (
              <p className="text-green-600 text-sm mt-4">
                {message}
              </p>
            )}

            {error && (
              <p className="text-red-600 text-sm mt-4">
                {error}
              </p>
            )}

          </div>

          {/* Goals List */}
          <div className="lg:col-span-2 bg-white border rounded-xl p-6 shadow-sm">

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Your Goals
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {goals.length} goals created
                </p>
              </div>
            </div>

            {goals.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-gray-400">
                  No goals yet.
                </p>

                <p className="text-sm text-gray-400 mt-2">
                  Create your first goal to help your AI Twin understand your objectives.
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {goals.map((goal) => (
                  <div
                    key={goal._id}
                    className="border rounded-xl p-5"
                  >
                    <div className="flex justify-between gap-4">

                      <div className="flex-1">

                        <div className="flex items-center gap-3 flex-wrap">

                          <span
                            className={`text-xs px-3 py-1 rounded-full ${
                              goal.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {goal.status}
                          </span>

                          {goal.targetDate && (
                            <span className="text-xs text-gray-400">
                              Target:{" "}
                              {new Date(
                                goal.targetDate
                              ).toLocaleDateString()}
                            </span>
                          )}

                        </div>

                        <h3
                          className={`font-semibold text-lg mt-3 ${
                            goal.status === "completed"
                              ? "line-through text-gray-400"
                              : "text-gray-800"
                          }`}
                        >
                          {goal.title}
                        </h3>

                        {goal.description && (
                          <p className="text-gray-500 text-sm mt-2">
                            {goal.description}
                          </p>
                        )}

                      </div>

                      <div className="flex flex-col gap-2">

                        <button
                          onClick={() =>
                            handleStatusChange(
                              goal._id,
                              goal.status
                            )
                          }
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {goal.status === "active"
                            ? "Mark Completed"
                            : "Mark Active"}
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(goal._id)
                          }
                          className="text-sm text-red-500 hover:underline"
                        >
                          Delete
                        </button>

                      </div>

                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default Goals;