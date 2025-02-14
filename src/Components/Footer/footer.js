import { Link } from "react-router-dom";
import "./footer.css";
// Importing social media icons from react-icons
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="bodyF">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-3">
            <div className="fw-bold mb-2 text-center" style={{ fontFamily: "Azedo", fontSize: "25px" }}>
              Real Estate
            </div>
            <div style={{ fontSize: "13px", textAlign: "center" }}>
              Flr, Administrative Bldg, Central Rd, Chakala Wicel, Midc, Andheri (West), Mumbai, Maharashtra, 400093
            </div>
          </div>

          <div className="col-12 col-md-3">
            <div className="fw-bolder mb-3" style={{ fontSize: "20px", paddingLeft: "25px" }}>
              Explore
            </div>
            <div style={{ paddingTop: "5px", paddingLeft: "25px" }}>
              <Link className="footerlink" to="/">Home</Link>
            </div>
            <div style={{ paddingTop: "5px", paddingLeft: "25px" }}>
              <Link className="footerlink" to="/buy">Buy</Link>
            </div>
            <div style={{ paddingTop: "5px", paddingLeft: "25px" }}>
              <Link className="footerlink" to="/agent">Agent</Link>
            </div>
            <div style={{ paddingTop: "5px", paddingLeft: "25px" }}>
              <Link className="footerlink" to="/about-us">About</Link>
            </div>
          </div>

          <div className="col-12 col-md-3">
            <div>
              <Link className="footerlink" to="/contact">Contact Us</Link>
            </div>
            <hr style={{ width: "250px" }} />
            <div>
              <Link className="footerlink" to="/faq">FAQs</Link>
            </div>
          </div>

          <div className="col-12 col-md-2">
            <div className="fw-bolder mb-3" style={{ fontSize: "20px", paddingLeft: "25px" }}>
              Social Links
            </div>
            <div className="social-icons">
              <Link to="#" className="social-link">
                <FaFacebook className="icon" />
              </Link>
              <Link to="#" className="social-link">
                <FaTwitter className="icon" />
              </Link>
              <Link to="#" className="social-link">
                <FaLinkedin className="icon" />
              </Link>
              <Link to="#" className="social-link">
                <FaInstagram className="icon" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
