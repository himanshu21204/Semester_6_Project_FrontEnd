import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { decodeJwt, getJWTFromSession } from '../Login/GetAuth';
import { Link } from 'react-router-dom';
import { DataTable } from 'simple-datatables';

const TransactionList = () => {
    const [transactionData, setTransactionData] = useState([]);
    const [user, setUser] = useState({});
    const tableRef = useRef(null);

    // Fetch user info from JWT
    useEffect(() => {
        const jwt = getJWTFromSession();
        if (jwt) {
            const decodedUser = JSON.parse(decodeJwt(jwt));
            setUser(decodedUser);
        }
    }, []);

    // Fetch transactions based on user info
    useEffect(() => {
        if (user && user.UserId) {
            axios.get(`/api/Transaction/GetAllTransactions`)
                .then(response => {
                    setTransactionData(response.data);
                })
                .catch(error => {
                    if (!(error.status === '400')) {
                        Swal.fire({
                            title: "Failed to fetch transaction data.",
                            icon: "error",
                            button: "Ok",
                        });
                    }
                });
        }
    }, [user]);

    // Initialize DataTable after transaction data is loaded
    useEffect(() => {
        if (transactionData.length > 0 && tableRef.current) {
            new DataTable(tableRef.current);
        }
    }, [transactionData]);

    const onView = (transaction) => {
        Swal.fire({
            width:"75%",
            title: `Transaction Details`,
            html: `
                <div style="display: flex; flex-wrap: wrap;">
                    <!-- Row 1 -->
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Transaction ID</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.transactionID || 'N/A'}</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Total Transaction Amount</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">$${transaction.totalTransactionAmount}</div>
    
                    <!-- Row 2 -->
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Paid Amount</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">$${transaction.paidAmount}</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Remaining Amount</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">$${transaction.remainingAmount}</div>
    
                    <!-- Row 3 -->
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Payment Type</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.paymentType || 'N/A'}</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Payment Status</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.paymentStatus || 'N/A'}</div>
    
                    <!-- Row 4 -->
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Payment Reference Number</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.paymentReferenceNumber || 'N/A'}</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Cash Payment Amount</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">$${transaction.cashPaymentAmount || '0'}</div>
    
                    <!-- Row 5 -->
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Card Number</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.cardNumber || 'N/A'}</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Card Holder Name</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.cardHolderName || 'N/A'}</div>
    
                    <!-- Row 6 -->
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Card Expiry Date</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.cardExpiryDate || 'N/A'}</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">UPI ID</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.upiID || 'N/A'}</div>
    
                    <!-- Row 7 -->
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Seller ID</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.sellerID}</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Seller Name</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.sellerName || 'N/A'}</div>
    
                    <!-- Row 8 -->
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Buyer ID</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.buyerID}</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Buyer Name</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.buyerName || 'N/A'}</div>
    
                    <!-- Row 9 -->
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Status</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.status || 'Pending'}</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Transaction Type</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.transactionType || 'N/A'}</div>
    
                    <!-- Row 10 -->
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Transaction Detail</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.transactionDetail || 'N/A'}</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Last Transaction Date</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.lastTransactionDate ? new Date(transaction.lastTransactionDate).toLocaleString('en-GB') : 'N/A'}</div>
    
                    <!-- Row 11 -->
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Property ID</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.propertyID}</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Property Title</div>
                    <div style="width: 25%; padding: 8px; border: 1px solid #ddd;">${transaction.propertyTitle || 'N/A'}</div>
                </div>
            `,
            icon: "info",
            confirmButtonText: "Close",
        });
    };    

    return (
        <div>
            <div>
                <div className="row justify-content-center align-items-center h-100">
                    <div className="card shadow">
                        <div className="card-body">
                            <h4
                                className="card-title text-center"
                                style={{
                                    borderRadius: "0.5rem",
                                    backgroundImage: "linear-gradient(195deg, #42424a 0%, #191919 100%)",
                                    boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(64, 64, 64, 0.4)",
                                    color: "#fff",
                                    padding: "1rem",
                                }}
                            >
                                Transaction List
                            </h4>
                            <div>
                                <table ref={tableRef} className="table table-bordered mt-4">
                                    <thead>
                                        <tr className='text-center'>
                                            <th>#</th>
                                            <th>Sender Name</th>
                                            <th>Receiver Name</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactionData.map((transaction, index) => (
                                            <tr key={transaction.transactionID} className='text-center'>
                                                <td>{index + 1}</td>
                                                <td>{transaction.sellerName || 'N/A'}</td>
                                                <td>{transaction.buyerName || 'N/A'}</td>
                                                <td>${transaction.totalTransactionAmount}</td>
                                                <td>{new Date(transaction.transactionDate).toLocaleString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                    second: 'numeric',
                                                })}</td>
                                                <td>{transaction.paymentStatus}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-info btn-sm"
                                                        onClick={() => onView(transaction)}
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionList;
