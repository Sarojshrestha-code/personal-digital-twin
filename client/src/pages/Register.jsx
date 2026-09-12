import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import API from "../api/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
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

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await API.post(
        "/auth/register",
        formData
      );

      setMessage(response.data.message);

      setFormData({
        name: "",
        email: "",
        password: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account">

      <div className="text-center mb-7">

        <div className="w-12 h-12 mx-auto rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-4">
          AI
        </div>

        <p className="text-gray-500 text-sm">
          Start building your personalized AI Twin
        </p>

      </div>


      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* Name */}
        <div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full name
          </label>

          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />

        </div>


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

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>

          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />

          <p className="text-xs text-gray-400 mt-2">
            Use a strong password to protect your personal data.
          </p>

        </div>


        {/* Success */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 text-sm">
            {message}
          </div>
        )}


        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}


        {/* Register */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-semibold transition"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

      </form>


      {/* Login */}
      <p className="text-center text-sm text-gray-500 mt-7">

        Already have an account?{" "}

        <Link
          to="/login"
          className="text-blue-600 font-medium hover:underline"
        >
          Sign in
        </Link>

      </p>

    </AuthLayout>
  );
}

export default Register;