import {
  FaChalkboardTeacher,
  FaWallet,
  FaTrophy,
  FaBookReader,
  FaEdit,
  FaMedal,
  FaVideo
} from "react-icons/fa";
import {
  MdDashboard,
  MdEventNote,
  MdLogout,
  MdOutlineCategory,
  MdLibraryAdd,
  MdVideoLibrary,
  MdQuestionAnswer,
  MdEventAvailable,
  MdGrade,
  MdBookmark,
} from "react-icons/md";
import { BiListCheck, BiUserCircle } from "react-icons/bi";
import {
  AiOutlineForm,
  AiFillRead,
  AiOutlineFileDone,
  AiOutlineFileSearch,
  AiOutlineStar,
} from "react-icons/ai";
import { CiStreamOn } from "react-icons/ci";
import { GiTeacher, GiArchiveRegister } from "react-icons/gi";
import { FaSearch ,FaFacebook} from "react-icons/fa";
import UserType from "../../Hooks/auth/userType";
import { NavLink } from "react-router-dom";

const NavLinkItem = ({ to, Icon, label, onClick }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `font-semibold flex items-center ${
          isActive ? "text-blue-500" : "hover:text-blue-500"
        }`
      }
      onClick={onClick}
    >
      <Icon className='m-1 text-xl text-blue-500' />
      {label}
    </NavLink>
  </li>
);

const Links = ({ onClose }) => {
  const [userData, isAdmin, isTeacher, isStudent] = UserType();

  const handleLogout = () => {
    ["token", "user", "examAnswers", "examTimeLeft"].forEach((item) =>
      localStorage.removeItem(item)
    );
    window.location.href = "/login";
  };

  const commonLinks = [
    { to: "/home", Icon: MdDashboard, label: "الصفحة الرئيسية" },
  ];

  const adminLinks = [
    { to: "/stream-management", Icon: CiStreamOn, label: "إدارة البث المباشر" }, 
    { to: "/admin/management", Icon: MdDashboard, label: "لوحة التحكم" },
    { to: "/create_comp", Icon: AiOutlineForm, label: "إنشاء مسابقة" },
    { to: "/allComps", Icon: BiListCheck, label: "عرض المسابقات" },
    { to: "/create_exam", Icon: FaEdit, label: "إنشاء امتحان شهري" },
    { to: "/add_sub_exam", Icon: MdLibraryAdd, label: "إنشاء امتحان المادة" },
    {
      to: "/add_video_exam",
      Icon: MdVideoLibrary,
      label: "إضافة فيديو للامتحان",
    },
    {
      to: "/add_sup_questions",
      Icon: MdQuestionAnswer,
      label: "إضافة أسئلة للامتحان",
    },
    { to: "/view_exams", Icon: MdEventAvailable, label: "عرض الامتحانات" },
    { to: "/show_grades", Icon: MdGrade, label: "عرض درجات الامتحان" },
  ];

  const teacherLinks = [
    { to: "/admin/add_month", Icon: MdEventNote, label: "لوحة التحكم" },
    { to: "/my_groups", Icon: GiTeacher, label: "مجموعاتي" },
    { to: "/teacher_courses", Icon: FaBookReader, label: "كورساتي" },
    { to: "/teacher_wallet", Icon: FaWallet, label: "محفظتي" },
  ];

  const studentLinks = [
    { to: "/profile", Icon: BiUserCircle, label: "الملف الشخصي" },
   
    { to: "/teachers", Icon: FaSearch, label: "ابحث عن محاضرك " },
    { to: "/my-teachers", Icon: FaChalkboardTeacher, label: " محاضرينى   " },
    { to: "/view_exams", Icon: AiOutlineFileDone, label: "امتحانات المنصة" },
    { to: "/my_courses", Icon: FaBookReader, label: "كورساتي" },
    { to: "/question_bank", Icon: GiArchiveRegister, label: "بنك الأسئلة" },
    { to: "/results", Icon: AiOutlineFileSearch, label: "نتائج الامتحانات" },
    { to: "/competitions", Icon: FaTrophy, label: "المسابقات" },
    { to: "/the_Firsts", Icon: FaMedal, label: "أوائل المسابقات" },
    { to: "/save_posts", Icon: MdBookmark, label: "المنشورات المحفوظة" },
    { to: "/wallet", Icon: FaWallet, label: "محفظة الطالب" },
  ];

  return (
    <div className="mb-8">
      <ul className='space-y-4'>
        {commonLinks.map((link, idx) => (
          <NavLinkItem key={idx} {...link} onClick={onClose} />
        ))}

        {isAdmin &&
          adminLinks.map((link, idx) => (
            <NavLinkItem key={idx} {...link} onClick={onClose} />
          ))}

        {isTeacher &&
          teacherLinks.map((link, idx) => (
            <NavLinkItem key={idx} {...link} onClick={onClose} />
          ))}

        {isStudent &&
          studentLinks.map((link, idx) => (
            <NavLinkItem key={idx} {...link} onClick={onClose} />
          ))}

        <li className='my-3'>
          <div
            onClick={() => {
              handleLogout();
              onClose();
            }}
            className='font-semibold flex items-center hover:text-blue-500 cursor-pointer'
          >
            <MdLogout className='m-1 text-xl text-red-500' />
            تسجيل الخروج
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Links;
