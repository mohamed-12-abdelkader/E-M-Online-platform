import React from "react";
import { Link, Outlet } from "react-router-dom";
import { IoIosPeople, IoMdHome } from "react-icons/io";
import { FaVideo, FaWallet } from "react-icons/fa";
import { MdVideoLibrary } from "react-icons/md";
import { FaClipboardQuestion } from "react-icons/fa6";
import { PiExamFill } from "react-icons/pi";
import { IoPerson } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";
import { FaTrophy } from "react-icons/fa";
import { FaMedal } from "react-icons/fa";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";
import Links from "../../components/links/Links";
const HomeLogin = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className='flex flex-row-reverse'>
      {" "}
      {/* تم اضافة flex-row-reverse هنا */}
      {/* Sidebar */}
      <div className='hidden md:block w-[22%] h-screen fixed top-0 right-0 mt-[20px]  z-30 bg-[#edf2f7] shadow-lg p-4 pt-[80px]'>
        {" "}
        <h1 className='my-5 font-bold text-xl'>
          {" "}
          اهلا : {user.name || user.fname + "" + user.lname}
        </h1>
        {/* تم تغيير left إلى right */}
        <Links />
      </div>
      {/* Main Content */}
      <div className='flex-1 mt-[80px]  md:mr-[20%] w-full'>
        {" "}
        {/* تم تغيير ml إلى mr */}
        <Outlet />
      </div>
    </div>
  );
};

export default HomeLogin;
