import React from "react";
import { useParams } from "react-router-dom";
import GitResult from "../../../Hooks/teacher/GitResult";
import { Skeleton, Stack } from "@chakra-ui/react";

const StudentResult = () => {
  const { resId } = useParams();
  const [results, resultsLoading] = GitResult({ id: resId });

  if (resultsLoading) {
    return (
      <Stack className="w-[90%] m-auto">
        <Skeleton height="20px" className="mt-5" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
        <Skeleton height="20px" />
      </Stack>
    );
  }

  console.log(results);

  return (
    <div className="flex justify-center items-center mt-[50px] ">
      {results && results.data ? (
        <div className="w-[100%]">
          <div className="text-center  flex justify-center">
            <div className="ribbon2">
              <h1 className="font-bold m-2 mx-4 text-white">{results.name}</h1>
            </div>
          </div>
          <div>
            {results.data.map((res, index) => (
              <div
                key={index}
                className="w-[90%] m-auto my-5 border shadow p-5"
              >
                <h1 className="font-bold my-2">
                  اسم الطالب : {res.fname} {res.lname}
                </h1>
                <h1 className="font-bold my-2">ايميل الطالب : {res.mail}</h1>
                <h1 className="font-bold my-2">
                  رقم هاتف الطالب : {res.phone}
                </h1>
                <h1 className="font-bold my-2">نتيجة الطالب : {res.result}</h1>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>No results found</div>
      )}
    </div>
  );
};

export default StudentResult;
