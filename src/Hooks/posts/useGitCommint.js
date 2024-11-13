import { useEffect, useState, useCallback } from "react";
import baseUrl from "../../api/baseUrl";

const useGitCommint = (postId) => {
  const token = localStorage.getItem("token");
  const [commints, setCommints] = useState([]);
  const [commintsLoading, setLoading] = useState(false);

  // دالة لجلب التعليقات
  const fetchData = useCallback(async () => {
    if (!postId) return; // التأكد من وجود postId
    try {
      setLoading(true);
      const response = await baseUrl.get(
        `api/posts/status/comments/${postId}`,
        {
          headers: { token: token },
        }
      );
      setCommints(response.data);
    } catch (error) {
      console.log("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  }, [postId, token]);

  // استدعاء التعليقات عند التحميل الأولي
  useEffect(() => {
    fetchData();
  }, [fetchData]); // تمرير fetchData لضمان استدعائها عند التحميل الأولي

  return [commints, commintsLoading, fetchData]; // إرجاع fetchData لإعادة التحميل عند الحاجة
};

export default useGitCommint;
