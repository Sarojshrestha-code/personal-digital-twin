import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../api/api";

function AITwin() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    // Show user's message immediately
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      // Send message to our backend
      const response = await api.post("/ai/chat", {
        message: userMessage,
      });

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: response.data.reply,
        },
      ]);
    } catch (error) {
      console.error("AI chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, I couldn't connect to your AI Twin. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          🤖 AI Twin
        </h1>

        <p className="text-gray-500 mt-2">
          Talk with your Personal Digital Twin.
        </p>

        {/* Chat Box */}
        <div className="bg-white border rounded-xl shadow-sm mt-8">

          {/* Messages */}
          <div className="h-[450px] overflow-y-auto p-6">

            {messages.length === 0 ? (

              <div className="h-full flex items-center justify-center text-center">

                <div>

                  <div className="text-5xl mb-4">
                    🤖
                  </div>

                  <h2 className="text-xl font-semibold text-gray-700">
                    Hello! I'm your AI Twin.
                  </h2>

                  <p className="text-gray-400 mt-2">
                    Ask me something about your goals,
                    tasks, memories, or plans.
                  </p>

                </div>

              </div>

            ) : (

              <div className="space-y-5">

                {messages.map((msg, index) => (

                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`px-4 py-3 rounded-xl max-w-[75%] whitespace-pre-wrap ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {msg.sender === "ai" && (
                        <div className="font-semibold mb-1">
                          🤖 AI Twin
                        </div>
                      )}

                      <ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    h1: ({ children }) => (
      <h1 className="text-xl font-bold mb-2">
        {children}
      </h1>
    ),

    h2: ({ children }) => (
      <h2 className="text-lg font-bold mb-2">
        {children}
      </h2>
    ),

    h3: ({ children }) => (
      <h3 className="font-bold mb-1">
        {children}
      </h3>
    ),

    p: ({ children }) => (
      <p className="mb-2 last:mb-0">
        {children}
      </p>
    ),

    ul: ({ children }) => (
  <ul className="list-disc pl-6 mb-2 space-y-1">
    {children}
  </ul>
),

ol: ({ children }) => (
  <ol className="list-decimal pl-6 mb-2 space-y-1">
    {children}
  </ol>
),

li: ({ children }) => (
  <li className="pl-1">
    {children}
  </li>
),

    strong: ({ children }) => (
      <strong className="font-bold">
        {children}
      </strong>
    ),

    table: ({ children }) => (
      <div className="overflow-x-auto my-3">
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
  {msg.text}
</ReactMarkdown>

                    </div>

                  </div>

                ))}

                {/* Loading */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-500 px-4 py-3 rounded-xl">
                      🤖 AI Twin is thinking...
                    </div>
                  </div>
                )}

              </div>

            )}

          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="border-t p-4 flex gap-3"
          >

            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask your AI Twin..."
              disabled={loading}
              className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Thinking..." : "Send"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default AITwin;