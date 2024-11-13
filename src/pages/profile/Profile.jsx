import { IoPersonCircleSharp } from "react-icons/io5";
import { MdAttachEmail } from "react-icons/md";
import { FaPhone } from "react-icons/fa";
import { FaGraduationCap } from "react-icons/fa";
import ScrollToTop from "../../components/scollToTop/ScrollToTop";

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="mt-[150px] flex items-center">
      <div className="w-[90%] m-auto border shadow p-5  my-[50px]  ">
        <div className="flex justify-center my-5">
          <div className="ribbon">
            <h1 className="font-bold m-2 big-font">my profile </h1>
          </div>
        </div>
        <div className="mt-[50px]">
          {user ? (
            <>
              <div className="my-3 flex">
                <div>
                  <h1 className="font-bold m-2 flex">
                    <IoPersonCircleSharp className="m-1 text-blue-500" /> اسم
                    الطالب :
                  </h1>
                  <h1 className="font-bold mx-9">
                    {" "}
                    {user.fname} {user.lname}{" "}
                  </h1>
                </div>
              </div>
              <hr />
              <div className="my-3">
                <h1 className="font-bold m-2 flex">
                  <MdAttachEmail className="m-2 text-blue-500" /> ايميل الطالب :{" "}
                </h1>
                <h1 className="font-bold mx-9"> {user.mail} </h1>
              </div>
              <hr />
              <div className="my-3">
                <h1 className="font-bold m-2 flex">
                  <FaPhone className="m-2 text-blue-500" /> رقم الهاتف :{" "}
                </h1>
                <h1 className="font-bold mx-9"> {user.phone} </h1>
              </div>
              <hr />
              <div className="my-3">
                <h1 className="font-bold m-2 flex">
                  <FaGraduationCap className="m-2 text-blue-500" /> الصف الدراسى
                  :{" "}
                </h1>
                <h1 className="font-bold mx-9">
                  {" "}
                  {user.grad == 1
                    ? "الصف الاول الثانوى "
                    : user.grad == 2
                    ? "الصف الثانى الثانوى "
                    : user.grad == 3
                    ? "الصف الثالث الثانوى "
                    : ""}{" "}
                </h1>
              </div>
            </>
          ) : (
            <h1 className="text-center font-bold">لا يتوفر بيانات حالياً</h1>
          )}
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Profile;
