import React, { useEffect, useState } from "react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import axios from "axios";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {jwtDecode} from "jwt-decode";
import { decodeJwt, getJWTFromSession } from "./GetAuth";

const CLIENT_ID = "1069317331463-9cd00bom5ml11tnqdplh6eu0hu8b2lr4.apps.googleusercontent.com"; // Replace with your Google Client ID

const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const [formData, setFormData] = useState({ username: "", password: "" });

  useEffect(() => {
    const jwt = getJWTFromSession();
    if (jwt) {
      try {
        const user = JSON.parse(decodeJwt(jwt));
        if (user) {
          Swal.fire({
            title: "You are already logged in!",
            icon: "error",
            confirmButtonText: "Ok",
          }).then(() => {
            navigate("/");
          });
        }
      } catch (error) {
        console.error("Failed to decode JWT:", error);
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    
    try {
      const response = await axios.post("/api/LoginRegister/Login/login", formData);
      if (response.data.token) {
        sessionStorage.setItem("jwt",response.data.token);
        Cookies.set("jwt", response.data.token, { secure: true, sameSite: "strict", expires: 1 });
        Swal.fire({ title: "Login Successful!", icon: "success", confirmButtonText: "Ok" });
        navigate("/");
      }
    } catch (error) {
      setErrorMessage(error.response?.data || "An error occurred.");
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const decodedToken = jwtDecode(credentialResponse.credential);
    // console.log("Google User:", decodedToken);
    // console.log(decodedToken.email.split("@"));
    

    const googleUser = {
      token: credentialResponse.credential,
      email: decodedToken.email,
      password: "",
      userName: decodedToken.email.split("@")[0],
    };    
  
    try {
      const response = await axios.post("/api/LoginRegister/GoogleLogin/google-login", googleUser);
      console.log(response);
      
      if (response.data.token) {
        sessionStorage.setItem("jwt", response.data.token);
        Cookies.set("jwt", response.data.token, { secure: true, sameSite: "strict", expires: 1 });
        Swal.fire({ title: "Google Login Successful!", icon: "success", confirmButtonText: "Ok" });
        navigate("/");
      }
    } catch (error) {
      console.log(error.response.data.message);
      console.log(error.response.data.message === "Not Register");
      
      if (error.response.data.message === "Not Register") {
        console.log("HI");
        
        Swal.fire({
          title: "Not Registered",
          text: "You need to register first!",
          icon: "warning",
          confirmButtonText: "OK"
      }).then((result) => {
          if (result.isConfirmed) {
              window.location.href = "/register";
          }
      });      
    }
    console.error("Google Login Error:", error);
    }
  };  

  const handleGoogleLoginFailure = (error) => {
    console.error("Google Login Failed:", error);
    Swal.fire({ title: "Login Failed", text: "Google login was unsuccessful!", icon: "error" });
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <section className="d-flex align-items-center" style={{ minHeight: "100vh", backgroundColor: "rgba(33, 111, 237, 0.1)" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow">
                <div className="card-body">
                  <h4 className="text-center" style={{ borderRadius: "0.5rem", backgroundImage: "linear-gradient(195deg, #42424a 0%, #191919 100%)", color: "#fff", padding: "1rem" }}>
                    Log In
                  </h4>
                  <p className="text-center">Access your account</p>

                  {/* Google Login Button */}
                  <div className="text-center my-3">
                    <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginFailure} text="Login with Google"/>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="text-start w-100">
                        <span className="text-danger">*</span> Username
                      </label>
                      <input name="username" type="text" className="form-control" placeholder="Enter your username" value={formData.username} onChange={handleChange} />
                    </div>

                    <div className="form-group mt-3">
                      <label className="text-start w-100">
                        <span className="text-danger">*</span> Password
                      </label>
                      <input name="password" type="password" className="form-control" placeholder="Enter your password" value={formData.password} onChange={handleChange} />
                    </div>

                    {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}

                    {/* Forgot Password */}
                    <div>
                      <Link to={'/reset-password'} className="text-decoration-none">Forgot your password?</Link>
                    </div>
                    <div className="form-group mt-4">
                      <button type="submit" className="btn btn-primary w-100">
                        Login
                      </button>
                    </div>
                  </form>

                  <p className="text-center mt-3">
                    Don't have an account?{" "}
                    <a href="/register" className="text-primary">
                      Create One
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </GoogleOAuthProvider>
  );
};

export default Login;
