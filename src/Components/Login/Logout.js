import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // sessionStorage.removeItem("jwt"); // Remove JWT token from sessionStorage
    // localStorage.removeItem("jwt");  // Remove JWT token from localStorage
    // sessionStorage.removeItem("UserName");
    // sessionStorage.removeItem("User");
    sessionStorage.clear();
    localStorage.clear();

    // Redirect user to login page after logout
    navigate('/login');
  }, [navigate]);

  return (
    <div>
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;
