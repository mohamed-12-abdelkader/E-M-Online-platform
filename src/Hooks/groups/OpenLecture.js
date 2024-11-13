import { useState } from "react";
import { toast } from "react-toastify";
import baseUrl from "../../api/baseUrl";

const OpenLectureToGroup = ({ id }) => {
  const token = localStorage.getItem("token");
  const [loadingOpen, setLoading] = useState(false);
  const [g_id, setGrad] = useState("");
  const [m_id, setm_id] = useState("");
  const handleOpenLecture = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await baseUrl.post(
        `api/groups/openmonth/group`,
        { g_id: id, m_id },
        {
          headers: {
            token: token,
            // Add any additional headers if needed
          },
        }
      );
      localStorage.setItem("code", JSON.stringify(response.data));
      toast.success("تم   فتح الكورس   بنجاح");
    } catch (error) {
      console.error("Error logging in:", error);
      if (
        error.response.data.msg ==
        'duplicate key value violates unique constraint "groupsmonths_pkey"'
      ) {
        toast.error("هذة المحاضرة مفتوحة لهذة المجموعة من قبل");
      }
    } finally {
      setLoading(false);
    }
  };
  return [handleOpenLecture, m_id, setm_id, g_id, setGrad, loadingOpen];
};

export default OpenLectureToGroup;
