import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!formData.email.trim()) {
      return "Email is required";
    }

    if (!formData.password) {
      return "Password is required";
    }

    if (formData.password.length < 8) {
      return "Password must be at least 8 characters";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();

    if (error) {
      toast.error(error);
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser(formData);

      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success(response.data.message || "Login Successful!");

      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }

    setFormData({
      email: "",
      password: "",
    });
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900">
      <div className="bg-white w-[450px] rounded-xl shadow-lg p-8">

        <h1 className="text-4xl font-bold text-center mb-8">
          Login
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >

          {/* Email */}

          <div>
            <label className="block font-semibold mb-2">
             Email:
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              required
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}

          <div>
            <label className="block font-semibold mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between items-center">

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />

              <label htmlFor="remember">
                Remember Me
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="text-red-500 hover:text-red-700"
            >
              Forgot Password?
            </Link>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Logging In..." : "Login"}
          </button>

          <div className="text-center">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-semibold"
            >
              Register
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login;