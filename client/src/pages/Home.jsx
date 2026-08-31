import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">

      <h1 className="text-5xl font-bold text-blue-600">
        Personal Digital Twin
      </h1>

      <p className="mt-4 text-gray-600 text-lg">
        AI-Powered Personalized Assistant
      </p>

      <div className="mt-8 flex gap-4">

        <Link
          to="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="bg-green-600 text-white px-6 py-3 rounded-lg"
        >
          Register
        </Link>

      </div>

    </div>
  );
}

export default Home;