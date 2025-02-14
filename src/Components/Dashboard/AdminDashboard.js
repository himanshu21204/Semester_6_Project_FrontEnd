import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { DataTable } from 'simple-datatables';
import { Link, useNavigate } from "react-router-dom";
import { CounterContext } from "../../Context/Context";
import { getJWTFromSession } from "../Login/GetAuth";
import Swal from "sweetalert2";

const AdminDashboard = () => {
    
    const iconMapping = {
        "Total Properties": "business",
        "Properties For Rent": "home",
        "Properties For Buy": "shopping_cart",
        "Properties For Sale": "sell",
        "Total Earnings": "attach_money",
        "Total Bookmarked": "bookmark"
    };
    const tableAgentRef = useRef(null);
    const tablePropertyRef = useRef(null);
    const navigate = useNavigate();
    const [data, setData] = useState({
        counts: [],
        recentProperties: [],
        recentAgents: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get("/api/Dashboard/GetAllDashboard", {
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
    }, []);

    useEffect(() => {
        if (data.recentProperties.length > 0 && tableAgentRef.current && tablePropertyRef.current) {
            new DataTable(tableAgentRef.current);
            new DataTable(tablePropertyRef.current);
        }
    }, [data]);

    const onView = (propertyID) => {
        navigate('/property/' + propertyID);
    }
    const onViewAgent = (agentID) => {
        navigate('/agent/' + agentID);
    }

    return (
        <div className="main-content">
            <div className="container">
            <h1>Dashboard</h1>
                <div className="card">
                    <div className="row card-body">
                        {data.counts.map((count, index) => (
                            <div key={index} className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                                <div className="card mb-2" style={{ height: "100px", width: "265px" }}>
                                    <div className="card-header p-4 ps-3">
                                        <div className="d-flex justify-content-around">
                                            <div className="icon icon-md icon-shape bg-gradient-dark shadow-dark shadow text-center border-radius-lg">
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
                    {/* Recent Properties Section */}
                    {data.recentProperties.length > 0 && (
                        <div className="col-12 mb-2">
                            <div className="card card-body mt-2">
                                <h3>Recent Propertys</h3>
                                <div style={{ overflowX: "auto" }}>
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
                                                        <Link
                                                            to={`/property/${property.propertyID}`}
                                                            style={{ textDecoration: "none" }}
                                                        >
                                                            {property.propertyTitle}
                                                        </Link>
                                                    </td>
                                                    <td>{property.transactionType}</td>
                                                    <td>${property.propertyPrice}</td>
                                                    <td>
                                                        {new Date(property.createdAt).toLocaleDateString("en-GB", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </td>
                                                    <td className="d-flex justify-content-center">
                                                        <button
                                                            className="btn btn-info btn-sm me-2"
                                                            onClick={() => onView(property.propertyID)}
                                                        >
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

                    {/* Recent Agents Section */}
                    {data.recentAgents.length > 0 && (
                        <div className="col-12 mb-3">
                            <div className="card card-body mt-2">
                                <h3>Recent Agents</h3>
                                <div style={{ overflowX: "auto" }}>
                                    <table ref={tableAgentRef} className="table table-bordered mt-4">
                                        <thead>
                                            <tr className="text-center">
                                                <th>#</th>
                                                <th>Agent Name</th>
                                                <th>Email</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.recentAgents.map((agent, index) => (
                                                <tr key={agent.agentID} className="text-center">
                                                    <td>{index + 1}</td>
                                                    <td className="truncate-text">{agent.agentName}</td>
                                                    <td className="truncate-text">{agent.email}</td>
                                                    <td className="d-flex justify-content-center">
                                                        <button
                                                            className="btn btn-info btn-sm"
                                                            onClick={() => onViewAgent(agent.agentID)}
                                                        >
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
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

