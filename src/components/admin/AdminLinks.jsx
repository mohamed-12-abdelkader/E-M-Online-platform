import { useLocation, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import UserType from "../../Hooks/auth/userType";

const AdminLinks = ({ currentLink, setCurrentLink }) => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState("");
  const [userData, isAdmin, isTeacher, student] = UserType();

  const adminLinks = [
    {
      id: Math.random(),
      link: "ادارة المنصة",
      path: "/admin/management",
    },
    {
      id: Math.random(),
      link: "اضافة مدرس جديد",
      path: "/admin/addteacher",
    },
    {
      id: Math.random(),
      link: "انشاء اكواد شحن",
      path: "/admin/create_code",
    },
    {
      id: Math.random(),
      link: "ارصدة المدرسين",
      path: "/admin/cridet",
    },
    {
      id: Math.random(),
      link: " فتح جهاز للطالب",
      path: "/admin/open_phone",
    },
  ];

  const teacherLinks = [
    // Add teacher-specific links here

    {
      id: Math.random(),
      link: "انشاء شهر ",
      path: "/admin/add_month",
    },
    {
      id: Math.random(),
      link: "اضافة  محاضرة للشهر  ",
      path: "/admin/add_lecture_month",
    },
    {
      id: Math.random(),
      link: "اضافة فيديوهات المحاضرات ",
      path: "/admin/add_video",
    },
    {
      id: Math.random(),
      link: "اضافة  pdf ",
      path: "/admin/add_pdf",
    },
    {
      id: Math.random(),
      link: " انشاء مجموعة  ",
      path: "/admin/create_group",
    },
    {
      id: Math.random(),
      link: "اضافة طالب الى المجموعة  ",
      path: "/admin/add_student",
    },
    {
      id: Math.random(),
      link: "   انشاء اكواد   ",
      path: "/admin/create_codee",
    },
    {
      id: Math.random(),
      link: "   عرض  اكواد   ",
      path: "/admin/all_codee",
    },
    {
      id: Math.random(),
      link: "اضافة امتحان ",
      path: "/admin/addexam",
    },
    {
      id: Math.random(),
      link: "اضافة اسئلة للامتحان  ",
      path: "/admin/add_question",
    },
    {
      id: Math.random(),
      link: "  نتائج الامتحانات   ",
      path: "/admin/result",
    },
    // ... (remaining links)
  ];

  useEffect(() => {
    const initialActiveLink =
      adminLinks.find((link) => link.path === location.pathname) ||
      teacherLinks.find((link) => link.path === location.pathname);

    if (initialActiveLink) {
      setActiveLink(initialActiveLink.path);
      setCurrentLink(initialActiveLink.path);
    }
  }, [location.pathname, adminLinks, teacherLinks, setCurrentLink]);

  useEffect(() => {
    setActiveLink(currentLink);
    localStorage.setItem("activeLink", currentLink);
  }, [currentLink]);

  useEffect(() => {
    const storedActiveLink = localStorage.getItem("activeLink");
    if (storedActiveLink) {
      setActiveLink(storedActiveLink);
    }
  }, []);

  const handleClick = (link) => {
    setCurrentLink(link.path);
  };

  const linksToRender = isAdmin ? adminLinks : isTeacher ? teacherLinks : [];

  return (
    <>
      <div className="links-container m-auto">
        {linksToRender.map((link) => (
          <NavLink
            key={link.id}
            to={link.path}
            className="grid justify-center"
            activeClassName="active-link"
          >
            <div
              onClick={() => handleClick(link)}
              className="flex items-center m-auto"
              style={{
                backgroundColor: activeLink === link.path ? "#3b82f6" : "white",
                color: activeLink === link.path ? "white" : "black",
                width: "250px",
              }}
            >
              <h5 className="font-bold p-2">{link.link}</h5>
            </div>
          </NavLink>
        ))}
      </div>
    </>
  );
};

export default AdminLinks;
