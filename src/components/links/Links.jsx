import {
  FaBookOpen,
  FaChalkboardTeacher,
  FaMedal,
  FaTrophy,
  FaWallet,
} from "react-icons/fa";
import { FaClipboardQuestion } from "react-icons/fa6";
import { IoIosLogOut, IoMdHome } from "react-icons/io";
import { MdVideoLibrary } from "react-icons/md";
import { PiExamFill } from "react-icons/pi";
import { Link } from "react-router-dom";
import { AiFillStar } from "react-icons/ai";
import { IoPerson } from "react-icons/io5";
import UserType from "../../Hooks/auth/userType";
import { MdAdminPanelSettings } from "react-icons/md";
import { GrGroup } from "react-icons/gr";

const Links = ({ onClose }) => {
  const [userData, isAdmin, isTeacher, isStudent] = UserType();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div>
      <ul className="space-y-4">
        <li>
          <Link
            to="/home"
            className="text-gray-700 font-semibold flex hover:text-blue-500"
            onClick={onClose}
          >
            <IoMdHome className="m-1 text-xl text-blue-500" />
            الصفحة الرئيسية
          </Link>
        </li>
        {isAdmin && (
          <li>
            <Link
              to="/admin/management"
              className="text-gray-700 font-semibold flex hover:text-blue-500"
              onClick={onClose}
            >
              <MdAdminPanelSettings className="m-1 text-xl text-blue-500" />
              لوحة التحكم
            </Link>
          </li>
        )}
        {isTeacher && (
          <div>
            <li className="my-3">
              <Link
                to="/admin/add_month"
                className="text-gray-700 font-semibold flex hover:text-blue-500"
                onClick={onClose}
              >
                <MdAdminPanelSettings className="m-1 text-xl text-blue-500" />
                لوحة التحكم
              </Link>
            </li>
            <li className="my-3">
              <Link
                to="/my_groups"
                className="text-gray-700 font-semibold flex hover:text-blue-500"
                onClick={onClose}
              >
                <GrGroup className="m-1 text-xl text-blue-500" />
                مجموعاتى
              </Link>
            </li>
            <li className="my-3">
              <Link
                to="/teacher_courses"
                className="text-gray-700 font-semibold flex hover:text-blue-500"
                onClick={onClose}
              >
                <FaBookOpen className="m-1 text-xl text-blue-500" />
                كورساتى
              </Link>
            </li>
            <li className="my-3">
              <Link
                to="/teacher_wallet"
                className="text-gray-700 font-semibold flex hover:text-blue-500"
                onClick={onClose}
              >
                <FaWallet className="m-1 text-xl text-blue-500" />
                محفظتى
              </Link>
            </li>
          </div>
        )}
        {isStudent && (
          <div>
            <li className="my-3">
              <Link
                to="/teachers"
                className="text-gray-700 font-semibold flex hover:text-blue-500"
                onClick={onClose}
              >
                <FaChalkboardTeacher className="m-1 text-xl text-blue-500" />
                المدرسين
              </Link>
            </li>
            <li className="my-3">
              <Link
                to="/my_courses"
                className="text-gray-700 font-semibold flex hover:text-blue-500"
                onClick={onClose}
              >
                <FaBookOpen className="m-1 text-xl text-blue-500" />
                كورساتى
              </Link>
            </li>
            <li className="my-3">
              <Link
                to="/profile"
                className="text-gray-700 font-semibold flex hover:text-blue-500"
                onClick={onClose}
              >
                <IoPerson className="m-1 text-xl text-blue-500" />
                الملف الشخصى
              </Link>
            </li>
            <li className="my-3">
              <Link
                to="/wallet"
                className="text-gray-700 font-semibold flex hover:text-blue-500"
                onClick={onClose}
              >
                <FaWallet className="m-1 text-xl text-blue-500" />
                محفظة الطالب
              </Link>
            </li>
            <li className="my-3">
              <Link
                to="/free_courses"
                className="text-gray-700 font-semibold flex hover:text-blue-500"
                onClick={onClose}
              >
                <MdVideoLibrary className="m-1 text-xl text-blue-500" />
                الكورسات المجانية
              </Link>
            </li>
            <li className="my-3">
              <Link
                to="/question_bank"
                className="text-gray-700 font-semibold flex hover:text-blue-500"
                onClick={onClose}
              >
                <FaClipboardQuestion className="m-1 text-xl text-blue-500" />
                بنك الاسئلة
              </Link>
            </li>
            <li className="my-3">
              <Link
                to="/results"
                className="text-gray-700 font-semibold flex hover:text-blue-500"
                onClick={onClose}
              >
                <PiExamFill className="m-1 text-xl text-blue-500" />
                نتائج الامتحانات
              </Link>
            </li>
            <li className="my-3">
              <Link
                to="/competitions"
                className="text-gray-700 font-semibold flex hover:text-blue-500"
                onClick={onClose}
              >
                <FaTrophy className="m-1 text-xl text-blue-500" />
                المسابقات
              </Link>
            </li>
            <li className="my-3">
              <Link
                to="/the_Firsts"
                className="text-gray-700 font-semibold flex hover:text-blue-500"
                onClick={onClose}
              >
                <FaMedal className="m-1 text-xl text-blue-500" />
                اوائل المسابقات
              </Link>
            </li>
            <li className="my-3">
              <Link
                to="/save_posts"
                className="text-gray-700 font-semibold flex hover:text-blue-500"
                onClick={onClose}
              >
                <AiFillStar className="m-1 text-xl text-blue-500" />
                المنشورات المحفوظة
              </Link>
            </li>
          </div>
        )}

        <li className="my-3">
          <div
            onClick={() => {
              handleLogout();
              onClose();
            }}
            style={{ cursor: "pointer" }}
            className="text-gray-700 font-semibold flex hover:text-blue-500"
          >
            <IoIosLogOut className="m-1 text-xl text-red-500" />
            تسجيل الخروج
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Links;
