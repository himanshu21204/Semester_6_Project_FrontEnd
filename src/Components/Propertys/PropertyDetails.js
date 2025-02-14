import swal from "sweetalert";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { decodeJwt, getJWTFromSession } from "../Login/GetAuth";
import Swal from "sweetalert2";
import { FaStar, FaEdit, FaTrash, FaEllipsisV } from "react-icons/fa";
// import { MdCircle } from "react-icons/md";

const PropertyDetail = () => {
    const params = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loginUser, setLoginUser] = useState({});
    const [isLogin, setIsLogin] = useState(false);
    const [brokerID, setBrokerId] = useState("");
    const [reviews, setReviews] = useState([]);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [visibleReviews, setVisibleReviews] = useState([]);
    const [showAll, setShowAll] = useState(false);

    // Installment Calculator
    const [propertyPrice, setPropertyPrice] = useState("");
    const [downPayment, setDownPayment] = useState("");
    const [duration, setDuration] = useState("");
    const [interestRate, setInterestRate] = useState("");
    const [installment, setInstallment] = useState(null);
    const [errorCal,setErrorCal] = useState();
    const calculateInstallment = () => {
        if (!propertyPrice || !downPayment || !duration || !interestRate) {
            setErrorCal("Please fill in all fields.");
            return;
        }else{
            setErrorCal(null)
        }

        const principal = propertyPrice - downPayment;
        const monthlyInterest = interestRate / 100 / 12;
        const totalMonths = duration * 12;

        const emi =
            (principal * monthlyInterest * Math.pow(1 + monthlyInterest, totalMonths)) /
            (Math.pow(1 + monthlyInterest, totalMonths) - 1);

        setInstallment(emi.toFixed(2));
    };

    useEffect(() => {
        const jwt = getJWTFromSession();
        if (jwt) {
            const decodedUser = JSON.parse(decodeJwt(jwt));
            setLoginUser(decodedUser);
        }
        console.log(loginUser)
        console.log(data)
    }, [isLoading]);
    useEffect(() => {
        fetchData();
        // setIsLogin(localStorage.getItem("isLogin"));
        // setBrokerId(localStorage.getItem("userId"));
        fetchReviews();
    }, []);


    const fetchData = async () => {
        try {
            const response = await axios.get(`/api/Property/GetPropertyByID/${params.propertyID}`);
            setData(response.data);
        } catch (error) {
            console.error("Failed to fetch property details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => navigate(`/admin/property-update/${params.propertyID}`);
    const handleDelete = async () => {
        // Display SweetAlert confirmation dialog
        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this property!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                try {
                    // Proceed with the delete request if confirmed
                    await axios.delete(`/api/Property/DeleteProperty/${params.propertyID}`);
                    swal("Poof! The property has been deleted!", {
                        icon: "success",
                    });

                    // After successful deletion, navigate to the property list
                    navigate("/property");
                } catch (error) {
                    swal("Oops! Something went wrong. The property could not be deleted.", {
                        icon: "error",
                    });
                    console.error("Failed to delete property:", error);
                }
            } else {
                // If the user cancels the deletion
                swal("Your property is safe!");
            }
        });
    };

    const contactAgent = () => {
        Swal.fire({
            title: "Contacting the agent...",
            icon: "success",
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            navigate('/appointmentForm', { state: { propertyData: data, user: loginUser } });
        });
    };

    const fetchReviews = async () => {
        try {
            const result = await axios.get(`/api/Review/GetPropertyReviewByPropertyID/${params.propertyID}`);
            if (result.data) setReviews(result.data);
        } catch (err) {
            console.error("Error fetching reviews:", err);
        }
    };
    useEffect(() => {
        const sortedReviews = [...reviews].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        setVisibleReviews(sortedReviews.slice(0, 4));
    }, [reviews]);

    const toggleShowAll = () => {
        if (showAll) {
            setVisibleReviews(reviews.slice(0, 4));
        } else {
            setVisibleReviews(reviews);
        }
        setShowAll(!showAll);
    };
    const handleReview = (existingReview = null, propertyId = null) => {
        Swal.fire({
            title: existingReview ? "Edit Your Review" : "Write a Review",
            width: "800px",
            customClass: {
                popup: "custom-swal",
                confirmButton: "swal-confirm-btn",
                cancelButton: "swal-cancel-btn",
            },
            html: `
            <table style="width: 100%; border-collapse: collapse;">
                <!-- Rating Row -->
                <tr>
                    <td style="font-weight: bold; padding: 10px;">Rating:</td>
                    <td>
                        <div id="star-rating-container" class="swal-stars-container" style="display: flex; gap: 5px;">
                            ${[1, 2, 3, 4, 5]
                    .map(
                        (num) =>
                            `<span class="swal-star" data-value="${num}" style="font-size: 35px; cursor: pointer; color: ${existingReview && num <= existingReview.rating
                                ? "#ffd700"
                                : "#e0e0e0"
                            };">★</span>`
                    )
                    .join("")}
                        </div>
                    </td>
                </tr>

                <!-- Comment Row -->
                <tr>
                    <td style="font-weight: bold; padding: 10px;">Comment:</td>
                    <td>
                        <input id="reviewText" class="swal2-input" placeholder="Write your comment..." value="${existingReview ? existingReview.reviewText : ""}" style="width: 90%;">
                    </td>
                </tr>

                <!-- Keywords Row -->
                <tr>
                    <td style="font-weight: bold; padding: 10px;">Keywords:</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <input id="keywords-input" class="swal2-input" placeholder="Enter a keyword" style="flex: 1;">
                            <button id="add-keyword-btn" class="swal2-confirm swal2-styled" style="background-color: #4a90e2;">Add</button>
                        </div>
                        <div id="keywords-container" class="swal-keywords-container" style="margin-top: 10px;">
                            ${existingReview && existingReview.keywords
                    ? existingReview.keywords.split(",").map(kw => `<span class="keyword-tag" style="background-color: #f1f1f1; padding: 5px 10px; border-radius: 15px; margin: 3px; display: inline-block;">
                                    ${kw.trim()} <span class="remove-keyword" style="cursor:pointer; color:red; font-weight:bold; margin-left: 5px;">✖</span></span>`).join(" ")
                    : ""}
                        </div>
                    </td>
                </tr>
            </table>
        `,
            showCancelButton: true,
            confirmButtonText: existingReview ? "Update" : "Submit",
            confirmButtonColor: "#4a90e2",
            cancelButtonColor: "#ff5a5f",
            focusConfirm: false,
            didOpen: () => {
                const stars = document.querySelectorAll(".swal-star");
                let selectedRating = existingReview ? existingReview.rating : 0;
                const hiddenInput = document.createElement("input");
                hiddenInput.type = "hidden";
                hiddenInput.id = "selected-rating";
                hiddenInput.value = selectedRating;
                Swal.getHtmlContainer().appendChild(hiddenInput);

                const updateStars = (rating) => {
                    stars.forEach((star, index) => {
                        star.style.color = index < rating ? "#ffd700" : "#e0e0e0";
                    });
                    hiddenInput.value = rating;
                    selectedRating = rating;
                };

                stars.forEach((star) => {
                    star.addEventListener("click", function () {
                        updateStars(parseInt(this.getAttribute("data-value")));
                    });
                });

                // Keyword handling
                const keywordsInput = document.getElementById("keywords-input");
                const addKeywordBtn = document.getElementById("add-keyword-btn");
                const keywordsContainer = document.getElementById("keywords-container");

                addKeywordBtn.addEventListener("click", () => {
                    const keyword = keywordsInput.value.trim();
                    if (keyword) {
                        const keywordTag = document.createElement("span");
                        keywordTag.className = "keyword-tag";
                        keywordTag.style.cssText = "background-color: #f1f1f1; padding: 5px 10px; border-radius: 15px; margin: 3px; display: inline-block;";
                        keywordTag.innerHTML = `${keyword} <span class="remove-keyword" style="cursor:pointer; color:red; font-weight:bold; margin-left: 5px;">✖</span>`;

                        keywordsContainer.appendChild(keywordTag);
                        keywordsInput.value = "";

                        keywordTag.querySelector(".remove-keyword").addEventListener("click", () => {
                            keywordTag.remove();
                        });
                    }
                });
            },
            preConfirm: () => {
                const reviewText = document.getElementById("reviewText").value.trim();
                const selectedRating = parseInt(document.getElementById("selected-rating").value);
                const keywords = Array.from(document.querySelectorAll(".keyword-tag"))
                    .map(tag => tag.textContent.replace("✖", "").trim())
                    .join(",");

                if (selectedRating === 0) {
                    Swal.showValidationMessage("Please select a rating.");
                    return null;
                }
                if (reviewText === "") {
                    Swal.showValidationMessage("Comment cannot be empty.");
                    return null;
                }

                return { rating: selectedRating, reviewText, keywords };
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const newReview = {
                    reviewID: existingReview ? existingReview.reviewID : 0,
                    UserID: loginUser.UserId,
                    propertyID: params.propertyID,
                    Rating: result.value.rating,
                    ReviewText: result.value.reviewText,
                    Keywords: result.value.keywords,
                    SubmittedAt: new Date().toISOString(),
                };

                console.log(existingReview);
                console.log(newReview);

                const request = existingReview
                    ? axios.put(`/api/Review/UpdatePropertyReview`, newReview)
                    : axios.post(`/api/Review/AddPropertyReview`, newReview);

                request
                    .then(() => {
                        Swal.fire({
                            icon: "success",
                            title: existingReview ? "Updated!" : "Posted!",
                            text: `Review ${existingReview ? "updated" : "added"} successfully`,
                            customClass: {
                                popup: "custom-swal-success",
                                confirmButton: "swal-success-btn",
                            },
                        });
                        fetchReviews();
                    })
                    .catch((error) => console.error("Error:", error));
            }
        });
    };

    const handleDeleteReview = (reviewID) => {
        Swal.fire({
            title: "Confirm Delete",
            text: "This action cannot be undone!",
            icon: "warning",
            customClass: {
                popup: "custom-swal-warning",
                confirmButton: "swal-confirm-danger",
                cancelButton: "swal-cancel-btn",
            },
            showCancelButton: true,
            confirmButtonColor: "#ff5a5f",
            cancelButtonColor: "#4a90e2",
            confirmButtonText: "Delete Forever",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .delete(`/api/Review/DeletePropertyReview/${reviewID}`)
                    .then(() => {
                        Swal.fire({
                            title: "Deleted!",
                            text: "Review has been removed",
                            icon: "success",
                            customClass: {
                                popup: "custom-swal-success",
                                confirmButton: "swal-success-btn",
                            },
                        });
                        fetchReviews();
                    })
                    .catch((error) => console.error("Error:", error));
            }
        });
    };


    const handleMenuToggle = (reviewID, event) => {
        event.stopPropagation();
        setOpenMenuId(openMenuId === reviewID ? null : reviewID);
    };

    if (isLoading) return <div>Loading property details...</div>;
    if (!data) return <div>Property details not found.</div>;

    return (
        <div className="main m-3">
            <div>
                <div className="card card-body">
                    <div className="row fw-bold" style={{ fontSize: "25px" }}>
                        <div className="d-flex justify-content-between">
                            <div>{data.propertyTitle}</div>
                            <div>
                                {(loginUser.UserRole == 'Agent' || loginUser.UserRole == 'Seller' || loginUser.UserRole == 'Admin') && (loginUser.UserId == data.userID) ? (
                                    <>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleEdit}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger ms-2"
                                            onClick={handleDelete}
                                        >
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    (<button className="col btn btn-primary" onClick={contactAgent}>
                                        Contact Agent
                                    </button>)
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-2 me-3"><i class="bi bi-geo-alt-fill"></i> {data.propertyAddress}</div>
                        <div className="col-1 text-danger">
                            {/* <MdCircle />  */}
                            <span className="badge bg-secondary">For {data.transactionType}</span>
                        </div>
                        <div className="col text-end" style={{ fontSize: "25px" }}>
                            {data.propertyType === "Rent" ? (
                                `$${data.propertyPrice}/mo`
                            ) : (
                                `$${data.propertyPrice}`
                            )}
                        </div>
                    </div>
                    <div className="row align-items-center mt-2">
                        <div className="col-auto d-flex align-items-center">
                            <i className="bi bi-house-door-fill me-2"></i>
                            <span>{data.bedroomCount} bed</span>
                        </div>
                        <div className="col-auto d-flex align-items-center">
                            <i className="bi bi-droplet-fill me-2"></i>
                            <span>{data.bathroomCount} bath</span>
                        </div>
                        <div className="col-auto d-flex align-items-center">
                            <i className="bi bi-fullscreen me-2"></i>
                            <span>{data.propertySize} sqft</span>
                        </div>
                        <div className="col text-end">
                            <span>
                                $
                                {data.propertyPrice && data.propertySize
                                    ? `${(
                                        parseInt(data.propertyPrice.toString().replace(/,/g, "")) /
                                        parseInt(data.propertySize)
                                    ).toFixed(2)} /sq ft`
                                    : "N/A"}
                            </span>
                        </div>
                    </div>
                </div>
                {data.images && data.images.length > 0 ? (
                    <div
                        id="carouselExampleInterval"
                        className="carousel slide mt-3"
                        data-bs-ride="carousel"
                    >
                        <div className="carousel-inner">
                            {data.images.map((img, index) => (
                                <div
                                    key={img.imageID}
                                    className={`carousel-item ${index === 0 ? "active" : ""}`}
                                    data-bs-interval="3000"
                                >
                                    <img
                                        src={img.imageURL}
                                        style={{ height: "70vh", objectFit: "cover", borderRadius: "15px" }}
                                        className="d-block w-100"
                                        alt={`Property Image ${index + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            className="carousel-control-prev"
                            type="button"
                            data-bs-target="#carouselExampleInterval"
                            data-bs-slide="prev"
                        >
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button
                            className="carousel-control-next"
                            type="button"
                            data-bs-target="#carouselExampleInterval"
                            data-bs-slide="next"
                        >
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                    </div>
                ) : (
                    <div
                        id="carouselExampleInterval"
                        className="carousel slide mt-3"
                        data-bs-ride="carousel"
                    >
                        <div className="carousel-inner">
                            <div className="carousel-item active">
                                <img
                                    src="https://i.ibb.co/rHN5ZY6/images-q-tbn-ANd9-Gc-Qs-Ah-Tu0y-Kq27-NDXYTd-Jbc9ofxy-F8-WURal9-GA-s.jpg"
                                    style={{ height: "70vh", objectFit: "fit", borderRadius: "15px" }}
                                    className="d-block w-100"
                                    alt="Default Property"
                                />
                            </div>
                        </div>
                    </div>
                )}


                <div
                    className="row"
                    style={{
                        backgroundColor: "#fff",
                        display: "block",
                        marginTop: "22px",
                        borderRadius: "15px",
                        padding: "15px",
                    }}
                >
                    <h5>Overview</h5>
                    <div className="row pt-2 fw-bold">
                        <div className="col-2">Bedrooms</div>
                        <div className="col-2">Bathrooms</div>
                        <div className="col-2">Year Built</div>
                        <div className="col-2">Parking Spaces</div>
                        <div className="col-2">Property Size</div>
                        <div className="col-2">Property Type</div>
                    </div>
                    <div className="row">
                        <div className="col-2">{data.bedroomCount}</div>
                        <div className="col-2">{data.bathroomCount}</div>
                        <div className="col-2">{new Date(data.buildYear).toDateString().substring(4)}</div>
                        <div className="col-2">{data.parkingSpaces}</div>
                        <div className="col-2">{data.propertySize} sqft</div>
                        <div className="col-2">{data.propertyType}</div>
                    </div>
                </div>
                <div
                    className="row"
                    style={{
                        backgroundColor: "#fff",
                        display: "block",
                        marginTop: "22px",
                        borderRadius: "15px",
                        padding: "15px",
                    }}
                >
                    <h5>Property Description</h5>
                    <p>{data.propertyDescription}</p>
                </div>
                <div
                    className="row"
                    style={{
                        backgroundColor: "#fff",
                        display: "block",
                        marginTop: "22px",
                        borderRadius: "15px",
                        padding: "15px",
                    }}
                >
                    <h5>Address</h5>
                    <p>{data.propertyAddress}</p>
                    {/* <div className="row">
                        <div className="col-3 fw-bold">State:</div>
                        <div className="col-3">{data.homeCountry_State}</div>
                        <div className="col-3 fw-bold">City:</div>
                        <div className="col-3">{data.homeCity}</div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-3 fw-bold">Country:</div>
                        <div className="col-3">{data.homeCountry}</div>
                        <div className="col-3 fw-bold">Zip Code:</div>
                        <div className="col-3">{data.homeZip}</div>
                    </div> */}
                </div>
                <div
                    className="row"
                    style={{
                        backgroundColor: "#fff",
                        display: "block",
                        marginTop: "22px",
                        borderRadius: "15px",
                        padding: "15px",
                    }}
                >
                    <h5>Additional Features</h5>
                    {data.additionalFeatures ? (
                        <div className="container">
                            <div className="row">
                                {data.additionalFeatures.split(";").map((feature, index) => (
                                    <div
                                        key={index}
                                        className="col-12 col-md-3"
                                        style={{
                                            marginBottom: "10px",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "18px",
                                                marginRight: "10px",
                                                color: "#000",
                                            }}
                                        >
                                            <i class="fas fa-check-circle" style={{ color: 'green' }}></i>
                                        </span>
                                        <span style={{ fontSize: "16px" }}>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p>No additional features listed.</p>
                    )}
                </div>
                <div style={{margin:"0"}} className="row">
                    <div
                        className="col-8"
                        style={{
                            backgroundColor: "#fff",
                            display: "block",
                            marginTop: "22px",
                            borderRadius: "15px",
                            padding: "15px",
                        }}
                    >
                        <div className="d-flex justify-content-between">
                            <h4>Reviews</h4>
                            <button className="add-review-btn btn btn-primary mb-1" onClick={() => handleReview()}>
                                Share Your Thoughts
                            </button>
                        </div>
                        <div>
                            {reviews.length > 0 ? (
                                <div>
                                    <div>
                                        {visibleReviews.map((review) => (
                                            <div key={review.reviewID} className="review-card p-3 border rounded my-1">
                                                <div className="card-header d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>{review.userName}</strong>
                                                    </div>
                                                    <div className="rating-stars">
                                                        {Array(review.rating)
                                                            .fill()
                                                            .map((_, i) => (
                                                                <FaStar key={i} className="star-icon text-warning" />
                                                            ))}
                                                    </div>
                                                    {review.customerId === data.userId && (
                                                        <div className="card-menu position-relative">
                                                            <button className="btn btn-light" onClick={(e) => handleMenuToggle(review.reviewID, e)}>
                                                                <FaEllipsisV />
                                                            </button>
                                                            {openMenuId === review.reviewID && (
                                                                <div className="dropdown-menu show position-absolute" style={{ marginLeft: "-105px" }}>
                                                                    <button className="dropdown-item" onClick={() => handleReview(review)}>
                                                                        <FaEdit className="me-2" /> Edit
                                                                    </button>
                                                                    <button className="dropdown-item text-danger" onClick={() => handleDeleteReview(review.reviewID)}>
                                                                        <FaTrash className="me-2" /> Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="review-content mt-2">"{review.reviewText}"</p>
                                                {review.keywords && (
                                                    <div className="mt-2">
                                                        {review.keywords.split(",").map((keyword, index) => (
                                                            <span key={index} className="badge bg-secondary me-1">
                                                                {keyword}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Toggle Button */}
                                    {reviews.length > 4 && (
                                        <div className="text-center mt-3">
                                            <button className="btn btn-outline-primary" onClick={toggleShowAll}>
                                                {showAll ? "Show Less" : "See All Reviews"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p className="text-muted">No reviews yet. Be the first to share your experience!</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="col-4">
                        <div style={{
                            backgroundColor: "#fff",
                            display: "block",
                            marginTop: "22px",
                            borderRadius: "15px",
                            padding: "15px"
                        }} className="d-flex justify-content-between flex-column gap-3">
                            <h2>Installment Calculator</h2>
                            <div className="input-group">
                                <input
                                    className="form-control"
                                    type="number"
                                    placeholder="Property Price"
                                    value={propertyPrice}
                                    onChange={(e) => setPropertyPrice(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    className="form-control"
                                    type="number"
                                    placeholder="Down Payment"
                                    value={downPayment}
                                    onChange={(e) => setDownPayment(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    className="form-control"
                                    type="number"
                                    placeholder="Duration (Years)"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    className="form-control"
                                    type="number"
                                    placeholder="Interest Rate (%)"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(e.target.value)}
                                />
                            </div>
                            {errorCal && <span className="text-danger">{errorCal}</span>}
                            <button onClick={calculateInstallment} className="btn btn-primary">
                                Calculate Installment
                            </button>
                            {installment && <h3>Monthly Installment: ₹{installment}</h3>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetail;
