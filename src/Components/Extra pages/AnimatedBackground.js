import React, { useEffect, useState } from "react";
import "./AnimatedBackground.css"; // Import custom CSS

const AnimatedBackground = () => {
  const [imageIndex, setImageIndex] = useState(0);
  const images = [
    "https://i.ibb.co/sJgBfYj8/modern-interior-design-decorative-background-house-apartment-office-hotel-living-room-comfortable-so.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkkKzevt3ofEGpWXB9VIllOiMm4tTLjzYFcg&s",
    "https://i.ibb.co/NnL0pHsc/img-for-back.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="background-container">
      {images.map((image, index) => (
        <div
          key={index}
          className={`background ${imageIndex === index ? "zoom-in" : "fade-out"}`}
          style={{ backgroundImage: `url(${image})` }}
        >
          {/* Overlay for better text visibility */}
          <div className="overlay"></div>
        </div>
      ))}
    </div>
  );
};

export default AnimatedBackground;
