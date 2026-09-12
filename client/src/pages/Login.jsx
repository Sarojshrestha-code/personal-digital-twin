 import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import API from "../api/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await API.post(
        "/auth/login",
        formData
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      navigate("/dashboard");

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back">

      <div className="text-center mb-7">

        <div className="w-12 h-12 mx-auto rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-4">
          AI
        </div>

        <p className="text-gray-500 text-sm">
          Sign in to continue to your AI Twin
        </p>

      </div>


      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* Email */}
        <div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>

          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />

        </div>


        {/* Password */}
        <div>

          <div className="flex items-center justify-between mb-2">

            <label className="text-sm font-medium text-gray-700">
              Password
            </label>

            {/* We'll activate this route in the next step */}
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot password?
            </Link>

          </div>

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />

        </div>


        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}


        {/* Login */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-semibold transition"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

      </form>


      {/* Register */}
      <p className="text-center text-sm text-gray-500 mt-7">

        Don't have an account?{" "}

        <Link
          to="/register"
          className="text-blue-600 font-medium hover:underline"
        >
          Create an account
        </Link>

      </p>

    </AuthLayout>
  );
}

export default Login;