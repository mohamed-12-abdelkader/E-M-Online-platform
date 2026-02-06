import React from "react";
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
  MdSchedule,
  MdBook,
} from "react-icons/md";
import { FaFistRaised } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import {
  VStack,
  HStack,
  Text,
  Icon,
  Box,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import UserType from "../../Hooks/auth/userType";

const NavLinkItem = ({ to, Icon: LinkIcon, label, onClick, isSidebarOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const activeBg = useColorModeValue("blue.50", "rgba(66, 153, 225, 0.15)");
  const activeColor = useColorModeValue("blue.600", "blue.300");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Tooltip label={isSidebarOpen ? "" : label} placement="right" hasArrow>
      <Link to={to} onClick={onClick} style={{ width: "100%" }}>
        <HStack
          spacing={3}
          p={2.5}
          borderRadius="xl"
          bg={isActive ? activeBg : "transparent"}
          color={isActive ? activeColor : textColor}
          _hover={{
            bg: isActive ? activeBg : hoverBg,
            color: isActive ? activeColor : "blue.500",
            transform: "translateX(4px)",
          }}
          transition="all 0.2s"
          w="full"
          justify={isSidebarOpen ? "flex-start" : "center"}
          cursor="pointer"
        >
          <Icon as={LinkIcon} boxSize={5} />
          {isSidebarOpen && (
            <Text
              fontSize="md"
              fontWeight={isActive ? "bold" : "medium"}
              noOfLines={1}
            >
              {label}
            </Text>
          )}
        </HStack>
      </Link>
    </Tooltip>
  );
};

const Links = ({ isSidebarOpen, setIsSidebarOpen, onClose }) => {
  const [userData, isAdmin, isTeacher, isStudent] = UserType();

  const handleLogout = () => {
    ["token", "user", "examAnswers", "examTimeLeft"].forEach((item) =>
      localStorage.removeItem(item)
    );
    window.location.href = "/login";
  };

  const commonLinks = [{ to: "/home", Icon: MdHome, label: "الصفحة الرئيسية" }];

  const adminLinks = [
    { to: "/streams", Icon: MdLiveTv, label: "البث المباشر" },
    { to: "/admin/management", Icon: MdDashboard, label: "لوحة التحكم" },
    { to: "/teamChat", Icon: MdForum, label: "دردشة الفريق" },
    { to: "/all_students", Icon: MdPeople, label: " كل الطلاب" },
    { to: "/social", Icon: MdPublic, label: "EM Social" },
    { to: "/packages-management", Icon: MdInventory, label: "إدارة الباقات" },
    { to: "/tasks", Icon: MdAssignment, label: "المهام" },
    {
      to: "/question-bank-dashboard",
      Icon: MdLibraryBooks,
      label: "لوحة تحكم بنك الأسئلة",
    },
    { to: "/create_comp", Icon: MdEmojiEvents, label: "إنشاء مسابقة" },
    { to: "/allComps", Icon: MdLeaderboard, label: "عرض المسابقات" },
    { to: "/create_exam", Icon: MdDateRange, label: "إنشاء امتحان شهري" },
    { to: "/add_sub_exam", Icon: MdQuiz, label: "إنشاء امتحان المادة" },
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
    { to: "/show_grades", Icon: MdGrading, label: "عرض درجات الامتحان" },
    { to: "/leagues", Icon: MdLeaderboard, label: "إدارة الدوريات" },
    { to: "/general-courses", Icon: MdBook, label: "إدارة الكورسات العامة" },
  ];

  const teacherLinks = [
    { to: "/suggested-teachers", Icon: MdGroups, label: "المدرسين المقترحة " },
    {
      to: "/QuestionLibraryPage",
      Icon: MdLibraryBooks,
      label: "مكتبة الأسئلة",
    },
    {
      to: "/Teacher_subjects",
      Icon: MdQuestionAnswer,
      label: " بنك الاسئله  ",
    },
    { to: "/center_groups", Icon: MdGroups, label: "سيستم إدارة السنتر" },
    { to: "/TeacherChat", Icon: MdForum, label: " الرسائل " },
    { to: "/teacher-students", Icon: MdPeople, label: "طلابي" },
    { to: "/social", Icon: MdPublic, label: "EM Social" },
  ];

  const studentLinks = [
    { to: "/profile", Icon: MdPerson, label: "الملف الشخصي" },
    { to: "/challenge_EM_Academy", Icon: FaFistRaised, label: "تحدي Next" },
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
    <VStack spacing={1} align="stretch" w="full" pb={4}>
      {commonLinks.map((link, idx) => (
        <NavLinkItem
          key={`common-${idx}`}
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
            key={`admin-${idx}`}
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
            key={`teacher-${idx}`}
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
            key={`student-${idx}`}
            {...link}
            isSidebarOpen={isSidebarOpen}
            onClick={() => {
              setIsSidebarOpen(true);
              onClose && onClose();
            }}
          />
        ))}

      <Box
        pt={4}
        mt={2}
        borderTop="1px solid"
        borderColor={useColorModeValue("gray.100", "gray.700")}
      >
        <Tooltip
          label={isSidebarOpen ? "" : "تسجيل الخروج"}
          placement="right"
          hasArrow
        >
          <HStack
            as="button"
            onClick={() => {
              handleLogout();
              onClose && onClose();
            }}
            spacing={3}
            p={2.5}
            borderRadius="xl"
            color="red.500"
            _hover={{
              bg: "red.50",
              _dark: { bg: "rgba(254, 178, 178, 0.1)" },
              transform: "translateX(4px)",
            }}
            transition="all 0.2s"
            w="full"
            justify={isSidebarOpen ? "flex-start" : "center"}
          >
            <Icon as={MdLogout} boxSize={5} />
            {isSidebarOpen && (
              <Text fontSize="md" fontWeight="bold">
                تسجيل الخروج
              </Text>
            )}
          </HStack>
        </Tooltip>
      </Box>
    </VStack>
  );
};

export default Links;
