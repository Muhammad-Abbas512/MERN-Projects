import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyEmail } from "../api/auth";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "your email";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

  const handleChange = (value, index) => {
    // Allow only numbers
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input automatically
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move back when Backspace is pressed
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const code = otp.join("");

    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyEmail({ email, otp: code });

      toast.success(response.data.message || "Email verified successfully!");

      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Email verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center items-center">

      <div className="bg-white w-[450px] rounded-xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center mb-4">
          Verify Email
        </h1>

        <p className="text-center text-gray-600 mb-8">
          We have sent a verification code to
          <br />
          <span className="font-semibold text-black">{email}</span>
        </p>

        <form onSubmit={handleSubmit}>

          <div className="flex justify-center gap-3 mb-8">

            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-14 text-center text-2xl border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:bg-blue-400"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default VerifyEmail;