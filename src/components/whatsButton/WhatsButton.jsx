import { IoLogoWhatsapp } from "react-icons/io";
import { FaRobot } from "react-icons/fa";
import React from "react";
import { Link } from "react-router-dom";

const WhatsButton = () => {
  const handleWhatsappClick = () => {
    const phoneNumber = "+201111272393";
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleAiClick = () => {
    // انتقل إلى صفحة الذكاء الاصطناعي
    window.location.href = "/ai";
  };

  return (
    <div className="fixed bottom-5 right-5 flex flex-col items-center gap-3 z-50">
      {/* زر الذكاء الاصطناعي */}
     

      {/* زر الواتساب */}
      <button
        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition"
        onClick={handleWhatsappClick}
        aria-label="Contact via WhatsApp"
      >
        <IoLogoWhatsapp className="text-2xl" />
      </button>
    </div>
  );
};

export default WhatsButton;
