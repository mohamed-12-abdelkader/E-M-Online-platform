import React, { useEffect, useState } from "react";
import { IoPersonCircleSharp } from "react-icons/io5";
import { MdAttachEmail } from "react-icons/md";
import { FaPhone, FaGraduationCap } from "react-icons/fa";
import ScrollToTop from "../../components/scollToTop/ScrollToTop"; // Ensure this path is correct
import baseUrl from "../../api/baseUrl";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("يرجى تسجيل الدخول للوصول إلى الملف الشخصي.");
          setLoading(false);
          return;
        }
        const response = await baseUrl.get("/api/student/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "فشل في جلب البيانات. حاول مرة أخرى."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  // Helper to render grade text from array or id/string
  const getGradeText = (grade) => {
    if (Array.isArray(grade)) {
      if (grade.length === 0) return "غير محدد";
      return grade.map((g) => g?.name).filter(Boolean).join("، ");
    }
    if (typeof grade === "string") return grade || "غير محدد";
    switch (parseInt(grade)) {
      case 1:
        return "الصف الأول الثانوي";
      case 2:
        return "الصف الثاني الثانوي";
      case 3:
        return "الصف الثالث الثانوي";
      default:
        return "غير محدد";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center py-20 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-10 transform transition-all duration-500 hover:scale-[1.01]">
        <div className="relative bg-gradient-to-r from-blue-700 to-blue-500 p-8 text-white text-center">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="avatar"
              className="mx-auto w-28 h-28 rounded-full object-cover mb-4 ring-4 ring-white/40 shadow-xl"
            />
          ) : (
            <IoPersonCircleSharp className="mx-auto text-8xl mb-4 drop-shadow-lg" />)
          }
          <h1 className="font-extrabold text-3xl md:text-4xl leading-tight tracking-wide relative z-10">
            ملفي الشخصي
          </h1>
          <p className="text-blue-100 text-lg mt-2 relative z-10">إدارة معلوماتك الشخصية</p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {loading ? (
            <div className="text-center py-10">
              <p className="text-xl font-semibold text-gray-600">جاري تحميل البيانات...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-xl font-semibold text-red-600">{error}</p>
            </div>
          ) : user ? (
            <>
              <ProfileField
                icon={<IoPersonCircleSharp />}
                label="اسم الطالب:"
                value={user.name || ""}
                isEditing={false}
                type="text"
              />

              <ProfileField
                icon={<MdAttachEmail />}
                label="ايميل الطالب:"
                value={user.email || "غير متوفر"}
                isEditing={false}
                type="text"
              />

              <ProfileField
                icon={<FaPhone />}
                label="رقم الهاتف:"
                value={user.phone || ""}
                isEditing={false}
                type="text"
              />

              <ProfileField
                icon={<FaPhone />}
                label="رقم ولي الأمر:"
                value={user.parent_phone || "غير متوفر"}
                isEditing={false}
                type="text"
              />

              <ProfileField
                icon={<FaGraduationCap />}
                label="الصف الدراسي:"
                value={getGradeText(user?.grades)}
                isEditing={false}
                type="text"
              />

              <ProfileField
                icon={<IoPersonCircleSharp />}
                label="الدور:"
                value={user.role === "student" ? "طالب" : user.role || ""}
                isEditing={false}
                type="text"
              />

              <ProfileField
                icon={<IoPersonCircleSharp />}
                label="تاريخ الانضمام:"
                value={
                  user.created_at
                    ? new Date(user.created_at).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "غير متوفر"
                }
                isEditing={false}
                type="text"
              />
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-2xl font-bold text-gray-600">لا تتوفر بيانات حالياً.</p>
              <p className="text-md text-gray-500 mt-2">يرجى تسجيل الدخول لعرض ملفك الشخصي.</p>
            </div>
          )}
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

// --- Reusable ProfileField Component ---
const ProfileField = ({ icon, label, value, name, isEditing, onChange, type, children, splitNames, fname, lname }) => {
  return (
    <div className="flex items-start p-4 bg-blue-50 rounded-lg shadow-sm group hover:bg-blue-100 transition-colors duration-300">
      <div className="text-3xl text-blue-600 ml-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="flex-grow">
        <h2 className="font-semibold text-gray-700 text-lg mb-1">{label}</h2>
        {isEditing ? (
          type === "select" ? (
            <select
              name={name}
              value={value === "الصف الأول الثانوي" ? "1" : value === "الصف الثاني الثانوي" ? "2" : value === "الصف الثالث الثانوي" ? "3" : ""}
              onChange={onChange}
              className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 font-medium"
            >
              {children}
            </select>
          ) : splitNames ? ( // Special handling for first and last name
            <div className="flex space-x-2 rtl:space-x-reverse">
              <input
                type="text"
                name="fname"
                value={fname}
                onChange={onChange}
                className="w-1/2 p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 font-medium"
                placeholder="الاسم الأول"
              />
              <input
                type="text"
                name="lname"
                value={lname}
                onChange={onChange}
                className="w-1/2 p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 font-medium"
                placeholder="الاسم الأخير"
              />
            </div>
          ) : (
            <input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              className="w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-900 font-medium"
            />
          )
        ) : (
          <p className="font-bold text-gray-900 text-xl">{value}</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
