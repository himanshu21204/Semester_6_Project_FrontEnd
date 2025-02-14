import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Components/Layouts/Layout';
import Sidebar from './Components/Bars/Sidebar';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import Property from './Components/Propertys/Property';
import Dashboard from './Components/Dashboard/Dashboard';
import Agent from './Components/Agents/Agent';
import ContactUs from './Components/Extra pages/ContactUs';
import AboutUs from './Components/Extra pages/AboutUs';
import Profile from './Components/Profile/Profile';
import axios from 'axios';
import PropertDetail from './Components/Propertys/PropertyDetails';
import PropertyAdd from './Components/Propertys/PropertyAdd';
import Logout from './Components/Login/Logout';
import ProtectedRoute from './Components/Login/ProtectedRoute';
import UnauthorizedPage from './Components/Login/Unauthorized';
import AgentDetail from './Components/Agents/AgentDetails';
import PageNotFound from './Components/Login/PageNotFound';
import Favorite from './Components/Favorites/Favorites';
import AppointmentForm from './Components/Appointment/AppointmentForm';
import AppointmentDashboard from './Components/Appointment/AppointmentDashboard';
import AppointmentList from './Components/Appointment/AppointmentList';
import Transaction from './Components/Transaction/Transaction';
import TransactionList from './Components/Transaction/TransactionList';
import TransactionForm from './Components/Transaction/TransactionForm';
import { CounterProvider } from './Context/Context';
import InstallmentForm from './Components/Transaction/InstallmentForm';
import Navbar from './Components/Bars/Navbar';
import Home from './Components/Home/Home';
import ContactUsForm from './Components/Extra pages/ContactUsForm';
import { GoogleOAuthProvider } from "@react-oauth/google"
import ForgotPassword from './Components/Login/ForgotPassword';

// axios.defaults.baseURL = 'https://localhost:44382/api/';
// axios.defaults.withCredentials = true

const navbarItems = ["Home", "Property", "Agents", "About Us", "Contact Us"];
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId='ID'>
    <CounterProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Navbar navbar={navbarItems} />}>
            <Route index element={<Home />}></Route>
            <Route path="property/:propertyID" element={<PropertDetail />} />
            <Route path="profile/:id?" element={<Profile />} />
            <Route path="property" element={<Property />} />
            <Route path="agents" element={<Agent />} />
            <Route path="Agent/:userID" element={<AgentDetail />} />
            <Route path="aboutUs" element={<AboutUs />} />
            <Route path="contactUs" element={<ContactUsForm />} />
            <Route path="favorite" element={<Favorite />} />
            <Route path="appointmentForm" element={<AppointmentForm />} />
          </Route>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path='/reset-password' element={<ForgotPassword/>}/>

          <Route path="/admin" element={<ProtectedRoute roles={["Admin", "Seller", "Agent"]} />}>
            <Route path="property-add" element={<PropertyAdd />} />
            <Route path="property-update/:propertyID" element={<PropertyAdd />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute roles={["Admin", "Seller", "Agent"]} />}>
            <Route path='' element={<Layout />}>
              <Route path='dashboard' element={<Dashboard />} />
              <Route path="property" element={<Property />} />
              <Route path="agent" element={<Agent />} />
              <Route path="contactUs" element={<ContactUs />} />
              <Route path="property/:propertyID" element={<PropertDetail />} />
              <Route path="profile/:id?" element={<Profile />} />
              <Route path="Agent/:userID" element={<AgentDetail />} />
              <Route path='transaction' element={<Transaction />}></Route>
              <Route path="appointment/" element={<AppointmentDashboard />}>
                <Route index element={<AppointmentForm />} />
                <Route
                  path="appointmentList"
                  element={<AppointmentList />}
                />
              </Route>
              <Route path="transaction/" element={<Transaction />}>
                <Route index element={<TransactionForm />} />
                <Route
                  path="transactionList"
                  element={<TransactionList />}
                />
                <Route path="installment/:transactionId" element={<InstallmentForm />} />
              </Route>
            </Route>
          </Route>
          <Route path='/unauthorized' element={<UnauthorizedPage />}></Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </CounterProvider>
  </GoogleOAuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
