import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { decodeJwt, getJWTFromSession } from "../Login/GetAuth";
import Swal from "sweetalert2";

function Favorites() {
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const jwt = getJWTFromSession();
        if (jwt) {
            try {
                const decodedUser = JSON.parse(decodeJwt(jwt));
                setUser(decodedUser);
            } catch (error) {
                console.error("Failed to decode JWT:", error);
                handleNavigate();
            }
        } else {
            handleNavigate();
        }
    }, []);

    
    const handleNavigate = () => {
        Swal.fire({
            title: "First you need to login/register.",
            icon: "error",
        }).then(() => {
            navigate('/login');
        });
    };

    useEffect(() => {
        const fetchPropertiesAndFavorites = async () => {
            try {
                setIsLoading(true);
                const propertiesResponse = await axios.get("/api/Property/GetAllProperties");
                const favoritesResponse = await axios.get(`/api/Favorite/GetFavoritesByUser/${user.UserId}`);
                const favoriteIDs = favoritesResponse.data.map((fav) => fav.propertyID);
                const updatedProperties = propertiesResponse.data.map((property) => ({
                    ...property,
                    isFavorite: favoriteIDs.includes(property.propertyID),
                    favoriteID: favoritesResponse.data.find((fav) => fav.propertyID === property.propertyID)?.favoriteID || null,
                }));
                setProperties(updatedProperties);
                setIsLoading(false);
            } catch (error) {
                setIsError(true);
                setIsLoading(false);
            }
        };

        if (user) {
            fetchPropertiesAndFavorites();
        }
    }, [user]);

    const handleFavoriteDelete = async (favoriteID, propertyID) => {
        try {
            const response = await axios.delete(`/api/Favorite/RemoveFavorite/${favoriteID}`);
            if (response.status === 200) {
                setProperties(
                    properties.map((property) =>
                        property.propertyID === propertyID ? { ...property, isFavorite: false } : property
                    )
                );

                Swal.fire({
                    title: "Removed!",
                    text: "Property has been removed from your favorites.",
                    icon: "success",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            console.error("Error removing favorite:", error);
        }
    };

    return (
        <div className="main m-2">
            <div className="card card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <p className="fs-1">Favorites</p>
                </div>
                <div>
                    <div className="row" style={{ position: "relative" }}>
                        {isLoading ? (
                            <p>Loading properties...</p>
                        ) : isError ? (
                            <p>No Favorite Properties</p>
                        ) : (
                            <>
                                {properties.filter((property) => property.isFavorite).length === 0 ? (
                                    <p>No Favorite Properties</p>
                                ) : (
                                    properties
                                        .filter((property) => property.isFavorite)
                                        .map((property) => (
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
                                                        <div className="position-relative overflow-hidden rounded-top">
                                                            <div className="position-absolute top-0 start-0 bg-primary text-white badge rounded-pill mt-2 ms-2 fs-6">
                                                                {property.transactionType}
                                                            </div>
                                                            <img
                                                                src={
                                                                    property.images?.[0]?.imageURL ||
                                                                    "https://i.ibb.co/rHN5ZY6/images-q-tbn-ANd9-Gc-Qs-Ah-Tu0y-Kq27-NDXYTd-Jbc9ofxy-F8-WURal9-GA-s.jpg"
                                                                }
                                                                alt="Property"
                                                                className="img-fluid w-100"
                                                                style={{ height: "250px", objectFit: "cover" }}
                                                            />
                                                            <div className="position-absolute d-flex align-items-center gap-1 bottom-2 end-2">
                                                        <button className="text-muted fs-5 border-0 rounded" style={{ backgroundColor: "rgba(0, 0, 0, .65)" }} title="Share">
                                                            <i className="bi bi-share text-white"></i>
                                                        </button>
                                                    </div>
                                                        </div>

                                                        <div className="card-body">
                                                            <h5 className="card-title">{property.propertyTitle}</h5>
                                                            <p
                                                                className="card-text text-muted"
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

                                                    <ul className="list-group list-group-flush">
                                                        <li className="list-group-item">
                                                            <div className="row text-center text-muted">
                                                                <div className="col">
                                                                    <i className="bi bi-house-door-fill me-2"></i>
                                                                    {property.bedroomCount} Bed
                                                                </div>
                                                                <div className="col">
                                                                    <i className="bi bi-droplet-fill me-2"></i>
                                                                    {property.bathroomCount} Bath
                                                                </div>
                                                                <div className="col">
                                                                    <i className="bi bi-fullscreen me-2"></i>
                                                                    {property.propertySize} sqft
                                                                </div>
                                                            </div>
                                                        </li>
                                                    </ul>

                                                    <div className="d-flex justify-content-between align-items-center p-3 border-top">
                                                        <Link
                                                            to={"/Agent/" + property.userID}
                                                            style={{ textDecoration: "none" }}
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <img
                                                                    src={
                                                                        property.userProfilePhoto ||
                                                                        "https://via.placeholder.com/40"
                                                                    }
                                                                    alt="User Avatar"
                                                                    className="rounded-circle me-2"
                                                                    style={{ width: "40px", height: "40px" }}
                                                                />
                                                                <h6 className="mb-0 text-dark">{property.userName}</h6>
                                                            </div>
                                                        </Link>
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() =>
                                                                handleFavoriteDelete(property.favoriteID, property.propertyID)
                                                            }
                                                        >
                                                            Remove Favorite
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Favorites;
