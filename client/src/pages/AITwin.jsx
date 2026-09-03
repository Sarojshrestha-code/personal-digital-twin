import { useState } from "react";

function AITwin() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    setMessages([
      ...messages,
      {
        sender: "user",
        text: message,
      },
    ]);

    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">

      {/* Header */}
      <div className="max-w-4xl mx-auto">

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

              <div className="space-y-4">

                {messages.map((msg, index) => (

                  <div
                    key={index}
                    className="flex justify-end"
                  >

                    <div className="bg-blue-600 text-white px-4 py-3 rounded-xl max-w-[75%]">
                      {msg.text}
                    </div>

                  </div>

                ))}

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
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Ask your AI Twin..."
              className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Send
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default AITwin;