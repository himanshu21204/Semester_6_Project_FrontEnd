import { useEffect, useState } from "react";
import { decodeJwt, getJWTFromSession } from "../Login/GetAuth";
import AdminDashboard from "./AdminDashboard";
import SellerDashboard from "./SellerDashboard";
import BuyerDashboard from "./BuyerDashboard";

const Dashboard = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const jwt = getJWTFromSession();
        if (jwt) {
            try {
                const decodedUser = JSON.parse(decodeJwt(jwt));
                setUser(decodedUser);
            } catch (error) {
                console.error("Error decoding JWT:", error);
            }
        }
    }, []);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="main">
            {user.UserRole === "Admin" ? (
                <AdminDashboard />
            ) : user.UserRole === "Seller" || user.UserRole === "Agent" ? (
                <SellerDashboard />
            ) : (
                <div>Unauthorized Access</div>
            )}
        </div>
    );
};

export default Dashboard;
