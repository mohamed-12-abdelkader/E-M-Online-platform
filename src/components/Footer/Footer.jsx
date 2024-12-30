// components/Footer.jsx
import { FaVideo, FaYoutube } from "react-icons/fa";
import { IoIosPeople } from "react-icons/io";
import { FaTrophy } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdAdminPanelSettings } from "react-icons/md";
import { IoIosWallet } from "react-icons/io";

const Footer = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className='fixed bottom-0 w-full hidden mt-[] footer bg-[#03a9f5] border-t shadow-lg flex justify-between items-center px-6 py-4 z-10'>
      {user ? (
        <div className='flex justify-around w-full'>
          {/* Show only Admin Links */}
          {user.role === "admin" && (
            <>
              <Link
                to='/admin/management'
                className='flex flex-col items-center space-y-1 group'
              >
                <MdAdminPanelSettings className='text-xl text-white group-hover:scale-110 transition-transform duration-200' />
                <span className='text-white font-semibold group-hover:text-gray-200 transition-colors duration-200'>
                  لوحة التحكم
                </span>
              </Link>
              <Link
                to='/competitions'
                className='flex flex-col items-center space-y-1 group'
              >
                <FaTrophy className='text-xl text-white group-hover:scale-110 transition-transform duration-200' />
                <span className='text-white font-semibold group-hover:text-gray-200 transition-colors duration-200'>
                  المسابقات
                </span>
              </Link>
            </>
          )}

          {/* Show Teacher or other role Links */}
          {user.role === "teacher" && (
            <>
              <Link
                to='/my_groups'
                className='flex flex-col items-center space-y-1 group'
              >
                <IoIosPeople className='text-xl text-white group-hover:scale-110 transition-transform duration-200' />
                <span className='text-white font-semibold group-hover:text-gray-200 transition-colors duration-200'>
                  مجموعاتى
                </span>
              </Link>

              <Link
                to='/teacher_courses'
                className='flex flex-col items-center space-y-1 group'
              >
                <FaVideo className='text-xl text-white group-hover:scale-110 transition-transform duration-200' />
                <span className='text-white font-semibold group-hover:text-gray-200 transition-colors duration-200'>
                  كورساتى
                </span>
              </Link>

              <Link
                to='/admin/add_month'
                className='flex flex-col items-center space-y-1 group'
              >
                <MdAdminPanelSettings className='text-xl text-white group-hover:scale-110 transition-transform duration-200' />
                <span className='text-white font-semibold group-hover:text-gray-200 transition-colors duration-200'>
                  لوحة التحكم
                </span>
              </Link>

              <Link
                to='/teacher_wallet'
                className='flex flex-col items-center space-y-1 group'
              >
                <IoIosWallet className='text-xl text-white group-hover:scale-110 transition-transform duration-200' />
                <span className='text-white font-semibold group-hover:text-gray-200 transition-colors duration-200'>
                  محفظتى
                </span>
              </Link>
            </>
          )}

          {/* Show Links for non-teacher roles */}
          {user.role !== "admin" && user.role !== "teacher" && (
            <>
              <Link
                to='/teachers'
                className='flex flex-col items-center space-y-1 group'
              >
                <IoIosPeople className='text-xl text-white group-hover:scale-110 transition-transform duration-200' />
                <span className='text-white font-semibold group-hover:text-gray-200 transition-colors duration-200'>
                  المدرسين
                </span>
              </Link>

              <Link
                to='/my_courses'
                className='flex flex-col items-center space-y-1 group'
              >
                <FaVideo className='text-xl text-white group-hover:scale-110 transition-transform duration-200' />
                <span className='text-white font-semibold group-hover:text-gray-200 transition-colors duration-200'>
                  كورساتى
                </span>
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Footer;
