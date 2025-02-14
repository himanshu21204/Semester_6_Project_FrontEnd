import React, { useEffect, useState } from "react";
import { useLocation, Link, Outlet, NavLink } from "react-router-dom";
import { decodeJwt, getJWTFromSession } from "../Login/GetAuth";
import axios from "axios";
import "./Navbar.css"
import AnimatedBackground from "../Extra pages/AnimatedBackground";
import Footer from "../Footer/footer";
import Swal from "sweetalert2";

const Navbar = ({ navbar, toggle, isOpen }) => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState({});
  const [userProfilePhoto, setUserProfilePhoto] = useState("");

  useEffect(() => {
    const jwt = getJWTFromSession();
    if (jwt) {
      const decodedUser = JSON.parse(decodeJwt(jwt));
      setUser(decodedUser);
      setIsLogin(true);
    }
  }, []);

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (user.UserId) {
        try {
          const response = await axios.get(`/api/User/GetUserProfilePhoto/${user.UserId}`, {
            headers: { Authorization: `Bearer ${getJWTFromSession()}` }
          });
          setUserProfilePhoto(response.data || "");
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "Something went wrong!",
            confirmButtonText: "OK"
          })
        }
      }
    };
    fetchProfilePhoto();
  }, [user]);

  return (
    <div>
      {navbar && navbar.length > 0 && pathnames.length == 0 && (
        <AnimatedBackground />
      )}
      <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg bg-light rounded shadow-sm" style={{
        marginLeft: isOpen ? "230px" : "0",
        marginTop: navbar && navbar.length > 0 ? "0" : "10px",
        paddingBottom: navbar && navbar.length > 0 ? "0" : "12px",
        transition: "all 0.3s ease-in-out",
      }}>
        <nav className="navbar navbar-main navbar-expand-lg pb-0 mx-3 shadow-none border-radius-xl" id="navbarBlur" data-scroll="true" style={{ padding: "5px" }}>
          <div className="container-fluid pt-1 d-flex align-items-center" style={{ justifyContent: navbar && navbar.length > 0 ? "space-around" : "space-between" }}>
            {navbar && navbar.length > 0 && (
              <div>
                <img src="https://i.ibb.co/VcKkCTPj/Logo-real-estate-Copy.png" title="Logo" width={100} height={55}></img>
              </div>
            )}
            {navbar && navbar.length > 0 && (
              <ul className="navbar-nav d-flex flex-row">
                {navbar.map((item, index) => (
                  <li key={index} className="nav-item px-2">
                    <NavLink
                      to={item === "Home" ? "/" : `/${item.replace(/\s+/g, "").toLowerCase()}`}
                      className={({ isActive }) => isActive ? "nav-link text-white fw-bold bg-dark bg-gradient rounded link-hover" : "nav-link text-black fw-bold link-hover"}
                      style={{ textDecoration: "none", position: "relative" }}
                    >
                      {item}
                    </NavLink>
                  </li>
                ))}
                {user && ["Admin", "Seller", "Agent"].includes(user.UserRole) && (
                  <NavLink
                    to={`/admin/dashboard`}
                    className={({ isActive }) => isActive ? "nav-link text-white fw-bold bg-dark bg-gradient rounded link-hover" : "nav-link text-black fw-bold link-hover"}
                    style={{ textDecoration: "none", position: "relative" }}
                  >
                    Dashboard
                  </NavLink>
                )}
              </ul>
            )}
            {navbar == null || navbar.length == 0 &&
              <button className="text-3xl mr-4 btn" onClick={toggle}>
                <i class="bi bi-list toggle-sidebar-btn fs-3" ></i>
              </button>
            }
            {/* User Profile Section (Always Visible) */}
            <div className="d-flex align-items-center">
              {isLogin ? (
                <div className="nav-profile d-flex align-items-center dropdown-toggle" id="navbarDropdown" data-bs-toggle="dropdown" aria-expanded="false" style={{ cursor: "pointer" }}>
                  <span className="d-none d-md-block pe-2 ">{`Hi, ${user?.FullName || "Demo Name"}`}</span>
                  <img src={userProfilePhoto || "https://placehold.co/40"} alt="Profile" className="rounded-circle" width={40} height={40} />
                </div>
              ) : (
                <div>
                  <Link className="text-decoration-none" to="/login">
                  Sign In
                </Link>
                <span className="mx-1">|</span>
                <Link className="text-decoration-none" to="/register">
                  Sign Up
                </Link>
                </div>
              )}

              {/* Dropdown Menu */}
              {isLogin && (
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="navbarDropdown"
                  style={{ right: navbar && navbar.length > 0 ? "120px" : "0px" }}
                >
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to={user.UserRole === "Buyer" ? "/profile" : "/admin/profile"}
                    >
                      <i className="bi bi-person-circle me-2"></i> Profile
                    </Link>
                  </li>

                  {user.UserRole !== "Admin" && (
                    <li>
                      <Link className="dropdown-item d-flex align-items-center" to="/favorite">
                        <i className="bi bi-heart-fill me-2 text-danger"></i> Favorite
                      </Link>
                    </li>
                  )}

                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  <li>
                    <Link className="dropdown-item d-flex align-items-center text-danger" to="/logout">
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </nav>
      </main>
      {/* {pathnames && pathnames.length > 0 && (
        <div className="ms-3">
          <nav
            aria-label="breadcrumb"
            style={{ height: "30px", transform: "translateY(7px)",marginLeft: isOpen ? "230px" : "0" }}
          >
            <ol className="breadcrumb px-1">
              <li className="breadcrumb-item">
                <Link to="/" className="text-decoration-none text-primary">
                  <i className="bi bi-house-door"></i> Home
                </Link>
              </li>
              {pathnames.map((value, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                const isLast = index === pathnames.length - 1;
                return isLast ? (
                  <li
                    key={index}
                    className="breadcrumb-item active fw-bold text-dark"
                    aria-current="page"
                  >
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </li>
                ) : (
                  <li key={index} className="breadcrumb-item">
                    <Link to={routeTo} className="text-decoration-none text-primary">
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      )} */}
      {navbar && navbar.length > 0 && (
        <div>
          <Outlet />
        </div>
      )}
      {navbar && navbar.length > 0 &&
        <div>
          <Footer />
        </div>
      }
    </div>
  );
};

export default Navbar;