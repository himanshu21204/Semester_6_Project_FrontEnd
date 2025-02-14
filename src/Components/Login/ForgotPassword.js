import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { data } from "jquery";

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // Step 1: Enter Email, Step 2: Enter OTP & Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    useEffect(() => {
        const otpSent = sessionStorage.getItem("otpSent");
        if (otpSent) {
            setStep(2);
        }
    }, []);

    const sendOtp = async () => {
        if (!email) {
            Swal.fire("Error", "Please enter your email.", "error");
            return;
        }

        try {
            const response = await axios.post("/api/User/ForgotPassword/forgot-password", { email });
            if (response.data.success || response.status === 200) {
                Swal.fire("Success", "OTP sent to your email.", "success");
                sessionStorage.setItem("otpSent", "true");
                setStep(2);
            } else {
                console.log(response);
                Swal.fire("Error", response.data.message, "error");
            }
        } catch (error) {
            Swal.fire("Error", "Failed to send OTP. Try again later.", "error");
        }
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword) {
            Swal.fire("Error", "Please enter OTP and new password.", "error");
            return;
        }

        try {
            const response = await axios.post("/api/User/ResetPassword/reset-password", {
                email,
                otp,
                newPassword,
            });

            if (response.data.success || response.status === 200) {
                sessionStorage.clear();
                Swal.fire("Success", "Password reset successfully!", "success").then(() => {
                    window.location.href = "/login";
                });
            } else {
                console.log(response);

                Swal.fire("Error", response.data.message, "error");
            }
        } catch (error) {
            console.log(error);

            Swal.fire("Error", error.response.data || "Failed to reset password.", "error");
        }
    };

    return (
        <section className="d-flex align-items-center" style={{ minHeight: "100vh", backgroundColor: "rgba(33, 111, 237, 0.1)" }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">
                        <div className="card shadow">
                            <div className="card-body">
                                <h4 className="text-center" style={{ borderRadius: "0.5rem", backgroundImage: "linear-gradient(195deg, #42424a 0%, #191919 100%)", color: "#fff", padding: "1rem" }}>
                                    {step === 1 ? "Forgot Password" : "Reset Password"}
                                </h4>
                                <p className="text-center">Recover your account</p>

                                {step === 1 ? (
                                    <>
                                        <div className="form-group">
                                            <label className="text-start w-100">
                                                <span className="text-danger">*</span> Email
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group mt-3">
                                            <button
                                                onClick={sendOtp}
                                                className="btn btn-primary w-100"
                                            >
                                                Send OTP
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <label className="text-start w-100">
                                                <span className="text-danger">*</span> OTP
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group mt-3">
                                            <label className="text-start w-100">
                                                <span className="text-danger">*</span> New Password
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder="Enter new password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group mt-3">
                                            <button
                                                onClick={handleResetPassword}
                                                className="btn btn-success w-100"
                                            >
                                                Reset Password
                                            </button>
                                        </div>
                                    </>
                                )}

                                <p className="text-center mt-3">
                                    Remember your password?{" "}
                                    <Link to="/login" className="text-primary">
                                        Login
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ForgotPassword;
