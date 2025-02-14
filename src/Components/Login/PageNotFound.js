import React from "react";
import { Link } from "react-router-dom";

const PageNotFound = () => {
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1 style={{ fontSize: "4rem", color: "#FF5733" }}>404</h1>
            <h2>Page Not Found</h2>
            <p>The page you're looking for doesn't exist.</p>
            <Link to="/">
                <button className='btn btn-primary'>
                    Go Back
                </button>
            </Link>
        </div>
    );
};

export default PageNotFound;