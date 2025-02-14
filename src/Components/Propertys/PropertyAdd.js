import Swal from "sweetalert2";
import swal from "sweetalert";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { decodeJwt, getJWTFromSession } from "../Login/GetAuth";

const PropertyForm = () => {
    const navigate = useNavigate();
    const { propertyID } = useParams();
    const [postImages, setPostImages] = useState([]);
    const [loginUser, setLoginUser] = useState({});
    const [isUpload, setIsUpload] = useState(false);
    const [formData, setFormData] = useState({
        propertyID: 0,
        userID: 0,
        propertyTitle: "",
        propertyDescription: "",
        propertyPrice: "",
        propertyAddress: "",
        propertySize: "",
        bedroomCount: "",
        bathroomCount: "",
        buildYear: "",
        propertyType: "",
        parkingSpaces: "",
        additionalFeatures: [],
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const jwt = getJWTFromSession();
        if (jwt) {
            const decodedUser = JSON.parse(decodeJwt(jwt));
            setLoginUser(decodedUser);
        } else {
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await axios.get(`/api/Property/GetPropertyById/${propertyID}`);
                const property = response.data;
                console.log(property);

                setFormData({
                    ...property,
                    additionalFeatures: property.additionalFeatures ? property.additionalFeatures.split(";") : [],
                });

                setPostImages(property.images.map((image) => ({
                    imageID: image.imageID,
                    imageURL: image.imageURL
                })));
            } catch (error) {
                console.error("Error fetching property:", error);
                Swal.fire("Failed to fetch property.", { icon: "error" });
                navigate("/");
            }
        };

        if (propertyID && loginUser?.UserId) {
            fetchProperty();
        } else if (loginUser?.UserId) {
            setFormData({
                userID: loginUser.UserId,
                propertyTitle: "",
                propertyDescription: "",
                propertyPrice: "",
                propertyAddress: "",
                propertySize: "",
                bedroomCount: "",
                bathroomCount: "",
                buildYear: "",
                propertyType: "",
                TransactionType: "",
                parkingSpaces: "",
                additionalFeatures: [],
            });
            setPostImages([]);
        }
    }, [propertyID, loginUser, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked, value } = e.target;
        setFormData((prevData) => {
            if (checked) {
                return {
                    ...prevData,
                    [name]: [...prevData[name], value],
                };
            } else {
                return {
                    ...prevData,
                    [name]: prevData[name].filter((item) => item !== value),
                };
            }
        });
    };

    const handleFileUpload = async (e) => {
        setIsUpload(true);
        const files = e.target.files;
        const uploadedPhotoUrls = [];

        for (const file of files) {
            const uploadFormData = new FormData();
            uploadFormData.append("image", file);
            try {
                const response = await fetch("https://api.imgbb.com/1/upload?key=e2db45c90e4166baf8ef10e07f056af7", {
                    method: "POST",
                    body: uploadFormData,
                });

                if (!response.ok) throw new Error("Failed to upload image");

                const data = await response.json();
                uploadedPhotoUrls.push({
                    temporaryID: Date.now(),
                    imageID: 0,
                    imageURL: data.data.display_url,
                });
            } catch (error) {
                console.error("Error uploading image:", error);
            }
        }

        setIsUpload(false);
        setPostImages((prevImages) => [...prevImages, ...uploadedPhotoUrls]);
    };


    const handleDeleteImage = async (imageID) => {
        console.log(imageID);

        try {
            const imageToDelete = postImages.find((image) => image.imageID == imageID || image.temporaryID == imageID);

            if (!imageToDelete) {
                console.error("Image not found");
                return;
            }
            if (imageToDelete.imageID != 0) {
                const response = await axios.delete(`/api/PropertyImage/DeleteImageByImageID/image/${imageID}`);
                if (response.status === 200) {
                    swal({
                        title: "Image removed successfully!",
                        icon: "success",
                        button: "Ok",
                    });
                } else {
                    swal({
                        title: "Failed to remove image. Please try again later.",
                        icon: "error",
                        button: "Ok",
                    });
                }
            }
            setPostImages((prevImages) => prevImages.filter((image) => image.imageID != imageID && image.temporaryID != imageID));
        } catch (error) {
            console.error("Error deleting image:", error);
            swal({
                title: "An error occurred while deleting the image.",
                icon: "error",
                button: "Ok",
            });
        }
    };


    const payload = {
        propertyID: formData.propertyID || 0,
        userID: loginUser?.UserId || 0,
        userName: formData.userName?.trim() || "",
        propertyTitle: formData.propertyTitle?.trim() || "",
        propertyDescription: formData.propertyDescription?.trim() || "",
        propertyPrice: isNaN(parseFloat(formData.propertyPrice)) ? 0 : parseFloat(formData.propertyPrice),
        propertyAddress: formData.propertyAddress?.trim() || "",
        propertySize: isNaN(parseFloat(formData.propertySize)) ? 0 : parseFloat(formData.propertySize),
        bedroomCount: isNaN(parseInt(formData.bedroomCount, 10)) ? 0 : parseInt(formData.bedroomCount, 10),
        bathroomCount: isNaN(parseInt(formData.bathroomCount, 10)) ? 0 : parseInt(formData.bathroomCount, 10),
        buildYear: formData.buildYear || new Date().toISOString(),
        propertyType: formData.propertyType?.trim() || "",
        transactionType: formData.transactionType?.trim() || "",
        parkingSpaces: isNaN(parseInt(formData.parkingSpaces, 10)) ? 0 : parseInt(formData.parkingSpaces, 10),
        additionalFeatures: Array.isArray(formData.additionalFeatures)
            ? formData.additionalFeatures.filter((feature) => feature.trim() !== "").join(";")
            : "",
        images: Array.isArray(postImages)
            ? postImages.map((img) => ({
                imageID: img.imageID || 0,
                imageURL: img.imageURL?.trim() || "",
            }))
            : [],
        status: "Available",
    };

    console.log(payload);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(payload);

        try {
            let response;
            if (propertyID) {
                response = await axios.put(`/api/Property/UpdateProperty/${propertyID}`, { ...payload, propertyID }, {
                    headers: { Authorization: `Bearer ${getJWTFromSession()}` }
                });
            } else {
                response = await axios.post("/api/Property/InsertProperty", payload, {
                    headers: { Authorization: `Bearer ${getJWTFromSession()}` }
                });
            }

            if (response.status === 200) {
                swal({
                    title: propertyID ? "Property updated successfully!" : "Property added successfully!",
                    icon: "success",
                    button: "Ok",
                });

                setFormData({
                    userID: 0,
                    propertyTitle: "",
                    propertyDescription: "",
                    propertyPrice: "",
                    propertyAddress: "",
                    propertySize: "",
                    bedroomCount: "",
                    bathroomCount: "",
                    buildYear: "",
                    propertyType: "",
                    TransactionType: "",
                    parkingSpaces: "",
                    additionalFeatures: [],
                });
                setPostImages([])
                navigate("/admin/property");
            }
        } catch (error) {
            if (error.response) {
                const errors = error.response.data.errors;
                if (Array.isArray(errors)) {
                    const validationErrors = {};
                    errors.forEach((err) => {
                        validationErrors[err.Field] = err.Error;
                    });
                    setErrors(validationErrors);
                } else if (typeof errors === "object") {
                    const validationErrors = {};
                    for (const [field, errorMessage] of Object.entries(errors)) {
                        validationErrors[field] = errorMessage;
                    }
                    setErrors(validationErrors);
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: error.response?.data?.message || "Something went wrong!",
                        confirmButtonText: "OK"
                    })
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.response?.data?.message || "Something went wrong!",
                    confirmButtonText: "OK"
                })
            }
        }
    };
    const handleNavigate = () => {
        navigate("/property");
    }
    return (
        <section className="pt-5 pb-5 d-flex align-items-center bg-dark" style={{ minHeight: "100vh", backgroundColor: "rgba(33, 111, 237, 0.1)" }}>
            <div className="container">
                <div className="row justify-content-center align-items-center h-100">
                    <div className="col-12 col-md-10">
                        <div className="card shadow">
                            <div className="card-body">
                                <h4 className="card-title text-center" style={{
                                    borderRadius: "0.5rem", backgroundImage: "linear-gradient(195deg, #42424a 0%, #191919 100%)",
                                    boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(64, 64, 64, 0.4)",
                                    color: "#fff", padding: "1rem", marginBottom: "15px"
                                }}>
                                    {propertyID ? "Update Property Details" : "Property Details"}
                                </h4>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="d-block text-start">User ID</label>
                                        <input
                                            name="userID"
                                            className="form-control"
                                            disabled
                                            value={loginUser.UserId}
                                        />
                                    </div>
                                    {/* Property Title */}
                                    <div className="form-group">
                                        <label className="d-block text-start"><span className="text-danger">*</span>Property Title </label>
                                        <input
                                            name="propertyTitle"
                                            className="form-control"
                                            placeholder="Enter property title"
                                            value={formData.propertyTitle}
                                            onChange={handleChange}
                                        />
                                        {errors.PropertyTitle && (
                                            <span className="text-start text-danger">
                                                {errors.PropertyTitle}
                                            </span>
                                        )}
                                    </div>

                                    {/* Property Description */}
                                    <div className="form-group">
                                        <label className="d-block text-start"><span className="text-danger">*</span> Property Description</label>
                                        <textarea
                                            name="propertyDescription"
                                            className="form-control"
                                            placeholder="Enter property description"
                                            value={formData.propertyDescription}
                                            onChange={handleChange}
                                            rows="3"

                                        ></textarea>
                                        {errors.PropertyDescription && (
                                            <div className="text-start text-danger">
                                                {errors.PropertyDescription}
                                            </div>
                                        )}
                                    </div>

                                    {/* Property Price */}
                                    <div className="form-group">
                                        <label className="d-block text-start"><span className="text-danger">*</span> Property Price (USD)</label>
                                        <input
                                            name="propertyPrice"
                                            type="number"
                                            className="form-control"
                                            placeholder="Enter property price"
                                            value={formData.propertyPrice}
                                            onChange={handleChange}

                                        />
                                        {errors.PropertyPrice && (
                                            <div className="text-start text-danger">
                                                {errors.PropertyPrice}
                                            </div>
                                        )}
                                    </div>

                                    {/* Property Address */}
                                    <div className="form-group">
                                        <label className="d-block text-start"><span className="text-danger">*</span> Property Address</label>
                                        <input
                                            name="propertyAddress"
                                            className="form-control"
                                            placeholder="Enter property address"
                                            value={formData.propertyAddress}
                                            onChange={handleChange}

                                        />
                                        {errors.PropertyAddress && (
                                            <div className="text-start text-danger">
                                                {errors.PropertyAddress}
                                            </div>
                                        )}
                                    </div>

                                    <div className="row">
                                        {/* Property Size */}
                                        <div className="form-group col-md-6">
                                            <label className="d-block text-start"><span className="text-danger">*</span> Property Size (sq. meters)</label>
                                            <input
                                                name="propertySize"
                                                type="number"
                                                className="form-control"
                                                placeholder="Enter property size"
                                                value={formData.propertySize}
                                                onChange={handleChange}

                                            />
                                            {errors.PropertySize && (
                                                <div className="text-start text-danger">
                                                    {errors.PropertySize}
                                                </div>
                                            )}
                                        </div>

                                        {/* Bedroom Count */}
                                        <div className="form-group col-md-6">
                                            <label className="d-block text-start"><span className="text-danger">*</span> Number of Bedrooms</label>
                                            <input
                                                name="bedroomCount"
                                                type="number"
                                                className="form-control"
                                                placeholder="Enter number of bedrooms"
                                                value={formData.bedroomCount}
                                                onChange={handleChange}

                                            />
                                            {errors.BedroomCount && (
                                                <div className="text-start text-danger">
                                                    {errors.BedroomCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="form-group col-md-6">
                                            <label className="d-block text-start"><span className="text-danger">*</span> Number of Bathrooms</label>
                                            <input
                                                name="bathroomCount"
                                                type="number"
                                                className="form-control"
                                                placeholder="Enter number of bathrooms"
                                                value={formData.bathroomCount}
                                                onChange={handleChange}

                                            />
                                            {errors.BathroomCount && (
                                                <div className="text-start text-danger">
                                                    {errors.BathroomCount}
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label className="d-block text-start">Build Date</label>
                                            <input
                                                name="buildYear"
                                                type="date"
                                                className="form-control"
                                                value={formData.buildYear ? formData.buildYear.split('T')[0] : ''}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        {errors.BuildYear && (
                                            <div className="text-start text-danger">
                                                {errors.BuildYear}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="d-block text-start"><span className="text-danger">*</span> Property Type</label>
                                        <select
                                            name="propertyType"
                                            className="form-control"
                                            value={formData.propertyType}
                                            onChange={handleChange}

                                        >
                                            <option value="">Select property type</option>
                                            <option value="Apartment">Apartment</option>
                                            <option value="House">House</option>
                                            <option value="Villa">Villa</option>
                                            <option value="Condo">Condo</option>
                                            <option value="Commercial">Commercial</option>
                                            <option value="Office">Office</option>
                                            <option value="Land">Land</option>
                                            <option value="Warehouse">Warehouse</option>
                                            <option value="Shop">Shop</option>
                                            <option value="Farmhouse">Farmhouse</option>
                                        </select>
                                        {errors.PropertyType && (
                                            <div className="text-start text-danger">
                                                {errors.PropertyType}
                                            </div>
                                        )}
                                    </div>

                                    {/* Transaction Type */}
                                    <div className="form-group">
                                        <label className="d-block text-start"><span className="text-danger">*</span> Transaction Type</label>
                                        <select
                                            name="transactionType"
                                            className="form-control"
                                            value={formData.transactionType}
                                            onChange={handleChange}

                                        >
                                            <option value="">Select transaction type</option>
                                            <option value="Buy">Buy</option>
                                            <option value="Sell">Sell</option>
                                            <option value="Rent">Rent</option>
                                        </select>
                                        {errors.TransactionType && (
                                            <div className="text-start text-danger">
                                                {errors.TransactionType}
                                            </div>
                                        )}
                                    </div>

                                    {/* Parking Spaces */}
                                    <div className="form-group">
                                        <label className="d-block text-start">Number of Parking Spaces</label>
                                        <input
                                            name="parkingSpaces"
                                            type="number"
                                            className="form-control"
                                            placeholder="Enter parking spaces"
                                            value={formData.parkingSpaces}
                                            onChange={handleChange}

                                        />
                                    </div>
                                    {errors.ParkingSpaces && (
                                        <div className="text-start text-danger">
                                            {errors.ParkingSpaces}
                                        </div>
                                    )}
                                    {/* Additional Features */}
                                    <div className="form-group">
                                        <label className="d-block text-start">Additional Features</label>
                                        <div className="row">
                                            {[
                                                "Swimming pool", "Terrace", "Air conditioning", "Balcony", "Towels",
                                                "Roof terrace", "Oven", "Cable TV", "Parking", "Security system", "Central heating"
                                            ].map((feature) => (
                                                <div key={feature} className="form-check col-md-4">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        name="additionalFeatures"
                                                        value={feature}
                                                        checked={formData.additionalFeatures.includes(feature)}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                    <label className="form-check-label">{feature}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Image Upload */}
                                    <div className="form-group">
                                        <label className="d-block text-start">
                                            <span className="text-danger">*</span> Upload Property Images
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            className="form-control"
                                            onChange={handleFileUpload}
                                        />
                                        {errors.Images && <div className="text-start text-danger">{errors.Images}</div>}

                                        <div className="existing-images">
                                            {postImages.map((image) => (
                                                <div key={image.temporaryID || image.imageID} className="image-container">
                                                    <img src={image.imageURL} alt="Property" width="100" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteImage(image.imageID || image.temporaryID)}
                                                        className="btn btn-danger"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Submit Button */}
                                    <div className="form-group d-flex justify-content-start">
                                        <button
                                            type="submit"
                                            disabled={isUpload}
                                            className="btn btn-primary p-2 mx-2"
                                        >
                                            {propertyID ? "Update Property" : "Add Property"}
                                        </button>
                                        <button className="btn btn-outline-primary text-primary" onClick={handleNavigate}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PropertyForm;
