import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { decodeJwt, getJWTFromSession } from '../Login/GetAuth';
import { Link, useNavigate } from 'react-router-dom';
import { DataTable } from 'simple-datatables';

const AppointmentList = () => {
    const [appointmentData, setAppointmentData] = useState([]);
    const [user, setUser] = useState({});
    const tableRef = useRef(null);
    const navigate = useNavigate();
    
    // Fetching user info from JWT
    useEffect(() => {
        const jwt = getJWTFromSession();
        if (jwt) {
            const decodedUser = JSON.parse(decodeJwt(jwt));
            setUser(decodedUser);
        }
    }, []);

    // Fetching appointments by user
    useEffect(() => {
        if (user && user.UserId) {
            axios.get(`/api/Appointment/GetAppointmentsByUser/${user.UserId}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${getJWTFromSession()}` }
            })
                .then(response => {
                    setAppointmentData(response.data);
                })
                .catch(error => {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: error.response?.data?.message || "Something went wrong!",
                        confirmButtonText: "OK"
                    }).then(() => {
                        navigate("/");
                    });
                });
        }
    }, [user]);

    useEffect(() => {
        if (appointmentData.length > 0 && tableRef.current) {
            new DataTable(tableRef.current);
        }
    }, [appointmentData]);

    const onView = (appointment) => {
        Swal.fire({
            title: `Appointment Details`,
            html: `
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Buyer</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${appointment.bookerName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Seller</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${appointment.appointmentUserName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Property</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${appointment.propertyTitle}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Start Date</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${new Date(appointment.appointmentStartDate).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            })}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">End Date</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${new Date(appointment.appointmentEndDate).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            })}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Status</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${appointment.status}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Notes</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${appointment.notes}</td>
                    </tr>
                </table>
            `,
            icon: "info",
            confirmButtonText: "Close",
        });
    };

    const onChangeStatus = async (appointment) => {
        try {
            const { value: selectedStatus } = await Swal.fire({
                title: "Change Appointment Status",
                html: `
                    <div style="text-align: left;">
                        <label>
                            <input type="radio" name="status" value="Scheduled" ${appointment.status === "Scheduled" ? "checked" : ""} /> Scheduled
                        </label><br/>
                        <label>
                            <input type="radio" name="status" value="Completed" ${appointment.status === "Completed" ? "checked" : ""} /> Completed
                        </label><br/>
                        <label>
                            <input type="radio" name="status" value="Cancelled" ${appointment.status === "Cancelled" ? "checked" : ""} /> Cancelled
                        </label><br/>
                        <label>
                            <input type="radio" name="status" value="Rescheduled" ${appointment.status === "Rescheduled" ? "checked" : ""} /> Rescheduled
                        </label><br/>
                        <label>
                            <input type="radio" name="status" value="Pending" ${appointment.status === "Pending" ? "checked" : ""} /> Pending
                        </label>
                    </div>
                `,
                focusConfirm: false,
                preConfirm: () => {
                    const selectedOption = document.querySelector('input[name="status"]:checked');
                    return selectedOption ? selectedOption.value : null;
                },
                showCancelButton: true,
                confirmButtonText: "Update",
                cancelButtonText: "Cancel",
            });

            if (!selectedStatus) {
                Swal.fire("Info", "No status selected.", "info");
                return;
            }

            const response = await axios.put(`/api/Appointment/UpdateAppointmentStatus/${appointment.appointmentID}`, {
                Status: selectedStatus
            }, {
                headers: { Authorization: `Bearer ${getJWTFromSession()}` }
            });

            if (response.data) {
                setAppointmentData((prev) =>
                    prev.map((item) =>
                        item.appointmentID === appointment.appointmentID
                            ? { ...item, status: selectedStatus }
                            : item
                    )
                );
                Swal.fire("Success", `Status updated to "${selectedStatus}".`, "success");
            } else {
                throw new Error("Response data is undefined.");
            }

        } catch (error) {
            Swal.fire("Error", "Unable to update status. Please try again.", "error");
            console.error("Error updating status:", error);
        }
    };

    return (
        <div>
            <div>
                <div className="row justify-content-center align-items-center h-100">
                    <div className="card shadow">
                        <div className="card-body">
                            <h4
                                className="card-title text-center"
                                style={{
                                    borderRadius: "0.5rem",
                                    backgroundImage: "linear-gradient(195deg, #42424a 0%, #191919 100%)",
                                    boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(64, 64, 64, 0.4)",
                                    color: "#fff",
                                    padding: "1rem",
                                }}
                            >
                                Appointment List
                            </h4>
                            <div>
                                <table ref={tableRef} className="table table-bordered mt-4">
                                    <thead>
                                        <tr className='text-center'>
                                            <th>#</th>
                                            <th>Buyer Name</th>
                                            <th>Seller Name</th>
                                            <th>Property Title</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointmentData.map((appointment, index) => (
                                            <tr key={appointment.appointmentID} className='text-center'>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <Link
                                                        to={"/Profile/" + appointment.bookerUserID}
                                                        style={{ textDecoration: "none" }}
                                                    >
                                                        {appointment.bookerName}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <Link
                                                        to={"/Agent/" + appointment.appointmentUserID}
                                                        style={{ textDecoration: "none" }}
                                                    >
                                                        {appointment.appointmentUserName}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <Link
                                                        to={"/property/" + appointment.propertyID}
                                                        style={{ textDecoration: "none" }}
                                                    >
                                                        {appointment.propertyTitle}
                                                    </Link>
                                                </td>
                                                <td>{new Date(appointment.appointmentStartDate).toLocaleString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                }).split(',')[0]}</td>
                                                <td>{new Date(appointment.appointmentEndDate).toLocaleString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}</td>
                                                <td>
                                                    <span className={`badge ${appointment.status === 'Scheduled' ? 'bg-warning' :
                                                        appointment.status === 'Completed' ? 'bg-success' :
                                                            appointment.status === 'Cancelled' ? 'bg-danger' :
                                                                appointment.status === 'Rescheduled' ? 'bg-info' :
                                                                    appointment.status === 'Pending' ? 'bg-secondary' : ''}`}>
                                                        {appointment.status}
                                                    </span>
                                                </td>
                                                <td className='d-flex justify-content-between'>
                                                    <button
                                                        className="btn btn-info btn-sm"
                                                        onClick={() => onView(appointment)}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => onChangeStatus(appointment)}
                                                    >
                                                        Change Status
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentList;
