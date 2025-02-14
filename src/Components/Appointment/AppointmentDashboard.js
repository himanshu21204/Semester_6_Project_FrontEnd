import { useEffect, useState } from "react";
import { decodeJwt, getJWTFromSession } from "../Login/GetAuth";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const AppointmentDashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);

    useEffect(() => {
        const jwt = getJWTFromSession();
        if (jwt) {
            try {
                const decodedUser = JSON.parse(decodeJwt(jwt));
                setUser(decodedUser);
            } catch (error) {
                console.error("Failed to decode JWT:", error);
                handleNavigate();
            }
        } else {
            handleNavigate();
        }
    }, []);


    const handleNavigate = () => {
        Swal.fire({
            title: "First you need to login/register.",
            icon: "error",

        }).then(() => {
            navigate('/login');
        });
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="main">
            <div>
                <div className="d-flex justify-content-between align-items-center">
                    <p className="fs-1">Appointment</p>
                    {!pathnames[pathnames.length - 1].endsWith("List") ?
                        <Link
                            className="text-white"
                            style={{
                                textDecoration: "none"
                            }}
                            to='/admin/appointment/appointmentList'
                        >
                            <div className="btn btn-primary">
                                View Appointments
                            </div>
                        </Link>
                        :
                        <Link
                            className="text-white"
                            style={{
                                textDecoration: "none"
                            }}
                            to='/admin/appointment'
                            state={{ user }}
                        ><div className="btn btn-primary">
                                Schedule Appointments
                            </div>
                        </Link>

                    }
                </div>
                <div>
                    <Outlet />
                </div>
            </div >
        </div >
    );
};

export default AppointmentDashboard;