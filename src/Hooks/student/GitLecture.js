import { useEffect, useState } from "react";
import baseUrl from "../../api/baseUrl";

const GitLecture = ({ id }) => {
  const token = localStorage.getItem("token");
  const [lectures, setLecture] = useState("");
  const [lectureLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await baseUrl.get(`api/user/lecture/${id}`, {
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

export default GitLecture;
