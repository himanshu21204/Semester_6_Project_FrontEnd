import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";

function InstallmentForm() {
    const { transactionId } = useParams();
  const [formData, setFormData] = useState({
    InstallmentID: null,
    TransactionID: transactionId,
    InstallmentAmount: "",
    InstallmentDate: "",
    PaidAmount: 0,
    PaymentStatus: "Pending",
    PaymentReferenceNumber: "",
    CashPaymentAmount: "",
    CardNumber: "",
    CardHolderName: "",
    CardExpiryDate: "",
    UPIID: "",
    PaymentType: ""
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.InstallmentAmount) newErrors.InstallmentAmount = "Installment Amount is required.";
    if (!formData.InstallmentDate) newErrors.InstallmentDate = "Installment Date is required.";
    if (!formData.PaymentReferenceNumber) newErrors.PaymentReferenceNumber = "Payment Reference Number is required.";
    if (formData.PaymentType === "Cash" && !formData.CashPaymentAmount) {
      newErrors.CashPaymentAmount = "Cash Payment Amount is required for Cash transaction.";
    }
    if ((formData.PaymentType === "CreditCard" || formData.PaymentType === "DebitCard") && !formData.CardNumber) {
      newErrors.CardNumber = "Card Number is required for Credit/Debit Card transaction.";
    }
    if (formData.PaymentType === "UPI" && !formData.UPIID) {
      newErrors.UPIID = "UPI ID is required for UPI transaction.";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      installmentID: formData.InstallmentID || 0,
      transactionID: formData.TransactionID || 0,
      installmentAmount: formData.InstallmentAmount || 0,
      installmentDate: formData.InstallmentDate || new Date().toISOString(),
      paidAmount: formData.PaidAmount || 0,
      paymentStatus: formData.PaymentStatus || "Pending",
      paymentReferenceNumber: formData.PaymentReferenceNumber || "",
      paymentType: formData.PaymentType || "",
      cashPaymentAmount: formData.CashPaymentAmount || 0,
      cardNumber: formData.CardNumber || "",
      cardHolderName: formData.CardHolderName || "",
      cardExpiryDate: formData.CardExpiryDate || "",
      upiid: formData.UPIID || ""
    };

    console.log(payload);

    try {
      const response = await axios.post("http://localhost:3000/api/Installment/InsertInstallment", payload);
      if (response.status === 200) {
        Swal.fire("Installment added successfully!", "", "success");
        setFormData({
          InstallmentID: null,
          TransactionID: transactionId,
          InstallmentAmount: "",
          InstallmentDate: "",
          PaidAmount: 0,
          PaymentStatus: "Pending",
          PaymentReferenceNumber: "",
          CashPaymentAmount: "",
          CardNumber: "",
          CardHolderName: "",
          CardExpiryDate: "",
          UPIID: "",
          PaymentType: ""
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Error submitting installment:", error);
      Swal.fire("An error occurred. Please try again.", "", "error");
    }
  };

  return (
    <div className="card shadow card-body">
      <h4 className="card-title text-center bg-dark text-white py-3 rounded">Installment Form</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Installment Amount</label>
          <input
            type="number"
            name="InstallmentAmount"
            className="form-control"
            placeholder="Enter Installment Amount"
            value={formData.InstallmentAmount}
            onChange={handleChange}
          />
          {errors.InstallmentAmount && <small className="text-danger">{errors.InstallmentAmount}</small>}
        </div>

        <div className="form-group">
          <label>Installment Date</label>
          <input
            type="date"
            name="InstallmentDate"
            className="form-control"
            value={formData.InstallmentDate}
            onChange={handleChange}
          />
          {errors.InstallmentDate && <small className="text-danger">{errors.InstallmentDate}</small>}
        </div>

        <div className="form-group">
          <label>Payment Reference Number</label>
          <input
            type="text"
            name="PaymentReferenceNumber"
            className="form-control"
            placeholder="Enter Payment Reference Number"
            value={formData.PaymentReferenceNumber}
            onChange={handleChange}
          />
          {errors.PaymentReferenceNumber && <small className="text-danger">{errors.PaymentReferenceNumber}</small>}
        </div>

        <div className="form-group">
          <label>Payment Type</label>
          <select
            name="PaymentType"
            className="form-control"
            value={formData.PaymentType}
            onChange={handleChange}
          >
            <option value="" disabled>Select Payment Type</option>
            <option value="Cash">Cash</option>
            <option value="CreditCard">Credit Card</option>
            <option value="DebitCard">Debit Card</option>
            <option value="UPI">UPI</option>
          </select>
        </div>

        {formData.PaymentType === "Cash" && (
          <div className="form-group">
            <label>Cash Payment Amount</label>
            <input
              type="number"
              name="CashPaymentAmount"
              className="form-control"
              placeholder="Enter Cash Payment Amount"
              value={formData.CashPaymentAmount}
              onChange={handleChange}
            />
            {errors.CashPaymentAmount && <small className="text-danger">{errors.CashPaymentAmount}</small>}
          </div>
        )}

        {(formData.PaymentType === "CreditCard" || formData.PaymentType === "DebitCard") && (
          <>
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                name="CardNumber"
                className="form-control"
                placeholder="Enter Card Number"
                value={formData.CardNumber}
                onChange={handleChange}
              />
              {errors.CardNumber && <small className="text-danger">{errors.CardNumber}</small>}
            </div>

            <div className="form-group">
              <label>Card Holder Name</label>
              <input
                type="text"
                name="CardHolderName"
                className="form-control"
                placeholder="Enter Card Holder Name"
                value={formData.CardHolderName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Card Expiry Date (MM/YY)</label>
              <input
                type="text"
                name="CardExpiryDate"
                className="form-control"
                placeholder="MM/YY"
                value={formData.CardExpiryDate}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {formData.PaymentType === "UPI" && (
          <div className="form-group">
            <label>UPI ID</label>
            <input
              type="text"
              name="UPIID"
              className="form-control"
              placeholder="Enter UPI ID"
              value={formData.UPIID}
              onChange={handleChange}
            />
            {errors.UPIID && <small className="text-danger">{errors.UPIID}</small>}
          </div>
        )}

        <button type="submit" className="btn btn-primary w-100 mt-3">
          Submit Installment
        </button>
      </form>
    </div>
  );
}

export default InstallmentForm;
