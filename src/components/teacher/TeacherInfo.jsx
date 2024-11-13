import React from "react";
import { Zoom } from "react-awesome-reveal";
import { BiBook } from "react-icons/bi";

const TeacherInfo = ({ teacher, number }) => (
  <div className="teacherinfo bg-[#03a9f5] max-w-7xl mx-auto px-4 mt-[80px] mb-[80px]   py-8 md:flex md:justify-between items-center bg-gray-100 rounded-lg shadow-lg">
    {/* الجزء الأول: صورة المدرس */}
    <div className="  w-[95%]  md:w-1/2 flex justify-center items-center  mb-6 md:mb-0">
      <Zoom>
        <img
          src={teacher.image}
          alt={`${teacher.name}`}
          className="rounded-lg shadow-lg my-auto h-[350px] mx-4 w-[400px] object-cover"
        />
      </Zoom>
    </div>
    {/* الجزء الثاني: معلومات المدرس */}
    <div className="md:w-1/2 md:ml-8 flex flex-col justify-center items-center">
      <Zoom>
        <div className="text-center md:text-right w-full flex flex-col justify-center items-center">
          <div className="flex flex-col justify-center items-center space-y-4 w-full">
            {/* بطاقة المعلومات الخاصة بالمدرس */}
            <div className="cart flex items-center bg-white shadow-md rounded-lg p-4 w-[350px] md:w-[300px]">
              <img
                src={teacher.image}
                alt="teacher"
                className="h-10 w-10 mx-2 rounded-full object-cover border border-gray-300"
              />
              <h1 className="ml-4 text-xl font-bold text-gray-700">
                {teacher.name}
              </h1>
            </div>
            {/* بطاقة المادة */}
            <div className="flex items-center bg-white shadow-md rounded-lg p-4 w-full">
              <BiBook className="text-blue-500 text-3xl mr-4" />
              <h1 className="text-xl font-bold text-gray-700">
                المادة: {teacher.subject}
              </h1>
            </div>
            {/* عدد الكورسات */}
            <div className="flex items-center bg-white shadow-md rounded-lg p-4 w-full">
              <BiBook className="text-blue-500 text-3xl mr-4" />
              <h1 className="text-xl font-bold text-gray-700">
                عدد الكورسات : {number}
              </h1>
            </div>
            {/* الوصف */}
            <div className="flex justify-center items-center w-full">
              <h1 className="text-xl font-semibold mb-4 text- text-center md:text-right">
                {teacher.description}
              </h1>
            </div>
          </div>
        </div>
      </Zoom>
    </div>
  </div>
);

export default TeacherInfo;
