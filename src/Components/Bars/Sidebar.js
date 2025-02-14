import { Link, NavLink } from "react-router-dom";
import img from "../../img/logo-ct-dark.png";
import { decodeJwt, getJWTFromSession } from "../Login/GetAuth";
import { useEffect, useState } from "react";

const Sidebar = ({ isOpen }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const jwt = getJWTFromSession();
    if (jwt) {
      try {
        const decodedUser = JSON.parse(decodeJwt(jwt));
        setUser(decodedUser);
      } catch (error) {
        console.error("Failed to decode JWT:", error);
      }
    }
  }, []);

  return (
    <aside 
      className={`sidenav navbar navbar-vertical navbar-expand-xs border-radius-lg fixed-start ms-2 bg-white my-2 transition-all`} 
      id="sidenav-main" 
      style={{ left: isOpen ? "0" : "-230px" }}
    >
      <div className="sidenav-header">
        <a 
          className="navbar-brand px-4 py-3 m-0" 
          href="https://demos.creative-tim.com/material-dashboard/pages/dashboard" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img src={img} className="navbar-brand-img" width="26" height="26" alt="main_logo" />
          <span className="ms-1 text-sm text-dark">Creative Tim</span>
        </a>
      </div>
      <hr className="horizontal dark mt-0 mb-2" />
      <div className="collapse navbar-collapse w-auto" id="sidenav-collapse-main">
        <ul className="navbar-nav">
          <li className="nav-item">
            <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-link active bg-gradient-dark text-white" : "nav-link text-dark"}>
              <i className="bi bi-speedometer2 opacity-5"></i>
              <span className="nav-link-text ms-1">Dashboard</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/property" className={({ isActive }) => isActive ? "nav-link active bg-gradient-dark text-white" : "nav-link text-dark"}>
              <i className="bi bi-building opacity-5"></i>
              <span className="nav-link-text ms-1">Property</span>
            </NavLink>
          </li>
          {user && ["Admin", "Seller", "Agent"].includes(user.UserRole) && (
            <li className="nav-item">
              <NavLink to="/admin/property-add" className={({ isActive }) => isActive ? "nav-link active bg-gradient-dark text-white" : "nav-link text-dark"}>
                <i className="bi bi-plus-circle opacity-5"></i>
                <span className="nav-link-text ms-1">Add Property</span>
              </NavLink>
            </li>
          )}
          <li className="nav-item">
            <NavLink to="/admin/agent" className={({ isActive }) => isActive ? "nav-link active bg-gradient-dark text-white" : "nav-link text-dark"}>
              <i className="bi bi-person-badge opacity-5"></i>
              <span className="nav-link-text ms-1">Agent</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/appointment" className={({ isActive }) => isActive ? "nav-link active bg-gradient-dark text-white" : "nav-link text-dark"}>
              <i className="bi bi-calendar-check opacity-5"></i>
              <span className="nav-link-text ms-1">Appointment</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/transaction" className={({ isActive }) => isActive ? "nav-link active bg-gradient-dark text-white" : "nav-link text-dark"}>
              <i className="bi bi-cash-stack opacity-5"></i>
              <span className="nav-link-text ms-1">Transaction</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/contactUs" className={({ isActive }) => isActive ? "nav-link active bg-gradient-dark text-white" : "nav-link text-dark"}>
              <i className="bi bi-envelope opacity-5"></i>
              <span className="nav-link-text ms-1">Contact Us</span>
            </NavLink>
          </li>
          <li className="nav-item mt-3">
            <h6 className="ps-4 ms-2 text-uppercase text-xs text-dark font-weight-bolder opacity-5">Account Pages</h6>
          </li>
          <li className="nav-item">
            <NavLink to="/admin/profile" className={({ isActive }) => isActive ? "nav-link active bg-gradient-dark text-white" : "nav-link text-dark"}>
              <i className="bi bi-person opacity-5"></i>
              <span className="nav-link-text ms-1">Profile</span>
            </NavLink>
          </li>
          {user && user.UserId > 0 ? (
            <li className="nav-item">
              <Link className="nav-link text-dark" to="/logout">
                <i className="bi bi-box-arrow-right opacity-5"></i>
                <span className="nav-link-text ms-1">Logout</span>
              </Link>
            </li>
          ) : (
            <>
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/login">
                  <i className="bi bi-box-arrow-in-right opacity-5"></i>
                  <span className="nav-link-text ms-1">Sign In</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/register">
                  <i className="bi bi-pencil-square opacity-5"></i>
                  <span className="nav-link-text ms-1">Sign Up</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
