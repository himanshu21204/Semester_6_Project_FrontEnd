import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Bars/Sidebar';
import Navbar from '../Bars/Navbar';
import Footer from '../Footer/footer';

const Layout = () => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="d-flex">
            {/* Sidebar */}
            <div className="sidebar">
                <Sidebar isOpen={isOpen}/>
            </div>

            {/* Main Content */}
            <div className="main-content flex-grow-1">
                {/* Navbar */}
                <div className="navbar-container">
                    <Navbar navbar={[]} toggle={() => setIsOpen(!isOpen)} isOpen={isOpen}/>
                </div>
                
                <div className="content p-4" style={{marginLeft:isOpen? "230px":"0"}}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
