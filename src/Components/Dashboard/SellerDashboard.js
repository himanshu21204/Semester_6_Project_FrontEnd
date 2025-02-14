import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { DataTable } from 'simple-datatables';
import { Link, useNavigate } from "react-router-dom";
import { decodeJwt, getJWTFromSession } from "../Login/GetAuth";
import Swal from 'sweetalert2'

const SellerDashboard = () => {
    const [user, setUser] = useState();
    const [data, setData] = useState({
        counts: [],
        recentProperties: [],
        recentAppointments: []
    });

    const tablePropertyRef = useRef(null);
    const tableAppointmentRef = useRef(null);
    const navigate = useNavigate();

    // Get user from JWT
    useEffect(() => {
        const jwt = getJWTFromSession();
        if (jwt) {
            const decodedUser = JSON.parse(decodeJwt(jwt));
            setUser(decodedUser);
        }
    }, []);

    // Fetch dashboard data only if the user is set
    useEffect(() => {
        if (user) {
            const fetchDashboardData = async () => {
                try {
                    const response = await axios.get(`/api/Dashboard/GetAllDashboard/${user.UserId}`, {
                        headers: { Authorization: `Bearer ${getJWTFromSession()}` }
                    });
                    setData(response.data);
                } catch (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: error.response?.data?.message || "Something went wrong!",
                        confirmButtonText: "OK"
                    })
                }
            };

            fetchDashboardData();
        }
    }, [user]);

    // Initialize data tables after data is fetched
    useEffect(() => {
        if (data.recentProperties.length > 0 && tablePropertyRef.current) {
            new DataTable(tablePropertyRef.current);
        }
        if (data.recentAppointments.length > 0 && tableAppointmentRef.current) {
            new DataTable(tableAppointmentRef.current);
        }
    }, [data]);

    const iconMapping = {
        "Total Properties": "business",
        "Properties For Rent": "home",
        "Properties For Buy": "shopping_cart",
        "Properties For Sale": "sell",
        "Total Earnings": "attach_money"
    };

    const onView = (propertyID) => {
        navigate(`/property/${propertyID}`);
    };

    return (
        <div className="main-content">
            <div className="container">
            <h1>Dashboard</h1>
                <div className="card">
                    <div className="row card-body">
                        {data.counts.map((count, index) => (
                            <div key={index} className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                                <div className="card mb-2" style={{ height: "100px", width: "265px" }}>
                                    <div className="card-header card-body p-4 ps-3">
                                        <div className="d-flex justify-content-around">
                                            <div className="icon icon-md icon-shape bg-gradient-dark shadow text-center border-radius-lg">
                                                <i className="material-symbols-rounded opacity-10 fs-4">{iconMapping[count.metric] || "weekend"}</i>
                                            </div>
                                            <div>
                                                <p className="text-sm mb-0 text-capitalize">{count.metric}</p>
                                                <h4 className="mb-0">{count.value}</h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="row">
                    {data.recentProperties.length > 0 && (
                        <div className="col-12 mb-2">
                            <div className="card card-body mt-2">
                                <h3>Recent Properties</h3>
                                <div className="table-responsive">
                                    <table ref={tablePropertyRef} className="table table-bordered mt-4">
                                        <thead>
                                            <tr className="text-center">
                                                <th>#</th>
                                                <th>Property Title</th>
                                                <th>Transaction Type</th>
                                                <th>Price</th>
                                                <th>Added On</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.recentProperties.map((property, index) => (
                                                <tr key={property.propertyID} className="text-center">
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <Link to={`/property/${property.propertyID}`} style={{ textDecoration: "none" }}>
                                                            {property.propertyTitle}
                                                        </Link>
                                                    </td>
                                                    <td>{property.transactionType}</td>
                                                    <td>${property.propertyPrice}</td>
                                                    <td>{new Date(property.createdAt).toLocaleDateString("en-GB", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}</td>
                                                    <td>
                                                        <button className="btn btn-info btn-sm" onClick={() => onView(property.propertyID)}>
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {data.recentAppointments.length > 0 && (
                        <div className="col-12">
                            <div className="card card-body mt-2">
                                <h3>Recent Appointments</h3>
                                <div className="table-responsive">
                                    <table ref={tableAppointmentRef} className="table table-bordered mt-4">
                                        <thead>
                                            <tr className="text-center">
                                                <th>#</th>
                                                <th>Buyer ID</th>
                                                <th>Property ID</th>
                                                <th>Start Date</th>
                                                <th>End Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.recentAppointments.map((appointment, index) => (
                                                <tr key={appointment.appointmentID} className="text-center">
                                                    <td>{index + 1}</td>
                                                    <td>{appointment.bookerUserID}</td>
                                                    <td>{appointment.propertyID}</td>
                                                    <td>{new Date(appointment.appointmentStartDate).toLocaleDateString("en-GB", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}</td>
                                                    <td>{new Date(appointment.appointmentEndDate).toLocaleDateString("en-GB", {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}</td>
                                                    <td>{appointment.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
