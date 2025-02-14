import React, { useEffect, useState } from 'react';
import './Home.css';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { decodeJwt, getJWTFromSession } from '../Login/GetAuth';
import Footer from '../Footer/footer';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Swal from 'sweetalert2';
import moment from 'moment';

function Home() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [agents, setAgents] = useState([]);
    const [user, setUser] = useState({});
    const [isLogin, setIsLogin] = useState(false);
    const [allProperty,setAllProperty] = useState();
    const [categories, setCategories] = useState([
        { name: "Apartment", image: "https://main.wpresidence.net/wp-content/uploads/2014/05/white_living.webp", listings: 0, col: 6 },
        { name: "Condo", image: "https://main.wpresidence.net/wp-content/uploads/2014/05/4.3-2-980x682.webp", listings: 0, col: 3 },
        { name: "Duplexe", image: "https://main.wpresidence.net/wp-content/uploads/2014/06/2.1-1-980x682.webp", listings: 0, col: 3 },
        { name: "House", image: "https://main.wpresidence.net/wp-content/uploads/2017/01/9.4.webp", listings: 0, col: 3 },
        { name: "Office", image: "https://main.wpresidence.net/wp-content/uploads/2017/01/9.6-980x682.webp", listings: 0, col: 3 },
        { name: "Villa", image: "https://main.wpresidence.net/wp-content/uploads/2017/11/9.1.webp", listings: 0, col: 6 },
    ]);

    const getData = () => {
        axios
            .get("/api/Property/GetAllProperties")
            .then((res) => {
                if (!res.data || res.data.length === 0) {
                    console.error("No data received from API");
                    setIsLoading(false);
                    setIsError(true);
                    return;
                }

                console.log("API Response:", res.data);
                setAllProperty(res.data)
                const sortedProperties = res.data.sort((a, b) => {
                    const dateA = a.CreatedAt ? new Date(a.CreatedAt) : 0;
                    const dateB = b.CreatedAt ? new Date(b.CreatedAt) : 0;
                    return dateB - dateA;
                });

                const updatedProperties = sortedProperties.map((property) => {
                    const now = moment();
                    const buildDate = property.buildYear ? moment(property.buildYear) : null;

                    let timeAgo = "Unknown";

                    if (buildDate && buildDate.isValid()) {
                        const diffDays = now.diff(buildDate, "days");
                        const diffMonths = now.diff(buildDate, "months");
                        const diffYears = now.diff(buildDate, "years");

                        if (diffDays < 30) {
                            timeAgo = `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
                        } else if (diffMonths < 12) {
                            timeAgo = `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
                        } else {
                            timeAgo = `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
                        }
                    }

                    return {
                        ...property,
                        timeAgo,
                    };
                });
                setProperties(updatedProperties.slice(0, 6));
                setIsLoading(false);
                setIsError(false);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
                setIsError(true);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        if (properties.length > 0) {
            // Count occurrences of each property type
            console.log(properties);
            
            const categoryCount = allProperty.reduce((acc, property) => {
                const type = property.propertyType?.trim().toLowerCase(); // Normalize casing
                if (type) {
                    acc[type] = (acc[type] || 0) + 1;
                }
                return acc;
            }, {});
    
            console.log("Category Count:", categoryCount); // Debugging output
    
            // Update categories with flexible matching using .includes()
            setCategories((prevCategories) =>
                prevCategories.map((category) => {
                    const categoryName = category.name.toLowerCase();
                    
                    // Find matching property types using .includes()
                    const matchingType = Object.keys(categoryCount).find(type => type.includes(categoryName));
    
                    return {
                        ...category,
                        listings: matchingType ? categoryCount[matchingType] : 0, // Set count if found
                    };
                })
            );
    
            console.log("Updated Categories:", categories); // Debugging output
        }
    }, [properties]);
      

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await axios.get('/api/User/GetAllUsers');
                setAgents(response.data);
            } catch (error) {
                console.error('Error fetching agents:', error);
            }
        };

        fetchAgents();
    }, []);

    useEffect(() => {
        const jwt = getJWTFromSession();
        if (jwt) {
            const decodedUser = JSON.parse(decodeJwt(jwt));
            setUser(decodedUser);
            setIsLogin(true);
        }
        getData();
    }, []);

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

    function SampleNextArrow(props) {
        const { className, style, onClick } = props;
        return (
            <span
                style={{
                    ...style,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "#fff",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    position: "absolute",
                    right: "-50px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 10,
                }}
                onClick={onClick}
            >
                <i className="bi bi-chevron-right fs-3"></i>
            </span>
        );
    }

    function SamplePrevArrow(props) {
        const { className, style, onClick } = props;
        return (
            <span
                style={{
                    ...style,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0, 0, 0, 0.5)",
                    color: "#fff",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    position: "absolute",
                    left: "-50px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 10,
                }}
                onClick={onClick}
            >
                <i className="bi bi-chevron-left fs-3"></i>
            </span>
        );
    }
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 1500,
        pauseOnHover: true,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        responsive: [
            {
                breakpoint: 1000,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 750,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    const agentSliderSettings = {
        dots: true,
        infinite: true,
        speed: 800,
        slidesToShow: 5,
        slidesToScroll: 2,
        autoplay: true,
        autoplaySpeed: 2000,
        pauseOnHover: true,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    const [searchText, setSearchText] = useState();
    const handleSearch = () => {
        if (searchText.trim() !== "") {
            const encodedQuery = encodeURIComponent(searchText);
            console.log("Navigating to:", `/property?query=${encodedQuery}`);
            navigate(`/property?query=${encodedQuery}`);
        }
    };

    return (
        <div className="hero" style={{ marginBottom: "220px" }}>
            <div className="container">
                <div className="row justify-content-center align-items-center">
                    <div
                        className="col-lg-9 text-center"
                        style={{
                            background: 'linear-gradient(135deg, rgba(50, 50, 50, 0.8), rgba(240, 240, 240, 0.9))',
                            borderRadius: '15px',
                            padding: '20px 30px',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <h1 className="heading aos-init aos-animate" data-aos="fade-up" style={{ fontSize: '2.5rem', color: '#fff' }}>
                            Easiest way to find your dream home
                        </h1>
                        <div
                            className="form-search d-flex flex-column flex-md-row align-items-center justify-content-center mb-3 aos-init aos-animate"
                            style={{ gap: '10px' }}
                        >
                            <div className="input-group w-100" style={{ maxWidth: '500px' }}>
                                <input
                                    type="text"
                                    className="form-control px-4"
                                    placeholder="Enter Title name"
                                    aria-label="Search"
                                    style={{ fontSize: '1.1rem', padding: '10px' }}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '1.2rem',
                                    transition: 'background-color 0.3s ease',
                                }}
                                onClick={handleSearch}
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card card-body" style={{ paddingBottom: "30px", margin: '270px 5px 0 5px' }}>
                <div style={{ margin: '0 10px 0 10px' }}>
                    <div className="d-flex justify-content-between">
                        <h3>Recent Properties</h3>
                        <NavLink className="btn btn-primary p-2" to={'/property'}>
                            See All Property
                        </NavLink>
                    </div>
                    {(isLoading && properties.length === 0) || isError ? (
                        <p>Loading properties...</p>
                    ) : (
                        <Slider {...sliderSettings} style={{ margin: "0px 50px" }}>
                            {properties.map((property) => (
                                <div className='container row property-card'>
                                    <div key={property.propertyID} className="my-2">
                                        <div
                                            className="card mx-auto"
                                            style={{
                                                maxWidth: '100%',
                                                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                                                borderRadius: '8px',
                                            }}
                                        >
                                            <Link
                                                className="text-decoration-none text-dark fw-bold"
                                                to={'/property/' + property.propertyID}
                                                title={property.propertyTitle}
                                            >

                                                <div className="position-relative overflow-hidden rounded-top">
                                                    <div className="position-absolute top-0 start-0 bg-primary text-white badge rounded-pill mt-2 ms-2 fs-6">
                                                        {property.transactionType}
                                                    </div>
                                                    <img
                                                        src={
                                                            property.images[0]?.imageURL ||
                                                            'https://i.ibb.co/rHN5ZY6/images-q-tbn-ANd9-Gc-Qs-Ah-Tu0y-Kq27-NDXYTd-Jbc9ofxy-F8-WURal9-GA-s.jpg'
                                                        }
                                                        alt="Property"
                                                        className="img-fluid w-100"
                                                        style={{ height: '250px', objectFit: 'cover' }}
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
                                                    <h5
                                                        className="card-title"
                                                        style={{
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: 'inline-block',
                                                            maxWidth: '95%',
                                                        }}
                                                    >
                                                        {property.propertyTitle}
                                                    </h5>
                                                    <br />
                                                    <p
                                                        className="card-text text-muted"
                                                        style={{
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: 'inline-block',
                                                            maxWidth: '95%',
                                                        }}
                                                    >
                                                        {property.propertyAddress}
                                                    </p>
                                                    <div className="text-primary fw-bold fs-5">
                                                        ${property.propertyPrice}
                                                    </div>
                                                </div>
                                            </Link>

                                            <ul className="list-group list-group-flush">
                                                <li
                                                    className="list-group-item"
                                                    style={{
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: 'inline-block',
                                                        maxWidth: '95%',
                                                    }}
                                                >
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

                                            {/* Footer */}
                                            <div className="d-flex justify-content-between align-items-center p-3 border-top">
                                                {/* User Info */}
                                                <Link to={'/Agent/' + property.userID} style={{ textDecoration: 'none' }}>
                                                    <div className="d-flex align-items-center" key={property.userID}>
                                                        <img
                                                            src={property.userProfilePhoto || 'https://via.placeholder.com/40'}
                                                            alt="User Avatar"
                                                            className="rounded-circle me-2"
                                                            style={{ width: '40px', height: '40px' }}
                                                        />
                                                        <h6 className="mb-0 text-dark">{property.userName}</h6>
                                                    </div>
                                                </Link>
                                                <div className="d-flex align-items-center gap-1">
                                                    <i class="bi bi-clock-history"></i><span>{property.timeAgo}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    )}
                </div>
            </div>

            {/* Agents */}
            <div className="card card-body" style={{ paddingBottom: "30px", margin: '10px 5px 0 5px' }}>
                <div style={{ margin: '0 10px 0 10px' }}>
                    <div className="d-flex justify-content-between">
                        <h3>Recent Agents</h3>
                        <NavLink className="btn btn-primary p-2" to={'/agents'}>
                            See All Agents
                        </NavLink>
                    </div>
                    {(isLoading && agents.length === 0) || isError ? (
                        <p>Loading agents...</p>
                    ) : (
                        <Slider {...agentSliderSettings} style={{ margin: "0px 50px" }}>
                            {
                                agents
                                    .filter((agent) => agent.userRole.toLowerCase() === 'agent')
                                    .map((agent) => (
                                        <div key={agent.userID} className='p-2'>
                                            <Link to={'/Agent/' + agent.userID} className="text-decoration-none">
                                                <div
                                                    className="card agent-card h-100"
                                                    style={{
                                                        border: '1px solid #e0e0e0',
                                                        borderRadius: '10px',
                                                        overflow: 'hidden',
                                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                                    }}
                                                >
                                                    <img
                                                        src={agent.profilePhoto || 'https://placehold.jp/150x150.png'}
                                                        alt={agent.firstName}
                                                        className="card-img-top agent-img"
                                                        style={{
                                                            height: '200px',
                                                            objectFit: 'cover',
                                                            borderTopLeftRadius: '10px',
                                                            borderTopRightRadius: '10px',
                                                        }}
                                                    />

                                                    {/* Card Body */}
                                                    <div className="card-body text-center">
                                                        <h5 className="card-title mb-1" style={{ fontSize: '1.25rem', color: '#333' }}>
                                                            {agent.firstName} {agent.lastName}
                                                        </h5>
                                                        <p className="card-text text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                                                            {agent.userRole}
                                                        </p>
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <a
                                                                href="#"
                                                                className="btn btn-outline-primary btn-sm"
                                                                style={{ fontSize: '0.8rem' }}
                                                            >
                                                                <div className="d-flex align-items-center gap-1">
                                                                    <i className="bi bi-envelope" style={{ fontSize: "12px" }}></i>
                                                                    <span>Contact</span>
                                                                </div>
                                                            </a>
                                                            <Link
                                                                to={'/Agent/' + agent.userID}
                                                                href="#"
                                                                className="btn btn-outline-secondary btn-sm"
                                                                style={{ fontSize: '0.8rem' }}
                                                            >
                                                                <div className="d-flex align-items-center gap-1">
                                                                    <i className="bi bi-info-circle" style={{ fontSize: "12px" }}></i>
                                                                    <span>Details</span>
                                                                </div>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="card-footer bg-light text-center"
                                                        style={{ borderTop: '1px solid #e0e0e0' }}
                                                    >
                                                        <small className="text-muted">
                                                            <i className="bi bi-star-fill text-warning"></i> 4.5 (25 Reviews)
                                                        </small>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))
                            }
                        </Slider>
                    )}
                </div>
            </div>

            <div className='card card-body' style={{ paddingBottom: "30px", margin: '10px 5px 0 5px' }}>
                <div style={{ margin: '0 10px 0 10px' }}>
                    <h3 className="text-center">Properties by Category</h3>
                    <div className="row g-4 mt-1">
                        {categories.map((category, index) => (
                            <div className={`col-md-${category.col} col-sm-6 category-card`} key={index}>
                                <Link to={`/property?propertyType=${encodeURIComponent(category.name)}`} className="text-decoration-none">
                                    <div className="card border-0 shadow overflow-hidden position-relative">
                                        <img src={category.image} className="card-img-top" alt={category.name} style={{ height: "200px", objectFit: "cover" }} />
                                        <div className="card-img-overlay d-flex flex-column justify-content-between p-3">
                                            <div>
                                                <h5 className="text-white fw-bold badge badge-pill badge-primary">{category.name + "s"}</h5>
                                            </div>
                                            <span className="text-white">{category.listings} listings</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;