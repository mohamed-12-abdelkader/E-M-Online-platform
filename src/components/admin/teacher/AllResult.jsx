import React, { useEffect, useState } from "react";
import GitExam from "../../../Hooks/teacher/GitExam";
import GitClasses from "../../../Hooks/teacher/GitClasses";
import { Select, Skeleton, Stack } from "@chakra-ui/react";
import baseUrl from "../../../api/baseUrl";
import { Link, Outlet } from "react-router-dom";

const AllResult = () => {
  const [classesLoading, classes] = GitClasses();
  const [grad, setGrad] = useState("");
  const [exams, examsLoading] = GitExam({ id: grad });

  console.log(exams);

  return (
    <div>
      <div className="text-center">
        <h1 className="font-bold">نتائج الامتحان</h1>
      </div>
      <Select
        className="my-2"
        placeholder={classesLoading ? "جار تحميل الصفوف..." : " اختر الصف "}
        size="lg"
        onChange={(e) => setGrad(e.target.value)}
        style={{ direction: "ltr" }}
        disabled={classesLoading}
      >
        {classesLoading ? (
          <option disabled>Loading...</option>
        ) : classes.length > 0 ? (
          classes.map((classItem) => (
            <option key={classItem.id} value={classItem.id}>
              {classItem.name}
            </option>
          ))
        ) : (
          <option disabled> لا يوجد صفوف دراسية متاحة </option>
        )}
      </Select>

      <div>
        {examsLoading ? (
          <Stack className="w-[90%] m-auto">
            <Skeleton height="20px" className="mt-5" />
            <Skeleton height="20px" />
            <Skeleton height="20px" />
            <Skeleton height="20px" />
            <Skeleton height="20px" />
          </Stack>
        ) : (
          <>
            {exams.length > 0 ? (
              <div className="flex flex-wrap">
                {exams.map((exam) => (
                  <Link key={exam.id} to={`all_result/${exam.id}`}>
                    <div className="  border shadow flex justify-center items-center m-2">
                      <h1 className="font-bold m-2">{exam.name}</h1>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div>لا يوجد امتحانات فى هذا الصف</div>
            )}
          </>
        )}
      </div>
      <Outlet />
    </div>
  );
};

export default AllResult;
