import React from "react";
import { MdDelete } from "react-icons/md";
import { GoArrowLeft } from "react-icons/go";
import { Link } from "react-router-dom";

const StudentList = ({ students, onDeleteStudentClick }) => (
  <div>
    <div>
      <h1 className="text-xl font-bold">
        عدد طلاب المجموعة :{students && students.length}
      </h1>
    </div>
    {students && students.length > 0 ? (
      students.map((student) => (
        <div
          key={student.id}
          className="w-[100%] h-[80px] border shadow my-5 p-2 flex justify-between items-center"
        >
          <div>
            <h1 className="font-bold">
              اسم الطالب: {student.fname} {student.lname}
            </h1>
          </div>
          <div>
            <MdDelete
              className="text-red-500 text-3xl"
              style={{ cursor: "pointer" }}
              onClick={() => onDeleteStudentClick(student)}
            />
          </div>
        </div>
      ))
    ) : (
      <div className="w-[100%] my-5 m-auto h-[80px] border shadow flex justify-center items-center">
        <h1 className="font-bold flex">
          لا يوجد طلاب في هذه المجموعة
          <GoArrowLeft className="m-1 text-xl" />
          <Link to={`/admin/add_student`}>
            <span className="text-red-500">أضف الطلاب</span>
          </Link>
        </h1>
      </div>
    )}
  </div>
);

export default StudentList;
