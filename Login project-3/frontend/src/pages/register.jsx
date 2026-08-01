import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../api/auth";


const Register = () => {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {

        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));

    };

    const validate = () => {

        if (!formData.username.trim()) {
            return "Username is required";
        }

        if (formData.username.length < 3) {
            return "Username must be at least 3 characters";
        }

        if (!formData.email.trim()) {
            return "Email is required";
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
            return "Please enter a valid email";
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

            const response = await registerUser(formData);

            toast.success(
                response.data.message || "Registration Successful!"
            );

            navigate("/verify-email", { state: { email: formData.email } });

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                "Registration Failed"
            );

        } finally {

            setLoading(false);

        }

    };

    return (
        <div className="min-h-screen bg-gray-900 flex justify-center items-center">

            <div className="bg-white w-[450px] rounded-xl shadow-lg p-8">

                <h1 className="text-4xl font-bold text-center mb-8">
                    Register
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div>

                        <label className="block font-semibold mb-2">
                            Username
                        </label>

                        <input
                            type="text"
                            name="username"
                            placeholder="Enter Username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                    <div>

                        <label className="block font-semibold mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                    <div>

                        <label className="block font-semibold mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:bg-blue-400"
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>

                    <div className="text-center">

                        <span>
                            Already have an account?
                        </span>

                        <Link
                            to="/login"
                            className="text-blue-600 font-semibold ml-2 cursor-pointer hover:underline"
                        >
                            Login
                        </Link>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default Register;