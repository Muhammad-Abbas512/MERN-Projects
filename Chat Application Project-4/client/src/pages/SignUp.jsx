import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../Store/useAuthStore";


const image = "/signup.jpg"

const SignUp = () => {
    const navigate = useNavigate();
    const { signup } = useAuthStore();


    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
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

        const success = await signup(formData);

        if (success) {
            navigate("/verify-email", { state: { email: formData.email } });
        }
    };

    return (
        <div className="bg-gray-800 h-screen w-full flex justify-center items-center p-4">
            <div className="bg-white h-[90%] w-full max-w-4xl rounded-xl shadow-2xl flex overflow-hidden">
                {/* Left - Form Section */}
                <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-8 overflow-y-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold text-blue-950 mb-2">Create Account</h1>
                    <h2 className="text-sm font-semibold italic text-gray-500 mb-8">Please fill in the details to sign up</h2>

                    <form onSubmit={handleSubmit} className="space-y-2">
                        {/* Username */}
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Username
                            </label>

                            <input
                                id="username"
                                type="text"
                                name="username"
                                placeholder="Jhon Doe"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border placeholder:italic border-gray-300 bg-white px-4 py-3 text-gray-700 placeholder:text-gray-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

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
                                    className="absolute inset-y-0 right-6 flex items-center text-gray-500 hover:text-blue-600 cursor-pointer transition"
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-all duration-300 hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
                        >
                            Register
                        </button>

                        {/* Login Link */}
                        <p className="text-center text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                            >
                                Login
                            </Link>
                        </p>
                    </form>
                </div>

                {/* Right - Image Section (hidden on mobile) */}
                <div className="hidden md:block w-1/2">
                    <img src={image} alt="Login" className="h-full w-full object-cover" />
                </div>
            </div>
        </div>
    )
}

export default SignUp