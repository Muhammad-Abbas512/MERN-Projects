import React from 'react'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from "../Store/useAuthStore";

const image = "/VerifyEmail.jpg"

function VerifyEmail() {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyEmail } = useAuthStore();
    const email = location.state?.email || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);

    const handleOtpChange = (value, index) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (
            e.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const code = otp.join("");

        const success = await verifyEmail({ otp: code, email });

        if (success) {
            navigate("/login");
        }
    };

    return (
        <div className="bg-gray-800 h-screen w-full flex justify-center items-center p-4">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl flex flex-col items-center h-auto sm:h-[85%] w-full max-w-md sm:w-[40%] overflow-y-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-950 flex items-center text-center">Verify Your Email</h1>
                <p className="text-gray-600 text-[15px] italic text-center">
                    Please check your email for a 6 digit code.
                </p>

                <div className="flex flex-col items-center mt-1">
                    <img src={image} alt="verify email" className='flex justify-center w-[180px]' />
                </div>

                <div className="flex flex-col items-center mt-3 w-full">
                    <p className="text-sm text-gray-500 mb-6 text-center">
                        Enter the 6-digit verification code sent to your email.
                    </p>

                    <div className="flex gap-2 sm:gap-3">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border border-gray-300 text-center text-2xl font-semibold outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleSubmit}
                        type="submit"
                        className="mt-8 w-full cursor-pointer rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-800"
                    >
                        Verify Email
                    </button>

                    <p className="mt-5 text-sm text-gray-600">
                        Didn't receive the code?{" "}
                        <button
                            type="button"
                            className="font-semibold text-blue-600 cursor-pointer hover:underline"
                        >
                            Resend Code
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default VerifyEmail