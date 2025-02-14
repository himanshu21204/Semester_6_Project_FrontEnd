import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import { decodeJwt, getJWTFromSession } from "../Login/GetAuth";

function TransactionForm() {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [formData, setFormData] = useState({
    TransactionID: null,
    TotalTransactionAmount: 0,
    PaidAmount: "",
    RemainingAmount: "",
    TransactionDate: "",
    PaymentType: "",
    CashPaymentAmount: "",
    CardNumber: "",
    CardHolderName: "",
    CardExpiryDate: "",
    UPIID: "",
    SellerID: "",
    BuyerID: "",
    BuyerName: "",
    TransactionType: "",
    TransactionDetail: "",
    PropertyID: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    const jwt = getJWTFromSession();
    if (jwt) {
      const decodedUser = JSON.parse(decodeJwt(jwt));
      setUser(decodedUser);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        BuyerID: user.UserId,
        BuyerName: user.UserName
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  useEffect(() => {
    async function fetchUserDropdownData() {
      try {
        const userResponse = await axios.get("/api/Appointment/GetUserDropDown");
        setUsers(userResponse.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    fetchUserDropdownData();
  }, []);

  useEffect(() => {
    if (formData.SellerID) {
      fetchPropertiesBySellerID(formData.SellerID);
    } else {
      setProperties([]);
    }
  }, [formData.SellerID]);

  const fetchPropertiesBySellerID = async (sellerID) => {
    try {
      const propertyResponse = await axios.get(`/api/Transaction/GetTransactionPropertyDropDown/${sellerID}`);
      setProperties(propertyResponse.data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  useEffect(() => {
    if (formData.PropertyID === "") {
      setSelectedProperty(null);
      setFormData((prevData) => ({
        ...prevData,
        TotalTransactionAmount: "",
        RemainingAmount: "",
        PaidAmount: "",
      }));
    } else {
      const property = properties.find(
        (property) => property.propertyID === parseInt(formData.PropertyID)
      );
      if (property) {
        setSelectedProperty(property);
        setFormData((prevData) => ({
          ...prevData,
          TotalTransactionAmount: property.propertyPrice,
          RemainingAmount: property.propertyPrice,
        }));
      }
    }
  }, [formData.PropertyID, properties]);

  useEffect(() => {
    if (selectedProperty && selectedProperty.propertyPrice) {
      setFormData((prevData) => ({
        ...prevData,
        RemainingAmount: selectedProperty.propertyPrice - prevData.PaidAmount,
      }));
    }
  }, [formData.PaidAmount, selectedProperty]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      TransactionID: formData.TransactionID || null,
      TotalTransactionAmount: parseFloat(formData.TotalTransactionAmount) || 0,
      PaidAmount: parseFloat(formData.PaidAmount) || 0,
      RemainingAmount: parseFloat(formData.RemainingAmount) || 0,
      TransactionDate: formData.TransactionDate ? new Date(formData.TransactionDate).toISOString() : new Date().toISOString(),
      PaymentType: formData.PaymentType,
      CashPaymentAmount: formData.PaymentType === 'Cash' ? parseFloat(formData.CashPaymentAmount) || 0 : 0,
      CardNumber: (formData.PaymentType === 'CreditCard' || formData.PaymentType === 'DebitCard') ? formData.CardNumber : "",
      CardHolderName: (formData.PaymentType === 'CreditCard' || formData.PaymentType === 'DebitCard') ? formData.CardHolderName : "",
      CardExpiryDate: (formData.PaymentType === 'CreditCard' || formData.PaymentType === 'DebitCard') ? formData.CardExpiryDate : "",
      UPIID: formData.PaymentType === 'UPI' ? formData.UPIID : "",
      SellerID: formData.SellerID ? parseInt(formData.SellerID) : 0,
      BuyerID: formData.BuyerID ? parseInt(formData.BuyerID) : 0,
      TransactionType: formData.TransactionType,
      TransactionDetail: formData.TransactionDetail,
      PropertyID: formData.PropertyID ? parseInt(formData.PropertyID) : 0,
      PaymentStatus : "Completed",
      Status : "Completed"
    };

    console.log("Submitting payload:", payload);

    try {
      const response = await axios.post("http://localhost:3000/api/Transaction/InsertTransaction", payload);
      console.log(response.data);
      
      if (response.status === 200) {
        Swal.fire({
          title: "Transaction added successfully!",
          icon: "success",
        });
        if (formData.TransactionType === "Installment") {
          const transactionId = response.data.transactionId;
          navigate(`/transaction/installment/${transactionId}`);
        } else {
          setFormData({
            TransactionID: null,
            TotalTransactionAmount: "",
            PaidAmount: "",
            RemainingAmount: "",
            TransactionDate: "",
            PaymentType: "",
            CashPaymentAmount: "",
            CardNumber: "",
            CardHolderName: "",
            CardExpiryDate: "",
            UPIID: "",
            SellerID: "",
            BuyerID: user.UserId,
            BuyerName: user.UserName,
            TransactionType: "",
            TransactionDetail: "",
            PropertyID: ""
          });
          setErrors({});
        }
      }
    } catch (error) {
      console.error("Error submitting transaction:", error);

      if (error.response && error.response.data.errors) {
        const serverErrors = error.response.data.errors;
        const validationErrors = {};

        if (Array.isArray(serverErrors)) {
          serverErrors.forEach((err) => {
            validationErrors[err.Field] = err.Error;
          });
        } else {
          for (const [field, errorMessage] of Object.entries(serverErrors)) {
            validationErrors[field] = errorMessage;
          }
        }

        setErrors(validationErrors);
      } else {
        Swal.fire("An error occurred. Please check your input and try again.", "", "error");
      }
    }
  };

  return (
    <div className="card shadow card-body">
      <h4 className="card-title text-center bg-dark text-white py-3 rounded">
        Transaction Form
      </h4>
      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label><span className="text-danger">*</span> Buyer Name</label>
          <input
            type="text"
            name="BuyerID"
            className="form-control"
            value={formData.BuyerName}
            disabled
          />
          {errors.BuyerID && (
            <span className="text-danger">{errors.BuyerID}</span>
          )}
        </div>
        <div className="form-group">
          <label><span className="text-danger">*</span> Seller Name</label>
          <select
            name="SellerID"
            className="form-control"
            value={formData.SellerID}
            onChange={handleChange}
          >
            <option value="">Select Seller</option>
            {users.map((user) => (
              <option key={user.userID} value={user.userID}>
                {user.fullName}
              </option>
            ))}
          </select>
          {errors.SellerID && (
            <span className="text-danger">{errors.SellerID}</span>
          )}
        </div>
        <div className="form-group">
          <label><span className="text-danger">*</span> Property ID</label>
          <select
            name="PropertyID"
            className="form-control"
            value={formData.PropertyID}
            onChange={handleChange}
          >
            <option value="">Select Property</option>
            {properties.map((property) => (
              <option key={property.propertyID} value={property.propertyID}>
                {property.propertyTitle}
              </option>
            ))}
          </select>
          {errors.PropertyID && (
            <span className="text-danger">{errors.PropertyID}</span>
          )}
        </div>
        <div className="form-group">
          <label><span className="text-danger">*</span> Total Transaction Amount</label>
          <input
            type="number"
            name="TotalTransactionAmount"
            className="form-control"
            value={formData.TotalTransactionAmount}
            onChange={handleChange}
          />
          {errors.TotalTransactionAmount && (
            <span className="text-danger">{errors.TotalTransactionAmount}</span>
          )}
        </div>

        <div className="form-group">
          <label><span className="text-danger">*</span> Paid Amount</label>
          <input
            type="number"
            name="PaidAmount"
            className="form-control"
            value={formData.PaidAmount}
            onChange={handleChange}
          />
          {errors.PaidAmount && (
            <span className="text-danger">{errors.PaidAmount}</span>
          )}
        </div>

        <div className="form-group">
          <label><span className="text-danger">*</span> Remaining Amount</label>
          <input
            type="number"
            name="RemainingAmount"
            className="form-control"
            value={formData.RemainingAmount}
            onChange={handleChange}
          />
          {errors.RemainingAmount && (
            <span className="text-danger">{errors.RemainingAmount}</span>
          )}
        </div>

        <div className="form-group">
          <label><span className="text-danger">*</span> Transaction Date</label>
          <input
            type="date"
            name="TransactionDate"
            className="form-control"
            value={formData.TransactionDate}
            onChange={handleChange}
          />
          {errors.TransactionDate && (
            <span className="text-danger">{errors.TransactionDate}</span>
          )}
        </div>

        <div className="form-group">
          <label><span className="text-danger">*</span> Payment Type</label>
          <select
            name="PaymentType"
            className="form-control"
            value={formData.PaymentType}
            onChange={handleChange}
          >
            <option value="">Select Payment Type</option>
            <option value="Cash">Cash</option>
            <option value="CreditCard">Credit Card</option>
            <option value="DebitCard">Debit Card</option>
            <option value="UPI">UPI</option>
          </select>
          {errors.PaymentType && (
            <span className="text-danger">{errors.PaymentType}</span>
          )}
        </div>

        {formData.PaymentType === 'Cash' && (
          <div className="form-group">
            <label><span className="text-danger">*</span> Cash Payment Amount</label>
            <input
              type="number"
              name="CashPaymentAmount"
              className="form-control"
              value={formData.CashPaymentAmount}
              onChange={handleChange}
            />
            {errors.CashPaymentAmount && (
              <span className="text-danger">{errors.CashPaymentAmount}</span>
            )}
          </div>
        )}

        {(formData.PaymentType === 'CreditCard' || formData.PaymentType === 'DebitCard') && (
          <>
            <div className="form-group">
              <label><span className="text-danger">*</span> Card Number</label>
              <input
                type="text"
                name="CardNumber"
                className="form-control"
                value={formData.CardNumber}
                onChange={handleChange}
              />
              {errors.CardNumber && (
                <span className="text-danger">{errors.CardNumber}</span>
              )}
            </div>
            <div className="form-group">
              <label><span className="text-danger">*</span> Card Holder Name</label>
              <input
                type="text"
                name="CardHolderName"
                className="form-control"
                value={formData.CardHolderName}
                onChange={handleChange}
              />
              {errors.CardHolderName && (
                <span className="text-danger">{errors.CardHolderName}</span>
              )}
            </div>
            <div className="form-group">
              <label><span className="text-danger">*</span> Card Expiry Date</label>
              <input
                type="text"
                name="CardExpiryDate"
                className="form-control"
                placeholder="MM/YY"
                value={formData.CardExpiryDate}
                onChange={handleChange}
              />
              {errors.CardExpiryDate && (
                <span className="text-danger">{errors.CardExpiryDate}</span>
              )}
            </div>
          </>
        )}

        {formData.PaymentType === 'UPI' && (
          <div className="form-group">
            <label><span className="text-danger">*</span> UPI ID</label>
            <input
              type="text"
              name="UPIID"
              className="form-control"
              value={formData.UPIID}
              onChange={handleChange}
            />
            {errors.UPIID && (
              <span className="text-danger">{errors.UPIID}</span>
            )}
          </div>
        )}

        <div className="form-group">
          <label><span className="text-danger">*</span> Transaction Type</label>
          <select
            name="TransactionType"
            className="form-control"
            value={formData.TransactionType}
            onChange={handleChange}
          >
            <option value="">Select Transaction Type</option>
            <option value="Sale">Sale</option>
            <option value="Installment">Installment</option>
          </select>
          {errors.TransactionType && (
            <span className="text-danger">{errors.TransactionType}</span>
          )}
        </div>

        <div className="form-group">
          <label>Transaction Detail</label>
          <textarea
            name="TransactionDetail"
            className="form-control"
            value={formData.TransactionDetail}
            onChange={handleChange}
          ></textarea>
          {errors.TransactionDetail && (
            <span className="text-danger">{errors.TransactionDetail}</span>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-100 mt-3">
          Submit Transaction
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;
