import React, { useState } from "react";
import { toast } from "react-toastify";
import baseUrl from "../../api/baseUrl";

const useDeleateCommint = ({ postId, fetchData }) => {
  const token = localStorage.getItem("token");
  const [deletecommintLoading, setDeleteLoading] = useState(false);

  const deletecommint = async (id) => {
    try {
      setDeleteLoading(true);
      // تنفيذ طلب الحذف
      const response = await baseUrl.delete(
        `api/posts/status/comments/${postId}/${id}`,
        {
          headers: {
            token: token,
          },
        }
      );

      // إذا كانت الاستجابة ناجحة، يتم تحديث القائمة
      if (response.status === 204) {
        toast.success("تم حذف التعليق بنجاح");
        fetchData();
      } else {
        toast.error("فشل حذف التعليق");
      }
      console.log(response);
    } catch (error) {
      toast.error("فشل حذف التعليق");
      console.log(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return [deletecommintLoading, deletecommint];
};

export default useDeleateCommint;
