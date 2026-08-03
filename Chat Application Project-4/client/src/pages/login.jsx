import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../Store/useAuthStore";

const image = "/Login.jpg"

const Login = () => {

  const navigate = useNavigate();
  const { login, authUser } = useAuthStore();

  // If already logged in, go to home
  useEffect(() => {
    if (authUser) {
      navigate("/");
    }
  }, [authUser, navigate]);

  const [showPassword, setShowPassword] = useState(false);

  const [checked, setchecked] = useState({
    checked: false,
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });




  // 2. Handle input changes dynamically
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // 3. Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await login(formData);

    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="bg-gray-800 h-screen w-full flex justify-center items-center">

      <div className="bg-white h-[90%] w-[80%] rounded-xl shadow-2xl flex overflow-hidden">

        {/* Left - Form Section */}
        <div className="flex-1 flex flex-col justify-center px-17 py-10">

          <h1 className="text-3xl font-bold text-blue-950 mb-2">Welcome Back!</h1>
          <h2 className="text-sm font-semibold italic text-gray-500 mb-8">Please Login to continue</h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="johndoe@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border placeholder:italic border-gray-300 bg-white px-4 py-3 text-gray-700 placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Password
                </label>

              </div>

              <div className="relative mb-6">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-700 placeholder:text-gray-400 placeholder:italic outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-6 flex items-center text-gray-500 cursor-pointer hover:text-blue-600 transition"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center mb-7 justify-between">
              <div className="flex">
                <input
                  id="rememberMe"
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rememberMe: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded cursor-pointer border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember Me
                </label>
              </div>

              <div className="flex">
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-all duration-300 hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
            >
              Login
            </button>

            {/* Signup Link */}
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>

        {/* Right - Image Section */}
        <div className="w-[54%]">
          <img src={image} alt="Login" className="h-full w-full object-cover" />
        </div>

      </div>

    </div>
  )
}

export default Login