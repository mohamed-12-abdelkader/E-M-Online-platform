import {
  MdDashboard,
  MdLiveTv,
  MdGroups,
  MdMenuBook,
  MdAccountBalanceWallet,
  MdLibraryBooks,
  MdForum,
  MdAssignment,
  MdEmojiEvents,
  MdLeaderboard,
  MdDateRange,
  MdVideoLibrary,
  MdQuiz,
  MdEventAvailable,
  MdGrading,
  MdPerson,
  MdSearch,
  MdPeople,
  MdQuestionAnswer,
  MdAssessment,
  MdStars,
  MdMilitaryTech,
  MdBookmark,
  MdLogout,
  MdInventory,
  MdHome,
  MdPublic,
  MdSchedule
} from "react-icons/md";
import { FaFistRaised  } from "react-icons/fa";
import UserType from "../../Hooks/auth/userType";
import { NavLink } from "react-router-dom";


const NavLinkItem = ({ to, Icon, label, onClick, isSidebarOpen }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `font-semibold flex items-center p-2 rounded-md ${
          isActive ? "text-blue-500 bg-blue-100" : "hover:text-blue-500 hover:bg-blue-50"
        }`
      }
      onClick={onClick}
    >
      <Icon className="w-5 h-5 text-blue-500" />
      <span className={`ml-3 ${isSidebarOpen ? "block" : "hidden"} mx-2`}>{label}</span>
    </NavLink>
  </li>
);

const Links = ({ isSidebarOpen, setIsSidebarOpen, onClose }) => {
  const [userData, isAdmin, isTeacher, isStudent] = UserType();

  const handleLogout = () => {
    ["token", "user", "examAnswers", "examTimeLeft"].forEach((item) =>
      localStorage.removeItem(item)
    );
    window.location.href = "/login";
  };

  const commonLinks = [
    { to: "/home", Icon: MdHome, label: "الصفحة الرئيسية" },
  ];

  const adminLinks = [
    { to: "/streams", Icon: MdLiveTv, label: "البث المباشر" }, 
    { to: "/admin/management", Icon: MdDashboard, label: "لوحة التحكم" },
    { to: "/teamChat", Icon: MdForum, label: "دردشة الفريق" },
    { to: "/all_students", Icon: MdPeople, label: " كل الطلاب" },
    { to: "/social", Icon: MdPublic, label: "EM Social" },
    { to: "/packages-management", Icon: MdInventory, label: "إدارة الباقات" },
    { to: "/tasks", Icon: MdAssignment, label: "المهام" },
    { to: "/question-bank-dashboard", Icon: MdLibraryBooks, label: "لوحة تحكم بنك الأسئلة" },
    { to: "/create_comp", Icon: MdEmojiEvents, label: "إنشاء مسابقة" },
    { to: "/allComps", Icon: MdLeaderboard, label: "عرض المسابقات" },
    { to: "/create_exam", Icon: MdDateRange, label: "إنشاء امتحان شهري" },
    { to: "/add_sub_exam", Icon: MdQuiz, label: "إنشاء امتحان المادة" },
    { to: "/add_video_exam", Icon: MdVideoLibrary, label: "إضافة فيديو للامتحان" },
    { to: "/add_sup_questions", Icon: MdQuestionAnswer, label: "إضافة أسئلة للامتحان" },
    { to: "/view_exams", Icon: MdEventAvailable, label: "عرض الامتحانات" },
    { to: "/show_grades", Icon: MdGrading, label: "عرض درجات الامتحان" },
    { to: "/leagues", Icon: MdLeaderboard, label: "إدارة الدوريات" },
  ];

  const teacherLinks = [
    { to: "/suggested-teachers", Icon: MdGroups, label: "المدرسين المقترحة "},
    { to: "/QuestionLibraryPage", Icon: MdLibraryBooks, label: "مكتبة الأسئلة" },
    { to: "/Teacher_subjects", Icon: MdQuestionAnswer, label: " بنك الاسئله  " },
    { to: "/center_groups", Icon: MdGroups, label: "سيستم إدارة السنتر" },
    { to: "/TeacherChat", Icon: MdForum, label: " الرسائل " },
    { to: "/social", Icon: MdPublic, label: "EM Social" },
  ];

     const studentLinks = [
    { to: "/profile", Icon: MdPerson, label: "الملف الشخصي" },
    { to: "/challenge_EM_Academy", Icon: FaFistRaised , label: "تحدي EM Academy" },
    { to: "/exam_grades", Icon: MdGrading, label: "درجات الامتحانات" },
    { to: "/lectures_taple", Icon: MdSchedule, label: " جدول المحاضرات" },
    { to: "/teachers", Icon: MdSearch, label: "ابحث عن محاضرك" },
    { to: "/my-teachers", Icon: MdPeople, label: "محاضرينى" },
    { to: "/view_exams", Icon: MdAssessment, label: "امتحانات المنصة" },
    { to: "/my_courses", Icon: MdMenuBook, label: "كورساتي" },
    { to: "/question_bank", Icon: MdQuestionAnswer, label: "بنك الأسئلة" },
    { to: "/results", Icon: MdAssessment, label: "نتائج الامتحانات" },
    { to: "/competitions", Icon: MdStars, label: "المسابقات" },
    { to: "/the_Firsts", Icon: MdMilitaryTech, label: "أوائل المسابقات" },
    { to: "/save_posts", Icon: MdBookmark, label: "المنشورات المحفوظة" },
    { to: "/wallet", Icon: MdAccountBalanceWallet, label: "محفظة الطالب" },
    { to: "/leagues", Icon: MdLeaderboard, label: "الدوريات" },
  ];

  return (
    <div className="mb-8">
      <ul className="space-y-2">
        {commonLinks.map((link, idx) => (
          <NavLinkItem
            key={idx}
            {...link}
            isSidebarOpen={isSidebarOpen}
            onClick={() => {
              setIsSidebarOpen(true);
              onClose && onClose();
            }}
          />
        ))}

        {isAdmin &&
          adminLinks.map((link, idx) => (
            <NavLinkItem
              key={idx}
              {...link}
              isSidebarOpen={isSidebarOpen}
              onClick={() => {
                setIsSidebarOpen(true);
                onClose && onClose();
              }}
            />
          ))}

        {isTeacher &&
          teacherLinks.map((link, idx) => (
            <NavLinkItem
              key={idx}
              {...link}
              isSidebarOpen={isSidebarOpen}
              onClick={() => {
                setIsSidebarOpen(true);
                onClose && onClose();
              }}
            />
          ))}

        {isStudent &&
          studentLinks.map((link, idx) => (
            <NavLinkItem
              key={idx}
              {...link}
              isSidebarOpen={isSidebarOpen}
              onClick={() => {
                setIsSidebarOpen(true);
                onClose && onClose();
              }}
            />
          ))}

        <li className="my-3">
          <div
            onClick={() => {
              handleLogout();
              onClose && onClose();
            }}
            className="font-semibold flex items-center p-2 rounded-md hover:text-red-500 hover:bg-red-50 cursor-pointer"
          >
            <MdLogout className="w-5 h-5 text-red-500" />
            <span className={`ml-3 ${isSidebarOpen ? "block" : "hidden"}`}>
              تسجيل الخروج
            </span>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default Links;

