import axios from 'axios';
import React, { useState } from 'react'
import Swal from 'sweetalert2';

function ContactUsForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        subject: '',
        message: '',
    });
    const [errors, setErrors] = useState({});
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const payload = {
        contactID: 0,
        name: formData.name || "",
        email: formData.email?.trim() || "",
        phoneNumber: formData.phoneNumber?.trim() || "",
        subject: formData.subject?.trim() || "",
        message: formData.message?.trim() || ""
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response = await axios.post("/api/ContactUS/InsertContactUs", payload);
            if (response.status === 200) {
                Swal.fire({
                    title: "Contact Us data added successfully!",
                    icon: "success",
                    button: "Ok",
                });
                setErrors({});
                setFormData({
                    name: '',
                    email: '',
                    phoneNumber: '',
                    subject: '',
                    message: '',
                });
            }
        } catch (error) {
            if (error.response) {
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
                    Swal.fire("An error occurred. Please check your input and try again.", {
                        icon: "error",
                    });
                }
            } else {
                Swal.fire("Failed to add/update contact. Please try again later.", {
                    icon: "error",
                });
            }
        }
    };
    return (
        <div className="main m-2">
            <div className="container">
                <div className="row justify-content-center align-items-center h-100">
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
                                Contact Us
                            </h4>
                            <div>
                                <p className="text-center">We would love to hear from you!</p>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="d-block text-start">
                                            <span className="text-danger">*</span> Name
                                        </label>
                                        <input
                                            name="name"
                                            className="form-control"
                                            placeholder="Enter your name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.Name && (
                                            <span className="text-start text-danger">
                                                {errors.Name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="form-group">
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
                                    <div className="form-group">
                                        <label className="d-block text-start">
                                            <span className="text-danger">*</span> Phone Number
                                        </label>
                                        <input
                                            name="phoneNumber"
                                            type="tel"
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
                                    <div className="form-group">
                                        <label className="d-block text-start">Subject</label>
                                        <select
                                            name="subject"
                                            id="subject"
                                            className='form-control'
                                            value={formData.subject}
                                            onChange={handleChange}
                                        >
                                            <option value="" disabled>Select a subject</option>
                                            <option value="Inquiry">Inquiry</option>
                                            <option value="Support">Support</option>
                                            <option value="Feedback">Feedback</option>
                                            <option value="Complaint">Complaint</option>
                                            <option value="Collaboration">Collaboration</option>
                                            <option value="Request">Request</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.Subject && (
                                            <span className="text-start text-danger">
                                                {errors.Subject}
                                            </span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label className="d-block text-start">
                                            <span className="text-danger">*</span> Message
                                        </label>
                                        <textarea
                                            name="message"
                                            className="form-control"
                                            placeholder="Write your message here"
                                            rows="3"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                        {errors.Message && (
                                            <span className="text-start text-danger">
                                                {errors.Message}
                                            </span>
                                        )}
                                    </div>
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
                                            Submit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ContactUsForm
