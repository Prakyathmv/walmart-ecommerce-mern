import React, { useState, useEffect, useCallback } from "react";
import { BsChevronLeft, BsChevronRight, BsPauseFill, BsPlayFill } from "react-icons/bs";
import "./Carousel.css";

export const Carousel = ({ data }) => {
  const [slide, setSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState("next");

  const goToSlide = useCallback(
    (newIndex, dir = "next") => {
      if (isAnimating) return;
      setDirection(dir);
      setIsAnimating(true);
      setTimeout(() => {
        setSlide(newIndex);
        setIsAnimating(false);
      }, 400);
    },
    [isAnimating]
  );

  const nextSlide = useCallback(() => {
    goToSlide(slide === data.length - 1 ? 0 : slide + 1, "next");
  }, [slide, data.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(slide === 0 ? data.length - 1 : slide - 1, "prev");
  }, [slide, data.length, goToSlide]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [isPlaying, nextSlide]);

  return (
    <div className="walmart-carousel">
      {}
      <div className={`walmart-carousel__track ${isAnimating ? `walmart-carousel__track--${direction}` : ""}`}>
        {data.map((item, idx) => (
          <div
            key={idx}
            className={`walmart-carousel__slide ${slide === idx ? "walmart-carousel__slide--active" : ""}`}
            aria-hidden={slide !== idx}
          >
            <img
              src={item.src}
              alt={item.alt || `Slide ${idx + 1}`}
              className="walmart-carousel__image"
            />
          </div>
        ))}
      </div>

      {}
      <div className="walmart-carousel__controls">
        <button
          className="walmart-carousel__btn"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <BsChevronLeft />
        </button>
        <button
          className="walmart-carousel__btn walmart-carousel__btn--pause"
          onClick={() => setIsPlaying((p) => !p)}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <BsPauseFill /> : <BsPlayFill />}
        </button>
        <button
          className="walmart-carousel__btn"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <BsChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Carousel;
