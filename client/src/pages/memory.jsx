import { useEffect, useState } from "react";
import API from "../api/api";

function Memory() {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("personal");
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Get JWT token
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Fetch memories
  const fetchMemories = async () => {
    try {
      const response = await API.get(
        "/memories",
        getAuthConfig()
      );

      setMemories(response.data.memories);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to load memories"
      );
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  // Save memory
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await API.post(
        "/memories",
        {
          content,
          category,
        },
        getAuthConfig()
      );

      setMessage(response.data.message);

      setContent("");

      fetchMemories();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to save memory"
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete memory
  const handleDelete = async (id) => {
    try {
      await API.delete(
        `/memories/${id}`,
        getAuthConfig()
      );

      setMemories(
        memories.filter(
          (memory) => memory._id !== id
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Failed to delete memory"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            🧠 Personal Memory
          </h1>

          <p className="text-gray-500 mt-2">
            Store important information, thoughts, experiences, and notes
            for your AI Twin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Add Memory Form */}
          <div className="lg:col-span-1 bg-white border rounded-xl p-6 shadow-sm">

            <h2 className="text-xl font-bold text-gray-800">
              Add New Memory
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 mt-5"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded-lg p-3"
                >
                  <option value="personal">Personal</option>
                  <option value="study">Study</option>
                  <option value="work">Work</option>
                  <option value="goal">Goal</option>
                  <option value="habit">Habit</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Memory
                </label>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Example: I usually study better in the morning..."
                  rows="7"
                  className="w-full border rounded-lg p-3 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Memory"}
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

          {/* Memory List */}
          <div className="lg:col-span-2 bg-white border rounded-xl p-6 shadow-sm">

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Your Memories
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {memories.length} memories stored
                </p>
              </div>
            </div>

            {memories.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-gray-400">
                  No memories yet.
                </p>

                <p className="text-sm text-gray-400 mt-2">
                  Add your first memory to start building your Digital Twin.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {memories.map((memory) => (
                  <div
                    key={memory._id}
                    className="border rounded-xl p-5 hover:shadow-sm transition"
                  >
                    <div className="flex justify-between gap-4">

                      <div className="flex-1">
                        <span className="inline-block text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full capitalize">
                          {memory.category}
                        </span>

                        <p className="text-gray-700 mt-3 leading-relaxed">
                          {memory.content}
                        </p>

                        <p className="text-xs text-gray-400 mt-3">
                          {new Date(memory.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          handleDelete(memory._id)
                        }
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>

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

export default Memory;