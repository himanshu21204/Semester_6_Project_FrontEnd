import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { decodeJwt, getJWTFromSession } from '../Login/GetAuth';

const ContactUs = () => {
    const tableRef = useRef(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [contactData, setContactData] = useState([]);

    useEffect(() => {
        const jwt = getJWTFromSession();
        if (jwt) {
            const decodedUser = JSON.parse(decodeJwt(jwt));
            setIsAdmin(decodedUser.UserRole == "Admin" ? true : false);
        }
    }, []);
    useEffect(() => {
        if (isAdmin) {
            axios.get('/api/ContactUS/GetAllContactUs', {
                headers: { Authorization: `Bearer ${getJWTFromSession()}` }
            })
                .then(response => {
                    setContactData(response.data);
                })
                .catch(error => {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: error.response?.data?.message || "Something went wrong!",
                        confirmButtonText: "OK"
                    })
                });
        }
    }, [isAdmin]);

    const onView = (query) => {
        Swal.fire({
            title: `Contact Us Details`,
            html: `
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${query.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${query.email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Phone Number</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${query.phoneNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Subject</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${query.subject}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Message</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${query.message}</td>
                    </tr>
                </table>
            `,
            icon: "info",
            confirmButtonText: "Close",
        });
    };

    const onChangeStatus = async (query) => {
        try {
            const { value: selectedStatus } = await Swal.fire({
                title: "Change Query Status",
                html: `
                    <div style="text-align: left;">
                        <label>
                            <input type="radio" name="status" value="Pending" ${query.status === "Pending" ? "checked" : ""
                    } /> Pending
                        </label><br/>
                        <label>
                            <input type="radio" name="status" value="In Progress" ${query.status === "In Progress" ? "checked" : ""
                    } /> In Progress
                        </label><br/>
                        <label>
                            <input type="radio" name="status" value="Resolved" ${query.status === "Resolved" ? "checked" : ""
                    } /> Resolved
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
            console.log(query.contactID)
            console.log(selectedStatus)
            const response = await axios.put(`/api/ContactUS/UpdateContactUsStatus/${query.contactID}`, {
                Status: selectedStatus
            }, {
                headers: { Authorization: `Bearer ${getJWTFromSession()}` }
            });
            if (response.data) {
                if (response.status === 200) {
                    setContactData((prev) =>
                        prev.map((item) =>
                            item.contactID === query.contactID
                                ? { ...item, status: selectedStatus }
                                : item
                        )
                    );
                    Swal.fire("Success", `Status updated to "${selectedStatus}".`, "success");
                } else {
                    throw new Error(`Unexpected response status: ${response.status}`);
                }
            } else {
                throw new Error("Response data is undefined.");
            }

        } catch (error) {
            Swal.fire("Error", "Unable to update status. Please try again.", "error");
            console.error("Error updating status:", error);
        }
    };


    return (
        <>
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
                                    <table ref={tableRef} className="table table-bordered mt-4">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Message</th>
                                                {/* <th>Date</th> */}
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contactData.map((query, index) => (
                                                <tr key={query.contactID}>
                                                    <td>{index + 1}</td>
                                                    <td>{query.name}</td>
                                                    <td>{query.email}</td>
                                                    <td>{query.message}</td>
                                                    {/* <td>{
                                                            new Date(query.submittedAt).toLocaleString('en-GB', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            }).split(',')[0]}</td> */}
                                                    <td>
                                                        <span className={`badge ${query.status === 'Pending' ? 'bg-danger text-dark' :
                                                            query.status === 'In Progress' ? 'bg-info text-white' :
                                                                query.status === 'Resolved' ? 'bg-success text-white' : ''}`}>
                                                            {query.status}
                                                        </span>
                                                    </td>
                                                    <td className='d-flex justify-content-between'>
                                                        <button
                                                            className="btn btn-info btn-sm"
                                                            onClick={() => onView(query)}
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => onChangeStatus(query)}
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
        </>
    );
};

export default ContactUs;
