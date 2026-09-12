import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg">
            AI
          </div>

          <span className="text-xl font-bold">
            AI-Twin
          </span>
        </div>

        <div className="flex items-center gap-3">

          <Link
            to="/login"
            className="px-4 py-2 text-gray-300 hover:text-white transition"
          >
            Sign In
          </Link>

          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg font-medium transition"
          >
            Get Started
          </Link>

        </div>

      </nav>


      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24">

        <div className="max-w-3xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm mb-6">

            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>

            AI-powered personal intelligence

          </div>


          <h1 className="text-5xl md:text-6xl font-bold leading-tight">

            Meet your
            <span className="text-blue-500"> AI Twin</span>

          </h1>


          <p className="text-gray-400 text-lg md:text-xl mt-6 leading-relaxed">

            A personalized AI assistant that learns from your
            memories, goals, tasks, and activities to provide
            meaningful insights and intelligent decision support.

          </p>


          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">

            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 px-7 py-3.5 rounded-xl font-semibold transition"
            >
              Create Your AI Twin →
            </Link>

            <Link
              to="/login"
              className="border border-gray-700 hover:border-gray-500 px-7 py-3.5 rounded-xl font-semibold transition"
            >
              Sign In
            </Link>

          </div>

        </div>


        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">

          {/* Memory */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">

            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-2xl mb-5">
              🧠
            </div>

            <h3 className="text-lg font-semibold">
              Personal Memory
            </h3>

            <p className="text-gray-400 mt-2 text-sm leading-relaxed">
              Store important information and build a personal
              knowledge base that your AI Twin can understand.
            </p>

          </div>


          {/* Behavior */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">

            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-2xl mb-5">
              📊
            </div>

            <h3 className="text-lg font-semibold">
              Behavioral Insights
            </h3>

            <p className="text-gray-400 mt-2 text-sm leading-relaxed">
              Analyze your tasks, goals, and activities to
              discover patterns and areas for improvement.
            </p>

          </div>


          {/* Decision */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">

            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-2xl mb-5">
              💡
            </div>

            <h3 className="text-lg font-semibold">
              Intelligent Decisions
            </h3>

            <p className="text-gray-400 mt-2 text-sm leading-relaxed">
              Get personalized recommendations based on your
              own information, progress, and behavioral context.
            </p>

          </div>

        </div>


        {/* Bottom statement */}
        <div className="text-center mt-20">

          <p className="text-gray-500 text-sm">
            Your data. Your context. Your AI Twin.
          </p>

        </div>

      </main>

    </div>
  );
}

export default Home;