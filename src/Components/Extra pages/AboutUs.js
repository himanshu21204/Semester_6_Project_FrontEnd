import './aboutUS.css'
import { Link } from 'react-router-dom'
import aboutPhoto from '../../assets/img/about-img.png'

const AboutUs = () => {
    return (
        <>
            <div className="main">
                <div className="container">
                <h1 className=''>About Us</h1>
                <div className='bodyab row'>
                    <div className='text col'>We're on a Mission to Change
                        View of Real Estate Field.</div>
                    <div className='col'>
                        <div className='subtext row'>
                            It doesn’t matter how organized you are — a surplus of toys will always ensure your house is a mess waiting to happen. Fortunately, getting kids on board with the idea of ditching their stuff is a lot easier than it sounds.
                        </div>
                        <div className='subtext row'>Maecenas quis viverra metus, et efficitur ligula. Nam congue augue et ex congue, sed luctus lectus congue. Integer convallis condimentum sem. Duis elementum tortor eget condimentum tempor. Praesent sollicitudin lectus ut pharetra pulvinar.</div>
                    </div>
                </div>
                <div className='row bodyab'>
                    <img className='aboutimg' alt="" src={aboutPhoto}></img>
                </div>
                <div className='bodyab row'>
                    <div className='col' style={{ textAlign: "center", fontSize: "42px", fontWeight: "600" }}>4M</div>
                    <div className='col' style={{ textAlign: "center", fontSize: "42px", fontWeight: "600" }}>7M</div>
                    <div className='col' style={{ textAlign: "center", fontSize: "42px", fontWeight: "600" }}>12M</div>
                </div>
                <div className='bodyab row' style={{ paddingTop: "0" }}>
                    <div className='col' style={{ textAlign: "center" }}>Awward Winning</div>
                    <div className='col' style={{ textAlign: "center" }}>Property Ready</div>
                    <div className='col' style={{ textAlign: "center" }}>Happy Customer</div>
                </div>
                <div className='bodyab row'>
                    <div className='col'>
                        <div className='text' style={{ textAlign: "center" }}>Need help? Talk to our expert.</div>
                    </div>
                    <div className='col' >
                        <div className='row'>
                            <div className='col'></div>
                            <div className='col' style={{ margin: "11px 10px 8px 8px" }}><Link to="/contactUs"><div className='btn btn-white' style={{ padding: "13px", border: "1px solid black" }}>Contact Us </div></Link></div>
                            <div className='col' style={{ margin: "11px 10px 8px 8px" }}><Link to="#"><div className='btn btn-white bg-black text-white' style={{ padding: "13px", border: "1px solid black" }}> 9986758464 </div></Link></div>
                            <div className='col'></div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
};

export default AboutUs;