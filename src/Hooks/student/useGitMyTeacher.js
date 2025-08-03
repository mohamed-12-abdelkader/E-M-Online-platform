import { useState, useEffect } from "react";
import baseUrl from "../../api/baseUrl";

const  useGitMyTeacher = () => {
  const [teachers, setTeachers] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchTeacherData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await baseUrl.get("api/student/my-teachers", {
        headers: { Authorization:`bearer ${token}`  },
      });
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData(); // جلب البيانات عند تحميل المكون

  }, []);

  return [loading, teachers];
};

export default useGitMyTeacher;
