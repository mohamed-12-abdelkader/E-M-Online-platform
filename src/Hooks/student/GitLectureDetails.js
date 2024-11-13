import { useEffect, useState } from "react";
import baseUrl from "../../api/baseUrl";
import { toast } from "react-toastify";

const GitLectureDetails = ({ id }) => {
  const token = localStorage.getItem("token");
  const [lectures, setLecture] = useState("");
  const [lectureLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await baseUrl.get(`api/lecture/lectureonline/${id}`, {
          headers: { token: token },
        });
        setLecture(response.data);
      } catch (error) {
        console.log("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return [lectureLoading, lectures];
};

export default GitLectureDetails;
