import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { decodeJwt, getJWTFromSession } from "../Login/GetAuth";
import Swal from 'sweetalert2';
import moment from 'moment';

const Property = () => {
  const location = useLocation();
  const searchParamsQuery = new URLSearchParams(location.search);
  const title = searchParamsQuery.get("query") || "";
  const type = searchParamsQuery.get("propertyType") || "";
  console.log(location);
  console.log(searchParamsQuery);
  console.log(type);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [user, setUser] = useState({});
  const [isLogin, setIsLogin] = useState(false);
  const initialSearchParams = {
    title: "" || title,
    minPrice: 1000,
    maxPrice: 10000000,
    minSize: 0,
    maxSize: 10000,
    bedroomCount: "",
    bathroomCount: "",
    propertySize: "",
    year: "",
    propertyType: "" || type,
    transactionType: "",
    address: "",
    parkingSpaces: "",
    status: "",
    additionalFeatures: []
  };
  const [searchParams, setSearchParams] = useState(initialSearchParams);
  const [additionalFeaturesOpen, setAdditionalFeaturesOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("titleAsc");

  const navigate = useNavigate();

  const getData = () => {
    axios
      .get("/api/Property/GetAllProperties")
      .then((res) => {
        setProperties(
          res.data.map((property) => {
            const now = moment();
            const buildDate = moment(property.buildYear);
            const diffDays = now.diff(buildDate, "days");
            const diffMonths = now.diff(buildDate, "months");
            const diffYears = now.diff(buildDate, "years");

            let timeAgo = "";
            if (diffDays < 30) {
              timeAgo = `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
            } else if (diffMonths < 12) {
              timeAgo = `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
            } else {
              timeAgo = `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
            }
            return {
              ...property,
              timeAgo,
            };
          })
        );
        setFilteredProperties(properties);
        setIsLoading(false);
        setIsError(false);
      })
      .catch((err) => {
        setIsError(true);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const jwt = getJWTFromSession();
    if (jwt) {
      const decodedUser = JSON.parse(decodeJwt(jwt));
      setUser(decodedUser);
      setIsLogin(true);
    }
    if(title != "" || type != ""){
      setDropdownOpen(!dropdownOpen)
    }
    getData();
  }, []);

  const handleSearchChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (type == "checkbox") {
      setSearchParams((prevParams) => {
        const updatedFeatures = checked
          ? [...prevParams.additionalFeatures, value]
          : prevParams.additionalFeatures.filter((feature) => feature != value);

        return {
          ...prevParams,
          additionalFeatures: updatedFeatures
        };
      });
    } else {
      setSearchParams((prevParams) => ({
        ...prevParams,
        [name]: value
      }));
    }
  };

  useEffect(() => {
    const filtered = properties.filter((property) => {
      return (
        (!searchParams.title || property.propertyTitle.toLowerCase().includes(searchParams.title.toLowerCase())) &&
        (property.propertyPrice >= searchParams.minPrice && property.propertyPrice <= searchParams.maxPrice) &&
        (property.propertySize >= searchParams.minSize && property.propertySize <= searchParams.maxSize) &&
        (!searchParams.bedroomCount || property.bedroomCount == searchParams.bedroomCount) &&
        (!searchParams.bathroomCount || property.bathroomCount == searchParams.bathroomCount) &&
        (!searchParams.year || new Date(property.buildYear).getFullYear() == searchParams.year) &&
        (!searchParams.propertyType || property.propertyType.toLowerCase().includes(searchParams.propertyType.toLowerCase())) &&
        (!searchParams.transactionType || property.transactionType.toLowerCase().includes(searchParams.transactionType.toLowerCase())) &&
        (!searchParams.address || property.propertyAddress.toLowerCase().includes(searchParams.address.toLowerCase())) &&
        (!searchParams.parkingSpaces || property.parkingSpaces.toString() === searchParams.parkingSpaces) &&
        (!searchParams.status || property.status.toLowerCase().includes(searchParams.status.toLowerCase()))
        && (searchParams.additionalFeatures.every(feature => property.additionalFeatures.includes(feature)))
      );
    });

    const sorted = filtered.sort((a, b) => {
      switch (sortOrder) {
        case "titleAsc":
          return a.propertyTitle.localeCompare(b.propertyTitle);
        case "titleDesc":
          return b.propertyTitle.localeCompare(a.propertyTitle);
        case "priceMinMax":
          return a.propertyPrice - b.propertyPrice;
        case "priceMaxMin":
          return b.propertyPrice - a.propertyPrice;
        case "sizeMinMax":
          return a.propertySize - b.propertySize;
        case "sizeMaxMin":
          return b.propertySize - a.propertySize;
        case "newOld":
          return new Date(b.buildYear) - new Date(a.buildYear);
        case "oldNew":
          return new Date(a.buildYear) - new Date(b.buildYear);
        default:
          return 0;
      }
    });

    setFilteredProperties(sorted);
  }, [searchParams, properties, sortOrder]);

  const handleCancelSearch = () => {
    setSearchParams(initialSearchParams);
  };


  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const handleFavoriteClick = (e, propertyID, userID) => {
    e.preventDefault();
    Swal.fire({
      title: "Adding to Favorites...",
      text: "Please wait while we save your favorite property.",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      timerProgressBar: true,
    });

    const payload = {
      UserID: userID,
      PropertyID: propertyID,
    };
    axios
      .post(`/api/Favorite/AddFavorite`, payload)
      .then((res) => {
        Swal.fire({
          title: "Added!",
          text: "Property has been added to your favorites.",
          icon: "success",
          confirmButtonText: "OK",
        });
      })
      .catch((err) => {
        Swal.fire({
          title: "Error!",
          text: "Failed to add property to favorites. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  };

  const handleAdd = () => navigate('/property-add');

  return (
    <div className="main m-3">
      <div style={{ marginLeft: "0" }}>
        <div className="d-flex justify-content-between align-items-center">
          <p className="fs-1">Properties</p>
        </div>

        <div className="card card-body shadow pt-3">
          <div className="d-flex justify-content-between">
            <div className="d-flex justify-content-between" style={{ cursor: "pointer" }} onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="fw-bold fs-3 mb-1 text-center">Search Properties</div>
              <div className="fw-bold text-center" style={{ marginLeft: "5px", marginTop: "12px" }}>{dropdownOpen ? <i className="bi bi-arrow-up-circle-fill"></i> : <i className="bi bi-arrow-down-circle-fill"></i>}</div>
            </div>
            <button className={`btn btn-secondary m-2 ${dropdownOpen ? "" : "d-none"}`} onClick={handleCancelSearch}>Cancel</button>
          </div>

          <div className={`row g-3 ${dropdownOpen ? "" : "d-none"}`}>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                name="title"
                placeholder="Enter Title"
                value={searchParams.title}
                onChange={handleSearchChange}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                name="address"
                placeholder="Enter Address"
                value={searchParams.address}
                onChange={handleSearchChange}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                name="year"
                placeholder="Enter Year"
                value={searchParams.year}
                onChange={handleSearchChange}
              />
            </div>
            <div className="col-md-3">
              <select
                name="transactionType"
                className="form-select"
                value={searchParams.transactionType}
                onChange={handleSearchChange}
              >
                <option value="">Transaction Type</option>
                <option value="Buy">Buy</option>
                <option value="Sell">Sell</option>
                <option value="Rent">Rent</option>
              </select>
            </div>

            <div className="col-md-3">
              <select
                name="bedroomCount"
                className="form-select"
                value={searchParams.bedroomCount}
                onChange={handleSearchChange}
              >
                <option value="">Bedrooms</option>
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <select
                name="bathroomCount"
                className="form-select"
                value={searchParams.bathroomCount}
                onChange={handleSearchChange}
              >
                <option value="">Bathrooms</option>
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <select
                name="propertyType"
                className="form-select"
                value={searchParams.propertyType}
                onChange={handleSearchChange}
              >
                <option value="">Property Type</option>
                {["Apartment", "House", "Villa", "Condo", "Commercial", "Office", "Land", "Warehouse", "Shop", "Farmhouse"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <select
                name="status"
                className="form-select"
                value={searchParams.status}
                onChange={handleSearchChange}
              >
                <option value="">Status</option>
                {["Available", "Pending", "Sold", "Rented", "Off Market", "Under Contract"].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="col-md-12">
              <label className="fw-bold">Price Range: ₹{searchParams.minPrice} - ₹{searchParams.maxPrice}</label>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="range"
                  name="minPrice"
                  className="form-range"
                  min="1000"
                  max="1000000"
                  value={searchParams.minPrice}
                  onChange={handleSearchChange}
                />
                <input
                  type="range"
                  name="maxPrice"
                  className="form-range"
                  min="1000"
                  max="1000000"
                  value={searchParams.maxPrice}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="col-md-12">
              <label className="fw-bold">Size Range: {searchParams.minSize} - {searchParams.maxSize} sq. ft.</label>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="range"
                  name="minSize"
                  className="form-range"
                  min="0"
                  max="10000"
                  value={searchParams.minSize}
                  onChange={handleSearchChange}
                />
                <input
                  type="range"
                  name="maxSize"
                  className="form-range"
                  min="0"
                  max="10000"
                  value={searchParams.maxSize}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-md-12 form-group">
                <label
                  className="d-block text-start fw-bold"
                  onClick={() => setAdditionalFeaturesOpen(!additionalFeaturesOpen)}
                  style={{ cursor: "pointer" }}
                >
                  Additional Features{" "}
                  {additionalFeaturesOpen ? (
                    <i className="bi bi-arrow-up-circle-fill"></i>
                  ) : (
                    <i className="bi bi-arrow-down-circle-fill"></i>
                  )}
                </label>
                <div className={`row ${additionalFeaturesOpen ? "" : "d-none"}`}>
                  {[
                    "Swimming pool",
                    "Terrace",
                    "Air conditioning",
                    "Balcony",
                    "Towels",
                    "Roof terrace",
                    "Oven",
                    "Cable TV",
                    "Parking",
                    "Security system",
                    "Central heating",
                  ].map((feature) => (
                    <div key={feature} className="form-check col-md-4">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="additionalFeatures"
                        value={feature}
                        checked={searchParams.additionalFeatures.includes(feature)}
                        onChange={handleSearchChange}
                      />
                      <label className="form-check-label">{feature}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sort Property */}
        <div className="card card-body mt-3 pb-2">
          <div className="d-flex justify-content-start align-items-center">
            <div className="me-3">
              <label className="fw-bold fs-4">
                Sort By:
              </label>
            </div>
            <div>
              <select
                className="form-select"
                value={sortOrder}
                onChange={handleSortChange}
              >
                <option value="titleAsc">Sort by Title (A-Z)</option>
                <option value="titleDesc">Sort by Title (Z-A)</option>
                <option value="priceMinMax">Sort by Price (Low to High)</option>
                <option value="priceMaxMin">Sort by Price (High to Low)</option>
                <option value="sizeMinMax">Sort by Size (Small to Large)</option>
                <option value="sizeMaxMin">Sort by Size (Large to Small)</option>
                <option value="newOld">Sort by Newest</option>
                <option value="oldNew">Sort by Oldest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Property Listings */}
        <div>
          <div className="row" style={{ position: "relative" }}>
            {(isLoading && properties.length === 0) || isError ? (
              <p>Loading properties...</p>
            ) : (
              filteredProperties.length === 0 ? (
                <p>No property found matching your search criteria.</p>
              ) : (
                filteredProperties.map((property) => {
                  return (
                    <div key={property.propertyID} className=" my-3 col-4">
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
                            <div className="position-absolute d-flex align-items-center gap-1 bottom-2 end-2">
                              <button className="text-muted fs-5 border-0 rounded" style={{ backgroundColor: "rgba(0, 0, 0, .65)" }} title="Like"
                                onClick={(e) => handleFavoriteClick(e, property.propertyID, user.UserId)}>
                                <i className="bi bi-heart text-white"></i>
                              </button>
                              <button className="text-muted fs-5 border-0 rounded" style={{ backgroundColor: "rgba(0, 0, 0, .65)" }} title="Share">
                                <i className="bi bi-share text-white"></i>
                              </button>
                            </div>
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
                              }}>{property.propertyTitle}</h5>
                            <br />
                            <p className="card-text text-muted"
                              style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "inline-block",
                                maxWidth: "95%",
                              }}>{property.propertyAddress}</p>
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

                        {/* Footer */}
                        <div className="d-flex justify-content-between align-items-center p-3 border-top">
                          {/* User Info */}
                          <Link to={'/Agent/' + property.userID} style={{ textDecoration: "none" }}>
                            <div className="d-flex align-items-center" key={property.userID}>
                              <img
                                src={property.userProfilePhoto || "https://via.placeholder.com/40"}
                                alt="User Avatar"
                                className="rounded-circle me-2"
                                style={{ width: "40px", height: "40px" }}
                              />
                              <h6 className="mb-0 text-dark">{property.userName}</h6>
                            </div>
                          </Link>

                          {/* Action Icons */}
                          <div className="d-flex align-items-center gap-1">
                            <i class="bi bi-clock-history"></i><span>{property.timeAgo}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>
      </div >
    </div >
  );
};

export default Property;
