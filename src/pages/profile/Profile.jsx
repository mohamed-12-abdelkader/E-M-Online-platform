import React, { useState } from "react";
import { IoPersonCircleSharp } from "react-icons/io5";
import { MdAttachEmail, MdEdit, MdSave, MdCancel } from "react-icons/md";
import { FaPhone, FaGraduationCap } from "react-icons/fa";
import ScrollToTop from "../../components/scollToTop/ScrollToTop"; // Ensure this path is correct

const Profile = () => {
  // Retrieve user data from localStorage and initialize state
  const initialUser = JSON.parse(localStorage.getItem("user")) || {};
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialUser); // State to hold form input values

  // Handle input changes in edit mode
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle saving changes
  const handleSave = () => {
    // --- IMPORTANT: This is where you'd typically send data to your backend ---
    console.log("Saving user data:", formData);
    // For now, we'll just update localStorage and local state
    localStorage.setItem("user", JSON.stringify(formData));
    setUser(formData); // Update the displayed user data
    setIsEditing(false); // Exit edit mode
    // --- You would typically make an API call here, e.g.:
    // axios.put('/api/users/profile', formData)
    //   .then(response => {
    //     localStorage.setItem("user", JSON.stringify(response.data));
    //     setUser(response.data);
    //     setIsEditing(false);
    //     alert('Profile updated successfully!');
    //   })
    //   .catch(error => {
    //     console.error('Error updating profile:', error);
    //     alert('Failed to update profile. Please try again.');
    //   });
  };

  // Handle canceling edits
  const handleCancel = () => {
    setFormData(user); // Revert form data to the original user data
    setIsEditing(false); // Exit edit mode
  };

  // Helper function to render grade text
  const getGradeText = (grade) => {
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
      {/* Container for the profile card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-10 transform transition-all duration-500 hover:scale-[1.01]">
        {/* Profile Header */}
        <div className="relative bg-gradient-to-r from-blue-700 to-blue-500 p-8 text-white text-center">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <IoPersonCircleSharp className="mx-auto text-8xl mb-4 drop-shadow-lg" />
          <h1 className="font-extrabold text-3xl md:text-4xl leading-tight tracking-wide relative z-10">
            ملفي الشخصي
          </h1>
          <p className="text-blue-100 text-lg mt-2 relative z-10">إدارة معلوماتك الشخصية</p>

          {/* Edit Button */}
          {!isEditing && user.mail && ( // Only show edit button if user data exists and not in edit mode
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-4 p-2 bg-white text-blue-600 rounded-full shadow-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-300"
              title="تعديل الملف الشخصي"
            >
              <MdEdit className="text-2xl" />
            </button>
          )}
        </div>

        {/* Profile Details / Edit Form */}
        <div className="p-6 md:p-8 space-y-6">
          {user.mail ? ( // Check if user has data (e.g., by checking if email exists)
            <>
              {/* Student Name */}
              <ProfileField
                icon={<IoPersonCircleSharp />}
                label="اسم الطالب:"
                value={`${formData.fname || ""} ${formData.lname || ""}`}
                name="fname" // Using fname as the primary name field for simplicity in formData
                isEditing={isEditing}
                onChange={handleChange}
                type="text"
                splitNames={true} // Indicate that name needs to be split
                fname={formData.fname}
                lname={formData.lname}
              />

              {/* Email */}
              <ProfileField
                icon={<MdAttachEmail />}
                label="ايميل الطالب:"
                value={formData.mail || ""}
                name="mail"
                isEditing={isEditing}
                onChange={handleChange}
                type="email"
              />

              {/* Phone */}
              <ProfileField
                icon={<FaPhone />}
                label="رقم الهاتف:"
                value={formData.phone || ""}
                name="phone"
                isEditing={isEditing}
                onChange={handleChange}
                type="tel"
              />

              {/* Academic Grade */}
              <ProfileField
                icon={<FaGraduationCap />}
                label="الصف الدراسي:"
                value={getGradeText(formData.grad)}
                name="grad"
                isEditing={isEditing}
                onChange={handleChange}
                type="select" // Use a select input for grade
              >
                <option value="1">الصف الأول الثانوي</option>
                <option value="2">الصف الثاني الثانوي</option>
                <option value="3">الصف الثالث الثانوي</option>
              </ProfileField>

              {/* Save/Cancel Buttons in Edit Mode */}
              {isEditing && (
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition duration-300 font-semibold"
                  >
                    <MdCancel className="ml-2 text-xl" />
                    إلغاء
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 font-semibold"
                  >
                    <MdSave className="ml-2 text-xl" />
                    حفظ التغييرات
                  </button>
                </div>
              )}
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