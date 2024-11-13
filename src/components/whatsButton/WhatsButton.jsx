import { IoLogoWhatsapp } from "react-icons/io";
import React from "react";

const WhatsButton = () => {
  const handleWhatsappClick = () => {
    // Replace `123456789` with the phone number you want to chat with
    const phoneNumber = "+201111272393";
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div>
      <button className="fixed-button" onClick={handleWhatsappClick}>
        <IoLogoWhatsapp className="text-green-500 text-5xl" />
      </button>
    </div>
  );
};

export default WhatsButton;
