import React, { useState } from "react";
import { toast } from "react-toastify";
import baseUrl from "../../../api/baseUrl";

const useFinshExam = ({ id }) => {
  const token = localStorage.getItem("token");

  const [finshExamloading, setsendExamloading] = useState(false);
  const [response, setResponse] = useState(null); // State to hold the response

  const finshExam = async () => {
    try {
      setsendExamloading(true);
      const response = await baseUrl.post(
        `api/exams/complete`,
        { exam_id: id },
        {
          headers: {
            token: token,
          },
        }
      );

      if (response.status === 200) {
        toast.success("تم انهاء الامتحان بنجاح");
        console.log(response);
      } else {
        toast.error("فشل العملية");
      }

      setResponse(response); // Store the response in state
    } catch (error) {
      console.error(error);
    } finally {
      setsendExamloading(false);
    }
  };

  return [finshExam, finshExamloading, response]; // Return the response state as well
};

export default useFinshExam;
