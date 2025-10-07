import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import OtpInput from "otp-input-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; // Use the standard CSS for this library
import { auth } from "../../config/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { Toaster, toast } from "react-hot-toast";

// A simple loader component
const Loader = () => (
    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-r-2 border-white mr-3"></span>
);

export default function Login() {
    const [otp, setOtp] = useState("");
    const [ph, setPh] = useState("");
    const [loading, setLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const router = useRouter();

    // Setup reCAPTCHA verifier
    useEffect(() => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
                "recaptcha-container",
                {
                    size: "invisible",
                    callback: () => { /* onSignup will be called */ },
                    "expired-callback": () => {
                        toast.error("reCAPTCHA expired. Please try again.");
                    },
                },
                auth
            );
        }
    }, []);

    function onSignup() {
        if (!ph || ph.length < 10) {
            return toast.error("Please enter a valid phone number.");
        }
        setLoading(true);
        const appVerifier = window.recaptchaVerifier;
        const formatPh = "+" + ph;

        signInWithPhoneNumber(auth, formatPh, appVerifier)
            .then((confirmationResult) => {
                window.confirmationResult = confirmationResult;
                setShowOTP(true);
                toast.success("OTP sent successfully!");
            })
            .catch((error) => {
                console.error("SMS not sent error:", error);
                toast.error("Failed to send OTP. Rate limit exceeded?");
            })
            .finally(() => {
                setLoading(false);
            });
    }

    function onOTPVerify() {
        if (!otp || otp.length < 6) {
            return toast.error("Please enter a valid 6-digit OTP.");
        }
        setLoading(true);
        window.confirmationResult
            .confirm(otp)
            .then((res) => {
                toast.success("Login Successful!");
                // Redirect to the dashboard after successful login
                setTimeout(() => {
                    router.push("/dashboard");
                }, 1000);
            })
            .catch((err) => {
                console.error("OTP verification error:", err);
                toast.error("Invalid OTP. Please try again.");
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <section className="bg-slate-900 min-h-screen">
            <Toaster toastOptions={{ duration: 4000 }} />
            <div id="recaptcha-container"></div>

            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
                {/* Left Visual Column */}
                <div className="relative hidden lg:flex flex-col items-center justify-center p-12 bg-slate-800/20">
                    <div className="relative z-10 text-center">
                        <img src="/logo.png" alt="RescueConnect Logo" className="w-48 mx-auto mb-6" />
                        <h1 className="text-4xl font-bold text-white tracking-tight">Your Direct Line to Emergency Services</h1>
                        <p className="mt-4 text-lg text-slate-400 max-w-lg">Instantly connect with police, fire, and ambulance services when every second counts.</p>
                    </div>
                </div>

                {/* Right Form Column */}
                <div className="flex items-center justify-center p-6 sm:p-12">
                    <div className="w-full max-w-md mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white">Secure Sign In</h2>
                            <p className="mt-2 text-slate-400">
                                {showOTP ? "Enter the OTP sent to your phone." : "Verify your identity to continue."}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {showOTP ? (
                                <div className="flex flex-col items-center">
                                    <OtpInput
                                        value={otp}
                                        onChange={setOtp}
                                        OTPLength={6}
                                        otpType="number"
                                        disabled={loading}
                                        inputClassName="!w-12 !h-14 m-2 text-2xl rounded-lg border border-slate-600 bg-slate-800 text-white focus:border-sky-500 focus:outline-none"
                                    />
                                    <button
                                        onClick={onOTPVerify}
                                        disabled={loading}
                                        className="mt-6 w-full flex items-center justify-center py-3 px-4 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-500 transition-colors"
                                    >
                                        {loading && <Loader />}
                                        Verify OTP
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="phone" className="text-sm font-medium text-slate-300">
                                        Enter your mobile number
                                    </label>
                                    <div className="mt-2">
                                        <PhoneInput
                                            country={"in"}
                                            value={ph}
                                            onChange={setPh}
                                            inputStyle={{ width: '100%', height: '3rem', backgroundColor: '#1e293b', color: 'white', border: '1px solid #475569', borderRadius: '0.5rem' }}
                                            buttonStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '0.5rem 0 0 0.5rem' }}
                                            dropdownStyle={{ backgroundColor: '#1e293b', color: 'white' }}
                                        />
                                    </div>
                                    <button
                                        onClick={onSignup}
                                        disabled={loading}
                                        className="mt-6 w-full flex items-center justify-center py-3 px-4 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-slate-500 transition-colors"
                                    >
                                        {loading && <Loader />}
                                        Send OTP
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}