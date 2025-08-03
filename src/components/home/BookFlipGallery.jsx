// components/BookFlipGallery.jsx
import React, { useRef, useEffect, useMemo } from "react";
import HTMLFlipBook from "react-pageflip";

const defaultImagePairs = [
  { image1: "/4edb8c38-39e2-40ff-9449-52246cf2a029.jpg" },
  { image1: "/f031e5b1caa0632b7cb3d2dc29294fc91b0a771f.png" },
  { image1: "/4edb8c38-39e2-40ff-9449-52246cf2a029.jpg" },
  { image1: "/f031e5b1caa0632b7cb3d2dc29294fc91b0a771f.png" },
];

const BookFlipGallery = () => {
  const imagePairs = useMemo(() => defaultImagePairs, []);
  const bookRef = useRef();

  // تقليب تلقائي كل 4 ثواني
  useEffect(() => {
    const interval = setInterval(() => {
      if (bookRef.current) {
        bookRef.current.pageFlip().flipNext();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center mt-10">
      <HTMLFlipBook
        width={500}
        height={400}
        size="fixed"
        minWidth={500}
        maxWidth={500}
        minHeight={400}
        maxHeight={400}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        ref={bookRef}
        className="book-shadow"
      >
        {imagePairs.map((img, index) => (
          <div
            key={index}
            className="flex items-center justify-center w-full h-full bg-white"
          >
            <img
              src={img.image1}
              alt={`Page ${index + 1}`}
              className="w-[500px] h-[400px] object-cover rounded shadow-md"
            />
          </div>
        ))}
      </HTMLFlipBook>
    </div>
  );
};

export default BookFlipGallery;
