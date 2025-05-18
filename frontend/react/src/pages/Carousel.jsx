import React, { useState, useEffect } from "react";

function Carousel({ images }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  // Auto-advance every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval); // Cleanup
  }, [currentSlide, images.length]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const getCarouselSize = () => {
    if (dimensions.width >= 1024) return 'w-full max-w-4xl';
    else if (dimensions.width >= 768) return 'w-full max-w-2xl';
    else return 'w-full';
  };

  const getAspectRatio = () => 'aspect-[1/1]';

  const getButtonSize = () => (dimensions.width < 640 ? 'p-1' : 'p-2');

  return (
    <div className={`mx-auto bg-gray-100 rounded-lg overflow-hidden relative shadow-2xl ${getCarouselSize()}`}>
      <div className={`relative ${getAspectRatio()}`}>
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={img}
              alt={`collection${index}`}
              className="w-full h-full object-contain bg-white"
            />
          </div>
        ))}

        {/* Navigation buttons */}
        <button
          onClick={goToPrevSlide}
          className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-white ${getButtonSize()} rounded-full hover:bg-black/70 transition-colors`}
          aria-label="Previous slide"
        >
          <svg width={dimensions.width < 640 ? 20 : 24} height={dimensions.width < 640 ? 20 : 24} stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          onClick={goToNextSlide}
          className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-white ${getButtonSize()} rounded-full hover:bg-black/70 transition-colors`}
          aria-label="Next slide"
        >
          <svg width={dimensions.width < 640 ? 20 : 24} height={dimensions.width < 640 ? 20 : 24} stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-1 md:space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-colors ${
                currentSlide === index ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Carousel;
