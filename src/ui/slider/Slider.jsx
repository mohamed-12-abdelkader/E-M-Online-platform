import { useRef, useState } from "react";
import { GoChevronRight, GoChevronLeft, GoCode } from "react-icons/go";

const Slider = ({ title, children }) => {
  const sliderRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDown(true);
    sliderRef.current.classList.add("active");
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
    sliderRef.current.classList.remove("active");
  };

  const handleMouseUp = () => {
    setIsDown(false);
    sliderRef.current.classList.remove("active");
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Adjust scroll speed if needed
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e) => {
    setIsDown(true);
    sliderRef.current.classList.add("active");
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchEnd = () => {
    setIsDown(false);
    sliderRef.current.classList.remove("active");
  };

  const handleTouchMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Adjust scroll speed if needed
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div dir='rtl' className='slider my-[50px] relative '>
      <div
        className='slider-container overflow-x-auto whitespace-nowrap flex'
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        style={{ width: "95%", margin: "auto" }}
      >
        {children}
      </div>
      <button
        className='slide-btn prev bg-blue-500 h-[50px] w-[30px] flex justify-center items-center absolute top-1/2 left-0 transform -translate-y-1/2 z-10'
        onClick={() =>
          (sliderRef.current.scrollLeft -= sliderRef.current.offsetWidth)
        }
        style={{
          height: "50px",
          width: "50px",
          borderRadius: "50%",
        }}
      >
        <GoChevronLeft className='text-white' />
      </button>

      <button
        className='slide-btn next bg-blue-500  h-[50px] w-[30px] flex justify-center items-center absolute top-1/2 right-0 transform -translate-y-1/2 z-10'
        onClick={() =>
          (sliderRef.current.scrollLeft += sliderRef.current.offsetWidth)
        }
        style={{
          height: "50px",
          width: "50px",
          borderRadius: "50%",
        }}
      >
        <GoChevronRight className='text-white text-2xl' />
      </button>
    </div>
  );
};

export default Slider;
