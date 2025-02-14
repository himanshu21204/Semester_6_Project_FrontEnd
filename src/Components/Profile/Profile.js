import Swal from "sweetalert2";
import React, { use, useEffect, useState } from "react";
import { decodeJwt, decodeJwtID, getJWTFromSession } from "../Login/GetAuth";
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";

const Profile = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState();
    const [user, setUser] = useState({});
    const [userID, setUserID] = useState(0);
    const [isLogin, setIsLogin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isAvatarEditing, setIsAvatarEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [propertyData, setPropertyData] = useState([]);
    const [resultList, setResultList] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);

    useEffect(() => {
        const fetchToken = async () => {
            const jwtToken = getJWTFromSession();
            if (jwtToken) {
                setToken(jwtToken);
            } else {
                setIsLogin(false);
                navigate("/login");
            }
        };
        fetchToken();
    }, [navigate]);

    useEffect(() => {
        if (token) {
            const fetchUserData = async () => {
                try {
                    const decodedID = await decodeJwtID(token);
                    if (decodedID) {
                        setUserID(decodedID);
                        setIsLogin(true);
                        await getUserData(decodedID);
                    } else {
                        throw new Error("Invalid User ID");
                    }
                } catch (error) {
                    console.error("Error decoding token:", error.response?.data?.message);
                    setIsLogin(false);
                    navigate("/login");
                }
            };
            fetchUserData();
        }
    }, [token, navigate]);

    // Fetch user details
    const getUserData = async (userID) => {
        try {
            const response = await axios.get(`/api/User/GetUserByID/${userID}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(response.data);

            if (response.data) {
                setUser(response.data);
                if (response.data.userRole !== "Buyer") {
                    fetchPropertyData();
                }
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "Something went wrong!",
                confirmButtonText: "OK"
            }).then(() => {
                navigate("/login");
            });
        }
    };

    const fetchPropertyData = async () => {
        try {
            const result = await axios.get("/api/Property/GetAllProperties", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (result.data && result.data.length > 0) {
                setPropertyData(result.data);
            }
        } catch (err) {
            console.error("Error fetching property data:", err);
        }
    };

    const renderProperties = propertyData.filter(property => userID == property.userID).map((property) => {
        return (
            <div key={property.propertyID} className="my-3 col-4">
                <div
                    className="card mx-auto"
                    style={{
                        maxWidth: "100%",
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                        borderRadius: "8px",
                    }}
                >
                    <Link
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
                            <h5 className="card-title"
                                style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "inline-block",
                                    maxWidth: "95%",
                                }}>
                                {property.propertyTitle}
                            </h5>
                            <br />
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

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            userRole: user.userRole || '',
            userName: user.userName || '',
            phoneNumber: user.phoneNumber || '',
            email: user.email || '',
            address: user.address || '',
            description: user.description || ''
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({});
    };

    const handleSave = async () => {
        try {
            const updatedUser = {
                ...user,
                ...editData,
            };
            if (token) {
                console.log(updatedUser);

                await axios.put(`/api/User/UpdateUser/${userID}`, updatedUser, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setUser(updatedUser);
            setIsEditing(false);
            Swal.fire({
                title: "Profile Updated Successfully!",
                icon: "success",
                confirmButtonText: "OK"
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.response?.data?.message || "Something went wrong!",
                confirmButtonText: "OK"
            })
        }
    };

    const handleChange = (e) => {
        setEditData({
            ...editData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

            if (allowedExtensions.includes(fileExtension)) {
                setImageFile(file);
                const reader = new FileReader();
                reader.onload = (event) => {
                    setImageSrc(event.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                Swal.fire({
                    title: "First you need to login/register.",
                    icon: "error",
                });
                e.target.value = '';
            }
        }
    };

    const handleFileUpload = async () => {
        if (imageFile) {
            try {
                const uploadFormData = new FormData();
                uploadFormData.append('image', imageFile);

                const response = await axios.post("https://api.imgbb.com/1/upload?key=e2db45c90e4166baf8ef10e07f056af7", uploadFormData);

                if (response.data) {
                    const imgbbUrl = response.data.data.url;

                    await axios.put(`/api/User/UpdateProfilePhoto/${userID}`, { profilePhoto: imgbbUrl }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    setUser((prevUser) => ({ ...prevUser, profilePhoto: imgbbUrl }));
                    Swal.fire({
                        title: "Images Upload Success",
                        icon: "success",
                        confirmButtonText: "OK"
                    });
                    setIsAvatarEditing(false);
                }
            } catch (error) {
                console.error("Error uploading image or updating database:", error);
            }
        } else {
            Swal.fire({
                title: "Please, First Select Image!",
                icon: "error",
            });
        }
    };

    const handleDeactivate = async () => {
        Swal.fire({
            title: "First you need to login/register.",
            icon: "error",
        });
    };

    const handleChangePassword = () => {
        Swal.fire({
            title: "Change Password",
            html: `
            <input type="password" id="oldPassword" class="swal2-input" placeholder="Old Password">
            <input type="password" id="newPassword" class="swal2-input" placeholder="New Password">
            <input type="password" id="confirmPassword" class="swal2-input" placeholder="Confirm Password">
          `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Change",
            preConfirm: () => {
                const oldPassword = document.getElementById("oldPassword").value;
                const newPassword = document.getElementById("newPassword").value;
                const confirmPassword = document.getElementById("confirmPassword").value;

                if (!oldPassword || !newPassword || !confirmPassword) {
                    Swal.showValidationMessage("All fields are required");
                    return false;
                }
                if (newPassword !== confirmPassword) {
                    Swal.showValidationMessage("New passwords do not match");
                    return false;
                }

                return { oldPassword, newPassword };
            },
        }).then((result) => {
            if (result.isConfirmed && token) {
                axios
                    .post("/api/User/ChangePassword/ChangePassword", {
                        userId: userID,
                        oldPassword: result.value.oldPassword,
                        newPassword: result.value.newPassword,
                        confirmPassword: result.value.newPassword,
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    .then(() => {
                        Swal.fire("Success", "Password changed successfully!", "success");
                    })
                    .catch((error) => {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: error.response?.data?.message || "Incorrect old password or failed to update!",
                            confirmButtonText: "OK"
                        })
                    });
            }
        });
    };

    const handleResetPassword = () => {
        navigate('/reset-password');
    }
    return (
        <div className="m-3">
            <div className="card card-body main">
                <div className="row gx-lg-3">
                    <div className="col-xl-5 col-lg-4 col-sm-12">
                        <div className="card overflow-hidden">
                            <div className="text-center p-3 overlay-box">
                                <div className="profile-photo">
                                    <div style={{ position: "relative", display: "inline-block" }}>
                                        <img
                                            id="selectedAvatar"
                                            src={imageSrc || user.profilePhoto || "https://placehold.co/40"}
                                            width="100"
                                            className="img-fluid rounded-circle"
                                            alt="profile"
                                        />
                                        <a onClick={() => setIsAvatarEditing(true)}>
                                            <div
                                                onMouseEnter={() => setIsHovered(true)}
                                                onMouseLeave={() => setIsHovered(false)}
                                                style={{
                                                    position: "absolute",
                                                    bottom: "5px",
                                                    right: "-15px",
                                                    width: "auto",
                                                    height: "32px",
                                                    padding: "0 8px",
                                                    borderRadius: "16px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    backgroundColor: isHovered ? "#f0f8ff" : "#ffffff",
                                                    border: "1px solid #d1d9e0",
                                                    boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
                                                    cursor: "pointer",
                                                    transition: "background-color 0.3s ease, transform 0.3s ease",
                                                    transform: isHovered ? "scale(1.1)" : "scale(1)",
                                                }}
                                            >
                                                <i
                                                    className="bi bi-pencil"
                                                    style={{
                                                        color: isHovered ? "#007bff" : "#000000",
                                                        fontSize: "16px",
                                                        marginRight: isHovered ? "8px" : "0",
                                                    }}
                                                ></i>
                                                {isHovered && (
                                                    <span
                                                        style={{
                                                            color: "#000000",
                                                            fontSize: "14px",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        Change Profile Photo
                                                    </span>
                                                )}
                                            </div>
                                        </a>
                                    </div>
                                    {isAvatarEditing && (
                                        <div className="mt-3">
                                            <input
                                                type="file"
                                                name="profilePhoto"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                multiple={false}
                                            />
                                            <button
                                                className="btn btn-primary mt-2 me-2"
                                                onClick={handleFileUpload}
                                            >
                                                Upload
                                            </button>
                                            <button
                                                className="btn btn-primary mt-2"
                                                onClick={() => setIsAvatarEditing(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <h3 className="mt-3 mb-2 text-black">
                                    {isEditing ? (
                                        <input type="text" name="firstName" disabled className="form-control" value={editData.firstName + " " + editData.lastName} onChange={handleChange} />
                                    ) : (
                                        user.firstName ? `${user.firstName} ${user.lastName}` : 'John Doe'
                                    )}
                                </h3>
                                <p className="text-black mb-0">
                                    {isEditing ? (
                                        <input type="text" name="userRole" disabled className="form-control" value={editData.userRole} onChange={handleChange} />
                                    ) : (
                                        user.userRole || 'Real Estate Agent'
                                    )}
                                </p>
                            </div>
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item d-flex justify-content-between">
                                    <span className="mb-0">User Name:</span>
                                    {isEditing ? (
                                        <input type="text" name="userName" style={{ width: "330px" }} className="form-control" value={editData.userName} onChange={handleChange} placeholder="Update your user name" />
                                    ) : (
                                        <strong className="text-black">{user.userName || 'N/A'}</strong>
                                    )}
                                </li>
                                <li className="list-group-item d-flex justify-content-between">
                                    <span className="mb-0">Phone Number:</span>
                                    {isEditing ? (
                                        <input type="text" name="phoneNumber" style={{ width: "330px" }} className="form-control" value={editData.phoneNumber} onChange={handleChange} placeholder="Update your phone number" />
                                    ) : (
                                        <strong className="text-black">{user.phoneNumber || 'N/A'}</strong>
                                    )}
                                </li>
                                <li className="list-group-item d-flex justify-content-between">
                                    <span className="mb-0">Email:</span>
                                    {isEditing ? (
                                        <input type="text" name="email" style={{ width: "330px" }} className="form-control" value={editData.email} onChange={handleChange} placeholder="Update your email" />
                                    ) : (
                                        <strong className="text-black">{user.email || 'N/A'}</strong>
                                    )}
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-xl-7 col-lg-8 col-sm-12">
                        <div className="card overflow-hidden">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h4 className="card-title">User Detail</h4>
                                <div>
                                    {isEditing ? (
                                        <div>
                                            <button className="btn btn-primary ms-2" onClick={handleSave}>Save</button>
                                            <button className="btn btn-secondary ms-2" onClick={handleCancel}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="nav-profile d-flex align-items-center " id="navbarDropdown" data-bs-toggle="dropdown" aria-expanded="false" style={{ cursor: "pointer" }}>
                                                <i class="bi bi-three-dots-vertical"></i>
                                            </div>
                                            <ul
                                                className="dropdown-menu dropdown-menu-end"
                                                aria-labelledby="navbarDropdown"
                                            >
                                                <li>
                                                    <button className="btn" onClick={handleEdit}>Edit Profile</button>
                                                </li>
                                                <li>
                                                    <button className="btn" onClick={handleDeactivate}>Delete Profile</button>
                                                </li>
                                                <li>
                                                    <hr className="dropdown-divider" />
                                                </li>
                                                <li>
                                                    <button className="btn" onClick={handleChangePassword}>Change Password</button>
                                                </li>
                                                <li>
                                                    <button className="btn" onClick={handleResetPassword}>Forgot Password?</button>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="card-body">
                                <p>
                                    {isEditing ? (
                                        <textarea
                                            name="description"
                                            className="form-control"
                                            rows="3"
                                            value={editData.description}
                                            onChange={handleChange}
                                            placeholder="Update your description"
                                        ></textarea>
                                    ) : (
                                        <div className="card card-body">
                                            <div className="fw-bold">Description</div>
                                            <div className=""></div>
                                            <div>
                                                {user.description || 'Real estate agents have a significant role in the market. John Doe specializes in residential properties in Los Angeles. His agency, "Urban Properties", is known for exceptional service and top-notch customer support.'}
                                            </div>
                                        </div>
                                    )}
                                </p>
                                <table className="table table-bordered mb-2">
                                    <tbody>
                                        <tr>
                                            <td>First Name:</td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        className="form-control"
                                                        value={editData.firstName}
                                                        onChange={handleChange}
                                                        placeholder="Update your first name"
                                                    />
                                                ) : (
                                                    user.firstName || 'N/A'
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Last Name:</td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        className="form-control"
                                                        value={editData.lastName}
                                                        onChange={handleChange}
                                                        placeholder="Update your last name"
                                                    />
                                                ) : (
                                                    user.lastName || 'N/A'
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>User Role:</td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="userRole"
                                                        className="form-control"
                                                        disabled
                                                        value={editData.userRole}
                                                        onChange={handleChange}
                                                        placeholder="Update your user role"
                                                    />
                                                ) : (
                                                    user.userRole || 'N/A'
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Address:</td>
                                            <td
                                                style={{
                                                    wordWrap: 'break-word',
                                                    wordBreak: 'break-word',
                                                    whiteSpace: 'pre-wrap',
                                                    maxWidth: '300px'
                                                }}
                                            >
                                                {isEditing ? (
                                                    <textarea
                                                        type="text"
                                                        name="address"
                                                        className="form-control"
                                                        value={editData.address}
                                                        onChange={handleChange}
                                                        placeholder="Update your address"
                                                    />
                                                ) : (
                                                    user.address || 'N/A'
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                            </div>
                        </div>
                    </div>
                </div>
                {/* Render the properties if any */}
                {resultList.length > 0 ? (
                    <div className="row mt-4">
                        <p className="fs-1">User Properties</p>
                        {resultList}
                    </div>
                ) : (
                    (user.userRole != 'Buyer' && <div className="row mt-4">
                        <p className="fs-1">No Properties Available</p>
                    </div>)
                )}
            </div>
        </div>
    );
};

export default Profile;
