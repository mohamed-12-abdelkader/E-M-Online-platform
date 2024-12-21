import React, { useState } from "react";
import baseUrl from "../../../api/baseUrl";
import { toast } from "react-toastify";

const useSendQuestions = ({ id }) => {
  const token = localStorage.getItem("token");

  const [sendExamloading, setsendExamloading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const sendExam = async () => {
    try {
      setsendExamloading(true);
      const response = await baseUrl.post(
        `api/exams/submit`,
        { exam_id: id, answers: selectedOptions },
        {
          headers: {
            token: token,
          },
        }
      );

      if (response.status === 200) {
        toast.success("تم الارسال   بنجاح");
      } else {
        toast.error("فشل العملية");
      }

      console.log(response);
    } catch (error) {
      console.error(error);
    } finally {
      setsendExamloading(false);
    }
  };

  return [sendExam, sendExamloading, setSelectedOptions, selectedOptions];
};

export default useSendQuestions;
