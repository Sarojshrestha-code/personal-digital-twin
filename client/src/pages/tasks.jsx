 import { useEffect, useState } from "react";
import API from "../api/api";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
``
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // JWT configuration
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await API.get(
        "/tasks",
        getAuthConfig()
      );

      setTasks(response.data.tasks);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load tasks"
      );
    }
  };

  // Fetch goals
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
    fetchTasks();
    fetchGoals();
  }, []);

  // Create task
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await API.post(
        "/tasks",
        {
          title,
          description,
          goal: goal || null,
          priority,
          dueDate: dueDate || null,
        },
        getAuthConfig()
      );

      setMessage(response.data.message);

      // Clear form
      setTitle("");
      setDescription("");
      setGoal("");
      setPriority("medium");
      setDueDate("");

      fetchTasks();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create task"
      );
    } finally {
      setLoading(false);
    }
  };

  // Change task status
  const handleStatusChange = async (
    id,
    currentStatus
  ) => {
    const newStatus =
      currentStatus === "pending"
        ? "completed"
        : "pending";

    try {
      await API.patch(
        `/tasks/${id}`,
        {
          status: newStatus,
        },
        getAuthConfig()
      );

      fetchTasks();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update task"
      );
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(
        `/tasks/${id}`,
        getAuthConfig()
      );

      setTasks(
        tasks.filter((task) => task._id !== id)
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete task"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            ✅ Tasks
          </h1>

          <p className="text-gray-500 mt-2">
            Organize your actions and track progress toward your goals.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Create Task */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">

            <h2 className="text-xl font-bold text-gray-800">
              Create New Task
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 mt-5"
            >

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Task Title
                </label>

                <input
                  type="text"
                  placeholder="e.g. Build AI chat interface"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  className="w-full border rounded-lg p-3"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>

                <textarea
                  placeholder="Describe the task..."
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows="4"
                  className="w-full border rounded-lg p-3 resize-none"
                />
              </div>

              {/* Goal */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Related Goal
                </label>

                <select
                  value={goal}
                  onChange={(e) =>
                    setGoal(e.target.value)
                  }
                  className="w-full border rounded-lg p-3"
                >
                  <option value="">
                    No Goal
                  </option>

                  {goals.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value)
                  }
                  className="w-full border rounded-lg p-3"
                >
                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) =>
                    setDueDate(e.target.value)
                  }
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {loading
                  ? "Creating..."
                  : "Create Task"}
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

          {/* Task List */}
          <div className="lg:col-span-2 bg-white border rounded-xl p-6 shadow-sm">

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Your Tasks
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {tasks.length} tasks
                </p>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-16">

                <p className="text-lg text-gray-400">
                  No tasks yet.
                </p>

                <p className="text-sm text-gray-400 mt-2">
                  Create your first task to start tracking your progress.
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="border rounded-xl p-5"
                  >

                    <div className="flex justify-between gap-4">

                      <div className="flex-1">

                        {/* Status + Priority */}
                        <div className="flex items-center gap-2 flex-wrap">

                          <span
                            className={`text-xs px-3 py-1 rounded-full ${
                              task.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {task.status}
                          </span>

                          <span
                            className={`text-xs px-3 py-1 rounded-full ${
                              task.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : task.priority === "medium"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {task.priority} priority
                          </span>

                        </div>

                        {/* Title */}
                        <h3
                          className={`font-semibold text-lg mt-3 ${
                            task.status === "completed"
                              ? "line-through text-gray-400"
                              : "text-gray-800"
                          }`}
                        >
                          {task.title}
                        </h3>

                        {/* Description */}
                        {task.description && (
                          <p className="text-gray-500 text-sm mt-2">
                            {task.description}
                          </p>
                        )}

                        {/* Goal */}
                        {task.goal && (
                          <p className="text-sm text-blue-600 mt-3">
                            🎯 Goal:{" "}
                            {task.goal.title}
                          </p>
                        )}

                        {/* Due Date */}
                        {task.dueDate && (
                          <p className="text-xs text-gray-400 mt-2">
                            Due:{" "}
                            {new Date(
                              task.dueDate
                            ).toLocaleDateString()}
                          </p>
                        )}

                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">

                        <button
                          onClick={() =>
                            handleStatusChange(
                              task._id,
                              task.status
                            )
                          }
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {task.status === "pending"
                            ? "Complete"
                            : "Mark Pending"}
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(task._id)
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

export default Tasks;