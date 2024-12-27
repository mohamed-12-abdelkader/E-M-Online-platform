import React, { useState } from "react";
import { toast } from "react-toastify";
import baseUrl from "../../../api/baseUrl";

const usePuyExam = () => {
  const token = localStorage.getItem("token");

  const [buyExamloading, setactivComp] = useState(false);

  const buyExam = async (id, status) => {
    try {
      setactivComp(true);
      const response = await baseUrl.post(
        `api/exams/collections/buy`,
        { collection_id: id },
        {
          headers: {
            token: token,
          },
        }
      );

      if (response.status === 200) {
        toast.success("تم التفعيل  بنجاح");
      } else {
        toast.error("فشل العملية");
      }

      console.log(response);
    } catch (error) {
      console.error(error);
      toast.error("رصيدك غير كافى ");
    } finally {
      setactivComp(false);
    }
  };

  return [buyExam, buyExamloading];
};

export default usePuyExam;
