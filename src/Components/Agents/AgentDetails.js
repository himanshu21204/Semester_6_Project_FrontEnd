import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { FaStar, FaEdit, FaTrash, FaEllipsisV } from "react-icons/fa";
import { decodeJwt, getJWTFromSession } from "../Login/GetAuth";

const AgentDetail = () => {
    const params = useParams();
    const [data, setData] = useState({});
    const [user, setUser] = useState();
    const [propertyData, setPropertyData] = useState([]);
    const [resultList, setResultList] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [visibleReviews, setVisibleReviews] = useState([]);
    const [showAll, setShowAll] = useState(false);


    useEffect(() => {
        const jwt = getJWTFromSession();
        if (jwt) {
            const decodedUser = JSON.parse(decodeJwt(jwt));
            setUser(decodedUser);
        }
    }, []);
    useEffect(() => {
        fetchAgentData();
        fetchPropertyData();
        fetchReviews();
    }, []);

    const fetchAgentData = async () => {
        try {
            const result = await axios.get(`/api/User/GetUserByID/${params.userID}`);
            if (result.data) {
                setData(result.data);
            }
        } catch (err) {
            console.error("Error fetching agent data:", err);
        }
    };

    const fetchPropertyData = async () => {
        try {
            const result = await axios.get("/api/Property/GetAllProperties");
            if (result.data && result.data.length > 0) {
                setPropertyData(result.data);
            }
        } catch (err) {
            console.error("Error fetching property data:", err);
        }
    };

    const renderProperties = propertyData.filter(property => params.userID == property.userID).map((property) => {
        return (
            <div key={property.propertyID} className="my-3 col-4">
                <div
                    className="card mx-auto"
                    style={{
                        maxWidth: "100%",
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                        borderRadius: "8px",
                    }}
                ><Link
                    className="text-decoration-none text-dark fw-bold"
                    to={"/property/" + property.propertyID}
                    title={property.propertyTitle}
                >
                        {/* Property Image and Badges */}
                        <div className="position-relative overflow-hidden rounded-top">
                            {/* Rent Badge */}
                            <div className="position-absolute top-0 start-0 bg-primary text-white badge rounded-pill mt-2 ms-2 fs-6">
                                {property.transactionType}
                            </div>

                            {/* Property Image */}
                            <img
                                src={property.images[0]?.imageURL || 'https://i.ibb.co/rHN5ZY6/images-q-tbn-ANd9-Gc-Qs-Ah-Tu0y-Kq27-NDXYTd-Jbc9ofxy-F8-WURal9-GA-s.jpg'}
                                alt="Property"
                                className="img-fluid w-100"
                                style={{ height: "250px", objectFit: "cover" }}
                            />
                        </div>

                        {/* Card Body */}
                        <div className="card-body">
                            <h5 className="card-title">
                                {property.propertyTitle}
                            </h5>

                            <p className="card-text text-muted"
                                style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "inline-block",
                                    maxWidth: "95%",
                                }}
                            >
                                {property.propertyAddress}
                            </p>
                            <div className="text-primary fw-bold fs-5">${property.propertyPrice}</div>
                        </div>
                    </Link>
                    {/* Property Details */}
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                            <div className="row text-center text-muted">
                                <div className="col">
                                    <i className="bi bi-house-door-fill me-2"></i>{property.bedroomCount} Bed
                                </div>
                                <div className="col">
                                    <i className="bi bi-droplet-fill me-2"></i>{property.bathroomCount} Bath
                                </div>
                                <div className="col">
                                    <i className="bi bi-fullscreen me-2"></i>{property.propertySize} sqft
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        );
    });

    useEffect(() => {
        if (propertyData.length > 0) {
            setResultList(renderProperties);
        } else {
            setResultList([]);
        }
    }, [propertyData]);

    const fetchReviews = async () => {
        try {
            const result = await axios.get(`/api/Review/GetAgentReviewByAgentID/${params.userID}`);
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
    const handleReview = (existingReview = null, agentId = null) => {

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
                    userId: user.UserId,
                    agentId: params.userID,
                    rating: result.value.rating,
                    reviewText: result.value.reviewText,
                    keywords: result.value.keywords,
                    reviewDate: new Date().toISOString(),
                };
                console.log(existingReview);

                console.log(newReview);
                debugger
                const request = existingReview
                    ? axios.put(`/api/Review/UpdateAgentReview`, newReview)
                    : axios.post(`/api/Review/AddAgentReview`, newReview);

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
                    .delete(`/api/Review/DeleteAgentReview/${reviewID}`)
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

    return (
        <div className="card card-body main m-3">
            <div className="row gx-lg-3">
                <div className="col-xl-5 col-lg-4 col-sm-12">
                    <div className="card overflow-hidden">
                        <div className="text-center p-3 overlay-box">
                            <div className="profile-photo">
                                <img
                                    src={data.profilePhoto || "https://placehold.co/40"}
                                    width="100"
                                    className="img-fluid rounded-circle"
                                    alt="profile"
                                />
                            </div>
                            <h3 className="mt-3 mb-2 text-black">
                                {data.firstName ? `${data.firstName} ${data.lastName}` : 'John Doe'}
                            </h3>
                            <p className="text-black mb-0">{data.userRole || 'Real Estate Agent'}</p>
                        </div>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item d-flex justify-content-between">
                                <span className="mb-0">User Name:</span>
                                <strong className="text-black">{data.userName || 'N/A'}</strong>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span className="mb-0">Phone Number:</span>
                                <strong className="text-black">{data.phoneNumber || 'N/A'}</strong>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span className="mb-0">Email:</span>
                                <strong className="text-black">{data.email || 'N/A'}</strong>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="col-xl-7 col-lg-8 col-sm-12">
                    <div className="card overflow-hidden">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h4 className="card-title">Agent Detail</h4>
                        </div>
                        <div className="card-body">
                            <div className="card card-body mb-2">
                                <div className="fw-bold">Description</div>
                                <div className=""></div>
                                <div style={{ marginTop: "2px" }}>
                                    &nbsp;&nbsp; {data.description || 'Real estate agents have a significant role in the market. John Doe specializes in residential properties in Los Angeles. His agency, "Urban Properties", is known for exceptional service and top-notch customer support.'}
                                </div>
                            </div>
                            <table className="table table-bordered mb-1">
                                <tbody>
                                    <tr>
                                        <td>First Name:</td>
                                        <td>{data.firstName || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td>Last Name:</td>
                                        <td>{data.lastName || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td>User Role:</td>
                                        <td>{data.userRole || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td>Address:</td>
                                        <td style={{
                                            wordWrap: 'break-word',
                                            wordBreak: 'break-word',
                                            whiteSpace: 'pre-wrap',
                                            maxWidth: '300px'
                                        }}>{data.address || 'N/A'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <div className="d-flex justify-content-between">
                    <h4>Reviews</h4>
                    <button className="add-review-btn btn btn-primary mb-1" onClick={() => handleReview()}>
                        Share Your Thoughts
                    </button>
                </div>

                {reviews.length > 0 ? (
                    <div>
                        <div className="reviews-grid">
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
                                                    <div className="dropdown-menu show position-absolute" style={{ marginLeft: "-100px" }}>
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
                                                <span key={index} className="badge bg-primary me-1">
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
            {resultList.length > 0 ? (
                <div className="row mt-4">
                    <p className="fs-1">Agents Properties</p>
                    {resultList}
                </div>
            ) : (
                <div className="row mt-4">
                    <p className="fs-1">No Properties Available</p>
                </div>
            )}
        </div>
    );
};

export default AgentDetail;