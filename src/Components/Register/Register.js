import React, { useEffect, useState } from "react";
import { Link, useHistory, useNavigate } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { decodeJwt, getJWTFromSession } from "../Login/GetAuth";
import { useGoogleLogin, GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";

const CLIENT_ID = ""; // Replace with your Google Client ID

const Register = () => {
  const [formData, setFormData] = useState({
    userName: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    userRole: "",
    description: "",
    profilePhoto: "",
    address: "",
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const jwt = getJWTFromSession();
    if (jwt) {
      try {
        const user = JSON.parse(decodeJwt(jwt));
        if (user) {
          Swal.fire({
            title: "You are login you can't register!",
            icon: "error",
            button: "Ok",
          }).then(() => {
            navigate('/');
          });
        }
      } catch (error) {
        console.error("Failed to decode JWT:", error);
      }
    }
  }, [navigate]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userRole || !formData.userName || !formData.email || !formData.password) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    // Send a POST request to register the user using axios
    try {
      const response = await axios.post("/api/LoginRegister/Register/register", formData);

      if (response.status === 200) {
        swal({
          title: "Register successfully",
          icon: "success",
          button: "Ok",
        });
        navigate("/login");
      } else {
        setErrorMessage(response.data.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      if (error.response) {
        // console.log("Response data:", error.response.data);
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          const validationErrors = {};
          errors.forEach((err) => {
            validationErrors[err.Field] = err.Error;
          });
          setErrors(validationErrors);
          console.log("Validation errors (array):", validationErrors);
        } else if (typeof errors === "object") {
          const validationErrors = {};
          for (const [field, errorMessage] of Object.entries(errors)) {
            validationErrors[field] = errorMessage;
          }
          setErrors(validationErrors);
          console.log("Validation errors (object):", errors);

        } else {
          swal("An error occurred. Please check your input and try again.", {
            icon: "error",
          });
        }
      } else {
        swal("Failed to register. Please try again later.", {
          icon: "error",
        });
      }
    }
  };

  const renderAdditionalFields = () => {
    switch (formData.userRole) {
      case "Seller":
        return (
          <>
            <div className="form-group">
              <label className="d-block text-start">Business Description</label>
              <textarea
                name="description"
                className="form-control"
                placeholder="Describe your business"
                rows="2"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>
          </>
        );
      case "Agent":
        return (
          <>
            <div className="form-group">
              <label className="d-block text-start">Profile Photo</label>
              <input
                name="profilePhoto"
                className="form-control"
                placeholder="Enter profile photo URL"
                value={formData.profilePhoto}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="d-block text-start">Address</label>
              <input
                name="address"
                className="form-control"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </>
        );
      case "Admin":
        return (
          <div className="form-group">
            <label className="d-block text-start">Additional Notes</label>
            <textarea
              name="description"
              className="form-control"
              placeholder="Add any additional notes"
              rows="2"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
        );
      default:
        return null;
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const decodedToken = jwtDecode(credentialResponse.credential);
    console.log("Google User:", decodedToken);

    setFormData((prevData) => ({
      ...prevData,
      userName: decodedToken.email.split("@")[0],
      phoneNumber: "",
      firstName: decodedToken.given_name,
      lastName: decodedToken.family_name,
      email: decodedToken.email
    }));
    
  };

  const handleGoogleLoginFailure = (error) => {
    console.error("Google Login Failed:", error);
    Swal.fire({ title: "Login Failed", text: "Google login was unsuccessful!", icon: "error" });
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <section
        className="pt-5 pb-5 d-flex align-items-center"
        style={{
          minHeight: "100vh",
          backgroundColor: "rgba(33, 111, 237, 0.1)",
        }}
      >
        <div className="container">
          <div className="row justify-content-center align-items-center h-100">
            <div className="col-12 col-md-8">
              <div className="card shadow">
                <div className="card-body">
                  <h4
                    className="card-title text-center"
                    style={{
                      borderRadius: "0.5rem",
                      backgroundImage:
                        "linear-gradient(195deg, #42424a 0%, #191919 100%)",
                      boxShadow:
                        "0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(64, 64, 64, 0.4)",
                      color: "#fff",
                      padding: "1rem",
                    }}
                  >
                    Register
                  </h4>
                  <p className="text-center">Create your account</p>
                  <div className="text-center my-3 w-25">
                    <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginFailure}/>
                  </div>
                  <div className="text-center">OR</div>
                  <form onSubmit={handleSubmit}>
                    {/* Required Fields */}
                    <div className="row">
                      <div className="form-group col-md-6">
                        <label className="d-block text-start">
                          <span className="text-danger">*</span> Username
                        </label>
                        <input
                          name="userName"
                          className="form-control"
                          placeholder="Enter your username"
                          value={formData.userName}
                          onChange={handleChange}
                          required
                        />
                        {errors.UserName && (
                          <span className="text-start text-danger">
                            {errors.UserName}
                          </span>
                        )}
                      </div>
                      <div className="form-group col-md-6">
                        <label className="d-block text-start">
                          <span className="text-danger">*</span> Phone Number
                        </label>
                        <input
                          name="phoneNumber"
                          className="form-control"
                          placeholder="Enter your phone number"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          required
                        />
                        {errors.PhoneNumber && (
                          <span className="text-start text-danger">
                            {errors.PhoneNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group col-md-6">
                        <label className="d-block text-start">
                          <span className="text-danger">*</span> First Name
                        </label>
                        <input
                          name="firstName"
                          className="form-control"
                          placeholder="Enter your first name"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                        {errors.FirstName && (
                          <span className="text-start text-danger">
                            {errors.FirstName}
                          </span>
                        )}
                      </div>
                      <div className="form-group col-md-6">
                        <label className="d-block text-start">
                          <span className="text-danger">*</span> Last Name
                        </label>
                        <input
                          name="lastName"
                          className="form-control"
                          placeholder="Enter your last name"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                        {errors.LastName && (
                          <span className="text-start text-danger">
                            {errors.LastName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group col-md-6">
                        <label className="d-block text-start">
                          <span className="text-danger">*</span> Email
                        </label>
                        <input
                          name="email"
                          type="email"
                          className="form-control"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                        {errors.Email && (
                          <span className="text-start text-danger">
                            {errors.Email}
                          </span>
                        )}
                      </div>
                      <div className="form-group col-md-6">
                        <label className="d-block text-start">
                          <span className="text-danger">*</span> Password
                        </label>
                        <input
                          name="password"
                          type="password"
                          className="form-control"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        {errors.Password && (
                          <span className="text-start text-danger">
                            {errors.Password}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Role Selector */}
                    <div className="form-group">
                      <label className="d-block text-start">
                        <span className="text-danger">*</span> User Role
                      </label>
                      <select
                        name="userRole"
                        className="form-control"
                        value={formData.userRole}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="Seller">Seller</option>
                        <option value="Buyer">Buyer</option>
                        <option value="Admin">Admin</option>
                        <option value="Agent">Agent</option>
                      </select>
                      {errors.UserRole && (
                        <span className="text-start text-danger">
                          {errors.UserRole}
                        </span>
                      )}
                    </div>
                    {/* Additional Fields Based on Role */}
                    {renderAdditionalFields()}
                    <div className="form-group">
                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        style={{ marginTop: "15px" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.005)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 25px 0 rgba(0, 0, 0, 0.2), 0 9px 15px -5px rgba(64, 64, 64, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(64, 64, 64, 0.4)";
                        }}
                      >
                        Register
                      </button>
                    </div>
                    <p className="text-center mt-3">
                      Already have an account?{" "}
                      <Link to="/login" className="text-primary" style={{ textDecoration: "none" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = "underline";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = "none";
                        }}>
                        Log In
                      </Link>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </GoogleOAuthProvider>
  );
};

export default Register;
