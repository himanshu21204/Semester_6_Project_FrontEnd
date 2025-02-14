import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";
import { decodeJwt, getJWTFromSession } from "../Login/GetAuth";

function AppointmentForm() {
    const [users, setUsers] = useState([]);
    const [properties, setProperties] = useState([]);
    const [errors, setErrors] = useState({});
    const location = useLocation();
    const [loginUser, setLoginUser] = useState();
    const property = location.state?.propertyData;

    useEffect(() => {
        setLoginUser(location.state?.user);
        const jwt = getJWTFromSession();
        if (!location.state?.user && jwt) {
            const decodedUser = JSON.parse(decodeJwt(jwt));
            setLoginUser(decodedUser);
        }
    }, []);
    const formattedDate = new Date().toISOString().slice(0, 16);
    const [formData, setFormData] = useState({
        AppointmentID: null,
        BookerUserID: "",
        BookerUserName: "",
        AppointmentUserID: (property && property.userID) ? property.userID : null,
        AppointmentUserName: (property && property.userName) ? property.userName : "",
        PropertyID: (property && property.propertyID) ? property.propertyID : "",
        PropertyTitle: (property && property.propertyTitle) ? property.propertyTitle : "",
        AppointmentStartDate: formattedDate,
        AppointmentEndDate: formattedDate,
        Status: "Pending",
        Notes: "",
    });

    useEffect(() => {
        if (loginUser) {
            setFormData((prev) => ({
                ...prev,
                BookerUserID: loginUser.UserId,
                BookerUserName: loginUser.UserName,
            }));
        }

        async function fetchUserDropdownData() {
            try {
                const userResponse = await axios.get("/api/Appointment/GetUserDropDown", {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                setUsers(userResponse.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }
        fetchUserDropdownData();
    }, [loginUser]);

    useEffect(() => {
        if (formData.AppointmentUserID) {
            fetchPropertiesByUserID(formData.AppointmentUserID);
        } else {
            setProperties([]);
        }
    }, [formData.AppointmentUserID]);

    const fetchPropertiesByUserID = async (userID) => {
        try {
            const propertyResponse = await axios.get(`/api/Appointment/GetPropertyDropDown/${userID}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setProperties(propertyResponse.data);
        } catch (error) {
            console.error("Error fetching properties:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: "",
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            appointmentID: formData.AppointmentID || null,
            bookerUserID: formData.BookerUserID ? parseInt(formData.BookerUserID) : null,
            appointmentUserID: formData.AppointmentUserID ? parseInt(formData.AppointmentUserID) : null,
            propertyID: formData.PropertyID ? parseInt(formData.PropertyID) : null,
            appointmentStartDate: formData.AppointmentStartDate
                ? new Date(formData.AppointmentStartDate).toISOString()
                : new Date().toISOString(),
            appointmentEndDate: formData.AppointmentEndDate
                ? new Date(formData.AppointmentEndDate).toISOString()
                : new Date().toISOString(),
            status: formData.Status || 'Pending',
            notes: formData.Notes ? formData.Notes.trim() : '',
        };
        console.log("Submitting payload:", payload);

        try {
            const response = await axios.post("/api/Appointment/ScheduleAppointment", payload, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status == 200) {
                Swal.fire({
                    title: "Appointment scheduled successfully!",
                    icon: "success",
                });
                setErrors({});
                setFormData({
                    AppointmentID: null,
                    BookerUserID: loginUser.UserId,
                    BookerUserName: loginUser.UserName,
                    AppointmentUserID: "",
                    AppointmentUserName: "",
                    PropertyID: "",
                    PropertyTitle: "",
                    AppointmentStartDate: "",
                    AppointmentEndDate: "",
                    Status: "Pending",
                    Notes: "",
                });
                setProperties([]);
            }
        } catch (error) {
            if (error.response && error.response.data.errors) {
                const serverErrors = error.response.data.errors;
                const validationErrors = {};

                if (Array.isArray(serverErrors)) {
                    serverErrors.forEach((err) => {
                        validationErrors[err.Field] = err.Error;
                    });
                } else {
                    for (const [field, errorMessage] of Object.entries(serverErrors)) {
                        validationErrors[field] = errorMessage;
                    }
                }

                setErrors(validationErrors);
                console.log("Validation errors:", validationErrors);
            } else {
                Swal.fire("An error occurred. Please check your input and try again.", {
                    icon: "error",
                });
            }
        }
    };


    return (
        <div className="card shadow m-3">
            <div className="card-body">
                <h4 className="card-title text-center bg-dark text-white py-3 rounded">
                    Schedule Appointment
                </h4>

                <form onSubmit={handleSubmit}>
                    {/* Buyer Info */}
                    <div className="form-group">
                        <label>Buyer userName</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.BookerUserName}
                            disabled
                        />
                    </div>

                    {/* Seller Dropdown */}
                    <div className="form-group">
                        <label>
                            <span className="text-danger">*</span> Seller Name
                        </label>
                        <select
                            name="AppointmentUserID"
                            className="form-control"
                            value={formData.AppointmentUserID || ""}
                            onChange={handleChange}
                        >
                            <option value="" disabled>
                                Select a Seller
                            </option>
                            {users
                                .filter(user => user.userID != formData.BookerUserID)
                                .map((user) => (
                                    <option key={user.userID} value={user.userID}>
                                        {user.fullName}
                                    </option>
                                ))}
                        </select>
                        {errors.AppointmentUserID && (
                            <span className="text-danger">{errors.AppointmentUserID}</span>
                        )}
                    </div>

                    {/* Property Dropdown */}
                    <div className="form-group">
                        <label>
                            <span className="text-danger">*</span> Property
                        </label>
                        <select
                            name="PropertyID"
                            className="form-control"
                            value={formData.PropertyID || ""}
                            onChange={handleChange}
                        >
                            <option value="" disabled>
                                Select a Property
                            </option>
                            {properties.map((property) => (
                                <option key={property.propertyID} value={property.propertyID}>
                                    {property.propertyTitle}
                                </option>
                            ))}
                        </select>
                        {errors.PropertyID && (
                            <span className="text-danger">{errors.PropertyID}</span>
                        )}
                    </div>

                    {/* Date Inputs */}
                    <div className="form-group">
                        <label>
                            <span className="text-danger">*</span> Start Date
                        </label>
                        <input
                            type="datetime-local"
                            name="AppointmentStartDate"
                            className="form-control"
                            value={formData.AppointmentStartDate}
                            onChange={handleChange}
                        />
                        {errors.AppointmentStartDate && (
                            <span className="text-danger">{errors.AppointmentStartDate}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label>
                            <span className="text-danger">*</span> End Date
                        </label>
                        <input
                            type="datetime-local"
                            name="AppointmentEndDate"
                            className="form-control"
                            value={formData.AppointmentEndDate}
                            onChange={handleChange}
                        />
                        {errors.AppointmentEndDate && (
                            <span className="text-danger">{errors.AppointmentEndDate}</span>
                        )}
                    </div>

                    {/* Status */}
                    {/* <div className="form-group">
                        <label>Status</label>
                        <select
                            name="Status"
                            className="form-control"
                            value={formData.Status}
                            onChange={handleChange}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Rescheduled">Rescheduled</option>
                        </select>
                    </div> */}

                    {/* Notes */}
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            name="Notes"
                            className="form-control"
                            value={formData.Notes}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary w-100 mt-3">
                        Schedule Appointment
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AppointmentForm;
