import { useState, useEffect } from "react";
import baseUrl from "../../api/baseUrl";

const  useGitMyTeacher = () => {
  const [teachers, setTeachers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const fetchTeacherData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await baseUrl.get("api/student/my-teachers", {
        headers: { Authorization:`bearer ${token}`  },
      });
      setTeachers(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      const apiMessage = error?.response?.data?.message;
      if (apiMessage) {
        setError(apiMessage);
      } else {
        setError("UNKNOWN_ERROR");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData(); // جلب البيانات عند تحميل المكون

  }, []);

  return [loading, teachers, error];
};

export default useGitMyTeacher;
