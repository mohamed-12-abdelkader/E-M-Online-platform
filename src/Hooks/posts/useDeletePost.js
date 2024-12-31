import React, { useState } from "react";
import { toast } from "react-toastify";
import baseUrl from "../../api/baseUrl";
import { usePosts } from "./PostsContext";

const useDeletePost = () => {
  const token = localStorage.getItem("token");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { refetchPosts } = usePosts(); // جلب دالة fetchPosts من context

  const deletePost = async (id) => {
    try {
      setDeleteLoading(true);
      // تنفيذ طلب الحذف
      const response = await baseUrl.delete(`api/posts/${id}`, {
        headers: {
          token: token,
        },
      });

      // إذا كانت الاستجابة ناجحة، يتم تحديث القائمة
      if (response.status === 204) {
        toast.success("تم حذف المنشور بنجاح");
        refetchPosts(); // استدعاء دالة تحديث البيانات بعد الحذف
      } else {
        toast.error("فشل حذف المنشور");
      }
      console.log(response);
    } catch (error) {
      toast.error("فشل حذف المنشور");
      console.log(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return [deleteLoading, deletePost];
};

export default useDeletePost;
